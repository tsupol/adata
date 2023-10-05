import {AxiosError} from 'axios';
import {useAuiContext} from '../AuiContext';

export const useErrorHandler = () => {

  const {ui, t} = useAuiContext();

  return {
    errorHandler: async (fn: () => void) => {
      try {
        await fn();
        ui.notify.success(t('data:operation_success'));
      } catch (err) {
        if (err instanceof AxiosError) {
          if (err?.response?.data?.message) {
            const split = err.response.data.message.split('??');
            if (split.length > 1) {
              if (split[1].split('&&').length > 1) {
                const subs = split[1].split('&&');
                ui.notify.error(t(`data:e.${split[0]}`, {sub: subs[0], obj: subs[1]}));
              } else {
                ui.notify.error(t(`data:e.${split[0]}`, {sub: split[1]}));
              }
            } else {
              ui.notify.error(t(`data:e.${err.response.data.message}`).toString().replace(/^e./, ''));
            }
            return;
          }
        }
        ui.notify.error(t('data:operation_failed'));
      }
    }
  };
};
