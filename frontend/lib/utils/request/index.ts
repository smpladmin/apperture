export const getAuthToken = (req: {
  cookies: Partial<{
    [key: string]: string;
  }>;
}) => {
  return req.cookies[process.env.COOKIE_KEY || 'auth_token'];
};
