import { UiEvent, UiService } from './ui-service';
import { SimpleRx } from '../lib/SimpleRx';
import { randomString } from 'megaloutils';

export enum ModalType {
  Modal,
  MobilePage,
  DrawerLeft,
  DrawerRight,
}

export interface ModalConfirmParams {
  onConfirm: () => void,
  onCancel?: () => void,
  title?: any,
  confirmLabel?: string,
  cancelLabel?: string,
}

export interface SimpleModalParams {
  id?: string;
  title?: any;
  component?: any; // entirety
  content?: any | JSX.Element | ((modalId: string) => any);
  formId?: string;
  form?: any[] | JSX.Element | ((v: any) => any);
  onSubmit?: (v: any) => any;
  onConfirm?: () => any;
  className?: string;
  contentClassName?: string;
  buttons?: any[];
  type?: ModalType;
}


export class ModalService {

  modals: any = {};
  currentModalRx = new SimpleRx<any>([], false);
  ui: UiService;

  constructor(ui: UiService) {
    this.ui = ui;
  }

  form(params: SimpleModalParams) {
    if (params.form) {
      if (!params.formId) {
        params.formId = randomString(10, 'a#');
      }
    }
    this.present(params);
  }

  confirm(params: ModalConfirmParams) {
    if (!params.onConfirm) {
      throw new Error('missing .onConfirm');
    }
    if (!params.title) {
      params.title = 'Are you sure?';
    }
    this.present(params as SimpleModalParams);
  }

  // New
  // ----------------------------------------
  present(data: SimpleModalParams) {
    if (!data.id) {
      data.id = randomString(10, 'a#');
    }
    this.currentModalRx.next([...this.currentModalRx.value, data]);
    setTimeout(() => {
      this.ui.dispatchUiEvent({ key: data.id, data }, UiEvent.ModalPresent);
    }, 100);
  }

  dismiss(id: string) {
    for (let i = 0; i < this.currentModalRx.value.length; i++) {
      if (this.currentModalRx.value[i].id === id) {
        this.ui.dispatchUiEvent({ key: id }, UiEvent.ModalDismiss);
        setTimeout(() => {
          this.currentModalRx.value.splice(i, 1);
          this.currentModalRx.next([...this.currentModalRx.value]);
        }, 300);
        return;
      }
    }
  }


}
