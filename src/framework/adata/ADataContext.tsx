import React from 'react';
import {createContext, useContext, useReducer, useEffect} from "react";
import {objMergeDeepNoOverride} from "megaloutils";
import {OptionsService} from './services/options-service';
import {SchemaService} from './services/schema-service';
import {LoggedMemberService} from './services/logged-member-service';
import {DbService} from './services/db-service';
import {StorageService} from './services/storage-service';
import {LoggedUserService} from './services/logged-user-service';
import {useAuiContext} from '../aui/AuiContext';
import {ApiService} from './services/api-service';
import {CredentialService} from './services/credential-service';
import {useErrorHandler} from '../aui/hooks/useErrorHandler';
import {DebugService} from './services/debug-service';
import {FormService} from "./services/form-service";
import { AppearanceService } from "../aui/services/appearance-service";

enum InitState {
  None = 1,
  StorageInitialized,
  Authorized,
  Done
}

export interface ADataProps {
  dispatchAData?: any;
  schemaService: SchemaService;
  credential: CredentialService;
  db: DbService;
  lm: LoggedMemberService;
  lu: LoggedUserService;
  appearanceService: AppearanceService;
  optionsService: OptionsService;
  formService: FormService;
  storage: StorageService;
  api: ApiService;
  debug: DebugService;
  aDataProviders: any;
  errorHandler: (v: any) => any;
  aDataReady: boolean;
  initState: InitState;
  withModals: boolean;
  schema: ISchema;
  apiCnf: IApiCnf;
}

export interface IFieldCnf {
  image: any[]
  gallery: any[]
}

export interface IEntityCnf {
  user: string,
  member: string,
  userMore: string,
  memberMore: string,
}

export interface ISchema {
  fieldCnf: IFieldCnf,
  entityCnf: IEntityCnf,
  structure: any,
}

export interface IApiCnf {
  serverUrl: string,
  credential: string,
}

interface Props {
  children: any,
  apiCnf: IApiCnf,
  schema: ISchema,
}


// for required fields (e.g. notify) trick for strict typescript
export const getADataValueInitializerForType = () => ({
  dispatchAData: null,
  schemaService: {} as SchemaService,
  credential: {} as CredentialService,
  db: {} as DbService,
  formService: {} as FormService,
  lm: {} as LoggedMemberService,
  lu: {} as LoggedUserService,
  storage: {} as StorageService,
  optionsService: {} as OptionsService,
  appearanceService: {} as AppearanceService,
  api: {} as ApiService,
  debug: {} as DebugService,
  aDataProviders: {} as any,
  errorHandler: async (v: any) => v,
  aDataReady: false,
  initState: InitState.None,
  withModals: true,
  schema: {
    fieldCnf: {
      image: ['image'],
      gallery: ['gallery']
    },
    entityCnf: {
      user: 'user',
      member: 'member',
      userMore: 'userMore',
      memberMore: 'memberMore'
    },
    structure: {}
  },
  apiCnf: {
    serverUrl: '/',
    credential: '',
  },
});

const ADataContext = createContext<ADataProps>(getADataValueInitializerForType());

export const ADataProvider = ({apiCnf, schema, children}: Props) => {

  const [state, dispatch] = useReducer((state: any, action: any) => {
    const payload = action.payload;
    switch (action.type) {
      case "SET_STATE":
        return objMergeDeepNoOverride(state, {...payload});
      default:
        return state;
    }
  }, {
    initState: InitState.None
  });

  const {ui, adapter, uiCnf} = useAuiContext();
  const {errorHandler} = useErrorHandler();

  useEffect(() => {
    if (state.initState === InitState.None) {
      if (ui) {
        const init = async () => {
          const storage = new StorageService(adapter);
          await storage.initStorage();
          const credential = new CredentialService(storage);
          const api = new ApiService(apiCnf, storage, credential);
          const formService = new FormService(ui);
          const debug = new DebugService(api);
          const schemaService = new SchemaService(schema);
          const appearanceService = new AppearanceService(storage, uiCnf, adapter);
          const db = new DbService(schemaService, api, ui);
          const lm = new LoggedMemberService(schemaService, db, storage, api, credential);
          const lu = new LoggedUserService(schemaService, db, storage, api, credential);
          const optionsService = new OptionsService(db, api);
          const aDataProviders = {
            db, lm, admin: lu, ui, api, errorHandler
          };
          dispatch({
            type: "SET_STATE",
            payload: {
              schemaService,
              credential,
              formService,
              db,
              lm,
              lu,
              optionsService,
              appearanceService,
              storage,
              api,
              debug,
              aDataProviders,
              errorHandler,
              aDataReady: true,
              initState: InitState.Done
            },
          });
        };
        init();
        return () => {
          state?.db?.destroy();
        };
      }
    }
  }, [ui, state, errorHandler, adapter, uiCnf]);

  return (
    <ADataContext.Provider
      value={{
        ...state,
        dispatchAData: dispatch,
      }}>
      {state.aDataReady && (
        <>
          {children}
        </>
      )}
    </ADataContext.Provider>
  );
};

export const useADataContext = () => {
  const context: ADataProps = useContext(ADataContext);
  const {dispatchAData} = context;
  return {
    ...context,
    setMegaState: (payload: any) => {
      dispatchAData({
        type: "SET_STATE",
        payload,
      });
    },
  };
};
