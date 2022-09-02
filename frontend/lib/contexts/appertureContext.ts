import { App } from '@lib/domain/app';
import { Device } from '@lib/types';
import { createContext } from 'react';

type AppertureContextType = {
  device: Device;
};

export const AppertureContext = createContext<AppertureContextType>({
  device: { isMobile: false },
});
