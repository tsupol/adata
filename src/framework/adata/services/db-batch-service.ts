import { BehaviorSubject, shareReplay, Subject, takeUntil } from "rxjs";
import { bufferDebounceTime } from "../../aui/lib/rxUtils";
import { AEndpoint, ApiService } from "./api-service";
import { isEmptyObject, removeUndefined } from "megaloutils";
import { DbAction, DbService, IFindMany } from "./db-service";
import { SimpleRx } from "../../aui/lib/SimpleRx";

export class DbBatchService {

  destroy$ = new Subject<boolean>();
  api: ApiService;
  db: DbService;

  apiCallSubject: any = new BehaviorSubject(null);
  apiCall$ = this.apiCallSubject.pipe(
    bufferDebounceTime(100),
    shareReplay(1),
    takeUntil(this.destroy$),
  );

  apiCountSubject: any = new BehaviorSubject(null);
  apiCount$ = this.apiCountSubject.pipe(
    bufferDebounceTime(100),
    shareReplay(1),
    takeUntil(this.destroy$),
  );

  apiFindManySubject: any = new BehaviorSubject(null);
  apiFindMany$ = this.apiFindManySubject.pipe(
    bufferDebounceTime(100),
    shareReplay(1),
    takeUntil(this.destroy$),
  );

  // updateApiCallSubject: any = new BehaviorSubject(null);
  // updateApiCall$ = this.updateApiCallSubject.pipe(
  //   bufferDebounceTime(1000),
  //   shareReplay(1),
  //   takeUntil(this.destroy$),
  // );

  updatePivotApiCallSubject: any = new BehaviorSubject(null);
  updatePivotApiCall$ = this.updatePivotApiCallSubject.pipe(
    bufferDebounceTime(1000),
    shareReplay(1),
    takeUntil(this.destroy$),
  );

  constructor(db: DbService, api: ApiService) {
    this.api = api;
    this.db = db;
    this.apiCall$.subscribe((data: any) => this.aggApiFindOne(data));
    // this.updateApiCall$.subscribe((data: any) => this.aggApiUpdate(data));
    this.updatePivotApiCall$.subscribe((data: any) => this.aggApiPivotUpdate(data));
    this.apiCount$.subscribe((data: any) => this.aggApiCount(data));
    this.apiFindMany$.subscribe((data: any) => this.aggApiFindMany(data));
  }

  destroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  batchFindOne(c: string, match: any, callback: (v: any) => void, once = false, forceFetch = false) {
    let shouldFetch = forceFetch;
    if (!this.db.indexes[c]) {
      this.db.indexes[c] = {};
    }
    const key = typeof match === 'string' ? match : JSON.stringify(match);
    if (!this.db.indexes[c][key]) {
      this.db.indexes[c][key] = new SimpleRx();
      shouldFetch = true;
    } else {
      if (this.db.indexes[c][key].data !== undefined) {
        const dc = this.db.indexes[c][key];
        if (once) {
          callback(this.db.indexes[c][key].data);
        } else {
          callback(this.db.indexes[c][key].data);
          dc.subscribe(callback);
        }
        return;
      }
    }
    const dc = this.db.indexes[c][key];
    if (once) {
      dc.subscribeOnce(callback);
    } else if (callback) {
      dc.subscribe(callback);
    }
    if (shouldFetch) {
      this.apiCall$.next({ c, q: match });
    }
    return dc;
  }

  batchFindMany({ c, q, l = 10, s, callback, once }: IFindMany) {
    let shouldFetch = false;
    if (!this.db.lists[c]) {
      this.db.lists[c] = {};
    }
    if (!q) {
      q = {};
    }
    const qls = removeUndefined({ q, l, s });
    const key = JSON.stringify(qls);
    if (!this.db.lists[c][key]) {
      this.db.lists[c][key] = new SimpleRx();
      shouldFetch = true;
    }
    const dc = this.db.lists[c][key];
    if (once) {
      dc.subscribeOnce(callback);
    } else if (callback) {
      dc.subscribe(callback);
    }
    if (shouldFetch) {
      this.apiFindManySubject.next({
        c, qls, key
      });
    }
    return dc;
  }

