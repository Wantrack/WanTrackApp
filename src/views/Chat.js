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

function Chat (props) {
    const [chats, setChats] = useState([]);
    const [loaderActive, setLoaderActive] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    
    useEffect(() => { 
        setLoaderActive(true);
        const phone = localStorage.getItem('currentChatID');
        axios.get(`${constants.apiurl}/api/chats/${phone}`).then(result => {
            setLoaderActive(false)
            setChats(result.data);
            const chatHolder = document.getElementById('chatcontainer');
            if(chatHolder) {
               chatHolder.scrollIntoView({behavior: 'smooth', block: 'end'});
            }
        });       
    }, []);
    
    return <div className="content">
            <Loader active={loaderActive} />
            <Card>
            <div id='chatcontainer' className="chat-container">
                {
                    chats.map((chat, index) => 
                        <div key={index}  className={`${chat.type == 0 ? 'message-left' : 'message-right'}`}>
                            <div>
                                <p>{chat.message}</p>                                
                            </div>
                            <p className='type-message'>Tipo: {chat.typeMessage}</p>
                        </div>
                    )
                }
            </div> 
            </Card>
    </div>;
}

export default Chat;