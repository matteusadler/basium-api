import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFiltersDto } from './dto/task-filters.dto';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string, filters: TaskFiltersDto): Promise<({
        lead: {
            stage: {
                name: string;
                color: string;
            };
            id: string;
            name: string;
            phone: string;
        };
    } & {
        result: string | null;
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tags: string[];
        type: import(".prisma/client").$Enums.TaskType;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string | null;
    })[]>;
    findOne(id: string, companyId: string): Promise<{
        lead: {
            pipeline: {
                name: string;
            };
            stage: {
                name: string;
                color: string;
            };
            id: string;
            name: string;
            email: string;
            phone: string;
        };
    } & {
        result: string | null;
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tags: string[];
        type: import(".prisma/client").$Enums.TaskType;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string | null;
    }>;
    create(companyId: string, userId: string, dto: CreateTaskDto): Promise<{
        lead: {
            id: string;
            name: string;
            phone: string;
        };
    } & {
        result: string | null;
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tags: string[];
        type: import(".prisma/client").$Enums.TaskType;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string | null;
    }>;
    update(id: string, companyId: string, dto: UpdateTaskDto): Promise<{
        result: string | null;
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tags: string[];
        type: import(".prisma/client").$Enums.TaskType;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string | null;
    }>;
    complete(id: string, companyId: string, result?: string): Promise<{
        result: string | null;
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tags: string[];
        type: import(".prisma/client").$Enums.TaskType;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string | null;
    }>;
    cancel(id: string, companyId: string): Promise<{
        result: string | null;
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tags: string[];
        type: import(".prisma/client").$Enums.TaskType;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string | null;
    }>;
    delete(id: string, companyId: string): Promise<{
        result: string | null;
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tags: string[];
        type: import(".prisma/client").$Enums.TaskType;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string | null;
    }>;
    findToday(companyId: string, userId?: string): Promise<({
        lead: {
            id: string;
            name: string;
            phone: string;
        };
    } & {
        result: string | null;
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tags: string[];
        type: import(".prisma/client").$Enums.TaskType;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string | null;
    })[]>;
    findOverdue(companyId: string, userId?: string): Promise<({
        lead: {
            id: string;
            name: string;
            phone: string;
        };
    } & {
        result: string | null;
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tags: string[];
        type: import(".prisma/client").$Enums.TaskType;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string | null;
    })[]>;
    findUpcoming(companyId: string, userId?: string, days?: number): Promise<({
        lead: {
            id: string;
            name: string;
            phone: string;
        };
    } & {
        result: string | null;
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tags: string[];
        type: import(".prisma/client").$Enums.TaskType;
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string | null;
    })[]>;
    getCalendarView(companyId: string, userId: string | undefined, month: number, year: number): Promise<Record<string, any[]>>;
    getStats(companyId: string, userId?: string): Promise<{
        total: number;
        pending: number;
        done: number;
        overdue: number;
        todayCount: number;
        completionRate: number;
    }>;
}
