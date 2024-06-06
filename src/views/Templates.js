import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

import { axios } from '../config/https';
import constants from '../util/constans';

import { CardHeader, CardBody, Card } from "reactstrap";

function Templates (props) { 

    const [templates, setTemplates] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    
    
    useEffect(() => { 
        axios.get(`${constants.apiurl}/api/templates`).then(result => {
            setTemplates(result.data);
        }); 
    }, []);

    const filteredTemplates = templates.filter(user => String(user.name).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()))

    const delete_item= (index)=>{
        if(window.confirm(`Estas seguro de que quieres borrar '${filteredTemplates[index].name}' ?`)){
            axios.delete(`${constants.apiurl}/api/template/${filteredTemplates[index].idtemplate}`)
            .then(() => {
                const updatedTemplates = [...templates]
                updatedTemplates.splice(index, 1)
                setTemplates(updatedTemplates)
            })
            .catch((error) => {
                console.error('Error el borrar el paso', error)
            })
        }
    }

    return <div className="content">
         <Card>
                    <CardHeader>
                        <h5 className="title">Pasos</h5>
                    </CardHeader>
                    <CardBody>
        <div className="margin-bottom-2vh flex-left">
            <div className="input-group flex-nowrap">
                <span className="input-group-text z-0" id="addon-wrapping"><i className="fa fa-search"></i></span>
                <input type="text" className="form-control px-2" placeholder="Escriba el nombre del paso"
                onChange={(e) => setSearchValue(e.target.value)}
                />
            </div>

            <Link className="btn btn-primary" to="/admin/step" onClick={ () => goToTemplateOnClick(0)} > Crear Paso</Link>
        </div>

        <div className="table-responsive">
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th className='text-aling-left'>Nombre</th>
                        <th>Tipo</th>
                        <th style={{textAlign: 'center'}}>Eliminar</th>
                    </tr>
                </thead>
                <tbody>
                    {
                    filteredTemplates.map((template, index) => 
                         <tr key={template.idtemplate}>
                            <td> <Link to="/admin/step"> {template.idtemplate} </Link></td>
                            <td className='text-aling-left'> <Link to="/admin/step" onClick={ () => goToTemplateOnClick(template.idtemplate)} > {template.name} </Link></td>
                            <td> <Link to="/admin/step"> {template.typeName} </Link></td>
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

function goToTemplateOnClick(idTemplate) {
    localStorage.setItem('currentTemplateID', idTemplate);
}

export default Templates;