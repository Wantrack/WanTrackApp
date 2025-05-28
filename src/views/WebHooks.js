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

function WebHooks (props) {
    const [webHooks, setWebHooks] = useState([]);
    const [loaderActive, setLoaderActive] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    
    useEffect(() => { 
        setLoaderActive(true)
        axios.get(`${constants.apiurl}/api/webhook/webhooks`).then(result => {
            setLoaderActive(false)
            setWebHooks(result.data);
        });
    }, []);
    
    const filteredWebHook = Array.isArray(webHooks) ? webHooks.filter(wsTemplate => String(wsTemplate.name).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) : []
    
    return <div className="content">
                <Loader active={loaderActive} />
                <Card>
                    <CardHeader>
                        <h5 className="title">Listas de Webhooks</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="margin-bottom-2vh flex-left">
                            <div className="input-group flex-nowrap w-full">
                                <span className="input-group-text z-0" id="addon-wrapping"><i className="fa fa-search"></i></span>
                                <input type="text" className="form-control px-2" placeholder="Escriba el nombre del webhook"
                                onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </div>
                            <Link className="btn btn-primary" to="/admin/webhook" onClick={() => goToWebHooks(0)}> Crear WebHook</Link>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>       
                                        <th>#</th>
                                        <th>Nombre</th>
                                        <th>Url</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredWebHook.map((webHook, index) => 
                                        <tr key={webHook.idwebhookmessages}>
                                            <td> <Link to="/admin/webhook" onClick={() => goToWebHooks(webHook.idwebhookmessages)}>{index + 1}</Link></td>
                                            <td> <Link to="/admin/webhook" onClick={() => goToWebHooks(webHook.idwebhookmessages)}>{webHook.name}</Link></td>
                                            <td> <Link to="/admin/webhook" onClick={() => goToWebHooks(webHook.idwebhookmessages)}>{webHook.url}</Link></td>                                          
                                        </tr>
                                    )}
                                </tbody>          
                            </table>
                        </div> 
                    </CardBody>
                </Card>
    </div>;
}

function goToWebHooks(idwebhookmessages) {
    localStorage.setItem('currentWebHookID', idwebhookmessages);
}

export default WebHooks;