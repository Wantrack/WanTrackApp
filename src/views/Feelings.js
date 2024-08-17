import React, { useEffect, useState } from 'react';
import { axios } from '../config/https';
import constants from '../util/constans';
// react plugin used to create charts
import { Doughnut } from "react-chartjs-2";

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
import Loader from 'components/Loader/Loader';


function Feelings(props) {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState({});
  const [sentences, setSentences] = useState([]);
  const [dataChart, setDataChart] = useState([50, 50]);
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [loaderText, setLoaderText] = useState('Cargando');
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

  const options = {
    plugins: {
      legend: {
        display: true,
        labels: {
            font: {
                size: 12
            }
        }
      },
      tooltip: {
        enabled: true
      }
    },
    responsive: true
  }

  const onHandleChange = (e) => {
    const { name, value } = e.target;
    setUrl(value);
  }

  const onHandleChangeFile = (e) => {
    setFile(e.target.files[0]);
  }

  useEffect(() => {
   
  }, []);

  function categorizeFeeling(score) {
    if (score >= 2) {
      return 'muy feliz';
    } else if (score > 0 && score < 2) {
      return 'feliz';
    } else if (score == 0) {
      return 'neutral';
    } else if (score < 0 && score > -2) {
      return 'triste';
    } else if (score <= -2) {
      return 'Rabioso';
    }
  }

  function start() {
    setLoaderVisible(true);
    let formData = new FormData();
    formData.append("file", file);
    axios.post(`${constants.apiurl}/api/aws/uploadauidoemotion/audioemotions/1`, formData, { headers: {"Content-Type": "multipart/form-data"}}).then(r => {
      const jsonresult = r.data;

      setSentences([]);
      setLoaderText('Transcribiendo audio\n\nEste proceso puede tomar 45 segundos a un minuto');
      axios.post(`${constants.apiurl}/api/feelings`, { url : jsonresult.url }).then(result => {
          setLoaderText('Audio transcrito');
          
          setLoaderText('Identificando emociones');

          axios.post(`${constants.apiurl}/api/getSpecificFeeling`, {json: JSON.stringify(result.data)}).then(result2 => {
              const jsonresult = JSON.parse(result2.data)
              const firstArray = result.data
              for (const item of firstArray) {
                  const obj = jsonresult.find(f => f.startTime == item.startTime);
                  if(obj) {
                      item.emotion = obj.emotion
                  }else {
                      item.emotion = categorizeFeeling(parseFloat(item.sentiment));
                  }
              }
              setSentences(firstArray);
              
              const negative = jsonresult.filter(f => f.feeling == 'Negativo');
              const positve = jsonresult.filter(f => f.feeling == 'Positivo');

              const avgnegative = negative.length;
              const avgpositive = positve.length;

              console.log(avgnegative)
              console.log(avgpositive)

              const negativereal = avgnegative < 0 ? avgnegative* -1 : avgnegative

              const totalavg = negativereal + avgpositive;

              const valuen = (negativereal *100) / totalavg;
              const valuep = (avgpositive * 100)/ totalavg;
              setDataChart([valuen,valuep]);
              setLoaderVisible(false)
          }).catch(e => {
            console.error(e)
            setLoaderVisible(false)
          });
      }).catch(e => {
        console.error(e)
        setLoaderVisible(false)
      });
      
    }).catch(e => {
      console.error(e)
      setLoaderVisible(false)
    });
  }

  return (
    <>
      <div className="content">
      
      <Loader active={loaderVisible} text={loaderText}/>
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
                <div>
                  <label>Audio de la llamada</label>
                  <Input placeholder="Sube tu audio" type="file" name='file' onChange={onHandleChangeFile}/>
                </div>

                <FormGroup className='hide'>
                    <label>Datos de entrenamiento</label>
                    <Input placeholder="Url aqui" type="text" name='url' defaultValue={url}  onChange={onHandleChange}/>
                </FormGroup>
           </div>
           <div>
                <Button className="btn-fill" color="primary" type="submit" onClick={start}>
                  Iniciar
                </Button>
           </div>
           <div style={{paddingTop: '10px'}}>
           {
            sentences?.map((sentence, index) =>
                <div key={index}>
                    <label>{sentence.startTime} - {sentence.endTime}</label>
                    <div>
                        <strong>{sentence.speaker}</strong>: {sentence.text}
                        <br></br>
                        <strong>Emocion generada: </strong>{sentence.emotion}
                    </div>
                    <hr></hr>
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
