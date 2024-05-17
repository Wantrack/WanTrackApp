import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
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
} from "reactstrap";

import { axios } from '../config/https';
import constants from '../util/constans';

function WsTemplate() {
  const navigate = useNavigate ();
  const [wstemplate, setWsTemplate] = useState({});
  const [companies, setCompanies] = useState([]); 

  const onHandleChange = (e) => {
    const { name, value } = e.target;
    setWsTemplate(pre => ({
      ...pre,
      [name]: value 
    }));
  }

  const cmbCompanyOnChange = async (e) => { 
    onHandleChange(e);        
  }

  useEffect(() => { 
    async function load() {
        const _companies = await axios.get(`${constants.apiurl}/api/companies`);
        setCompanies([{idcompany: -1, name: 'Sin Empresa'}, ..._companies.data]);


        const currentWsTemplateID = localStorage.getItem('currentWsTemplateID');
        const _wstemplate =  await axios.get(`${constants.apiurl}/api/wstemplate/${currentWsTemplateID}`);
        if(_wstemplate.data) {
            setWsTemplate(_wstemplate.data);
        } 
    }

    load();
  }, []);

  function saveChanges() {
    console.log(wstemplate)
    axios.post(`${constants.apiurl}/api/wstemplate`, wstemplate).then(async (result) => {
        navigate('/admin/wstemplates');
    });
  }

  return (
    <>
      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <h5 className="title">Plantilla de Whatsapp</h5>
              </CardHeader>
              <CardBody>
                <Form>
                   <Row>
                        <Col className="pr-md-1" md="6">
                            <FormGroup>
                                <label>Nombre</label>
                                <Input placeholder="Nombre de la plantiall aqui" type="text" name='name' defaultValue={wstemplate.name} onChange={onHandleChange}/>
                            </FormGroup>
                        </Col>
                        <Col md="6">
                            <FormGroup>
                                <label>Empresa</label>
                                <select className="form-control" name="idCompany" value={wstemplate.idCompany} onChange={cmbCompanyOnChange}>
                                {
                                    companies?.map((company, index) => 
                                    <option key={index} value={company.idcompany}>{company.name}</option>
                                )} 
                                </select>
                            </FormGroup>
                        </Col>
                  </Row>

                  <Row>
                        <Col className="pr-md-1" md="12">
                            <FormGroup>
                                <label>Contenido</label>
                                <textarea className='form-control' rows="10" placeholder="Contenido aqui" type="text" name='text' defaultValue={wstemplate.text} onChange={onHandleChange}/>
                            </FormGroup>
                        </Col>
                  </Row>
                </Form>
              </CardBody>
              <CardFooter>
                <Button className="btn-fill" color="primary" type="submit" onClick={saveChanges}>
                  Guardar
                </Button>

                <Button className="btn-fill" color="primary" type="submit" onClick={saveChanges}>
                  Correr Prueba
                </Button>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default WsTemplate;
