import React, {useCallback, useEffect, useState} from "react";
import {useAuiContext} from "../../AuiContext";
import {useObservable} from "../../hooks/useObservable";
import {toClassName} from "megaloutils";

const testTranslateRe = /^t\(/;
const matchTranslateRe = /^t\(['"](.+)['"]\)/;

export const NotificationPortal = () => {
  const {ui} = useAuiContext();
  const [list] = useObservable(ui.notify.itemList$)
  if (!list) return null
  return (
    <div className="notification-wrapper">
      {list.map((item: any) => {
        return <Notification key={item.id} {...item} />;
      })}
    </div>
  )
}

const Notification = (props: any) => {
  const {ui} = useAuiContext();
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
    setTimeout(() => {
      ui.notify.remove(props.id)
      // props.dispatch({
      //   type: "REMOVE_NOTIFICATION",
      //   id: props.id,
      // });
    }, 400);
  }, [handlePauseTimer, props]);

  useEffect(() => {
    if (width >= 100) {
      handleCloseNotification();
    }
  }, [width, handleCloseNotification]);

  useEffect(() => {
    handleStartTimer();
  }, [handleStartTimer]);

  const processMessage = (msg: string): string => {
    if (testTranslateRe.test(msg)) {
      const match = msg.match(matchTranslateRe);
      if (match?.[1]) {
        return match[1];
      }
    }
    return msg;
  };

  return (
    <div
      onMouseEnter={handlePauseTimer}
      onMouseLeave={handleStartTimer}
      className={toClassName('notification-item', props.type)}
    >
      <p>{processMessage(props.msg)}</p>
      <div className={"bar"} style={{width: `${width}%`}}/>
    </div>
  );
};
