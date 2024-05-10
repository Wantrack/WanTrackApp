import { default as _axios } from "axios";

export const axios = _axios.create();

axios.interceptors.request.use(
    config => {
        if(localStorage.getItem('userLogged')) {
            const user = JSON.parse(localStorage.getItem('userLogged'));
            const token = user.token;
            if (token) {
                config.headers['Authorization'] = 'Bearer ' + token
            }
            // config.headers['Content-Type'] = 'application/json';       
        }
        return config
      },
      error => {
        Promise.reject(error)
      }
);