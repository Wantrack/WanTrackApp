import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Loader from '../components/Loader/Loader';
import { decode } from "../util/base64";
import { axios } from '../config/https';
import constants from '../util/constans';
import SocketService  from "../socket";

import {
    CardHeader,
    CardBody,
    Card
  } from "reactstrap";

function Chats (props) {
    const [chats, setChats] = useState([]);
    const [loaderActive, setLoaderActive] = useState(false);
    const [searchValue, setSearchValue] = useState('');   
    
    useEffect(() => { 
        loadChats();
        const socket = new SocketService();
        socket.getSocket().on('notificationrefresh', notificationrefresh);
        console.log('Entro');
        
        return () => {
            console.log('El componente Chats se desmontó');
            socket.disconnect();
        }
    }, []);

    function loadChats() {        
        setLoaderActive(true)
        axios.get(`${constants.apiurl}/api/chats`).then(result => {
            setLoaderActive(false)
            setChats(result.data);
        });
    }

    function notificationrefresh(value) {
        console.log(value);
        loadChats();       
    }
    
    const filteredChats = Array.isArray(chats) ? chats.filter(chat => String(chat.phone).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) : []
    
    return <div className="content">
                <Loader active={loaderActive} />
                <Card>
                    <CardHeader>
                        <h5 className="title">Chats</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="margin-bottom-2vh flex-left">
                            <div className="input-group flex-nowrap w-full">
                                <span className="input-group-text z-0" id="addon-wrapping"><i className="fa fa-search"></i></span>
                                <input type="text" className="form-control px-2" placeholder="Escriba el nombre del contacto"
                                onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>       
                                        <th>#</th>
                                        <th>Telefono</th>
                                        <th>Nombre</th>
                                        <th>Fecha ultimo mensaje</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                    filteredChats.map((chat, index) => 
                                        <tr key={index}>
                                            <td> <Link to="/admin/chat" onClick={() => goToChat(chat.phone, chat.phoneNumberId, chat.name)}>{index + 1}</Link></td>
                                            <td> <Link to="/admin/chat" onClick={() => goToChat(chat.phone, chat.phoneNumberId, chat.name)}>{chat.phone}</Link></td>
                                            <td> <Link to="/admin/chat" onClick={() => goToChat(chat.phone, chat.phoneNumberId, chat.name)}>{chat.name}</Link></td>
                                            <td> <Link to="/admin/chat" onClick={() => goToChat(chat.phone, chat.phoneNumberId, chat.name)}>{chat.creationdate}</Link></td>
                                            <td>{ chat.isalert ?  <i title='No haz leido los mensajes' style={{color:'#f5365c'}} className="fa-solid fa-circle-exclamation"></i>: <></>}</td>
                                        </tr>
                                    )}
                                </tbody>          
                            </table>
                        </div> 
                    </CardBody>
                </Card>
    </div>;
}

function goToChat(phone, phoneNumberId, name) {
    localStorage.setItem('currentPhone', phone);
    localStorage.setItem('currentName', name);
    localStorage.setItem('currentphoneNumberID', phoneNumberId);
}

export default Chats;