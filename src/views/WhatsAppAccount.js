import React, { useState, useEffect, useRef } from 'react';
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
  ModalHeader,
  Label
} from "reactstrap";

import { axios } from '../config/https';
import constants from '../util/constans';
import { getUserInfo } from 'util/localStorageInfo';
import { analizePdf } from 'util/files';
import { analizeExcel } from 'util/files';

function WhatsAppAccount() {
  const navigate = useNavigate ();
  const [whatsAppAccount, setWhatsAppAccount] = useState({});
  const [documents, setDocuments] = useState([]); 
  const [modalVisible, setModalVisible] = useState(false);
  const [inputKey, setInputKey] = useState(Date.now());
  const [file, setFile] = useState(undefined);
  const [documentImport, setDocumentImport] = useState({});
  const [currentWhatsAppAccountID, setCurrentWhatsAppAccountID] = useState(0);
  const inputFileref = useRef(null);

  const onHandleChange = (e) => {
    const { name, value } = e.target;
    setWhatsAppAccount(pre => ({
      ...pre,
      [name]: value 
    }));
  }

  const onHandleChangeDocument = (e) => {
    const { name, value } = e.target;
    setDocumentImport(pre => ({
      ...pre,
      [name]: value 
    }));
  }

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  useEffect(() => { 
    async function load() {
        const _currentWhatsAppAccountID = localStorage.getItem('currentWhatsAppAccountID');
        setCurrentWhatsAppAccountID(_currentWhatsAppAccountID);

        const _whatsAppAccount =  await axios.get(`${constants.apiurl}/api/wsaccounts/${_currentWhatsAppAccountID}`);
        if(_whatsAppAccount.data) {
            setWhatsAppAccount(_whatsAppAccount.data);
            getDocuments(_currentWhatsAppAccountID);
        } 
    }

    load();
  }, []);

  function saveChanges() {
    console.log(whatsAppAccount)
    axios.post(`${constants.apiurl}/api/wsaccounts`, whatsAppAccount).then(async (result) => {
        navigate('/admin/company');
    });
  }

  function saveDocuments(document) {
    console.log(document)
    axios.post(`${constants.apiurl}/api/documentstrain`, document).then(async (result) => {
        getDocuments(document.idwhatsapp_accounts);
    });
  }

  async function getDocuments(_currentWhatsAppAccountID) {
    const _documents =  await axios.get(`${constants.apiurl}/api/documentstrain/${_currentWhatsAppAccountID}`);
    setDocuments(_documents.data)
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

  const openFile = () => {
    if (inputFileref.current) {
      inputFileref.current.click();
    }
  };

  const onHandleChangeFile = (event) => {
    const file = event.target.files[0];

    if (file) {
        console.log(file)
        setFile(file);        
    }        
  }

  const removeFile = () => {
    setFile(undefined);
    inputFileref.current.value = '';
    setInputKey(Date.now());
  }

  async function getExtension(filename) {
    return filename.split('.').pop();
  }

  const addFile = async () => {
    if(file) {
      const extension = await getExtension(file.name);
      let result = '';
      if(extension == 'pdf') {
        result = await analizePdf(file);
        console.log(result);
      } else {
        result = await analizeExcel(file);
        console.log(result);
      }
      documentImport.text = result;
      documentImport.idwhatsapp_accounts = currentWhatsAppAccountID;
      saveDocuments(documentImport)
    }
    setFile(undefined);
    inputFileref.current.value = '';
    setInputKey(Date.now());
  }

  return (
    <>
      <div className="content">
      <Modal isOpen={modalVisible} toggle={toggleModal}>
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
                  accept=".xls, .xlsx, .pdf" 
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
            <div className={file ? 'show' : 'hide'} >
              <Row>
                <Col md="12">
                    <FormGroup>
                        <label>Titulo</label>
                        <Input style={{color:'#000'}} placeholder="Escribe el titulo" type="text" name='name' defaultValue={documentImport.name} onChange={onHandleChangeDocument}/>
                    </FormGroup>
                    <FormGroup>
                        <label>Contexto</label>
                        <textarea style={{color:'#000'}} className="form-control" placeholder="Ingresa el contexto" cols="30" rows="5" defaultValue={whatsAppAccount.description} name='description' onChange={onHandleChangeDocument}></textarea>
                      </FormGroup>
                </Col>                
              </Row>
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
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <h6 className="title">Cuenta de WhatsApp</h6>
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
                <div style={{display:'flex', justifyContent: 'space-between'}}>
                    <h5 className="title">Documentos para entrenamiento</h5>
                    <Button className="btn-fill" color="primary" title='Agregar documento' type="button" onClick={toggleModal}>
                      <i className="fa fa-file-circle-plus"></i>
                    </Button>                    
                </div>
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
                            {documents?.map((document, index) => 
                                <tr key={index}>
                                    <td>    
                                      <Link to="javascript:void(0)">{index + 1}</Link>                     
                                    </td>
                                    <td> <Link to="javascript:void(0)">{document.name}</Link></td>
                                    <td> <Link to="javascript:void(0)">{document.description}</Link></td>
                                    <td> <Link to="javascript:void(0)">{document.file}</Link></td>
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
