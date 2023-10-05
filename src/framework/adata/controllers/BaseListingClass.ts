import { BehaviorSubject, debounceTime, shareReplay, Subject, takeUntil } from 'rxjs';
import { arrayIndexOf, objMergeDeepNoOverride } from 'megaloutils';

export class BaseListingClass {
  destroy$ = new Subject<boolean>();
  dataSubject = new BehaviorSubject<ISmartListData | null>(null);
  data = this.dataSubject.pipe(
    debounceTime(100),
    shareReplay(1),
    takeUntil(this.destroy$),
  );
  paramsSubject = new BehaviorSubject<IListingParams | null>(null);
  params = this.paramsSubject.pipe(
    debounceTime(400),
    shareReplay(1),
    takeUntil(this.destroy$),
  );
  selectedSubject = new BehaviorSubject<any[]>([]);
  selected = this.selectedSubject.pipe(
    shareReplay(1),
    takeUntil(this.destroy$),
  );
  defaultFilter = {};

  constructor(params?: IListingParams) {
    if (params) {
      this.paramsSubject.next(params);
    }
  }

  onChanged(v: any) {
    this.dataSubject.next(v);
  }

  patchParams(v: any) {
    this.paramsSubject.next(objMergeDeepNoOverride(this.paramsSubject.getValue(), v));
  }

  setFilter(v: any) {
    const params = this.paramsSubject.getValue() as IListingParams;
    params.filter = { ...this.defaultFilter, ...v };
    this.paramsSubject.next(params);
  }

  setDefaultFilter(v: any) {
    this.defaultFilter = v;
  }

  patchFilter(v: any) {
    const params = this.paramsSubject.getValue() as IListingParams;
    params.filter = { ...params.filter, ...v };
    this.paramsSubject.next(params);
  }

  getParams() {
    return this.paramsSubject.getValue();
  }

  getSelected() {
    return this.selectedSubject.getValue();
  }

  clearSelected() {
    this.selectedSubject.next([]);
  }

  onSelect(row: any) {
    const prev = this.selectedSubject.getValue();
    const idx = arrayIndexOf(prev, (v: any) => v._id === row._id);
    const newRows = [...prev];
    if (idx >= 0) {
      newRows.splice(idx, 1);
    } else {
      newRows.push(row);
    }
    this.selectedSubject.next(newRows);
  }

  destroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

export interface IListingParams {
  c: string,
  sort?: any,
  filter?: any,
  perPage?: number,
  pageNumber?: number,
  callback?: (v: any) => any,
}

export interface ISmartListData {
  list: any[],
  total: number,
}
