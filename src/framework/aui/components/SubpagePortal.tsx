import React, { useEffect, useState } from 'react';
import { toClassName } from 'megaloutils';
import { useAuiContext } from '../AuiContext';
import { SubpageParams } from '../services/subpage-service';
import { BackDrop } from './BackDrop';
import { Icon } from './Icon';

export const SubpagePortal = () => {

  const { ui } = useAuiContext();
  const [pages, setPages] = useState<SubpageParams[]>([]);

  useEffect(() => {
    if (ui.subpages?.subpages$) {
      ui.subpages.subpages$.subscribe(subpages => {
        setPages([...subpages]);
      });
    }
  }, [ui]);

  return (
    <div className="subpage-portal">
      <SubpageLayout show={!!pages.length} pages={pages}>
        {pages.length ? pages[pages.length - 1].content : null}
      </SubpageLayout>
    </div>
  );
};

const SubpageLayout = ({ show, pages, children }: { show: boolean, pages: any, children: any }) => {
  const { ui } = useAuiContext();
  const currentPage = pages?.[0] || {};
  return (
    <div className={toClassName('subpage-layout', { show })}>
      <BackDrop show={show} onClick={() => ui.subpages.popAll()}/>
      <div className="subpage-layout-inner">
        <div className="subpage-toolbar">
          <div className="subpage-toolbar-back" onClick={() => ui.subpages.pop()}>
            <Icon name="arrow-back-outline" className="text-primary text-2xl"/>
          </div>
          {currentPage.title ? <span className="text-xl font-emphasis capitalize">{currentPage.title}</span> : null}
        </div>
        <div className="subpage-content">
          {children}
        </div>
      </div>
    </div>
  );
};


