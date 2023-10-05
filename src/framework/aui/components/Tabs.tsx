import React from 'react';
import { useUiEvent } from '../lib/SimpleRx';
import { UiEvent } from '../services/ui-service';
import { useAuiContext } from '../AuiContext';
import { toClassName } from 'megaloutils';
import { useState } from 'react';
import {Badge} from "../Badge";

interface TabHeadersProps {
  tabId: string;
  contentId: string | number;
  children: any;
  count?: number;
}

interface TabContentProps {
  tabId: string;
  contentId: string | number;
  children: any;
}

export const TabHeader = ({ tabId, contentId, children, count }: TabHeadersProps) => {
  const { ui } = useAuiContext();
  const [active, setActive] = useState(false);
  useUiEvent(UiEvent.Tabs, (e: any) => {
    if (e.detail.key === tabId) {
      if (e.detail.data.contentId === contentId) {
        setActive(true);
      } else if (active) {
        setActive(false);
      }
    }
  });
  const setTab = () => {
    ui.dispatchUiEvent({
      key: tabId,
      data: { contentId },
    }, UiEvent.Tabs);
  };
  return (
    <div className={toClassName('tab-header font-emphasis', { active })} onClick={setTab}>
      {count ? <Badge className="tab-header-badge" value={count}/> : null}
      {children}
    </div>
  );
};

export const TabContent = ({ tabId, contentId, children }: TabContentProps) => {
  const [active, setActive] = useState(false);
  const [activated, setActivated] = useState(false); // lazy load (prevent loading all tab at once)
  useUiEvent(UiEvent.Tabs, (e: any) => {
    if (e.detail.key === tabId) {
      if (e.detail.data.contentId === contentId) {
        setActive(true);
        if (!activated) {
          setActivated(true);
        }
      } else if (active) {
        setActive(false);
      }
    }
  });
  if (!activated) return null;
  return (
    <div className={toClassName('tab-content', { active })}>{children}</div>
  );
};
