import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFiltersDto } from './dto/task-filters.dto';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string, filters: TaskFiltersDto): Promise<any>;
    findOne(id: string, companyId: string): Promise<any>;
    create(companyId: string, userId: string, dto: CreateTaskDto): Promise<any>;
    update(id: string, companyId: string, dto: UpdateTaskDto): Promise<any>;
    complete(id: string, companyId: string, result?: string): Promise<any>;
    cancel(id: string, companyId: string): Promise<any>;
    delete(id: string, companyId: string): Promise<any>;
    findToday(companyId: string, userId?: string): Promise<any>;
    findOverdue(companyId: string, userId?: string): Promise<any>;
    findUpcoming(companyId: string, userId?: string, days?: number): Promise<any>;
    getCalendarView(companyId: string, userId: string | undefined, month: number, year: number): Promise<Record<string, any[]>>;
    getStats(companyId: string, userId?: string): Promise<{
        total: any;
        pending: any;
        done: any;
        overdue: any;
        todayCount: any;
        completionRate: number;
    }>;
}
