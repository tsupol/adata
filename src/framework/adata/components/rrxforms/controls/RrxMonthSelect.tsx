import React from 'react';
import { RrxPlainSelect } from './RrxPlainSelect';
import {useAuiContext} from "../../../../aui/AuiContext";

const leadingZero = (num: number, size: number) => {
  let theNum = num.toString();
  while (theNum.length < size) theNum = "0" + theNum;
  return theNum;
};
export const RrxMonthSelect = (props: any) => {
  const { t } = useAuiContext();
  const options = [
    { value: 0, label: leadingZero(1, 2) + ' ' + t('data:january') },
    { value: 1, label: leadingZero(2, 2) + ' ' + t('data:february') },
    { value: 2, label: leadingZero(3, 2) + ' ' + t('data:march') },
    { value: 3, label: leadingZero(4, 2) + ' ' + t('data:april') },
    { value: 4, label: leadingZero(5, 2) + ' ' + t('data:may') },
    { value: 5, label: leadingZero(6, 2) + ' ' + t('data:june') },
    { value: 6, label: leadingZero(7, 2) + ' ' + t('data:july') },
    { value: 7, label: leadingZero(8, 2) + ' ' + t('data:august') },
    { value: 8, label: leadingZero(9, 2) + ' ' + t('data:september') },
    { value: 9, label: leadingZero(10, 2) + ' ' + t('data:october') },
    { value: 10, label: leadingZero(11, 2) + ' ' + t('data:november') },
    { value: 11, label: leadingZero(12, 2) + ' ' + t('data:december') },
  ];
  return <RrxPlainSelect {...props} options={options}/>;
};
