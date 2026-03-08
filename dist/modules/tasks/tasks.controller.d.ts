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
    findToday(user: any, userId?: string): Promise<({
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
    findOverdue(user: any, userId?: string): Promise<({
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
    findUpcoming(user: any, userId?: string, days?: string): Promise<({
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
    create(user: any, dto: CreateTaskDto): Promise<{
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
    update(id: string, user: any, dto: UpdateTaskDto): Promise<{
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
    complete(id: string, user: any, body: {
        result?: string;
    }): Promise<{
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
    cancel(id: string, user: any): Promise<{
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
    delete(id: string, user: any): Promise<{
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
}
