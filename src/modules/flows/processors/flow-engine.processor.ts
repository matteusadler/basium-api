import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job, Queue } from 'bullmq'
import { InjectQueue } from '@nestjs/bullmq'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { NodeType } from '../dto/create-flow.dto'

interface ProcessNodeJob {
  executionId: string
  nodeId: string
}

@Processor('flow-engine', { connection: { host: 'localhost', port: 6379 } })
export class FlowEngineProcessor extends WorkerHost {
  private readonly logger = new Logger(FlowEngineProcessor.name)

  constructor(
    private prisma: PrismaService,
    @InjectQueue('flow-engine') private flowEngineQueue: Queue,
    @InjectQueue('flow-message') private flowMessageQueue: Queue,
    @InjectQueue('flow-wait') private flowWaitQueue: Queue,
  ) {
    super()
  }

  async process(job: Job<ProcessNodeJob>): Promise<any> {
    const { executionId, nodeId } = job.data
    const startTime = Date.now()

    this.logger.log(`Processing node ${nodeId} for execution ${executionId}`)

    try {
      // Get execution with flow
      const execution = await this.prisma.flowExecution.findUnique({
        where: { id: executionId },
        include: {
          flow: true,
          lead: true,
        },
      })

      if (!execution || execution.status === 'CANCELLED') {
        this.logger.warn(`Execution ${executionId} not found or cancelled`)
        return { status: 'skipped', reason: 'execution_not_found_or_cancelled' }
      }

      // Get node from flow
      const nodes = execution.flow.nodes as any[]
      const edges = execution.flow.edges as any[]
      const node = nodes.find(n => n.id === nodeId)

      if (!node) {
        this.logger.error(`Node ${nodeId} not found in flow`)
        return { status: 'error', reason: 'node_not_found' }
      }

      // Create step record
      const step = await this.prisma.flowStep.create({
        data: {
          executionId,
          nodeId,
          nodeType: node.type,
          status: 'RUNNING',
          input: { nodeData: node.data, variables: execution.variables },
        },
      })

      // Process node based on type
      let result: any
      let nextNodeId: string | null = null

      try {
        switch (node.type) {
          case NodeType.TRIGGER:
            result = await this.processTrigger(node, execution)
            nextNodeId = this.getNextNode(nodeId, edges)
            break

          case NodeType.MESSAGE:
            result = await this.processMessage(node, execution)
            nextNodeId = this.getNextNode(nodeId, edges)
            break

          case NodeType.CONDITION:
            result = await this.processCondition(node, execution)
            nextNodeId = this.getConditionalNextNode(nodeId, edges, result.branch)
            break

          case NodeType.WAIT:
            result = await this.processWait(node, execution, step.id)
            // WAIT node doesn't have immediate next - handled by wait processor
            break

          case NodeType.ACTION:
            result = await this.processAction(node, execution)
            nextNodeId = this.getNextNode(nodeId, edges)
            break

          case NodeType.AI:
            result = await this.processAI(node, execution)
            nextNodeId = this.getNextNode(nodeId, edges)
            break

          case NodeType.SPLIT_AB:
            result = await this.processSplitAB(node, execution)
            nextNodeId = this.getABNextNode(nodeId, edges, result.variant)
            break

          case NodeType.JUMP:
            result = await this.processJump(node, execution)
            nextNodeId = node.data.targetNodeId || null
            break

          default:
            this.logger.warn(`Unknown node type: ${node.type}`)
            result = { status: 'skipped', reason: 'unknown_type' }
            nextNodeId = this.getNextNode(nodeId, edges)
        }

        // Update step as completed
        const duration = Date.now() - startTime
        await this.prisma.flowStep.update({
          where: { id: step.id },
          data: {
            status: 'COMPLETED',
            output: result,
            duration,
          },
        })

        // Process next node if exists
        if (nextNodeId && execution.status !== 'WAITING') {
          await this.prisma.flowExecution.update({
            where: { id: executionId },
            data: { currentNodeId: nextNodeId },
          })

          await this.flowEngineQueue.add('process-node', {
            executionId,
            nodeId: nextNodeId,
          }, { delay: (node.data.delay || 0) * 1000 })
        } else if (!nextNodeId && node.type !== NodeType.WAIT) {
          // Flow completed
          await this.prisma.flowExecution.update({
            where: { id: executionId },
            data: {
              status: 'COMPLETED',
              completedAt: new Date(),
            },
          })
          this.logger.log(`Flow execution completed: ${executionId}`)
        }

        return result

      } catch (error: any) {
        // Update step as failed
        await this.prisma.flowStep.update({
          where: { id: step.id },
          data: {
            status: 'FAILED',
            error: error.message,
            duration: Date.now() - startTime,
          },
        })
        throw error
      }

    } catch (error: any) {
      this.logger.error(`Error processing node ${nodeId}: ${error.message}`)

      // Mark execution as failed
      await this.prisma.flowExecution.update({
        where: { id: executionId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
        },
      })

      throw error
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // Node Processors
  // ════════════════════════════════════════════════════════════════════════

  private async processTrigger(node: any, execution: any) {
    // Trigger node just starts the flow, no actual processing needed
    return {
      type: 'trigger',
      triggerType: node.data.triggerType,
      status: 'activated',
    }
  }

  private async processMessage(node: any, execution: any) {
    const { messageType, content, mediaUrl } = node.data

    // Replace variables in content
    const processedContent = this.replaceVariables(content, execution)

    // Enqueue message for sending
    await this.flowMessageQueue.add('send-message', {
      executionId: execution.id,
      phone: execution.contactPhone,
      type: messageType || 'TEXT',
      content: processedContent,
      mediaUrl,
      companyId: execution.companyId,
    })

    return {
      type: 'message',
      messageType,
      content: processedContent,
      status: 'queued',
    }
  }

  private async processCondition(node: any, execution: any) {
    const { field, operator, value } = node.data
    const variables = execution.variables as any || {}

    // Get the value to compare
    let fieldValue = this.getFieldValue(field, execution, variables)

    // Perform comparison
    let result = false
    const compareValue = this.replaceVariables(value, execution)

    switch (operator) {
      case 'EQUALS':
        result = String(fieldValue).toLowerCase() === String(compareValue).toLowerCase()
        break
      case 'NOT_EQUALS':
        result = String(fieldValue).toLowerCase() !== String(compareValue).toLowerCase()
        break
      case 'CONTAINS':
        result = String(fieldValue).toLowerCase().includes(String(compareValue).toLowerCase())
        break
      case 'NOT_CONTAINS':
        result = !String(fieldValue).toLowerCase().includes(String(compareValue).toLowerCase())
        break
      case 'CONTAINS_ANY':
        const anyValues = String(compareValue).split(',').map(v => v.trim().toLowerCase())
        result = anyValues.some(v => String(fieldValue).toLowerCase().includes(v))
        break
      case 'GREATER_THAN':
        result = Number(fieldValue) > Number(compareValue)
        break
      case 'LESS_THAN':
        result = Number(fieldValue) < Number(compareValue)
        break
      case 'IS_EMPTY':
        result = !fieldValue || String(fieldValue).trim() === ''
        break
      case 'IS_NOT_EMPTY':
        result = fieldValue && String(fieldValue).trim() !== ''
        break
      default:
        this.logger.warn(`Unknown operator: ${operator}`)
    }

    return {
      type: 'condition',
      field,
      operator,
      value: compareValue,
      fieldValue,
      result,
      branch: result ? 'yes' : 'no',
    }
  }

  private async processWait(node: any, execution: any, stepId: string) {
    const { waitType, delaySeconds, timeout, timeoutAction } = node.data

    if (waitType === 'DELAY') {
      // Schedule resume after delay
      await this.flowWaitQueue.add('resume-delay', {
        executionId: execution.id,
        stepId,
        nodeId: node.id,
      }, { delay: (delaySeconds || 60) * 1000 })

      return {
        type: 'wait',
        waitType: 'DELAY',
        delaySeconds,
        status: 'waiting',
      }
    }

    if (waitType === 'UNTIL_REPLY') {
      // Set execution to waiting state
      await this.prisma.flowExecution.update({
        where: { id: execution.id },
        data: { status: 'WAITING' },
      })

      // Schedule timeout if specified
      if (timeout) {
        await this.flowWaitQueue.add('check-timeout', {
          executionId: execution.id,
          stepId,
          nodeId: node.id,
          timeoutAction: timeoutAction || 'END',
        }, { delay: timeout * 1000 })
      }

      return {
        type: 'wait',
        waitType: 'UNTIL_REPLY',
        timeout,
        status: 'waiting_for_reply',
      }
    }

    return { type: 'wait', status: 'unknown_wait_type' }
  }

  private async processAction(node: any, execution: any) {
    const { actionType, field, value, taskType, title, priority, dueDays, stageName, tag } = node.data
    const processedValue = this.replaceVariables(value, execution)
    const processedTitle = this.replaceVariables(title, execution)

    switch (actionType) {
      case 'UPDATE_LEAD':
        await this.prisma.lead.update({
          where: { id: execution.leadId },
          data: { [field]: processedValue },
        })
        return { type: 'action', actionType, field, value: processedValue, status: 'updated' }

      case 'ADD_TAG':
        const lead = await this.prisma.lead.findUnique({ where: { id: execution.leadId } })
        const tags = [...(lead?.tags || []), tag]
        await this.prisma.lead.update({
          where: { id: execution.leadId },
          data: { tags },
        })
        return { type: 'action', actionType, tag, status: 'tag_added' }

      case 'REMOVE_TAG':
        const leadForRemove = await this.prisma.lead.findUnique({ where: { id: execution.leadId } })
        const filteredTags = (leadForRemove?.tags || []).filter(t => t !== tag)
        await this.prisma.lead.update({
          where: { id: execution.leadId },
          data: { tags: filteredTags },
        })
        return { type: 'action', actionType, tag, status: 'tag_removed' }

      case 'CREATE_TASK':
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + (dueDays || 1))
        
        await this.prisma.task.create({
          data: {
            companyId: execution.companyId,
            leadId: execution.leadId,
            userId: execution.lead?.userId || '',
            title: processedTitle,
            type: taskType || 'OTHER',
            priority: priority || 'MEDIUM',
            status: 'PENDING',
            dueDate,
          },
        })
        return { type: 'action', actionType, title: processedTitle, status: 'task_created' }

      case 'MOVE_STAGE':
        const stage = await this.prisma.stage.findFirst({
          where: { name: stageName, pipeline: { companyId: execution.companyId } },
        })
        if (stage) {
          await this.prisma.lead.update({
            where: { id: execution.leadId },
            data: { stageId: stage.id },
          })
          // Add history
          await this.prisma.leadHistory.create({
            data: {
              leadId: execution.leadId,
              userId: 'system',
              event: 'STAGE_CHANGED',
              metadata: { fromFlow: execution.flowId, stageName },
            },
          })
        }
        return { type: 'action', actionType, stageName, status: stage ? 'stage_changed' : 'stage_not_found' }

      default:
        return { type: 'action', actionType, status: 'unknown_action' }
    }
  }

  private async processAI(node: any, execution: any) {
    const { aiAction, prompt, updateTemperature, transferAfter } = node.data

    // Get user's AI config
    const user = await this.prisma.user.findUnique({
      where: { id: execution.lead?.userId || '' },
    })

    if (!user?.openaiKey) {
      return { type: 'ai', status: 'no_api_key', message: 'Chave OpenAI não configurada' }
    }

    // For now, return placeholder - actual AI integration would go here
    // This would call OpenAI API with the prompt and execution context
    return {
      type: 'ai',
      aiAction,
      prompt: this.replaceVariables(prompt, execution),
      status: 'processed',
      updateTemperature,
      transferAfter,
    }
  }

  private async processSplitAB(node: any, execution: any) {
    const { variants, splitName } = node.data

    if (!variants || variants.length === 0) {
      return { type: 'split_ab', status: 'no_variants' }
    }

    // Calculate which variant to use based on random selection
    const random = Math.random() * 100
    let cumulative = 0
    let selectedVariant = variants[0]

    for (const variant of variants) {
      cumulative += variant.percentage || 50
      if (random <= cumulative) {
        selectedVariant = variant
        break
      }
    }

    return {
      type: 'split_ab',
      splitName,
      variant: selectedVariant.id,
      variantLabel: selectedVariant.label,
      status: 'variant_selected',
    }
  }

  private async processJump(node: any, execution: any) {
    const { targetNodeId, targetFlowId } = node.data

    if (targetFlowId && targetFlowId !== execution.flowId) {
      // Jump to another flow - would need to start new execution
      return {
        type: 'jump',
        targetFlowId,
        status: 'cross_flow_jump_not_implemented',
      }
    }

    return {
      type: 'jump',
      targetNodeId,
      status: 'jumping',
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // Helpers
  // ════════════════════════════════════════════════════════════════════════

  private getNextNode(nodeId: string, edges: any[]): string | null {
    const edge = edges.find(e => e.source === nodeId && (!e.sourceHandle || e.sourceHandle === 'default'))
    return edge?.target || null
  }

  private getConditionalNextNode(nodeId: string, edges: any[], branch: string): string | null {
    const edge = edges.find(e => e.source === nodeId && e.sourceHandle === branch)
    return edge?.target || null
  }

  private getABNextNode(nodeId: string, edges: any[], variant: string): string | null {
    const edge = edges.find(e => e.source === nodeId && e.sourceHandle === variant)
    return edge?.target || null
  }

  private replaceVariables(text: string, execution: any): string {
    if (!text) return text

    const variables = execution.variables as any || {}
    const lead = execution.lead || {}

    // Replace lead variables
    let result = text
      .replace(/{{lead\.name}}/g, lead.name || '')
      .replace(/{{lead\.phone}}/g, lead.phone || '')
      .replace(/{{lead\.email}}/g, lead.email || '')
      .replace(/{{lastReply}}/g, variables.lastReply || '')
      .replace(/{{triggerMessage}}/g, variables.triggerMessage || '')

    // Replace custom variables
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
    }

    return result
  }

  private getFieldValue(field: string, execution: any, variables: any): any {
    if (field.startsWith('lead.')) {
      const leadField = field.replace('lead.', '')
      return execution.lead?.[leadField]
    }
    return variables[field]
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`Job ${job.id} completed`)
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`)
  }
}
