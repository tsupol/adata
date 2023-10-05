import React from 'react';
import {useAuiContext} from "../AuiContext";

export const EmptyResult = ({ subject, className }: { subject: string, className?: string }) => {
  const { t } = useAuiContext();
  return <div className={className || 'font-bold tracking-wide text-fade'}>{t('data:empty_list', { subject })}</div>;
};
