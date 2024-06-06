import { default as _axios } from "axios";
import constants from "util/constans";

export const axios = _axios.create();

axios.interceptors.request.use(
    config => {        
        const token = localStorage.getItem(constants.token);
        if(token) {
            config.headers['Authorization'] = 'Bearer ' + token
            // config.headers['Content-Type'] = 'application/json';       
        }
        return config
      },
      error => {
        Promise.reject(error)
      }
);