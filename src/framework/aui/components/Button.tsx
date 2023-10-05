import React from 'react';
import {MouseEventHandler} from 'react';
import {toClassName} from "megaloutils";
import {useAuiContext} from "../AuiContext";
import { useHistory } from "react-router";

interface ButtonProps {
  onClick?: () => void;
  to?: string;
  color?: string;
  children: any;
  className?: string;
  fill?: string;
  size?: string;
  disabled?: boolean;
}

export const Button = (prop: ButtonProps) => {
  const {adapter} = useAuiContext();
  const history = useHistory();
  const onClick = typeof prop.onClick === 'function' ? prop.onClick : prop.to ? () => {
    if (prop?.to) {
      history.push(prop.to);
    }
  } : () => null;
  if (adapter?.buttonComponentFn) {
    return adapter.buttonComponentFn({
      ...prop,
      onClick
    });
  }
  return <button className={toClassName('btn btn-primary')} {...prop as any}
                 onClick={onClick as MouseEventHandler}></button>;
  // return <IonButton {...prop as any} onClick={onClick as MouseEventHandler}></IonButton>;
};
