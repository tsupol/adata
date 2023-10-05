import {BehaviorSubject, debounceTime, fromEvent, shareReplay, Subject, takeUntil} from 'rxjs';
import {ModalService} from './modal-service';
import {SimpleRx} from '../lib/SimpleRx';
import {SrxService} from './srx-service';
import {PopoverService} from './popover-service';
import {SubpageService} from './subpage-service';
import {randomString} from 'megaloutils';
import {NotificationService} from "./notification-service";

export enum UiEvent {
  General,
  Modal,
  ModalRefresh,
  ModalPresent,
  ModalDismiss,
  PopoverPresent,
  PopoverDismiss,
  ModalData,
  ContextMenu,
  FormInitialized,
  FormSubmit,
  FormChanged,
  FormSubmitError,
  List,
  Action,
  Refresh,
  Toolbar,
  FixedTop,
  NavMenu,
  Tabs,
}

export enum NotificationType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}


interface IBreakpoint {
  list: string[];
  isExpanding: boolean;
}

export interface UiEventDetail {
  key?: string,
  data?: any,
}

export class UiService {

  event$: any = new Subject();
  destroy$ = new Subject<boolean>();

  breakpointsSubject: any = new BehaviorSubject<IBreakpoint>({
    list: [],
    isExpanding: false,
  });
  breakpoints = this.breakpointsSubject.pipe(
    shareReplay(1),
    takeUntil(this.destroy$),
  );

  events = {
    [UiEvent.General]: new SimpleRx(undefined, false),
    [UiEvent.NavMenu]: new SimpleRx(undefined, false),
    [UiEvent.Modal]: new SimpleRx(undefined, false),
    [UiEvent.ModalRefresh]: new SimpleRx(undefined, false),
    [UiEvent.ModalPresent]: new SimpleRx(undefined, false),
    [UiEvent.ModalDismiss]: new SimpleRx(undefined, false),
    [UiEvent.PopoverPresent]: new SimpleRx(undefined, false),
    [UiEvent.PopoverDismiss]: new SimpleRx(undefined, false),
    [UiEvent.ModalData]: new SimpleRx(undefined, false),
    [UiEvent.ContextMenu]: new SimpleRx(undefined, false),
    [UiEvent.Action]: new SimpleRx(undefined, false),
    [UiEvent.FormSubmit]: new SimpleRx(undefined, false),
    [UiEvent.FormChanged]: new SimpleRx(undefined, false),
    [UiEvent.FormSubmitError]: new SimpleRx(undefined, false),
    [UiEvent.FormInitialized]: new SimpleRx(undefined),
    [UiEvent.Refresh]: new SimpleRx(undefined, false),
    [UiEvent.List]: new SimpleRx(undefined, false),
    [UiEvent.Toolbar]: new SimpleRx(undefined, false),
    [UiEvent.FixedTop]: new SimpleRx(undefined, false),
    [UiEvent.Tabs]: new SimpleRx(undefined, false),
  };
  modals = new ModalService(this);
  subpages = new SubpageService(this, this.destroy$);
  popover = new PopoverService(this);
  notify: any = {};
  cnf: any;

  constructor(notify: any, srx: SrxService, cnf: any) {
    document.addEventListener(UiEvent.General.toString(), this.generalEventHandler);
    this.cnf = cnf;

    this.notify = new NotificationService(this)
    // Notify
    // ----------------------------------------
    // this.notifyService = notify;
    // this.notify.success = (msg: string) => this.doNotify(NotificationType.Success, msg);
    // this.notify.error = (msg: string) => this.doNotify(NotificationType.Error, msg);
    // this.notify.warning = (msg: string) => this.doNotify(NotificationType.Warning, msg);
    // this.notify.info = (msg: string) => this.doNotify(NotificationType.Info, msg);
    fromEvent(window, 'resize').pipe(
      debounceTime(500),
      takeUntil(this.destroy$),
    ).subscribe(() => this.handleWindowResize());
  }

  handleWindowResize() {
    if (this.cnf) {
      try {
        const bps: string[] = [];
        for (const key of Object.keys(this.cnf.breakpoints)) {
          if (this.cnf.breakpoints[key] < window.innerWidth) {
            bps.push(key);
          }
        }
        if (this.breakpointsSubject.getValue()?.list.length !== bps?.length) {
          this.breakpointsSubject.next({
            list: bps,
            isExpanding: this.breakpointsSubject.getValue()?.list.length < bps?.length
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  generalEventHandler(e: any) {
    console.log('e.detail', e.detail);
  }

  formatPrice(val: string | number) {
    if (val === undefined) {
      return '- THB';
    }
    return `${val.toLocaleString()} THB`;
  }

  displayDimension(input: any) {
    return `${input.width} X ${input.height}`;
  }

  dispatchUiEvent(detail: UiEventDetail, eventType = UiEvent.General) {
    this.events[eventType].next({
      detail, eventType
    });
  }

  destroy() {
    this.notify.destroy();
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
