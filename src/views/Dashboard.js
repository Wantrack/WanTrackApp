import React, { useEffect, useState } from 'react';
import { axios } from '../config/https';
import constants from '../util/constans';
import { decode } from "../util/base64";
// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";
import HistoryTrans from './HistoryTrans';

// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Table,
  Row,
  Col
} from "reactstrap";

// core components
import {
  chartExample2,
  chartExampleD,
  chartExampleR,
  chartExampleF,
  chartExample3,
} from "variables/charts.js";

function Dashboard(props) {
  const [dataChartSent, setDataChartSent] = useState(chartExample2.data);
  const [dataChartDelivered, setDataChartDelivered] = useState(chartExampleD.data);
  const [dataChartRead, setDataChartRead] = useState(chartExampleR.data);
  const [dataChartFailed, setDataChartFailed] = useState(chartExampleF.data);
  const [messageSent, setMessageSent] = useState(0);
  const [messageDelivered, setMessageDelivered] = useState(0);
  const [messageRead, setMessageRead] = useState(0);
  const [messageFailed, setMessageFailed] = useState(0);
  const [dataChartReceive, setDataChartReceive] = useState(chartExample3.data);
  const [messageReceive, setMessageReceive] = useState(0);

  useEffect(() => {
    let idCompany = undefined;
    const _userinfoEncoded = localStorage.getItem(constants.userinfo);
    if(_userinfoEncoded) {
    const _userinfo = JSON.parse(decode(_userinfoEncoded));
      if(_userinfo.idCompany) {
        idCompany =_userinfo.idCompany
      }
    }

    axios.get(`${constants.apiurl}/api/MessageSendChart${idCompany ? `?idcompany=${idCompany}` : ''}`).then(result => {  
      if(result.data && result.data.data && result.data.data.length > 0) {
        chartExample2.data.labels = result.data.labels;
        chartExample2.data.datasets = []
        chartExample2.data.datasets.push({
          label: "Mensajes enviados",
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
          data: result.data.data,
        });
        setDataChartSent(chartExample2.data);
        setMessageSent(result.data.data.slice(-1) || 0);
      }      
    });

    axios.get(`${constants.apiurl}/api/MessageDeliveredChart${idCompany ? `?idcompany=${idCompany}` : ''}`).then(result => {  
      if(result.data && result.data.data && result.data.data.length > 0) {
        chartExampleD.data.labels = result.data.labels;
        chartExampleD.data.datasets = []
        chartExampleD.data.datasets.push({
          label: "Mensajes Entregados",
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
          data: result.data.data,
        });
        setDataChartDelivered(chartExampleD.data);
        setMessageDelivered(result.data.data.slice(-1) || 0);
      }      
    });

    axios.get(`${constants.apiurl}/api/MessageReadChart${idCompany ? `?idcompany=${idCompany}` : ''}`).then(result => {  
      if(result.data && result.data.data && result.data.data.length > 0) {
        chartExampleR.data.labels = result.data.labels;
        chartExampleR.data.datasets = []
        chartExampleR.data.datasets.push({
          label: "Mensajes Leidos",
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
          data: result.data.data,
        });
        setDataChartRead(chartExampleR.data);
        setMessageRead(result.data.data.slice(-1) || 0);
      }      
    });

    axios.get(`${constants.apiurl}/api/MessageFailedChart${idCompany ? `?idcompany=${idCompany}` : ''}`).then(result => {  
      if(result.data && result.data.data && result.data.data.length > 0) {
        chartExampleF.data.labels = result.data.labels;
        chartExampleF.data.datasets = []
        chartExampleF.data.datasets.push({
          label: "Mensajes fallidos",
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
          data: result.data.data,
        });
        setDataChartFailed(chartExampleF.data);
        setMessageFailed(result.data.data.slice(-1) || 0);
      }      
    });

    axios.get(`${constants.apiurl}/api/MessageReceiveChart${idCompany ? `?idcompany=${idCompany}` : ''}`).then(result => {
      if(result.data && result.data.data && result.data.data.length > 0) {
        chartExample3.data.labels = result.data.labels;
        chartExample3.data.datasets = [];
        chartExample3.data.datasets.push( {
          label: "Mensajes recibidos",
          fill: true,
          borderColor: "#d048b6",
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          data: result.data.data,
        });
        setDataChartReceive(chartExample3.data);
        setMessageReceive(result.data.data.slice(-1) || 0);
      }      
    });
  }, []);

  return (
    <>
      <div className="content">
        <Row>
          <Col lg="6">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Mensajes enviados</h5>
                <CardTitle tag="h3">
                  <i className="tim-icons icon-send text-info" /> { messageSent }
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="chart-area">
                  <Line
                    data={dataChartSent}
                    options={chartExample2.options}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="6">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Mensajes iniciados por el cliente</h5>
                <CardTitle tag="h3">
                  <i className="tim-icons icon-mobile text-primary" />{" "}
                 { messageReceive }
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="chart-area">
                  <Bar
                    data={dataChartReceive}
                    options={chartExample3.options}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg="4">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Mensajes entregados</h5>
                <CardTitle tag="h3">
                  <i className="tim-icons icon-send text-info" /> { messageDelivered }
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="chart-area">
                  <Line
                    data={dataChartDelivered}
                    options={chartExampleD.options}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg="4">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Mensajes leidos</h5>
                <CardTitle tag="h3">
                  <i className="tim-icons icon-send text-info" /> { messageRead }
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="chart-area">
                  <Line
                    data={dataChartRead}
                    options={chartExample2.options}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg="4">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Mensajes fallidos</h5>
                <CardTitle tag="h3">
                  <i className="tim-icons icon-send text-info" /> { messageFailed }
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="chart-area">
                  <Line
                    data={dataChartFailed}
                    options={chartExample2.options}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          {/* <Col lg="4">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Completed Tasks</h5>
                <CardTitle tag="h3">
                  <i className="tim-icons icon-send text-success" /> 12,100K
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="chart-area">
                  <Line
                    data={chartExample4.data}
                    options={chartExample4.options}
                  />
                </div>
              </CardBody>
            </Card> 
          </Col>*/}
        </Row>
        <Row>
          <Col lg="12" md="12">
            <HistoryTrans></HistoryTrans>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Dashboard;
