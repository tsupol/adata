import React from "react";
import { forceArray } from 'megaloutils';
import { IPagination } from '../../../adata/services/db-service';

export const Pagination = ({ pagination, total, className = '', setPage }: {
  pagination: IPagination,
  total: number,
  className: string,
  setPage: Function
}) => {

  const count = Math.ceil(total / (pagination?.perPage || 10));
  const items: any[] = [];

  for (let i = 1; i <= count; i++) {
    items.push({
      label: i
    });
  }

  const containerClassName = forceArray('flex', className);

  if (count < 2) return null
  
  return (
    <div className={containerClassName.join(' ')}>
      <div className="mason-0.5">
        {items.map((item) => {
          const className = forceArray('pagi-item', pagination.pageNumber === item.label ? 'current' : '');
          return (
            <div key={item.label} className="mason-item">
              <div onClick={() => setPage(item.label)} className={className.join(' ')} key={item.label}>{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
