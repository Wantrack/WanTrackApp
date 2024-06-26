import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Loader from '../components/Loader/Loader';
import { decode } from "../util/base64";
import { axios } from '../config/https';
import constants from '../util/constans';
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
        let idCompany = undefined;
        const _userinfoEncoded = localStorage.getItem(constants.userinfo);
        if(_userinfoEncoded) {
            const _userinfo = JSON.parse(decode(_userinfoEncoded));
            if(_userinfo.idCompany) {
                idCompany =_userinfo.idCompany
            }
        }

        setLoaderActive(true)
        axios.get(`${constants.apiurl}/api/chats${idCompany ? `?idcompany=${idCompany}` : ''}`).then(result => {
            setLoaderActive(false)
            setChats(result.data);
        });
    }, []);
    
    const filteredChats = Array.isArray(chats) ? chats.filter(chat => String(chat.name).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) : []
    
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredChats.map((scatterList, index) => 
                                        <tr key={scatterList.idscatterlist}>
                                            <td> <Link to="/admin/chat" onClick={() => goToChat(scatterList.phone)}>{index + 1}</Link></td>
                                            <td> <Link to="/admin/chat" onClick={() => goToChat(scatterList.phone)}>{scatterList.phone}</Link></td>
                                            <td> <Link to="/admin/chat" onClick={() => goToChat(scatterList.phone)}>{scatterList.name}</Link></td>
                                            <td> <Link to="/admin/chat" onClick={() => goToChat(scatterList.phone)}>{scatterList.creationdate}</Link></td>
                                        </tr>
                                    )}
                                </tbody>          
                            </table>
                        </div> 
                    </CardBody>
                </Card>
    </div>;
}

function goToChat(idChat) {
    localStorage.setItem('currentChatID', idChat);
}

export default Chats;