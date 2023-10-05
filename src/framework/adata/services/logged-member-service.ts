import { DbService } from './db-service';
import { BehaviorSubject, debounceTime, shareReplay } from 'rxjs';
import { StorageService } from './storage-service';
import { SimpleRx, useSrx } from '../../aui/lib/SimpleRx';
import { useADataContext } from '../ADataContext';
import { ApiService } from './api-service';
import { CredentialService } from './credential-service';
import { SchemaService } from "./schema-service";

export interface IUser {
  _id: string,

  [key: string]: any;
}

export interface IUserMore {
  _id: string,
  addresses?: any,

  [key: string]: any;
}

export enum LoggedUserStatus {
  Unauthorized,
  Authorized,
  Checking,
}

export class LoggedMemberService {

  userRx: SimpleRx<any>;
  userMoreRx: SimpleRx<IUserMore>;
  db: DbService;
  dataSubject: any = new BehaviorSubject(null);
  data = this.dataSubject.pipe(debounceTime(1), shareReplay(1));
  storage: StorageService;
  statusRx: SimpleRx<LoggedUserStatus>;
  api: ApiService;
  credential: CredentialService;
  schema: SchemaService;

  constructor(schema: SchemaService, db: DbService, storage: StorageService, api: ApiService, credential: CredentialService) {
    this.schema = schema;
    this.db = db;
    this.userRx = new SimpleRx();
    this.userMoreRx = new SimpleRx();
    this.credential = credential;
    this.storage = storage;
    this.statusRx = new SimpleRx(LoggedUserStatus.Checking);
    this.api = api;
    this.init();
  }

  async init() {
    this.credential.credentialRx.subscribe((cred: any) => {
      if (!cred.isChecking) {
        // start fetching new user after the storedUser is updated
        if (cred?.member) {
          this.db.findOne(this.schema.entityCnf.member, cred.member, (res: any) => {
            this.userRx.next(res);
          }, false, true);
          this.db.findOne(this.schema.entityCnf.memberMore, {
            [this.schema.entityCnf.member]: cred.member
          }, (res: any) => {
            this.userMoreRx.next(res);
          }, false, true);
          this.statusRx.next(LoggedUserStatus.Authorized);
        } else {
          this.userRx.next(null);
          this.userMoreRx.next(null);
          this.statusRx.next(LoggedUserStatus.Unauthorized);
        }
      }
    });
  }

  getUserMore() {
    return this.userMoreRx.getValue();
  }

  getUser() {
    return this.userRx.getValue();
  }

}

export const useLoggedMember = (): any => {
  const { lm } = useADataContext();
  const [member] = useSrx(lm.userRx);
  return member;
};
