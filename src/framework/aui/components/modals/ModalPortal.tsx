import React, {useMemo, useState} from 'react';
import {useSrxFn} from '../../lib/SimpleRx';
import {useAuiContext} from '../../AuiContext';
import {ModalTemplate} from './ModalTemplate';
import {ModalType, SimpleModalParams} from '../../services/modal-service';
import {Button} from '../Button';
import {createHash, toClassName} from 'megaloutils';
import {RrxFormDisplay} from '../../../adata/components/rrxforms/RrxFormDisplay';
import {useConstructForm} from '../../../adata/hooks/useConstructForm';
import {translate} from '../../lib/aui-utils';
import {Icon} from '../Icon';
import {useADataContext} from "../../../adata/ADataContext";

export enum KnowButton {
  Cancel,
  FormSubmit,
  Confirm,
}

export const ModalPortal = () => {
  const {ui} = useAuiContext();
  const [modalList, setModalList] = useState<string[]>([]);
  const [modals, setModals] = useState<any[]>([]);

  useSrxFn(ui?.modals?.currentModalRx, (currentModals: ModalGeneratorParams[]) => {

    // All these are to prevent rerender.

    if (!(currentModals)) return;

    // add
    for (const currentModal of currentModals) {
      if (!modalList.includes(currentModal.id)) {
        modals.push(<ModalGenerator key={currentModal.id} {...currentModal}/>);
        modalList.push(currentModal.id);
      }
    }

    // remove
    const newModalHash = createHash(currentModals, 'id');
    for (let i = modalList.length - 1; i >= 0; i--) {
      if (!newModalHash[modalList[i]]) {
        modals.splice(i, 1);
        modalList.splice(i, 1);
      }
    }

    setModalList(modalList);
    setModals([...modals]);
  });

  return (
    <div className="modal-portal">
      {modals}
    </div>
  );
};

interface ModalGeneratorParams extends SimpleModalParams {
  id: string;
}

export const ModalGenerator = ({
                                 id,
                                 form,
                                 formId,
                                 onSubmit,
                                 onConfirm,
                                 title,
                                 contentClassName,
                                 content,
                                 buttons,
                                 className,
                                 component,
                                 type
                               }: ModalGeneratorParams) => {

  const {ui} = useAuiContext();
  const {formService} = useADataContext();
  const {t} = useAuiContext();

  const theButtons = useMemo(() => {
    if (!buttons?.length) {
      const buttons: any[] = [];
      if (!buttons.includes(KnowButton.Cancel)) {
        buttons.push(KnowButton.Cancel);
      }
      if (form) {
        if (!buttons.includes(KnowButton.FormSubmit)) {
          buttons.push(KnowButton.FormSubmit);
        }
      } else if (onConfirm) {
        if (!buttons.includes(KnowButton.Confirm)) {
          buttons.push(KnowButton.Confirm);
        }
      }
      return buttons;
    }
    return buttons;
  }, [buttons, form, onConfirm]);

  return (
    <ModalTemplate modalId={id} type={type} className={toClassName(form ? 'w-full max-w-lg' : null, className)}>
      {component ? (typeof component === 'function' ? component() : component) : <>
        {type === ModalType.MobilePage ? (
          <div className="modal-toolbar">
            <div className="modal-toolbar-back" onClick={() => ui.modals.dismiss(id)}>
              <Icon name="arrow-back-outline" className="text-primary text-2xl"/>
              {title ? <div>{title}</div> : null}
            </div>
          </div>
        ) : <>
          {title && (
            <div className="modal-header">
              {typeof title === 'function' ? title() : translate(title, t)}
            </div>
          )}
        </>}
        {content ? (
          <div className="modal-content-wrap">
            <div className={toClassName('modal-content', contentClassName)}>
              {typeof content === 'function' ? content(id) : content}
            </div>
          </div>
        ) : form ? (
          <div className={toClassName('modal-content', contentClassName)}>
            {typeof form === 'function'
              ? form(formId)
              : Array.isArray(form)
                ? <GeneratedForm form={form} formId={formId}/>
                : form}
          </div>
        ) : null}
        {(theButtons.length && type !== ModalType.MobilePage) && (
          <div className="modal-footer">
            <div className="ml-auto">
              <div className="mason-2">
                {theButtons?.length && theButtons.map((btn: any, idx: number) => {
                  if (btn === KnowButton.Cancel) {
                    return (
                      <div className="mason-item" key={idx}>
                        <Button onClick={() => ui.modals.dismiss(id)} color="danger">
                          {t('data:close')}
                        </Button>
                      </div>
                    );
                  } else if (btn === KnowButton.FormSubmit) {
                    return (
                      <div className="mason-item" key={idx}>
                        <Button onClick={async () => {
                          if (formId) {
                            const value = await formService.submitForm(formId);
                            if (value && typeof onSubmit === 'function') {
                              onSubmit(value);
                              ui.modals.dismiss(id);
                            }
                          }
                        }} color="success">
                          {t('data:submit')}
                        </Button>
                      </div>
                    );
                  } else if (btn === KnowButton.Confirm) {
                    return (
                      <div className="mason-item" key={idx}>
                        <Button onClick={() => {
                          if (typeof onConfirm === 'function') {
                            onConfirm();
                            ui.modals.dismiss(id);
                          }
                        }} color="success">
                          {t('data:confirm')}
                        </Button>
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="mason-item">
                      {btn}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </>}
    </ModalTemplate>
  );
};

const GeneratedForm = ({form, formId}: any) => {
  useConstructForm(formId, form);
  return (
    <RrxFormDisplay id={formId}/>
  );
};
