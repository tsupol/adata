import React from 'react';
import {useSrx} from '../../lib/SimpleRx';
import {useObservable} from '../../hooks/useObservable';
import {CtxMenuButton, IContextMenuItem} from '../ctx-menu/CtxMenuButton';
import {AController} from '../../../adata/controllers/AController';
import {useAuiContext} from "../../AuiContext";

export const SelectableListItem = (
  {
    aController,
    dataRx,
    checkbox = false,
    actions = [],
  }: {
    aController: AController
    dataRx: any,
    checkbox?: boolean,
    actions?: IContextMenuItem[] | ((v: any) => IContextMenuItem[])
  }) => {

  const {adapter} = useAuiContext();
  const [data] = useSrx<any>(dataRx);
  const [selectedList] = useObservable(aController.dataController.selected);

  const theActions = typeof actions === 'function' ? actions(data) : actions;

  const onSelect = () => {
    aController.dataController.onSelect(data);
  };

  if (!(data && selectedList)) return null;

  return (
    <div className="bg-z1 p-2">
      <div className="flex">
        {checkbox ? (
          <div onClick={onSelect}>
            <div className={`checkbox checkbox-plain !pr-3 ${selectedList.includes(data) ? 'checked' : ''}`}>
              <div className="checkbox-checker !mr-0">
                {adapter?.checkmark}
              </div>
            </div>
          </div>
        ) : null}
        <>
          {aController.listContentFn ? aController.listContentFn(data, aController) : null}
        </>
        {
          theActions?.length ?
            <div className="ml-auto flex items-end justify-center w-8">
              <div className="mt-1">
                <CtxMenuButton controller={aController} actions={theActions} data={data}/>
              </div>
            </div> : null
        }
      </div>
    </div>
  );
};
