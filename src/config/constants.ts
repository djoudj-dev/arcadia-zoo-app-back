export const API_URLS = {
  development: 'http://localhost:3000/api',
  production: 'https://nedellec-julien.fr/api',
};

export const getApiUrl = () => {
  return process.env.NODE_ENV === 'production'
    ? API_URLS.production
    : API_URLS.development;
};
