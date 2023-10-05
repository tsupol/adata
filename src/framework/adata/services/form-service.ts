import { RrxForm } from '../components/rrxforms/rrx-form';
import { SimpleRx } from '../../aui/lib/SimpleRx';
import { UiService } from '../../aui/services/ui-service';

export class FormService {

  ui: UiService;
  forms: { [key: string]: SimpleRx<RrxForm> } = {};

  constructor(ui: UiService) {
    this.ui = ui;
  }

  createForm(formId: string, fields: any[]): RrxForm {
    return new RrxForm(formId, fields, this.ui);
  }

  async submitForm(id: string) {
    const form = this.get(id).value;
    return await form?.submit();
  }

  patchFormValue(id: string, values: any) {
    this.get(id)?.value?.patchValue(values);
  }

  get(id: string) {
    if (!this.forms[id]) {
      this.forms[id] = new SimpleRx();
    }
    return this.forms[id];
  }

  set(id: string, form: RrxForm) {
    if (id === undefined) return null;
    if (!this.forms[id]) {
      this.forms[id] = new SimpleRx();
    }
    this.forms[id].next(form);
    return this.forms[id];
  }

  unset(id: string) {
    if (this.forms[id]) {
      if (this.forms[id].value instanceof RrxForm) {
        (this.forms[id].value as RrxForm).destroy();
      }
      delete this.forms[id];
    }
  }
}
