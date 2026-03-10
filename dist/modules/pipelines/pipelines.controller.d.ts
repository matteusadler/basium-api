import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
export declare class PipelinesController {
    private pipelinesService;
    constructor(pipelinesService: PipelinesService);
    findAll(user: any): Promise<({
        _count: {
            leads: number;
        };
        stages: {
            id: string;
            name: string;
            color: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            order: number;
            probability: number;
            pipelineId: string;
        }[];
    } & {
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        type: string;
        isDefault: boolean;
    })[]>;
    getDefault(user: any): Promise<{
        stages: {
            id: string;
            name: string;
            color: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            order: number;
            probability: number;
            pipelineId: string;
        }[];
    } & {
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        type: string;
        isDefault: boolean;
    }>;
    findOne(id: string, user: any): Promise<{
        stages: ({
            _count: {
                leads: number;
            };
        } & {
            id: string;
            name: string;
            color: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            order: number;
            probability: number;
            pipelineId: string;
        })[];
    } & {
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        type: string;
        isDefault: boolean;
    }>;
    getKanbanStats(id: string, user: any): Promise<{
        stageId: string;
        stageName: string;
        stageColor: string;
        leadCount: number;
        totalValue: number;
        weightedValue: number;
    }[]>;
    create(user: any, dto: CreatePipelineDto): Promise<{
        stages: {
            id: string;
            name: string;
            color: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            order: number;
            probability: number;
            pipelineId: string;
        }[];
    } & {
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        type: string;
        isDefault: boolean;
    }>;
    update(id: string, user: any, dto: UpdatePipelineDto): Promise<{
        stages: {
            id: string;
            name: string;
            color: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            order: number;
            probability: number;
            pipelineId: string;
        }[];
    } & {
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        type: string;
        isDefault: boolean;
    }>;
    delete(id: string, user: any): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        type: string;
        isDefault: boolean;
    }>;
    createStage(pipelineId: string, user: any, dto: CreateStageDto): Promise<{
        id: string;
        name: string;
        color: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        order: number;
        probability: number;
        pipelineId: string;
    }>;
    reorderStages(pipelineId: string, user: any, body: {
        stageIds: string[];
    }): Promise<{
        stages: ({
            _count: {
                leads: number;
            };
        } & {
            id: string;
            name: string;
            color: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            order: number;
            probability: number;
            pipelineId: string;
        })[];
    } & {
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        type: string;
        isDefault: boolean;
    }>;
    updateStage(stageId: string, user: any, dto: UpdateStageDto): Promise<{
        id: string;
        name: string;
        color: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        order: number;
        probability: number;
        pipelineId: string;
    }>;
    deleteStage(stageId: string, user: any): Promise<{
        id: string;
        name: string;
        color: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        order: number;
        probability: number;
        pipelineId: string;
    }>;
}
