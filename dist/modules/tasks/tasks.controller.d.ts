import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFiltersDto } from './dto/task-filters.dto';
export declare class TasksController {
    private tasksService;
    constructor(tasksService: TasksService);
    findAll(user: any, filters: TaskFiltersDto): Promise<any>;
    findToday(user: any, userId?: string): Promise<any>;
    findOverdue(user: any, userId?: string): Promise<any>;
    findUpcoming(user: any, userId?: string, days?: string): Promise<any>;
    getCalendarView(user: any, userId: string | undefined, month: string, year: string): Promise<Record<string, any[]>>;
    getStats(user: any, userId?: string): Promise<{
        total: any;
        pending: any;
        done: any;
        overdue: any;
        todayCount: any;
        completionRate: number;
    }>;
    findOne(id: string, user: any): Promise<any>;
    create(user: any, dto: CreateTaskDto): Promise<any>;
    update(id: string, user: any, dto: UpdateTaskDto): Promise<any>;
    complete(id: string, user: any, body: {
        result?: string;
    }): Promise<any>;
    cancel(id: string, user: any): Promise<any>;
    delete(id: string, user: any): Promise<any>;
}
