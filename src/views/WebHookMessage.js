import React, { useState, useEffect, useRef } from 'react';
import NotificationAlert from "react-notification-alert";
import { useNavigate, Link } from "react-router-dom";
import Loader from '../components/Loader/Loader';
import { axios } from '../config/https';
import constants from '../util/constans';
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
    ModalHeader,
    ModalFooter,
    Label
  } from "reactstrap";
import { func } from 'prop-types';

function WebHookMessage (props) {
    const navigate = useNavigate ();
    const [webHook, setWebHook] = useState({userules:false});
    const [rules, setRules] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [wsTemplates, setWsTemplates] = useState([]);
    const [wsaccounts, setWsAccounts] = useState([]); 
    const [loaderActive, setLoaderActive] = useState(false);
    const [payload, setPayload] = useState('');
    const [selectedRuleIndex, setSelectedRuleIndex] = useState(0);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [isaValidJSON, setIsaValidJSON] = React.useState(false);

    const notificationAlertRef = useRef(null);

    useEffect(() => { 
        async function load() {
            setLoaderActive(true);

            const currentScatterListID = localStorage.getItem('currentWebHookID');
            const _webhook =  await axios.get(`${constants.apiurl}/api/webhook/webhook/${currentScatterListID}`);

            const _companies = await axios.get(`${constants.apiurl}/api/companies`);
            setCompanies([{idcompany: -1, name: 'Sin Empresa'}, ..._companies.data]);

            const _wstemplates = await axios.get(`${constants.apiurl}/api/wstemplatebyCompany/${_webhook.data.idcompany || _companies.data[0].idcompany}`);
            setWsTemplates([{idwstemplate: -1, name: 'Sin Plantilla'}, ..._wstemplates.data]);
    
            const _wsaccounts = await axios.get(`${constants.apiurl}/api/wsaccountsbyCompany/${_webhook.data.idcompany || _companies.data[0].idcompany}`);
            setWsAccounts([{idwhatsapp_accounts: -1, displayname: 'Sin Cuenta'}, ..._wsaccounts.data]);
            
            if(_webhook.data) {
                setWebHook(_webhook.data);
                const isValidJsonVar = isValidJson(false, true, _webhook.data);
                setIsaValidJSON(isValidJsonVar);
                if(_webhook.data.userules == 1) {
                  const _rules = await axios.get(`${constants.apiurl}/api/webhook/webhookrule/${currentScatterListID}`);
                  if(_rules.data) {
                    setRules(_rules.data);
                  }
                }
            }

            setLoaderActive(false);
        }
        load();
    }, []);

    async function sendNotification(message, type = 'success') {    
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
        type: type,
        icon: "tim-icons icon-bell-55",
        autoDismiss: 7,
      };
      notificationAlertRef.current.notificationAlert(options);
    }
    
    const onHandleChange = (e) => {
        const { name, value } = e.target;
        console.log(value)
        setWebHook(pre => ({
        ...pre,
        [name]: value 
        }));
    }

    const onHandleChangePayload = (e) => {
      const { value } = e.target;
      setPayload(value);
    }

    const onHandleChangeRule = index => e => {
      const { name, value } = e.target;
      let newArray = [...rules];
      const item = newArray[index];
      item[name] = value;
      newArray[index] = { ...item }      
      setRules(newArray);
    }  

    const rulesCheckonHandleChange = (e) => {
      let isrule = !webHook.userules;

      if(isrule){
        const isvjson = isValidJson(true);
        if(!isvjson) {
          isrule = !isrule;
        }
      }

      setWebHook(pre => ({
        ...pre,
        userules: isrule
      }));
    }

    const jsonOnChange = async (e) => {
      const isValidJsonVar = isValidJson(false, true, {...webHook, jsonschema: e.target.value});
      setIsaValidJSON(isValidJsonVar);
      onHandleChange(e);
    }

    const cmbCompanyOnChange = async (e) => {       
        onHandleChange(e);

        const { name, value } = e.target;

        const _wsaccounts = await axios.get(`${constants.apiurl}/api/wsaccountsbyCompany/${value}`);
        setWsAccounts([{idwhatsapp_accounts: -1, displayname: 'Sin Cuenta'}, ..._wsaccounts.data]);

        const _wstemplates = await axios.get(`${constants.apiurl}/api/wstemplatebyCompany/${value}`);
        setWsTemplates([{idwstemplate: -1, name: 'Sin Plantilla'}, ..._wstemplates.data]);
    }

    const cmbOnChange = async (e) => { 
      onHandleChange(e);        
  }

    async function saveChanges(close = true) {
        await axios.post(`${constants.apiurl}/api/webhook/webhook`, webHook);
        for (const rule of rules) {
          await axios.post(`${constants.apiurl}/api/webhook/webhookrule`, rule);
        }
        if(close) {
          navigate('/admin/webhooks');
        }
    }

    async function addRule() {
        const newItem = {};
        setRules(pre => [
          ...pre,
          newItem
        ]);
    }

    async function savePayload() {
      onHandleChangeRule(selectedRuleIndex)(
        {
          target:  {
            name: 'jsonschema', 
            value: payload
          }
        }
       );
       toggleModal(0)
    }

    const jsonOnBlur = async (e) => {
      try {
        if(webHook.jsonschema) {
          const parsedJSON = JSON.parse(webHook.jsonschema);      
          const JsonFormated = JSON.stringify(parsedJSON, null, 4);
          document.querySelector('#jsonschema').value = JsonFormated;
        }   
      } catch (error) {} 
    }

    function isValidJson(showNotification = false, overridewebHook = false, webHookData = null) {
      const _webhook = overridewebHook ? webHookData : webHook;

      try {
        if(_webhook.jsonschema) {
          JSON.parse(_webhook.jsonschema);           
        }else {
          if(showNotification) {
            sendNotification('El JSON esta vacio', 'danger');
          }
          console.error('here')
          return false;
        }
        return true;
      } catch (e) {
        console.error(e)
        if(showNotification) {
          sendNotification('El JSON es Invalido', 'danger');
        }
        console.error('here')
        return false;
      }
    }

    const toggleModal = (index) => {
      setSelectedRuleIndex(index);
      setModalVisible(!modalVisible);
    };
    
    return <div className="content">
            <div className="react-notification-alert-container">
              <NotificationAlert ref={notificationAlertRef} />
            </div>
             <Loader active={loaderActive} />
             <Modal isOpen={modalVisible} toggle={toggleModal}>
                <ModalHeader>
                  <h2 style={{color: '#000', marginBottom: '0px'}}>Payload Accion</h2>
                </ModalHeader>
                <ModalBody>
                  <FormGroup>
                      <label>Payload</label>
                      <textarea style={{color: '#000'}} className="form-control" placeholder="{ ... }" cols="30" rows="10" defaultValue={payload} name='payload' onChange={onHandleChangePayload}></textarea>
                  </FormGroup>
                  <Button onClick={savePayload} style={{marginTop: '20px'}} className="btn btn-primary">
                    Guardar
                  </Button>
                </ModalBody>
              </Modal>
             <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <h5 className="title">Webhook</h5>
              </CardHeader>
              <CardBody>
                <Form>
                   <Row>
                        <Col className="pr-md-1" md="4">
                            <FormGroup>
                                <label>Nombre</label>
                                <Input placeholder="Nombre del webhook aqui" type="text" name='name' defaultValue={webHook.name} onChange={onHandleChange}/>
                            </FormGroup>
                        </Col>
                        <Col md="4">
                            <FormGroup>
                                <label>Empresa</label>
                                <select className="form-control" name="idcompany" value={webHook.idcompany} onChange={cmbCompanyOnChange}>
                                {
                                    companies?.map((company, index) => 
                                    <option key={index} value={company.idcompany}>{company.name}</option>
                                )} 
                                </select>
                            </FormGroup>
                        </Col>
                        <Col md="4"  className={webHook.userules == 1 ? 'hide' : 'show'}>
                            <FormGroup>
                                <label>Plantilla</label>
                                <select className="form-control" name="wstemplate" value={webHook.wstemplate} onChange={cmbOnChange}>
                                {
                                    wsTemplates?.map((template, index) => 
                                    <option key={index} value={template.idwstemplate}>{template.name}</option>
                                )} 
                                </select>
                            </FormGroup>
                        </Col>
                        <Col md="4">
                            <FormGroup>
                                <label>WhatsApp Account</label>
                                <select className="form-control" name="idwhatsapp_accounts" value={webHook.idwhatsapp_accounts} onChange={cmbOnChange}>
                                {
                                    wsaccounts?.map((wsaccount, index) => 
                                    <option key={index} value={wsaccount.idwhatsapp_accounts}>{wsaccount.displayname}</option>
                                )} 
                                </select>
                            </FormGroup>
                        </Col>
                        <Col className="pr-md-1" md="4">
                            <FormGroup>
                                <label>Url</label>
                                <Input placeholder="Url del webhook aqui" type="text" name='url' defaultValue={webHook.url} onChange={onHandleChange}/>
                            </FormGroup>
                        </Col>
                        <Col md="4">
                        <label>Habilitar uso de reglas</label>
                          <FormGroup check>
                            <Label check>
                              <Input type="checkbox" name='userules'checked={webHook.userules == 1} defaultValue={webHook.userules} onChange={rulesCheckonHandleChange}/>
                              <span className="form-check-sign">
                                <span className="check" />
                              </span>
                              Usar Reglas
                            </Label>
                          </FormGroup>
                        </Col>
                        <Col md="12">
                            <FormGroup>
                                <label>Esquema JSON</label>
                                <textarea spellCheck={false} className="form-control" style={{ borderColor: isaValidJSON ? '#4ee175' : '#e14e4e'}} placeholder="{ ... }" cols="30" rows="10" defaultValue={webHook.jsonschema} id='jsonschema' name='jsonschema' onBlur={jsonOnBlur} onChange={jsonOnChange}></textarea>
                            </FormGroup>
                        </Col>
                        <Col md="12">
                          <hr></hr>
                        </Col> 
                  </Row>
                  <Row className={webHook.userules == 1 ? 'show' : 'hide'}>
                      <Col md="12">
                        <h6 className="title">Reglas</h6>
                      </Col>
                      {rules.map((rule, index) => 
                          <Col key={index} md="12">
                            <Row>
                              <Col md="1" style={{display:'flex', justifyContent: 'center', alignItems: 'center'}}>
                                  <h5>Regla No. {index + 1}</h5>
                              </Col>
    
                              <Col md="2">
                                <FormGroup>
                                    <label>Propiedad</label>
                                    <Input placeholder="Nombre de la propiedad" type="text" name='property' defaultValue={rule.property} onChange={onHandleChangeRule(index)}/>                                    
                                </FormGroup>
                              </Col>
                              <Col md="1" style={{display:'flex', justifyContent: 'center', alignItems: 'end'}}>
                                  <h3>=</h3>
                              </Col>
                              <Col md="2" style={{display:'flex', justifyContent: 'center', alignItems: 'end'}}>
                                  <FormGroup>
                                      <label>Valor</label>
                                      <Input placeholder="Nombre del webhook aqui" type="text" name='value' defaultValue={rule.value} onChange={onHandleChangeRule(index)}/>
                                  </FormGroup>
                              </Col>
                              <Col md="1" style={{display:'flex', justifyContent: 'center', alignItems: 'center'}}>
                                  <h5>Lanzar</h5>
                              </Col>
                              <Col md="2">
                                <FormGroup>
                                    <label>Plantilla</label>
                                    <select className="form-control" name="wstemplate" value={rule.wstemplate} onChange={onHandleChangeRule(index)}>
                                    {
                                        wsTemplates?.map((template, index) => 
                                        <option key={index} value={template.idwstemplate}>{template.name}</option>
                                    )} 
                                    </select>
                                </FormGroup>
                              </Col>
                              <Col md="1" style={{display:'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <Link to="javascript:void(0)" title="Agregar payload" onClick={()=>toggleModal(index)}>
                                  <i className="fa-solid fa-file"></i>
                                </Link>                           
                              </Col>
                              <Col md="1" style={{display:'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <i className="fa-solid fa-trash"></i>
                              </Col>
                            </Row>
                          </Col>
                      )}                                  
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
        <Link style={{backgroundColor: '#5e72e4'}} to="javascript:void(0)" title="Agregar accion" href="#" className={(webHook.userules == 1 ? 'show float-2' : 'hide float-2')} onClick={addRule}>
          <i className="fa-solid fa-plus my-float"></i>
        </Link>
        <Link to="javascript:void(0)" title="Guardar y cerrar" href="#" className="float" onClick={saveChanges}>
          <i className="fa-solid fa-floppy-disk my-float"></i>
        </Link>
    </div>;
}
export default WebHookMessage;