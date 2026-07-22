import React from 'react';
import { Link } from "react-router-dom";
import Loader from '../components/Loader/Loader';
import TablePagination from '../components/Pagination/TablePagination';
import useServerPagination from '../components/Pagination/useServerPagination';
import constants from '../util/constans';
import SocketService from "../socket";

import {
    CardHeader,
    CardBody,
    Card,
    CardFooter,
} from "reactstrap";

function Chats() {
    const [searchValue, setSearchValue] = React.useState('');
    const [debouncedSearch, setDebouncedSearch] = React.useState('');
    const [refreshKey, setRefreshKey] = React.useState(0);

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
        const socket = new SocketService();
        socket.getSocket().on('notificationrefresh', () => {
            setRefreshKey(value => value + 1);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return <div className="content">
                <Loader active={pagination.loading} />
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
