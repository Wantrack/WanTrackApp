import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import NotificationAlert from "react-notification-alert";
import Loader from "../components/Loader/Loader";
import { axios } from "../config/https";
import constants from "../util/constans";
import { getCompanyId } from "../util/localStorageInfo";
import ScrollArea from "react-scrollbar";
import { Card } from "reactstrap";
import SocketService from "../socket";

const MESSAGE_LIMIT = 120;
const EMOJIS = ["😀", "😂", "😍", "🥰", "😊", "😉", "😎", "🤔", "😢", "😭", "😡", "👍", "👎", "👏", "🙏", "💪", "🎉", "❤️", "💙", "🔥", "✨", "✅", "📌", "📞", "📷", "🎤"];

function Chat({ embedded = false, selected = null, onBack = null }) {
  const scrollAreaRef = useRef(null);
  const notificationAlertRef = useRef(null);
  const refreshTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const recorderRef = useRef(null);
  const recordingStreamRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [name, setName] = useState("");
  const [loaderActive, setLoaderActive] = useState(false);
  const [startchat, setStarChat] = useState(false);
  const [assignment, setAssignment] = useState(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const currentPhone = selected?.phone || phone;
  const currentPhoneNumberId = selected?.phoneNumberId || phoneNumberId;
  const currentName = selected?.name || name;
  const headerTitle = useMemo(() => {
    const label = String(currentName || "").trim();
    const peer = String(currentPhone || "").trim();
    if (label && label !== peer) return label;
    if (peer.includes(".")) return "Contacto WhatsApp";
    return peer || "Conversación";
  }, [currentName, currentPhone]);
  const initials = useMemo(() => headerTitle.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase(), [headerTitle]);
  const toBottom = useCallback(() => window.setTimeout(() => scrollAreaRef.current?.scrollArea?.scrollBottom(), 120), []);
  const notify = useCallback((text, type = "success") => notificationAlertRef.current?.notificationAlert({ place: "tr", message: <div>{text}</div>, type, icon: "tim-icons icon-bell-55", autoDismiss: 7 }), []);

  const selectedPhone = selected?.phone;
  const selectedLine = selected?.phoneNumberId;
  const loadChats = useCallback(async ({ markRead = true, includeStatus = false, showLoader = false } = {}) => {
    const activePhone = selectedPhone || localStorage.getItem("currentPhone");
    const activeLine = selectedLine || localStorage.getItem("currentphoneNumberID");
    if (!activePhone || !activeLine) return;
    if (showLoader) setLoaderActive(true);
    const requests = [axios.get(`${constants.apiurl}/api/chats/${encodeURIComponent(activePhone)}/${encodeURIComponent(activeLine)}?limit=${MESSAGE_LIMIT}&markRead=${markRead}`)];
    if (includeStatus) {
      requests.push(axios.get(`${constants.apiurl}/api/chatisstop/${encodeURIComponent(activePhone)}/${encodeURIComponent(activeLine)}`));
      requests.push(axios.get(`${constants.apiurl}/api/chatassignment/${encodeURIComponent(activePhone)}/${encodeURIComponent(activeLine)}`));
    }
    try {
      const [chatResult, statusResult, assignmentResult] = await Promise.all(requests);
      setChats(Array.isArray(chatResult.data) ? chatResult.data : []);
      if (statusResult) setStarChat(statusResult.data.isStop);
      if (assignmentResult) setAssignment(assignmentResult.data || null);
      toBottom();
    } finally { if (showLoader) setLoaderActive(false); }
  }, [selectedPhone, selectedLine, toBottom]);

  async function toggleChat() {
    const next = !startchat;
    setStarChat(next);
    try {
      if (next && !assignment) {
        const claimed = await axios.post(`${constants.apiurl}/api/chats/claim`, { phone: currentPhone, phoneNumberId: currentPhoneNumberId });
        setAssignment(claimed.data?.assignment || claimed.data || null);
      }
      await axios.post(`${constants.apiurl}${next ? "/api/chatasesorstart" : "/api/chatasesorstop"}`, { phone: currentPhone, phoneNumberId: currentPhoneNumberId });
      if (!next) setAssignment(null);
    } catch (error) { setStarChat(!next); notify(error.response?.data?.error || "No fue posible cambiar el modo de atención.", "danger"); }
  }

  async function genAI() {
    if (!message.trim()) return;
    setLoaderActive(true);
    try {
      const result = await axios.get(`${constants.apiurl}/api/suggestionText/${encodeURIComponent(message)}`);
      setMessage(result.data.textosugerido);
      inputRef.current?.focus();
    } catch { notify("No fue posible generar la sugerencia.", "danger"); }
    finally { setLoaderActive(false); }
  }

  async function sendMessage() {
    const text = message.trim();
    if (!text || loaderActive) return;
    setLoaderActive(true);
    try {
      await axios.post(`${constants.apiurl}/api/chatssendmessage`, { phone: currentPhone, phoneNumberId: currentPhoneNumberId, message: text });
      setMessage(""); setEmojiOpen(false);
      await loadChats({ markRead: false });
    } catch (error) { notify(error.response?.data?.error || "No fue posible enviar el mensaje.", "danger"); }
    finally { setLoaderActive(false); inputRef.current?.focus(); }
  }

  async function sendMedia(file) {
    const companyId = getCompanyId();
    if (!file || !companyId) return notify("No se encontró la empresa para subir el archivo.", "danger");
    setLoaderActive(true);
    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      const upload = await axios.post(`${constants.apiurl}/api/aws/uploadtemplatemedia/${companyId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      await axios.post(`${constants.apiurl}/api/chatssendmedia`, { phone: currentPhone, phoneNumberId: currentPhoneNumberId, url: upload.data.url, mimetype: file.type || upload.data.mimetype, fileName: file.name });
      setAttachment(null);
      await loadChats({ markRead: false });
    } catch (error) { notify(error.response?.data?.error || "No fue posible enviar el archivo.", "danger"); }
    finally { setLoaderActive(false); }
  }

  function selectAttachment(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 16 * 1024 * 1024) return notify("El archivo supera el límite de 16 MB.", "warning");
    setAttachment(file);
  }

  function stopRecordingStream() {
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
    recordingStreamRef.current = null;
    window.clearInterval(recordingTimerRef.current);
  }

  async function toggleRecording() {
    if (recording) return recorderRef.current?.stop();
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return notify("Este navegador no permite grabar audio.", "warning");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream; recordingChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => event.data.size && recordingChunksRef.current.push(event.data);
      recorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, { type: recorder.mimeType });
        stopRecordingStream(); setRecording(false); setRecordingSeconds(0);
        if (blob.size) setAttachment(new File([blob], `audio-${Date.now()}.webm`, { type: recorder.mimeType }));
      };
      recorder.start(); setRecording(true); setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => setRecordingSeconds((seconds) => seconds + 1), 1000);
    } catch { stopRecordingStream(); notify("Necesitas permitir el acceso al micrófono.", "warning"); }
  }

  useEffect(() => {
    const nextPhone = selected?.phone || localStorage.getItem("currentPhone") || "";
    const nextLine = selected?.phoneNumberId || localStorage.getItem("currentphoneNumberID") || "";
    const nextName = selected?.name || localStorage.getItem("currentName") || "";
    setPhone(nextPhone);
    setPhoneNumberId(nextLine);
    setName(nextName);
    if (!nextPhone || !nextLine) {
      setChats([]);
      return undefined;
    }
    loadChats({ includeStatus: true, showLoader: false, markRead: true });
    const socket = new SocketService();
    const onRefresh = (payload) => {
      if (payload?.type === "read") return;
      if (payload?.phone && payload.phone !== nextPhone) return;
      if (payload?.phoneNumberId && payload.phoneNumberId !== nextLine) return;
      window.clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = window.setTimeout(() => loadChats({ markRead: false }), 250);
    };
    socket.getSocket().on("chatrefresh", () => onRefresh({}));
    socket.getSocket().on("conversation", onRefresh);
    return () => { window.clearTimeout(refreshTimeoutRef.current); stopRecordingStream(); socket.disconnect(); };
  }, [loadChats, selectedPhone, selectedLine]);

  function formatTime(value) {
    const date = new Date(value);
    return value && !Number.isNaN(date.getTime()) ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  }
  function mediaUrl(value) { return String(value || "").match(/https?:\/\/[^\s,]+/)?.[0] || `${constants.apiurl}/api/aws/getfileImage/imagesws2/${value}`; }
  function renderMessage(chat) {
    const type = String(chat.typeMessage || "text").toLowerCase();
    const url = mediaUrl(chat.media_url || chat.message);
    if (type === "image") return <a href={url} target="_blank" rel="noreferrer"><img className="wa-message-image" src={url} alt="Imagen compartida" /></a>;
    if (type === "video") return <video className="wa-message-video" src={url} controls preload="metadata" />;
    if (type === "audio" || type === "voice") return <div className="wa-audio"><i className="fa-solid fa-microphone" />{String(chat.message).startsWith("http") ? <audio src={url} controls preload="metadata" /> : <span>{chat.message}</span>}</div>;
    if (type === "document") return <a className="wa-document" href={url} target="_blank" rel="noreferrer"><i className="fa-solid fa-file-arrow-down" /><span>{chat.message || "Abrir documento"}</span></a>;
    return <p>{chat.message}</p>;
  }
  function renderTicks(chat) {
    if (Number(chat.type) !== 0) return null;
    if (chat.status === "failed") return <i className="fa-solid fa-circle-exclamation wa-tick failed" title="No se pudo entregar" />;
    if (chat.status === "read") return <i className="fa-solid fa-check-double wa-tick read" title="Leído" />;
    if (chat.status === "delivered") return <i className="fa-solid fa-check-double wa-tick delivered" title="Entregado" />;
    return <i className="fa-solid fa-check wa-tick sent" title="Enviado" />;
  }

  const windowOpen = useMemo(() => {
    const inbound = [...chats].reverse().find((chat) => Number(chat.type) === 1);
    if (selected?.window_expires_at) return new Date(selected.window_expires_at).getTime() > Date.now();
    if (!inbound?.creationdate) return false;
    return (Date.now() - new Date(inbound.creationdate).getTime()) < 24 * 60 * 60 * 1000;
  }, [chats, selected]);

  if (embedded && !currentPhone) {
    return <div className="wa-empty-thread"><i className="fa-regular fa-comments" /><h4>Selecciona una conversación</h4><p>El hilo, la ventana de 24 horas y la atención humana aparecen aquí.</p></div>;
  }

  return <div className={embedded ? "wa-chat-embedded" : "content wa-chat-page"}>
    <NotificationAlert ref={notificationAlertRef} /><Loader active={loaderActive} />
    <Card className="wa-chat-shell">
      <header className="wa-chat-header">
        {embedded && onBack ? <button className="wa-icon-button wa-back" type="button" onClick={onBack} aria-label="Volver"><i className="fa-solid fa-arrow-left" /></button> : null}
        <div className="wa-avatar">{initials}</div>
        <div className="wa-contact">
          <h4>{headerTitle}</h4>
          <span>{currentPhone}</span>
          {assignment && <small>{assignment.departmentName || "General"} · {assignment.userName}</small>}
        </div>
        <button className={`wa-human-mode ${startchat ? "active" : ""}`} type="button" onClick={toggleChat}><span>{startchat ? "Atención humana activa" : assignment ? "Activar atención humana" : "Tomar conversación"}</span><i className={startchat ? "fa-solid fa-toggle-on" : "fa-solid fa-toggle-off"} /></button>
      </header>
      {!windowOpen && <div className="wa-window-banner">La ventana de 24 horas está cerrada. El siguiente texto se enviará con plantilla de sesión.</div>}
      <ScrollArea style={{ height: embedded ? "100%" : "calc(100vh - 310px)", minHeight: embedded ? 0 : "390px" }} speed={0.8} className="area wa-chat-scroll" contentClassName="wa-message-list" ref={scrollAreaRef} vertical>
        <div className="wa-encryption-note"><i className="fa-solid fa-lock" /> Copia local del hilo. Las respuestas del bot en producción pueden no verse aquí.</div>
        {chats.length === 0 ? <div className="wa-encryption-note">Aún no hay mensajes guardados en esta conversación.</div> : null}
        {chats.map((chat) => { const outgoing = chat.type === 0; return <div key={chat.idauditTrail} className={`wa-message-row ${outgoing ? "outgoing" : "incoming"}`}><div className="wa-message-bubble">{renderMessage(chat)}<div className="wa-message-meta"><span>{formatTime(chat.creationdate)}</span>{renderTicks(chat)}</div></div></div>; })}
      </ScrollArea>
      {attachment && <div className="wa-attachment-preview"><i className={attachment.type.startsWith("audio/") ? "fa-solid fa-microphone" : attachment.type.startsWith("image/") ? "fa-solid fa-image" : "fa-solid fa-file"} /><div><strong>{attachment.name}</strong><span>{Math.ceil(attachment.size / 1024)} KB</span></div>{attachment.type.startsWith("audio/") && <audio src={URL.createObjectURL(attachment)} controls />}<button type="button" onClick={() => setAttachment(null)} aria-label="Quitar archivo"><i className="fa-solid fa-xmark" /></button><button type="button" className="send" onClick={() => sendMedia(attachment)} aria-label="Enviar archivo"><i className="fa-solid fa-paper-plane" /></button></div>}
      <footer className="wa-composer">
        {emojiOpen && <div className="wa-emoji-picker">{EMOJIS.map((emoji) => <button type="button" key={emoji} onClick={() => { setMessage((current) => `${current}${emoji}`); inputRef.current?.focus(); }}>{emoji}</button>)}</div>}
        <input ref={fileInputRef} className="wa-hidden-input" type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" onChange={selectAttachment} />
        <button className="wa-icon-button" type="button" onClick={() => setEmojiOpen((open) => !open)} aria-label="Elegir emoji"><i className="fa-regular fa-face-smile" /></button>
        <button className="wa-icon-button" type="button" onClick={() => fileInputRef.current?.click()} aria-label="Adjuntar archivo"><i className="fa-solid fa-paperclip" /></button>
        {recording ? <div className="wa-recording"><span className="pulse" /> Grabando {String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:{String(recordingSeconds % 60).padStart(2, "0")}</div> : <textarea ref={inputRef} rows="1" value={message} placeholder={windowOpen ? "Escribe un mensaje" : "Ventana cerrada: se enviará como plantilla"} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} />}
        {!recording && <button className="wa-icon-button ai" type="button" onClick={genAI} disabled={!message.trim()} aria-label="Sugerir con IA"><i className="fa-solid fa-wand-magic-sparkles" /></button>}
        {message.trim() && !recording ? <button className="wa-send-button" type="button" onClick={sendMessage} aria-label="Enviar"><i className="fa-solid fa-paper-plane" /></button> : <button className={`wa-send-button ${recording ? "recording" : ""}`} type="button" onClick={toggleRecording} aria-label={recording ? "Detener grabación" : "Grabar audio"}><i className={recording ? "fa-solid fa-stop" : "fa-solid fa-microphone"} /></button>}
      </footer>
    </Card>
  </div>;
}

export default Chat;
