// Descripción:

// Se basa en las rutas iniciales a las cuales se realizan las diferentes peticiones HTTP relacionadas con la aplicación

const constants = {
    apiurl:  process.env.REACT_APP_API_URL || 'http://localhost:80',//'https://wantrackapi.com',//'http://localhost:8080'
    urlIO: 'http://localhost:80',//'https://wantrackapi.com', //'http://localhost:8080'
    token: 'dG9rZW4=',
    userinfo: 'dXNlcmluZm8='
};

export default constants;