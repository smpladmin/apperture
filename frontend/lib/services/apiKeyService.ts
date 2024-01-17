import { ApperturePost } from './util';

export const generateAPIKey = async (appId: string) => {
  return await ApperturePost(`/api-key?app_id=${appId}`, {});
};
