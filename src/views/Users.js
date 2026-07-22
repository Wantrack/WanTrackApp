import React, { useState } from 'react';
import { Link } from "react-router-dom";
import Loader from '../components/Loader/Loader';
import TablePagination from '../components/Pagination/TablePagination';
import constants from '../util/constans';
import useServerPagination from '../components/Pagination/useServerPagination';

import {
    CardHeader,
    CardBody,
    Card
  } from "reactstrap";

function Users (props) {
    const [searchValue, setSearchValue] = useState("");
    const buildUrl = React.useCallback(({ page, pageSize }) => (
        `${constants.apiurl}/api/users?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(searchValue)}`
    ), [searchValue]);
    const pagination = useServerPagination(buildUrl, [searchValue]);
    
    return <div className="content">
                <Loader active={pagination.loading} />
                <Card>
                    <CardHeader>
                        <h5 className="title">Usuarios</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="margin-bottom-2vh flex-left">
                            <div className="input-group flex-nowrap w-full">
                                <span className="input-group-text z-0" id="addon-wrapping"><i className="fa fa-search"></i></span>
                                <input type="text" className="form-control px-2" placeholder="Escriba el nombre del usuario"
                                onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </div>
                            <Link className="btn btn-primary" to="/admin/user" onClick={() => goToUserOnClick(0)}> Crear Usuario</Link>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>                            
                                        <th>Nombre</th>
                                        <th>Telefono</th>
                                        <th>Email</th>
                                        <th>Rol</th>                            
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagination.paginatedItems.map((user) => 
                                        <tr key={user.iduser}>
                                            <td> <Link to="/admin/user" onClick={() => goToUserOnClick(user.iduser)}>{user.name}</Link></td>
                                            <td> <Link to="/admin/user" onClick={() => goToUserOnClick(user.iduser)}>{user.phone}</Link></td>
                                            <td> <Link to="/admin/user" onClick={() => goToUserOnClick(user.iduser)}>{user.email}</Link></td>
                                            <td> <Link to="/admin/user" onClick={() => goToUserOnClick(user.iduser)}>{user.roles}</Link></td>
                                        </tr>
                                    )}                   
                                </tbody>          
                            </table>
                        </div> 
                        <TablePagination {...pagination} />
                    </CardBody>
                </Card>
    </div>;
}

function goToUserOnClick(idUser) {
    localStorage.setItem('currentUserID', idUser);
}

export default Users;
