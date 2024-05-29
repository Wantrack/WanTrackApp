import React, { useState, useEffect, useCallback } from 'react';

import { CardHeader, CardBody, Card } from "reactstrap";

import { axios } from '../config/https';
import constants from '../util/constans';
import {
    Link,
    useNavigate  
} from "react-router-dom";

let listButtons = [];
let _headers = [];
let _messages = []

function Template (props) {
    const navigate = useNavigate ();

    const [template, setTemplate] = useState([]);
    const [idTemplate, setIdTemplate] = useState([]);
    const [types, setTypes] = useState([]);
    const [headerTypes, setheaderTypes] = useState([]);
    const [clientAnswerType, setclientAnswerType] = useState([]);
    const [buttonTypes, setbuttonTypes] = useState([]);
    const [answerTemplateTypes, setAnswerTemplateTypes] = useState([]);
    const [newButtons, setnewButtons] = useState([]);
    const [messages, setMessages] = useState([]);
    const [groups, setGroups] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [cardInfo, setCardInfo] = useState({});


    const onHandleChangeCard = (e) => {
        const { name, value } = e.target;
        setCardInfo(pre => ({
            ...pre,
            [name]: value 
        })); 
    }

    const onHandleChange = (e) => {
        const { name, value } = e.target;
        setTemplate(pre => ({
            ...pre,
            [name]: value 
        }));

        if(name === 'idAnswerTemplateType' && value === '5') {
            document.querySelector('#cardGeneratePanel').classList.remove('hide');
        }else {
            document.querySelector('#cardGeneratePanel').classList.add('hide');
        }
    }
    
    const onHandleChangeHeaders = (index, e) => {
        const { name, value } = e.target;
        let element = _headers[index]
        const idTemplate = localStorage.getItem('currentTemplateID');
        if(idTemplate !== '0') {
            element.idTemplate = idTemplate;
        }

        element = {
            ...element,
            [name]: value 
        }
        _headers[index] = element;
        setHeaders(_headers); 
    }

    const onHandleChangeButton = (index, e) => {
        const { name, value } = e.target;
        let element = listButtons[index]
        element = {
            ...element,
            [name]: value 
        }
        listButtons[index] = element;
        setnewButtons(listButtons); 
    }

    const cmbTypeOnChange = (e) => {
        onHandleChange(e)
        if(e.target.selectedIndex === 1 || e.target.selectedIndex === 2) {
            document.querySelector('#buttonPanel').classList.remove('hide');
        } else {
            document.querySelector('#buttonPanel').classList.add('hide');
        }

        if(e.target.selectedIndex === 4) {
            document.querySelector('#requestPanel').classList.remove('hide');
            document.querySelector('#requestPanel2').classList.remove('hide');
        } else {
            document.querySelector('#requestPanel').classList.add('hide');           
            document.querySelector('#requestPanel2').classList.add('hide');         
        }

        if(e.target.selectedIndex === 5) {
            document.querySelector('#locationPanel').classList.remove('hide');    
        }else {
            document.querySelector('#locationPanel').classList.add('hide'); 
        }

        if(e.target.selectedIndex === 6) {
            document.querySelector('#metaFlowPanel').classList.remove('hide');    
        }else {
            document.querySelector('#metaFlowPanel').classList.add('hide'); 
        }

        
    }

    const cmbGroups = async (e) => { 
        const idGroup = e.target.value;
        getMessagesGroups(idGroup);
    }

    const getMessagesGroups = (_idGroup) => {
        axios.get(`${constants.apiurl}/api/messageByIdGroup/${_idGroup}`).then(async (result) => {
            _messages = result.data

            for (const message of _messages) {
                const options = (await axios.get(`${constants.apiurl}/api/optionsByMessage/${message.idmessage}`)).data;
                if(options) {
                    message.options = options;
                }                    
            }
            setMessages(_messages);
        }); 
    }

    const areaOnChange = (e) => {
        var ugly = document.querySelector('#txtpayload').value;
        if(ugly) {
            var obj = JSON.parse(ugly);
            var pretty = JSON.stringify(obj, undefined, 2);
            document.querySelector('#txtpayload').value = pretty;
        }        
    }

    const areaOnChangeObjectToSave = (e) => {
        var ugly = document.querySelector('#txtobjectToSave').value;
        if(ugly) {
            var obj = JSON.parse(ugly);
            var pretty = JSON.stringify(obj, undefined, 2);
            document.querySelector('#txtobjectToSave').value = pretty;
        } 
    }

    const openCardGenerator = () => {
       if(template.propertyAnswer) {
            try {
                var obj = JSON.parse(template.propertyAnswer);
                obj.text = obj.body
                setCardInfo(obj);
            } catch (error) { }
       }
    }

    const generateCard = () => {

        const obj = {
            header: cardInfo.header || '',
            body: cardInfo.text || '',
            footer: cardInfo.footer || '',
            button1: cardInfo.button1 || '',
            button1ID: cardInfo.button1ID || '',
            button1NextStep: cardInfo.button1NextStep || '',
            button2: cardInfo.button2 || '',
            button2ID: cardInfo.button2ID || '',
            button2NextStep: cardInfo.button2NextStep || '',
            button3: cardInfo.button2 || '',
            button3ID: cardInfo.button3ID || '',
            button3NextStep: cardInfo.button3NextStep || '',
            button1IDObj: {
                type: 'cardButton',
                id: cardInfo.button1ID || '',
                nextStep: cardInfo.button1NextStep || ''
            }, 
            button2IDObj: {
                type: 'cardButton',
                id: cardInfo.button2ID || '',
                nextStep: cardInfo.button2NextStep || ''
            }, 
            button3IDObj: {
                type: 'cardButton',
                id: cardInfo.button3ID || '',
                nextStep: cardInfo.button3NextStep || ''
            }, 
        };

        template.propertyAnswer = JSON.stringify(obj);
        onHandleChange({ target : { name: 'propertyAnswer', value: template.propertyAnswer } });
    }

    const generatePayload = () => {
        let result ='{'

        for (const message of _messages) {
           const value = document.querySelector(`#template${message.idmessage}`).value;
            if(value) {
                result += `"${value}": "\${template_${message.idmessage}}",`;                
            }            
        }
        result = result.substring(0,result.length-1);
        result += '}';
        onHandleChange({target: {name: 'payload', value: result}});
        document.querySelector('#txtpayload').value = result;
        areaOnChange();
    }

    const saveChanges = useCallback(() => {
        axios.post(`${constants.apiurl}/api/createOrUpdateTemplate`, template).then(result => {
            const idTemplate = localStorage.getItem('currentTemplateID');
            if(idTemplate === '0'){
                for (const button of listButtons) {
                    button.idtemplate = result.data.idtemplate;
                }

                for (const header of _headers) {
                    header.idTemplate = result.data.idtemplate;
                }
            }

            listButtons.forEach((button) => {
                axios.post(`${constants.apiurl}/api/createOrUpdateButtonstemplate`, button); 
            });

            _headers.forEach((header) => {                
                axios.post(`${constants.apiurl}/api/createOrUpdateHeaders`, header); 
            });
            navigate('/admin/steps');
        }); 
    }, [navigate, template])

    const addHeader = useCallback(() => {
        const index = _headers.length;
        const header =  {name: '', value: '', index};
        _headers.push(header);
        setHeaders([..._headers]);
    }, []);

    const addButton = useCallback((button) => {
        button.index = listButtons.length;
        listButtons.push(button);
        setnewButtons([...listButtons]);
    },  []);

    useEffect(() => {    
        const idTemplate = localStorage.getItem('currentTemplateID');
        setIdTemplate(idTemplate);

        if(idTemplate === '0') {
            setTemplate({ headerId: 1, typeId: 1 });  
            document.querySelector('#requestPanel').classList.add('hide');        
            document.querySelector('#requestPanel2').classList.add('hide');       
        } else {
            axios.get(`${constants.apiurl}/api/template/${idTemplate}`).then(result => {
                setTemplate(result.data);

                if(result.data && result.data.payload) {  
                    var pretty = '';                  
                    try {
                        var obj = JSON.parse(result.data.payload);
                        pretty = JSON.stringify(obj, undefined, 2);                        
                    } catch (error) {
                        pretty = result.data.payload;
                    }       
                    document.querySelector('#txtpayload').value = pretty;          
                }

                if(result.data && result.data.objectToSave) {    
                    var prettyToSave = '';                
                    try {
                        var objToSave = JSON.parse(result.data.objectToSave);
                        prettyToSave = JSON.stringify(objToSave, undefined, 2);                       
                    } catch (error) {
                        prettyToSave = result.data.objectToSave
                    } 
                    document.querySelector('#txtobjectToSave').value = prettyToSave;                   
                }

                if(result.data.typeId === 2 || result.data.typeId === 3) {
                    document.querySelector('#buttonPanel').classList.remove('hide');
                } else {
                    document.querySelector('#buttonPanel').classList.add('hide');
                }
        
                if(result.data.typeId === 5) {
                    document.querySelector('#requestPanel').classList.remove('hide');
                    document.querySelector('#requestPanel2').classList.remove('hide');
                } else {
                    document.querySelector('#requestPanel').classList.add('hide');           
                    document.querySelector('#requestPanel2').classList.add('hide');         
                }
        
                if(result.data.typeId === 6) {
                    document.querySelector('#locationPanel').classList.remove('hide');    
                }else {
                    document.querySelector('#locationPanel').classList.add('hide'); 
                }

                if(result.data.typeId === 7) {
                    document.querySelector('#metaFlowPanel').classList.remove('hide');    
                }else {
                    document.querySelector('#metaFlowPanel').classList.add('hide'); 
                }
                
                if(result.data.idAnswerTemplateType === 4) {
                    document.querySelector('#templateParametersPanel').classList.remove('hide');
                }

                if(result.data.idAnswerTemplateType === 5) {
                    document.querySelector('#cardGeneratePanel').classList.remove('hide');
                }
            }); 
        }        

        axios.get(`${constants.apiurl}/api/types`).then(result => {
            setTypes(result.data);
        }); 

        axios.get(`${constants.apiurl}/api/clientAnswerTypes`).then(result => {
            setclientAnswerType(result.data);
        }); 

        axios.get(`${constants.apiurl}/api/headertypes`).then(result => {
            setheaderTypes(result.data);
        }); 

        axios.get(`${constants.apiurl}/api/buttontypes`).then(result => {
            setbuttonTypes(result.data);
        }); 

        axios.get(`${constants.apiurl}/api/answerTemplateType`).then(result => {
            setAnswerTemplateTypes(result.data);
        });

        axios.get(`${constants.apiurl}/api/buttonstemplateByTemplate/${idTemplate}`).then(result => {
            setbuttonTypes(result.data);
            listButtons = result.data;
            setnewButtons([...listButtons]);
        }); 

        axios.get(`${constants.apiurl}/api/headersbyTemplate/${idTemplate}`).then(result => {           
            _headers = result.data;
            setHeaders([..._headers]);
        });

        axios.get(`${constants.apiurl}/api/groups`).then(result => {
            setGroups(result.data);

            if(result.data && Array.isArray(result.data) && result.data.length > 0) {
                getMessagesGroups(result.data[0].idgroup_message);
            }           
        });  
    }, []);

    useEffect(() => {
        _headers = [];
        setHeaders([]);
        listButtons = [];
        setnewButtons([]);
    }, [])

    return <div className="content">
     <Card>
                    <CardHeader>
                        <h5 className="title">{idTemplate !== '0' ? 'Editar' : 'Crear'} paso {idTemplate !== '0' ? '-' : ''} {template.name}</h5>
                    </CardHeader>
                    <CardBody>
        <div className="margin-bottom-2vh flex-left">
            <Link className="btn btn-primary" onClick={saveChanges}> Guardar cambios</Link>
        </div>
        <div className="margin-bottom-2vh">
              <div className="row">
                <div className="col-6">
                     <div className="row">
                        <div className="col-12">
                            <label>Nombre</label>
                        </div>
                        <div className="col-12">
                            <input className="form-control" placeholder="Escribir nombre aqui" defaultValue={template.name} name='name' onChange={onHandleChange}></input>
                        </div> 
                    </div> 
                </div>
                <div className="col-6">
                    <div className="row">
                        <div className="col-12">
                            <label>Tipo</label>
                        </div>
                        <div className="col-12">
                            <select className="form-control" name='typeId' value={template.typeId} onChange={cmbTypeOnChange}>
                                {
                                types?.map((type, index) => 
                                    <option key={index} value={type.idtypes}>{type.name}</option>
                                )}   
                            </select>
                        </div> 
                    </div>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                    <label>Encabezado (Opcional)</label>
                </div>
                <div className="col-6">
                            <select className="form-control" value={template.headerType} name='headerId' onChange={onHandleChange}>
                                {
                                    headerTypes?.map((type, index) => 
                                    <option key={index} value={type.idheaderType}>{type.name}</option>
                                )} 
                            </select>
                        </div> 
                <div className="col-6">
                    <input className="form-control" placeholder="Escribir encabezado aqui" defaultValue={template.header} name='header' onChange={onHandleChange}></input>
                </div> 
              </div>

              <div className="row">
                <div className="col-12">
                    <label>Tipo de respuesta del cliente</label>
                </div>
                <div className="col-12">
                    <select className="form-control" value={template.idClientAnswerType} name='idClientAnswerType' onChange={onHandleChange}>
                        {
                            clientAnswerType?.map((type, index) => 
                            <option key={index} value={type.idClientAnswerType}>{type.name}</option>
                        )} 
                    </select>
                </div> 
              </div>

              <div className="row">
                <div className="col-12">
                        <label>Texto</label>
                    </div>
                <div className="col-12">
                   <textarea className="form-control" placeholder="Ingresa el texto del mensaje" cols="30" rows="10" defaultValue={template.text} name='text' onChange={onHandleChange}></textarea>
                </div> 
              </div>

              <div className='row hide' id="locationPanel">
                <div className="col-4">
                    <label>Latitud</label>
                    <input className="form-control" placeholder="Escribir latitud" defaultValue={template.latitude} name='latitude' onChange={onHandleChange}></input>
                </div>
                <div className="col-4">
                    <label>Longitud</label>
                    <input className="form-control" placeholder="Escribir longitud" defaultValue={template.longitude} name='longitude' onChange={onHandleChange}></input>
                </div>
                <div className="col-4">
                    <label>Direccion</label>
                    <input className="form-control" placeholder="Escribir direccion" defaultValue={template.address} name='address' onChange={onHandleChange}></input>
                </div>
              </div>

              <div className='row hide' id="metaFlowPanel">
                <div className="col-4">
                    <label>Flow Id</label>
                    <input className="form-control" placeholder="Escribir Flow Id" defaultValue={template.flowid} name='flowid' onChange={onHandleChange}></input>
                </div>
                <div className="col-4">
                    <label>CTA</label>
                    <input className="form-control" placeholder="Escribir Cta" defaultValue={template.flowcta} name='flowcta' onChange={onHandleChange}></input>
                </div>
                <div className="col-4">
                    <label>Screen Principal</label>
                    <input className="form-control" placeholder="Escribir Screen Principal" defaultValue={template.mainScreen} name='mainScreen' onChange={onHandleChange}></input>
                </div>
              </div>

              <div className="row hide" id="requestPanel2">
                <div className="col-12">
                    <div className="row">
                        <div className="col-12">
                            <label>Tipo de respuesta</label>
                        </div>
                        <div className="col-6">
                            <select className="form-control" name='idAnswerTemplateType' value={template.idAnswerTemplateType} onChange={onHandleChange}>
                                {
                                    answerTemplateTypes?.map((type, index) => 
                                        <option key={index} value={type.idanswer_template_type}>{type.code}</option>
                                )}   
                            </select>
                        </div>
                        <div className="col-6">
                            <input className="form-control" placeholder="Escribir la propiedad aqui" defaultValue={template.propertyAnswer} name='propertyAnswer' onChange={onHandleChange}></input>
                        </div> 
                    </div>                    
                </div>

                <div id='cardGeneratePanel' className='col-12 hide'>
                    <div className="col-12">
                        <div className="row">
                            <div className="col-6"></div>
                            <div className="col-6 text-aling-right">
                                <Link className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#generateCardModal" onClick={openCardGenerator}>Generar card</Link>
                            </div>  
                        </div>
                    </div>
                </div>         
              </div>

              <div className="row">                
                <div className="col-12">
                    <label>Pie de pagina (Opcional)</label>
                </div>
                <div className="col-12">
                    <input className="form-control" placeholder="Escribir pie de pagina aqui" defaultValue={template.footer} name='footer' onChange={onHandleChange}></input>
                </div> 
              </div>

              <div className="row">                
                <div className="col-12">
                    <label>Contexto (Opcional)</label>
                </div>
                <div className="col-12">
                    <input className="form-control" placeholder="Escribir contexto aqui" defaultValue={template.context} name='context' onChange={onHandleChange}></input>
                </div> 
              </div>

              <div id="requestPanel">
                <div className='row'>
                    <div className="col-12">
                        <label>Opciones de Request (Desarrollador)</label>
                    </div>
                    <div className="col-3">
                        <label>Accion</label>
                        <select className="form-control" name='action' value={template.action} onChange={onHandleChange}>
                            <option value={'get'}>GET</option>
                            <option value={'post'}>POST</option>
                            <option value={'put'}>PUT</option>
                            <option value={'delete'}>DELETE</option>
                        </select>
                    </div>
                    <div className="col-3">
                        <label>Service type</label>
                        <select className="form-control" name='serviceType' value={template.serviceType} onChange={onHandleChange}>
                            <option value={1}>REST</option>
                            <option value={2}>SOAP</option>
                        </select>
                    </div>
                    <div className="col-6">
                        <label>Endpoint</label>
                        <input className="form-control" placeholder="Endpoint" defaultValue={template.endpoint} name='endpoint' onChange={onHandleChange}></input>
                    </div>
                    <div className="col-6">
                        <label>Header</label>
                        <input className="form-control" placeholder="Escriba aqui el header de autenticacion" defaultValue={template.headerRequest} name='headerRequest' onChange={onHandleChange}></input>
                    </div>
                    <div className="col-6">
                        <label>Valor</label>
                        <input className="form-control" placeholder="Valor" defaultValue={template.token} name='token' onChange={onHandleChange}></input>
                    </div> 

                    <div className="col-12 margin-top-30">
                        <label>Headers Adicionales</label>
                    </div>

                    <div className="col-12">
                            {
                                headers?.map((header, index) => 
                                <div className="row"> 
                                    <div className="col-6">
                                        <label>Header</label>
                                        <input className="form-control" placeholder="Escriba aqui el header de autenticacion" defaultValue={header.name} name='name' onChange={() => onHandleChangeHeaders (index, window.event)}></input>
                                    </div>
                                    <div className="col-6">
                                        <label>Valor</label>
                                        <input className="form-control" placeholder="Valor" defaultValue={header.value} name='value' onChange={() => onHandleChangeHeaders (index, window.event)}></input>
                                    </div> 
                                </div>
                            )}                          
                        </div>
                       
                        <div className="col-12">
                            <div className="row">
                                <div className="col-6"></div>
                                <div className="col-6 text-aling-right">
                                    <Link to={'javascript:void(0)'} className="btn btn-primary" onClick={addHeader}>Agregar Header</Link>
                                </div>  
                            </div>
                        </div>

                    <div className="col-12 margin-top-30">
                        <div className='container-payload'>
                            <div></div>
                            <label>Payload</label>
                            <div className="dropdown">
                                <Link data-bs-toggle="dropdown" aria-expanded="false"></Link>
                                <ul className="dropdown-menu">
                                    <li><Link className="dropdown-item" data-bs-toggle="modal" data-bs-target="#payloadModal">Generar payload</Link></li>
                                </ul>
                            </div>
                            
                        </div>                       
                        <textarea spellCheck={false} className="form-control" placeholder="Escriba el payload en un formato json correcto" name="payload" defaultValue={template.payload} id="txtpayload" cols="30" rows="10" onChange={onHandleChange} onBlur={areaOnChange}></textarea>
                    </div>
                    <div className="col-12 margin-top-30">
                        <div className='container-payload'>
                            <div></div>
                            <label>Object to save</label>     
                            <div></div>                       
                        </div>                       
                        <textarea spellCheck={false} className="form-control" placeholder="Escriba el objeto a guardar" name="objectToSave" defaultValue={template.objectToSave} id="txtobjectToSave" cols="30" rows="10" onChange={onHandleChange} onBlur={areaOnChangeObjectToSave}></textarea>
                    </div>
                    <div className="col-12">
                        <label>En caso de error escriba 500 un mensaje</label>
                        <input className="form-control" placeholder="Escribir un mensaje en caso de error 500 aqui" defaultValue={template.errorMessage} name='errorMessage' onChange={onHandleChange}></input>
                    </div>

                    <div className="col-12">
                        <label>En caso de error escriba 400 un mensaje</label>
                        <input className="form-control" placeholder="Escribir un mensaje en caso de error 400 aqui" defaultValue={template.error400Mesage} name='error400Mesage' onChange={onHandleChange}></input>
                    </div>

                    <div className="col-12">
                        <label>En caso de error escriba 300 un mensaje</label>
                        <input className="form-control" placeholder="Escribir un mensaje en caso de error 300 aqui" defaultValue={template.error300Message} name='error300Message' onChange={onHandleChange}></input>
                    </div>

                    <div className="col-3">
                        <label>On Status 200 Do</label>
                        <select className="form-control" name='onStatus200Do' value={template.onStatus200Do} onChange={onHandleChange}>
                            <option value={1}>Continuar</option>
                            <option value={2}>Detener</option>
                            <option value={3}>Repetir</option>
                            <option value={4}>Nada</option>
                        </select>
                    </div>

                    <div className="col-3">
                        <label>On Status 300 Do</label>
                        <select className="form-control" name='onStatus300Do' value={template.onStatus300Do} onChange={onHandleChange}>
                            <option value={1}>Continuar</option>
                            <option value={2}>Detener</option>
                            <option value={3}>Repetir</option>
                            <option value={4}>Nada</option>
                        </select>
                    </div>

                    <div className="col-3">
                        <label>On Status 400 Do</label>
                        <select className="form-control" name='onStatus400Do' value={template.onStatus400Do} onChange={onHandleChange}>
                            <option value={1}>Continuar</option>
                            <option value={2}>Detener</option>
                            <option value={3}>Repetir</option>
                            <option value={4}>Nada</option>
                        </select>
                    </div>

                    <div className="col-3">
                        <label>On Status 500 Do</label>
                        <select className="form-control" name='onStatus500Do' value={template.onStatus500Do} onChange={onHandleChange}>
                            <option value={1}>Continuar</option>
                            <option value={2}>Detener</option>
                            <option value={3}>Repetir</option>
                            <option value={4}>Nada</option>
                        </select>
                    </div>
                </div>
              </div>

              <div className='hide'  id="buttonPanel">

                <div className="row">                
                    <div className="col-12">
                        <label>Donde tomar información</label>
                    </div>
                    <div className="col-12">
                        <select className="form-control" name='whereinfo' value={template.whereinfo} onChange={onHandleChange}>
                            <option value={1}>Texto</option>
                            <option value={2}>Id</option>
                        </select>
                    </div> 
                </div>
                
                <div>
                <div className="row">
                    <div className="col-12">
                        <label>Botones</label>
                    </div>
                    <div className="col-12" id="buttonsContainer">
                        {
                            newButtons?.map((button, index) => 
                            <div key={button.index} className="row">
                                <div className="col-4">
                                    <select className="form-control" value={button.typeId} id={`cmbbutton${button.index}`}>
                                        <option value={1}>Texto</option>
                                        <option value={2}>Llamada a la accion</option>
                                    </select>
                                </div> 
                                <div className="col-4">
                                    <input maxLength={20} id={`txtbutton${index}`} className="form-control" placeholder="Escribir texto del boton aqui" defaultValue={button.text} name="text" onChange={() => onHandleChangeButton(index, window.event)}></input>
                                </div> 
                                <div className="col-4">
                                    <input id={`txtbutton_object${index}`} className="form-control" placeholder="Escribir objeto del boton aqui" defaultValue={button.object} name="object" onChange={() => onHandleChangeButton(index, window.event)}></input>
                                </div> 
                            </div>
                            
                        )}
                    </div>                                   
                </div>

                <div className="row">
                    <div className="col-12">
                        <button className="btn btn-primary" onClick={()=> addButton({
                            typeId: 1,
                            text: '',
                            countryId: 1,
                            phone: '',
                            url: '',
                            typeUrlId: 1, 
                            idtemplate: idTemplate
                        })}>Agregar boton</button>
                    </div>
                </div> 
              </div>
                </div>                

              <div className="modal fade" id="generateCardModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="exampleModalLabel">Generar card</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className='row'>
                            <div className='col-12'>
                                <label>Header</label>
                                <input className="form-control" placeholder="Header" defaultValue={cardInfo.header} name='header' onChange={onHandleChangeCard}></input>
                                <label>Body</label>
                                <textarea className="form-control" placeholder="Ingresa el texto del mensaje" cols="30" rows="5" 
                                defaultValue={cardInfo.text} name='text' onChange={onHandleChangeCard}></textarea>
                                <label>Footer</label>
                                <input className="form-control" placeholder="Footer" defaultValue={cardInfo.footer} name='footer' onChange={onHandleChangeCard}></input>
                                <label>Button 1</label>
                                <input className="form-control" placeholder="Text Button 1" defaultValue={cardInfo.button1} name='button1' onChange={onHandleChangeCard}></input>
                                <label>Button 1 ID</label>
                                <input className="form-control" placeholder="ID button 1" defaultValue={cardInfo.button1ID} name='button1ID' onChange={onHandleChangeCard}></input>
                                <label>Next Step Button 1 (Id template)</label>
                                <input className="form-control" placeholder="Next Step Button 1 (Id template)" defaultValue={cardInfo.button1NextStep} name='button1NextStep' onChange={onHandleChangeCard}></input>
                                <label>Button 2</label>
                                <input className="form-control" placeholder="Text Button 2" defaultValue={cardInfo.button2} name='button2' onChange={onHandleChangeCard}></input>
                                <label>Button 2 ID</label>
                                <input className="form-control" placeholder="ID button 2" defaultValue={cardInfo.button2ID} name='button2ID' onChange={onHandleChangeCard}></input>
                                <label>Next Step Button 2 (Id template)</label>
                                <input className="form-control" placeholder="Next Step Button 2" defaultValue={cardInfo.button2NextStep} name='button2NextStep' onChange={onHandleChangeCard}></input>
                                <label>Button 3</label>
                                <input className="form-control" placeholder="Text Button 3" defaultValue={cardInfo.button3} name='button3' onChange={onHandleChangeCard}></input>
                                <label>Button 3 ID</label>
                                <input className="form-control" placeholder="ID button 2" defaultValue={cardInfo.button3ID} name='button3ID' onChange={onHandleChangeCard}></input>
                                <label>Next Step Button 3 (Id template)</label>
                                <input className="form-control" placeholder="Next Step Button 2" defaultValue={cardInfo.button3NextStep} name='button3NextStep' onChange={onHandleChangeCard}></input>
                            </div>
                        </div>                       
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" className="btn btn-primary"  data-bs-dismiss="modal" onClick={generateCard} >Generar</button>
                    </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="payloadModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="exampleModalLabel">Generar payload</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <select className="form-control" onChange={() => cmbGroups(window.event)}>
                            {
                                groups?.map((group, index) => {
                                    return <option key={index} value={group.idgroup_message}>{group.name}</option>
                                }                                           
                            )} 
                        </select>

                        <div className="list-group">
                            {
                                messages?.map((message, index) => {
                                    return <div key={index} className='flex-Horizontal margin-top-10'>
                                                <label className='width-50-p'>{message.template}</label>
                                                <input className="form-control width-50-p" id={`template${message.idmessage}`} placeholder='Nombre de la propiedad'></input>
                                           </div>
                                })
                            }                          
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" className="btn btn-primary"  data-bs-dismiss="modal" onClick={generatePayload} >Generar</button>
                    </div>
                    </div>
                </div>
            </div>
        </div>
        </CardBody>
                </Card>    
    </div>;
}

export default Template;