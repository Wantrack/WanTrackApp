import React, { useState, useEffect, useRef } from 'react';
import NotificationAlert from "react-notification-alert";
import { Link } from "react-router-dom";
import Loader from '../components/Loader/Loader';

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
    const [textModal, settextModal] = useState('');
    const [modalVisible, setModalVisible] = React.useState(false);

    const notificationAlertRef = useRef(null);
    const inputFileref = useRef();
    
    useEffect(() => { 
        setLoaderActive(true)
        axios.get(`${constants.apiurl}/api/adviser`).then(result => {
            setLoaderActive(false)
            setAdvisors(result.data);
        }); 
        
        loadCalls()
    }, []);

    const loadCalls = async () => {
        const result = await axios.get(`${constants.apiurl}/api/call`);
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

    async function start() {        
        if(files && files.length > 0) {
            for (const file of files) {
                setLoaderActive(true);
                let formData = new FormData();
                formData.append("file", file);
                const audiofile = await axios.post(`${constants.apiurl}/api/aws/uploadauidoemotion/audioemotions/1`, formData, { headers: {"Content-Type": "multipart/form-data"}});
                await axios.post(`${constants.apiurl}/api/feelingsSummary`, { url : audiofile.data.url, idadviser: call.idAdviser });                
                setLoaderActive(false);
                await loadCalls();
            }
            setFiles([]);
            inputFileref.current.value = "";
        } else {
            sendNotification('Debes escoger un archivo para iniciar', 'danger');
        }               
    }

    const toggleModal = (text) => {
        if(text) {
            settextModal(text);
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
                            <label>Payload</label>
                            <textarea style={{color: '#000'}} className="form-control" placeholder="{ ... }" cols="30" rows="10" defaultValue={textModal} name='Trasncripcion'></textarea>
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
                                <Col md="4" sm="12" style={{marginTop: '5px'}}>
                                    <select title="Escoge un agente"  className="form-control" name="idAdviser" value={call.idAdviser} onChange={onHandleChange}>
                                        {
                                            advisors?.map((advisor, index) => 
                                            <option key={index} value={advisor.idadviser}>{advisor.name} {advisor.lastName}</option>
                                        )} 
                                    </select>
                                </Col>
                                <Col md="4" sm="12" style={{marginTop: '5px'}}>
                                    <Input ref={inputFileref} accept=".wav,.mp3" title="Escoge uno o mas archivos de audio" placeholder="Sube tu audio" type="file" name='file' multiple onChange={onHandleChangeFile}/>
                                </Col>
                                <Col md="1" sm="12" style={{marginTop: '5px'}}>
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
                                        <th style={{textAlign:'center'}}>Transcripcion</th>
                                        <th style={{textAlign:'center'}}>Resumen</th>
                                        <th>Audio</th>
                                        <th>Tiempo</th>
                                        <th>Fecha</th>
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
                                            <td style={{textAlign:'center'}}> 
                                                <Link title='Ver transcripcion' to="javascript:void(0)" onClick={() => toggleModal(call.transcription)}> 
                                                    <i style={{fontSize: '20px'}} className="fa-solid fa-headset"></i>
                                                </Link>
                                            </td>
                                            <td style={{textAlign:'center'}}> <Link title='Ver transcripcion' to="javascript:void(0)" onClick={() => toggleModal(call.summary)}> <i style={{fontSize: '20px'}} className="fa-solid fa-clipboard-list"></i></Link></td>
                                            <td> 
                                                <Link title='Escuchar audio' to={call.audiourl} target='_blank'> 
                                                    <i style={{fontSize: '20px'}} className="fa-solid fa-circle-play"></i>
                                                </Link>
                                            </td>
                                            <td className='m_title'> { clockformat(call.audioDuration || 0)} </td>
                                            <td> {moment(call.creationdate).format('DD-MM-YYYY hh:mm:ss')}</td>
                                        </tr>
                                    )}                   
                                </tbody>          
                            </table>
                        </div> 
                    </CardBody>
                </Card>
    </div>;
}

function goToAdvisorOnClick(idadviser) {
    localStorage.setItem('currentAdvisorID', idadviser);
}

export default Calls;