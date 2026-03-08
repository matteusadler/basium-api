import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { PrismaService } from '../../common/prisma/prisma.service'
import { CreateFlowDto, NodeType, TriggerType } from './dto/create-flow.dto'
import { UpdateFlowDto } from './dto/update-flow.dto'
import { StartExecutionDto } from './dto/start-execution.dto'

@Injectable()
export class FlowsService {
  private readonly logger = new Logger(FlowsService.name)

  constructor(
    private prisma: PrismaService,
    @InjectQueue('flow-engine') private flowEngineQueue: Queue,
    @InjectQueue('flow-message') private flowMessageQueue: Queue,
    @InjectQueue('flow-wait') private flowWaitQueue: Queue,
  ) {}

  // ════════════════════════════════════════════════════════════════════════
  // CRUD Operations
  // ════════════════════════════════════════════════════════════════════════

  async findAll(companyId: string) {
    return this.prisma.flow.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { executions: true }
        }
      }
    })
  }

  async findOne(id: string, companyId: string) {
    const flow = await this.prisma.flow.findFirst({
      where: { id, companyId },
      include: {
        executions: {
          orderBy: { startedAt: 'desc' },
          take: 10,
          select: {
            id: true,
            status: true,
            startedAt: true,
            completedAt: true,
            lead: {
              select: { id: true, name: true, phone: true }
            }
          }
        }
      }
    })

    if (!flow) {
      throw new NotFoundException('Fluxo não encontrado')
    }

    return flow
  }

  async create(companyId: string, userId: string, dto: CreateFlowDto) {
    // Extract trigger types and keywords from nodes
    const triggerNodes = dto.nodes.filter(
      n => n.type === NodeType.TRIGGER || n.type === (NodeType as any).TRIGGER_LEAD_STAGE || (n as any).type === 'trigger_lead_stage',
    )
    const triggerTypes = triggerNodes
      .map(n => n.data?.triggerType || ((n as any).type === 'trigger_lead_stage' ? 'LEAD_STAGE_CHANGED' : null))
      .filter(Boolean)
    const keywords = triggerNodes
      .filter(n => n.data?.triggerType === TriggerType.KEYWORD)
      .flatMap(n => n.data?.keywords || [])

    const flow = await this.prisma.flow.create({
      data: {
        companyId,
        createdBy: userId,
        name: dto.name,
        description: dto.description,
        nodes: dto.nodes as any,
        edges: dto.edges as any,
        triggerTypes,
        keywords,
        status: 'DRAFT',
      },
    })

    this.logger.log(`Flow created: ${flow.id} - ${flow.name}`)
    return flow
  }

  async update(id: string, companyId: string, dto: UpdateFlowDto) {
    const flow = await this.prisma.flow.findFirst({
      where: { id, companyId }
    })

    if (!flow) {
      throw new NotFoundException('Fluxo não encontrado')
    }

    // Extract trigger types and keywords if nodes are being updated
    let updateData: any = { ...dto }
    
    if (dto.nodes) {
      const triggerNodes = dto.nodes.filter(n => n.type === NodeType.TRIGGER)
      updateData.triggerTypes = triggerNodes.map(n => n.data.triggerType).filter(Boolean)
      updateData.keywords = triggerNodes
        .filter(n => n.data.triggerType === TriggerType.KEYWORD)
        .flatMap(n => n.data.keywords || [])
    }

    return this.prisma.flow.update({
      where: { id },
      data: {
        ...updateData,
        version: { increment: 1 }
      },
    })
  }

  async delete(id: string, companyId: string) {
    const flow = await this.prisma.flow.findFirst({
      where: { id, companyId }
    })

    if (!flow) {
      throw new NotFoundException('Fluxo não encontrado')
    }

    // Cancel all running executions first
    await this.prisma.flowExecution.updateMany({
      where: { flowId: id, status: 'RUNNING' },
      data: { status: 'CANCELLED' }
    })

    return this.prisma.flow.delete({ where: { id } })
  }

  // ════════════════════════════════════════════════════════════════════════
  // Flow Status Management
  // ════════════════════════════════════════════════════════════════════════

  async publish(id: string, companyId: string) {
    const flow = await this.prisma.flow.findFirst({
      where: { id, companyId }
    })

    if (!flow) {
      throw new NotFoundException('Fluxo não encontrado')
    }

    // Validate flow before publishing
    this.validateFlow(flow.nodes as any[], flow.edges as any[])

    const updated = await this.prisma.flow.update({
      where: { id },
      data: { status: 'ACTIVE' },
    })

    // Update company usage
    await this.prisma.companyUsage.update({
      where: { companyId },
      data: { activeFlows: { increment: 1 } }
    }).catch(() => {}) // Ignore if usage record doesn't exist

    this.logger.log(`Flow published: ${id}`)
    return updated
  }

  async pause(id: string, companyId: string) {
    const flow = await this.prisma.flow.findFirst({
      where: { id, companyId, status: 'ACTIVE' }
    })

    if (!flow) {
      throw new NotFoundException('Fluxo ativo não encontrado')
    }

    return this.prisma.flow.update({
      where: { id },
      data: { status: 'PAUSED' },
    })
  }

  async resume(id: string, companyId: string) {
    const flow = await this.prisma.flow.findFirst({
      where: { id, companyId, status: 'PAUSED' }
    })

    if (!flow) {
      throw new NotFoundException('Fluxo pausado não encontrado')
    }

    return this.prisma.flow.update({
      where: { id },
      data: { status: 'ACTIVE' },
    })
  }

  async archive(id: string, companyId: string) {
    const flow = await this.prisma.flow.findFirst({
      where: { id, companyId }
    })

    if (!flow) {
      throw new NotFoundException('Fluxo não encontrado')
    }

    // Cancel all running executions
    await this.prisma.flowExecution.updateMany({
      where: { flowId: id, status: { in: ['RUNNING', 'WAITING'] } },
      data: { status: 'CANCELLED' }
    })

    return this.prisma.flow.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    })
  }

  async toggle(id: string, companyId: string) {
    const flow = await this.prisma.flow.findFirst({
      where: { id, companyId },
    })

    if (!flow) {
      throw new NotFoundException('Fluxo não encontrado')
    }

    const newStatus = flow.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    return this.prisma.flow.update({
      where: { id },
      data: { status: newStatus },
    })
  }

  // ════════════════════════════════════════════════════════════════════════
  // Flow Execution
  // ════════════════════════════════════════════════════════════════════════

  async startExecution(flowId: string, companyId: string, dto: StartExecutionDto) {
    const flow = await this.prisma.flow.findFirst({
      where: { id: flowId, companyId, status: 'ACTIVE' }
    })

    if (!flow) {
      throw new NotFoundException('Fluxo ativo não encontrado')
    }

    // Check if there's already a running execution for this lead in this flow
    const existingExec = await this.prisma.flowExecution.findFirst({
      where: {
        flowId,
        leadId: dto.leadId,
        status: { in: ['RUNNING', 'WAITING'] }
      }
    })

    if (existingExec) {
      throw new BadRequestException('Lead já está em execução neste fluxo')
    }

    // Find start node
    const nodes = flow.nodes as any[]
    let startNode = nodes.find(n => n.id === dto.startNodeId)
    
    if (!startNode) {
      // Find first TRIGGER node
      startNode = nodes.find(n => n.type === NodeType.TRIGGER)
    }

    if (!startNode) {
      throw new BadRequestException('Fluxo não possui nó de início')
    }

    // Create execution record
    const execution = await this.prisma.flowExecution.create({
      data: {
        flowId,
        companyId,
        leadId: dto.leadId,
        contactPhone: dto.contactPhone,
        status: 'RUNNING',
        currentNodeId: startNode.id,
        variables: dto.variables || {},
      },
    })

    // Update company usage
    await this.prisma.companyUsage.update({
      where: { companyId },
      data: { flowExecMonth: { increment: 1 } }
    }).catch(() => {})

    // Enqueue first node for processing
    await this.flowEngineQueue.add('process-node', {
      executionId: execution.id,
      nodeId: startNode.id,
    })

    this.logger.log(`Flow execution started: ${execution.id}`)
    return execution
  }

  async stopExecution(executionId: string, companyId: string) {
    const execution = await this.prisma.flowExecution.findFirst({
      where: { id: executionId, companyId, status: { in: ['RUNNING', 'WAITING'] } }
    })

    if (!execution) {
      throw new NotFoundException('Execução não encontrada ou já finalizada')
    }

    return this.prisma.flowExecution.update({
      where: { id: executionId },
      data: { 
        status: 'CANCELLED',
        completedAt: new Date()
      },
    })
  }

  async getExecution(executionId: string, companyId: string) {
    const execution = await this.prisma.flowExecution.findFirst({
      where: { id: executionId, companyId },
      include: {
        flow: { select: { id: true, name: true } },
        lead: { select: { id: true, name: true, phone: true } },
        steps: {
          orderBy: { executedAt: 'asc' }
        }
      }
    })

    if (!execution) {
      throw new NotFoundException('Execução não encontrada')
    }

    return execution
  }

  async getExecutions(flowId: string, companyId: string, limit = 50) {
    return this.prisma.flowExecution.findMany({
      where: { flowId, companyId },
      orderBy: { startedAt: 'desc' },
      take: limit,
      include: {
        lead: { select: { id: true, name: true, phone: true } }
      }
    })
  }

  // ════════════════════════════════════════════════════════════════════════
  // Keyword Trigger - Called from WhatsApp webhook
  // ════════════════════════════════════════════════════════════════════════

  async triggerByKeyword(companyId: string, leadId: string, phone: string, message: string) {
    const messageLower = message.toLowerCase().trim()

    // Find flows that have keyword triggers matching this message
    const flows = await this.prisma.flow.findMany({
      where: {
        companyId,
        status: 'ACTIVE',
        triggerTypes: { has: 'KEYWORD' }
      }
    })

    for (const flow of flows) {
      const keywords = flow.keywords || []
      const matched = keywords.some(kw => 
        messageLower.includes(kw.toLowerCase())
      )

      if (matched) {
        // Check if lead is already in this flow
        const existingExec = await this.prisma.flowExecution.findFirst({
          where: {
            flowId: flow.id,
            leadId,
            status: { in: ['RUNNING', 'WAITING'] }
          }
        })

        if (!existingExec) {
          this.logger.log(`Keyword trigger matched: "${message}" -> Flow ${flow.name}`)
          
          await this.startExecution(flow.id, companyId, {
            leadId,
            contactPhone: phone,
            variables: { triggerMessage: message }
          })
        }
      }
    }
  }

  async triggerByFirstMessage(companyId: string, leadId: string, phone: string) {
    const flows = await this.prisma.flow.findMany({
      where: {
        companyId,
        status: 'ACTIVE',
        triggerTypes: { has: 'FIRST_MESSAGE' }
      }
    })

    for (const flow of flows) {
      const existingExec = await this.prisma.flowExecution.findFirst({
        where: {
          flowId: flow.id,
          leadId,
        }
      })

      // Only trigger if lead has never been in this flow
      if (!existingExec) {
        this.logger.log(`First message trigger: Lead ${leadId} -> Flow ${flow.name}`)
        
        await this.startExecution(flow.id, companyId, {
          leadId,
          contactPhone: phone,
        })
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // Analytics
  // ════════════════════════════════════════════════════════════════════════

  async getFlowAnalytics(flowId: string, companyId: string) {
    const flow = await this.prisma.flow.findFirst({
      where: { id: flowId, companyId }
    })

    if (!flow) {
      throw new NotFoundException('Fluxo não encontrado')
    }

    const nodes = flow.nodes as any[]

    // Get execution counts
    const [totalExecutions, completedExecutions, runningExecutions] = await Promise.all([
      this.prisma.flowExecution.count({ where: { flowId } }),
      this.prisma.flowExecution.count({ where: { flowId, status: 'COMPLETED' } }),
      this.prisma.flowExecution.count({ where: { flowId, status: { in: ['RUNNING', 'WAITING'] } } }),
    ])

    // Get step counts per node (analytics per nó)
    const nodeAnalytics = await Promise.all(
      nodes.map(async (node) => {
        const [executed, completed, failed] = await Promise.all([
          this.prisma.flowStep.count({ where: { execution: { flowId }, nodeId: node.id } }),
          this.prisma.flowStep.count({ where: { execution: { flowId }, nodeId: node.id, status: 'COMPLETED' } }),
          this.prisma.flowStep.count({ where: { execution: { flowId }, nodeId: node.id, status: 'FAILED' } }),
        ])

        return {
          nodeId: node.id,
          nodeType: node.type,
          label: node.data?.label || node.type,
          executed,
          completed,
          failed,
          successRate: executed > 0 ? Math.round((completed / executed) * 100) : 0
        }
      })
    )

    // Calculate conversion rate (completed / total)
    const conversionRate = totalExecutions > 0 
      ? Math.round((completedExecutions / totalExecutions) * 100) 
      : 0

    return {
      flowId,
      flowName: flow.name,
      totalExecutions,
      completedExecutions,
      runningExecutions,
      conversionRate,
      nodeAnalytics,
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // Templates
  // ════════════════════════════════════════════════════════════════════════

  async getTemplates() {
    return this.prisma.flowTemplate.findMany({
      where: { isPublic: true },
      orderBy: [{ usageCount: 'desc' }, { name: 'asc' }]
    })
  }

  async createFromTemplate(templateId: string, companyId: string, userId: string, name: string) {
    const template = await this.prisma.flowTemplate.findUnique({
      where: { id: templateId }
    })

    if (!template) {
      throw new NotFoundException('Template não encontrado')
    }

    // Increment template usage
    await this.prisma.flowTemplate.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } }
    })

    // Create flow from template
    return this.create(companyId, userId, {
      name: name || `${template.name} (cópia)`,
      description: template.description,
      nodes: template.nodes as any[],
      edges: template.edges as any[],
    })
  }

  // ════════════════════════════════════════════════════════════════════════
  // Helpers
  // ════════════════════════════════════════════════════════════════════════

  private validateFlow(nodes: any[], edges: any[]) {
    if (!nodes || nodes.length === 0) {
      throw new BadRequestException('Fluxo deve ter pelo menos um nó')
    }

    // Check for at least one trigger
    const hasTrigger = nodes.some(n => n.type === NodeType.TRIGGER)
    if (!hasTrigger) {
      throw new BadRequestException('Fluxo deve ter pelo menos um gatilho (TRIGGER)')
    }

    // Validate all nodes have required fields
    for (const node of nodes) {
      if (!node.id || !node.type) {
        throw new BadRequestException('Todos os nós devem ter id e type')
      }
    }

    // Validate edges reference existing nodes
    const nodeIds = new Set(nodes.map(n => n.id))
    for (const edge of edges) {
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
        throw new BadRequestException(`Aresta inválida: ${edge.source} -> ${edge.target}`)
      }
    }
  }

  // Process incoming message reply for WAIT nodes
  async processReply(companyId: string, phone: string, message: string) {
    // Find waiting executions for this phone
    const waitingExecutions = await this.prisma.flowExecution.findMany({
      where: {
        companyId,
        contactPhone: phone,
        status: 'WAITING',
      },
      include: {
        flow: true
      }
    })

    for (const execution of waitingExecutions) {
      // Update variables with reply
      const variables = (execution.variables as any) || {}
      variables.lastReply = message
      variables.hasReplied = 'true'

      await this.prisma.flowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'RUNNING',
          variables,
        }
      })

      // Resume flow execution
      await this.flowWaitQueue.add('resume-wait', {
        executionId: execution.id,
        reply: message,
      })

      this.logger.log(`Flow execution resumed: ${execution.id} (reply received)`)
    }
  }
}
