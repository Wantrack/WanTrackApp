import React, { useState, useEffect, useRef } from 'react';
import Loader from '../components/Loader/Loader';
import { axios } from '../config/https';
import constants from '../util/constans';
import ScrollArea from 'react-scrollbar';
import {
    Card
} from "reactstrap";
import { func } from 'prop-types';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function Chat (props) {
    const scrollAreaRef = useRef(null);
    const [chats, setChats] = useState([]);
    const [loaderActive, setLoaderActive] = useState(false);

    async function toBotton() {
        await sleep(200);
        if(scrollAreaRef && scrollAreaRef.current && scrollAreaRef.current.scrollArea) {
            scrollAreaRef.current.scrollArea.scrollBottom();
        }
    }

    useEffect(() => { 
        setLoaderActive(true);
        const phone = localStorage.getItem('currentChatID');
        axios.get(`${constants.apiurl}/api/chats/${phone}`).then(result => {
            setLoaderActive(false);
            setChats(result.data);
            toBotton()
        });       
    }, []);

    
    return <div className="content">      
            <Loader active={loaderActive} />     
            <Card>                   
                <ScrollArea
                style={{height: '80vh'}}
                speed={0.8}
                className="area"
                contentClassName="content chat-container"
                ref={scrollAreaRef}
                vertical={true}
                >                        
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
                </ScrollArea>
            </Card>
    </div>;
}

export default Chat;