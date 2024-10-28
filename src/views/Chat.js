import React, { useState, useEffect, useRef } from "react";
import NotificationAlert from "react-notification-alert";
import Loader from "../components/Loader/Loader";
import { axios } from "../config/https";
import constants from "../util/constans";
import ScrollArea from "react-scrollbar";
import { Button, Card, Col, Input, Row } from "reactstrap";
import { Tooltip as ReactTooltip } from "react-tooltip";
import SocketService  from "../socket";
import { Link } from "react-router-dom";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function Chat(props) {
  const scrollAreaRef = useRef(null);
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loaderActive, setLoaderActive] = useState(false);
  const [startchat, setStarChat] = useState(false);

  async function toggleChat() {
    const _startchat =!startchat;
    setStarChat(!startchat)
    const phone = localStorage.getItem("currentPhone");
    const phoneNumberId = localStorage.getItem("currentphoneNumberID");
    if(_startchat) {
      await axios.post(`${constants.apiurl}/api/chatasesorstart`, {
        phone: phone,
        phoneNumberId: phoneNumberId
    });
    } else {
      await axios.post(`${constants.apiurl}/api/chatasesorstop`, {
        phone: phone,
        phoneNumberId: phoneNumberId
    });
    }
  }

  const notificationAlertRef = useRef(null); 

  async function toBotton() {
    await sleep(200);
    if (
      scrollAreaRef &&
      scrollAreaRef.current &&
      scrollAreaRef.current.scrollArea
    ) {
      scrollAreaRef.current.scrollArea.scrollBottom();
    }
  }

  async function sendNotification(message, type = 'success') {    
    var options = {};
    options = {
      place: 'tr',
      message: (
        <div>
          <div>
            {message}
          </div>
        </div>
      ),
      type: type,
      icon: "tim-icons icon-bell-55",
      autoDismiss: 7,
    };
    notificationAlertRef.current.notificationAlert(options);
  }

  function genAI() {
    //sendNotification('Esta opción está desactivada para tu usuario 🚫. Habla con tu asesor para solicitar una versión de prueba 📞✨', 'danger');
    setLoaderActive(true);
    axios.get(`${constants.apiurl}/api/suggestionText/${message}`).then((result) => {
      setLoaderActive(false);
      document.querySelector('#message').value = result.data.textosugerido;
      setMessage(result.data.textosugerido);
    });
  }

  const onHandleChange = (e) => {
    const { name, value } = e.target;
    setMessage(value);
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
  };

  async function sendMessage() {
    if(message) {
        document.querySelector('#message').value = '';
        const phone = localStorage.getItem("currentPhone");
        const phoneNumberId = localStorage.getItem("currentphoneNumberID");
        await axios.post(`${constants.apiurl}/api/chatssendmessage`, {
            phone: phone,
            phoneNumberId: phoneNumberId,
            message: message
        });
        setMessage('');
        
        loadChats(phone, phoneNumberId);
    }   
  }

  function loadChats(phone, phoneNumberId) {
    axios.get(`${constants.apiurl}/api/chats/${phone}/${phoneNumberId}`).then((result) => {
        setLoaderActive(false);
        setChats(result.data);
        toBotton();
    });

    axios.get(`${constants.apiurl}/api/chatisstop/${phone}/${phoneNumberId}`).then((result) => {
      setStarChat(result.data.isStop);
  });
  }

  const elements = document.querySelectorAll('.ps__rail-y');
  for (let index = 0; index < elements.length; index++) {
    const element = elements[index];
    console.log(element);
    element.style.display = 'none';
  }

  useEffect(() => {
    setLoaderActive(true);
    const phone = localStorage.getItem("currentPhone");
    const name = localStorage.getItem("currentName");
    const phoneNumberId = localStorage.getItem("currentphoneNumberID");
    setPhone(phone);
    setName(name);
    loadChats(phone, phoneNumberId);

    const socket = new SocketService();
    socket.getSocket().on('chatrefresh', chatrefresh);   

    return () => {
      console.log('El componente Chat se desmontó');
      socket.disconnect();
    }
  }, []);

  function chatrefresh(value) {
    console.log(value);
    const phone = localStorage.getItem("currentPhone");
    const phoneNumberId = localStorage.getItem("currentphoneNumberID");
    loadChats(phone, phoneNumberId);
  }  

  return (
    <div className="content">
      <NotificationAlert ref={notificationAlertRef} />
      <Loader active={loaderActive} />
      <Card style={{marginBottom: '0px'}}>
        <div style={{display: 'flex', alignItems: 'center'}} className="headerchat">
            <div>
              <i style={{fontSize:'2rem'}} className="fa-regular fa-circle-user"></i>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'start'}} className="herderphone">
              <h4 style={{marginBottom: '5px'}}>{name}</h4>
              <span style={{fontSize: '11px'}}>{phone}</span>
            </div>  
            <div>
              <Link to="javascript:void(0)" onClick={()=>{toggleChat()}}>
                <i style={{fontSize:'2rem', marginLeft:'2rem'}} className={startchat ? 'fa-solid fa-toggle-on' : 'fa-solid fa-toggle-off gray'} title={startchat ? 'Chat con asesor activo' : 'Chat con asesor inactivo'}></i>
              </Link>              
            </div>          
        </div>
        <ScrollArea
          style={{ height: "70vh" }}
          speed={0.8}
          className="area"
          contentClassName="content chat-container"
          ref={scrollAreaRef}
          vertical={true}
        >
          {chats.map((chat, index) => (
            <div
              key={index}
              className={`${chat.type == 0 ? "message-left" : "message-right"}`}
            >
              <div>
                <p>{chat.message}</p>
              </div>
              <p className="type-message">Tipo: {chat.typeMessage}</p>
            </div>
          ))}
        </ScrollArea>
        <div style={{ padding: "10px"}}>
          <Row>
            <Col lg="10" sm="8" style={{ padding: "0px 2px 0px 10px"}}>
                <Input style={{marginTop: '5px'}} id="message" name="message" defaultValue={message} placeholder="Escribe un mensaje" onChange={onHandleChange} onKeyPress={handleKeyPress}></Input>
            </Col>            
            <Col lg="1" sm="2" style={{ padding: "0px 1px"}}>
                <Button onClick={genAI} data-tooltip-id="genAITooltip" title="Sugiere respuesta con IA" style={{width: '100%'}}>                
                    <svg fill="#FFDF00" width="14px" height="14px" viewBox="0 0 512 512" id="icons" xmlns="http://www.w3.org/2000/svg" >
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g
                            id="SVGRepo_tracerCarrier"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                            <path d="M208,512a24.84,24.84,0,0,1-23.34-16l-39.84-103.6a16.06,16.06,0,0,0-9.19-9.19L32,343.34a25,25,0,0,1,0-46.68l103.6-39.84a16.06,16.06,0,0,0,9.19-9.19L184.66,144a25,25,0,0,1,46.68,0l39.84,103.6a16.06,16.06,0,0,0,9.19,9.19l103,39.63A25.49,25.49,0,0,1,400,320.52a24.82,24.82,0,0,1-16,22.82l-103.6,39.84a16.06,16.06,0,0,0-9.19,9.19L231.34,496A24.84,24.84,0,0,1,208,512Zm66.85-254.84h0Z"></path>
                            <path d="M88,176a14.67,14.67,0,0,1-13.69-9.4L57.45,122.76a7.28,7.28,0,0,0-4.21-4.21L9.4,101.69a14.67,14.67,0,0,1,0-27.38L53.24,57.45a7.31,7.31,0,0,0,4.21-4.21L74.16,9.79A15,15,0,0,1,86.23.11,14.67,14.67,0,0,1,101.69,9.4l16.86,43.84a7.31,7.31,0,0,0,4.21,4.21L166.6,74.31a14.67,14.67,0,0,1,0,27.38l-43.84,16.86a7.28,7.28,0,0,0-4.21,4.21L101.69,166.6A14.67,14.67,0,0,1,88,176Z"></path>
                            <path d="M400,256a16,16,0,0,1-14.93-10.26l-22.84-59.37a8,8,0,0,0-4.6-4.6l-59.37-22.84a16,16,0,0,1,0-29.86l59.37-22.84a8,8,0,0,0,4.6-4.6L384.9,42.68a16.45,16.45,0,0,1,13.17-10.57,16,16,0,0,1,16.86,10.15l22.84,59.37a8,8,0,0,0,4.6,4.6l59.37,22.84a16,16,0,0,1,0,29.86l-59.37,22.84a8,8,0,0,0-4.6,4.6l-22.84,59.37A16,16,0,0,1,400,256Z"></path>
                        </g>
                    </svg>
                 </Button>
            </Col>
            <Col lg="1" sm="2" style={{ padding: "0px 10px 0px 0px"}}>
                <Button onClick={sendMessage} title="Envia el mensaje" style={{width: '100%'}}><i className="fa-solid fa-paper-plane"></i></Button>
            </Col>
          </Row>
        </div>
      </Card>
      <ReactTooltip
        id="genAITooltip"
        place="bottom"
        variant="info">
            <p>Sugiere respuestas adecuadas según el contexto de la información con Inteligencia Artificial 🤖📊💬</p>
      </ReactTooltip>
    </div>
  );
}

export default Chat;
