// Descripción:

// Se basa en las rutas iniciales a las cuales se realizan las diferentes peticiones HTTP relacionadas con la aplicación

const constants = {
    apiurl:  process.env.REACT_APP_API_URL || 'https://wantrackapi.com',//'https://wantrackapi.com',//'http://localhost:8080'
    urlIO: 'https://wantrackapi.com',//'https://wantrackapi.com', //'http://localhost:8080'
    scatterListImagesBucket: process.env.REACT_APP_SCATTER_LIST_IMAGES_BUCKET || 'publicwt ',
    token: 'dG9rZW4=',
    userinfo: 'dXNlcmluZm8='
};

export default constants;
