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

function EmailTemplates (props) {
    const [emailTemplates, setEmailTemplates] = useState([]);
    const [loaderActive, setLoaderActive] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    
    useEffect(() => { 
        setLoaderActive(true)
        axios.get(`${constants.apiurl}/api/emailtemplates`).then(result => {
            setLoaderActive(false)
            setEmailTemplates(result.data);
        });       
    }, []);
    
    const filteredEmailTemplates = Array.isArray(emailTemplates) ? emailTemplates.filter(wsTemplate => String(wsTemplate.name).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) : []
    
    return <div className="content">
                <Loader active={loaderActive} />
                <Card>
                    <CardHeader>
                        <h5 className="title">Plantillas de Email</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="margin-bottom-2vh flex-left">
                            <div className="input-group flex-nowrap w-full">
                                <span className="input-group-text z-0" id="addon-wrapping"><i className="fa fa-search"></i></span>
                                <input type="text" className="form-control px-2" placeholder="Escriba el nombre de la plantilla de Email"
                                onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </div>
                            <Link className="btn btn-primary" to="/admin/emailtemplate" onClick={() => goToWsTemplateOnClick(0)}> Crear Plantilla</Link>
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
                                    {filteredEmailTemplates.map((emailtemplate, index) => 
                                        <tr key={emailtemplate.idemailtemplate}>
                                            <td> <Link to="/admin/emailtemplate" onClick={() => goToWsTemplateOnClick(emailtemplate.idemailtemplate)}>{index+ 1}</Link></td>
                                            <td> <Link to="/admin/emailtemplate" onClick={() => goToWsTemplateOnClick(emailtemplate.idemailtemplate)}>{emailtemplate.name}</Link></td>
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

export default EmailTemplates;