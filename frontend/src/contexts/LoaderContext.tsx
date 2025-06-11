import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Backdrop, CircularProgress } from '@mui/material';

interface LoaderContextType {
  showLoader: () => void;
  hideLoader: () => void;
}

const LoaderContext = createContext<LoaderContextType>({
  showLoader: () => {},
  hideLoader: () => {},
});

export const useLoader = () => useContext(LoaderContext);

export const LoaderProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  const showLoader = () => setOpen(true);
  const hideLoader = () => setOpen(false);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <CircularProgress color='inherit' />
      </Backdrop>
    </LoaderContext.Provider>
  );
};
