import { DbService } from './db-service';
import { ApiService } from './api-service';
import { DefaultPerPage } from '../cnf';
import { encodeKey } from '../adata-utils';
import { SimpleRx } from '../../aui/lib/SimpleRx';
import { IListingParams } from '../controllers/BaseListingClass';
import { BehaviorSubject, debounceTime, Subject, takeUntil } from 'rxjs';
import { UiEvent, UiService } from '../../aui/services/ui-service';

// note: abandoned, use IndyFiniteController instead.

export class DbInfiniteService {
  db: DbService;
  api: ApiService;
  ui: UiService;
  pools: any = {};
  destroy$ = new Subject<boolean>();
  invalidatedSubject = new BehaviorSubject<any>(null);
  invalidated$ = this.invalidatedSubject.pipe(
    takeUntil(this.destroy$),
    debounceTime(500),
  );

  constructor(db: DbService, api: ApiService, ui: UiService) {
    this.db = db;
    this.api = api;
    this.ui = ui;
  }

  async paginate({ c, sort, filter, pageNumber = 1, perPage = DefaultPerPage }: IListingParams) {
    const key = encodeKey({ filter, sort });
    const keyPage = encodeKey({ perPage, pageNumber });
    const sortKey = Object.keys(sort)?.[0];
    if (!sortKey) {
      throw new Error('must have sort key');
    }
    if (!this.pools[c]) {
      this.pools[c] = {};
    }
    if (!this.pools[c][key]) {
      this.pools[c][key] = {
        list: [],
        total: 0
      }
    }
    const rx = this.pools[c][key];
    const list = this.pools[c].list;
    const fp = { ...(filter || {}), [sortKey]: { [sort[sortKey] === 1 ? '$gt' : '$lt']: list[list.length - 1].value[sortKey] } };
    const params = { c, n: pageNumber, p: perPage, f: filter, fp, s: sort };
    const res = await this.api.infinite(params);
    if (res) {
      rx.total = res.total;
      rx.pages = { ...rx.pages, [keyPage]: this.setIndexed(c, res.list) };
    } else {
      throw new Error('cannot fetch paginate');
    }
    // return {
    //   list: pool.pages[keyPage],
    //   total: pool.total
    // };
  }

  setIndexed(c: string, list: any[]) {
    const indexedList: any[] = [];
    for (const item of list) {
      if (item._id) {
        if (!this.db.indexes[c]) {
          this.db.indexes[c] = [];
        }
        if (!this.db.indexes[c][item._id]) {
          this.db.indexes[c][item._id] = new SimpleRx(item);
        } else {
          this.db.indexes[c][item._id].next(item);
        }
        indexedList.push(this.db.indexes[c][item._id]);
      }
    }
    return indexedList;
  }

  onInsertedOrRemoved(ior: any) {
    if (ior?.c) {
      const c = ior.c;
      if (this.pools[c]) {
        for (const key of Object.keys(this.pools[c])) {
          this.pools[c][key] = {
            pages: {},
            total: 0
          };
          this.invalidatedSubject.next({ c });
          setTimeout(() => {
            this.ui.dispatchUiEvent({ key: c }, UiEvent.Refresh);
          }, 500);
        }
      }
    }
  }

  destroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
