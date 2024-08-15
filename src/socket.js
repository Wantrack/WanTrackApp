import { io } from 'socket.io-client';
import constants from 'util/constans';

//export const socket = io(constants.urlIO);

export default class SocketService {
    constructor() {
        this.socket = {};
        this.socket = io(constants.urlIO);
    }

    getSocket() {
        return this.socket;
    }
    // disconnect - used when unmounting
    disconnect() {
        this.socket.disconnect();
    }
}