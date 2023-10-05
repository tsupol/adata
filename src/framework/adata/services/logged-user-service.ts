import {DbService} from './db-service';
import {BehaviorSubject, debounceTime, shareReplay} from 'rxjs';
import {StorageService} from './storage-service';
import {SimpleRx} from '../../aui/lib/SimpleRx';
import {ApiService} from './api-service';
import {CredentialService} from './credential-service';
import {SchemaService} from "./schema-service";

export enum LoggedAdminStatus {
  Unauthorized,
  Authorized,
  Checking,
}


export class LoggedUserService {

  luRx: SimpleRx<any>;
  db: DbService;
  dataSubject: any = new BehaviorSubject(null);
  data = this.dataSubject.pipe(debounceTime(1), shareReplay(1));
  storage: StorageService;
  statusRx: SimpleRx<LoggedAdminStatus>;
  api: ApiService;
  credential: CredentialService;
  schema: SchemaService;

  constructor(schema: SchemaService, db: DbService, storage: StorageService, api: ApiService, credential: CredentialService) {
    this.schema = schema;
    this.db = db;
    this.luRx = new SimpleRx();
    this.credential = credential;
    this.storage = storage;
    this.statusRx = new SimpleRx(LoggedAdminStatus.Checking);
    this.api = api;
    this.init();
  }

  async init() {
    this.credential.credentialRx.subscribe((cred: any) => {
      if (cred.isLoggedIn) {
        if (cred?.user) {
          this.db.findOne(this.schema.entityCnf.user, cred.user, (res: any) => {
            this.luRx.next(res);
          });
          this.statusRx.next(LoggedAdminStatus.Authorized);
        } else {
          this.luRx.next(null);
          this.statusRx.next(LoggedAdminStatus.Unauthorized);
        }
      }
    });
  }

}
