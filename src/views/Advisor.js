import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Doughnut, Pie } from "react-chartjs-2";
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
import { obtenerColor } from 'util/colors';
import { sColors } from 'util/sentimentColors';
import { eColors } from 'util/emotionColors';

function Advisor() {
  const navigate = useNavigate ();
  const [advisor, setAdvisor] = useState({});
  const [companies, setCompanies] = useState([]); 
  const [calls, setCalls] = useState([]);
  const [textModal, settextModal] = useState('');
  const [modalVisible, setModalVisible] = React.useState(false);
  const [dataChart, setDataChart] = useState([50,50]);
  const [dataChart2, setDataChart2] = useState([]);
  const [dataChart2Labels, setDataChart2Labels] = useState([]);
  const [dataChart2Colorss, setDataChart2Colors] = useState([]);
  const [dataChart3, setDataChart3] = useState([]);
  const [dataChart3Labels, setDataChart3Labels] = useState([]);
  const [dataChart3Colorss, setDataChart3Colors] = useState([]);

  const data = {
    labels: ['😡', '😁'],
    datasets: [
      {        
        data: dataChart,
        backgroundColor: [
          "#ff6961",
          "#77dd77"
        ],     
        circumference: 180,
        rotation:270,
        borderColor: "#D1D6DC"
      }
    ]
  };

  const data2 = {
    labels: dataChart2Labels,
    datasets: [
      {        
        data: dataChart2,
        backgroundColor: dataChart2Colorss,
        borderColor: "#D1D6DC"
      }
    ]
  };

  const data3 = {
    labels: dataChart3Labels,
    datasets: [
      {        
        data: dataChart3,
        backgroundColor: dataChart3Colorss,
        borderColor: "#D1D6DC"
      }
    ]
  };

  const options = {
    maintainAspectRatio: false,
    aspectRatio: 1,
    plugins: {
      title: {
        display: true,
        text: "Porcentaje de Satisfaccion",
        color:'#fff',
        align: "center",
        padding: {
          top: 10,
        },
      },
      legend: {
        display: true,
        labels: {
            font: {
                size: 24
            }
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
            label: (yDatapoint) => {return yDatapoint.raw.toFixed(2)  + ' %'},
          }
      }
    },
    responsive: true
  }

  const options2 = {
    maintainAspectRatio: false,
    aspectRatio: 1,
    plugins: {
      title: {
        display: true,
        text: "Emocion principal",
        align: "center",
        color:'#fff',
        padding: {
          top: 10,
        },
        font: {                
          size: 13
        }
      },
      legend: {
        display: true,
        labels: {
            color:'#f5f5f5',
            font: {                
                size: 12
            }
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
            label: (yDatapoint) => {return yDatapoint.raw},
          }
      }
    },
    responsive: true
  }

  const options3 = {
    maintainAspectRatio: false,
    aspectRatio: 1,
    plugins: {
      title: {
        display: true,
        color:'#fff',
        text: "Sentimiento predominante",
        align: "center",
        padding: {
          top: 10,
        },
        font: {                
          size: 13
        }
      },
      legend: {
        display: true,
        labels: {
            color:'#f5f5f5',
            font: {
                size: 12
            }
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
            label: (yDatapoint) => {return yDatapoint.raw},
          }
      }
    },
    responsive: true
  }

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

  function capitalizeFirstLetter(str) {
    return str[0].toUpperCase() + str.slice(1);
  }

  const loadCalls = (currentAdvisorID) => {
    axios.get(`${constants.apiurl}/api/callByAdviser/${currentAdvisorID}`).then(result => {
        setCalls(result.data);

        if(result.data) {
            //calculate percent
            const positiveArray = result.data.map(d => parseInt(d.satisfaction));

            const positive = positiveArray.reduce((a, b) => a + b, 0) / positiveArray.length;
            const negative = 100 - positive;
            setDataChart([negative, positive]);

            //chart main emotion
            const arrayemotions = result.data.map(d => capitalizeFirstLetter(d.mainEmotion));
            const _data2 = contarEmociones(arrayemotions);
            setDataChart2(_data2.map(d => d.conteo));
            setDataChart2Labels(_data2.map(d => d.emocion));
            let colors2 = [];
            for (const item of _data2) {
              const _eColorItem = eColors.find(i => i.emotion == item.emocion);
              if(_eColorItem) {
                const _color = _eColorItem.color;
                colors2.push(_color);
              }else {
                colors2.push(obtenerColor())
              }             
            }
            setDataChart2Colors(colors2)

            //chart feelins
            const arrayfeelings = result.data.map(d => capitalizeFirstLetter(d.feeling));
            const _data3 = contarEmociones(arrayfeelings);
            setDataChart3(_data3.map(d => d.conteo));
            setDataChart3Labels(_data3.map(d => d.emocion));
            let colors3 = [];
            for (const item of _data3) {
              const _sColorItem = sColors.find(i => i.sentiment == item.emocion);
              if(_sColorItem) {
                const _color = _sColorItem.color;
                colors3.push(_color);
              }else {
                colors3.push(obtenerColor());
              }
              
            }
            setDataChart3Colors(colors3)
        }
        
    });   
  }

  function contarEmociones(emociones) {
    // Contar cada emoción usando reduce y guardar en un objeto
    const conteoEmociones = emociones.reduce((conteo, emocion) => {
      conteo[emocion] = (conteo[emocion] || 0) + 1;
      return conteo;
    }, {});

    // Convertir el objeto en un array de objetos
    const resultadoArray = Object.keys(conteoEmociones).map(emocion => {
      return { emocion: emocion, conteo: conteoEmociones[emocion] };
    });
    
    return resultadoArray;
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
                <h2 style={{color: '#000', marginBottom: '0px'}}>Resumen de la llamada</h2>
            </ModalHeader>
            <ModalBody>
                <FormGroup>
                    <label>Resumen</label>
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
                    <Col>
                        <hr></hr>
                    </Col>
                  </Row>

                  <Row>
                    <Col style={{marginTop: '20px'}} md="4" sm= "12" >                      
                      <Doughnut
                        width="30%"
                        data={data}
                        options={options}
                      />
                    </Col>

                    <Col style={{marginTop: '20px'}} md="4" sm= "12">
                      <Pie
                        data={data2}
                        options={options2}
                      />
                    </Col>
                    
                    <Col style={{marginTop: '20px'}} md="4" sm= "12">
                      <Pie
                        data={data3}
                        options={options3}
                      />
                    </Col>

                    <Col>
                        <hr></hr>
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
                                            <td> {call.satisfaction}%</td>
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
