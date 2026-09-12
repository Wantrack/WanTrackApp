import React, { useState } from 'react';
import { Link } from "react-router-dom";
import Loader from '../components/Loader/Loader';
import TablePagination from '../components/Pagination/TablePagination';
import { decode } from "../util/base64";
import { axios } from '../config/https';
import constants from '../util/constans';
import useServerPagination from '../components/Pagination/useServerPagination';
import {
    CardHeader,
    CardBody,
    Card,
    Button
  } from "reactstrap";

function ScatterLists (props) {
    const [searchValue, setSearchValue] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [actionError, setActionError] = useState('');

    function getCompanyQuery() {
        let idCompany = undefined;
        const _userinfoEncoded = localStorage.getItem(constants.userinfo);
        if(_userinfoEncoded) {
            const _userinfo = JSON.parse(decode(_userinfoEncoded));
            if(_userinfo.idCompany) {
                idCompany =_userinfo.idCompany
            }
        }
        return idCompany ? `&idcompany=${idCompany}` : '';
    }

    const buildUrl = React.useCallback(({ page, pageSize }) => (
        `${constants.apiurl}/api/scatterlists?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(searchValue)}${getCompanyQuery()}`
    ), [searchValue, refreshKey]);
    const pagination = useServerPagination(buildUrl, [searchValue, refreshKey]);

    async function copyScatterList(idscatterlist) {
        try {
            await axios.post(`${constants.apiurl}/api/scatterlistscopy`, {idscatterlist});
            setRefreshKey(value => value + 1);
        } catch (error) { setActionError(error?.response?.data?.message || 'No se pudo copiar la campaña.'); }
    }

    async function deleteCampaign(campaign) {
        if (!window.confirm(`¿Eliminar la campaña "${campaign.name}" y sus contactos?`)) return;
        try {
            setActionError('');
            await axios.delete(`${constants.apiurl}/api/scatterlist/${campaign.idscatterlist}`);
            setRefreshKey(value => value + 1);
        } catch (error) { setActionError(error?.response?.data?.message || 'No se pudo eliminar la campaña.'); }
    }
    
    return <div className="content">
                <Loader active={pagination.loading} />
                <Card>
                    <CardHeader>
                        <h5 className="title">Listas de difusión</h5>
                    </CardHeader>
                    <CardBody>
                        {actionError && <p role="alert" className="text-danger">{actionError}</p>}
                        <div className="margin-bottom-2vh flex-left">
                            <div className="input-group flex-nowrap w-full">
                                <span className="input-group-text z-0" id="addon-wrapping"><i className="fa fa-search"></i></span>
                                <input type="text" className="form-control px-2" placeholder="Escriba el nombre de la lista de difusión"
                                onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </div>
                            <Link className="btn btn-primary" to="/admin/list" onClick={() => goToScatterLists(0)}> Crear Lista de difusión</Link>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>       
                                        <th>#</th>
                                        <th>Nombre</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagination.paginatedItems.map((scatterList, index) => 
                                        <tr key={scatterList.idscatterlist}>
                                            <td> <Link to="/admin/list" onClick={() => goToScatterLists(scatterList.idscatterlist)}>{pagination.startIndex + index + 1}</Link></td>
                                            <td> <Link to="/admin/list" onClick={() => goToScatterLists(scatterList.idscatterlist)}>{scatterList.name}</Link></td>
                                            <td>
                                                <Button size="sm" onClick={() => copyScatterList(scatterList.idscatterlist)}>Copiar</Button>
                                                <Button size="sm" color="danger" disabled={!!scatterList.locked}
                                                    title={scatterList.locked ? 'Esta campaña tiene envíos registrados o reservados' : 'Eliminar campaña'}
                                                    onClick={() => deleteCampaign(scatterList)}>Eliminar</Button>
                                                {!!scatterList.locked && <small> Tiene historial de envíos</small>}
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

function goToScatterLists(idscatterlist) {
    localStorage.setItem('currentScatterListID', idscatterlist);
}

export default ScatterLists;
