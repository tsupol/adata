import React from 'react';
import { createContext, useContext, useReducer, useEffect, useState, useCallback } from "react";

const NotificationContext = createContext<any>({});

export const NotificationProvider = (props: any) => {
  const [state, dispatch] = useReducer((state: any, action: any) => {
    switch (action.type) {
      case "ADD_NOTIFICATION":
        return [...state, { ...action.payload }];
      case "REMOVE_NOTIFICATION":
        return state.filter((el: any) => el.id !== action.id);
      default:
        return state;
    }
  }, []);

  return (
    <NotificationContext.Provider value={dispatch}>
      <div className={"notification-wrapper"}>
        {state.map((note: any) => {
          return <Notification dispatch={dispatch} key={note.id} {...note} />;
        })}
      </div>
      {props.children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const dispatch = useContext(NotificationContext);
  return dispatch;
};

const testTranslateRe = /^t\(/;
const matchTranslateRe = /^t\(['"](.+)['"]\)/;

const Notification = (props: any) => {
  // const [exit, setExit] = useState(false);
  const [width, setWidth] = useState(0);
  const [intervalID, setIntervalID] = useState<any>(null);

  const handleStartTimer = useCallback(() => {
    // change the duration here!
    const speed = props.type === 'success' ? .8 : .4; // original is .5
    const id: any = setInterval(() => {
      setWidth(prev => {
        if (prev < 100) {
          return prev + speed;
        }
        clearInterval(id);
        return prev;
      });
    }, 20);
    setIntervalID(id);
  }, [props.type]);

  const handlePauseTimer = useCallback(() => {
    clearInterval(intervalID);
  }, [intervalID]);

  const handleCloseNotification = useCallback(() => {
    handlePauseTimer();
    // setExit(true);
    setTimeout(() => {
      props.dispatch({
        type: "REMOVE_NOTIFICATION",
        id: props.id,
      });
    }, 400);
  }, [handlePauseTimer, props]);

  useEffect(() => {
    if (width >= 100) {
      // Close notification
      handleCloseNotification();
    }
  }, [width, handleCloseNotification]);

  useEffect(() => {
    handleStartTimer();
  }, [handleStartTimer]);

  const classes = ['notification-item'];
  classes.push(props.type);

  const processMessage = (msg: string): string => {
    if (testTranslateRe.test(msg)) {
      const match = msg.match(matchTranslateRe);
      if (match?.[1]) {
        return match[1];
      }
      // return t()
    }
    return msg;
  };

  return (
    <div
      onMouseEnter={handlePauseTimer}
      onMouseLeave={handleStartTimer}
      className={classes.join(' ')}
    >
      <p>{processMessage(props.message)}</p>
      <div className={"bar"} style={{ width: `${width}%` }}/>
    </div>
  );
};

