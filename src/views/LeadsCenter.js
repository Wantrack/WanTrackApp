import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Loader from '../components/Loader/Loader';
import { decode } from "../util/base64";
import { axios } from '../config/https';
import constants from '../util/constans';
import {
    CardHeader,
    CardBody,
    Card
  } from "reactstrap";

function LeadsCenter (props) {
    const [scatterLists, setScatterLists] = useState([]);
    const [loaderActive, setLoaderActive] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    
    useEffect(() => { 
        let idCompany = undefined;
        const _userinfoEncoded = localStorage.getItem(constants.userinfo);
        if(_userinfoEncoded) {
            const _userinfo = JSON.parse(decode(_userinfoEncoded));
            if(_userinfo.idCompany) {
                idCompany =_userinfo.idCompany
            }
        }

        setLoaderActive(true)
        axios.get(`${constants.apiurl}/api/scatterlistsleads${idCompany ? `?idcompany=${idCompany}` : ''}`).then(result => {
            setLoaderActive(false)
            setScatterLists(result.data);
        });
    }, []);
    
    const filteredScatterList = Array.isArray(scatterLists) ? scatterLists.filter(wsTemplate => String(wsTemplate.name).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) : []
    
    return <div className="content">
                <Loader active={loaderActive} />
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
                                    {filteredScatterList.map((scatterList, index) => 
                                        <tr key={scatterList.idscatterlist}>
                                            <td> <Link to="/admin/leadviewer" onClick={() => goToScatterLists(scatterList.idscatterlist, scatterList.name)}>{index + 1}</Link></td>
                                            <td> <Link to="/admin/leadviewer" onClick={() => goToScatterLists(scatterList.idscatterlist, scatterList.name)}>{scatterList.name}</Link></td>
                                        </tr>
                                    )}
                                </tbody>          
                            </table>
                        </div> 
                    </CardBody>
                </Card>
    </div>;
}

function goToScatterLists(idscatterlist, name) {
    localStorage.setItem('currentleadID', idscatterlist);
    localStorage.setItem('currentleadName', name);
}

export default LeadsCenter;