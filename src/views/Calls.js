import React, { useState, useEffect, useRef } from 'react';
import NotificationAlert from "react-notification-alert";
import { Link } from "react-router-dom";
import Loader from '../components/Loader/Loader';
import { decode } from "../util/base64";
import { axios } from '../config/https';
import constants from '../util/constans';
import moment from 'moment';

import {
    CardHeader,
    CardBody,
    Card,
    Input,
    Button,
    Row,
    Col,
    Modal,
    ModalHeader,
    ModalBody,
    FormGroup,
    ListGroup,
    ListGroupItem,
    Badge,
    ButtonGroup
  } from "reactstrap";
import { clockformat } from 'util/time';

function Calls (props) {
    const [call, setCall] = useState({});
    const [calls, setCalls] = useState([]);
    const [advisors, setAdvisors] = useState([]);
    const [loaderActive, setLoaderActive] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [files, setFiles] = useState([]);
    const [inputKey, setInputKey] = useState(Date.now());
    const [textModal, settextModal] = useState('');
    const [selectedCall, setSelectedCall] = useState({});
    const [textModalAdvice, settextModalAdvice] = useState('');
    const [showAdvice, setShowAdvice] = useState(false);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [modalVisibleT, setModalVisibleT] = React.useState(false);
    const [modalVisibleUploadFile, setModalVisibleUploadFile] = React.useState(false);
    const [modalVisibleFilter, setModalVisibleFilter] = React.useState(false);

    const [filterSaludo, setFilterSaludo] = useState([]);

    const notificationAlertRef = useRef(null);
    const inputFileref = useRef();
    
    useEffect(() => { 
        setLoaderActive(true)
        let idCompany = undefined;
        const _userinfoEncoded = localStorage.getItem(constants.userinfo);
        if(_userinfoEncoded) {
            const _userinfo = JSON.parse(decode(_userinfoEncoded));
            if(_userinfo.idCompany) {
                idCompany =_userinfo.idCompany
            }
        }
        axios.get(`${constants.apiurl}/api/adviserByCompany/${idCompany}`).then(result => {
            setLoaderActive(false)
            setAdvisors(result.data);

            if(Array.isArray(result.data) && result.data.length > 0) {
                setCall({
                    ...call,
                    idAdviser: result.data[0].idadviser,
                    languague: 1
                });
            }            
        }); 
        
        loadCalls()
    }, []);

    const loadCalls = async () => {
        setLoaderActive(true);
        let idCompany = undefined;
        const _userinfoEncoded = localStorage.getItem(constants.userinfo);
        if(_userinfoEncoded) {
            const _userinfo = JSON.parse(decode(_userinfoEncoded));
            if(_userinfo.idCompany) {
                idCompany =_userinfo.idCompany
            }
        }
        const result = await axios.get(`${constants.apiurl}/api/callByCompany/${idCompany}`);
        setLoaderActive(false);
        setCalls(result.data);
    }

    const onHandleChange = (e) => {
        const { name, value } = e.target;
        setCall({
          ...call,
          [name]: value 
        });
    }

    const onHandleChangeFile = (e) => {
        setFiles(e.target.files);
    }

    async function sendNotification(message, type = 'success') {    
        var options = {};
        options = {
          place: 'tr',
          message: (
            <div>
              <div>
                {message}
              </div>
            </div>
          ),
          type: type,
          icon: "tim-icons icon-bell-55",
          autoDismiss: 7,
        };
        notificationAlertRef.current.notificationAlert(options);
    }

    function getExtension(filename) {
        return filename.split('.').pop();
    }

    const getFileListIcon = (filename) => {
        const fileAudioExtension = ['3ga', '8svx', 'aac', 'ac3', 'aif', 'aiff', 'alac', 'amr', 'ape', 'au', 'dss', 'flac', 'flv', 'm4a', 'm4b', 'm4p', 'm4r', 'mp3', 'mpga', 'ogg', 'oga', 'mogg', 'opus', 'qcp', 'tta', 'voc', 'wav', 'wma', 'wv'];
    
        const extension = getExtension(filename);
        if(fileAudioExtension.includes(extension)) {
            return <i style={{fontSize: '16px'}} className="fa-solid fa-file-audio"></i>;
        } else if(extension == 'txt') {
            return <i style={{fontSize: '16px'}} className="fa-solid fa-file-lines"></i>;
        }else {
            return <i style={{fontSize: '16px'}} className="fa-solid fa-question"></i>;
        }
    }

    async function start() {
        setModalVisibleUploadFile(false);
        let idCompany = undefined;
        const _userinfoEncoded = localStorage.getItem(constants.userinfo);
        if(_userinfoEncoded) {
            const _userinfo = JSON.parse(decode(_userinfoEncoded));
            if(_userinfo.idCompany) {
                idCompany =_userinfo.idCompany
            }
        }
        if(call.idAdviser) {
            if(idCompany && files && files.length > 0) {        
                if(files.length > 10) {
                    sendNotification('Solo puedes subir hasta 10 archivos.', 'danger');
                    return;
                }    
                Array.from(files).forEach(async file => {
                    setLoaderActive(true);
                    const extension = getExtension(file.name);
                    console.log(extension)
                    if(extension == 'txt') {
                        let formData = new FormData();
                        formData.append("file", file);    
                        await axios.post(`${constants.apiurl}/api/feelingsSummaryChat/${call.idAdviser}/${call.languague}`, formData).catch(e => {
                            setLoaderActive(false);  
                        });                    
                    } else {
                        let formData = new FormData();
                        formData.append("file", file);                       
                        const audiofile = await axios.post(`${constants.apiurl}/api/aws/uploadauidoemotion/audioemotions/${idCompany}`, formData, { headers: {"Content-Type": "multipart/form-data"}});
                        await axios.post(`${constants.apiurl}/api/feelingsSummary`, { url : audiofile.data.url, idadviser: call.idAdviser, languague: call.languague });                                              
                    }
                    setLoaderActive(false);  
                    await loadCalls();
                });
                setFiles([]);
                inputFileref.current.value = '';
                setInputKey(Date.now());
            } else {
                sendNotification('Debes escoger un archivo para iniciar', 'danger');
            }
        } else {
            sendNotification('Debes escoger un agente para iniciar', 'danger');
        }
                       
    }

    const toggleModal = (text, advice) => {
        setShowAdvice(false);
        if(text) {
            settextModal(text);
        }        
        if(advice) {
            setShowAdvice(true);
            settextModalAdvice(advice);
        }
        setModalVisible(!modalVisible);
    };

    const toggleModalTranscription = (call) => {
        if(call.transcription) {
            setSelectedCall(call);
            if(call.transcription) {
                settextModal(call.transcription);
            }           
        }
        setModalVisibleT(!modalVisibleT);
    };

    const toggleModalUploadFile = () => {
        setModalVisibleUploadFile(!modalVisibleUploadFile);
    }

    const toggleModalFilter = () => {
        setModalVisibleFilter(!modalVisibleFilter);
    }
    
    const cafilteredCalls = Array.isArray(calls) ? calls.filter(call => String(call.name).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) : [];

    const setTranscription = (type) => {
        if(type == 1) {
            try {
                const arrayTranscription = JSON.parse(textModal);
            if(arrayTranscription && Array.isArray(arrayTranscription) && arrayTranscription.length > 0) {
                let firstPerson = arrayTranscription[0].speaker ;
                return (
                    <div style={{display:'flex', flexDirection: 'column'}}>
                    {arrayTranscription.map((item, index) => (                
                <div
                key={index}              
                className={`${item.speaker == firstPerson ? "message-left" : "message-right"}`}
                >
                <div>
                    <p style={{color:'#FFFFFF'}}>{item.text}</p>
                </div>
                <p style={{display:'flex', justifyContent: 'space-between', color:'#F5F5F5'}} className="type-message"> <span style={{color:'#F5F5F5'}}>{item.startTime} - {item.endTime}</span> Emocion: {item.emotion}</p>
                </div>
                ))}</div>)
            }
            } catch (error) { }
                        
        } else {
            if(textModal && (typeof textModal === 'string' || textModal instanceof String)) {
                const text = textModal.replaceAll('\"', '').replaceAll(/\r/g, ' ').replaceAll('\\n', '\n');
                return (<textarea disabled readOnly style={{color: '#000'}} className="form-control" placeholder="{ ... }" cols="30" rows="10" value={text} name='Trasncripcion'></textarea>);
            }           
        }
    }

    const onCheckboxBtnSaludoClick = (selected) => {
        const index = filterSaludo.indexOf(selected);
        if (index < 0) {
            filterSaludo.push(selected);
        } else {
            filterSaludo.splice(index, 1);
        }
        setFilterSaludo([...filterSaludo]);
      };
    
    return <div className="content">
                <div className="react-notification-alert-container">
                    <NotificationAlert ref={notificationAlertRef} />
                </div>
                <Loader active={loaderActive} />
                <Modal isOpen={modalVisibleUploadFile} toggle={toggleModalUploadFile}>
                    <ModalHeader>
                        <h3 style={{color: '#000', marginBottom: '0px'}}>Propiedades</h3>
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col md="12" sm="12" style={{marginTop: '5px'}}>
                                <label>Escoge un agente</label>
                                <select title="Escoge un agente" className="form-control color_black" name="idAdviser" value={call.idAdviser} onChange={onHandleChange}>
                                    {
                                        advisors?.map((advisor, index) => 
                                        <option key={index} value={advisor.idadviser}>{advisor.name} {advisor.lastName}</option>
                                    )} 
                                </select>
                            </Col>
                            <Col md="12" sm="12" style={{marginTop: '5px'}}>
                                <label>Escoge el idioma de los archivos</label>
                                <select title="Escoge un idioma para los archivos" className="form-control color_black" name="languague" onChange={onHandleChange}>
                                    <option value="1">Español</option>
                                    <option value="2">English</option>
                                    <option value="3">Français</option>
                                </select>
                            </Col>
                            <Col md="12" sm="12" style={{marginTop: '5px'}}>
                                <label>Sube archivos de audio o texto</label>
                                <Input 
                                    key={inputKey} 
                                    ref={inputFileref} 
                                    accept=".txt, .3ga, .8svx, .aac, .ac3, .aif, .aiff, .alac, .amr, .ape, .au, .dss, .flac, .flv, .m4a, .m4b, .m4p, .m4r, .mp3, .mpga, .ogg, .oga, .mogg, .opus, .qcp, .tta, .voc, .wav, .wma, .wv" 
                                    title="Escoge uno o mas archivos" 
                                    placeholder="Sube tu archivo" 
                                    type="file" 
                                    name='file'
                                    multiple onChange={onHandleChangeFile}/>
                            </Col>   
                            <Col md="12" style={{maxHeight:'300px', overflowY: 'auto'}}>                                
                                <ListGroup>
                                    { Array.from(files)?.map((file, index) =>
                                    <ListGroupItem  key={index}  className="color_black">
                                        <Row>
                                            <Col sm="10" className='listItem'>
                                                {file.name}
                                            </Col>                                               
                                            <Col sm="2">
                                                <Badge pill className='badge-override'>
                                                    {getFileListIcon(file.name)}
                                                </Badge>
                                            </Col>
                                        </Row> 
                                    </ListGroupItem>
                                    )}
                                </ListGroup>
                            </Col>
                            <Col md="12">
                                <hr></hr>
                            </Col>                              
                        </Row>     
                        <Row style={{display:'flex', justifyContent: 'space-between'}}>
                            <Col md="6" sm="12" style={{marginTop: '5px'}}>
                                <Button onClick={start} style={{marginTop: '20px'}} className="btn btn-primary width100p">
                                    Iniciar Analisis
                                </Button>
                            </Col>
                            <Col md="6" sm="12" style={{marginTop: '5px'}}>
                                <Button onClick={toggleModalUploadFile} style={{marginTop: '20px'}} className="btn btn-primary width100p">
                                    Cerrar
                                </Button>
                            </Col>
                        </Row>                   
                    </ModalBody>
                </Modal>

                <Modal isOpen={modalVisibleFilter} toggle={toggleModalFilter}>
                    <ModalHeader>
                        <h3 style={{color: '#000', marginBottom: '0px'}}>Filtros</h3>
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col md="12" sm="12" style={{marginTop: '5px'}}>
                                <label>Filtra por agente</label>
                                <select title="Escoge un agente" className="form-control color_black" name="idAdviser" value={call.idAdviser} onChange={onHandleChange}>
                                    {
                                        advisors?.map((advisor, index) => 
                                        <option key={index} value={advisor.idadviser}>{advisor.name} {advisor.lastName}</option>
                                    )} 
                                </select>
                            </Col>
                            <Col md="12" sm="12" style={{marginTop: '5px'}}>
                                <label>Filtra por idioma</label>
                                <select title="Escoge un idioma para los archivos" className="form-control color_black" name="languague" onChange={onHandleChange}>
                                    <option value="1">Español</option>
                                    <option value="2">English</option>
                                    <option value="3">Français</option>
                                </select>
                            </Col>
                            <Col md="12" sm="12" style={{marginTop: '5px'}}>                               
                                <Row>
                                    <Col md="6">
                                        <label>Desde</label>
                                        <Input
                                        id="exampleDate"
                                        name="date"
                                        placeholder="Fecha Inicial"
                                        type="date"
                                        />
                                    </Col>
                                    <Col md="6">
                                        <label>Hasta</label>
                                        <Input
                                        id="exampleDate"
                                        name="date"
                                        placeholder="Fecha Inicial"
                                        type="date"
                                        />
                                    </Col>
                                </Row>
                            </Col>   
                            <Col md="12" style={{maxHeight:'300px', overflowY: 'auto'}}>                                
                                <label>Areas de Oportunidad</label>
                                <Row>
                                    <Col md="12">
                                        <label>Saludo</label>
                                        <ButtonGroup style={{marginLeft: '10px'}}>
                                            <Button
                                            className='button-filter'
                                            color="primary"
                                            outline
                                            onClick={() => onCheckboxBtnSaludoClick(1)}
                                            active={filterSaludo.includes(1)}
                                            >
                                            <i style={{color:'#2dce89'}} className="fa-solid fa-circle-check"></i>
                                            </Button>
                                            <Button
                                            className='button-filter'
                                            color="primary"
                                            outline
                                            onClick={() => onCheckboxBtnSaludoClick(2)}
                                            active={filterSaludo.includes(2)}
                                            >
                                            <i style={{color:'#ff8d72'}}className="fa-solid fa-triangle-exclamation"></i>
                                            </Button>
                                            <Button
                                            className='button-filter'
                                            color="primary"
                                            outline
                                            onClick={() => onCheckboxBtnSaludoClick(3)}
                                            active={filterSaludo.includes(3)}
                                            >
                                            <i style={{color:'#f5365c'}} className="fa-solid fa-xmark"></i>
                                            </Button>
                                        </ButtonGroup>
                                    </Col>
                                </Row>
                            </Col>
                            <Col md="12">
                                <hr></hr>
                            </Col>                              
                        </Row>     
                        <Row style={{display:'flex', justifyContent: 'space-between'}}>
                            <Col md="6" sm="12" style={{marginTop: '5px'}}>
                                <Button onClick={start} style={{marginTop: '20px'}} className="btn btn-primary width100p">
                                    Filtrar
                                </Button>
                            </Col>
                            <Col md="6" sm="12" style={{marginTop: '5px'}}>
                                <Button onClick={toggleModalFilter} style={{marginTop: '20px'}} className="btn btn-primary width100p">
                                    Cerrar
                                </Button>
                            </Col>
                        </Row>                   
                    </ModalBody>
                </Modal>

                <Modal modalClassName='modal-charts' isOpen={modalVisibleT} toggle={toggleModalTranscription} fullscreen>
                    <ModalHeader>
                        <h2 style={{color: '#000', marginBottom: '0px'}}>Transcripcion</h2>
                    </ModalHeader>
                    <ModalBody>
                        <FormGroup style={{maxHeight: '30rem', overflowY: 'auto'}}>
                            <label>Transcripcion</label>
                            {setTranscription(selectedCall.type)}
                        </FormGroup>                       
                        <Button onClick={toggleModalTranscription} style={{marginTop: '20px'}} className="btn btn-primary">
                            Cerrar
                        </Button>
                    </ModalBody>
                </Modal>
                <Modal isOpen={modalVisible} toggle={toggleModal}>
                    <ModalHeader>
                        <h2 style={{color: '#000', marginBottom: '0px'}}>Resumen</h2>
                    </ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <label>Resumen</label>
                            <textarea disabled style={{color: '#000'}} className="form-control" placeholder="{ ... }" cols="30" rows="10" defaultValue={textModal} name='Trasncripcion'></textarea>
                        </FormGroup>
                        <FormGroup className={showAdvice ? 'show': 'hide'}>
                            <label>Concejos</label>
                            <textarea disabled style={{color: '#000'}} className="form-control" placeholder="{ ... }" cols="30" rows="10" defaultValue={textModalAdvice} name='advice'></textarea>
                        </FormGroup>
                        <Button onClick={toggleModal} style={{marginTop: '20px'}} className="btn btn-primary">
                            Cerrar
                        </Button>
                    </ModalBody>
                </Modal>
                <Card>
                    <CardHeader>
                        <h5 className="title">LLamadas</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="margin-bottom-2vh flex-left">
                            <div className="input-group flex-nowrap w-full">
                                <span className="input-group-text z-0" id="addon-wrapping"><i className="fa fa-search"></i></span>
                                <input type="text" className="form-control px-2" placeholder="Escriba el nombre del agente"
                                onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Row>
                                <Col md="1" sm="12" style={{marginTop: '5px'}}>
                                    <label> </label>
                                    <Link style={{padding: '10px', borderRadius: '5px', backgroundColor: '#fff', width: '100%', display: 'flex', justifyContent:'center'}} to="javascript:void(0)" title="Subir archivos" href="#" onClick={toggleModalUploadFile}>
                                        <i style={{fontSize: '20px'}} className="fa-solid fa-upload"></i>
                                    </Link>                                   
                                </Col>
                                <Col md="1" sm="12" style={{marginTop: '5px'}}>
                                    <label> </label>
                                    <Link style={{padding: '10px', borderRadius: '5px', backgroundColor: '#fff', width: '100%', display: 'flex', justifyContent:'center'}} to="javascript:void(0)" title="Subir archivos" href="#" onClick={toggleModalFilter}>
                                        <i style={{fontSize: '20px'}} className="fa-solid fa-filter"></i>
                                    </Link>                                   
                                </Col>
                            </Row>                            
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>                            
                                        <th>Agente</th>
                                        <th>Porcentaje de satisfaccion</th>     
                                        <th>Emocion principal</th>
                                        <th>Sentimiento predominante</th>
                                        <th title='Net Promoter Score calculado con base a la conversación'>NPS</th>
                                        <th>Tipo</th>
                                        <th style={{textAlign:'center'}}>Transcripcion</th>
                                        <th style={{textAlign:'center'}}>Resumen</th>
                                        <th>Audio</th>
                                        <th>Tiempo</th>
                                        <th>Fecha</th>
                                        <th style={{textAlign: 'center'}}>Saludo</th>
                                        <th style={{textAlign: 'center'}}>Escucha</th>
                                        <th style={{textAlign: 'center'}}>Comunicación clara</th>
                                        <th style={{textAlign: 'center'}}>Información precisa</th>
                                        <th style={{textAlign: 'center'}}>Ofertas relevantes</th>
                                        <th style={{textAlign: 'center'}}>Eficiencia</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cafilteredCalls.map((call, index) => 
                                        <tr key={index}>
                                            <td> <Link to="/admin/advisor" onClick={() => goToAdvisorOnClick(call.idAdviser)}> {call.name}</Link> </td>
                                            <td> {call.satisfaction}%</td>
                                            <td className='m_title'> {call.mainEmotion || '-'} </td>
                                            <td className='m_title'> {call.feeling || '-'} </td>
                                            <td className='m_title'> {call.scorenps || '-'} </td>
                                            <td className='m_title'> {getIconType(call.type)} </td>
                                            <td style={{textAlign:'center'}}> 
                                                <Link title='Ver transcripcion' to="javascript:void(0)" onClick={() => toggleModalTranscription(call)}> 
                                                    <i style={{fontSize: '20px'}} className="fa-solid fa-headset"></i>
                                                </Link>
                                            </td>
                                            <td style={{textAlign:'center'}}> <Link title='Ver transcripcion' to="javascript:void(0)" onClick={() => toggleModal(call.summary, call.advice)}> <i style={{fontSize: '20px'}} className="fa-solid fa-clipboard-list"></i></Link></td>
                                            <td> 
                                                <Link className={call.type == 1 ? 'show' : 'hide'} title='Escuchar audio' to={call.audiourl} target='_blank'> 
                                                    <i style={{fontSize: '20px'}} className="fa-solid fa-circle-play"></i>
                                                </Link>

                                                <i style={{fontSize: '20px'}} className={call.type == 1 ? 'hide' : 'show fa-solid fa-circle-minus'}></i>
                                            </td>
                                            <td className='m_title'> { clockformat(call.audioDuration || 0)} </td>
                                            <td> {moment(call.creationdate).format('DD-MM-YYYY hh:mm:ss')}</td>
                                            <td style={{textAlign: 'center'}} className='m_title'> {getIcon(call.professionalgreetings)} </td>
                                            <td style={{textAlign: 'center'}} className='m_title'> {getIcon(call.activelistening)} </td>
                                            <td style={{textAlign: 'center'}} className='m_title'> {getIcon(call.clearcommunication)} </td>
                                            <td style={{textAlign: 'center'}} className='m_title'> {getIcon(call.accuratecommunication)} </td>
                                            <td style={{textAlign: 'center'}} className='m_title'> {getIcon(call.relevantoffers)} </td>                                            
                                            <td style={{textAlign: 'center'}} className='m_title'> {getIcon(call.efficenthandling)} </td>
                                        </tr>
                                    )}                   
                                </tbody>          
                            </table>
                        </div> 
                    </CardBody>
                </Card>
    </div>;
}

const getIcon = (value) => { 
    if(value == undefined) {
      return <i className="fa-solid fa-minus"></i>
    }

    if(value >3 && value < 6) {
        return <i style={{color:'#2dce89'}} className="fa-solid fa-circle-check"></i>
    } else if(value >2 && value < 4) {
      return <i style={{color:'#ff8d72'}}className="fa-solid fa-triangle-exclamation"></i>
    } else {
      return <i style={{color:'#f5365c'}} className="fa-solid fa-xmark"></i>
    }    
}  

const getIconType = (value) => { 
    if(value == undefined) {
      return <i title='Llamada' className="fa-solid fa-phone-flip"></i>
    }

    if(value == 1) {
        return <i title='Llamada' style={{color:'#2dce89'}} className="fa-solid fa-phone-flip"></i>
    } else if(value  == 2 ) {
      return <i title='Chat' style={{color:'#ff8d72'}}className="fa-solid fa-comment"></i>
    }   
} 

function goToAdvisorOnClick(idadviser) {
    localStorage.setItem('currentAdvisorID', idadviser);
}

export default Calls;