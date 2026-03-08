export declare class LeadFiltersDto {
    pipelineId?: string;
    stageId?: string;
    userId?: string;
    status?: string;
    temperature?: string;
    origin?: string;
    tags?: string[];
    isFavorite?: boolean;
    search?: string;
    minValue?: number;
    maxValue?: number;
    createdFrom?: string;
    createdTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
