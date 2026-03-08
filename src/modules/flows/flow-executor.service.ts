import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

const TRIGGER_LEAD_STAGE = 'trigger_lead_stage'
const ACTION_CREATE_TASK = 'action_create_task'
const ACTION_SEND_EMAIL = 'action_send_email'
const ACTION_MOVE_LEAD = 'action_move_lead'
const ACTION_NOTIFICATION = 'action_notification'

@Injectable()
export class FlowExecutorService {
  private readonly logger = new Logger(FlowExecutorService.name)

  constructor(private prisma: PrismaService) {}

  async onLeadStageChanged(
    leadId: string,
    fromStageId: string,
    toStageId: string,
    companyId: string,
  ): Promise<void> {
    const flows = await this.prisma.flow.findMany({
      where: {
        companyId,
        status: 'ACTIVE',
        triggerTypes: { has: 'LEAD_STAGE_CHANGED' },
      },
    })

    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, companyId },
      include: { stage: true, pipeline: true },
    })
    if (!lead) return

    for (const flow of flows) {
      try {
        await this.executeFlowIfTriggerMatches(
          flow,
          leadId,
          companyId,
          fromStageId,
          toStageId,
          lead.pipelineId,
        )
      } catch (err) {
        this.logger.error(`Flow ${flow.id} execution failed: ${err?.message}`)
      }
    }
  }

  private async executeFlowIfTriggerMatches(
    flow: any,
    leadId: string,
    companyId: string,
    fromStageId: string,
    toStageId: string,
    leadPipelineId: string,
  ): Promise<void> {
    const nodes = (flow.nodes as any[]) || []
    const edges = (flow.edges as any[]) || []

    const triggerNode = nodes.find(
      (n) => n.type === TRIGGER_LEAD_STAGE || (n.type === 'trigger' && n.data?.triggerType === 'LEAD_STAGE_CHANGED'),
    )
    if (!triggerNode) return

    const d = triggerNode.data || {}
    if (d.pipelineId && d.pipelineId !== leadPipelineId) return
    if (d.fromStageId && d.fromStageId !== fromStageId) return
    if (d.toStageId && d.toStageId !== 'qualquer' && d.toStageId !== 'any' && d.toStageId !== toStageId) return

    const targetIds = edges.filter((e) => e.source === triggerNode.id).map((e) => e.target)
    const executed = new Set<string>()

    for (const nodeId of targetIds) {
      const node = nodes.find((n) => n.id === nodeId)
      if (!node || executed.has(node.id)) continue
      await this.executeNode(node, leadId, companyId, nodes, edges, executed)
    }
  }

  private async executeNode(
    node: any,
    leadId: string,
    companyId: string,
    nodes: any[],
    edges: any[],
    executed: Set<string>,
  ): Promise<void> {
    if (executed.has(node.id)) return
    executed.add(node.id)

    const data = node.data || {}

    switch (node.type) {
      case ACTION_CREATE_TASK:
        await this.executeCreateTask(leadId, companyId, data)
        break
      case ACTION_SEND_EMAIL:
        await this.executeSendEmail(leadId, companyId, data)
        break
      case ACTION_MOVE_LEAD:
        await this.executeMoveLead(leadId, companyId, data)
        break
      case ACTION_NOTIFICATION:
        await this.executeNotification(leadId, companyId, data)
        break
      default:
        if (node.type?.startsWith('action_')) {
          this.logger.warn(`Unknown action type: ${node.type}`)
        }
    }

    const nextIds = edges.filter((e) => e.source === node.id).map((e) => e.target)
    for (const nextId of nextIds) {
      const nextNode = nodes.find((n) => n.id === nextId)
      if (nextNode) await this.executeNode(nextNode, leadId, companyId, nodes, edges, executed)
    }
  }

  private async executeCreateTask(
    leadId: string,
    companyId: string,
    data: { title?: string; description?: string; dueInDays?: number; assignToUserId?: string },
  ): Promise<void> {
    const dueInDays = Number(data.dueInDays) || 1
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + dueInDays)

    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, companyId },
      select: { userId: true },
    })
    const userId = data.assignToUserId || lead?.userId

    await this.prisma.task.create({
      data: {
        companyId,
        leadId,
        userId: userId || (await this.prisma.user.findFirst({ where: { companyId }, select: { id: true } }))?.id!,
        title: data.title || 'Tarefa automática',
        description: data.description || null,
        type: 'CALL',
        dueDate,
        status: 'PENDING',
      },
    })
    this.logger.log(`Task created for lead ${leadId}`)
  }

  private async executeSendEmail(
    leadId: string,
    companyId: string,
    data: { to?: string; subject?: string; body?: string },
  ): Promise<void> {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, companyId },
    })
    if (!lead) return

    let body = (data.body || '').replace(/\{\{lead\.name\}\}/g, lead.name).replace(/\{\{lead\.email\}\}/g, lead.email || '')
    const to = data.to === 'corretor' || data.to === 'responsible' ? (lead.userId ? 'user' : 'lead') : 'lead'
    this.logger.log(`[Flow] Email would send to ${to}: ${data.subject} - ${body.slice(0, 80)}...`)
  }

  private async executeMoveLead(
    leadId: string,
    companyId: string,
    data: { pipelineId?: string; stageId?: string },
  ): Promise<void> {
    if (!data.stageId) return
    const stage = await this.prisma.stage.findFirst({
      where: { id: data.stageId },
    })
    if (!stage) return
    if (data.pipelineId && stage.pipelineId !== data.pipelineId) return

    await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        stageId: data.stageId,
        pipelineId: stage.pipelineId,
        probability: stage.probability,
        lastInteraction: new Date(),
      },
    })
    this.logger.log(`Lead ${leadId} moved to stage ${data.stageId}`)
  }

  private async executeNotification(
    leadId: string,
    companyId: string,
    data: { message?: string; to?: string; userId?: string },
  ): Promise<void> {
    this.logger.log(`[Flow] Internal notification: ${data.message} (to: ${data.to || data.userId || 'all'})`)
  }
}
