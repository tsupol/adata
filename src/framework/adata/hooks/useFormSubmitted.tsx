import { useUiEvent } from '../../aui/lib/SimpleRx';
import { UiEvent } from '../../aui/services/ui-service';

export const useFormSubmitted = (id: string, fn: (v: any) => any) => {
  useUiEvent(UiEvent.FormSubmit, async (e: any) => {
    if (e.detail.key === id) {
      fn(e.detail.data);
    }
  });
};
