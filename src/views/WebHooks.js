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

function WebHooks (props) {
    const [searchValue, setSearchValue] = useState('');
    const buildUrl = React.useCallback(({ page, pageSize }) => (
        `${constants.apiurl}/api/webhook/webhooks?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(searchValue)}`
    ), [searchValue]);
    const pagination = useServerPagination(buildUrl, [searchValue]);
    
    return <div className="content">
                <Loader active={pagination.loading} />
                <Card>
                    <CardHeader>
                        <h5 className="title">Listas de Webhooks</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="margin-bottom-2vh flex-left">
                            <div className="input-group flex-nowrap w-full">
                                <span className="input-group-text z-0" id="addon-wrapping"><i className="fa fa-search"></i></span>
                                <input type="text" className="form-control px-2" placeholder="Escriba el nombre del webhook"
                                onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </div>
                            <Link className="btn btn-primary" to="/admin/webhook" onClick={() => goToWebHooks(0)}> Crear WebHook</Link>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>       
                                        <th>#</th>
                                        <th>Nombre</th>
                                        <th>Url</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagination.paginatedItems.map((webHook, index) => 
                                        <tr key={webHook.idwebhookmessages}>
                                            <td> <Link to="/admin/webhook" onClick={() => goToWebHooks(webHook.idwebhookmessages)}>{pagination.startIndex + index + 1}</Link></td>
                                            <td> <Link to="/admin/webhook" onClick={() => goToWebHooks(webHook.idwebhookmessages)}>{webHook.name}</Link></td>
                                            <td> <Link to="/admin/webhook" onClick={() => goToWebHooks(webHook.idwebhookmessages)}>{webHook.url}</Link></td>                                          
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

function goToWebHooks(idwebhookmessages) {
    localStorage.setItem('currentWebHookID', idwebhookmessages);
}

export default WebHooks;
