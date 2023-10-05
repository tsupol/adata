import { Image } from '../Image';
import React from 'react';
import { UiEvent } from '../../services/ui-service';
import { useAuiContext } from '../../AuiContext';
import { LineLimiter } from '../LineLimiter';
import { useSrx } from '../../lib/SimpleRx';
import { CtxMenuButton, IContextMenuItem } from '../ctx-menu/CtxMenuButton';

export const ListItemHorizontal = (
  {
    dataRx,
    selected,
    checkbox = false,
    actions = [],
    listTransform = (v: any) => v,
    listContentComponent,
    prefix,
  }: {
    dataRx: any,
    selected?: boolean,
    checkbox?: boolean,
    listTransform?: (v: any) => any | Promise<any>,
    listContentComponent?: (v: any) => any | Promise<any>,
    prefix: string,
    actions?: IContextMenuItem[] | ((v: any) => IContextMenuItem[])
  }) => {

  const { ui, adapter } = useAuiContext();
  const [data] = useSrx(dataRx);

  let theActions = typeof actions === 'function' ? actions(data) : actions;

  return (
    <div className="bg-z1 p-2">
      <div className="flex">
        {checkbox ? (
          <div onClick={() => ui.dispatchUiEvent({ key: prefix, data }, UiEvent.List)}>
            <div className={`checkbox checkbox-plain !pr-0 ${selected ? 'checked' : ''}`}>
              <div className="checkbox-checker !mr-0">
                {adapter?.checkmark}
              </div>
            </div>
          </div>
        ) : null}
        <>
          {listContentComponent ? listContentComponent(data) :
            <ListContent data={data} listTransform={listTransform}/>}
        </>
        <div className="ml-auto flex items-end justify-center w-8">
          <div>
            <CtxMenuButton prefix={prefix} data={dataRx.value} actions={theActions}/>
          </div>
        </div>
      </div>
    </div>
  );
};

const ListContent = ({ data: rawData, listTransform }: any) => {
  const data = listTransform ? listTransform(rawData) : rawData;
  return <>
    {data.image ? (
      <Image className="li-hor-img" alt={`${data._id}`} src={data.image}/>
    ) : null}
    <div className="li-hor-content">
      {data.title ? (
        <div>{data.title}</div>
      ) : null}
      {data.desc ? (
        <LineLimiter className="text-fade">{data.desc}</LineLimiter>
      ) : null}
    </div>
  </>;

};
