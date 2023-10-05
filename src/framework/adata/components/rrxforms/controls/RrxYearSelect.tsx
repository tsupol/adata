import React from 'react';
import { RrxPlainSelect } from './RrxPlainSelect';
import dayjs from 'dayjs';

export const RrxYearSelect = (props: any) => {
  let start = dayjs().startOf('year');
  const options: any = [];
  for (let i = 0; i < 10; i++) {
    options.push({ value: start.year(), label: start.year() });
    start = start.add(1, 'year');
  }
  return <RrxPlainSelect {...props} options={options}/>;
};
