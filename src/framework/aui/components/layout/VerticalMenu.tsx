import React from 'react';
import { Icon } from '../Icon';
import { Link } from 'react-router-dom';

export const VerticalMenu = ({ menuItems }: any) => {

  return (
    <div className="vertical-menu-container">
      {menuItems.map((item: any, idx: number) => {
        return (
          <Link key={idx} className="vertical-menu-item" to={item.to}>
            <div className="vertical-menu-icon flex-center">
              <Icon name={item.icon}/>
            </div>
            <div className="vertical-menu-label">
              {item.label}
            </div>
          </Link>
        );
      })}
    </div>
  );
};
