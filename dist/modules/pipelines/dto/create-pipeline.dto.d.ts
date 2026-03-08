declare class StageInput {
    name: string;
    color?: string;
    order?: number;
    probability?: number;
    type?: string;
}
export declare class CreatePipelineDto {
    name: string;
    type: string;
    isDefault?: boolean;
    stages?: StageInput[];
}
export {};
