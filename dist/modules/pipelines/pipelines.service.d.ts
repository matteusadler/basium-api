import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
export declare class PipelinesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string): Promise<any>;
    findOne(id: string, companyId: string): Promise<any>;
    create(companyId: string, dto: CreatePipelineDto): Promise<any>;
    update(id: string, companyId: string, dto: UpdatePipelineDto): Promise<any>;
    delete(id: string, companyId: string): Promise<any>;
    getDefault(companyId: string): Promise<any>;
    createStage(pipelineId: string, companyId: string, dto: CreateStageDto): Promise<any>;
    updateStage(stageId: string, companyId: string, dto: UpdateStageDto): Promise<any>;
    deleteStage(stageId: string, companyId: string): Promise<any>;
    reorderStages(pipelineId: string, companyId: string, stageIds: string[]): Promise<any>;
    getKanbanStats(pipelineId: string, companyId: string): Promise<any>;
}
