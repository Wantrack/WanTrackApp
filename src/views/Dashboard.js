import React, { useEffect, useState } from 'react';
import { axios } from '../config/https';
import constants from '../util/constans';
// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";
import moment from 'moment';

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
  chartExample3,
} from "variables/charts.js";

function Dashboard(props) {
  const [messagesSent, setMessagesSent] = useState([]);

  useEffect(() => {
    axios.get(`${constants.apiurl}/api/messagesent`).then(result => {
        setMessagesSent(result.data);
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
                  <i className="tim-icons icon-send text-info" /> 550
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="chart-area">
                  <Line
                    data={chartExample2.data}
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
                 120
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="chart-area">
                  <Bar
                    data={chartExample3.data}
                    options={chartExample3.options}
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
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Historico de transacciones</CardTitle>
              </CardHeader>
              <CardBody>
                <Table className="tablesorter" responsive>
                  <thead className="text-primary">
                    <tr>
                      <th>#</th>
                      <th>Telefono</th>
                      <th>Plantilla</th>                      
                      <th className="text-center">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messagesSent.map((messageSent, index) => 
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{messageSent.phone}</td>
                        <td>{messageSent.name}</td>                      
                        <td className="text-center">{moment(messageSent.creationdate).format('DD-MM-YYYY hh:mm:ss')}</td>
                      </tr>
                    )}                   
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Dashboard;
