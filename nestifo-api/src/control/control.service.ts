import { Injectable } from '@nestjs/common';

@Injectable()
export class ControlService {
    private _bots: string[] = [];
    
    get bots() { return this._bots; }

    addBot(url: string) {
        if(!this._bots.includes(url)) {
            this._bots.push(url);
        }
    }
}
