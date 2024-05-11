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

function UserProfile() {
  const navigate = useNavigate ();
  const [user, setUser] = useState({});
  const [companies, setCompanies] = useState([]); 

  const onHandleChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value 
    });
  }

  const cmbCompanyOnChange = async (e) => { 
    onHandleChange(e);        
  }

  useEffect(() => { 
   async function load() {
    const currentUserID = localStorage.getItem('currentUserID');
    const _companies = await axios.get(`${constants.apiurl}/api/companies`);
    setCompanies([{idcompany: -1, name: 'Sin Empresa'}, ..._companies.data]);
    const _user =  await axios.get(`${constants.apiurl}/api/user/${currentUserID}`);
    setUser(_user.data);
   }
   load();
  }, []);

  function saveChanges() {
    axios.post(`${constants.apiurl}/api/user`, user).then(async (result) => {
        navigate('/admin/users');
    });
  }

  return (
    <>
      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <h5 className="title">Perfil de usuario</h5>
              </CardHeader>
              <CardBody>
                <Form>
                  <Row>
                    <Col md="4">
                      <FormGroup>
                        <label>Empresa</label>
                        <select className="form-control" name="idCompany" value={user.idCompany} onChange={cmbCompanyOnChange}>
                        {
                            companies?.map((company, index) => 
                            <option key={index} value={company.idcompany}>{company.name}</option>
                        )} 
                        </select>
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <label htmlFor="exampleInputEmail1">
                          Email
                        </label>
                        <Input placeholder="jhondoe@email.com" type="email" autoComplete="off" name='email' defaultValue={user.email} onChange={onHandleChange} />
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <label htmlFor="exampleInputEmail1">
                          Contraseña
                        </label>
                        <Input placeholder="*****" type="password" autoComplete="off" name='password' defaultValue={user.password} onChange={onHandleChange}/>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-md-1" md="6">
                      <FormGroup>
                        <label>Nombres</label>
                        <Input placeholder="Jhon Doe" type="text" name='name' defaultValue={user.name} onChange={onHandleChange}/>
                      </FormGroup>
                    </Col>
                    <Col className="pl-md-1" md="6">
                      <FormGroup>
                        <label>Numero de documento</label>
                        <Input placeholder="00000000" type="number" name='dni' defaultValue={user.dni} onChange={onHandleChange}/>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="4">
                      <FormGroup>
                        <label>Telefono</label>
                        <Input placeholder="3000000000" type="tel" name='phone' defaultValue={user.phone} onChange={onHandleChange} />
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

export default UserProfile;
