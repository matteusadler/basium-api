import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job, Queue } from 'bullmq'
import { InjectQueue } from '@nestjs/bullmq'
import { PrismaService } from '../../../common/prisma/prisma.service'

interface ResumeDelayJob {
  executionId: string
  stepId: string
  nodeId: string
}

interface ResumeWaitJob {
  executionId: string
  reply: string
}

interface CheckTimeoutJob {
  executionId: string
  stepId: string
  nodeId: string
  timeoutAction: string
}

@Processor('flow-wait', { connection: { host: 'localhost', port: 6379 } })
export class FlowWaitProcessor extends WorkerHost {
  private readonly logger = new Logger(FlowWaitProcessor.name)

  constructor(
    private prisma: PrismaService,
    @InjectQueue('flow-engine') private flowEngineQueue: Queue,
  ) {
    super()
  }

  async process(job: Job): Promise<any> {
    const { name, data } = job

    switch (name) {
      case 'resume-delay':
        return this.handleResumeDelay(data as ResumeDelayJob)

      case 'resume-wait':
        return this.handleResumeWait(data as ResumeWaitJob)

      case 'check-timeout':
        return this.handleCheckTimeout(data as CheckTimeoutJob)

      default:
        this.logger.warn(`Unknown job name: ${name}`)
        return { status: 'unknown_job' }
    }
  }

  private async handleResumeDelay(data: ResumeDelayJob): Promise<any> {
    const { executionId, stepId, nodeId } = data

    this.logger.log(`Resuming execution ${executionId} after delay`)

    try {
      const execution = await this.prisma.flowExecution.findUnique({
        where: { id: executionId },
        include: { flow: true },
      })

      if (!execution || execution.status === 'CANCELLED') {
        return { status: 'skipped', reason: 'execution_not_found_or_cancelled' }
      }

      // Update step as completed
      await this.prisma.flowStep.update({
        where: { id: stepId },
        data: { status: 'COMPLETED' },
      })

      // Get next node
      const edges = execution.flow.edges as any[]
      const nextEdge = edges.find(e => e.source === nodeId)

      if (nextEdge) {
        // Continue to next node
        await this.prisma.flowExecution.update({
          where: { id: executionId },
          data: { currentNodeId: nextEdge.target },
        })

        await this.flowEngineQueue.add('process-node', {
          executionId,
          nodeId: nextEdge.target,
        })

        return { status: 'resumed', nextNode: nextEdge.target }
      } else {
        // Flow completed
        await this.prisma.flowExecution.update({
          where: { id: executionId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        })

        return { status: 'completed' }
      }
    } catch (error: any) {
      this.logger.error(`Error resuming delay: ${error.message}`)
      throw error
    }
  }

  private async handleResumeWait(data: ResumeWaitJob): Promise<any> {
    const { executionId, reply } = data

    this.logger.log(`Resuming execution ${executionId} after reply`)

    try {
      const execution = await this.prisma.flowExecution.findUnique({
        where: { id: executionId },
        include: { flow: true },
      })

      if (!execution || execution.status !== 'RUNNING') {
        return { status: 'skipped', reason: 'not_running' }
      }

      const currentNodeId = execution.currentNodeId
      if (!currentNodeId) {
        return { status: 'skipped', reason: 'no_current_node' }
      }

      // Find the WAIT step that was waiting
      const waitStep = await this.prisma.flowStep.findFirst({
        where: {
          executionId,
          nodeId: currentNodeId,
          status: 'PENDING',
        },
        orderBy: { executedAt: 'desc' },
      })

      if (waitStep) {
        await this.prisma.flowStep.update({
          where: { id: waitStep.id },
          data: {
            status: 'COMPLETED',
            output: { reply, receivedAt: new Date().toISOString() },
          },
        })
      }

      // Get next node (the 'replied' handle)
      const edges = execution.flow.edges as any[]
      const replyEdge = edges.find(
        e => e.source === currentNodeId && (e.sourceHandle === 'replied' || !e.sourceHandle)
      )

      if (replyEdge) {
        await this.prisma.flowExecution.update({
          where: { id: executionId },
          data: { currentNodeId: replyEdge.target },
        })

        await this.flowEngineQueue.add('process-node', {
          executionId,
          nodeId: replyEdge.target,
        })

        return { status: 'resumed', nextNode: replyEdge.target }
      }

      return { status: 'no_next_node' }
    } catch (error: any) {
      this.logger.error(`Error resuming wait: ${error.message}`)
      throw error
    }
  }

  private async handleCheckTimeout(data: CheckTimeoutJob): Promise<any> {
    const { executionId, stepId, nodeId, timeoutAction } = data

    this.logger.log(`Checking timeout for execution ${executionId}`)

    try {
      const execution = await this.prisma.flowExecution.findUnique({
        where: { id: executionId },
        include: { flow: true },
      })

      // If execution is no longer waiting (reply received), skip
      if (!execution || execution.status !== 'WAITING') {
        return { status: 'skipped', reason: 'not_waiting' }
      }

      // Update step
      await this.prisma.flowStep.update({
        where: { id: stepId },
        data: {
          status: 'COMPLETED',
          output: { timeout: true, action: timeoutAction },
        },
      })

      // Update variables
      const variables = (execution.variables as any) || {}
      variables.hasReplied = 'false'
      variables.timedOut = 'true'

      await this.prisma.flowExecution.update({
        where: { id: executionId },
        data: {
          status: 'RUNNING',
          variables,
        },
      })

      switch (timeoutAction) {
        case 'END':
          // End the flow
          await this.prisma.flowExecution.update({
            where: { id: executionId },
            data: {
              status: 'COMPLETED',
              completedAt: new Date(),
            },
          })
          return { status: 'ended_by_timeout' }

        case 'CONTINUE':
          // Continue to next node
          const edges = execution.flow.edges as any[]
          // Try to find timeout edge, or fallback to any next edge
          const nextEdge = edges.find(e => e.source === nodeId && e.sourceHandle === 'timeout') ||
                          edges.find(e => e.source === nodeId)

          if (nextEdge) {
            await this.prisma.flowExecution.update({
              where: { id: executionId },
              data: { currentNodeId: nextEdge.target },
            })

            await this.flowEngineQueue.add('process-node', {
              executionId,
              nodeId: nextEdge.target,
            })

            return { status: 'continued_after_timeout', nextNode: nextEdge.target }
          }

          // No next node, end flow
          await this.prisma.flowExecution.update({
            where: { id: executionId },
            data: {
              status: 'COMPLETED',
              completedAt: new Date(),
            },
          })
          return { status: 'ended_no_next_node' }

        default:
          return { status: 'unknown_timeout_action' }
      }
    } catch (error: any) {
      this.logger.error(`Error checking timeout: ${error.message}`)
      throw error
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`Wait job ${job.id} completed`)
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Wait job ${job.id} failed: ${error.message}`)
  }
}
