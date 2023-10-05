import { UiService } from '../services/ui-service';
import { SrxService } from '../services/srx-service';
import { RrxForm } from '../../adata/components/rrxforms/rrx-form';

export class SrxFormService {

  ui: UiService;
  srx: SrxService;

  constructor(ui: UiService, srx: SrxService) {
    this.ui = ui;
    this.srx = srx;
  }

  submitForm(id: string) {
    console.log('this.srx', this.srx);
    const form = this.srx.get(id).getValue();
    return form?.submit();
  }

  patchFormValue(id: string, values: any) {
    (this.srx.get(id)?.value as RrxForm)?.patchValue(values);
  }

}
