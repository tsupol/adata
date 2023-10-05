import { IContextMenuItem } from '../../aui/components/ctx-menu/CtxMenuButton';
import { BaseListingClass } from './BaseListingClass';
import { ActionHandler, IProviderProps, ListContentFn } from './adata-types';

type CustomLabel = {
  create: string
}

export class AController {

  ctxMenuActions?: (v: any) => IContextMenuItem[];
  bulkActions?: IContextMenuItem[];
  anyActions?: (v: any) => any[];
  actionHandler?: ActionHandler;
  dataController: BaseListingClass;
  providers: IProviderProps;
  c: string;
  filterComponentFn: ((ac: AController) => JSX.Element) | null = null;
  listClassName?: string;
  listComponentFn: ListContentFn | null = null;
  listContentFn: ListContentFn | null = null;
  customLabel: CustomLabel = {
    create: ''
  };

  constructor(
    dataController: BaseListingClass,
    providers: IProviderProps,
    c: string,
    actionHandler?: ActionHandler,
    ctxMenuActions?: (v: any) => IContextMenuItem[],
    bulkActions?: IContextMenuItem[],
  ) {
    if (actionHandler) {
      this.actionHandler = actionHandler;
    }
    if (ctxMenuActions) {
      this.ctxMenuActions = ctxMenuActions;
    }
    if (bulkActions) {
      this.bulkActions = bulkActions;
    }
    this.c = c;
    this.dataController = dataController;
    this.providers = providers;
  }

  dispatchAction(action: string, data?: any) {
    this.actionHandler?.(this, action, data);
  }

  setListClassName(className: string) {
    this.listClassName = className;
  }

  setCtxMenuActions(ctxMenuActions: (v: any) => IContextMenuItem[]) {
    this.ctxMenuActions = ctxMenuActions;
  }

  setBulkActions(bulkActions: IContextMenuItem[]) {
    this.bulkActions = bulkActions;
  }

  setAnyActions(anyActions: (v: any) => any[]) {
    this.anyActions = anyActions;
  }

  setFilterComponent(comp: (ac: AController) => JSX.Element) {
    this.filterComponentFn = comp;
  }

  setListComponentFn(fn: ListContentFn) {
    this.listComponentFn = fn;
  }

  setListContentFn(fn: ListContentFn) {
    this.listContentFn = fn;
  }

  setCustomLabel(key: keyof CustomLabel, value: string) {
    this.customLabel[key] = value;
  }

  setActionHandler(v: ActionHandler) {
    this.actionHandler = v
  }

  destroy() {
    if (this.dataController?.destroy) {
      this.dataController.destroy();
    }
  }
}
