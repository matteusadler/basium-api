import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { TasksService } from './tasks.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { TaskFiltersDto } from './dto/task-filters.dto'

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'List tasks with filters' })
  async findAll(@CurrentUser() user: any, @Query() filters: TaskFiltersDto) {
    return this.tasksService.findAll(user.companyId, filters)
  }

  @Get('today')
  @ApiOperation({ summary: 'Get tasks due today' })
  @ApiQuery({ name: 'userId', required: false })
  async findToday(@CurrentUser() user: any, @Query('userId') userId?: string) {
    return this.tasksService.findToday(user.companyId, userId)
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue tasks' })
  @ApiQuery({ name: 'userId', required: false })
  async findOverdue(@CurrentUser() user: any, @Query('userId') userId?: string) {
    return this.tasksService.findOverdue(user.companyId, userId)
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming tasks' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'days', required: false })
  async findUpcoming(
    @CurrentUser() user: any,
    @Query('userId') userId?: string,
    @Query('days') days?: string,
  ) {
    return this.tasksService.findUpcoming(user.companyId, userId, days ? parseInt(days) : 7)
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get tasks for calendar view' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'month', required: true })
  @ApiQuery({ name: 'year', required: true })
  async getCalendarView(
    @CurrentUser() user: any,
    @Query('userId') userId: string | undefined,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.tasksService.getCalendarView(
      user.companyId,
      userId,
      parseInt(month),
      parseInt(year),
    )
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get task statistics' })
  @ApiQuery({ name: 'userId', required: false })
  async getStats(@CurrentUser() user: any, @Query('userId') userId?: string) {
    return this.tasksService.getStats(user.companyId, userId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasksService.findOne(id, user.companyId)
  }

  @Post()
  @ApiOperation({ summary: 'Create new task' })
  async create(@CurrentUser() user: any, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(user.companyId, user.id, dto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, user.companyId, dto)
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Mark task as completed' })
  async complete(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { result?: string },
  ) {
    return this.tasksService.complete(id, user.companyId, body.result)
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel task' })
  async cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasksService.cancel(id, user.companyId)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasksService.delete(id, user.companyId)
  }
}
