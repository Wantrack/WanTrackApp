import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Doughnut, Pie, Radar } from "react-chartjs-2";
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
import { clockformat } from 'util/time';

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
  const [textModalAdvice, settextModalAdvice] = useState('');
  const [showAdvice, setShowAdvice] = useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalChartVisible, setModalChartVisible] = React.useState(false);
  const [dataChart, setDataChart] = useState([50,50]);
  const [dataChart2, setDataChart2] = useState([]);
  const [dataChart2Labels, setDataChart2Labels] = useState([]);
  const [dataChart2Colorss, setDataChart2Colors] = useState([]);
  const [dataChart3, setDataChart3] = useState([]);
  const [dataChart3Labels, setDataChart3Labels] = useState([]);
  const [dataChart3Colorss, setDataChart3Colors] = useState([]);
  const [dataChart4Labels, setDataChart4Labels] = useState(['Saludo', 'Escucha', 'Comunicación clara', 'Comunicación precisa', 'Ofertas relevantes', 'Eficiencia' ]);
  const [dataChart4, setDataChart4] = useState([0,0,0,0,0,0]);
  const [dataChart4Colorss, setDataChart4Colors] = useState(['#29344099']);
  const [callduration, setCallDuration] = useState(0);
  const [npstotal, setNpsTotal] = useState(0);

  const data = {
    labels: ['Negativo', 'Positivo'],
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

  const data4 = {
    labels: dataChart4Labels,
    datasets: [
      {        
        data: dataChart4,
        backgroundColor: dataChart4Colorss,
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

  const options4 = {
    maintainAspectRatio: false,
    aspectRatio: 1,
    scales: {
      r: {
        angleLines: {
          color: '#000'
        },
        grid: {
          color: '#000'
        },
        pointLabels: { // https://www.chartjs.org/docs/latest/axes/radial/#point-labels
          color: 'white'
        },
        beginAtZero: true,
        backdropColor: "transparent",
        min: 1, // Set minimum tick value to 1
        max: 5, // Set maximum tick value to 5
        ticks: {
          stepSize: 1, // Ensures that ticks are displayed at intervals of 1          
        }
      },
    },
    plugins: {
      title: {
        display: true,
        color:'#fff',
        text: "Areas de oportunidad",
        align: "center",
        padding: {
          top: 10,
        },
        font: {                
          size: 13
        }
      },
      legend: {
        display: false,       
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

  useEffect(() => { 
   async function load() {
    const currentAdvisorID = localStorage.getItem('currentAdvisorID');
    const _companies = await axios.get(`${constants.apiurl}/api/companies`);
    setCompanies([{idcompany: -1, name: 'Sin Empresa'}, ..._companies.data]);
    const _user =  await axios.get(`${constants.apiurl}/api/adviser/${currentAdvisorID}`);
    if(_user.data && _user.data != '') {
      setAdvisor(_user.data);
      loadCalls(currentAdvisorID);      
    }else {
      setAdvisor({
        ...advisor,
        companyId: _companies.data[0].idcompany 
      });
    }
   }
   load();   
  }, []);

  const loadCalls = (currentAdvisorID) => {
    if(currentAdvisorID && currentAdvisorID != 0) {
      axios.get(`${constants.apiurl}/api/callByAdviser/${currentAdvisorID}`).then(result => {
        setCalls(result.data);        
    });    

    axios.get(`${constants.apiurl}/api/call/report/satisfactionByAdvise/${currentAdvisorID}`).then(result => {
        //calculate percent
        const positive = parseInt(result.data.total);
        const negative = 100 - positive;
        setDataChart([negative, positive]);
    });

    axios.get(`${constants.apiurl}/api/call/report/emotionByAdviser/${currentAdvisorID}`).then(result => {
      //chart main emotion
      const arrayemotions = result.data;     
      setDataChart2(arrayemotions.map(d => d.total));
      setDataChart2Labels(arrayemotions.map(d => d.mainEmotion));
      let colors2 = [];
      for (const item of arrayemotions) {
        const _eColorItem = eColors.find(i => i.emotion == item.mainEmotion);
        if(_eColorItem) {
          const _color = _eColorItem.color;
          colors2.push(_color);
        }else {
          colors2.push(obtenerColor())
        }             
      }
      setDataChart2Colors(colors2)
    });

    axios.get(`${constants.apiurl}/api/call/report/fellingByAdviser/${currentAdvisorID}`).then(result => {      
      //chart feelings
      const arrayfeelings = result.data;
      setDataChart3(arrayfeelings.map(d => d.total));
      setDataChart3Labels(arrayfeelings.map(d => d.feeling));
      let colors3 = [];
      for (const item of arrayfeelings) {
        const _sColorItem = sColors.find(i => i.sentiment == item.feeling);
        if(_sColorItem) {
          const _color = _sColorItem.color;
          colors3.push(_color);
        }else {
          colors3.push(obtenerColor());
        }
        
      }
      setDataChart3Colors(colors3)
    });

    axios.get(`${constants.apiurl}/api/call/report/callByAviser/${currentAdvisorID}`).then(result => {
      const arrayfeelings = result.data;
      const data = [
        arrayfeelings.professionalgreetings,
        arrayfeelings.activelistening,
        arrayfeelings.clearcommunication,
        arrayfeelings.accuratecommunication,
        arrayfeelings.relevantoffers,
        arrayfeelings.efficenthandling,
      ];
      setDataChart4(data);
    });

    axios
      .get(`${constants.apiurl}/api/call/report/durationByAdviser/${currentAdvisorID}`)
      .then((result) => {           
        setCallDuration(result.data.total);
      });

    axios
      .get(`${constants.apiurl}/api/call/report/scorenpsByAdviser/${currentAdvisorID}`)
      .then((result) => {       
        setNpsTotal(result.data.total);
      });
    }    
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

  const toggleModalCharts = () => {    
    setModalChartVisible(!modalChartVisible);
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

        <Modal modalClassName='modal-charts' isOpen={modalChartVisible} toggle={toggleModalCharts} fullscreen>
            <ModalHeader>
                <h2 style={{color: '#000', marginBottom: '0px'}}>Insights - {advisor.name}</h2>               
            </ModalHeader>
            <ModalBody>
                    <Row>
                      <Col md="4" sm="12">
                        <Card>
                          <CardHeader>
                            <h5 className="card-category">Minutos Analizados</h5>
                          </CardHeader>
                          <CardBody>
                            <h2 style={{textAlign: 'right'}}>{clockformat(callduration || 0)}</h2>
                          </CardBody>
                        </Card>
                      </Col>
                      <Col md="4" sm="12">
                        <Card>
                          <CardHeader>
                            <h5 className="card-category">Chats Analizados</h5>
                          </CardHeader>
                          <CardBody>
                            <h2 style={{textAlign: 'right'}}>0</h2>
                          </CardBody>
                        </Card>
                      </Col>
                      <Col md="4" sm="12">
                        <Card>
                          <CardHeader>
                            <h5 className="card-category">NPS Total</h5>
                          </CardHeader>
                          <CardBody>
                            <h2 style={{textAlign: 'right'}}>{npstotal}</h2>
                          </CardBody>
                        </Card>
                      </Col>
                  </Row>
                  <Row>
                    <Col style={{marginTop: '20px'}} md="6" sm= "12" >                      
                      <Doughnut
                        width="30%"
                        height='250px'
                        data={data}
                        options={options}
                      />
                    </Col>

                    <Col style={{marginTop: '20px'}} md="6" sm= "12">
                      <Pie
                        width="100%"
                        height='300px'
                        data={data2}
                        options={options2}
                      />
                    </Col>
                    
                    <Col style={{marginTop: '20px'}} md="6" sm= "12">
                      <Pie
                       width="100%"
                        height='300px'
                        data={data3}
                        options={options3}
                      />
                    </Col>

                    <Col style={{marginTop: '20px'}} md="6" sm= "12">
                      <Radar
                       width="100%"
                        height='300px'
                        data={data4}
                        options={options4}
                      />
                    </Col>                    

                    <Col md="12">
                        <hr></hr>
                    </Col>
                  </Row>
                <Button onClick={toggleModalCharts} style={{marginTop: '20px'}} className="btn btn-primary">
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

                    <Col md="2" style={{display: 'flex', justifyContent: 'start', alignItems: 'center'}}>
                      <Button className="btn-fill" color="primary" onClick={toggleModalCharts}>
                        <i className="fa-solid fa-chart-simple"></i>
                      </Button>
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
                    <Col md="12">
                      <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr> 
                                        <th>Porcentaje de satisfaccion</th>     
                                        <th>Emocion principal</th>
                                        <th>Sentimiento predominante</th>
                                        <th title='Net Promoter Score calculado con base a la conversación'>NPS</th>
                                        <th style={{textAlign:'center'}}>Transcripcion</th>
                                        <th style={{textAlign:'center'}}>Resumen</th>
                                        <th>Audio</th>
                                        <th>Tiempo</th>
                                        <th>Fecha</th>
                                        <th style={{textAlign: 'center'}}>Saludo</th>
                                        <th style={{textAlign: 'center'}}>Escucha</th>
                                        <th style={{textAlign: 'center'}}>Comunicación clara</th>
                                        <th style={{textAlign: 'center'}}>Comunicación precisa</th>
                                        <th style={{textAlign: 'center'}}>Ofertas relevantes</th>
                                        <th style={{textAlign: 'center'}}>Eficiencia</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {calls.map((call, index) => 
                                        <tr key={index}>
                                            <td> {call.satisfaction}%</td>
                                            <td className='m_title'> {call.mainEmotion || '-'} </td>
                                            <td className='m_title'> {call.feeling || '-'} </td>
                                            <td className='m_title'> {call.scorenps || '-'} </td>
                                            <td style={{textAlign:'center'}}> 
                                                <Link title='Ver transcripcion' to="javascript:void(0)" onClick={() => toggleModal(call.transcription)}> 
                                                    <i style={{fontSize: '20px'}} className="fa-solid fa-headset"></i>
                                                </Link>
                                            </td>
                                            <td style={{textAlign:'center'}}> <Link title='Ver transcripcion' to="javascript:void(0)" onClick={() => toggleModal(call.summary, call.advice)}> <i style={{fontSize: '20px'}} className="fa-solid fa-clipboard-list"></i></Link></td>
                                            <td> 
                                                <Link title='Escuchar audio' to={call.audiourl} target='_blank'> 
                                                    <i style={{fontSize: '20px'}} className="fa-solid fa-circle-play"></i>
                                                </Link>
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
