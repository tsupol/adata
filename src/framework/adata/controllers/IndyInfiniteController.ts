import { BaseListingClass, IListingParams } from './BaseListingClass';
import { IProviderProps } from './adata-types';

const DefaultPerPage = 10;

export class IndyInfiniteController extends BaseListingClass {
  providers: IProviderProps;
  list: any[] = [];
  total = 0;

  constructor(providers: IProviderProps, params?: IListingParams) {
    super(params);
    this.providers = providers;
    this.params.subscribe(() => {
      this.fetchMore();
    });
  }

  async fetchMore() {
    const params = this.paramsSubject.getValue();
    if (params) {
      try {
        if (!params.sort) {
          throw new Error('missing sort');
        }
        const c = params.c;
        const sortKey = Object.keys(params.sort)?.[0];
        const fp = { ...(params.filter || {}) };
        if (this.list.length) {
          fp[sortKey] = { [params.sort[sortKey] === 1 ? '$gt' : '$lt']: this.list[this.list.length - 1].value[sortKey] };
        }
        const res = await this.providers.api.infinite({ c, p: params.perPage || DefaultPerPage, f: params.filter, fp, s: params.sort });
        if (res) {
          this.list = [...this.list, ...res.list];
          this.total = res.total;
          this.dataSubject.next({ list: this.list, total: this.total });
        } else {
          throw new Error('cannot fetch infinite');
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
}
