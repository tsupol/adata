import {UiService} from "./ui-service";
import {BehaviorSubject, debounceTime, shareReplay, Subject, takeUntil} from "rxjs";
import {randomString} from "megaloutils";

export enum NotificationType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

export class NotificationService {

  destroy$ = new Subject<boolean>();
  ui: UiService;

  itemListSubject = new BehaviorSubject<any[]>([]);
  itemList$ = this.itemListSubject.pipe(
    debounceTime(100),
    shareReplay(1),
    takeUntil(this.destroy$),
  );

  constructor(ui: UiService) {
    this.ui = ui;
  }

  success(msg: string) {
    this.push(msg, NotificationType.Success)
  }

  error(msg: string) {
    this.push(msg, NotificationType.Error)
  }

  warning(msg: string) {
    this.push(msg, NotificationType.Warning)
  }

  info(msg: string) {
    this.push(msg, NotificationType.Info)
  }

  push(msg: string, type: NotificationType) {
    this.itemListSubject.next([...this.itemListSubject.getValue(), {
      id: randomString(10, '#A'),
      msg,
      type
    }])
  }

  remove(id: string) {
    const newList = []
    for (const item of this.itemListSubject.getValue()) {
      if (item.id === id) continue
      newList.push(item)
    }
    this.itemListSubject.next(newList)
  }

  destroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