  // v === null to delete
  batchPivotAuto(c: string, q: any, v: any) {
    const key = typeof q === 'string' ? q : JSON.stringify(q);
    const rx = this.db.getPivotReactive(c, key);
    rx.next(v);
    this.updatePivotApiCallSubject.next({ c, q, v });
  }

  // for e.g. likes
  // !important (assuming that 'unlike' means already liked)
  batchPivotToggle(c: string, query: any) {
    const key = typeof query === 'string' ? query : JSON.stringify(query);
    let action = DbAction.None;
    if (!this.db.indexes[c]) {
      this.db.indexes[c] = {};
    }
    if (!this.db.indexes[c][key]) {
      this.db.indexes[c][key] = new SimpleRx();
      action = DbAction.Insert;
    } else {
      if (this.db.indexes[c][key].data === null) {
        action = DbAction.Insert;
      } else {
        action = DbAction.Delete;
      }
    }
    this.updatePivotApiCallSubject.next({ c, q: query, action });
  }

  insertPivot(c: string, query: any, value?: any) {
    const key = JSON.stringify(query);
    if (!this.db.indexes[c]) {
      this.db.indexes[c] = {};
    }
    if (!this.db.indexes[c][key]) {
      this.db.indexes[c][key] = new SimpleRx();
    }
    const dc = this.db.indexes[c][key];
    this.updatePivotApiCallSubject.next({ c, q: query, v: value, a: DbAction.Insert });
    dc.next({ ...query, ...(value || {}) });
  }

  deletePivot(c: string, query: any) {
    const key = JSON.stringify(query);
    if (!this.db.indexes[c]) {
      this.db.indexes[c] = {};
    }
    if (!this.db.indexes[c][key]) {
      this.db.indexes[c][key] = new SimpleRx();
    }
    const dc = this.db.indexes[c][key];
    this.updatePivotApiCallSubject.next({ c, q: query, a: DbAction.Delete });
    dc.next(null);
  }

  batchCount(c: string, q: any, callback: (v: any) => void, once?: boolean) {
    if (typeof q !== 'object') {
      throw new Error('q must be an object');
    }
    let shouldFetch = false;
    const key = JSON.stringify(q);
    if (!this.db.counts[c]) {
      this.db.counts[c] = {};
    }
    if (!this.db.counts[c][key]) {
      this.db.counts[c][key] = new SimpleRx();
      shouldFetch = true;
    }
    const dc = this.db.counts[c][key];
    if (once) {
      dc.subscribeOnce(callback);
    } else if (callback) {
      dc.subscribe(callback);
    }
    if (shouldFetch) {
      this.apiCountSubject.next({ c, q });
    }
    return dc;
  }

  // --------------------------------------------------------------------------------
  // Aggregate
  // --------------------------------------------------------------------------------

  aggApiFindOne(calls: any[]) {
    const qHash: any = {};
    const queries: any = {};
    calls = calls.filter(n => n);
    for (const call of calls) {
      if (!qHash[call.c]) {
        qHash[call.c] = {};
      }
      if (typeof call.q === 'string') {
        qHash[call.c][call.q] = call.q;
      } else {
        qHash[call.c][JSON.stringify(call.q)] = call.q;
      }
    }
    for (const c of Object.keys(qHash)) {
      queries[c] = [];
      for (const key of Object.keys(qHash[c])) {
        queries[c].push(qHash[c][key]);
      }
    }
    if (Object.keys(queries).length === 0) {
      return;
    }
    this.api.batchFindOne(queries).then((r: any) => {
      for (const c of Object.keys(r)) {
        for (const key of Object.keys(r[c])) {
          this.db.indexes[c][key].next(r[c][key]);
        }
      }
    });
  }

  aggApiFindMany(list: any[]) {
    list = list.filter(v => v);
    const grouped: any = {};
    for (const item of list) {
      if (!grouped[item.c]) {
        grouped[item.c] = [];
      }
      grouped[item.c].push(item.qls);
    }
    if (isEmptyObject(grouped)) {
      return;
    }
    this.api.batchFindMany(grouped).then((data: any) => {
      for (const c of Object.keys(data)) {
        for (const k of Object.keys(data[c])) {
          const rx = this.db.lists[c][k];
          rx.next(data[c][k]);
        }
      }
    });
  }

