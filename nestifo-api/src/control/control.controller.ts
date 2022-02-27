import { Body, Controller, Get, Post } from '@nestjs/common';
import { ControlService } from './control.service';

@Controller('control')
export class ControlController {
    constructor(private controlService: ControlService) {}

    @Post('register')
    resgisterBot(@Body('url') url: string) {
        this.controlService.addBot(url);
    }

    @Get()
    getBots() {
        return this.controlService.bots;
    }
}
