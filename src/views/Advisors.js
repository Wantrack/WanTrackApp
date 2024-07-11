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

function Advisors (props) {
    const [advisors, setAdvisors] = useState([]);
    const [loaderActive, setLoaderActive] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    
    useEffect(() => { 
        setLoaderActive(true)
        axios.get(`${constants.apiurl}/api/adviser`).then(result => {
            setLoaderActive(false)
            setAdvisors(result.data);
        });       
    }, []);
    
    const filteredUsers = Array.isArray(advisors) ? advisors.filter(advisor => String(advisor.name).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) : []
    
    return <div className="content">
                <Loader active={loaderActive} />
                <Card>
                    <CardHeader>
                        <h5 className="title">Asesores</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="margin-bottom-2vh flex-left">
                            <div className="input-group flex-nowrap w-full">
                                <span className="input-group-text z-0" id="addon-wrapping"><i className="fa fa-search"></i></span>
                                <input type="text" className="form-control px-2" placeholder="Escriba el nombre del asesor"
                                onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </div>
                            <Link className="btn btn-primary" to="/admin/advisor" onClick={() => goToAdvisorOnClick(0)}> Crear Asesor</Link>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>                            
                                        <th>Nombres</th>
                                        <th>Apellidos</th>                     
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((advisor, index) => 
                                        <tr key={index}>
                                            <td> <Link to="/admin/advisor" onClick={() => goToAdvisorOnClick(advisor.idadviser)}>{advisor.name}</Link></td>
                                            <td> <Link to="/admin/advisor" onClick={() => goToAdvisorOnClick(advisor.idadviser)}>{advisor.lastName}</Link></td>
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