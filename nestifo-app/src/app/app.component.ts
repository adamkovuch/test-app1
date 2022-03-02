import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, interval, map, of, Subject, switchMap, takeUntil, tap, timeout } from 'rxjs';
import { AppService, BotInfo } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit, OnDestroy {
  botList: BotInfo[] = [];
  target: string = '';
  
  private destroyed$ = new Subject<void>();

  constructor(private appService: AppService) { }
  

  ngOnInit(): void {
    this.refreshList();
    interval(5000).pipe(takeUntil(this.destroyed$)).subscribe(() => this.refreshList());
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  attack() {
    this.appService.attack(this.botList, {target: this.target}).pipe(takeUntil(this.destroyed$)).subscribe();
  }

  stop() {
    this.appService.stop(this.botList).pipe(takeUntil(this.destroyed$)).subscribe();
  }

  private refreshList() {
    this.appService.getBotList().pipe(
      takeUntil(this.destroyed$)
    ).subscribe(list => {
      list.forEach(botUrl => {
        if(!this.botList.find(bot => bot.url === botUrl)) {
          this.addBot(botUrl);
        }
      });
    });
  }

  private addBot(botUrl: string) {
    this.onBotUpdate(botUrl);
    this.botList.push({url: botUrl, status: 'offline', loop: 0, error: 0, success: 0, target: null});
    this.startUpdateInterval(botUrl);
  }

  private startUpdateInterval(botUrl: string) {
    interval(3000).pipe(
      takeUntil(this.destroyed$),
    ).subscribe(() => this.onBotUpdate(botUrl));
  }

  private onBotUpdate(botUrl: string) {
    this.appService.getBotInfo(botUrl).pipe(
      timeout(2500),
      map(info => ({success: true, info})),
      catchError(() => {
        //this.startUpdateInterval(botUrl);
        return of({success: false, info: null});
      }),
      takeUntil(this.destroyed$),
    ).subscribe(data => {
      const bot = this.botList.find(x => x.url === botUrl);
      if(!bot) {
        return;
      }

      bot.error = 0;
      bot.success = 0;
      bot.loop = 0;
      bot.target = null;

      if(data.success) {
        const info = data.info as BotInfo || {};
        bot.error = info.error || 0;
        bot.success = info.success || 0;
        bot.loop = info.loop || 0;
        bot.target = info.target || null;
        bot.status = info.target ? 'working' : 'idle';
      } else {
        bot.status = 'offline';
      }
    });
  }
}
