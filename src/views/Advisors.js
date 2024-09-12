import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Loader from '../components/Loader/Loader';

import { axios } from '../config/https';
import constants from '../util/constans';

import { clockformat } from 'util/time';

import { decode } from "../util/base64";


import {
    CardHeader,
    CardBody,
    Card
  } from "reactstrap";

function Advisors (props) {
    const [advisors, setAdvisors] = useState([]);
    const [loaderActive, setLoaderActive] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    
    useEffect(() => { 
        setLoaderActive(true);
        let idCompany = undefined;
        const _userinfoEncoded = localStorage.getItem(constants.userinfo);
        if(_userinfoEncoded) {
            const _userinfo = JSON.parse(decode(_userinfoEncoded));
            if(_userinfo.idCompany) {
                idCompany =_userinfo.idCompany
            }
        }
        axios.get(`${constants.apiurl}/api/adviser/${idCompany}`).then(result => {
            setLoaderActive(false);
            setAdvisors(result.data);
        });       
    }, []);
    
    const filteredUsers = Array.isArray(advisors) ? advisors.filter(advisor => String(advisor.name).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) : []
    
    return <div className="content">
                <Loader active={loaderActive} />
                <Card>
                    <CardHeader>
                        <h5 className="title">Agentes</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="margin-bottom-2vh flex-left">
                            <div className="input-group flex-nowrap w-full">
                                <span className="input-group-text z-0" id="addon-wrapping"><i className="fa fa-search"></i></span>
                                <input type="text" className="form-control px-2" placeholder="Escriba el nombre del agentes"
                                onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </div>
                            <Link className="btn btn-primary" to="/admin/advisor" onClick={() => goToAdvisorOnClick(0)}> Crear Agente</Link>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>                            
                                        <th>Nombre Completo</th>
                                        <th>Tiempo en llamada</th>                     
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((advisor, index) => 
                                        <tr key={index}>
                                            <td> <Link to="/admin/advisor" onClick={() => goToAdvisorOnClick(advisor.idadviser)}>{advisor.name} {advisor.lastName}</Link></td>
                                            <td> <Link to="/admin/advisor" onClick={() => goToAdvisorOnClick(advisor.idadviser)}>{ clockformat(advisor.audioDuration || 0)}</Link></td>
                                        </tr>
                                    )}                   
                                </tbody>          
                            </table>
                        </div> 
                    </CardBody>
                </Card>
    </div>;
}

function goToAdvisorOnClick(idadviser) {
    localStorage.setItem('currentAdvisorID', idadviser);
}

export default Advisors;