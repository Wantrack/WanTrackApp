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

function Advisor() {
  const navigate = useNavigate ();
  const [advisor, setAdvisor] = useState({});
  const [companies, setCompanies] = useState([]); 

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

  useEffect(() => { 
   async function load() {
    const currentAdvisorID = localStorage.getItem('currentAdvisorID');
    const _companies = await axios.get(`${constants.apiurl}/api/companies`);
    setCompanies([{idcompany: -1, name: 'Sin Empresa'}, ..._companies.data]);
    const _user =  await axios.get(`${constants.apiurl}/api/adviser/${currentAdvisorID}`);
    setAdvisor(_user.data);
   }
   load();
  }, []);

  function saveChanges() {
    axios.post(`${constants.apiurl}/api/adviser`, advisor).then(async (result) => {
        navigate('/admin/advisors');
    });
  }

  return (
    <>
      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <h5 className="title">Perfil de asesor</h5>
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
                  </Row>
                  <Row>
                    <Col className="pr-md-1" md="6">
                      <FormGroup>
                        <label>Nombres</label>
                        <Input placeholder="Jhon Doe" type="text" name='name' defaultValue={advisor.name} onChange={onHandleChange}/>
                      </FormGroup>
                    </Col>
                    <Col className="pl-md-1" md="6">
                      <FormGroup>
                        <label>Apellidos</label>
                        <Input placeholder="Jhon Doe" type="text" name='lastName' defaultValue={advisor.lastName} onChange={onHandleChange}/>
                      </FormGroup>
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
