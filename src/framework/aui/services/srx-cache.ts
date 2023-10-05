import { SimpleRx } from '../lib/SimpleRx';
import { RrxForm } from '../../adata/components/rrxforms/rrx-form';

export class SrxCache {

  cache: { [key: string]: SimpleRx<any> } = {};

  get(key: string) {
    if (!this.cache[key]) {
      this.cache[key] = new SimpleRx();
    }
    return this.cache[key];
  }

  set(key: string, value: any) {
    if(key === undefined) return null
    if (!this.cache[key]) {
      this.cache[key] = new SimpleRx();
    }
    this.cache[key].next(value);
    return this.cache[key];
  }

  unset(key: string) {
    if (this.cache[key]) {
      if (this.cache[key].value instanceof RrxForm) {
        (this.cache[key].value as RrxForm).destroy();
      }
      delete this.cache[key];
    }
  }

  listAll() {
    console.log('[all srx]', this.cache);
  }

}
