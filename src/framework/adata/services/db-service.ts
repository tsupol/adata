import { SchemaService } from './schema-service';
import { Subject } from 'rxjs';
import { SimpleRx } from '../../aui/lib/SimpleRx';
import { ApiService, IApiUpdate } from './api-service';
import { DbPaginateService } from './db-paginate-service';
import { removeUndefined } from 'megaloutils';
import { UiService } from '../../aui/services/ui-service';
import { DbInfiniteService } from './db-infinite-service';
import { DbBatchService } from "./db-batch-service";

const objectIdRegEx = /^([^/]+)\/(.*?)\/([^/]+)\/([0-9a-f]{24})$/;

export interface IPagination {
  pageNumber?: number, // start with 1
  perPage?: number,
}

export enum DbAction {
  None = 'none',
  Insert = 'insert',
  Update = 'update',
  Delete = 'delete',
  Upsert = 'upsert',
}

export interface IGetManyOptions {
  limit?: number,
}

interface IInsertUpdateCnf extends IApiUpdate {
  newImagePath?: string,
  returnRx?: boolean,
  invalidatePaginated?: boolean,
}

interface IDbDelete {
  invalidatePaginated?: boolean,
}

export interface IFindMany {
  c: string,
  callback?: (v: any) => void,
  once?: boolean,
  q?: any,
  s?: any,
  l?: number
}


export class DbService {
  destroy$ = new Subject<boolean>();
  schemaService: SchemaService;
  lists: any = {};
  counts: any = {};
  indexes: any = {}; // the actual db
  pivots: any = {}; // the actual db
  api: ApiService;
  ui: UiService;
  paginate: DbPaginateService;
  infinite: DbInfiniteService;
  batch: DbBatchService;

  constructor(schemaService: SchemaService, api: ApiService, ui: UiService) {
    this.schemaService = schemaService;
    this.api = api;
    this.ui = ui;
    this.paginate = new DbPaginateService(this, api, ui);
    this.infinite = new DbInfiniteService(this, api, ui);
    this.batch = new DbBatchService(this, api);
  }

  findOne(c: string, q: any, callback: (v: any) => void, once = false, forceFetch = false) {
    let shouldFetch = forceFetch;
    const key = typeof q === 'string' ? q : JSON.stringify(q);
    if (this.indexes[c] === undefined) {
      this.indexes[c] = {};
    }
    if (this.indexes[c][key] === undefined) {
      shouldFetch = true;
      this.indexes[c][key] = new SimpleRx();
    }
    const dc = this.indexes[c][key];
    if (callback) {
      if (once) {
        dc.subscribeOnce(callback);
      } else {
        dc.subscribe(callback);
      }
    }
    if (shouldFetch) {
      this.api.findOne(c, q)
        .then(v => {
          dc.next(v);
        })
        .catch(e => dc.next(e));
    }
    return dc;
  }

  findMany({ c, q, l = 10, s, callback, once }: IFindMany) {
    let shouldFetch = false;
    if (!this.lists[c]) {
      this.lists[c] = {};
    }
    if (!q) {
      q = {};
    }
    const key = JSON.stringify(removeUndefined({ q, l, s }));
    if (this.lists[c][key] === undefined) {
      this.lists[c][key] = new SimpleRx();
      shouldFetch = true;
    }
    const dc = this.lists[c][key];
    if (callback) {
      if (once) {
        dc.subscribeOnce(callback);
      } else {
        dc.subscribe(callback);
      }
    }
    if (shouldFetch) {
      this.api.findMany({ c, q, l, s })
        .then(v => dc.next(v))
        .catch(e => dc.next(e));
    }
    return dc;
  }

  findAll({ c, q, s, callback, once }: IFindMany) {
    return this.findMany({ c, q, s, l: 999, once, callback });
  }

  count(c: string, q: any, callback: (v: any) => void, once?: boolean) {
    if (typeof q !== 'object') {
      throw new Error('q must be an object');
    }
    let shouldFetch = false;
    const key = JSON.stringify(q);
    if (!this.counts[c]) {
      this.counts[c] = {};
    }
    if (!this.counts[c][key]) {
      this.counts[c][key] = new SimpleRx();
      shouldFetch = true;
    }
    const dc = this.counts[c][key];
    if (callback) {
      if (once) {
        dc.subscribeOnce(callback);
      } else {
        dc.subscribe(callback);
      }
    }
    if (shouldFetch) {
      this.api.count(c, q)
        .then(v => dc.next(v))
        .catch(e => dc.next(e));
    }
    return dc;
  }

  async insertOne(c: string, v: any, callback: (v: any) => void, cnf?: IInsertUpdateCnf) {
    await this.processImageFields(v, c, cnf);
    const res = await this.api.insertOne(c, v, removeUndefined({
      returnDocument: cnf?.returnDocument,
    }));
    if (callback) {
      callback(res);
    }
    let key;
    if (!this.indexes[c]) {
      this.indexes[c] = {};
    }
    if (cnf?.returnDocument) {
      this.indexes[c][res._id] = res;
      key = res._id;
    } else {
      key = res.insertedId;
    }
    const rx = this.getReactive(c, key);
    if (cnf?.invalidatePaginated) {
      this.invalidatePaginated(c);
    }
    return rx;
  }

