import { useAuiContext } from '../../AuiContext';
import React, { useMemo } from 'react';
import { UiEvent } from '../../services/ui-service';
import { Icon } from '../Icon';
import { translate } from '../../lib/aui-utils';
import { toClassName } from 'megaloutils';

export const CtxMenu = ({ prefix, actions, row, setIsPopoverOpen, controller }: any) => {
  const { ui, t } = useAuiContext();

  const elems = useMemo(() => {
    try {
      const elems = [];
      if (actions) {
        const handleClick = (action: any) => {
          if (controller?.dispatchAction) {
            controller.dispatchAction(action.actionId, row);
          }
          ui.dispatchUiEvent({
            key: prefix ? `${prefix}-${action.actionId}` : (action.id || action.actionId),
            data: row
          }, UiEvent.ContextMenu);
        };

        for (const action of actions) {
          const { id, actionId, icon, label, className } = action;
          elems.push(
            <li key={id || actionId} className={toClassName('ctx-menu-item', className)} onClick={() => {
              handleClick(action);
              setIsPopoverOpen(false);
            }}>
              <div className="ctx-menu-icon">{
                icon ? <Icon name={icon}/> : ''
              }</div>
              <div className="ctx-menu-label">{translate(label, t)}</div>
            </li>
          );
        }
      }
      return elems;
    } catch (err) {
      console.error('err', err);
    }
  }, [actions, setIsPopoverOpen, row, ui, controller, t, prefix]);


  let moreClassname = 'no-icon';
  for (const action of actions) {
    if (action.icon) {
      moreClassname = '';
      break;
    }
  }

  return (
    <div className="bg-gray-700 shadow-xl">
      <ul className={toClassName('ctx-menu', moreClassname)}>
        {elems}
      </ul>
    </div>
  );
};
