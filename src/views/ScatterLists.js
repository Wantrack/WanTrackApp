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

function ScatterLists (props) {
    const [scatterLists, setScatterLists] = useState([]);
    const [loaderActive, setLoaderActive] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    
    useEffect(() => {
        getScatterLists()
    }, []);

    async function getScatterLists() {
        let idCompany = undefined;
        const _userinfoEncoded = localStorage.getItem(constants.userinfo);
        if(_userinfoEncoded) {
            const _userinfo = JSON.parse(decode(_userinfoEncoded));
            if(_userinfo.idCompany) {
                idCompany =_userinfo.idCompany
            }
        }

        setLoaderActive(true)
        axios.get(`${constants.apiurl}/api/scatterlists${idCompany ? `?idcompany=${idCompany}` : ''}`).then(result => {
            setLoaderActive(false)
            setScatterLists(result.data);
        });
    }

    async function copyScatterList(idscatterlist) {
        await axios.post(`${constants.apiurl}/api/scatterlistscopy`, {idscatterlist});
        await getScatterLists();
    }
    
    const filteredScatterList = Array.isArray(scatterLists) ? scatterLists.filter(wsTemplate => String(wsTemplate.name).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) : []
    
    return <div className="content">
                <Loader active={loaderActive} />
                <Card>
                    <CardHeader>
                        <h5 className="title">Listas de difusión</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="margin-bottom-2vh flex-left">
                            <div className="input-group flex-nowrap w-full">
                                <span className="input-group-text z-0" id="addon-wrapping"><i className="fa fa-search"></i></span>
                                <input type="text" className="form-control px-2" placeholder="Escriba el nombre de la lista de difusión"
                                onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </div>
                            <Link className="btn btn-primary" to="/admin/list" onClick={() => goToScatterLists(0)}> Crear Lista de difusión</Link>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>       
                                        <th>#</th>
                                        <th>Nombre</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredScatterList.map((scatterList, index) => 
                                        <tr key={scatterList.idscatterlist}>
                                            <td> <Link to="/admin/list" onClick={() => goToScatterLists(scatterList.idscatterlist)}>{index + 1}</Link></td>
                                            <td> <Link to="/admin/list" onClick={() => goToScatterLists(scatterList.idscatterlist)}>{scatterList.name}</Link></td>
                                            <td> <Link to="javascript:void(0)" onClick={() => copyScatterList(scatterList.idscatterlist)}><i title='Copiar campaña' className="fa-solid fa-copy"></i></Link></td>
                                        </tr>
                                    )}
                                </tbody>          
                            </table>
                        </div> 
                    </CardBody>
                </Card>
    </div>;
}

function goToScatterLists(idscatterlist) {
    localStorage.setItem('currentScatterListID', idscatterlist);
}

export default ScatterLists;