import { useLocation } from 'react-router-dom';

/**
 * Fix useLocation() bug returning inconsistency value
 */
export const useMyLocation = () => {
  const loc = useLocation();
  if ((loc as any).location) {
    return (loc as any).location;
  }
  return loc;
};
