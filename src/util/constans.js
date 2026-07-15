// Descripcion:
// Rutas iniciales para las peticiones HTTP y Socket.IO de la aplicacion.

const normalizeUrl = (url) => url.trim().replace(/\/$/, '');

const defaultApiUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:80'
    : 'https://wantrackapi.com';

const apiUrl = normalizeUrl(
    process.env.REACT_APP_API_URL || defaultApiUrl
);

const socketUrl = normalizeUrl(
    process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL || defaultApiUrl
);

const constants = {
    apiurl: apiUrl,
    urlIO: socketUrl,
    token: 'dG9rZW4=',
    userinfo: 'dXNlcmluZm8='
};

export default constants;
