import React, { useState } from 'react';
import { Link } from "react-router-dom";
import Loader from '../components/Loader/Loader';
import TablePagination from '../components/Pagination/TablePagination';
import { decode } from "../util/base64";
import constants from '../util/constans';
import useServerPagination from '../components/Pagination/useServerPagination';
import {
    CardHeader,
    CardBody,
    Card
  } from "reactstrap";

function LeadsCenter (props) {
    const [searchValue] = useState('');
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
        `${constants.apiurl}/api/scatterlistsleads?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(searchValue)}${getCompanyQuery()}`
    ), [searchValue]);
    const pagination = useServerPagination(buildUrl, [searchValue]);
    
    return <div className="content">
                <Loader active={pagination.loading} />
                <Card>
                    <CardHeader>
                        <h5 className="title">Leads Center</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="margin-bottom-2vh flex-left">                           
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>       
                                        <th>#</th>                           
                                        <th>Nombre</th>                           
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagination.paginatedItems.map((scatterList, index) => 
                                        <tr key={scatterList.idscatterlist}>
                                            <td> <Link to="/admin/leadviewer" onClick={() => goToScatterLists(scatterList.idscatterlist, scatterList.name)}>{pagination.startIndex + index + 1}</Link></td>
                                            <td> <Link to="/admin/leadviewer" onClick={() => goToScatterLists(scatterList.idscatterlist, scatterList.name)}>{scatterList.name}</Link></td>
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

function goToScatterLists(idscatterlist, name) {
    localStorage.setItem('currentleadID', idscatterlist);
    localStorage.setItem('currentleadName', name);
}

export default LeadsCenter;
