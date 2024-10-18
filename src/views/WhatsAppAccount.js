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

function WhatsAppAccount() {
  const navigate = useNavigate ();
  const [whatsAppAccount, setWhatsAppAccount] = useState({});
  const [wsaccounts, setWsAccounts] = useState([]); 

  const onHandleChange = (e) => {
    const { name, value } = e.target;
    setWhatsAppAccount(pre => ({
      ...pre,
      [name]: value 
    }));
  }

  const cmbWhatsAppAccountOnChange = async (e) => { 
    onHandleChange(e);        
  }

  useEffect(() => { 
    async function load() {
        const currentWhatsAppAccountID = localStorage.getItem('currentWhatsAppAccountID');

        const _whatsAppAccount =  await axios.get(`${constants.apiurl}/api/wsaccounts/${currentWhatsAppAccountID}`);
        if(_whatsAppAccount.data) {
            setWhatsAppAccount(_whatsAppAccount.data);

            // const _wsaccounts = await axios.get(`${constants.apiurl}/api/wsaccounts/${currentWhatsAppAccountID}`);
            // setWsAccounts(_wsaccounts.data);
        } 
    }

    load();
  }, []);

  function saveChanges() {
    console.log(whatsAppAccount)
    axios.post(`${constants.apiurl}/api/wsaccounts`, whatsAppAccount).then(async (result) => {
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

  function renderTokenInput() {
    const userInfo = getUserInfo();
    if(userInfo.idroles == 1) {
      return  <Col md="12">
      <FormGroup>
        <label htmlFor="exampleInputEmail1">
          Token
        </label>
        <Input placeholder="******" type="text" autoComplete="off" name='wstoken' defaultValue={whatsAppAccount.wstoken} onChange={onHandleChange}/>
      </FormGroup>
    </Col>
    } else {
      return  <div></div>
    }
  }

  function renderInstructions() {
    const userInfo = getUserInfo();
    if(userInfo.idroles == 1) {
      return   <Col md="12">
      <FormGroup>
        <label>Instrucciones</label>
        <textarea className="form-control" placeholder="Ingresa instrucciones" cols="30" rows="10" defaultValue={whatsAppAccount.gptInstructions} name='gptInstructions' onChange={onHandleChange}></textarea>
      </FormGroup>
    </Col>
    } else {
      return  <div></div>
    }
  }

  return (
    <>
      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <h5 className="title">Cuenta de WhatsApp</h5>
              </CardHeader>
              <CardBody>
                <Form>
                   <Row>
                        <Col className="pr-md-1" md="4">
                            <FormGroup>
                                <label>Nombre para clientes</label>
                                <Input placeholder="Jhon Doe" type="text" name='displayname' defaultValue={whatsAppAccount.displayname} onChange={onHandleChange}/>
                            </FormGroup>
                        </Col>
                        <Col className="pl-md-1" md="4">
                            <FormGroup>
                                <label>Phone Number ID (WABA)</label>
                                <Input placeholder="00000000" type="number" name='phoneNumberId' defaultValue={whatsAppAccount.phoneNumberId} onChange={onHandleChange}/>
                            </FormGroup>
                        </Col>
                        <Col md="4">
                            <FormGroup>
                                <label htmlFor="exampleInputEmail1">
                                Telefono
                                </label>
                                <Input placeholder="jhondoe@email.com" type="tel" name='phone' defaultValue={whatsAppAccount.phone} onChange={onHandleChange} />
                            </FormGroup>
                        </Col>
                  </Row>      
                  <Row>                    
                   {
                    renderTokenInput()
                   }
                    <Col md="12">
                      <FormGroup>
                        <label>Datos de entrenamiento</label>
                        <textarea className="form-control" placeholder="Ingresa datos de entrenamiento" cols="30" rows="10" defaultValue={whatsAppAccount.traindata} name='traindata' onChange={onHandleChange}></textarea>
                      </FormGroup>
                    </Col>
                   {
                    renderInstructions()
                   }
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
                <h5 className="title">Documentos para entrenamiento</h5>
              </CardHeader>
              <CardBody>
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>       
                                <th>#</th>                           
                                <th>Nombre</th>
                                <th>Descripcion</th>
                                <th>Documento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wsaccounts?.map((wsaccount, index) => 
                                <tr key={index}>
                                    <td>    
                                      <Link to="javascript:void(0)">{index + 1}</Link>                     
                                    </td>
                                    <td> <Link to="javascript:void(0)">{wsaccount.displayname}</Link></td>
                                    <td> <Link to="javascript:void(0)">{wsaccount.phone}</Link></td>
                                    <td> <Link to="javascript:void(0)">{wsaccount.phone}</Link></td>
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

export default WhatsAppAccount;
