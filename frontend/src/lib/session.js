const T = 'crs_token';
const U = 'crs_user';
const ls = () => (typeof window !== 'undefined' ? window.localStorage : null);

export const session = {
  token: () => ls()?.getItem(T) || null,
  user: () => {
    try {
      return JSON.parse(ls()?.getItem(U) || 'null');
    } catch {
      return null;
    }
  },
  save: (token, user) => {
    ls()?.setItem(T, token || '');
    ls()?.setItem(U, JSON.stringify(user));
  },
  clear: () => {
    ls()?.removeItem(T);
    ls()?.removeItem(U);
  },
};
