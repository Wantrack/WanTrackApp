import { io } from 'socket.io-client';
import constants from 'util/constans';

export const socket = io(constants.urlIO);