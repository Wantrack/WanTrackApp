import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { axios } from '../config/https';
import constants from '../util/constans';

import { CardHeader, CardBody, Card } from "reactstrap";

function Conversations (props) {

    const [groups, setGroups] = useState([]);
    const [searchValue, setSearchValue] = useState("");


    useEffect(() => { 
        axios.get(`${constants.apiurl}/api/groups`).then(result => {
            setGroups(result.data);
        });       
    }, []);

    const filteredGroups = groups.filter(user => String(user.name).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()))

    const delete_item= (index)=>{
        if(window.confirm(`Estas seguro de que quieres borrar '${filteredGroups[index].name}' ?`)){
            axios.delete(`${constants.apiurl}/api/conversation/${filteredGroups[index].idgroup_message}`)
            .then(() => {
                const updateGroups = [...groups]
                updateGroups.splice(index, 1)
                setGroups(updateGroups)
            })
            .catch((error) => {
                console.error('Error al eliminar la conversación', error)
            })
        }
    }


    return <div className="content">
        
        <Card>
                    <CardHeader>
                        <h5 className="title">Conversaciones</h5>
                    </CardHeader>
                    <CardBody>     

        <div className="margin-bottom-2vh flex-left">
            <div className="input-group flex-nowrap">
                <span className="input-group-text z-0" id="addon-wrapping"><i className="fa fa-search"></i></span>
                <input type="text" className="form-control text-xs px-2" placeholder="Escriba el nombre de la conversacion"
                    style={{width: "100%"}}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
            </div>
            <Link className="btn btn-primary" to="/admin/conversation" onClick={() => goToGroupOnClick(0)}> Crear Conversacion </Link>
        </div>

        <div className="table-responsive">
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th className='text-aling-left'>ID</th>
                        <th className='text-aling-left'>Nombre</th>
                        <th style={{textAlign: 'center'}}> Eliminar </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredGroups.map((group, index) => 
                        <tr  key={group.idgroup_message}>
                            <td className='text-aling-left'> 
                                <Link to="/admin/conversation" className="pl-4" onClick={() => goToGroupOnClick(group.idgroup_message)}>{group.idgroup_message}</Link>
                            </td>
                            <td className='text-aling-left'> 
                                <Link to="/admin/conversation" className="pl-4" onClick={() => goToGroupOnClick(group.idgroup_message)}>{group.name}</Link>                           
                            </td>
                            <td style={{textAlign: 'center'}}>
                                <Link to="javascript:void()" className='w-10 mx-auto cursor-pointer' onClick={() => delete_item(index)}><i className="fa fa-trash"></i></Link>
                            </td>
                        </tr>
                    )}           
                </tbody>          
            </table>
        </div>    
        </CardBody>
                </Card>    
    </div>;
}

function goToGroupOnClick(idGroup) {
    localStorage.setItem('currentGroupID', idGroup);
}

export default Conversations;