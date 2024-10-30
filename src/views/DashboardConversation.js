import { Bar, Pie, Radar, Line } from "react-chartjs-2";
import React, { useState, useEffect } from "react";
import { decode } from "util/base64";
import { Row, Col, Card, CardBody, CardTitle, CardHeader, Table } from "reactstrap";

import { axios } from "../config/https";
import constants from "../util/constans";
import { obtenerColor, coloresAdvisers } from "util/colors";
import { sColors } from "util/sentimentColors";
import { eColors } from "util/emotionColors";

import { clockformat } from 'util/time';

import {
  chartExample2,
  chartExampleR,
  pluginShadow
} from "variables/charts.js";

function DashboardConversation(props) {
  const [satisfaction, setSatisfaction] = useState(0);
  const [satisfactionColor, setSatisfactionColor] = useState('#bc8034');
  const [dataChart2, setDataChart2] = useState([]);
  const [dataChart2Labels, setDataChart2Labels] = useState([]);
  const [dataChart2Colorss, setDataChart2Colors] = useState([]);
  const [dataChart3, setDataChart3] = useState([]);
  const [dataChart3Labels, setDataChart3Labels] = useState([]);
  const [dataChart3Colorss, setDataChart3Colors] = useState([]);
  const [dataChart4Labels, setDataChart4Labels] = useState([
    "Saludo",
    "Escucha",
    "Comunicación clara",
    "Información precisa",
    "Ofertas relevantes",
    "Eficiencia",
  ]);
  const [dataChart4, setDataChart4] = useState([0, 0, 0, 0, 0, 0]);
  const [dataChart4Colorss, setDataChart4Colors] = useState(["#2B69F5B3"]);
  const [dataChart5, setDataChart5] = useState([]);
  const [dataChart5Labels, setDataChart5Labels] = useState([]);
  const [callduration, setCallDuration] = useState(0);
  const [npstotal, setNpsTotal] = useState(0);
  const [chatstotal, setChatTotal] = useState(0);
  const [calltotal, setCallTotal] = useState(0);
  const [mostSentiment, setMostSentiment] = useState('-');
  const [mostSentimentColor, setMostSentimentColor] = useState('#FFFFFF');
  const [informationCompany, setInformationCompany] = useState([]);
  const [lastSatisfaction, setLastSatisfaction] = useState(0);
  const [dataChartRead, setDataChartRead] = useState(chartExampleR.data);

  const data2 = {
    labels: dataChart2Labels,
    datasets: [
      {
        data: dataChart2,
        backgroundColor: dataChart2Colorss,
        borderColor: "#D1D6DC",
      },
    ],
  };

  const data3 = {
    labels: dataChart3Labels,
    datasets: [
      {
        data: dataChart3,
        backgroundColor: dataChart3Colorss,
        borderColor: "#D1D6DC",
      },
    ],
  };

  const data4 = {
    labels: dataChart4Labels,
    datasets: [
      {
        data: dataChart4,
        backgroundColor: dataChart4Colorss,
        borderColor: "#2B69F5",
      },
    ],
  };

  const data5 = {
    labels: dataChart5Labels,
    datasets: [
      {
        data: dataChart5,
        backgroundColor: coloresAdvisers,
        borderColor: "#D1D6DC",
      },
    ],
  };

  const options2 = {
    maintainAspectRatio: false,
    aspectRatio: 1,
    scales: {
      x: {
          ticks: {
              color: '#FFFFFF',  // Cambia el color de las etiquetas del eje X
          }
      },
      y: {
          ticks: {
              color: '#FFFFFF',  // Cambia el color de las etiquetas del eje Y
          }
      }
    },
    plugins: {
      title: {
        display: false,
        text: "Emocion principal",
        align: "center",
        color: "#FFFFFF",
        padding: {
          top: 10,
        },
        font: {
          size: 13,
        },
      },
      legend: {
        display: false,
        labels: {
          color: "#FFFFFF",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (yDatapoint) => {
            return yDatapoint.raw;
          },
        },
      },
    },
    responsive: true,
  };

  const options3 = {
    maintainAspectRatio: false,
    aspectRatio: 1,
    plugins: {
      title: {
        display: false,
        color: "#fff",
        text: "Sentimiento predominante",
        align: "center",
        padding: {
          top: 10,
        },
        font: {
          size: 13,
        },
      },
      legend: {
        display: true,
        labels: {
          color: "#f5f5f5",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (yDatapoint) => {
            return yDatapoint.raw;
          },
        },
      },
    },
    responsive: true,
  };

  const options4 = {
    maintainAspectRatio: false,
    aspectRatio: 1,
    scales: {
      r: {
        angleLines: {
          color: "#FFF",
        },
        grid: {
          color: "#FFF",
        },
        pointLabels: {
          // https://www.chartjs.org/docs/latest/axes/radial/#point-labels
          font: {
            size: 12
          },
          color: "#F5F5F5",
        },
        beginAtZero: true,
        backdropColor: "#2B69F5",
        min: 0, // Set minimum tick value to 1
        max: 5, // Set maximum tick value to 5
        ticks: {
          stepSize: 1, // Ensures that ticks are displayed at intervals of 1
        },
      },
    },
    plugins: {
      title: {
        display: false,
        color: "#fff",
        text: "Areas de oportunidad",
        align: "center",
        padding: {
          top: 10,
        },
        font: {
          size: 13,
        },
      },
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (yDatapoint) => {
            return yDatapoint.raw;
          },
        },
      },
    },
    responsive: true,
  };

  useEffect(() => {
    async function load() {
      let idCompany = undefined;
      const _userinfoEncoded = localStorage.getItem(constants.userinfo);
      if (_userinfoEncoded) {
        const _userinfo = JSON.parse(decode(_userinfoEncoded));
        if (_userinfo.idCompany) {
          idCompany = _userinfo.idCompany;
        }
      }

      if (idCompany) {
        axios
          .get(
            `${constants.apiurl}/api/call/report/satisfactionByCompany/${idCompany}`
          )
          .then((result) => {
            if(result && result.data && result.data.total) {
              //calculate percent
              const positive = parseInt(result.data.total);
              //const negative = 100 - positive;
              setSatisfaction(positive);
              if(positive > 0 && positive < 45) {
                setSatisfactionColor('#f25757');
              } else if (positive > 45 && positive < 80) {
                setSatisfactionColor('#bc8034');
              } else {
                setSatisfactionColor('#47a025');
              }
            }           
          });

        axios
          .get(
            `${constants.apiurl}/api/call/report/emotionByCompany/${idCompany}`
          )
          .then((result) => {
            //chart main emotion
            const arrayemotions = result.data;
            setDataChart2(arrayemotions.map((d) => d.total));
            setDataChart2Labels(arrayemotions.map((d) => d.mainEmotion));
            let colors2 = [];
            for (const item of arrayemotions) {
              const _eColorItem = eColors.find(
                (i) => i.emotion == item.mainEmotion
              );
              if (_eColorItem) {
                const _color = _eColorItem.color;
                colors2.push(_color);
              } else {
                colors2.push(obtenerColor());
              }
            }
            if(arrayemotions && arrayemotions.length > 0) {
              const max = arrayemotions.reduce((prev, current) => (prev && prev.total > current.total) ? prev : current)
              setMostSentiment(max.mainEmotion);
              const index = arrayemotions.map(item => item.mainEmotion).indexOf(max.mainEmotion);
              setMostSentimentColor(colors2[index])
            }
            
            setDataChart2Colors(colors2);
          });

        axios
          .get(
            `${constants.apiurl}/api/call/report/fellingByCompany/${idCompany}`
          )
          .then((result) => {
            //chart feelings
            const arrayfeelings = result.data;
            setDataChart3(arrayfeelings.map((d) => d.total));
            setDataChart3Labels(arrayfeelings.map((d) => d.feeling));
            let colors3 = [];
            for (const item of arrayfeelings) {
              const _sColorItem = sColors.find(
                (i) => i.sentiment == item.feeling
              );
              if (_sColorItem) {
                const _color = _sColorItem.color;
                colors3.push(_color);
              } else {
                colors3.push(obtenerColor());
              }
            }
            setDataChart3Colors(colors3);
          });

        axios
          .get(`${constants.apiurl}/api/call/report/callByCompany/${idCompany}`)
          .then((result) => {
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
          .get(`${constants.apiurl}/api/call/report/durationByCompany/${idCompany}`)
          .then((result) => {           
            setCallDuration(result.data.total);
          });

        axios
          .get(`${constants.apiurl}/api/call/report/scorenpsByCompany/${idCompany}`)
          .then((result) => {    
            setNpsTotal(result.data.total || 0);
          });

        axios
          .get(`${constants.apiurl}/api/call/report/chatsByCompany/${idCompany}`)
          .then((result) => {
            setChatTotal(result.data.total);
          });

        axios
          .get(`${constants.apiurl}/api/call/report/callsByCompany/${idCompany}`)
          .then((result) => {
            setCallTotal(result.data.total);
          });

        axios
          .get(`${constants.apiurl}/api/call/report/informationCompanyByAdvise/${idCompany}`)
          .then((result) => {
            
            if(result.data && result.data.length > 0) {
              setInformationCompany(result.data);

              const labels = result.data.map(m => { return `${m.name} ${m.lastName}`});
              const data = result.data.map(m => { return m.avgscorenps });
              setDataChart5Labels(labels);
              setDataChart5(data);
              
            }
          });

        axios
          .get(`${constants.apiurl}/api/call/report/lastInformationCompany/${idCompany}/6`)
          .then((result) => {
            if(result.data && result.data.length > 0) {
              const labels = result.data.map(m => { return m.month});
              const data = result.data.map(m => { return m.avg_satisfaction });

              chartExampleR.data.labels = labels;
              chartExampleR.data.datasets = []
              chartExampleR.data.datasets.push({
                label: "Satisfaccion",
                fill: true,
                borderColor: "#1f8ef1",
                borderWidth: 2,
                borderDash: [],
                borderDashOffset: 0.0,
                pointBackgroundColor: "#1f8ef1",
                pointBorderColor: "rgba(255,255,255,0)",
                pointHoverBackgroundColor: "#1f8ef1",
                pointBorderWidth: 20,
                pointHoverRadius: 4,
                pointHoverBorderWidth: 15,
                pointRadius: 4,
                data: data,
              });
              setLastSatisfaction(data[data.length - 1])
              setDataChartRead(chartExampleR.data);
            }           
          });
      }
    }
    load();
  }, []);

  return (
    <div className="content">
      <Row>
        <Col md="2" sm="12">
          <Card>
            <CardHeader>
              <h5 className="card-category">Minutos Analizados</h5>
            </CardHeader>
            <CardBody>
              <h2 style={{textAlign: 'right'}}>{clockformat(callduration || 0)}</h2>
            </CardBody>
          </Card>
        </Col>
        <Col md="2" sm="12">
          <Card>
            <CardHeader>
              <h5 className="card-category title-card-dashboard">Llamadas Analizadas</h5>
            </CardHeader>
            <CardBody>
              <h2 style={{textAlign: 'right'}}>{calltotal}</h2>
            </CardBody>
          </Card>
        </Col>
        <Col md="2" sm="12">
          <Card>
            <CardHeader>
              <h5 className="card-category title-card-dashboard">Chats Analizados</h5>
            </CardHeader>
            <CardBody>
              <h2 style={{textAlign: 'right'}}>{chatstotal}</h2>
            </CardBody>
          </Card>
        </Col>       
        <Col md="2" sm="12">
          <Card>
            <CardHeader>
              <h5 className="card-category title-card-dashboard">Emoción Principal</h5>
            </CardHeader>
            <CardBody>
              <h2 style={{textAlign: 'right', color: mostSentimentColor}}>{mostSentiment}</h2>
            </CardBody>
          </Card>
        </Col>
        <Col md="2" sm="12">
          <Card>
            <CardHeader>
              <h5 className="card-category title-card-dashboard">NPS Total</h5>
            </CardHeader>
            <CardBody>
              <h2 style={{textAlign: 'right'}}>{npstotal}</h2>
            </CardBody>
          </Card>
        </Col>
        <Col md="2" sm="12">
          <Card>
            <CardHeader>
              <h5 className="card-category title-card-dashboard">Porcentaje de satisfacción</h5>
            </CardHeader>
            <CardBody>
              <h2 style={{textAlign: 'right', color: satisfactionColor}}>{satisfaction}%</h2>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col style={{ marginTop: "20px" }} md="4" sm="12">
          <Card className="card-chart">
            <CardHeader>
              <h5 className="card-category">Emoción Principal</h5>
            </CardHeader>
            <CardBody>
              <Bar
                width="100%"
                height="300px"
                data={data2}
                options={options2}
              />
            </CardBody>
          </Card>
        </Col>

        <Col style={{ marginTop: "20px" }} md="4" sm="12">
          <Card className="card-chart">
            <CardHeader>
              <h5 className="card-category">Sentimiento Predominante</h5>
            </CardHeader>
            <CardBody>
              <Pie
                width="100%"
                height="300px"
                data={data3}
                options={options3}
              />
            </CardBody>
          </Card>
        </Col>

        <Col style={{ marginTop: "20px" }} md="4" sm="12">
          <Card className="card-chart">
            <CardHeader>
              <h5 className="card-category">Areas de Oportunidad</h5>
            </CardHeader>
            <CardBody>
              <Radar
                width="100%"
                height="300px"
                data={data4}
                options={options4}
              />
            </CardBody>
          </Card>
        </Col>

        <Col lg="6">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">% Satisfacción por Agente</h5>
              </CardHeader>
              <CardBody>     
                <div className="table-responsive" style={{maxHeight:'300px', height:'300px', overflowY: 'auto'}}>
                  <Table>
                    <thead style={{top:0, position: 'sticky', zIndex: '10000', backgroundColor: '#27293d'}}>
                        <tr>
                        <th>#</th>
                        <th>Agente</th>
                        <th>% Satisfacción</th>
                        <th>NPS</th>
                        </tr>
                    </thead>  
                    <tbody>
                   
                        {informationCompany.map((info, index) => 
                        <tr key={index}>
                            <td>{(index + 1) }</td>
                            <td>{info.name} {info.lastName}</td>
                            <td>{info.avgsatisfaction} %</td>
                            <td>{info.avgscorenps}</td>                          
                        </tr>
                        )}   
                             
                    </tbody>         
                    </Table>
                </div>           
                
              </CardBody>
            </Card> 
          </Col>

          <Col md="6" sm="12">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">NPS por Agente</h5>
              </CardHeader>
              <CardBody>
                <Bar
                  width="100%"
                  height="300px"
                  data={data5}
                  options={options2}
                />
              </CardBody>
          </Card>
        </Col>

        <Col lg="12">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Satisfacción</h5>
                <CardTitle tag="h3">
                  <i className="tim-icons icon-send text-info" /> { lastSatisfaction }
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="chart-area">
                  <Line
                    data={dataChartRead}
                    options={chartExample2.options}
                    plugins={[pluginShadow]}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>

        <Col md="12">
          <hr></hr>
        </Col>
        
      </Row>
    </div>
  );
}

export default DashboardConversation;
