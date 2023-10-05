import React from 'react';
import {useAuiContext} from "../AuiContext";

export const StatusTag = ({ item, defaultStatus }: { item: any, defaultStatus?: string }) => {
  const { t } = useAuiContext();
  if (item.mNumber) {
    if (!item.validAt) {
      return <div className="tag font-emphasis">{t(`data:invalid`)}</div>;
    }
  }
  if (item.disableAt) return <div className="tag tag-grayed font-emphasis">{t(`data:disabled`)}</div>;
  if (defaultStatus) return <div className="tag tag-info font-emphasis">{t(`data:${defaultStatus}`)}</div>;
  if (!item.status) return null;
  if (item.status === 'processing') return <div className="tag tag-info font-emphasis">{t(`data:${item.status}`)}</div>;
  if (item.status === 'cancelled') return <div className="tag tag-danger font-emphasis">{t(`data:${item.status}`)}</div>;
  if (item.status === 'cancelled') return <div className="tag tag-danger font-emphasis">{t(`data:${item.status}`)}</div>;
  if (item.status === 'completed') return <div className="tag tag-success font-emphasis">{t(`data:${item.status}`)}</div>;
  return <div className="tag tag-info">{t(`data:${item.status}`)}</div>;
};
