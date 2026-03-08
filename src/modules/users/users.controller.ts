import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UpdateAIConfigDto } from './dto/update-ai-config.dto'

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users in company' })
  async findAll(@CurrentUser() user: any) {
    return this.usersService.findAll(user.companyId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.findOne(id, user.companyId)
  }

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  async create(@CurrentUser() user: any, @Body() dto: CreateUserDto) {
    return this.usersService.create(user.companyId, dto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, user.companyId, dto)
  }

  @Put(':id/openai-key')
  @ApiOperation({ summary: 'Update user OpenAI key (encrypted)' })
  async updateOpenAIKey(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { openaiKey: string },
  ) {
    return this.usersService.updateOpenAIKey(id, user.companyId, body.openaiKey)
  }

  @Put(':id/ai-config')
  @ApiOperation({ summary: 'Update user AI configuration' })
  async updateAIConfig(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateAIConfigDto,
  ) {
    return this.usersService.updateAIConfig(id, user.companyId, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate user' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.delete(id, user.companyId)
  }
}
