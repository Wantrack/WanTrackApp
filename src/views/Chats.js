import React from 'react';
import { Link } from "react-router-dom";
import NotificationAlert from "react-notification-alert";
import Loader from '../components/Loader/Loader';
import TablePagination from '../components/Pagination/TablePagination';
import useServerPagination from '../components/Pagination/useServerPagination';
import constants from '../util/constans';
import { axios } from '../config/https';
import SocketService from "../socket";

import {
    Button,
    CardHeader,
    CardBody,
    Card,
    CardFooter,
} from "reactstrap";

function Chats() {
    const [searchValue, setSearchValue] = React.useState('');
    const [debouncedSearch, setDebouncedSearch] = React.useState('');
    const [refreshKey, setRefreshKey] = React.useState(0);
    const [activeAssignments, setActiveAssignments] = React.useState([]);
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

        if (debouncedSearch) {
            params.set('search', debouncedSearch);
        }

        return `${constants.apiurl}/api/chats?${params.toString()}`;
    }, [debouncedSearch, refreshKey]);

    const pagination = useServerPagination(buildUrl, [debouncedSearch, refreshKey], 25);

    React.useEffect(() => {
        loadActiveAssignments();
    }, [loadActiveAssignments, refreshKey]);

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

        return () => {
            socket.disconnect();
        };
    }, []);

    return <div className="content">
                <NotificationAlert ref={notificationAlertRef} />
                <Loader active={pagination.loading || assignmentsLoading} />
                <Card>
                    <CardHeader className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="title mb-1">Asignaciones activas</h5>
                            <small>Incluye chats sin mensajes que no aparecen en el listado general.</small>
                        </div>
                        <Button color="danger" size="sm" disabled={activeAssignments.length === 0 || assignmentsLoading} onClick={closeAllAssignments}>
                            Liberar todas ({activeAssignments.length})
                        </Button>
                    </CardHeader>
                    <CardBody>
                        {activeAssignments.length === 0 ? (
                            <p className="mb-0">No hay asignaciones activas.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead><tr><th>Cliente</th><th>Cuenta</th><th>Departamento</th><th>Agente</th><th>Asignado</th><th></th></tr></thead>
                                    <tbody>
                                        {activeAssignments.map((assignment) => (
                                            <tr key={assignment.idchatAssignments}>
                                                <td>{assignment.phone}</td>
                                                <td>{assignment.accountName || assignment.accountPhone || assignment.phoneNumberId}</td>
                                                <td>{assignment.departmentName || 'General'}</td>
                                                <td>{assignment.userName}</td>
                                                <td>{assignment.creationDate}</td>
                                                <td>
                                                    <Button color="danger" size="sm" outline onClick={() => closeAssignment(assignment)}>
                                                        Liberar
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardBody>
                </Card>
                <Card>
                    <CardHeader>
                        <h5 className="title">Chats</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="margin-bottom-2vh flex-left">
                            <div className="input-group flex-nowrap w-full">
                                <span className="input-group-text z-0" id="addon-wrapping"><i className="fa fa-search"></i></span>
                                <input
                                    type="text"
                                    className="form-control px-2"
                                    placeholder="Escriba el nombre o telefono del contacto"
                                    value={searchValue}
                                    onChange={(event) => setSearchValue(event.target.value)}
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
                                        <th>Departamento</th>
                                        <th>Agente asignado</th>
                                        <th>Fecha ultimo mensaje</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagination.paginatedItems.map((chat, index) =>
                                        <tr key={`${chat.phone}-${chat.phoneNumberId}`}>
                                            <td><Link to="/admin/chat" onClick={() => goToChat(chat.phone, chat.phoneNumberId, chat.name)}>{pagination.startIndex + index + 1}</Link></td>
                                            <td><Link to="/admin/chat" onClick={() => goToChat(chat.phone, chat.phoneNumberId, chat.name)}>{chat.phone}</Link></td>
                                            <td><Link to="/admin/chat" onClick={() => goToChat(chat.phone, chat.phoneNumberId, chat.name)}>{chat.name}</Link></td>
                                            <td>{chat.departmentName || 'General'}</td>
                                            <td>{chat.assignedUserName || 'Sin asignar'}</td>
                                            <td><Link to="/admin/chat" onClick={() => goToChat(chat.phone, chat.phoneNumberId, chat.name)}>{chat.last_creationdate}</Link></td>
                                            <td>{chat.isalert ? <i title='No haz leido los mensajes' style={{ color: '#f5365c' }} className="fa-solid fa-circle-exclamation"></i> : null}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                    <CardFooter>
                        <TablePagination {...pagination} />
                    </CardFooter>
                </Card>
    </div>;
}

function goToChat(phone, phoneNumberId, name) {
    localStorage.setItem('currentPhone', phone);
    localStorage.setItem('currentName', name || '');
    localStorage.setItem('currentphoneNumberID', phoneNumberId);
}

export default Chats;
