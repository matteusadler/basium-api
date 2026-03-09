import { FlowsService } from './flows.service';
import { CreateFlowDto } from './dto/create-flow.dto';
import { UpdateFlowDto } from './dto/update-flow.dto';
import { StartExecutionDto } from './dto/start-execution.dto';
export declare class FlowsController {
    private flowsService;
    constructor(flowsService: FlowsService);
    findAll(user: any): Promise<any>;
    getTemplates(): Promise<any>;
    findOne(id: string, user: any): Promise<any>;
    create(dto: CreateFlowDto, user: any): Promise<any>;
    createFromTemplate(templateId: string, name: string, user: any): Promise<any>;
    update(id: string, dto: UpdateFlowDto, user: any): Promise<any>;
    delete(id: string, user: any): Promise<any>;
    publish(id: string, user: any): Promise<any>;
    pause(id: string, user: any): Promise<any>;
    resume(id: string, user: any): Promise<any>;
    archive(id: string, user: any): Promise<any>;
    toggle(id: string, user: any): Promise<any>;
    startExecution(flowId: string, dto: StartExecutionDto, user: any): Promise<any>;
    getExecutions(flowId: string, limit: number, user: any): Promise<any>;
    getExecution(executionId: string, user: any): Promise<any>;
    stopExecution(executionId: string, user: any): Promise<any>;
    getAnalytics(flowId: string, user: any): Promise<{
        flowId: string;
        flowName: any;
        totalExecutions: any;
        completedExecutions: any;
        runningExecutions: any;
        conversionRate: number;
        nodeAnalytics: {
            nodeId: any;
            nodeType: any;
            label: any;
            executed: any;
            completed: any;
            failed: any;
            successRate: number;
        }[];
    }>;
}
