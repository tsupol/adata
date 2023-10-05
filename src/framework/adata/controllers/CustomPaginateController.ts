import {BaseListingClass} from './BaseListingClass';
import {IProviderProps} from './adata-types';

export class CustomPaginateController extends BaseListingClass {
  providers: IProviderProps;

  constructor(providers: IProviderProps, endpoint: string) {
    super({c: ''});
    this.providers = providers;
    const {api} = providers;
    this.params.subscribe((params) => {
      api.post(endpoint, {}).then((res) => {
        this.onChanged(res.data);
      });
    });
  }
}
