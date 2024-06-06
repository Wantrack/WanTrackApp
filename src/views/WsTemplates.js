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

function WsTemplates (props) {
    const [wsTemplates, setWsTemplates] = useState([]);
    const [loaderActive, setLoaderActive] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    
    useEffect(() => { 
        setLoaderActive(true)
        axios.get(`${constants.apiurl}/api/wstemplates`).then(result => {
            setLoaderActive(false)
            setWsTemplates(result.data);
        });       
    }, []);
    
    const filteredWsTemplates = Array.isArray(wsTemplates) ? wsTemplates.filter(wsTemplate => String(wsTemplate.name).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) : []
    
    return <div className="content">
                <Loader active={loaderActive} />
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredWsTemplates.map((wstemplate, index) => 
                                        <tr key={wstemplate.idwstemplate}>
                                            <td> <Link to="/admin/wstemplate" onClick={() => goToWsTemplateOnClick(wstemplate.idwstemplate)}>{index+ 1}</Link></td>
                                            <td> <Link to="/admin/wstemplate" onClick={() => goToWsTemplateOnClick(wstemplate.idwstemplate)}>{wstemplate.name}</Link></td>
                                        </tr>
                                    )}                   
                                </tbody>          
                            </table>
                        </div> 
                    </CardBody>
                </Card>
    </div>;
}

function goToWsTemplateOnClick(idwstemplate) {
    localStorage.setItem('currentWsTemplateID', idwstemplate);
}

export default WsTemplates;