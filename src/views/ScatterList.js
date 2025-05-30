import React, { useState, useEffect, useCallback, useRef } from 'react';
import NotificationAlert from "react-notification-alert";
import { useNavigate, Link } from "react-router-dom";
import Loader from '../components/Loader/Loader';
import * as XLSX from 'xlsx';
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
  Label,
  Pagination,
  PaginationItem,
  PaginationLink
} from "reactstrap";

import { axios } from '../config/https';
import constants from '../util/constans';

function ScatterList() {
  const navigate = useNavigate ();
  const [inputKey, setInputKey] = useState(Date.now());
  const [scatterList, setScatterList] = useState({});
  const [loaderActive, setLoaderActive] = useState(false);
  const [loaderText, setLoaderText] = useState('');
  const [contact, setContact] = useState({});
  const [importContacts, setImportContacts] = useState([]);
  const [bodyparameters, setBodyParameters] = useState([]);
  const [buttonsparameters, setButtonsParameters] = useState([]);
  const [headerp, setHeaderP] = useState({});
  const [scatterListDetails, setScatterListDetails] = useState([]);
  const [companies, setCompanies] = useState([]); 
  const [wsTemplates, setWsTemplates] = useState([]); 
  const [wsaccounts, setWsAccounts] = useState([]); 
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleDocument, setModalVisibleDocuemnt] = useState(false);
  const [modalParameterVisible, setModalParameterVisible] = useState(false);
  const [modalCalendarVisible, setModalCalendarVisible] = useState(false);
  const [currentSL, setCurrentSL] = useState(0);
  const [token, setToken] = useState('');
  const [file, setFile] = useState(undefined);
  const [checkAll, setCheckAll] = useState(true);
  const [maxmessaelist, setMaxmessaelist] = useState(0);
  const [startMessageList, setStartMessageList] = useState(0);
  const [amountMessageList, setAmountMessageList] = useState([]);

  const notificationAlertRef = useRef(null);
  const inputFileref = useRef();

  const onHandleChange = (e) => {
    const { name, value } = e.target;
    setScatterList(pre => ({
      ...pre,
      [name]: value 
    }));
  }

  const toggleModalDocument = () => {
    setModalVisibleDocuemnt(!modalVisibleDocument);
  };

  async function getExtension(filename) {
    return filename.split('.').pop();
  }

  const onHandleChangeCheckbox = index => e => {
    let newArray = [...scatterListDetails];
    const item = newArray[index];
    newArray[index] = { ...item, selected: item.selected === 1 ? 0 : 1 }
    item.selected = item.selected === 1 ? 0 : 1 
    setScatterListDetails(newArray);

    axios.patch(`${constants.apiurl}/api/scatterlistdetailSelected`, item);
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

  const onHandleChangeBodyB = index => e => {
    let newArray = [...buttonsparameters];
    newArray[index] = { sub_type: e.target.value }
    setButtonsParameters(newArray)
  }

  const cmbCompanyOnChange = async (e) => { 
    onHandleChange(e);   
    const { value } = e.target;

    const _wsaccounts = await axios.get(`${constants.apiurl}/api/wsaccountsbyCompany/${value}`);
    setWsAccounts([{idwhatsapp_accounts: -1, displayname: 'Sin Cuenta'}, ..._wsaccounts.data]);

    const _wstemplates = await axios.get(`${constants.apiurl}/api/wstemplatebyCompany/${value}`);
    setWsTemplates([{idwstemplate: -1, name: 'Sin Plantilla'}, ..._wstemplates.data]);        
  }

  const cmbOnChange = async (e) => { 
    onHandleChange(e);        
  }

  useEffect(() => { 
    async function load() {
        setLoaderActive(true)
        const currentScatterListID = localStorage.getItem('currentScatterListID');
        const token = localStorage.getItem(constants.token);
        setToken(token);
        setCurrentSL(currentScatterListID);
        const _scatterList =  await axios.get(`${constants.apiurl}/api/scatterlist/${currentScatterListID}`);
        if(_scatterList && _scatterList.data) {
            setScatterList(_scatterList.data);
            jsonToPObject(_scatterList.data);
        }

        try {
          const _count =  await axios.get(`${constants.apiurl}/api/getCountByScatterList/${currentScatterListID}`);
        if(_count && _count.data) {
          const length = Math.ceil(_count.data.count / 25);
          setMaxmessaelist(length)
          const array = Array.from({ length }, (_, index) => index + 1);
          setAmountMessageList(array)
        }
        } catch (error) {}        

        const _companies = await axios.get(`${constants.apiurl}/api/companies`);
        setCompanies([{idcompany: -1, name: 'Sin Empresa'}, ..._companies.data]);

        const _wstemplates = await axios.get(`${constants.apiurl}/api/wstemplatebyCompany/${_scatterList.data.idcompnay || _companies.data[0].idcompany}`);
        setWsTemplates([{idwstemplate: -1, name: 'Sin Plantilla'}, ..._wstemplates.data]);
 
        const _wsaccounts = await axios.get(`${constants.apiurl}/api/wsaccountsbyCompany/${_scatterList.data.idcompnay || _companies.data[0].idcompany}`);
        setWsAccounts([{idwhatsapp_accounts: -1, displayname: 'Sin Cuenta'}, ..._wsaccounts.data]);
       
        await getScatterlistdetailbyScatterlist();
        setLoaderActive(false)
    }

    load();
  }, []);

  async function saveChanges(event, close = true) {
    event.preventDefault();
    scatterList.json = pObjectToJson();
    await axios.post(`${constants.apiurl}/api/scatterList`, scatterList);
    if(close) {
      navigate('/admin/lists');
    }   
  }

  async function openModalCalendar(event, close = true) {
    event.preventDefault();
    setModalCalendarVisible(!modalCalendarVisible);
  }

  function validateContact(contactInfo) {
    const regexPhone = /^([+]\d{2})?/;
    return (contactInfo.phone && regexPhone.test(contactInfo.phone) && contactInfo.name);
  }

  async function addContact() {
    if(validateContact(contact)) {
      setLoaderActive(true)
      const currentScatterListID = localStorage.getItem('currentScatterListID');
      await axios.post(`${constants.apiurl}/api/scatterlistdetail`, { ...contact, idscatterlist: currentScatterListID });
      await getScatterlistdetailbyScatterlist(); 
      setContact({});
      toggleModal();
      setLoaderActive(false)
    }else {
      sendNotification('Ocurrio un error guardarndo el contacto verifica que el telefono y el numero sean correctos', 'danger');
    }    
  }

  async function addParameterBody() {
    setBodyParameters(oldArray => [...oldArray, {text: ''}]);
  }

  async function addParameterButton() {
    setButtonsParameters(oldArray => [...oldArray, {sub_type: ''}]);
  }

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

  async function getScatterlistdetailbyScatterlist(pstart = 0) {
    setStartMessageList(pstart > 0 ? pstart : 0)
    const currentScatterListID = localStorage.getItem('currentScatterListID');
    const _scatterListDetails =  await axios.get(`${constants.apiurl}/api/scatterlistdetailbyScatterlist/${currentScatterListID}?pstart=${pstart}`);
    if(_scatterListDetails.data) {
      setScatterListDetails(_scatterListDetails.data);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (window.confirm('¿Estas seguro que deseas enviar la difusión con esta lista?')) {
        await saveChanges(event, false);
        await axios.post(`${constants.apiurl}/api/sendscatterlist`, {id: scatterList.idscatterlist}).then(async (result) => {
            sendNotification('Lista enviada');
            setLoaderActive(true);
            await getScatterlistdetailbyScatterlist();
            setLoaderActive(false);
        });        
    } 
  }

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  async function checkAllChecks() {
    const _checkAll = !checkAll;
    const currentScatterListID = localStorage.getItem('currentScatterListID');
    setCheckAll(_checkAll);
    const _selectedInt = _checkAll ? 1 : 0;
    const newList = scatterListDetails.map(sld =>{ return {...sld, selected: _selectedInt}});
    console.log(newList);
    axios.patch(`${constants.apiurl}/api/scatterlistdetailSelectedAll`, {selected: _selectedInt, idscatterlist:currentScatterListID});
    setScatterListDetails([...newList]);
  };

  const openFile = () => {
    if (inputFileref.current) {
      console.log(inputFileref.current)
      inputFileref.current.click();
    }
  };

  const OpenContactforUpdate= (event, contact) => {
    event.preventDefault();
    toggleModal();
    setContact(contact);
  }

  const toggleParameterModal = () => {
    const isVisible = !modalParameterVisible;

    setModalParameterVisible(isVisible);
  };

  const jsonToPObject = (_scatterList) => {
    if(_scatterList.json) {
      const json =  JSON.parse(_scatterList.json);
      const header = json.find(element => element.type === 'header');
      if(header) {
        setHeaderP({
          type: header.parameters[0].type,
          link: header.parameters[0].link,
          text: header.parameters[0].text
        })
      }

      const body = json.find(element => element.type === 'body');
      if(body) {
        const _bodyparameters = [];
        for (const parameter of body.parameters) {
          _bodyparameters.push(parameter);
        }
        setBodyParameters(_bodyparameters);
      }

      const buttons = json.filter(element => element.type === 'button');
      if(buttons && Array.isArray(buttons) && buttons.length > 0) {
        const _buttonsparameters = [];
        for (const button of buttons) {
          _buttonsparameters.push(button);
        }
        setButtonsParameters(_buttonsparameters);
        
      }
    }
  }

  const pObjectToJson = () => {
    const json = [];
    if(headerp && headerp.link) {
      let headerelement = { type : 'header', parameters: []};
      let headerelementp = {};

      headerelementp.type = headerp.type || 'image';
      headerelementp.link = headerp.link;

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

    if(buttonsparameters && buttonsparameters.length > 0) {
      let buttonelement = { type : 'button', parameters: []};
      let cont = 0;
      for (const buttonparameter of buttonsparameters) {
        buttonelement.sub_type = buttonparameter.sub_type;
        buttonelement.index = cont;
        buttonelement.parameters.push({
            type: 'action',
            action: {}
        });
        cont++;
      }
      json.push(buttonelement);
    }

    return JSON.stringify(json)
  }

  const onHandleChangeFile = (event) => {
    const file = event.target.files[0];
    setFile(file);
    if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const sheetName = workbook.SheetNames[0]; // Assuming the first sheet
            const worksheet = workbook.Sheets[sheetName];

            console.log(worksheet['!ref']);

            // Convert the worksheet into a JSON array
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            setImportContacts(jsonData)
            console.log(jsonData);

            //setImportContacts(processedData);
        };

        reader.readAsArrayBuffer(file);
    }    
  }

  const removeFile = () => {
    setFile(undefined);
    inputFileref.current.value = '';
    setInputKey(Date.now());
  }

  const addFile = async () => {
    if(importContacts && importContacts.length > 0) {
      const amount = importContacts.length;
      const currentScatterListID = localStorage.getItem('currentScatterListID');
      setLoaderActive(true);
      for (let index = 0; index < amount; index++) {
        const element = importContacts[index];
        if(element && element.length > 1 && element[0] && element[1]) {
          await axios.post(`${constants.apiurl}/api/scatterlistdetail`, { 
            ...{ 
              name: element[0],  
              phone:fixNumber(element[1]),
              extra1: element.length > 2 ? element[2]: '',
              extra2: element.length > 3 ? element[3]: ''
            }, 
              idscatterlist: currentScatterListID });
        }  
        setLoaderText(`Importado contacto #${index+1} de ${amount}`);
      }      
      await getScatterlistdetailbyScatterlist();
      setLoaderActive(false)
    }
    setModalVisibleDocuemnt(false);
    setFile(undefined);
    inputFileref.current.value = '';
    setInputKey(Date.now());
    setLoaderText('');
  }

  const fixNumber = (number) =>{
    return `${number}`.replace(/[^0-9]/g, '');
  }

  return (
    <>    
      <div className="content">
      <Loader active={loaderActive} text={loaderText} />
        <div className="react-notification-alert-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        <Modal isOpen={modalCalendarVisible} toggle={openModalCalendar}>
          <ModalHeader>
            <h3 style={{color: '#000', marginBottom: '0px'}}>Programar envio</h3>
          </ModalHeader>
          <ModalBody>            
          <FormGroup>
            <Label for="exampleDate">
              Date
            </Label>
            <Input
              className=''
              id="exampleDate"
              name="date"
              placeholder="date placeholder"
              type="date"
            />
          </FormGroup>
          <FormGroup>
            <Label for="exampleTime">
              Time
            </Label>
            <Input
              id="exampleTime"
              name="time"
              placeholder="time placeholder"
              type="time"
            />
           </FormGroup>
          </ModalBody>
        </Modal>
        <Modal isOpen={modalVisibleDocument} toggle={toggleModalDocument}>
          <ModalHeader>
            <h2 style={{color: '#000', marginBottom: '0px'}}>Documento</h2>
          </ModalHeader>
          <ModalBody>            
          <div className='file-upload show'>
            <div className={!file ? 'show' : 'hide'}>
              <button className="file-upload-btn" type="button" onClick={openFile}>Escoger documento</button>
              <div className="image-upload-wrap">
                <input 
                  className="file-upload-input" 
                  key={inputKey} 
                  ref={inputFileref} 
                  accept=".xls, .xlsx" 
                  title="Escoge el documento" 
                  placeholder="Sube tu documento" 
                  type="file" 
                  name='file' 
                  single onChange={onHandleChangeFile}/>
                <div className="drag-text">              
                  <h3>Arrastra el documento aqui</h3>
                </div>
            </div>            
            </div>
            <div  md="6" sm="12" className={file ? 'file-upload-content show' : 'hide'} >
              <Label style={{marginTop: '15px'}}>{file?.name}</Label>
              <button type="button" onClick={removeFile} className="remove-image">Eliminar <span className="image-title">Documento</span></button>
            </div>
            <div className={file ? 'file-upload-content show' : 'hide'} >
              <button type="button" onClick={addFile} className="add-image"><span className="image-title">Importar</span></button>
            </div>
          </div>
          </ModalBody>
        </Modal>
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
            <FormGroup>
                <label>Extra 1</label>
                <Input placeholder="Escriba el parametro extra aqui" className="form-control form-control-lg color_black" type="text" name='extra1' defaultValue={contact.extra1} onChange={onHandleChangeContact}/>
            </FormGroup>

            <FormGroup>
                <label>Extra 2</label>
                <Input placeholder="Escriba el parametro extra aqui" className="form-control form-control-lg color_black" type="text" name='extra2' defaultValue={contact.extra2} onChange={onHandleChangeContact}/>
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
                <select className="form-control color_black" name='type' value={headerp.type} onChange={onHandleChangeHeader}>
                  <option selected value='image'>Imagen</option>
                  <option value='video'>Video</option>
                  <option value='document'>Documento</option>
                </select>
                <Input placeholder="Link" className="form-control form-control-lg color_black" style={{marginTop: '10px'}}  type="text" name='link' defaultValue={headerp.link} onChange={onHandleChangeHeader}/>
                <Input placeholder="Texto" className="form-control form-control-lg color_black" style={{marginTop: '10px'}} type="text" name='text' defaultValue={headerp.text} onChange={onHandleChangeHeader}/>
            </FormGroup>
            <hr></hr>       
            <FormGroup>
                <div style={{display:'flex', justifyContent: 'space-between'}}> 
                  <span>Body</span> 
                  <Button onClick={addParameterBody} className="btn btn-primary">
                    Agregar parametro
                  </Button>
                </div>                
                <hr></hr>                
                {
                  bodyparameters?.map((parameter, index) => 
                    <textarea key={index} className="form-control form-control-lg color_black" style={{marginTop: '10px'}} placeholder="Texto" cols="30" rows="10" defaultValue={parameter.text} name={`body${index}`} onChange={onHandleChangeBodyP(index)}></textarea>
                   
                )}                  
            </FormGroup>
            <hr></hr>       
            <FormGroup>
                <div style={{display:'flex', justifyContent: 'space-between'}}> 
                  <span>Botons</span> 
                  <Button onClick={addParameterButton} className="btn btn-primary">
                  Agregar boton
                  </Button>
                </div>  
                <hr></hr>       
                {
                  buttonsparameters?.map((parameter, index) => 
                    <Input key={index} className="form-control form-control-lg color_black" placeholder="Escribe el subtipo" style={{marginTop: '10px'}} type="text" name={`button${index}`} defaultValue={parameter.sub_type} onChange={onHandleChangeBodyB(index)}/>
                )}
                <hr></hr>
            </FormGroup>

            <ModalFooter>
              <Button onClick={toggleParameterModal} style={{marginTop: '20px'}} className="btn btn-primary">
                Guardar
              </Button>
            </ModalFooter>   
          </ModalBody>
        </Modal>
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <h5 className="title">Lista de difusión</h5>
              </CardHeader>
              <CardBody>
                <Form>
                   <Row>
                        <Col className="pr-md-1" md="6">
                            <FormGroup>
                                <label>Nombre</label>
                                <Input placeholder="Nombre de la lista aqui" type="text" name='name' defaultValue={scatterList.name} onChange={onHandleChange}/>
                            </FormGroup>
                        </Col>
                        <Col md="6">
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
                        <Col md="6">
                            <FormGroup>
                                <label>Plantilla</label>
                                <select className="form-control" name="idwstemplate" value={scatterList.idwstemplate} onChange={cmbOnChange}>
                                {
                                    wsTemplates?.map((wstemplate, index) => 
                                    <option key={index} value={wstemplate.idwstemplate}>{wstemplate.name}</option>
                                )} 
                                </select>
                            </FormGroup>
                        </Col>
                        <Col md="6">
                            <FormGroup>
                                <label>WhatsApp Account</label>
                                <select className="form-control" name="idwhatsapp_accounts" value={scatterList.idwhatsapp_accounts} onChange={cmbOnChange}>
                                {
                                    wsaccounts?.map((wsaccount, index) => 
                                    <option key={index} value={wsaccount.idwhatsapp_accounts}>{wsaccount.displayname}</option>
                                )} 
                                </select>
                            </FormGroup>
                        </Col>
                  </Row>

                  <Row>
                    <Col style={{display: 'flex', justifyContent: 'space-between'}} md="12">
                      <div>
                        <Button title="Agregar contacto" onClick={toggleModal} className="btn btn-primary">
                          <i className="fa fa-user-plus" />
                        </Button>
                        <Button title="Agregar lista de contactos" onClick={toggleModalDocument} className="btn btn-primary">
                          <i className="fa fa-upload" />
                        </Button>                        
                      </div>
                     
                      <Button title="Agregar parametros" onClick={toggleParameterModal} className="btn btn-primary">
                        Agregar parametos
                      </Button>
                    </Col>
                    <Col md="12">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>  
                                        <th>
                                            <FormGroup check>
                                              <Label check>
                                                <Input type="checkbox" name='checkall' defaultChecked={checkAll} onChange={checkAllChecks}/>
                                                <span className="form-check-sign">
                                                  <span className="check" />
                                                </span>
                                              </Label>
                                            </FormGroup>
                                        </th>
                                        <th>#</th>                           
                                        <th>Nombre</th>
                                        <th>Telefono</th>
                                        <th>Extra 1</th>
                                        <th>Extra 2</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scatterListDetails?.map((scatterListDetail, index) => 
                                        <tr key={index}>
                                            <td> 
                                              <FormGroup check>
                                                <Label check>
                                                  <Input type="checkbox" name={`inputSelected_${index}`} checked={scatterListDetail.selected === 1 ? true : false} defaultChecked={scatterListDetail.selected === 1 ? true : false}  onChange={onHandleChangeCheckbox(index)}/>
                                                  <span className="form-check-sign">
                                                    <span className="check" />
                                                  </span>
                                                </Label>
                                              </FormGroup>
                                            </td>
                                            <td> <Link to="/" onClick={(e)=>{OpenContactforUpdate(e, scatterListDetail)}}>{(index + 1) + startMessageList}</Link></td>
                                            <td> <Link to="/" onClick={(e)=>{OpenContactforUpdate(e, scatterListDetail)}}>{scatterListDetail.name}</Link></td>
                                            <td> <Link to="/" onClick={(e)=>{OpenContactforUpdate(e, scatterListDetail)}}>{scatterListDetail.phone}</Link></td>
                                            <td> <Link to="/" onClick={(e)=>{OpenContactforUpdate(e, scatterListDetail)}}>{scatterListDetail.extra1}</Link></td>
                                            <td> <Link to="/" onClick={(e)=>{OpenContactforUpdate(e, scatterListDetail)}}>{scatterListDetail.extra2}</Link></td>
                                            <td> 
                                                {getIcon(scatterListDetail)}
                                            </td>
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
              <div style={{width:'90%', overflowX:'auto', display: 'flex', justifyContent: 'center'}}>
                <Pagination>
                    <PaginationItem>
                        <PaginationLink
                        onClick={() => {getScatterlistdetailbyScatterlist(0)}}
                        first
                        href="javascript:void(0)"
                        />
                    </PaginationItem>
                    {
                        amountMessageList.map((item, index) => 
                            <PaginationItem  key={index}>
                                <PaginationLink 
                                href="javascript:void(0)"
                                onClick={() => {getScatterlistdetailbyScatterlist(index * 25)}}
                                >
                                {index + 1}
                                </PaginationLink>
                        </PaginationItem> 
                        )
                    }                    
                    <PaginationItem>
                        <PaginationLink
                        onClick={() => {getScatterlistdetailbyScatterlist(maxmessaelist)}}
                        href="javascript:void(0)"
                        last
                        />
                    </PaginationItem>
                </Pagination>
                </div>       
              </CardFooter>
            </Card>
          </Col>
        </Row>
        <Link to="#" title="Programar envio" className="float-4" onClick={openModalCalendar}>
            <i className="fa-solid fa-calendar-plus my-float"></i>
          </Link>      
        <Link target="link" to={`${constants.apiurl}/api/downloadReportExcel/${token}/${currentSL}`} title="Descargar reporte" className="float-3">
          <i className="fa-solid fa-file-arrow-down my-float"></i>
        </Link>
        <Link to="/" title="Enviar mensaje" href="#" className="float-2" onClick={sendMessage}>
          <i className="fa-solid fa-paper-plane my-float"></i>
        </Link>
        <Link to="/" title="Guardar y cerrar" href="#" className="float" onClick={saveChanges}>
          <i className="fa-solid fa-floppy-disk my-float"></i>
        </Link>
      </div>
    </>
  );
}

const getIcon = (scatterListDetail) => { 
  if(scatterListDetail.read == 1) {
    return <i title='Leido' style={{color: '#5e72e4'}} className="fa-solid fa-check-double"></i>
  }

  if(scatterListDetail.failed == 1) {
    return <i title='Fallido' style={{color: '#f5365c'}} className="fa-solid fa-xmark"></i>
  }

  if(scatterListDetail.delivered == 1) {
    return <i title='Entregado' className="fa-solid fa-check"></i>
  }

  return <i title='No enviado' className="fa-solid fa-minus"></i>
 
} 

export default ScatterList;
