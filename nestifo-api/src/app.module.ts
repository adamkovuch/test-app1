import { Module } from '@nestjs/common';
import { ControlModule } from './control/control.module';
import { PingController } from './shared/controllers/ping/ping.controller';

@Module({
  imports: [ControlModule],
  controllers: [PingController],
})
export class AppModule {}
