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
  Row,
  Col,
} from "reactstrap";

import { axios } from '../config/https';
import constants from '../util/constans';

function ScatterList() {
  const navigate = useNavigate ();
  const [scatterList, setScatterList] = useState({});
  const [scatterListDetails, setScatterListDetails] = useState([]);
  const [companies, setCompanies] = useState([]); 
  const [wsTemplates, setWsTemplates] = useState([]); 

  const onHandleChange = (e) => {
    const { name, value } = e.target;
    setScatterList(pre => ({
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

        const _wstemplates = await axios.get(`${constants.apiurl}/api/wstemplates`);
        setWsTemplates([{idwstemplate: -1, name: 'Sin Plantilla'}, ..._wstemplates.data]);

        const currentScatterListID = localStorage.getItem('currentScatterListID');
        const _scatterList =  await axios.get(`${constants.apiurl}/api/scatterlist/${currentScatterListID}`);
        if(_scatterList.data) {
            setScatterList(_scatterList.data);
        } 

        const _scatterListDetails =  await axios.get(`${constants.apiurl}/api/scatterlistdetailbyScatterlist/${currentScatterListID}`);
        if(_scatterListDetails.data) {
            setScatterListDetails(_scatterListDetails.data);
        } 
    }

    load();
  }, []);

  function saveChanges() {
    axios.post(`${constants.apiurl}/api/scatterList`, scatterList).then(async (result) => {
        navigate('/admin/lists');
    });
  }

  function sendMessage() {
    if (window.confirm('¿Estas seguro que deseas enviar la dispersión con esta lista?')) {
        axios.post(`${constants.apiurl}/api/sendscatterlist`, {id: scatterList.idscatterlist}).then(async (result) => {
            alert('Lista enviada');
        });
    } 
  }

  return (
    <>
      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <h5 className="title">Lista de dispersión</h5>
              </CardHeader>
              <CardBody>
                <Form>
                   <Row>
                        <Col className="pr-md-1" md="4">
                            <FormGroup>
                                <label>Nombre</label>
                                <Input placeholder="Nombre de la plantiall aqui" type="text" name='name' defaultValue={scatterList.name} onChange={onHandleChange}/>
                            </FormGroup>
                        </Col>
                        <Col md="4">
                            <FormGroup>
                                <label>Empresa</label>
                                <select className="form-control" name="idcompnay" value={scatterList.idcompnay} onChange={cmbCompanyOnChange}>
                                {
                                    companies?.map((company, index) => 
                                    <option key={index} value={company.idcompany}>{company.name}</option>
                                )} 
                                </select>
                            </FormGroup>
                        </Col>
                        <Col md="4">
                            <FormGroup>
                                <label>Plantilla</label>
                                <select className="form-control" name="idwstemplate" value={scatterList.idwstemplate} onChange={cmbCompanyOnChange}>
                                {
                                    wsTemplates?.map((wstemplate, index) => 
                                    <option key={index} value={wstemplate.idwstemplate}>{wstemplate.name}</option>
                                )} 
                                </select>
                            </FormGroup>
                        </Col>
                  </Row>

                  <Row>
                    <Col md="12">
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
                                    {scatterListDetails?.map((scatterListDetail, index) => 
                                        <tr key={index}>
                                            <td> <Link to="javascript:void(0)">{index + 1}</Link></td>
                                            <td> <Link to="javascript:void(0)">{scatterListDetail.name}</Link></td>
                                            <td> <Link to="javascript:void(0)">{scatterListDetail.phone}</Link></td>
                                        </tr>
                                    )}                   
                                </tbody>          
                            </table>
                        </div> 
                    </Col>
                  </Row>
                </Form>
              </CardBody>
              <CardFooter>
                <Button className="btn-fill" color="primary" type="submit" onClick={saveChanges}>
                  Guardar
                </Button>

                <Button className="btn-fill" color="primary" type="submit" onClick={sendMessage}>
                  Enviar mensaje
                </Button>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default ScatterList;
