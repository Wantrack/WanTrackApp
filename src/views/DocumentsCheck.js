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

function DocumentsCheck (props) {
    const [documents, setDocuments] = useState([]);
    const [loaderActive, setLoaderActive] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    
    useEffect(() => { 
        setLoaderActive(true)
        axios.get(`${constants.apiurl}/api/verificators`).then(result => {
            setLoaderActive(false)
            setDocuments(result.data);
        });
        setLoaderActive(false)
        
    }, []);
    
    const filteredDocuments = Array.isArray(documents) ? documents.filter(document => String(document.name).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) : []
    
    return <div className="content">
                <Loader active={loaderActive} />
                <Card>
                    <CardHeader>
                        <h5 className="title">Verificacion de documentos</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="margin-bottom-2vh flex-left">
                            <div className="input-group flex-nowrap w-full">
                                <span className="input-group-text z-0" id="addon-wrapping"><i className="fa fa-search"></i></span>
                                <input type="text" className="form-control px-2" placeholder="Escriba el nombre del verificador"
                                onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </div>
                            <Link className="btn btn-primary" to="/admin/documentCheck" onClick={() => goToDocumentCheckOnClick(0)}> Crear verficador</Link>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>                            
                                        <th>Nombre</th>                         
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDocuments.map((document, index) => 
                                        <tr key={document.id}>
                                            <td> <Link to="/admin/documentCheck" onClick={() => goToDocumentCheckOnClick(document.idverificator)}>{document.name}</Link></td>
                                        </tr>
                                    )}                   
                                </tbody>          
                            </table>
                        </div> 
                    </CardBody>
                </Card>
    </div>;
}

function goToDocumentCheckOnClick(idCompany) {
    localStorage.setItem('currentVerificatorID', idCompany);
}

export default DocumentsCheck;