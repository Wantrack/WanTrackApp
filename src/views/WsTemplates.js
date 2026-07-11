import React, { useState } from 'react';
import { Link } from "react-router-dom";
import Loader from '../components/Loader/Loader';
import TablePagination from '../components/Pagination/TablePagination';

import { axios } from '../config/https';
import constants from '../util/constans';
import useServerPagination from '../components/Pagination/useServerPagination';

import {
    Button,
    CardHeader,
    CardBody,
    Card
  } from "reactstrap";

function WsTemplates (props) {
    const [loaderActive, setLoaderActive] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const buildUrl = React.useCallback(({ page, pageSize }) => (
        `${constants.apiurl}/api/wstemplates?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(searchValue)}`
    ), [searchValue, refreshKey]);
    const pagination = useServerPagination(buildUrl, [searchValue, refreshKey]);

    async function refreshStatus(wstemplate) {
        setLoaderActive(true);
        try {
            await axios.post(`${constants.apiurl}/api/wstemplate/${wstemplate.idwstemplate}/status`);
            setRefreshKey(value => value + 1);
        } catch (error) {
            alert(error?.response?.data?.error || 'No fue posible consultar el estado en Meta.');
        } finally {
            setLoaderActive(false);
        }
    }
    
    return <div className="content">
                <Loader active={loaderActive || pagination.loading} />
                <Card>
                    <CardHeader>
                        <h5 className="title">Plantillas de Whatsapp</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="margin-bottom-2vh flex-left">
                            <div className="input-group flex-nowrap w-full">
                                <span className="input-group-text z-0" id="addon-wrapping"><i className="fa fa-search"></i></span>
                                <input type="text" className="form-control px-2" placeholder="Escriba el nombre de la plantilla de Whatsapp"
                                onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </div>
                            <Link className="btn btn-primary" to="/admin/wstemplate" onClick={() => goToWsTemplateOnClick(0)}> Crear Plantilla</Link>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>       
                                        <th>#</th>                           
                                        <th>Nombre</th>
                                        <th>Estado Meta</th>
                                        <th>Categoria</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagination.paginatedItems.map((wstemplate, index) => 
                                        <tr key={wstemplate.idwstemplate}>
                                            <td> <Link to="/admin/wstemplate" onClick={() => goToWsTemplateOnClick(wstemplate.idwstemplate)}>{pagination.startIndex + index + 1}</Link></td>
                                            <td> <Link to="/admin/wstemplate" onClick={() => goToWsTemplateOnClick(wstemplate.idwstemplate)}>{wstemplate.name}</Link></td>
                                            <td>{wstemplate.metaStatus || '-'}</td>
                                            <td>{wstemplate.metaCategory || wstemplate.category || '-'}</td>
                                            <td>
                                                <Button color="info" size="sm" type="button" disabled={!wstemplate.metaTemplateId} onClick={() => refreshStatus(wstemplate)}>
                                                    <i className="fa fa-rotate mr-1"></i> Estado
                                                </Button>
                                            </td>
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

function goToWsTemplateOnClick(idwstemplate) {
    localStorage.setItem('currentWsTemplateID', idwstemplate);
}

export default WsTemplates;
