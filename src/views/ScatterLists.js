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

function ScatterLists (props) {
    const [scatterLists, setScatterLists] = useState([]);
    const [loaderActive, setLoaderActive] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    
    useEffect(() => { 
        setLoaderActive(true)
        axios.get(`${constants.apiurl}/api/scatterlists`).then(result => {
            setLoaderActive(false)
            setScatterLists(result.data);
        });
    }, []);
    
    const filteredScatterList = Array.isArray(scatterLists) ? scatterLists.filter(wsTemplate => String(wsTemplate.name).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) : []
    
    return <div className="content">
                <Loader active={loaderActive} />
                <Card>
                    <CardHeader>
                        <h5 className="title">Listas de dispersión</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="margin-bottom-2vh flex-left">
                            <div className="input-group flex-nowrap w-full">
                                <span className="input-group-text z-0" id="addon-wrapping"><i className="fa fa-search"></i></span>
                                <input type="text" className="form-control px-2" placeholder="Escriba el nombre de la lista de dispersión"
                                onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </div>
                            <Link className="btn btn-primary" to="/admin/list" onClick={() => goToScatterLists(0)}> Crear Lista de dispersión</Link>
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
                                        <tr key={scatterList.idwstemplate}>
                                            <td> <Link to="/admin/list" onClick={() => goToScatterLists(scatterList.idwstemplate)}>{index + 1}</Link></td>
                                            <td> <Link to="/admin/list" onClick={() => goToScatterLists(scatterList.idwstemplate)}>{scatterList.name}</Link></td>
                                        </tr>
                                    )}
                                </tbody>          
                            </table>
                        </div> 
                    </CardBody>
                </Card>
    </div>;
}

function goToScatterLists(idwstemplate) {
    localStorage.setItem('currentScatterListID', idwstemplate);
}

export default ScatterLists;