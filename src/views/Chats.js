import React from 'react';
import NotificationAlert from "react-notification-alert";
import Loader from '../components/Loader/Loader';
import TablePagination from '../components/Pagination/TablePagination';
import useServerPagination from '../components/Pagination/useServerPagination';
import constants from '../util/constans';
import { axios } from '../config/https';
import SocketService from "../socket";
import Chat from './Chat';

const FILTERS = [
    { id: 'active', label: 'Activos' },
    { id: 'unread', label: 'No leídas' },
    { id: 'human', label: 'Humanas' },
    { id: 'bot', label: 'Bot' },
];

function statusLabel(status) {
    if (status === 'human') return 'Humano';
    if (status === 'waiting_human') return 'En espera';
    if (status === 'closed') return 'Cerrado';
    return 'Bot';
}

function isScopedId(value) {
    return /\./.test(String(value || ''));
}

function chatTitle(chat) {
    const name = String(chat?.name || '').trim();
    const phone = String(chat?.phone || '').trim();
    if (name && name !== phone) return name;
    if (isScopedId(phone)) return 'Contacto WhatsApp';
    return phone || 'Conversación';
}

function chatSubtitle(chat) {
    const name = String(chat?.name || '').trim();
    const phone = String(chat?.phone || '').trim();
    if (name && name !== phone) return phone;
    return isScopedId(phone) ? phone : '';
}

function relativeTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'ahora';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} d`;
    return date.toLocaleDateString();
}

function Chats() {
    const [searchValue, setSearchValue] = React.useState('');
    const [debouncedSearch, setDebouncedSearch] = React.useState('');
    const [filter, setFilter] = React.useState('active');
    const [refreshKey, setRefreshKey] = React.useState(0);
    const [selected, setSelected] = React.useState(null);
    const [activeAssignments, setActiveAssignments] = React.useState([]);
    const [assignmentsOpen, setAssignmentsOpen] = React.useState(false);
    const [assignmentsLoading, setAssignmentsLoading] = React.useState(false);
    const notificationAlertRef = React.useRef(null);

    const sendNotification = React.useCallback((message, type = 'success') => {
        notificationAlertRef.current?.notificationAlert({
            place: 'tr',
            message: <div><div>{message}</div></div>,
            type,
            icon: "tim-icons icon-bell-55",
            autoDismiss: 6,
        });
    }, []);

    const loadActiveAssignments = React.useCallback(async () => {
        setAssignmentsLoading(true);
        try {
            const result = await axios.get(`${constants.apiurl}/api/chatassignments/active`);
            setActiveAssignments(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            sendNotification('No fue posible cargar las asignaciones activas.', 'danger');
        } finally {
            setAssignmentsLoading(false);
        }
    }, [sendNotification]);

    React.useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(searchValue.trim()), 350);
        return () => clearTimeout(timeout);
    }, [searchValue]);

    const buildUrl = React.useCallback(({ page, pageSize }) => {
        const params = new URLSearchParams({
            page,
            pageSize,
        });
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (filter) params.set('filter', filter);
        return `${constants.apiurl}/api/chats?${params.toString()}`;
    }, [debouncedSearch, filter, refreshKey]);

    const pagination = useServerPagination(buildUrl, [debouncedSearch, filter, refreshKey], 40);

    React.useEffect(() => {
        loadActiveAssignments();
    }, [loadActiveAssignments, refreshKey]);

    const upsertConversation = React.useCallback((conversation) => {
        if (!conversation?.idconversation && !conversation?.phone) return;
        setSelected((current) => {
            if (!current) return current;
            const same = (conversation.idconversation && current.idconversation === conversation.idconversation)
                || (conversation.phone === current.phone && conversation.phoneNumberId === current.phoneNumberId);
            return same ? { ...current, ...conversation } : current;
        });
    }, []);

    const closeAssignment = async (assignment) => {
        if(!window.confirm(`¿Liberar el chat ${assignment.phone} asignado a ${assignment.userName}?`)) return;
        setAssignmentsLoading(true);
        try {
            await axios.post(`${constants.apiurl}/api/chatassignments/${assignment.idchatAssignments}/close`);
            sendNotification('La asignación fue cerrada y el bot puede responder nuevamente.');
            setRefreshKey(value => value + 1);
        } catch (error) {
            sendNotification(error.response?.data?.error || 'No fue posible cerrar la asignación.', 'danger');
            setAssignmentsLoading(false);
        }
    };

    const closeAllAssignments = async () => {
        if(activeAssignments.length === 0) return;
        if(!window.confirm(`¿Liberar las ${activeAssignments.length} asignaciones activas? El historial no se eliminará.`)) return;
        setAssignmentsLoading(true);
        try {
            const result = await axios.post(`${constants.apiurl}/api/chatassignments/close-all`, {});
            sendNotification(`Se cerraron ${Number(result.data?.closed || 0)} asignaciones.`);
            setRefreshKey(value => value + 1);
        } catch (error) {
            sendNotification(error.response?.data?.error || 'No fue posible cerrar las asignaciones.', 'danger');
            setAssignmentsLoading(false);
        }
    };

    React.useEffect(() => {
        const socket = new SocketService();
        socket.getSocket().on('notificationrefresh', () => {
            setRefreshKey(value => value + 1);
        });
        socket.getSocket().on('conversation', (payload) => {
            if (payload?.conversation) {
                upsertConversation(payload.conversation);
            }
            if (payload?.type === 'message' || payload?.type === 'status') {
                setRefreshKey(value => value + 1);
            }
        });
        return () => {
            socket.disconnect();
        };
    }, [upsertConversation]);

    function openConversation(chat) {
        localStorage.setItem('currentPhone', chat.phone);
        localStorage.setItem('currentName', chat.name || '');
        localStorage.setItem('currentphoneNumberID', chat.phoneNumberId);
        setSelected(chat);
    }

    const unreadTotal = pagination.paginatedItems.reduce((sum, chat) => sum + Number(chat.unread_count || 0), 0);

    return <div className="content wa-inbox-page">
        <NotificationAlert ref={notificationAlertRef} />
        <Loader active={assignmentsLoading} />
        <div className={`wa-inbox-shell ${selected ? 'has-thread' : ''}`}>
            <aside className="wa-inbox-list">
                <div className="wa-inbox-toolbar">
                    <div>
                        <h5>Bandeja</h5>
                        <small>{unreadTotal > 0 ? `${unreadTotal} sin leer` : 'Al día'}</small>
                    </div>
                    <button className="wa-inbox-assign" type="button" onClick={() => setAssignmentsOpen((open) => !open)}>
                        Asignadas {activeAssignments.length}
                    </button>
                </div>
                {assignmentsOpen && (
                    <div className="wa-assign-panel">
                        <div className="wa-assign-panel-head">
                            <span>Atención humana activa</span>
                            <button type="button" disabled={activeAssignments.length === 0} onClick={closeAllAssignments}>Liberar todas</button>
                        </div>
                        {activeAssignments.length === 0 ? <p>No hay asignaciones.</p> : activeAssignments.map((assignment) => (
                            <div key={assignment.idchatAssignments} className="wa-assign-row">
                                <div>
                                    <strong>{assignment.phone}</strong>
                                    <small>{assignment.userName} · {assignment.departmentName || 'General'}</small>
                                </div>
                                <button type="button" onClick={() => closeAssignment(assignment)}>Liberar</button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="wa-inbox-search">
                    <i className="fa fa-search" />
                    <input
                        type="text"
                        placeholder="Buscar nombre o teléfono"
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                    />
                </div>
                <div className="wa-inbox-filters">
                    {FILTERS.map((item) => (
                        <button key={item.id || 'all'} type="button" className={filter === item.id ? 'active' : ''} onClick={() => setFilter(item.id)}>
                            {item.label}
                        </button>
                    ))}
                </div>
                <div className="wa-inbox-items">
                    {pagination.paginatedItems.length === 0 && !pagination.loading ? (
                        <div className="wa-inbox-empty">No hay conversaciones en este filtro.</div>
                    ) : pagination.paginatedItems.map((chat) => {
                        const isSelected = selected && selected.phone === chat.phone && selected.phoneNumberId === chat.phoneNumberId;
                        return (
                            <button
                                type="button"
                                key={`${chat.phone}-${chat.phoneNumberId}`}
                                className={`wa-inbox-item ${isSelected ? 'selected' : ''} ${Number(chat.unread_count) > 0 ? 'unread' : ''}`}
                                onClick={() => openConversation(chat)}
                            >
                                <div className="wa-inbox-avatar">{String(chatTitle(chat)).slice(0, 2).toUpperCase()}</div>
                                <div className="wa-inbox-body">
                                    <div className="wa-inbox-top">
                                        <strong>{chatTitle(chat)}</strong>
                                        <span>{relativeTime(chat.last_creationdate)}</span>
                                    </div>
                                    <div className="wa-inbox-preview">{chat.last_message_preview || chatSubtitle(chat) || chat.phone}</div>
                                    <div className="wa-inbox-meta">
                                        <em className={`wa-status ${chat.status || 'bot'}`}>{statusLabel(chat.status)}</em>
                                        {chat.assignedUserName ? <span>{chat.assignedUserName}</span> : null}
                                    </div>
                                </div>
                                {Number(chat.unread_count) > 0 ? <b className="wa-unread">{chat.unread_count}</b> : null}
                            </button>
                        );
                    })}
                </div>
                <div className="wa-inbox-pager">
                    <TablePagination {...pagination} />
                </div>
            </aside>
            <section className="wa-inbox-thread">
                <Chat
                    embedded
                    selected={selected}
                    onBack={() => setSelected(null)}
                />
            </section>
        </div>
    </div>;
}

export default Chats;
