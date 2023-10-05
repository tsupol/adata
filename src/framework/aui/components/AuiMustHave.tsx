import React from 'react';
import {ModalPortal} from './modals/ModalPortal';
import {SubpagePortal} from './SubpagePortal';
import {NotificationPortal} from "./notification/NotificationPortal";

export const AuiMustHave = () => {
  return <>
    <ModalPortal/>
    <SubpagePortal/>
    <NotificationPortal/>
  </>;
};
