import { PrismaService } from '../../common/prisma/prisma.service';
import { FlowExecutorService } from '../flows/flow-executor.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadFiltersDto } from './dto/lead-filters.dto';
import { MoveStageDto } from './dto/move-stage.dto';
import { MarkLostDto } from './dto/mark-lost.dto';
import { MarkWonDto } from './dto/mark-won.dto';
import { CreateNoteDto } from './dto/create-note.dto';
export declare class LeadsService {
    private prisma;
    private flowExecutor;
    private notifications;
    constructor(prisma: PrismaService, flowExecutor: FlowExecutorService, notifications: NotificationsService);
    findAll(companyId: string, filters: LeadFiltersDto): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findByStage(companyId: string, pipelineId: string, userId?: string): Promise<any>;
    findOne(id: string, companyId: string): Promise<any>;
    create(companyId: string, userId: string, dto: CreateLeadDto): Promise<any>;
    update(id: string, companyId: string, userId: string, dto: UpdateLeadDto): Promise<any>;
    delete(id: string, companyId: string, userId: string): Promise<any>;
    checkDuplicates(companyId: string, phone: string, email?: string): Promise<{
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
    moveStage(id: string, companyId: string, userId: string, dto: MoveStageDto): Promise<any>;
    markAsWon(id: string, companyId: string, userId: string, dto: MarkWonDto): Promise<any>;
    markAsLost(id: string, companyId: string, userId: string, dto: MarkLostDto): Promise<any>;
    reactivate(id: string, companyId: string, userId: string): Promise<any>;
    toggleFavorite(id: string, companyId: string): Promise<any>;
    addNote(leadId: string, companyId: string, userId: string, dto: CreateNoteDto): Promise<any>;
    updateNote(noteId: string, companyId: string, userId: string, content: string): Promise<any>;
    togglePinNote(noteId: string, companyId: string): Promise<any>;
    deleteNote(noteId: string, companyId: string, userId: string): Promise<{
        success: boolean;
    }>;
    addAttachment(leadId: string, companyId: string, userId: string, fileData: any): Promise<any>;
    deleteAttachment(attachmentId: string, companyId: string, userId: string): Promise<{
        success: boolean;
    }>;
    getTimeline(leadId: string, companyId: string): Promise<any>;
    private createHistoryEvent;
    bulkUpdateStage(companyId: string, userId: string, leadIds: string[], stageId: string): Promise<{
        success: boolean;
        count: number;
    }>;
    bulkAssign(companyId: string, currentUserId: string, leadIds: string[], newUserId: string): Promise<{
        success: boolean;
        count: number;
    }>;
    getStats(companyId: string, userId?: string): Promise<{
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
}
