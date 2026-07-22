import React, { useCallback, useEffect, useRef, useState } from "react";
import NotificationAlert from "react-notification-alert";
import Loader from "../components/Loader/Loader";
import { axios } from "../config/https";
import constants from "../util/constans";
import ScrollArea from "react-scrollbar";
import { Button, Card, Col, Input, Row } from "reactstrap";
import { Tooltip as ReactTooltip } from "react-tooltip";
import SocketService from "../socket";

const MESSAGE_LIMIT = 120;

function Chat() {
  const scrollAreaRef = useRef(null);
  const notificationAlertRef = useRef(null);
  const refreshTimeoutRef = useRef(null);
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [name, setName] = useState('');
  const [loaderActive, setLoaderActive] = useState(false);
  const [startchat, setStarChat] = useState(false);

  const toBottom = useCallback(() => {
    window.setTimeout(() => {
      if (scrollAreaRef.current?.scrollArea) {
        scrollAreaRef.current.scrollArea.scrollBottom();
      }
    }, 120);
  }, []);

  const sendNotification = useCallback((notificationMessage, type = 'success') => {
    notificationAlertRef.current?.notificationAlert({
      place: 'tr',
      message: <div><div>{notificationMessage}</div></div>,
      type,
      icon: "tim-icons icon-bell-55",
      autoDismiss: 7,
    });
  }, []);

  const loadChats = useCallback(async ({ markRead = true, includeStatus = false, showLoader = false } = {}) => {
    const currentPhone = localStorage.getItem("currentPhone");
    const currentPhoneNumberId = localStorage.getItem("currentphoneNumberID");

    if (!currentPhone || !currentPhoneNumberId) return;

    if (showLoader) setLoaderActive(true);

    const chatUrl = `${constants.apiurl}/api/chats/${encodeURIComponent(currentPhone)}/${encodeURIComponent(currentPhoneNumberId)}?limit=${MESSAGE_LIMIT}&markRead=${markRead}`;
    const requests = [axios.get(chatUrl)];

    if (includeStatus) {
      requests.push(axios.get(`${constants.apiurl}/api/chatisstop/${encodeURIComponent(currentPhone)}/${encodeURIComponent(currentPhoneNumberId)}`));
    }

    try {
      const [chatResult, statusResult] = await Promise.all(requests);
      setChats(Array.isArray(chatResult.data) ? chatResult.data : []);
      if (statusResult) {
        setStarChat(statusResult.data.isStop);
      }
      toBottom();
    } finally {
      if (showLoader) setLoaderActive(false);
    }
  }, [toBottom]);

  async function toggleChat() {
    const nextStartChat = !startchat;
    setStarChat(nextStartChat);
    const url = nextStartChat ? '/api/chatasesorstart' : '/api/chatasesorstop';

    await axios.post(`${constants.apiurl}${url}`, {
      phone,
      phoneNumberId,
    });
  }

  async function genAI() {
    if (!message.trim()) return;

    setLoaderActive(true);
    try {
      const result = await axios.get(`${constants.apiurl}/api/suggestionText/${encodeURIComponent(message)}`);
      setMessage(result.data.textosugerido);
    } catch (error) {
      sendNotification('No fue posible generar la sugerencia.', 'danger');
    } finally {
      setLoaderActive(false);
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  async function sendMessage() {
    const text = message.trim();
    if (!text) return;

    setMessage('');
    await axios.post(`${constants.apiurl}/api/chatssendmessage`, {
      phone,
      phoneNumberId,
      message: text,
    });
    loadChats({ markRead: false });
  }

  useEffect(() => {
    const currentPhone = localStorage.getItem("currentPhone");
    const currentPhoneNumberId = localStorage.getItem("currentphoneNumberID");
    const currentName = localStorage.getItem("currentName");

    setPhone(currentPhone || '');
    setPhoneNumberId(currentPhoneNumberId || '');
    setName(currentName || '');
    loadChats({ includeStatus: true, showLoader: true });

    const socket = new SocketService();
    socket.getSocket().on('chatrefresh', () => {
      window.clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = window.setTimeout(() => {
        loadChats({ markRead: false });
      }, 350);
    });

    return () => {
      window.clearTimeout(refreshTimeoutRef.current);
      socket.disconnect();
    };
  }, [loadChats]);

  const showMeanMessageType = (messageType, chatMessage) => {
    if (messageType === 'image') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <a target="_blank" rel="noreferrer" href={`${constants.apiurl}/api/aws/getfileImage/imagesws2/${chatMessage}`}>Descarga Imagen</a>
        </div>
      );
    }

    return <p>{chatMessage}</p>;
  };

  return (
    <div className="content">
      <NotificationAlert ref={notificationAlertRef} />
      <Loader active={loaderActive} />
      <Card style={{ marginBottom: '0px' }}>
        <div className="headerchat">
          <div>
            <i style={{ fontSize: '2rem' }} className="fa-regular fa-circle-user"></i>
          </div>
          <div className="herderphone">
            <h4 style={{ marginBottom: '5px' }}>{name}</h4>
            <span style={{ fontSize: '11px' }}>{phone}</span>
          </div>
          <div className="chat-human-toggle">
            <Button color="link" onClick={toggleChat}>
              <span className={startchat ? 'gray' : ''}>{startchat ? 'Desactivar respuesta humana' : 'Activar respuesta humana'}</span>
              <i className={startchat ? 'fa-solid fa-toggle-on' : 'fa-solid fa-toggle-off gray'} title={startchat ? 'Chat con asesor activo' : 'Chat con asesor inactivo'}></i>
            </Button>
          </div>
        </div>
        <ScrollArea
          style={{ height: "70vh" }}
          speed={0.8}
          className="area chat-scroll-area"
          contentClassName="content chat-container"
          ref={scrollAreaRef}
          vertical
        >
          {chats.map((chat) => (
            <div
              key={chat.idauditTrail}
              className={chat.type === 0 ? "message-left" : "message-right"}
            >
              <div>
                {showMeanMessageType(chat.typeMessage, chat.message)}
              </div>
              <p className="type-message">Tipo: {chat.typeMessage}</p>
            </div>
          ))}
        </ScrollArea>
        <div style={{ padding: "10px" }}>
          <Row>
            <Col lg="10" sm="8" style={{ padding: "0px 2px 0px 10px" }}>
              <Input
                style={{ marginTop: '5px' }}
                id="message"
                name="message"
                value={message}
                placeholder="Escribe un mensaje"
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
              />
            </Col>
            <Col lg="1" sm="2" style={{ padding: "0px 1px" }}>
              <Button onClick={genAI} data-tooltip-id="genAITooltip" title="Sugiere respuesta con IA" style={{ width: '100%' }}>
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </Button>
            </Col>
            <Col lg="1" sm="2" style={{ padding: "0px 10px 0px 0px" }}>
              <Button onClick={sendMessage} title="Envia el mensaje" style={{ width: '100%' }}><i className="fa-solid fa-paper-plane"></i></Button>
            </Col>
          </Row>
        </div>
      </Card>
      <ReactTooltip
        id="genAITooltip"
        place="bottom"
        variant="info">
          <p>Sugiere respuestas adecuadas segun el contexto de la conversacion.</p>
      </ReactTooltip>
    </div>
  );
}

export default Chat;
