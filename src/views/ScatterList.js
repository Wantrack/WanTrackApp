import React, { useState, useEffect, useRef } from 'react';
import NotificationAlert from "react-notification-alert";
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
  Modal,
  ModalBody,
  ModalHeader
} from "reactstrap";

import { axios } from '../config/https';
import constants from '../util/constans';
import { element } from 'prop-types';

function ScatterList() {
  const navigate = useNavigate ();
  const [scatterList, setScatterList] = useState({});
  const [contact, setContact] = useState({});
  const [bodyparameters, setBodyParameters] = useState([]);
  const [headerp, setHeaderP] = useState({});
  const [scatterListDetails, setScatterListDetails] = useState([]);
  const [companies, setCompanies] = useState([]); 
  const [wsTemplates, setWsTemplates] = useState([]); 
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalParameterVisible, setModalParameterVisible] = React.useState(false);

  const notificationAlertRef = useRef(null);

  const onHandleChange = (e) => {
    const { name, value } = e.target;
    setScatterList(pre => ({
      ...pre,
      [name]: value 
    }));
  }

  const onHandleChangeContact = (e) => {
    const { name, value } = e.target;
    setContact(pre => ({
      ...pre,
      [name]: value 
    }));
  }

  const onHandleChangeHeader = (e) => {
    const { name, value } = e.target;
    setHeaderP(pre => ({
      ...pre,
      [name]: value 
    }));
  }

  const onHandleChangeBodyP = index => e => {
    let newArray = [...bodyparameters];
    newArray[index] = { text: e.target.value }
    setBodyParameters(newArray)
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
            jsonToPObject(_scatterList.data)
        } 

        const _scatterListDetails =  await axios.get(`${constants.apiurl}/api/scatterlistdetailbyScatterlist/${currentScatterListID}`);
        if(_scatterListDetails.data) {
            setScatterListDetails(_scatterListDetails.data);
        } 
    }

    load();
  }, []);

  function saveChanges() {
    scatterList.json = pObjectToJson();
    axios.post(`${constants.apiurl}/api/scatterList`, scatterList).then(async (result) => {
        navigate('/admin/lists');
    });
  }

  async function addContact() {
    const currentScatterListID = localStorage.getItem('currentScatterListID');
    await axios.post(`${constants.apiurl}/api/scatterlistdetail`, { ...contact, idscatterlist: currentScatterListID });
    const _scatterListDetails =  await axios.get(`${constants.apiurl}/api/scatterlistdetailbyScatterlist/${currentScatterListID}`);
    if(_scatterListDetails.data) {
      setScatterListDetails(_scatterListDetails.data);
    } 
    setContact({});
    toggleModal();
  }

  async function addParameterBody() {
    setBodyParameters(oldArray => [...oldArray, {text: ''}]);
  }

  function sendNotification(message) {   
    var options = {};
    options = {
      place: 'tr',
      message: (
        <div>
          <div>
            {message}
          </div>
        </div>
      ),
      type: 'success',
      icon: "tim-icons icon-bell-55",
      autoDismiss: 7,
    };
    notificationAlertRef.current.notificationAlert(options);
  }

  function sendMessage() {
    if (window.confirm('¿Estas seguro que deseas enviar la dispersión con esta lista?')) {
        axios.post(`${constants.apiurl}/api/sendscatterlist`, {id: scatterList.idscatterlist}).then(async (result) => {
            sendNotification('Lista enviada');
        });
    } 
  }

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const toggleParameterModal = () => {
    const isVisible = !modalParameterVisible;

    setModalParameterVisible(isVisible);
  };

  const jsonToPObject = (_scatterList) => {
    if(_scatterList.json) {
      const json =  JSON.parse(_scatterList.json);
      const header = json.find(element => element.type == 'header');
      if(header) {
        setHeaderP({
          type: header.parameters[0].type,
          link: header.parameters[0].link,
          text: header.parameters[0].text
        })
      }

      const body = json.find(element => element.type == 'body');
      if(body) {
        const _bodyparameters = [];
        for (const parameter of body.parameters) {
          _bodyparameters.push(parameter);
        }
        setBodyParameters(_bodyparameters);
      }
    }
  }

  const pObjectToJson = () => {
    const json = [];
    if(headerp && headerp.link) {
      let headerelement = { type : 'header', parameters: []};
      let headerelementp = {};

      if(headerp.type) {
        headerelementp.type = headerp.type
      }

      if(headerp.link) {
        headerelementp.link = headerp.link
      }

      if(headerp.text) {
        headerelementp.text = headerp.text
      }
      if(headerelementp.link) {
        headerelement.parameters.push(headerelementp);
      }
      json.push(headerelement);
    }

    if(bodyparameters && bodyparameters.length > 0) {
      let bodyelement = { type : 'body', parameters: []};
      for (const bodyparameter of bodyparameters) {
        bodyelement.parameters.push(bodyparameter);
      }
      json.push(bodyelement);
    }

    return JSON.stringify(json)
  }

  return (
    <>
      <div className="content">
        <div className="react-notification-alert-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        <Modal isOpen={modalVisible} toggle={toggleModal}>
          <ModalHeader>
            <h2 style={{color: '#000', marginBottom: '0px'}}>Agregar contacto</h2>
          </ModalHeader>
          <ModalBody>
            <FormGroup>
                <label>Telefono</label>
                <Input placeholder="Escriba el telefono aqui" className="form-control form-control-lg color_black" type="tel" name='phone' defaultValue={contact.phone} onChange={onHandleChangeContact}/>
            </FormGroup>
            <FormGroup>
                <label>Nombre completo</label>
                <Input placeholder="Escriba el nombre completo" className="form-control form-control-lg color_black" type="text" name='name' defaultValue={contact.name} onChange={onHandleChangeContact}/>
            </FormGroup>
            
            <Button onClick={addContact} style={{marginTop: '20px'}} className="btn btn-primary">
              Agregar
            </Button>
          </ModalBody>
        </Modal>

        <Modal isOpen={modalParameterVisible} toggle={toggleParameterModal}>
          <ModalHeader>
            <h2 style={{color: '#000', marginBottom: '0px'}}>Parametos</h2>
          </ModalHeader>
          <ModalBody>
            <FormGroup>
                <label>Header</label>
                <select className="form-control color_black" name='typeId' value={headerp.type} onChange={onHandleChangeHeader}>
                  <option selected value='image'>Imagen</option>
                  <option value='document'>Documento</option>
                </select>
                <Input placeholder="Link" className="form-control form-control-lg color_black" style={{marginTop: '10px'}}  type="text" name='phone' defaultValue={headerp.link} onChange={onHandleChangeHeader}/>
                <Input placeholder="Texto" className="form-control form-control-lg color_black" style={{marginTop: '10px'}} type="text" name='phone' defaultValue={headerp.text} onChange={onHandleChangeHeader}/>
            </FormGroup>
            <FormGroup>
                <label>Body</label>
                {
                  bodyparameters?.map((parameter, index) => 
                    <Input key={index} className="form-control form-control-lg color_black" placeholder="Texto" style={{marginTop: '10px'}} type="text" name={`body${index}`} defaultValue={parameter.text} onChange={onHandleChangeBodyP(index)}/>
                  )}  
            </FormGroup>
            
            <Button onClick={toggleParameterModal} style={{marginTop: '20px'}} className="btn btn-primary">
              Guardar
            </Button> 
            <Button onClick={addParameterBody} style={{marginTop: '20px'}} className="btn btn-primary">
                  Agregar parametro body
                </Button>
          </ModalBody>
        </Modal>
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
                    <Col style={{display: 'flex', justifyContent: 'space-between'}} md="12">
                      <Button title="Agregar contacto" onClick={toggleModal} className="btn btn-primary">
                        <i className="fa fa-user-plus" />
                      </Button>

                      <Button title="Agregar parametros" onClick={toggleParameterModal} className="btn btn-primary">
                        Agregar parametos
                      </Button>
                    </Col>
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
              <CardFooter  style={{display: 'flex', justifyContent: 'space-between'}} >
                {/* <Button title="Guardar y cerrar" className="btn-fill" color="primary" type="submit">
                  
                </Button> */}

                {/* <Button title="Enviar mensaje" className="btn-fill" color="primary" type="submit" onClick={sendMessage}>
                  Enviar mensaje 
                </Button> */}
              </CardFooter>
            </Card>
          </Col>
        </Row>
        <Link to="javascript:void(0)" title="Enviar mensaje" href="#" class="float-2" onClick={sendMessage}>
          <i className="fa-solid fa-paper-plane my-float"></i>
        </Link>
        <Link to="javascript:void(0)" title="Guardar y cerrar" href="#" class="float" onClick={saveChanges}>
          <i className="fa-solid fa-floppy-disk my-float"></i>
        </Link>
      </div>
    </>
  );
}

export default ScatterList;
