export declare enum NodeType {
    TRIGGER = "TRIGGER",
    TRIGGER_LEAD_STAGE = "trigger_lead_stage",
    MESSAGE = "MESSAGE",
    CONDITION = "CONDITION",
    WAIT = "WAIT",
    ACTION = "ACTION",
    ACTION_CREATE_TASK = "action_create_task",
    ACTION_SEND_EMAIL = "action_send_email",
    ACTION_MOVE_LEAD = "action_move_lead",
    ACTION_NOTIFICATION = "action_notification",
    AI = "AI",
    SPLIT_AB = "SPLIT_AB",
    JUMP = "JUMP"
}
export declare enum TriggerType {
    KEYWORD = "KEYWORD",
    FIRST_MESSAGE = "FIRST_MESSAGE",
    WEBHOOK = "WEBHOOK",
    SCHEDULE = "SCHEDULE",
    FORM_SUBMIT = "FORM_SUBMIT",
    LEAD_CREATED = "LEAD_CREATED",
    LEAD_UPDATED = "LEAD_UPDATED",
    STAGE_CHANGED = "STAGE_CHANGED",
    TASK_CREATED = "TASK_CREATED",
    TASK_COMPLETED = "TASK_COMPLETED"
}
export declare class FlowNodePosition {
    x: number;
    y: number;
}
export declare class FlowNodeData {
    label?: string;
    triggerType?: string;
    keywords?: string[];
    messageType?: string;
    content?: string;
    delay?: number;
    waitType?: string;
    timeout?: number;
    timeoutAction?: string;
    delaySeconds?: number;
    field?: string;
    operator?: string;
    value?: string;
    actionType?: string;
    aiAction?: string;
    prompt?: string;
    splitName?: string;
    variants?: any[];
    targetNodeId?: string;
    targetFlowId?: string;
    [key: string]: any;
}
export declare class FlowNode {
    id: string;
    type: NodeType;
    position: FlowNodePosition;
    data: FlowNodeData;
}
export declare class FlowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
}
export declare class CreateFlowDto {
    name: string;
    description?: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
    triggerTypes?: string[];
    keywords?: string[];
}
