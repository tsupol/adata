import {IAdapter} from "../../aui/AuiContext";

export class StorageService {

  storage: any;
  adapter: IAdapter

  constructor(adapter: IAdapter) {
    this.adapter = adapter
    this.storage = {};
  }

  async initStorage() {
    const store = new this.adapter.storage();
    this.storage = await store.create();
  }

  set(key: string, value: any) {
    return this.storage.set(key, value);
  }

  get(key: string) {
    return this.storage.get(key);
  }

  remove(key: string) {
    return this.storage.remove(key);
  }
}
