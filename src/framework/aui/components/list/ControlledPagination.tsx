import React from 'react';
import { toClassName } from 'megaloutils';
import { useObservable } from '../../hooks/useObservable';

export const ControlledPagination = ({ controller, className = '' }: {
  controller: any,
  className?: string,
}) => {

  const [params] = useObservable(controller.params);
  const [data] = useObservable(controller.data);
  const setPage = (v: any) => {
    controller.patchParams({ pageNumber: v });
  };

  if (!(params && data)) return null;

  const currentPage = params.pageNumber || 1;
  const count = Math.ceil(data.total / (params?.perPage || 10));
  const items: any[] = [];

  for (let i = 1; i <= count; i++) {
    items.push({
      label: i
    });
  }

  if(count < 2) return null

  return (
    <div className={toClassName('flex', className)}>
      <div className="mason-0.5">
        {items.map((item) => {
          return (
            <div key={item.label} className="mason-item">
              <div
                onClick={() => setPage(item.label)}
                className={toClassName('pagi-item', { current: currentPage === item.label })}
                key={item.label}>
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
