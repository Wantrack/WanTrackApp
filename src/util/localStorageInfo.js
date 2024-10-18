import constants from 'util/constans';
import { decode } from "util/base64";

function getUserInfo() {
    const _userinfoEncoded = localStorage.getItem(constants.userinfo);
    if(_userinfoEncoded) {
        const _userinfo = JSON.parse(decode(_userinfoEncoded));
        return _userinfo;
    }
    return undefined
}

export { getUserInfo }
