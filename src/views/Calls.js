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
    FormGroup
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
    const [textModalAdvice, settextModalAdvice] = useState('');
    const [showAdvice, setShowAdvice] = useState(false);
    const [modalVisible, setModalVisible] = React.useState(false);

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

    async function getExtension(filename) {
        return filename.split('.').pop();
    }

    async function start() {
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
                if(files.length > 5) {
                    sendNotification('Solo puedes subir hasta 5 archivos.', 'danger');
                    return;
                }    
                Array.from(files).forEach(async file => {
                    setLoaderActive(true);
                    const extension = await getExtension(file.name);
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
    
    const cafilteredCalls = Array.isArray(calls) ? calls.filter(call => String(call.name).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) : [];
    
    return <div className="content">
                <div className="react-notification-alert-container">
                    <NotificationAlert ref={notificationAlertRef} />
                </div>
                <Loader active={loaderActive} />
                <Modal isOpen={modalVisible} toggle={toggleModal}>
                    <ModalHeader>
                        <h2 style={{color: '#000', marginBottom: '0px'}}>Payload Accion</h2>
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
                                <Col md="3" sm="12" style={{marginTop: '5px'}}>
                                    <label>Escoge un agente</label>
                                    <select title="Escoge un agente"  className="form-control" name="idAdviser" value={call.idAdviser} onChange={onHandleChange}>
                                        {
                                            advisors?.map((advisor, index) => 
                                            <option key={index} value={advisor.idadviser}>{advisor.name} {advisor.lastName}</option>
                                        )} 
                                    </select>
                                </Col>
                                <Col md="3" sm="12" style={{marginTop: '5px'}}>
                                    <label>Escoge el idioma de los archivos</label>
                                    <select title="Escoge un idioma para los archivos" className="form-control" name="languague" onChange={onHandleChange}>
                                        <option value="1">Español</option>
                                        <option value="2">English</option>
                                        <option value="3">Français</option>
                                    </select>
                                </Col>
                                <Col md="3" sm="12" style={{marginTop: '5px'}}>
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
                               
                                <Col md="1" sm="12" style={{marginTop: '5px'}}>
                                    <label> </label>
                                    <Link style={{padding: '10px', borderRadius: '5px', backgroundColor: '#fff', width: '100%', display: 'flex', justifyContent:'center'}} to="javascript:void(0)" title="Iniciar analisis" href="#" onClick={start}>
                                        <i style={{fontSize: '20px'}} className="fa-solid fa-play"></i>
                                    </Link>
                                </Col>
                                <Col md="12">
                                    <hr></hr>
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
                                                <Link title='Ver transcripcion' to="javascript:void(0)" onClick={() => toggleModal(call.transcription)}> 
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