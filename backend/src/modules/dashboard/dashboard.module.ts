import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { LeadsModule } from '../leads/leads.module';
import { PropertiesModule } from '../properties/properties.module';

@Module({
  imports: [LeadsModule, PropertiesModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
