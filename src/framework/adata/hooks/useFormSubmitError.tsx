import {useUiEvent} from '../../aui/lib/SimpleRx';
import {UiEvent} from '../../aui/services/ui-service';
import {useAuiContext} from '../../aui/AuiContext';

export const useFormSubmitError = (id: string, fn: (v: any) => any) => {
  useUiEvent(UiEvent.FormSubmitError, async (e: any) => {
    if (e.detail.key === id) {
      fn(e.detail.data);
    }
  });
};

export const useFormSubmitErrorNotify = (id: string) => {
  const {ui, t} = useAuiContext();
  useUiEvent(UiEvent.FormSubmitError, async (e: any) => {
    if (e.detail.key === id) {
      ui.notify.error(t(`data:e.${Object.keys(e.detail.data.error)?.[0]}`, {sub: t(`data:${e.detail.data.field}`)}));
    }
  });
};
