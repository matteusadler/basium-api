import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { DashboardService } from './dashboard.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard KPIs and statistics' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getStats(@Request() req: any) {
    return this.dashboardService.getStats(req.user.companyId)
  }

  @Get('leads-chart')
  @ApiOperation({ summary: 'Get leads chart data for visualization' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'period', required: false, enum: ['7days', '30days', '3months', '6months', '12months'] })
  async getLeadsChart(
    @Request() req: any,
    @Query('period') period?: string,
  ) {
    return this.dashboardService.getLeadsChart(req.user.companyId, period)
  }

  @Get('pipeline')
  @ApiOperation({ summary: 'Get pipeline statistics with stage counts' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getPipelineStats(@Request() req: any) {
    return this.dashboardService.getPipelineStats(req.user.companyId)
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get recent activity feed' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentActivity(
    @Request() req: any,
    @Query('limit') limit?: string,
  ) {
    return this.dashboardService.getRecentActivity(
      req.user.companyId, 
      limit ? parseInt(limit) : 20
    )
  }

  @Get('tasks/today')
  @ApiOperation({ summary: 'Get tasks due today' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getTodayTasks(@Request() req: any) {
    return this.dashboardService.getTodayTasks(req.user.companyId, req.user.id)
  }

  @Get('leads/temperature')
  @ApiOperation({ summary: 'Get leads count by temperature' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getLeadsByTemperature(@Request() req: any) {
    return this.dashboardService.getLeadsByTemperature(req.user.companyId)
  }

  @Get('leads/origin')
  @ApiOperation({ summary: 'Get leads count by origin' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getLeadsByOrigin(@Request() req: any) {
    return this.dashboardService.getLeadsByOrigin(req.user.companyId)
  }
}
