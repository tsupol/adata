import React from 'react';
import { createContext, useContext, useEffect, useReducer, useRef, FC, useState } from "react";
import { NotificationProvider, useNotification } from './components/notification/Notification';
import { objMergeDeepNoOverride } from 'megaloutils';
import { GeneralUiService } from './context/GeneralUiService';
import { SrxService } from './services/srx-service';
import { UiService } from './services/ui-service';
import { ToolbarController } from './components/controllers/ToolbarController';

interface IComponentParam {
  button?: (...args: any[]) => any;
}

export interface IAdapter {
  storage: any;
  checkmark: JSX.Element;
  iconComponentFn: (p: any) => JSX.Element;
  buttonComponentFn?: (p: any) => JSX.Element;
  iconList: any;
  changeLanguage: (l: any) => void;
}

export interface AuiProps {
  dispatchAui?: any;
  children?: any;

  // usable
  cssVars?: any;
  ui: UiService;
  srx: SrxService;
  toolbarController: ToolbarController;
  t: (...args: any[]) => any;

  // setting up
  getCssVariables?: () => any;
  getImagePath: (v: any) => any;
  uiCnf: IUiCnf;
  components?: IComponentParam;
  adapter: IAdapter;
}

export interface IUiCnf {
  breakpoints: any,
  themeMode: string,
  lang: string,
}

type Action =
  | { type: "SET_CSS_VARS"; payload: any }
  | { type: "SET_Aui_DATA"; payload: any }
  | { type: "SET_STATE"; payload: any }
  ;

export const getAuiInitialValueForType = () => ({
  srx: {} as SrxService,
  ui: {} as UiService,
  toolbarController: {} as ToolbarController,
  t: (s: string) => s,
  adapter: {} as IAdapter,
  uiCnf: {} as IUiCnf,
  getImagePath: (v: any) => v
});

export const AuiContext = createContext<AuiProps>(getAuiInitialValueForType());

const theReducer = (state: AuiProps, action: Action) => {
  switch (action.type) {
    case "SET_CSS_VARS":
      return {
        ...state,
        cssVars: action.payload,
      };
    case "SET_STATE":
      return objMergeDeepNoOverride(state, action.payload);
    default:
      return { ...state };
  }
};

const ProviderInitializer = ({ uiCnf, t, adapter }: any) => {
  const notify = useNotification();
  const { setAuiState } = useAuiContext();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && notify) {
      const srx = new SrxService();
      const ui = new UiService(notify, srx, uiCnf);
      const toolbarController = new ToolbarController();
      setAuiState({
        ui,
        srx,
        uiCnf,
        toolbarController,
        adapter,
        t
      });
      setInitialized(true);
    }
  }, [uiCnf, notify, setAuiState, initialized, t]);

  return <></>;
};

export const AuiProvider: FC<AuiProps> = ({ children, uiCnf, getImagePath, getCssVariables, t, adapter }) => {
  const [state, dispatch] = useReducer(theReducer, {});
  const isClientInit = useRef(false);

  if (!isClientInit.current && getCssVariables) {
    if (typeof getComputedStyle !== 'undefined') {
      isClientInit.current = true;
      dispatch({
        type: 'SET_CSS_VARS',
        payload: getCssVariables(),
      });
      dispatch({
        type: 'SET_STATE',
        payload: {
          general: new GeneralUiService(),
          getImagePath,
        }
      });
    }
  }

  return (
    <NotificationProvider>
      <AuiContext.Provider
        value={{
          ...state,
          dispatchAui: dispatch,
        }}
      >
        <ProviderInitializer uiCnf={uiCnf} t={t} adapter={adapter}/>
        {children}
      </AuiContext.Provider>
    </NotificationProvider>
  );
};

export const useAuiContext = () => {
  const context = useContext(AuiContext);
  const { dispatchAui } = context;
  return {
    ...context,
    setAuiState: (props: any) => {
      dispatchAui({
        type: "SET_STATE",
        payload: { ...props },
      });
    },
  };
};
