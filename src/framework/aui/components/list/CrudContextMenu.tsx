import { CtxMenuButton, ICrudContextMenu } from '../ctx-menu/CtxMenuButton';
import React from 'react';

export const CrudContextMenu = ({
                                  menuId,
                                  data,
                                  controller,
                                  actions = []
                                }: ICrudContextMenu) => {
  return (
    <CtxMenuButton controller={controller} prefix={menuId} actions={actions} data={data}/>
  );
};
