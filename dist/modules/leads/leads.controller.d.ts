import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadFiltersDto } from './dto/lead-filters.dto';
import { MoveStageDto } from './dto/move-stage.dto';
import { MarkLostDto } from './dto/mark-lost.dto';
import { MarkWonDto } from './dto/mark-won.dto';
import { CreateNoteDto } from './dto/create-note.dto';
export declare class LeadsController {
    private leadsService;
    constructor(leadsService: LeadsService);
    findAll(user: any, filters: LeadFiltersDto): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findByStage(pipelineId: string, user: any): Promise<any>;
    getStats(user: any, userId?: string): Promise<{
        total: any;
        active: any;
        won: any;
        lost: any;
        totalWonValue: any;
        conversionRate: number;
        byTemperature: {
            hot: any;
            warm: any;
            cold: any;
        };
    }>;
    checkDuplicates(user: any, phone: string, email?: string): Promise<{
        hasDuplicate: boolean;
        existingLead: {
            id: any;
            name: any;
            phone: any;
            email: any;
            userId: any;
            stage: any;
            status: any;
            createdAt: any;
        };
    }>;
    findOne(id: string, user: any): Promise<any>;
    getTimeline(id: string, user: any): Promise<any>;
    create(user: any, dto: CreateLeadDto): Promise<any>;
    update(id: string, user: any, dto: UpdateLeadDto): Promise<any>;
    delete(id: string, user: any): Promise<any>;
    moveStage(id: string, user: any, dto: MoveStageDto): Promise<any>;
    markAsWon(id: string, user: any, dto: MarkWonDto): Promise<any>;
    markAsLost(id: string, user: any, dto: MarkLostDto): Promise<any>;
    reactivate(id: string, user: any): Promise<any>;
    toggleFavorite(id: string, user: any): Promise<any>;
    addNote(id: string, user: any, dto: CreateNoteDto): Promise<any>;
    updateNote(noteId: string, user: any, body: {
        content: string;
    }): Promise<any>;
    togglePinNote(noteId: string, user: any): Promise<any>;
    deleteNote(noteId: string, user: any): Promise<{
        success: boolean;
    }>;
    addAttachment(id: string, user: any, fileData: any): Promise<any>;
    deleteAttachment(attachmentId: string, user: any): Promise<{
        success: boolean;
    }>;
    bulkMoveStage(user: any, body: {
        leadIds: string[];
        stageId: string;
    }): Promise<{
        success: boolean;
        count: number;
    }>;
    bulkAssign(user: any, body: {
        leadIds: string[];
        userId: string;
    }): Promise<{
        success: boolean;
        count: number;
    }>;
}
