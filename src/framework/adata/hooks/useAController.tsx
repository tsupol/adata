import { useADataContext } from '../ADataContext';
import { useEffect, useState } from 'react';
import { PaginateController } from '../controllers/PaginateController';
import { IListingParams } from '../controllers/BaseListingClass';
import { AController } from '../controllers/AController';
import { IContextMenuItem } from '../../aui/components/ctx-menu/CtxMenuButton';
import { ActionHandler, ListContentFn } from '../controllers/adata-types';

interface AControllerProps {
  pagination?: IListingParams,
  c: string,
  ctxMenuActions?: (v: any) => IContextMenuItem[];
  bulkActions?: IContextMenuItem[];
  anyActions?: (v: any) => any[];
  actionHandler?: ActionHandler;
  listComponentFn?: ListContentFn;
  listClassName?: string;
  listContentFn?: ListContentFn;
  filterComponentFn?: (ac: AController) => JSX.Element;
}

export const useAController = ({
                                 pagination,
                                 c,
                                 actionHandler,
                                 ctxMenuActions,
                                 bulkActions,
                                 listComponentFn,
                                 listClassName,
                                 listContentFn,
                                 filterComponentFn,
                               }: AControllerProps, deps: any[] = []) => {
  const { aDataProviders } = useADataContext();
  const [aController, setAController] = useState<AController>();
  useEffect(() => {
    const dataController = new PaginateController(aDataProviders, pagination);
    const aController = new AController(
      dataController,
      aDataProviders,
      c,
      actionHandler,
      ctxMenuActions,
      bulkActions,
    );
    if (listClassName) {
      aController.setListClassName(listClassName);
    }
    if (listComponentFn) {
      aController.setListComponentFn(listComponentFn);
    }
    if (listContentFn) {
      aController.setListContentFn(listContentFn);
    }
    if (filterComponentFn) {
      aController.setFilterComponent(filterComponentFn);
    }
    setAController(aController);
    return () => aController.destroy();
  }, deps);
  return aController;
};
