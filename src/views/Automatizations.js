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

function Automatizations (props) {
    const [automatizations, setAutomatizations] = useState([]);
    const [loaderActive, setLoaderActive] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    
    useEffect(() => { 
        //setLoaderActive(true)
        // axios.get(`${constants.apiurl}/api/automatization`).then(result => {
        //     setLoaderActive(false)
        //     setAutomatizations(result.data);
        // });       
        setAutomatizations([
            {
                id: 1,
                name: 'Rigs Whastapp y Email'
            }
        ]);
        setLoaderActive(false)
        
    }, []);
    
    const filteredAutomatizations = Array.isArray(automatizations) ? automatizations.filter(automatization => String(automatization.name).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) : []
    
    return <div className="content">
                <Loader active={loaderActive} />
                <Card>
                    <CardHeader>
                        <h5 className="title">Automatizaciones</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="margin-bottom-2vh flex-left">
                            <div className="input-group flex-nowrap w-full">
                                <span className="input-group-text z-0" id="addon-wrapping"><i className="fa fa-search"></i></span>
                                <input type="text" className="form-control px-2" placeholder="Escriba el nombre de la automatizacion"
                                onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </div>
                            <Link className="btn btn-primary" to="/admin/automatization" onClick={() => goToCompanyOnClick(0)}> Crear Automatizacion</Link>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>                            
                                        <th>Nombre</th>                         
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAutomatizations.map((automatization, index) => 
                                        <tr key={automatization.id}>
                                            <td> <Link to="/admin/automatization" onClick={() => goToCompanyOnClick(automatization.id)}>{automatization.name}</Link></td>
                                        </tr>
                                    )}                   
                                </tbody>          
                            </table>
                        </div> 
                    </CardBody>
                </Card>
    </div>;
}

function goToCompanyOnClick(idCompany) {
    localStorage.setItem('currentCompanyID', idCompany);
}

export default Automatizations;