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
  const [roles, setRoles] = useState([]); 
  const [departments, setDepartments] = useState([]);

  const onHandleChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value 
    });
  }

  const cmbCompanyOnChange = async (e) => {
    const idCompany = Number(e.target.value);
    setUser(previous => ({ ...previous, idCompany, departmentIds: [] }));
    await loadDepartments(idCompany);
  }

  async function loadDepartments(idCompany) {
    if (!idCompany || idCompany < 1) {
      setDepartments([]);
      return;
    }
    const result = await axios.get(`${constants.apiurl}/api/companies/${idCompany}/departments`);
    setDepartments((result.data || []).filter(department => Number(department.active) === 1));
  }

  function toggleDepartment(iddepartment) {
    setUser(previous => {
      const selected = Array.isArray(previous.departmentIds) ? previous.departmentIds.map(Number) : [];
      return {
        ...previous,
        departmentIds: selected.includes(iddepartment)
          ? selected.filter(id => id !== iddepartment)
          : [...selected, iddepartment],
      };
    });
  }

  useEffect(() => { 
   async function load() {
    const currentUserID = localStorage.getItem('currentUserID');
    const _companies = await axios.get(`${constants.apiurl}/api/companies`);
    setCompanies([{idcompany: -1, name: 'Sin Empresa'}, ..._companies.data]);
    const _roles = await axios.get(`${constants.apiurl}/api/roles`);
    setRoles([{idroles: -1, name: 'Sin Rol'}, ..._roles.data]);
    const _user =  await axios.get(`${constants.apiurl}/api/user/${currentUserID}`);
      const userData = _user.data || {};
      setUser({ ...userData, departmentIds: Array.isArray(userData.departmentIds) ? userData.departmentIds.map(Number) : [] });
      if (userData.idCompany) await loadDepartments(userData.idCompany);
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
                    <Col className="pr-md-1" md="4">
                      <FormGroup>
                        <label>Nombres</label>
                        <Input placeholder="Jhon Doe" type="text" name='name' value={user.name || ''} onChange={onHandleChange}/>
                      </FormGroup>
                    </Col>
                    <Col className="pl-md-1" md="4">
                      <FormGroup>
                        <label>Numero de documento</label>
                        <Input placeholder="00000000" type="number" name='dni' value={user.dni || ''} onChange={onHandleChange}/>
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <label>Telefono</label>
                        <Input placeholder="3000000000" type="tel" name='phone' value={user.phone || ''} onChange={onHandleChange} />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>                    
                    <Col md="3">
                      <FormGroup>
                        <label htmlFor="exampleInputEmail1">
                          Email
                        </label>
                        <Input placeholder="jhondoe@email.com" type="email" autoComplete="off" name='email' value={user.email || ''} onChange={onHandleChange} />
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <label htmlFor="exampleInputEmail1">
                          Contraseña
                        </label>
                        <Input placeholder="*****" type="password" autoComplete="new-password" name='password' value={user.password || ''} onChange={onHandleChange}/>
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <label>Empresa</label>
                        <select className="form-control" name="idCompany" value={user.idCompany || -1} onChange={cmbCompanyOnChange}>
                        {
                            companies?.map((company, index) => 
                            <option key={index} value={company.idcompany}>{company.name}</option>
                        )} 
                        </select>
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <label>Rol</label>
                        <select className="form-control" name="idRol" value={user.idRol || -1} onChange={onHandleChange}>
                        {
                            roles?.map((rol, index) => 
                            <option key={index} value={rol.idroles}>{rol.name}</option>
                        )} 
                        </select>
                      </FormGroup>
                    </Col>
                  </Row>                 
                  {departments.length > 0 && (
                    <Row>
                      <Col md="12">
                        <FormGroup>
                          <label>Departamentos de atención por WhatsApp</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px' }}>
                            {departments.map((department) => (
                              <FormGroup check key={department.iddepartment}>
                                <label className="form-check-label">
                                  <Input
                                    type="checkbox"
                                    checked={(user.departmentIds || []).map(Number).includes(Number(department.iddepartment))}
                                    onChange={() => toggleDepartment(Number(department.iddepartment))}
                                  />
                                  <span className="form-check-sign"><span className="check" /></span>
                                  {department.name}
                                </label>
                              </FormGroup>
                            ))}
                          </div>
                          <small className="text-muted">Al seleccionar al menos uno, este usuario entra en el reparto automático de chats.</small>
                        </FormGroup>
                      </Col>
                    </Row>
                  )}
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
