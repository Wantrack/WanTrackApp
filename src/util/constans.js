// Descripción:

// Se basa en las rutas iniciales a las cuales se realizan las diferentes peticiones HTTP relacionadas con la aplicación

const constants = {
    apiurl: process.env.API_URL || 'http://localhost:80',
    token: 'dG9rZW4=',
    userinfo: 'dXNlcmluZm8='
};

export default constants;