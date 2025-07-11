import { createContext, useContext } from 'react';

export const DataContext = createContext(null);

export const useData = () => {
  const data = useContext(DataContext);
  if (!data) {
    throw new Error('useData must be used within a DataProvider');
  }
  return data;
}; 