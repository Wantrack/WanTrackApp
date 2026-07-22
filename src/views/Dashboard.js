import React, { useEffect, useState } from 'react';
import { axios } from '../config/https';
import constants from '../util/constans';
import { decode } from "../util/base64";
// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";
import HistoryTrans from './HistoryTrans';
import TablePagination, { useClientPagination } from '../components/Pagination/TablePagination';

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
  pluginShadow
} from "variables/charts.js";

const buildChartData = (labels, data, label, borderColor = "#1f8ef1") => ({
  labels,
  datasets: [
    {
      label,
      fill: true,
      borderColor,
      borderWidth: 2,
      borderDash: [],
      borderDashOffset: 0.0,
      pointBackgroundColor: borderColor,
      pointBorderColor: "rgba(255,255,255,0)",
      pointHoverBackgroundColor: borderColor,
      pointBorderWidth: 20,
      pointHoverRadius: 4,
      pointHoverBorderWidth: 15,
      pointRadius: 4,
      data,
    },
  ],
});

const getLastValue = (data) => Array.isArray(data) && data.length > 0 ? data[data.length - 1] : 0;

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
  const [completeReportScatterlist, setCompleteReportScatterlist] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const campaignsPagination = useClientPagination(completeReportScatterlist);

    useEffect(() => {
      let idCompany = undefined;
      const _userinfoEncoded = localStorage.getItem(constants.userinfo);
      if(_userinfoEncoded) {
      const _userinfo = JSON.parse(decode(_userinfoEncoded));
      if(_userinfo.idCompany) {
        idCompany =_userinfo.idCompany
      }

    //   try {
    //     const _modules = _userinfo.modules.replaceAll(' ', '').split(',');          
    //     if(_modules.find(f => f == '1')) {
    //     } else if(_modules.find(f => f == '11')) {
    //       navigate('/admin/dashboardconversations');
    //     } else if(_modules.length == 1 && _modules[0] == '21') {
    //       navigate('/admin/documentsCheck');
    //     } else {}
    //   } catch (error) {}
      }

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    const createdDateParams = {
      startCreatedDate: formatDate(startDate),
      endCreatedDate: formatDate(endDate),
    };
    const buildDashboardUrl = (endpoint, includeCompany = true) => {
      const params = new URLSearchParams(createdDateParams);
      if(idCompany && includeCompany) {
        params.append('idcompany', idCompany);
      }
      return `${constants.apiurl}/api/${endpoint}?${params.toString()}`;
    };

    axios.get(buildDashboardUrl('MessageSendChart')).then(result => {  
      if(result.data && result.data.data && result.data.data.length > 0) {
        setDataChartSent(buildChartData(result.data.labels, result.data.data, "Mensajes enviados"));
        setMessageSent(getLastValue(result.data.data));
      }      
    });

    axios.get(buildDashboardUrl('MessageDeliveredChart')).then(result => {  
      if(result.data && result.data.data && result.data.data.length > 0) {
        setDataChartDelivered(buildChartData(result.data.labels, result.data.data, "Mensajes Entregados"));
        setMessageDelivered(getLastValue(result.data.data));
      }      
    });

    axios.get(buildDashboardUrl('MessageReadChart')).then(result => {  
      if(result.data && result.data.data && result.data.data.length > 0) {
        setDataChartRead(buildChartData(result.data.labels, result.data.data, "Mensajes Leidos"));
        setMessageRead(getLastValue(result.data.data));
      }      
    });

    axios.get(buildDashboardUrl('MessageFailedChart')).then(result => {  
      if(result.data && result.data.data && result.data.data.length > 0) {
        setDataChartFailed(buildChartData(result.data.labels, result.data.data, "Mensajes fallidos"));
        setMessageFailed(getLastValue(result.data.data));
      }      
    });

    axios.get(buildDashboardUrl('MessageReceiveChart')).then(result => {
      if(result.data && result.data.data && result.data.data.length > 0) {
        setDataChartReceive(buildChartData(result.data.labels, result.data.data, "Mensajes recibidos", "#d048b6"));
        setMessageReceive(getLastValue(result.data.data));
      }      
    });

    
    axios.get(buildDashboardUrl('CompleteReportByCampaing', false)).then(result => {
      if(result.data && result.data.length > 0) {
        setCompleteReportScatterlist(result.data)
      }      
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowHistory(true), 350);
    return () => clearTimeout(timer);
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
                    plugins={[pluginShadow]}
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
                    plugins={[pluginShadow]}
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
                    plugins={[pluginShadow]}
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
                    plugins={[pluginShadow]}
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
                    plugins={[pluginShadow]}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="12">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Campañas</h5>
              </CardHeader>
              <CardBody>     
                <div className="table-responsive" style={{maxHeight:'300px', overflowY: 'auto'}}>
                  <Table>
                    <thead style={{top:0, position: 'sticky', zIndex: '10000', backgroundColor: '#27293d'}}>
                        <tr>
                        <th>#</th>
                        <th>Campaña</th>
                        <th>Entregados</th>
                        <th>Leidos</th>
                        <th>Fallidos</th>
                        <th className="text-center">Fecha</th>
                        </tr>
                    </thead>  
                    <tbody>
                   
                        {campaignsPagination.paginatedItems.map((crsl, index) => 
                        <tr key={index}>
                            <td>{campaignsPagination.startIndex + index + 1}</td>
                            <td>{crsl.name}</td>
                            <td>{crsl.delivered}</td>
                            <td>{crsl.read}</td>
                            <td>{crsl.failed}</td>
                            <td className="text-center">{crsl.creationdate}</td>
                        </tr>
                        )}   
                             
                    </tbody>         
                  </Table>
                </div>
                <TablePagination {...campaignsPagination} />
                
              </CardBody>
            </Card> 
          </Col>
        </Row>
        <Row>
          <Col lg="12" md="12">
            {showHistory ? <HistoryTrans /> : null}
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Dashboard;
