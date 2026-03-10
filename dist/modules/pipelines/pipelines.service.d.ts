import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
export declare class PipelinesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string): Promise<({
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
    findOne(id: string, companyId: string): Promise<{
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
    create(companyId: string, dto: CreatePipelineDto): Promise<{
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
    update(id: string, companyId: string, dto: UpdatePipelineDto): Promise<{
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
    delete(id: string, companyId: string): Promise<{
        id: string;
        companyId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        type: string;
        isDefault: boolean;
    }>;
    getDefault(companyId: string): Promise<{
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
    createStage(pipelineId: string, companyId: string, dto: CreateStageDto): Promise<{
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
    updateStage(stageId: string, companyId: string, dto: UpdateStageDto): Promise<{
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
    deleteStage(stageId: string, companyId: string): Promise<{
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
    reorderStages(pipelineId: string, companyId: string, stageIds: string[]): Promise<{
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
    getKanbanStats(pipelineId: string, companyId: string): Promise<{
        stageId: string;
        stageName: string;
        stageColor: string;
        leadCount: number;
        totalValue: number;
        weightedValue: number;
    }[]>;
}
