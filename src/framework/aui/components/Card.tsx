import React from 'react';

interface CardProps {
  header?: any,
  children: any,
}

export const Card: React.FC<CardProps> = ({ header, children }) => {
  return (
    <div className="card">
      {header ? (
        <div className="card-header capitalize">
          {header}
        </div>
      ) : null}
      <div>
        {children}
      </div>
    </div>
  );
};
