import React, { useState, useEffect, useCallback, useRef } from 'react';
import { axios } from '../config/https';
import constants from '../util/constans';
import { useNavigate } from "react-router-dom";

import {
    CardHeader,
    CardBody,
    Card
  } from "reactstrap";

let listFreeOptions = [];
let _messages = []
let _group = {};
let __idGroup = 0;
let _templates = [];
let metadataBd = [];

function Conversation(props) {
    const navigate = useNavigate();
    const useEffectRef = useRef(false);

    const [idGroup, setIdGroup] = useState(0);
    const [group, setGroup] = useState({});
    const [messages, setMessages] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [types, setTypes] = useState([]);
    const [freeOptions, setFreeOptions] = useState([]);
    const [disabledGuardarButton, setdisabledGuardarButton] = useState(true);

    const hasEmptyFields = () => {
        const emptyMessages = freeOptions?.some(freeOption => freeOption.answer.trim() === '');
        const emptyGroup = group.name === "";
    };

    const onHandleChange = (e) => {
        const { name, value } = e.target;
        _group = {
            ..._group,
            [name]: value
        }
        setGroup(_group);
        setdisabledGuardarButton(hasEmptyFields())
    }

    const onHandleChangeFreeOption = (index, e) => {
        const { name, value } = e.target;
        let element = listFreeOptions[index]
        element = {
            ...element,
            [name]: value
        }
        listFreeOptions[index] = element;
        setFreeOptions(listFreeOptions);
        setdisabledGuardarButton(hasEmptyFields())
    }

    const onHandleChangeOptionMessage = (indexMessage, indexOption, e) => {
        const { name, value } = e.target;
        let element = _messages[indexMessage].options[indexOption];
        element = {
            ...element,
            [name]: value
        }
        _messages[indexMessage].options[indexOption] = element;
        setMessages(_messages);

    }

    const onHandleChangeMessage = (index, e) => {
        const { name, value } = e.target;
        let element = _messages[index]
        element = {
            ...element,
            [name]: value
        }
        _messages[index] = element;
        setMessages(_messages);

    }

    const saveChanges = useCallback(() => {

        if (__idGroup) {
            _group.idgroup_message = __idGroup;
        }
        axios.post(`${constants.apiurl}/api/group`, _group).then(async (result) => {
            let idgroup = _group.idgroup_message;

            if (_group.idgroup_message == undefined || _group.idgroup_message == 0) {
                idgroup = result.data.idgroup_message;
                _group.idgroup_message = idgroup;
            }

            for (let index = 0; index < _messages.length; index++) {
                const message = _messages[index];

                const newmessage = await axios.post(`${constants.apiurl}/api/message`, { ...message, idgroup });
                let idmessage = message.idmessage;

                if (!message.idmessage) {
                    idmessage = newmessage.data.idmessage;
                    message.idmessage = idmessage;
                    _messages[index] = message;
                }
            }

            //Save Options
            for (const message of _messages) {
                if (message && message.options && !message.withoutOptions) {
                    for (let indice = 0; indice < message.options.length; indice++) {
                        const option = message.options[indice];
                        if (option.template > 0) {
                            const messagefound = _messages.find(m => m.templateID == option.template);
                            if (messagefound) {
                                await axios.post(`${constants.apiurl}/api/option`, { ...option, idmessage: message.idmessage, idgroup, indice, action: messagefound.idmessage });
                            } else {
                                console.error(option.template)
                            }
                        } else {
                            await axios.post(`${constants.apiurl}/api/option`, { ...option, idmessage: message.idmessage, idgroup, indice, action: option.template });
                        }
                    }
                }
            }

            for (const freeOption of listFreeOptions) {

                let _action = freeOption.action;

                if (freeOption.action > 0) {
                    const message = _messages.find(m => m.templateID == freeOption.action);
                    if (message) {
                        _action = message.idmessage
                    }
                }
                await axios.post(`${constants.apiurl}/api/option`, { ...freeOption, idmessage: undefined, idgroup, action: _action, indice: 0 });
            }

            navigate('/groups');
        });


    }, []);

    const addFreeOption = useCallback((freeOption) => {
        freeOption.indice = listFreeOptions.length;
        listFreeOptions.push(freeOption);
        setFreeOptions([...listFreeOptions]);
    }, []);

    const cmbOptionAnswerOnChange = async (e, indexMessage, indexOption) => {
        console.log('----------')
        if (indexMessage !== undefined && indexOption !== undefined) {
            onHandleChangeOptionMessage(indexMessage, indexOption, e);
        } else {
            onHandleChangeFreeOption(listFreeOptions.length - 1, e);
        }

        const idTemplate = Number(e.target.value)
        if (idTemplate > 0) {

            if (_messages.length === 0 || (_messages.length > 0 && _messages.find(m => m.templateID === idTemplate) === undefined)) {
                const template = templates.find(t => t.idtemplate === idTemplate);

                const message = {
                    name: '',
                    templateID: idTemplate,
                    template: template.name,
                    type: 1,
                    idgroup: 0,
                    index: _messages.length,
                    expected: 'none',
                    resource: ''
                }

                if (template.typeId === 2 || template.typeId === 3) {
                    message.options = (await axios.get(`${constants.apiurl}/api/buttonstemplateByTemplateOptions/${idTemplate}`)).data;
                } else if (template.typeId === 5) {
                    message.options = [{
                        answer: 'On Success Do',
                        template: -2
                    },
                    {
                        answer: 'On Error Do',
                        template: -2
                    }];
                } else {
                    message.options = [{
                        answer: '',
                        template: -2
                    }];
                }
                _messages.push(message);
                setMessages([..._messages]);
            }
        }
    }

    useEffect(() => {
        if (useEffectRef.current) return;
        useEffectRef.current = true;

        const _idGroup = localStorage.getItem('currentGroupID');
        setIdGroup(_idGroup);
        __idGroup = _idGroup;

        if (_idGroup === '0') {
            setGroup({ headerId: 1, typeId: 1 });
            _group = { headerId: 1, typeId: 1 };
        } else {
            axios.get(`${constants.apiurl}/api/group/${_idGroup}`).then(result => {
                setGroup(result.data);
                _group = result.data;
            });

            axios.get(`${constants.apiurl}/api/messageByIdGroup/${_idGroup}`).then(async (result) => {
                _messages = result.data

                for (const message of _messages) {
                    const options = (await axios.get(`${constants.apiurl}/api/optionsByMessage/${message.idmessage}`)).data;
                    if (options) {
                        message.options = options;
                    }
                }
                setMessages(_messages);
            });
        }

        axios.get(`${constants.apiurl}/api/templates`).then(result => {
            _templates = result.data;
            setTemplates(result.data);
        });

        axios.get(`${constants.apiurl}/api/types`).then(result => {
            setTypes(result.data);
        });

        axios.get(`${constants.apiurl}/api/optionsByGroupAndNotAsociated/${_idGroup}`).then(result => {
            listFreeOptions = result.data
            setFreeOptions(listFreeOptions);
        });
    }, []);

    useEffect(() => {
        listFreeOptions = [];
        _messages = [];
        _group = {};
        metadataBd = [];
    }, [])

    useEffect(() => {
        setdisabledGuardarButton(hasEmptyFields())
    }, [freeOptions, group]);

    return <div className="content">
                <Card>
                    <CardHeader>
                        <h5 className="title">{idGroup !== '0' ? 'Editar' : 'Crear'} conversacion {idGroup !== '0' ? '-' : ''} {group.name}</h5>
                    </CardHeader>
                    <CardBody>     
                    <div className="margin-bottom-2vh flex-left items-center">            
                        <button className="btn btn-primary" disabled={disabledGuardarButton} onClick={saveChanges}> Guardar cambios </button>
                    </div>

        <div className="margin-bottom-2vh">
            <div className='row'>


                <div className='col-12'>
                    <strong htmlFor="">Nombre</strong>
                    <input className='form-control' type="text" name='name' defaultValue={group.name} onChange={onHandleChange} placeholder="Escriba el nombre aqui" />
                </div>
            </div>

            <strong>Mensajes</strong>
            {
                freeOptions?.map((freeOption, index) =>
                    <div key={index} className='row'>
                        <div className='col-6'>
                            <label htmlFor="">Mensaje del usuario</label>
                            <input className="form-control" type="text" defaultValue={freeOption.answer} name='answer' onChange={() => onHandleChangeFreeOption(index, window.event)} />
                        </div>
                        <div className='col-6'>
                            <label htmlFor="">Respuesta</label>
                            <select className="form-control" name="action" value={freeOption.template} onChange={(event) => cmbOptionAnswerOnChange(event, undefined, undefined)}>
                                <option value={-2}> Sin respuesta   </option>
                                <option value={0}>  Respuesta previa    </option>
                                <option value={-1}> Finalizar   </option>
                                {
                                    templates?.map((template, index2) =>
                                        <option key={index2} value={template.idtemplate}>{template.name}</option>
                                    )}
                            </select>
                        </div>
                    </div>
                )
            }

            {
                messages?.map((message, index) =>
                    <div key={index}>
                        <div className="row">
                            <div className="col-4">
                                <label htmlFor="template">Plantilla</label> <br />
                                <label className='form-control'>{message.template}</label>
                            </div>
                            <div className="col-4">
                                <label htmlFor="type">Tipo</label>
                                <select className="form-control" name="type" onChange={() => onHandleChangeMessage(index, window.event)}>
                                    {
                                        types?.map((type, index) =>
                                            <option key={index} value={type.idtypes} selected={message.type === type.idtypes}>{type.name}</option>
                                        )}
                                </select>
                            </div>
                            <div className="col-4">
                                <label htmlFor="expected">Espera</label>
                                <select className="form-control" name="expected" onChange={() => onHandleChangeMessage(index, window.event)}>
                                    <option value="none" selected={message.expected === 'none'}>Nada</option>
                                    <option value="text" selected={message.expected === 'text'}>Texto</option>
                                    <option value="image" selected={message.expected === 'image'}>Imagen</option>
                                    <option value="video" selected={message.expected === 'video'}>Video</option>
                                    <option value="button" selected={message.expected === 'button'}>Boton</option>
                                    <option value="pdf" selected={message.expected === 'pdf'}>Pdf</option>
                                </select>
                            </div>     
                        </div>
                        <div className='row'>
                            <div className='col-12'>
                                <div className='row'>
                                <div className='col-6'>
                                    <strong>Respuestas</strong>
                                </div>
                                <div className='col-6'>
                                    {
                                    message?.options?.map((option, indexOption) =>
                                        <div key={indexOption} className="col-12">
                                            {/* <div className='col-6'>
                                                {option.answer}
                                            </div> */}
                                            {/* <div className='col-6'> */}
                                                <select className="form-control" name="template" value={option.template} onChange={() => cmbOptionAnswerOnChange(window.event, index, indexOption,)}>
                                                    <option value={-2}>Sin respuesta</option>
                                                    {
                                                        templates?.map((template, index2) => {
                                                            if (template.idtemplate !== message.templateID) {
                                                                return <option key={index2} value={template.idtemplate}>{template.name}</option>
                                                            }
                                                            return null
                                                        }
                                                        )}
                                                </select>
                                            {/* </div> */}
                                        </div>
                                    )
                                    }
                                </div>
                                </div>                                
                            </div>
                          
                            
                        </div>                   
                    </div>
                )}

            <div className='flex-right'>
                <button className='btn btn-primary' onClick={() => {
                    addFreeOption({
                        idgroup: idGroup,
                        answer: '',
                        action: -2
                    })
                }}>Agregar mensaje</button>
            </div>
        </div>
                    </CardBody>
                </Card>
    </div>;
}

export default Conversation;