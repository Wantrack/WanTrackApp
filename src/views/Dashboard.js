import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";

// reactstrap components
import {
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  Label,
  FormGroup,
  Input,
  Table,
  Row,
  Col,
  UncontrolledTooltip,
} from "reactstrap";

// core components
import {
  chartExample1,
  chartExample2,
  chartExample3,
  chartExample4,
} from "variables/charts.js";

function Dashboard(props) {
  const [setbigChartData] = React.useState("data1");
  const setBgChartData = (name) => {
    setbigChartData(name);
  };
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
                    <tr>
                      <td>1</td>
                      <td>+573007002550</td>
                      <td>promo_mayo_1</td>                      
                      <td className="text-center">14/05/2024 03:04:23</td>
                    </tr>
                    <tr>
                  <td>1</td>
                  <td>+573280202077</td>
                  <td>	promo_mayo_1</td>
                  <td className="text-center">09/05/2024 23:41:05</td>
              </tr>
              <tr>
                  <td>2</td>
                  <td>+573501964079</td>
                  <td>	promo_mayo_1</td>
                  <td className="text-center">07/05/2024 21:30:54</td>
              </tr>
              <tr>
                  <td>3</td>
                  <td>+573230010407</td>
                  <td>	promo_mayo_1</td>
                  <td className="text-center">02/05/2024 18:31:33</td>
              </tr>
              <tr>
                  <td>4</td>
                  <td>+573745943741</td>
                  <td>	promo_mayo_1</td>
                  <td className="text-center">11/05/2024 04:45:33</td>
              </tr>
              <tr>
                  <td>5</td>
                  <td>+573994698002</td>
                  <td>	promo_mayo_1</td>
                  <td className="text-center">04/05/2024 23:34:34</td>
              </tr>
              <tr>
                  <td>95</td>
                  <td>+573542926219</td>
                  <td>	promo_mayo_1</td>
                  <td className="text-center">04/05/2024 18:44:51</td>
              </tr>
              <tr>
                  <td>96</td>
                  <td>+573386071847</td>
                  <td>	promo_mayo_1</td>
                  <td className="text-center">11/05/2024 04:40:26</td>
              </tr>
              <tr>
                  <td>97</td>
                  <td>+573738890235</td>
                  <td>	promo_mayo_1</td>
                  <td className="text-center">13/05/2024 15:00:00</td>
              </tr>
              <tr>
                  <td>98</td>
                  <td>+573246731412</td>
                  <td>	promo_mayo_1</td>
                  <td className="text-center">04/05/2024 08:22:54</td>
              </tr>
              <tr>
                  <td>99</td>
                  <td>+573785924130</td>
                  <td>	promo_mayo_1</td>
                  <td className="text-center">06/05/2024 07:54:16</td>
              </tr>

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
