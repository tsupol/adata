import { BaseListingClass, IListingParams } from './BaseListingClass';
import { IProviderProps } from './adata-types';


export class PaginateController extends BaseListingClass {
  providers: IProviderProps;

  constructor(providers: IProviderProps, params?: IListingParams) {
    super(params);
    this.providers = providers;
    const { db } = providers;
    this.params.subscribe((v) => {
      if (v) {
        db.paginate.paginate(v).then((v: any) => {
          this.onChanged(v);
        });
      }
    });
    db.paginate.invalidated$.subscribe(({ c }) => {
      const currentParams = this.getParams();
      if (currentParams && currentParams.c === c) {
        db.paginate.paginate(currentParams).then((v: any) => {
          this.onChanged(v);
        });
      }
    });
  }
}
