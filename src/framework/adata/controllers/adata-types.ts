import { DbService } from '../services/db-service';
import { UiService } from '../../aui/services/ui-service';
import { ApiService } from '../services/api-service';
import { BaseListingClass } from './BaseListingClass';
import { AController } from './AController';

export interface IProviderProps {
  db: DbService,
  ui: UiService,
  api: ApiService,
  errorHandler: (v: any) => any,
}

export interface IProvider extends IProviderProps {
  controller: BaseListingClass;
}

export type ActionHandler = (aCtrl: AController, action: string, data: any) => any

export type ListContentFn = (v: any, aCtrl: AController) => JSX.Element
