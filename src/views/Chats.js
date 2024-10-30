import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Loader from '../components/Loader/Loader';
import { axios } from '../config/https';
import constants from '../util/constans';
import SocketService  from "../socket";

import {
    CardHeader,
    CardBody,
    Card,
    CardFooter,
    Pagination,
    PaginationItem,
    PaginationLink
  } from "reactstrap";

function Chats (props) {
    const [chats, setChats] = useState([]);
    const [loaderActive, setLoaderActive] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [rows, setRows] = useState([]);
    const [max, setMax] = useState(0);
    
    useEffect(() => { 
        loadChats(0);
        const socket = new SocketService();
        socket.getSocket().on('notificationrefresh', notificationrefresh);
        console.log('Entro');
        
        return () => {
            console.log('El componente Chats se desmontó');
            socket.disconnect();
        }
    }, []);

    function loadChats(from) {        
        setLoaderActive(true)
        axios.get(`${constants.apiurl}/api/chats?start=${from}`).then(result => {
            setLoaderActive(false)
            setChats(result.data);
        });

        axios.get(`${constants.apiurl}/api/chatsCount`).then(result => {
            const amount = result.data.count;
            const max = Math.ceil(amount/25);
            var rows = [], i = 0, len = max
            while (++i <= len) rows.push(i);
            setRows(rows);
            setMax(max);
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
                                            <td> <Link to="/admin/chat" onClick={() => goToChat(chat.phone, chat.phoneNumberId, chat.name)}>{chat.last_creationdate}</Link></td>
                                            <td>{ chat.isalert ?  <i title='No haz leido los mensajes' style={{color:'#f5365c'}} className="fa-solid fa-circle-exclamation"></i>: <></>}</td>
                                        </tr>
                                    )}
                                </tbody>          
                            </table>
                        </div> 
                    </CardBody>
                    <CardFooter style={{display:'flex', justifyContent:'center'}}>
                        <div style={{width:'90%', overflowX:'auto', display: 'flex', justifyContent: 'center'}}>
                            <Pagination>
                                <PaginationItem>
                                    <PaginationLink
                                    onClick={() => {loadChats(0, 25)}}
                                    first
                                    href="javascript:void(0)"
                                    />
                                </PaginationItem>
                                {
                                    rows.map((item, index) => 
                                        <PaginationItem  key={index}>
                                            <PaginationLink 
                                            href="javascript:void(0)"
                                            onClick={() => {loadChats(index + 1, 25)}}
                                            >
                                            {index + 1}
                                            </PaginationLink>
                                    </PaginationItem> 
                                    )
                                }                    
                                <PaginationItem>
                                    <PaginationLink
                                    onClick={() => {loadChats(max, 25)}}
                                    href="javascript:void(0)"
                                    last
                                    />
                                </PaginationItem>
                            </Pagination>
                        </div>                                        
                    </CardFooter>
                </Card>
    </div>;
}

function goToChat(phone, phoneNumberId, name) {
    localStorage.setItem('currentPhone', phone);
    localStorage.setItem('currentName', name);
    localStorage.setItem('currentphoneNumberID', phoneNumberId);
}

export default Chats;