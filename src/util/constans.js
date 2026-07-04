// Descripcion:
// Rutas iniciales para las peticiones HTTP y Socket.IO de la aplicacion.

const normalizeUrl = (url) => url.trim().replace(/\/$/, '');

const apiUrl = normalizeUrl(
    process.env.REACT_APP_API_URL || 'https://wantrackapi.com'
);

const socketUrl = normalizeUrl(
    process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL || 'https://wantrackapi.com'
);

const constants = {
    apiurl: apiUrl,
    urlIO: socketUrl,
    token: 'dG9rZW4=',
    userinfo: 'dXNlcmluZm8='
};

export default constants;
