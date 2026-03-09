import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
export declare class PipelinesController {
    private pipelinesService;
    constructor(pipelinesService: PipelinesService);
    findAll(user: any): Promise<any>;
    getDefault(user: any): Promise<any>;
    findOne(id: string, user: any): Promise<any>;
    getKanbanStats(id: string, user: any): Promise<any>;
    create(user: any, dto: CreatePipelineDto): Promise<any>;
    update(id: string, user: any, dto: UpdatePipelineDto): Promise<any>;
    delete(id: string, user: any): Promise<any>;
    createStage(pipelineId: string, user: any, dto: CreateStageDto): Promise<any>;
    reorderStages(pipelineId: string, user: any, body: {
        stageIds: string[];
    }): Promise<any>;
    updateStage(stageId: string, user: any, dto: UpdateStageDto): Promise<any>;
    deleteStage(stageId: string, user: any): Promise<any>;
}
