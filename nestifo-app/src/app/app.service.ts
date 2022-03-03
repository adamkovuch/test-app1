import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';

export interface BotInfo {
  botUrl: string;
  target: AttackInfo | null;
  loop: number;
  success: number;
  error: number;
  status: 'working' | 'idle' | 'offline',
}

export interface AttackInfo {
  url: string;
  concurrency?: number;
  interval?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AppService {
  constructor(private httpClient: HttpClient) { }

  getBots(): Observable<BotInfo[]> {
    return this.httpClient.get<BotInfo[]>('/api/control');
  }

  attack(info: AttackInfo) {
    return this.httpClient.post<BotInfo>('/api/control/attack', {...info});
  }

  stop() {
    return this.httpClient.delete('/api/control/attack');
  }
}
