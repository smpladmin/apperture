import { http } from '../http';

export const addApp = async (name: string): Promise<void> => {
  await http.post('/apps', {
    name,
  });
};
