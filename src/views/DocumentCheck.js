import React, { useState, useEffect, useRef } from 'react';
import NotificationAlert from "react-notification-alert";
import { useNavigate, Link } from "react-router-dom";
import Loader from '../components/Loader/Loader';
import { getCompanyId } from 'util/localStorageInfo';
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
  Label,
  ModalBody,
  ModalHeader,
  ListGroup,
  ListGroupItem
} from "reactstrap";

import { axios } from '../config/https';
import constants from '../util/constans';

function DocumentCheck() {
   const navigate = useNavigate ();
   const [inputKey, setInputKey] = useState(Date.now());
   const [document, setDocument] = useState({});
   const [loaderActive, setLoaderActive] = useState(false);
   const [loaderText, setLoaderText] = useState('');
   const [documents, setDocuments] = useState([]);
   const [companies, setCompanies] = useState([]);
   const [rules, setRules] = useState([]);
   const [currentSL, setCurrentSL] = useState(0);
   const [token, setToken] = useState('');
   const [files, setFiles] = useState([]);
   const [modalVisible, setModalVisible] = useState(false);
   const [modalVisibleRules, setModalVisibleRules] = useState(false);
   const [verificationResult, setVerificationResult] = useState({});
   const [modalVisibleDocument, setModalVisibleDocuemnt] = useState(false);
   const [companyId, setCompanyId] = useState(undefined);

  const notificationAlertRef = useRef(null);
  const inputFileref = useRef();

  const onHandleChange = (e) => {
    const { name, value } = e.target;
    setDocument(pre => ({
      ...pre,
      [name]: value 
    }));
  }

  const cmbCompanyOnChange = async (e) => { 
    onHandleChange(e);   
    const { value } = e.target;
  } 

  useEffect(() => { 
    async function load() {
        setLoaderActive(true)
        const currentVerificatorID = localStorage.getItem('currentVerificatorID');
        const token = localStorage.getItem(constants.token);
        setToken(token);
        setCurrentSL(currentVerificatorID);
        const _document =  await axios.get(`${constants.apiurl}/api/verificators/${currentVerificatorID}`);
        if(_document && _document.data) {
            setDocument(_document.data);

            setCompanyId(getCompanyId());

            const _rules = await axios.get(`${constants.apiurl}/api/rulesbyVerificator/${currentVerificatorID}`);
            setRules(_rules.data);

            const _documents = await axios.get(`${constants.apiurl}/api/documents-checkbyVerificator/${currentVerificatorID}`);
            setDocuments(_documents.data);
        }     

        const _companies = await axios.get(`${constants.apiurl}/api/companies`);
        setCompanies([{idcompany: -1, name: 'Sin Empresa'}, ..._companies.data]);
        
        setLoaderActive(false)
    }

    load();
  }, []);

  async function startVerification() {
    for (const file of files) {
      setLoaderActive(true);
      toggleModalDocument()
      let formData = new FormData();
          formData.append("file", file);                       
          const documentfile = await axios.post(`${constants.apiurl}/api/aws/uploaddocumentcheck/documentscheck/${document.idverificator}`, formData, { headers: {"Content-Type": "multipart/form-data"}}).catch(e => setLoaderActive(false));
          await axios.post(`${constants.apiurl}/api/documents-check/analize`, { url : documentfile.data.url, idverificator: document.idverificator }).catch(e => setLoaderActive(false));
         
      setLoaderActive(false);
    }

    const _documents = await axios.get(`${constants.apiurl}/api/documents-checkbyVerificator/${document.idverificator}`);
    setDocuments(_documents.data);

    setFiles(undefined);
    setFiles([]);
    inputFileref.current.value = '';
    setInputKey(Date.now());   
  }

  async function saveChanges(event, close = true) {
    event.preventDefault();
    await axios.post(`${constants.apiurl}/api/document`, document);
    if(close) {
      navigate('/admin/lists');
    }
  }  

  const onHandleChangeFile = (e) => {
    setFiles(Array.from(e.target.files));  
  }

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const toggleModalRules = () => {
    setModalVisibleRules(!modalVisibleRules);
  };

  const toggleModalDocument = () => {
    setModalVisibleDocuemnt(!modalVisibleDocument);
  };

  const openFile = () => {
    if (inputFileref.current) {
      console.log(inputFileref.current)
      inputFileref.current.click();
    }
  };

  const removeFile = () => {
    setFiles(undefined);
    setFiles([]);
    inputFileref.current.value = '';
    setInputKey(Date.now());
  }

  const getIcon = (value, size = 1) => { 
    if(value >=0 && value <= 30) {
        return <i style={{color:'#f5365c',fontSize:`${size}em`}} className="fa-solid fa-xmark"></i>        
    } else if(value >30 && value < 70) {
        return <i style={{color:'#ff8d72',fontSize:`${size}em`}}className="fa-solid fa-triangle-exclamation"></i>
    } else {
        return <i style={{color:'#2dce89',fontSize:`${size}em`}} className="fa-solid fa-circle-check"></i>
    }    
  }  

  const removeFileFromArray = (indexToRemove) => {   
    setFiles(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
    console.log(files)
  }

  const addRule = () => {
    setRules(prevItems => [...prevItems, {name:'', prompt: ''}]);
  }

  const saveRules = async () => {
    for (const rule of rules) {
      rule.idverificator = document.idverificator
      await axios.post(`${constants.apiurl}/api/rules`, rule);
    }
    toggleModalRules()
  }  

  const onHandleChangeRule = index => e => {
    const { name, value } = e.target;
    let newArray = [...rules];

    newArray[index] = { ...newArray[index], [name]: value }
    setRules(newArray)
  }

  const opendocumentinfo  = async (documentInfo) => {
    const _rulesdoc = await axios.get(`${constants.apiurl}/api/documents-check/${documentInfo.iddocumentscheck}/rules`);
    documentInfo.rulesdoc = _rulesdoc.data;
    setVerificationResult(documentInfo)
    toggleModal()
  }  


  const removeRule = async () => {  }  

  return (
    <>    
      <div className="content">
      <Loader active={loaderActive} text={loaderText} />
        <div className="react-notification-alert-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        <Modal isOpen={modalVisibleDocument} toggle={toggleModalDocument}>
          <ModalHeader>
            <h2 style={{color: '#000', marginBottom: '0px'}}>Documentos</h2>
          </ModalHeader>
          <ModalBody>            
          <div className='file-upload show'>
            <div className={files?.length == 0 ? 'show' : 'hide'}>
              <button className="file-upload-btn" type="button" onClick={openFile}>Escoge los documentos</button>
              <div className="image-upload-wrap">
                <input 
                  className="file-upload-input" 
                  key={inputKey} 
                  ref={inputFileref} 
                  multiple = {true}
                  accept=".pdf, .png, .jpg, jpeg" 
                  title="Escoge los documento" 
                  placeholder="Sube tus documento" 
                  type="file" 
                  name='file' 
                  single onChange={onHandleChangeFile}/>
                <div className="drag-text">              
                  <h3>Arrastra los documento aqui</h3>
                </div>
              </div>            
            </div>
            <div  md="6" sm="12" className={files?.length > 0 ? 'file-upload-content show' : 'hide'} >
              <ListGroup>
                {files?.map((file, index) => 
                    <ListGroupItem key={index} style={{color:'#000', textAlign:'left', display:'flex', justifyContent:'space-between'}}>
                      <span>{file.name}</span>
                      <span onClick={()=> removeFileFromArray(index)} style={{color:'#cd4535', cursor:'pointer'}}>
                        <i className="fa-solid fa-trash-can"></i>
                      </span>
                    </ListGroupItem>
                )}               
              </ListGroup>
            </div>
            <div  md="6" sm="12" className={files?.length > 0 ? 'file-upload-content show' : 'hide'} >
              <Label style={{marginTop: '15px'}}>{files?.name}</Label>
              <button title='Elimninar todos los documentos' type="button" onClick={removeFile} className="remove-image">
                <i className="fa-solid fa-trash-arrow-up"></i>
              </button>
            </div>
            <div className={files ? 'file-upload-content show' : 'hide'} >
              <button type="button" onClick={startVerification} className="add-image"><span className="image-title">Iniciar Analisis</span></button>
            </div>
          </div>
          </ModalBody>
        </Modal>
        <Modal isOpen={modalVisible} toggle={toggleModal}>
            <ModalHeader>
            <h2 style={{color: '#000', marginBottom: '0px'}}>Resultado Verificación</h2>
            </ModalHeader>
            <ModalBody>
                <Row>
                    <Col md="12" style={{display:'flex', justifyContent:'center'}}>
                        {getIcon(verificationResult?.status, 5)}                         
                    </Col>
                </Row>

                <Row>
                    <Col md="12">
                        <table className="table table-hover">                               
                            <tbody>
                                {verificationResult?.rulesdoc?.map((ruledoc, index) => 
                                    <tr key={index}>
                                        <td> <Link to="/" >{ruledoc.rulename}:</Link></td>
                                        <td> <Link to="/" style={{color:'#000'}}>{ruledoc.resulttext}</Link></td>
                                    </tr>
                                )}                   
                            </tbody>          
                        </table>
                    </Col>
                    <Col md="12">
                        <p>
                            {verificationResult?.summary}
                        </p>
                    </Col>
                </Row>

                <Button onClick={toggleModal} style={{marginTop: '20px'}} className="btn btn-primary">
                    Cerrar
                </Button>
            </ModalBody>
        </Modal>
        <Modal isOpen={modalVisibleRules} toggle={toggleModalRules} fullscreen>
            <ModalHeader>
            <h2 style={{color: '#000', marginBottom: '0px'}}>Reglas</h2>
            </ModalHeader>
            <ModalBody>
                {
                  rules?.map((rule, index) => 
                    <Row key={index}>
                      <Col md="5">
                          <FormGroup>
                              <label>Nombre</label>
                              <Input style={{color:'#000'}} onChange={onHandleChangeRule(index)} placeholder="Nombre de la regla aqui" type="text" name='name' defaultValue={rule.name}/>
                          </FormGroup>
                      </Col>   
                      <Col md="6">
                          <FormGroup>
                              <label>Descripcion de la regla</label>
                              <Input style={{color:'#000'}} onChange={onHandleChangeRule(index)} placeholder="Descripcion de la regla aqui" type="text" name='prompt' defaultValue={rule.prompt}/>
                          </FormGroup>
                      </Col>  
                      <Col md="1">
                        <FormGroup>
                            <label> </label>
                            <span onClick={()=> removeRule(index)} style={{color:'#cd4535', cursor:'pointer'}}>
                              <i className="fa-solid fa-trash-can"></i>
                            </span>
                        </FormGroup>
                        
                      </Col>              
                    </Row>
                  )
                } 
               
                <Row style={{display:'flex', justifyContent: 'space-between'}}>
                  <Button onClick={addRule} style={{marginTop: '20px'}} className="btn btn-primary">
                      Agregar
                  </Button>
                  <Button onClick={saveRules} style={{marginTop: '20px'}} className="btn btn-primary">
                      Guardar
                  </Button>
                </Row>
            </ModalBody>
        </Modal>
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <h5 className="title">Verificación de Documentos</h5>
              </CardHeader>
              <CardBody>
                <Form>
                   <Row>
                        <Col className="pr-md-1" md="6">
                            <FormGroup>
                                <label>Nombre</label>
                                <Input placeholder="Nombre de la lista aqui" type="text" name='name' defaultValue={document.name} onChange={onHandleChange}/>
                            </FormGroup>
                        </Col>
                        <Col md="6">
                          {
                            !companyId && 
                            <FormGroup>
                                <label>Empresa</label>
                                <select className="form-control" name="idcompany" value={document.idcompany} onChange={cmbCompanyOnChange}>
                                {
                                    companies?.map((company, index) => 
                                    <option key={index} value={company.idcompany}>{company.name}</option>
                                )} 
                                </select>
                            </FormGroup>
                          } 
                        </Col>
                  </Row>

                  <Row>
                    <Col style={{display: 'flex', justifyContent: 'space-between'}} md="12">
                      <div>       
                        <Button title="Agregar lista de contactos" onClick={toggleModalDocument} className="btn btn-primary">
                          <i className="fa fa-upload" />
                        </Button>
                      </div>
                      
                       <Button onClick={toggleModalRules} className="btn btn-primary">
                           Reglas
                        </Button>
                    </Col>
                    <Col md="12">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr> 
                                        <th>#</th>    
                                        <th>Nombre</th>                       
                                        <th>Documento</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents?.map((document, index) => 
                                        <tr key={index}>
                                            <td> <Link to="#" >{(index + 1)}</Link></td>
                                            <td> <Link to="#" >{document.name}</Link></td>
                                            <td> <Link target='_blank' to={document.url}><i title='Ver documento' className="fa-solid fa-file"></i></Link></td>
                                            <td> <Link to="#" onClick={()=> {opendocumentinfo(document)}} >{getIcon(document.status)}</Link></td>                                            
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
                 
              </CardFooter>
            </Card>
          </Col>
        </Row>
        <Link to="#" title="Guardar y cerrar" href="#" className="float" onClick={saveChanges}>
          <i className="fa-solid fa-floppy-disk my-float"></i>
        </Link>
      </div>
    </>
  );
}

export default DocumentCheck;
