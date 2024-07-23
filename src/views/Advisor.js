import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  FormGroup,
  Form,
  Input,
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";

import moment from 'moment';

import { axios } from '../config/https';
import constants from '../util/constans';

function Advisor() {
  const navigate = useNavigate ();
  const [advisor, setAdvisor] = useState({});
  const [companies, setCompanies] = useState([]); 
  const [calls, setCalls] = useState([]);
  const [textModal, settextModal] = useState('');
  const [modalVisible, setModalVisible] = React.useState(false);

  const onHandleChange = (e) => {
    const { name, value } = e.target;
    setAdvisor({
      ...advisor,
      [name]: value 
    });
  }

  const cmbCompanyOnChange = async (e) => { 
    onHandleChange(e);        
  }  

  useEffect(() => { 
   async function load() {
    const currentAdvisorID = localStorage.getItem('currentAdvisorID');
    const _companies = await axios.get(`${constants.apiurl}/api/companies`);
    setCompanies([{idcompany: -1, name: 'Sin Empresa'}, ..._companies.data]);
    const _user =  await axios.get(`${constants.apiurl}/api/adviser/${currentAdvisorID}`);
    setAdvisor(_user.data);
    loadCalls(currentAdvisorID);
   }
   load();
   
  }, []);

  const loadCalls = (currentAdvisorID) => {
    axios.get(`${constants.apiurl}/api/callByAdviser/${currentAdvisorID}`).then(result => {
        setCalls(result.data);
    });   
  }

  function saveChanges() {
    axios.post(`${constants.apiurl}/api/adviser`, advisor).then(async (result) => {
        navigate('/admin/advisors');
    });
  }

  const toggleModal = (text) => {
    if(text) {
        settextModal(text);
    }        
    setModalVisible(!modalVisible);
  };

  return (
    <>
      <div className="content">
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
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <h5 className="title">Perfil de agente</h5>
              </CardHeader>
              <CardBody>
                <Form>
                  <Row>
                    <Col md="4">
                      <FormGroup>
                        <label>Empresa</label>
                        <select className="form-control" name="companyId" value={advisor.companyId} onChange={cmbCompanyOnChange}>
                        {
                            companies?.map((company, index) => 
                            <option key={index} value={company.idcompany}>{company.name}</option>
                        )} 
                        </select>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-md-1" md="4">
                      <FormGroup>
                        <label>Nombres</label>
                        <Input placeholder="Jhon Doe" type="text" name='name' defaultValue={advisor.name} onChange={onHandleChange}/>
                      </FormGroup>
                    </Col>
                    <Col className="pl-md-1" md="4">
                      <FormGroup>
                        <label>Apellidos</label>
                        <Input placeholder="Jhon Doe" type="text" name='lastName' defaultValue={advisor.lastName} onChange={onHandleChange}/>
                      </FormGroup>
                    </Col>
                    <Col className="pl-md-1" md="4">
                      <FormGroup>
                        <label>ID Externo</label>
                        <Input placeholder="010101" type="text" name='externalId' defaultValue={advisor.externalId} onChange={onHandleChange}/>
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="12">
                      <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr> 
                                        <th>Porcentaje de satisfaccion</th>     
                                        <th>Emocion principal</th>
                                        <th>Sentimiento predominante</th>
                                        <th style={{textAlign:'center'}}>Transcripcion</th>
                                        <th style={{textAlign:'center'}}>Resumen</th>
                                        <th>Audio</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {calls.map((call, index) => 
                                        <tr key={index}>
                                            <td> {call.satisfaction}</td>
                                            <td className='m_title'> {call.mainEmotion || '-'} </td>
                                            <td className='m_title'> {call.feeling || '-'} </td>
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
                                            <td> {moment(call.creationdate).format('DD-MM-YYYY hh:mm:ss')}</td>
                                        </tr>
                                    )}                   
                                </tbody>          
                            </table>
                        </div> 
                    </Col>
                  </Row>
                </Form>
              </CardBody>
              <CardFooter>
                <Button className="btn-fill" color="primary" type="submit" onClick={saveChanges}>
                  Guardar
                </Button>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Advisor;
