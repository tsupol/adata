import { Required } from './Required';
import React from 'react';
import {useAuiContext} from "../../../aui/AuiContext";

const testRe = /(t\(([\w\d_-]+:[\w\d_-]+)\))|([\w\d_-]+:[\w\d_-]+)/g;

export const Label = ({ children, htmlFor, labelRequired }: any) => {
  const { t } = useAuiContext();
  if (children === false) {
    return null;
  }

  const getTranslated = () => {
    if(children === undefined && htmlFor){
      return t(`data:${htmlFor}`)
    }
    if (typeof children === 'string' && testRe.test(children)){
      const match = children.match(/[\w\d_-]+:[\w\d_-]+/);
      if (match?.length) {
        return t(match[0]);
      }
    }
    return children
  }

  return (
    <label className="form-label" htmlFor={htmlFor}>
      {getTranslated()}
      {labelRequired && <Required/>}
    </label>
  );
};
