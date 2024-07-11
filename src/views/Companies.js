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

function Companies (props) {
    const [companies, setCompanies] = useState([]);
    const [loaderActive, setLoaderActive] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    
    useEffect(() => { 
        setLoaderActive(true)
        axios.get(`${constants.apiurl}/api/companies`).then(result => {
            setLoaderActive(false)
            setCompanies(result.data);
        });       
    }, []);
    
    const filteredCompanies = Array.isArray(companies) ? companies.filter(company => String(company.name).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) : []
    
    return <div className="content">
                <Loader active={loaderActive} />
                <Card>
                    <CardHeader>
                        <h5 className="title">Empresas</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="margin-bottom-2vh flex-left">
                            <div className="input-group flex-nowrap w-full">
                                <span className="input-group-text z-0" id="addon-wrapping"><i className="fa fa-search"></i></span>
                                <input type="text" className="form-control px-2" placeholder="Escriba el nombre de la empresa"
                                onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </div>
                            <Link className="btn btn-primary" to="/admin/company" onClick={() => goToCompanyOnClick(0)}> Crear Empresa</Link>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>                            
                                        <th>Nombre</th>
                                        <th>Direccion</th>
                                        <th>Telefono</th>
                                        <th>Sitio web</th>                            
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCompanies.map((company, index) => 
                                        <tr key={company.idcompany}>
                                            <td> <Link to="/admin/company" onClick={() => goToCompanyOnClick(company.idcompany)}>{company.name}</Link></td>
                                            <td> <Link to="/admin/company" onClick={() => goToCompanyOnClick(company.idcompany)}>{company.address}</Link></td>
                                            <td> <Link to="/admin/company" onClick={() => goToCompanyOnClick(company.idcompany)}>{company.phone}</Link></td>
                                            <td> <Link to="/admin/company" onClick={() => goToCompanyOnClick(company.idcompany)}>{company.webpage}</Link></td>
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

export default Companies;