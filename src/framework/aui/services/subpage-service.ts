import { UiService } from './ui-service';
import { randomString } from 'megaloutils';
import { BehaviorSubject, fromEvent, Observable, shareReplay, takeUntil } from 'rxjs';

export interface SubpageParams {
  id?: string;
  title?: any;
  content?: any | JSX.Element | ((modalId: string) => any);
}

export class SubpageService {
  pages: any = [];
  ui: UiService;
  subpagesSubject: any = new BehaviorSubject([]);
  subpages$: Observable<any[]>;
  destroy$: Observable<boolean>;

  constructor(ui: UiService, destroy$: Observable<boolean>) {
    this.ui = ui;
    this.destroy$ = destroy$;
    this.subpages$ = this.subpagesSubject.pipe(
      shareReplay(1),
      takeUntil(destroy$)
    );
    fromEvent(window, 'popstate').pipe(
      takeUntil(destroy$)
    ).subscribe(() => {
      this.handlePop();
    });
  }

  push(data: SubpageParams) {
    if (!data.id) {
      data.id = randomString(10, 'a#');
    }
    this.subpagesSubject.next([...this.subpagesSubject.getValue(), data]);
    window.history.pushState({ subpage: data.id }, '');
  }

  pop() {
    this.handlePop();
  }

  popAll() {
    const count = this.subpagesSubject.getValue()?.length || 0;
    window.history.go(count);
    this.subpagesSubject.next([]);
  }

  handlePop() {
    const val = this.subpagesSubject.getValue();
    val.pop();
    this.subpagesSubject.next(val);
  }

}
