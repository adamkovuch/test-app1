import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, interval, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
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
    this.appService.getBotInfo(botUrl).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(info => {
      this.botList.push(info ? {...info, status: 'working', url: botUrl } : {loop: 0, success: 0, error: 0, target: null, url: botUrl, status: 'idle'});
      this.startUpdateInterval(botUrl);
    });
  }

  private startUpdateInterval(botUrl: string) {
    interval(3000).pipe(
      switchMap(() => this.appService.getBotInfo(botUrl)),
      tap(() => {
        const bot = this.botList.find(x => x.url === botUrl);
        if(bot) {
          bot.status = 'idle';
        }
      }),
      catchError((err) => {
        const bot = this.botList.find(x => x.url === botUrl);
        if(bot) {
          bot.status = 'offline';
        }
        this.startUpdateInterval(botUrl);
        return of(null);
      }),
      takeUntil(this.destroyed$),
    ).subscribe(info => {
      const bot = this.botList.find(x => x.url === botUrl);
      if(!bot) {
        return;
      }

      if(info) {
        bot.error = info.error;
        bot.success = info.success;
        bot.loop = info.loop;
        bot.target = info.target;
      } else {
        bot.error = 0;
        bot.loop = 0;
        bot.success = 0;
        bot.target = null;
      }
    });
  }
}
