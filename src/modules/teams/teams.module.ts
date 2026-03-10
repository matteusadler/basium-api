import { Module } from '@nestjs/common'
import { TeamsController } from './teams.controller'
import { TeamsService } from './teams.service'
import { EmailModule } from '../email/email.module'

@Module({
  imports: [EmailModule],
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {}
