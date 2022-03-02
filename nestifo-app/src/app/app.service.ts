import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';

export interface BotInfo {
  url: string;
  target: string | null;
  loop: number;
  success: number;
  error: number;
  status: 'working' | 'idle' | 'offline',
}

export interface AttackInfo {
  target: string;
  concurrency?: number;
  interval?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AppService {
  constructor(private httpClient: HttpClient) { }

  getBotList(): Observable<string[]> {
    return this.httpClient.get<string[]>('/api/control');
    //return of(['http://localhost:8080/'])
  }

  getBotInfo(url: string): Observable<BotInfo> {
    return this.httpClient.get<BotInfo>(url);
  }

  attack(bots: BotInfo[], info: AttackInfo) {
    return forkJoin(bots.map(x => this.httpClient.post(`${x.url}attack`, info, {responseType: 'text'})));
  }

  stop(bots: BotInfo[]) {
    return forkJoin(bots.map(x => this.httpClient.delete(`${x.url}attack`, {responseType: 'text'})));
  }
}
