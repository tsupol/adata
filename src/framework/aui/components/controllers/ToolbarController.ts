import { BehaviorSubject, shareReplay, Subject, takeUntil } from 'rxjs';

export class ToolbarController {
  destroy$ = new Subject<boolean>();

  firstSlotSubject = new BehaviorSubject<any | null>(null);
  firstSlot = this.firstSlotSubject.pipe(
    takeUntil(this.destroy$),
    shareReplay(1)
  );

  fixedTopSubject = new BehaviorSubject<JSX.Element | null>(null);
  fixedTop = this.fixedTopSubject.pipe(
    takeUntil(this.destroy$),
    shareReplay(1)
  );

  setFixedTop(component: JSX.Element) {
    this.fixedTopSubject.next(component);
  }

  removeFixedTop() {
    this.fixedTopSubject.next(null);
  }

  destroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
