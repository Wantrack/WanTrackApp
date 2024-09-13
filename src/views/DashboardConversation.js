import { Doughnut, Pie, Radar } from "react-chartjs-2";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { decode } from "util/base64";
import { Row, Col, Card, CardBody, CardTitle, CardHeader } from "reactstrap";

import { axios } from "../config/https";
import constants from "../util/constans";
import { obtenerColor } from "util/colors";
import { sColors } from "util/sentimentColors";
import { eColors } from "util/emotionColors";

import { clockformat } from 'util/time';

function DashboardConversation(props) {
  const navigate = useNavigate();
  const [dataChart, setDataChart] = useState([50, 50]);
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
    "Comunicación precisa",
    "Ofertas relevantes",
    "Eficiencia",
  ]);
  const [dataChart4, setDataChart4] = useState([0, 0, 0, 0, 0, 0]);
  const [dataChart4Colorss, setDataChart4Colors] = useState(["#29344099"]);
  const [callduration, setCallDuration] = useState(0);
  const [npstotal, setNpsTotal] = useState(0);
  const [chatstotal, setChatTotal] = useState(0);

  const data = {
    labels: ["Negativo", "Positivo"],
    datasets: [
      {
        data: dataChart,
        backgroundColor: ["#ff6961", "#77dd77"],
        circumference: 180,
        rotation: 270,
        borderColor: "#D1D6DC",
      },
    ],
  };

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
        borderColor: "#D1D6DC",
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    aspectRatio: 1,
    plugins: {
      title: {
        display: false,
        text: "Porcentaje de Satisfaccion",
        color: "#fff",
        align: "center",
        padding: {
          top: 10,
        },
      },
      legend: {
        display: true,
        labels: {
          font: {
            size: 24,
          },
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (yDatapoint) => {
            return yDatapoint.raw.toFixed(2) + " %";
          },
        },
      },
    },
    responsive: true,
  };

  const options2 = {
    maintainAspectRatio: false,
    aspectRatio: 1,
    plugins: {
      title: {
        display: false,
        text: "Emocion principal",
        align: "center",
        color: "#fff",
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
          color: "#000",
        },
        grid: {
          color: "#000",
        },
        pointLabels: {
          // https://www.chartjs.org/docs/latest/axes/radial/#point-labels
          color: "white",
        },
        beginAtZero: true,
        backdropColor: "transparent",
        min: 1, // Set minimum tick value to 1
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
            //calculate percent
            const positive = parseInt(result.data.total);
            const negative = 100 - positive;
            setDataChart([negative, positive]);
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
            setNpsTotal(result.data.total);
          });

        axios
          .get(`${constants.apiurl}/api/call/report/chatsByCompany/${idCompany}`)
          .then((result) => {           
            setChatTotal(result.data.total);
          });

      }
    }
    load();
  }, []);

  return (
    <div className="content">
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
              <h2 style={{textAlign: 'right'}}>{chatstotal}</h2>
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
        <Col style={{ marginTop: "20px" }} md="6" sm="12">
          <Card className="card-chart">
            <CardHeader>
              <h5 className="card-category">Porcentaje de satisfacción</h5>
            </CardHeader>
            <CardBody>
              <Doughnut
                width="30%"
                height="300px"
                data={data}
                options={options}
              />
            </CardBody>
          </Card>
        </Col>

        <Col style={{ marginTop: "20px" }} md="6" sm="12">
          <Card className="card-chart">
            <CardHeader>
              <h5 className="card-category">Emoción Principal</h5>
            </CardHeader>
            <CardBody>
              <Pie
                width="100%"
                height="300px"
                data={data2}
                options={options2}
              />
            </CardBody>
          </Card>
        </Col>

        <Col style={{ marginTop: "20px" }} md="6" sm="12">
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

        <Col style={{ marginTop: "20px" }} md="6" sm="12">
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

        <Col md="12">
          <hr></hr>
        </Col>
      </Row>
    </div>
  );
}

export default DashboardConversation;
