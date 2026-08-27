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
import TablePagination, { useClientPagination } from '../components/Pagination/TablePagination';

function Company() {
  const navigate = useNavigate ();
  const [company, setCompany] = useState({});
  const [countries, setCountries] = useState([]);
  const [wsaccounts, setWsAccounts] = useState([]); 
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState('');
  const wsAccountsPagination = useClientPagination(wsaccounts);

  const onHandleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCompany(pre => ({
      ...pre,
      [name]: type === 'checkbox' ? Number(checked) : value,
      ...(name === 'multiagent' && !checked ? { multidept: 0 } : {})
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
            const _departments = await axios.get(`${constants.apiurl}/api/companies/${currentCompanyID}/departments`);
            setDepartments(_departments.data || []);
        } 
    }

    load();
  }, []);

  function saveChanges() {
    axios.post(`${constants.apiurl}/api/company`, company).then(async (result) => {
        navigate('/admin/companies');
    });
  }

  async function addDepartment() {
    const name = newDepartment.trim();
    if (!name) return;
    const currentCompanyID = localStorage.getItem('currentCompanyID');
    const result = await axios.post(`${constants.apiurl}/api/companies/${currentCompanyID}/departments`, {
      name: name.slice(0, 24),
      sortorder: departments.length,
      active: true,
    });
    setDepartments(previous => [...previous, result.data]);
    setNewDepartment('');
  }

  async function updateDepartment(department) {
    const currentCompanyID = localStorage.getItem('currentCompanyID');
    const result = await axios.post(`${constants.apiurl}/api/companies/${currentCompanyID}/departments`, department);
    setDepartments(previous => previous.map(item => item.iddepartment === department.iddepartment ? result.data : item));
  }

  async function removeDepartment(iddepartment) {
    const currentCompanyID = localStorage.getItem('currentCompanyID');
    await axios.delete(`${constants.apiurl}/api/companies/${currentCompanyID}/departments/${iddepartment}`);
    setDepartments(previous => previous.filter(item => item.iddepartment !== iddepartment));
  }

  function renderButton() {
    const userInfo = getUserInfo();
    if(Number(userInfo?.idroles) === 1) {
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
              <CardHeader>
                <h5 className="title">Distribución de chats de WhatsApp</h5>
                <p className="card-category">Distribuye automáticamente las conversaciones entre los usuarios configurados como agentes.</p>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md="4">
                    <FormGroup check>
                      <Label check>
                        <Input type="checkbox" name="multiagent" checked={Number(company.multiagent) === 1} onChange={onHandleChange}/>
                        <span className="form-check-sign"><span className="check" /></span>
                        Habilitar múltiples agentes
                      </Label>
                    </FormGroup>
                  </Col>
                  <Col md="4">
                    <FormGroup check>
                      <Label check>
                        <Input type="checkbox" name="multidept" disabled={Number(company.multiagent) !== 1} checked={Number(company.multidept) === 1} onChange={onHandleChange}/>
                        <span className="form-check-sign"><span className="check" /></span>
                        Permitir elegir departamento
                      </Label>
                    </FormGroup>
                  </Col>
                </Row>
                {Number(company.multiagent) === 1 && (
                  <div style={{ marginTop: '24px' }}>
                    <label>Departamentos y grupos de atención</label>
                    {departments.map((department) => (
                      <Row key={department.iddepartment} style={{ marginBottom: '8px' }}>
                        <Col md="8">
                          <Input
                            value={department.name}
                            maxLength={24}
                            onChange={(event) => setDepartments(previous => previous.map(item => item.iddepartment === department.iddepartment ? { ...item, name: event.target.value } : item))}
                          />
                        </Col>
                        <Col md="4">
                          <Button size="sm" color="primary" onClick={() => updateDepartment(department)}>Guardar</Button>{' '}
                          <Button size="sm" color="danger" onClick={() => removeDepartment(department.iddepartment)}>Desactivar</Button>
                        </Col>
                      </Row>
                    ))}
                    <Row>
                      <Col md="8">
                        <Input value={newDepartment} maxLength={24} placeholder="Ej. Ventas" onChange={(event) => setNewDepartment(event.target.value)} />
                      </Col>
                      <Col md="4">
                        <Button size="sm" color="success" onClick={addDepartment}>Agregar departamento</Button>
                      </Col>
                    </Row>
                    <small className="text-muted">Asigna estos departamentos a cada agente desde su perfil de usuario.</small>
                  </div>
                )}
              </CardBody>
              <CardFooter>{renderButton()}</CardFooter>
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
                            {wsAccountsPagination.paginatedItems?.map((wsaccount, index) => 
                                <tr key={index}>
                                    <td>    
                                      <Link to="/admin/whatsappaccount" onClick={() => goToWhatsAppAccountOnClick(wsaccount.idwhatsapp_accounts)}>{wsAccountsPagination.startIndex + index + 1}</Link>                     
                                    </td>
                                    <td> <Link to="/admin/whatsappaccount" onClick={() => goToWhatsAppAccountOnClick(wsaccount.idwhatsapp_accounts)}>{wsaccount.displayname}</Link></td>
                                    <td> <Link to="/admin/whatsappaccount" onClick={() => goToWhatsAppAccountOnClick(wsaccount.idwhatsapp_accounts)}>{wsaccount.phone}</Link></td>
                                </tr>
                            )}                   
                        </tbody>          
                    </table>
                </div> 
                <TablePagination {...wsAccountsPagination} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Company;
