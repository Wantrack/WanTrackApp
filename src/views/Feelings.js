import React, { useEffect, useState } from 'react';
import { axios } from '../config/https';
import constants from '../util/constans';
// react plugin used to create charts
import { Doughnut } from "react-chartjs-2";
import moment from 'moment';

// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  FormGroup,
  Form,
  Input,
  Button
} from "reactstrap";


function Feelings(props) {
  const [url, setUrl] = useState('');
  const [sentences, setSentences] = useState([]);
  const [dataChart, setDataChart] = useState([1, 1]);
  const data = {
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

  const options = {
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    },
    responsive: true
  }

  const onHandleChange = (e) => {
    const { name, value } = e.target;
    setUrl(value);
  }

  useEffect(() => {
   
  }, []);

  function start() {
    setSentences([])
    axios.post(`${constants.apiurl}/api/feelings`, {url}).then(result => {
        setSentences(result.data);
        let negative = result.data.filter(f => f.sentiment < 0).map(m => parseFloat( m.sentiment));
        let positve = result.data.filter(f => f.sentiment >= 0).map(m => parseFloat( m.sentiment))
        const avgnegative = negative.reduce((a, b) => a + b, 0) / negative.length;
        const avgpositive = positve.reduce((a, b) => a + b, 0) / positve.length;
        setDataChart([avgnegative* -1,avgpositive]);
        axios.post(`${constants.apiurl}/api/getSpecificFeeling`, {json: result.data}).then(result2 => {
            const jsonresult = JSON.parse(result2.data)
            const firstArray = result.data
            for (const item of firstArray) {
                item.emotion = jsonresult.find(f => f.startTime == item.startTime).emotion
            }
            setSentences(firstArray);
        })
    });
  }

  return (
    <>
      <div className="content">
        <Row>
          <Col lg="6">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Sentimientos</h5>
                <CardTitle tag="h3">
                  {/* <i className="tim-icons icon-send text-info" /> */}
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div>
                  <Doughnut
                    data={data}
                    options={options}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="6">
           <div>
                <FormGroup>
                    <label>Datos de entrenamiento</label>
                    <Input placeholder="Url aqui" type="text" name='url' defaultValue={url}  onChange={onHandleChange}/>
                </FormGroup>
           </div>
           <div>
                <Button className="btn-fill" color="primary" type="submit" onClick={start}>
                  Iniciar
                </Button>
           </div>
           <div>
           {
            sentences?.map((sentence, index) =>
                <div key={index}>
                    <label>{sentence.startTime}</label>
                    <div>
                        <strong>{sentence.speaker}</strong>: {sentence.text}
                        <br></br>
                        <strong>{sentence.emotion}</strong>
                    </div>
                </div>
            )}            
           </div>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Feelings;
