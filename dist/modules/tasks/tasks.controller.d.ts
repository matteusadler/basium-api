import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFiltersDto } from './dto/task-filters.dto';
export declare class TasksController {
    private tasksService;
    constructor(tasksService: TasksService);
    findAll(user: any, filters: TaskFiltersDto): Promise<({
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
    findToday(user: any, userId?: string): Promise<({
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
    findOverdue(user: any, userId?: string): Promise<({
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
    findUpcoming(user: any, userId?: string, days?: string): Promise<({
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
    getCalendarView(user: any, userId: string | undefined, month: string, year: string): Promise<Record<string, any[]>>;
    getStats(user: any, userId?: string): Promise<{
        total: number;
        pending: number;
        done: number;
        overdue: number;
        todayCount: number;
        completionRate: number;
    }>;
    findOne(id: string, user: any): Promise<{
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
    create(user: any, dto: CreateTaskDto): Promise<{
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
    update(id: string, user: any, dto: UpdateTaskDto): Promise<{
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
    complete(id: string, user: any, body: {
        result?: string;
    }): Promise<{
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
    cancel(id: string, user: any): Promise<{
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
    delete(id: string, user: any): Promise<{
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
}