  // aggApiUpdate(list: any[]) {
  //   list = list.filter(n => n);
  //   const grouped: any = {};
  //   const resultList: any = {};
  //   for (const item of list) {
  //     if (!grouped[item.c]) {
  //       grouped[item.c] = {};
  //     }
  //     const key = typeof item.q === 'string' ? item.q : JSON.stringify(item.q);
  //     if (!grouped[item.c][key]) {
  //       grouped[item.c][key] = [];
  //     }
  //     grouped[item.c][key].push(item);
  //   }
  //   // remove unwanted item
  //   // note: just use the last one (easy to code)
  //   for (const c of Object.keys(grouped)) {
  //     for (const key of Object.keys(grouped[c])) {
  //       const itemGroup = grouped[c][key];
  //       const last = itemGroup[itemGroup.length - 1];
  //       // contains value (e.g. like emotion)
  //       if (!resultList[c]) {
  //         resultList[c] = {};
  //       }
  //       if (!resultList[c][last.a]) {
  //         resultList[c][last.a] = [];
  //       }
  //       if (last.v) {
  //         resultList[c][last.a].push([last.q, last.v]);
  //       } else {
  //         resultList[c][last.a].push([last.q]);
  //       }
  //     }
  //   }
  //
  //   if (resultList && Object.keys(resultList).length) {
  //     this.api.bulkActions(resultList).then((res: any) => {
  //       if (res) {
  //         for (const c of Object.keys(resultList)) {
  //           this.db.invalidatePaginated(c);
  //         }
  //
  //         // update
  //         // ----------------------------------------
  //
  //         for (const c of Object.keys(res.data)) {
  //           for (const key of Object.keys(res.data[c])) {
  //             if (!this.db.indexes[c][key]) {
  //               throw new Error(`c:${c}, key:${key} not found`);
  //             } else {
  //               this.db.indexes[c][key].next(res.data[c][key]);
  //             }
  //           }
  //         }
  //
  //       } else {
  //         throw new Error(`no res.data`);
  //       }
  //     });
  //   }
  // }

  aggApiCount(list: any[]) {
    list = list.filter(v => v);
    const grouped: any = {};
    for (const item of list) {
      if (!grouped[item.c]) {
        grouped[item.c] = [];
      }
      grouped[item.c].push(item.q);
    }
    if (isEmptyObject(grouped)) {
      return;
    }
    this.api.batchCount(grouped).then((data: any) => {
      for (const c of Object.keys(data)) {
        for (const k of Object.keys(data[c])) {
          const rx = this.db.counts[c][k];
          rx.next(data[c][k]);
        }
      }
    });
  }

  // only support 'like with emotion' at most
  aggApiPivotUpdate(list: any[]) {
    list = list.filter(n => n);
    const grouped: any = {};
    const resultList: any = {};
    for (const item of list) {
      if (!grouped[item.c]) {
        grouped[item.c] = {};
      }
      const key = typeof item.q === 'string' ? item.q : JSON.stringify(item.q);
      if (!grouped[item.c][key]) {
        grouped[item.c][key] = [];
      }
      grouped[item.c][key].push(item);
    }
    // remove unwanted item
    // note: just use the last one (easy to code)
    for (const c of Object.keys(grouped)) {
      for (const key of Object.keys(grouped[c])) {
        console.log('key', key);
        const itemGroup = grouped[c][key];
        const last = itemGroup[itemGroup.length - 1];
        // contains value (e.g. like emotion)
        if (!resultList[c]) {
          resultList[c] = [];
        }
        resultList[c].push({ q: last.q, v: last.v });
      }
    }
    if (resultList && Object.keys(resultList).length) {
      this.api.batchPivotActions(resultList).then((res: any) => {
        for (const c of Object.keys(res)) {
          for (const key of Object.keys(res[c])) {
            console.log('this.db.pivots[c][key]', this.db.pivots[c][key]);
            this.db.pivots[c][key].next(res[c][key])
          }
        }
      });
    }
  }
}
