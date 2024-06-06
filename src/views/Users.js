import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Loader from '../components/Loader/Loader';

import { axios } from '../config/https';
import constants from '../util/constans';

import {
    CardHeader,
    CardBody,
    Card
  } from "reactstrap";

function Users (props) {
    const [users, setUsers] = useState([]);
    const [loaderActive, setLoaderActive] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    
    useEffect(() => { 
        setLoaderActive(true)
        axios.get(`${constants.apiurl}/api/users`).then(result => {
            setLoaderActive(false)
            setUsers(result.data);
        });       
    }, []);
    
    const filteredUsers = Array.isArray(users) ? users.filter(user => String(user.name).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) : []
    
    return <div className="content">
                <Loader active={loaderActive} />
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
                                    {filteredUsers.map((user, index) => 
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
                    </CardBody>
                </Card>
    </div>;
}

function goToUserOnClick(idUser) {
    localStorage.setItem('currentUserID', idUser);
}

export default Users;