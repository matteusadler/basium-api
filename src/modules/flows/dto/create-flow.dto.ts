import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsArray, IsOptional, IsObject, ValidateNested, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'

export enum NodeType {
  TRIGGER = 'TRIGGER',
  TRIGGER_LEAD_STAGE = 'trigger_lead_stage',
  MESSAGE = 'MESSAGE',
  CONDITION = 'CONDITION',
  WAIT = 'WAIT',
  ACTION = 'ACTION',
  ACTION_CREATE_TASK = 'action_create_task',
  ACTION_SEND_EMAIL = 'action_send_email',
  ACTION_MOVE_LEAD = 'action_move_lead',
  ACTION_NOTIFICATION = 'action_notification',
  AI = 'AI',
  SPLIT_AB = 'SPLIT_AB',
  JUMP = 'JUMP',
}

export enum TriggerType {
  KEYWORD = 'KEYWORD',
  FIRST_MESSAGE = 'FIRST_MESSAGE',
  WEBHOOK = 'WEBHOOK',
  SCHEDULE = 'SCHEDULE',
  FORM_SUBMIT = 'FORM_SUBMIT',
  LEAD_CREATED = 'LEAD_CREATED',
  LEAD_UPDATED = 'LEAD_UPDATED',
  STAGE_CHANGED = 'STAGE_CHANGED',
  TASK_CREATED = 'TASK_CREATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
}

export class FlowNodePosition {
  @ApiProperty()
  x: number

  @ApiProperty()
  y: number
}

export class FlowNodeData {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  label?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  triggerType?: string

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  keywords?: string[]

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  messageType?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  content?: string

  @ApiPropertyOptional()
  delay?: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  waitType?: string

  @ApiPropertyOptional()
  timeout?: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  timeoutAction?: string

  @ApiPropertyOptional()
  delaySeconds?: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  field?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  operator?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  value?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  actionType?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  aiAction?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  prompt?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  splitName?: string

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  variants?: any[]

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  targetNodeId?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  targetFlowId?: string

  // Additional fields for various node types
  [key: string]: any
}

export class FlowNode {
  @ApiProperty()
  @IsString()
  id: string

  @ApiProperty({ enum: NodeType })
  @IsEnum(NodeType)
  type: NodeType

  @ApiProperty({ type: FlowNodePosition })
  @ValidateNested()
  @Type(() => FlowNodePosition)
  position: FlowNodePosition

  @ApiProperty({ type: FlowNodeData })
  @ValidateNested()
  @Type(() => FlowNodeData)
  data: FlowNodeData
}

export class FlowEdge {
  @ApiProperty()
  @IsString()
  id: string

  @ApiProperty()
  @IsString()
  source: string

  @ApiProperty()
  @IsString()
  target: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sourceHandle?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  targetHandle?: string
}

export class CreateFlowDto {
  @ApiProperty({ description: 'Nome do fluxo' })
  @IsString()
  name: string

  @ApiPropertyOptional({ description: 'Descrição do fluxo' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: 'Nós do fluxo', type: [FlowNode] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowNode)
  nodes: FlowNode[]

  @ApiProperty({ description: 'Conexões entre nós', type: [FlowEdge] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowEdge)
  edges: FlowEdge[]

  @ApiPropertyOptional({ description: 'Tipos de gatilhos do fluxo' })
  @IsArray()
  @IsOptional()
  triggerTypes?: string[]

  @ApiPropertyOptional({ description: 'Palavras-chave para gatilho KEYWORD' })
  @IsArray()
  @IsOptional()
  keywords?: string[]
}
