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

function Company() {
  const navigate = useNavigate ();
  const [company, setCompany] = useState({});
  const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [cities, setCities] = useState([]);

  const onHandleChange = (e) => {
    const { name, value } = e.target;
    setCompany(pre => ({
      ...pre,
      [name]: value 
    }));
  }

  const cmbCompanyOnChange = async (e) => { 
    onHandleChange(e);        
  }

//   const cmbStateonChange = async (e) => { 
//     onHandleChange(e);
//     const cities = await axios.get(`${constants.apiurl}/api/places/cities/${e.target.value}`);
//     setCities(cities.data);
//   }

  useEffect(() => { 
    async function load() {
        const currentCompanyID = localStorage.getItem('currentCompanyID');   
        const _countries = await axios.get(`${constants.apiurl}/api/places/countries`);
        setCountries(_countries.data);
        // const states = await axios.get(`${constants.apiurl}/api/places/states/1`);
        // setStates(states.data);    
        const _company =  await axios.get(`${constants.apiurl}/api/company/${currentCompanyID}`);
        if(_company.data) {
            setCompany(_company.data);
        } 
    }

    load();
  }, []);

  function saveChanges() {
    console.log(company)
    axios.post(`${constants.apiurl}/api/company`, company).then(async (result) => {
        navigate('/admin/companies');
    });
  }

  return (
    <>
      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <h5 className="title">Perfil de empresa</h5>
              </CardHeader>
              <CardBody>
                <Form>
                   <Row>
                        <Col className="pr-md-1" md="4">
                            <FormGroup>
                                <label>Nombre</label>
                                <Input placeholder="Jhon Doe" type="text" name='name' defaultValue={company.name} onChange={onHandleChange}/>
                            </FormGroup>
                        </Col>
                        <Col className="pl-md-1" md="4">
                            <FormGroup>
                                <label>NIT</label>
                                <Input placeholder="00000000" type="number" name='nit' defaultValue={company.nit} onChange={onHandleChange}/>
                            </FormGroup>
                        </Col>
                        <Col md="4">
                            <FormGroup>
                                <label htmlFor="exampleInputEmail1">
                                Email
                                </label>
                                <Input placeholder="jhondoe@email.com" type="email" autoComplete="off" name='email' defaultValue={company.email} onChange={onHandleChange} />
                            </FormGroup>
                        </Col>
                  </Row>      
                  <Row>                    
                    <Col md="4">
                      <FormGroup>
                        <label htmlFor="exampleInputEmail1">
                          Pagina Web
                        </label>
                        <Input placeholder="https://www..." type="text" autoComplete="off" name='webpage' defaultValue={company.webpage} onChange={onHandleChange}/>
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <label>Dirección</label>
                        <Input placeholder="Calle 123" type="text" name='address' defaultValue={company.address} onChange={onHandleChange} />
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <label>Telefono</label>
                        <Input placeholder="3000000000" type="tel" name='phone' defaultValue={company.phone} onChange={onHandleChange} />
                      </FormGroup>
                    </Col>
                  </Row>   
                  <Row>
                    <Col md="4">
                      <FormGroup>
                        <label>Pais</label>
                        <select className="form-control" name="country" value={company.country} onChange={cmbCompanyOnChange}>
                        {
                            countries?.map((country, index) => 
                            <option key={index} value={country.id}>{country.name}</option>
                        )} 
                        </select>
                      </FormGroup>
                    </Col>
                    {/* <Col md="4">
                      <FormGroup>
                        <label>Departamento</label>
                        <select className="form-control" name="idCompany" value={company.idCompany} onChange={cmbStateonChange}>
                        {
                            states?.map((state, index) => 
                            <option key={index} value={state.idstate}>{state.name}</option>
                        )} 
                        </select>
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <label>Ciudad</label>
                        <select className="form-control" name="idCompany" value={company.idCompany} onChange={cmbCompanyOnChange}>
                        {
                            cities?.map((city, index) => 
                            <option key={index} value={city.idcities}>{city.name}</option>
                        )} 
                        </select>
                      </FormGroup>
                    </Col> */}
                  </Row>
                  <Row>
                    <Col md="4">
                      <FormGroup>
                        <label>Phone Number ID</label>
                        <Input placeholder="000000000000" type="text" name='phoneNumberId' defaultValue={company.phoneNumberId} onChange={onHandleChange} />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <label>WS Token</label>
                        <Input placeholder="000000000000" type="password" name='wstoken' defaultValue={company.wstoken} onChange={onHandleChange} />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <label>Datos de entrenamiento</label>
                        <textarea className="form-control" placeholder="Datos de entrenamiento" cols="30" rows="10" defaultValue={company.traindata} name='traindata' onChange={onHandleChange}></textarea>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <label>Instrucciones GPT</label>
                        <textarea className="form-control" placeholder="Datos de entrenamiento" cols="30" rows="10" defaultValue={company.gptInstructions} name='gptInstructions' onChange={onHandleChange}></textarea>
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

export default Company;
