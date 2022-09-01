import { AppertureAPI } from '../apiClient';

export const addApp = async (name: string): Promise<void> => {
  await AppertureAPI.post('/apps', {
    name,
  });
};
