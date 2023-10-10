import { ApperturePost } from './util';

export const generateAPIKey = async () => {
  return await ApperturePost('/api-key', {});
};
