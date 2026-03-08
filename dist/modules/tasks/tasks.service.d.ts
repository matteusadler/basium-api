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
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        result: string | null;
        type: import(".prisma/client").$Enums.TaskType;
        tags: string[];
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        userId: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string;
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
            email: string;
            name: string;
            phone: string;
        };
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        result: string | null;
        type: import(".prisma/client").$Enums.TaskType;
        tags: string[];
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        userId: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string;
    }>;
    create(companyId: string, userId: string, dto: CreateTaskDto): Promise<{
        lead: {
            id: string;
            name: string;
            phone: string;
        };
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        result: string | null;
        type: import(".prisma/client").$Enums.TaskType;
        tags: string[];
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        userId: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string;
    }>;
    update(id: string, companyId: string, dto: UpdateTaskDto): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        result: string | null;
        type: import(".prisma/client").$Enums.TaskType;
        tags: string[];
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        userId: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string;
    }>;
    complete(id: string, companyId: string, result?: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        result: string | null;
        type: import(".prisma/client").$Enums.TaskType;
        tags: string[];
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        userId: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string;
    }>;
    cancel(id: string, companyId: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        result: string | null;
        type: import(".prisma/client").$Enums.TaskType;
        tags: string[];
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        userId: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string;
    }>;
    delete(id: string, companyId: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        result: string | null;
        type: import(".prisma/client").$Enums.TaskType;
        tags: string[];
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        userId: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string;
    }>;
    findToday(companyId: string, userId?: string): Promise<({
        lead: {
            id: string;
            name: string;
            phone: string;
        };
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        result: string | null;
        type: import(".prisma/client").$Enums.TaskType;
        tags: string[];
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        userId: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string;
    })[]>;
    findOverdue(companyId: string, userId?: string): Promise<({
        lead: {
            id: string;
            name: string;
            phone: string;
        };
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        result: string | null;
        type: import(".prisma/client").$Enums.TaskType;
        tags: string[];
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        userId: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string;
    })[]>;
    findUpcoming(companyId: string, userId?: string, days?: number): Promise<({
        lead: {
            id: string;
            name: string;
            phone: string;
        };
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        result: string | null;
        type: import(".prisma/client").$Enums.TaskType;
        tags: string[];
        description: string | null;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        userId: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date;
        dueTime: string | null;
        leadId: string;
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
