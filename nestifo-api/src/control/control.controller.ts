import { Body, Controller, Delete, Get, Post } from '@nestjs/common';

const botUrls: string[] = [];

@Controller('control')
export class ControlController {
    @Get()
    getBots() {
        return botUrls;
    }

    @Post('register')
    register(@Body('botUrl') botUrl: string) {
        if(!botUrls.includes(botUrl)) {
            botUrls.push(botUrl);
        }
    }
}