  async insertMany(c: string, list: any[], callback: (v: any) => void, cnf?: IInsertUpdateCnf) {
    for (const v of list) {
      await this.processImageFields(v, c, cnf);
    }
    const res = await this.api.insertMany(c, list, removeUndefined({
      returnDocument: cnf?.returnDocument,
    }));
    if (callback) {
      callback(res);
    }
    if (cnf?.returnDocument) {
      if (Array.isArray(res)) {
        if (!this.indexes[c]) {
          this.indexes[c] = {};
        }
        for (const item of res) {
          this.indexes[c][item._id] = item;
        }
      }
    }
  }

  async updateOne(c: string, q: any, update: any, callback?: (v: any) => void, cnf?: IInsertUpdateCnf) {
    const key = typeof q === 'string' ? q : JSON.stringify(q);
    const dc = this.getReactive(c, key);
    if (update.$set) {
      await this.processImageFields(update.$set, c, cnf);
    }
    const res = await this.api.updateOne(c, q, update, cnf);
    if (callback) {
      callback(res);
    }
    if (cnf?.returnDocument) {
      dc.next(res);
    }
    if (cnf?.invalidatePaginated) {
      this.invalidatePaginated(c);
    }
    return dc;
  }

  async updateMany(c: string, q: any, update: any, callback?: (v: any) => void, cnf?: IInsertUpdateCnf) {
    const key = typeof q === 'string' ? q : JSON.stringify(q);
    const dc = this.getReactive(c, key);
    if (update.$set) {
      await this.processImageFields(update.$set, c, cnf);
    }
    const res = await this.api.updateMany(c, q, update, cnf);
    if (callback) {
      callback(res);
    }
    if (cnf?.returnDocument) {
      dc.next(res);
    }
    if (cnf?.invalidatePaginated) {
      this.invalidatePaginated(c);
    }
    return dc;
  }

  clientUpdateOne(c: string, q: any, value: any) {
    const key = typeof q === 'string' ? q : JSON.stringify(q);
    const dc = this.getReactive(c, key);
    dc.next({ ...(this.indexes[c][key] || {}), ...(value || {}) });
  }

  async deleteOne(c: string, q: any, callback?: (v: any) => void, cnf?: IDbDelete) {
    const key = JSON.stringify(q);
    const dc = this.getReactive(c, key);
    const res = await this.api.deleteOne(c, q);
    if (callback) {
      callback({
        deletedId: q
      });
    }
    if (cnf?.invalidatePaginated) {
      this.invalidatePaginated(c);
    }
    dc.next(null);
    return dc;
  }

  async deleteMany(c: string, q: any, callback?: (v: any) => void, cnf?: IDbDelete) {
    const key = JSON.stringify(q);
    const dc = this.getReactive(c, key);
    const res = await this.api.deleteMany(c, q);
    if (callback) callback(res);
    if (cnf?.invalidatePaginated) this.invalidatePaginated(c);
    dc.next(null);
    return dc;
  }

  async findOnePivot(c: string, q: any, callback?: (v: any) => void): Promise<SimpleRx<any>> {
    const key = JSON.stringify(q);
    const rx = this.getPivotReactive(c, key);
    const res = await this.api.findOnePivot(c, q);
    rx.next(res);
    if (callback) callback(res);
    return rx;
  }

  async upsertPivot(c: string, q: any, v: any, callback?: (v: any) => void) {
    const key = JSON.stringify(q);
    const dc = this.getPivotReactive(c, key);
    const res = await this.api.upsertPivot(c, q, v);
    if (callback) callback(res);
    dc.next(null);
    return dc;
  }

  async togglePivot(c: string, q: any, v: any, callback?: (v: any) => void) {
    const key = JSON.stringify(q);
    const dc = this.getPivotReactive(c, key);
    const res = await this.api.togglePivot(c, q, v);
    if (callback) callback(res);
    dc.next(null);
    return dc;
  }

  // --------------------------------------------------------------------------------
  // Utils
  // --------------------------------------------------------------------------------

  getReactive(c: string, key: any) {
    if (!this.indexes[c]) {
      this.indexes[c] = {};
    }
    if (!this.indexes[c][key]) {
      this.indexes[c][key] = new SimpleRx();
    }
    return this.indexes[c][key];
  }

  getPivotReactive(c: string, key: any) {
    const k = typeof key === 'object' ? JSON.stringify(key) : key
    if (!this.pivots[c]) {
      this.pivots[c] = {};
    }
    if (!this.pivots[c][k]) {
      this.pivots[c][k] = new SimpleRx();
    }
    return this.pivots[c][k];
  }

  async processImageFields(data: any, c: string, cnf?: IInsertUpdateCnf) {
    for (const key of Object.keys(data)) {
      if (this.schemaService.fieldCnf.image.includes(key)) {
        data[key] = await this.api.uploadImageField(data[key], cnf?.newImagePath ?? c);
      } else if (this.schemaService.fieldCnf.gallery.includes(key)) {
        data[key] = await this.api.processAndUploadGallery(data[key], cnf?.newImagePath ?? c);
      }
    }
  }

  isObjectId(value: any) {
    if (typeof value === 'string') {
      return objectIdRegEx.test(value);
    }
    return false;
  }

  invalidatePaginated(c: string | string) {
    this.paginate.onInsertedOrRemoved({ c });
  }

  destroy() {
    this.paginate.destroy();
    this.infinite.destroy();
    this.batch.destroy();
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
