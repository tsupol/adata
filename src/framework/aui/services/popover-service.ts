import { UiEvent, UiService } from './ui-service';
import { SimpleRx } from '../lib/SimpleRx';
import { randomString } from 'megaloutils';
import { SimpleModalParams } from './modal-service';

export class PopoverService {
  ui: UiService;
  currentItemsRx = new SimpleRx<any>([], false);

  constructor(ui: UiService) {
    this.ui = ui;
  }

  present(data: SimpleModalParams) {
    if (!data.id) {
      data.id = randomString(10, 'a#');
    }
    this.currentItemsRx.next([...this.currentItemsRx.value, data]);
    setTimeout(() => {
      this.ui.dispatchUiEvent({ key: data.id, data }, UiEvent.ModalPresent);
    }, 100);
  }

  dismiss(id: string) {
    for (let i = 0; i < this.currentItemsRx.value.length; i++) {
      if (this.currentItemsRx.value[i].id === id) {
        this.ui.dispatchUiEvent({ key: id }, UiEvent.ModalDismiss);
        setTimeout(() => {
          this.currentItemsRx.value.splice(i, 1);
          this.currentItemsRx.next([...this.currentItemsRx.value]);
        }, 300);
        return;
      }
    }
  }
}
