import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  FormGroup,
  Form,
  Input,
  Label,
  Row,
  Col,
} from "reactstrap";

import { axios } from '../config/https';
import constants from '../util/constans';
import { getUserInfo } from 'util/localStorageInfo';

function Company() {
  const navigate = useNavigate ();
  const [company, setCompany] = useState({});
  const [countries, setCountries] = useState([]);
  const [wsaccounts, setWsAccounts] = useState([]); 

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

  useEffect(() => { 
    async function load() {
        const currentCompanyID = localStorage.getItem('currentCompanyID');

        const _countries = await axios.get(`${constants.apiurl}/api/places/countries`);
        setCountries(_countries.data); 

        const _company =  await axios.get(`${constants.apiurl}/api/company/${currentCompanyID}`);
        if(_company.data) {
            setCompany(_company.data);

            const _wsaccounts = await axios.get(`${constants.apiurl}/api/wsaccountsbyCompany/${currentCompanyID}`);
            setWsAccounts(_wsaccounts.data);
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

  function renderButton() {
    const userInfo = getUserInfo();
    if(userInfo.idroles == 1) {
      return  <Button className="btn-fill" color="primary" type="submit" onClick={saveChanges}>
      Guardar
    </Button>
    } else {
      return  <div></div>
    }
  }

  function goToWhatsAppAccountOnClick(idwhatsapp_accounts) {
    localStorage.setItem('currentWhatsAppAccountID', idwhatsapp_accounts);
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
                  </Row>
                  <Row>
                    <Col md="4">
                      <FormGroup check>
                        <Label check>
                          <Input type="checkbox" name='ableinstagram' onChange={onHandleChange}/>
                          <span className="form-check-sign">
                            <span className="check" />
                          </span>
                          Habilitar Instagram
                        </Label>
                      </FormGroup>
                    </Col>
                  </Row>              
                </Form>
              </CardBody>
              <CardFooter>
                {
                  renderButton()
                }               
              </CardFooter>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md="12">
            <Card>
              <CardBody>
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>       
                                <th>#</th>                           
                                <th>Nombre</th>
                                <th>Telefono</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wsaccounts?.map((wsaccount, index) => 
                                <tr key={index}>
                                    <td>    
                                      <Link to="/admin/whatsappaccount" onClick={() => goToWhatsAppAccountOnClick(wsaccount.idwhatsapp_accounts)}>{index + 1}</Link>                     
                                    </td>
                                    <td> <Link to="/admin/whatsappaccount" onClick={() => goToWhatsAppAccountOnClick(wsaccount.idwhatsapp_accounts)}>{wsaccount.displayname}</Link></td>
                                    <td> <Link to="/admin/whatsappaccount" onClick={() => goToWhatsAppAccountOnClick(wsaccount.idwhatsapp_accounts)}>{wsaccount.phone}</Link></td>
                                </tr>
                            )}                   
                        </tbody>          
                    </table>
                </div> 
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Company;
