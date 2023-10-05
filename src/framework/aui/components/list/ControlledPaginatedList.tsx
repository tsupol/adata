import React from 'react';
import { ControlledPagination } from './ControlledPagination';
import { useObservable } from '../../hooks/useObservable';
import { AController } from '../../../adata/controllers/AController';
import {EmptyResult} from "../EmptyResult";

export const ControlledPaginatedList = ({
                                          aController,
                                          className,
                                          listComponent,
                                        }:
                                          {
                                            aController: AController,
                                            className?: string,
                                            listComponent: (v: any, aController: AController) => any
                                          }) => {

  const [data] = useObservable(aController.dataController.data);

  if (!data) return null;

  return (
    <>
      <div className={className || 'grid gap-0.5'}>
        {data.list?.length
          ? data.list.map((v: any) => {
            return listComponent(v, aController);
          })
          : <EmptyResult subject="data"/>}
      </div>
      <ControlledPagination controller={aController.dataController} className="mt-2"/>
    </>
  );
};
