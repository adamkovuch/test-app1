import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';
import { AppService, Bot } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit, OnDestroy {
  host: string = '';
  port: number = 0;

  get bots(): Bot[] {
    return this.appService.botList;
  }
  
  private destroyed$ = new Subject<void>();

  constructor(private appService: AppService) { }
  

  ngOnInit(): void {
    this.appService.refreshList();
    interval(5000).pipe(takeUntil(this.destroyed$)).subscribe(() => this.appService.refreshList());
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  attack() {
    this.appService.attack({host: this.host, port: this.port});
  }

  stop() {
    this.appService.stop();
  }
}
