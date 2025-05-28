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
import htmlbaseemail from '../util/emailTemplate';
import Loader from '../components/Loader/Loader';
import { getCompanyId } from 'util/localStorageInfo';

function EmailTemplate() {
  const navigate = useNavigate ();
  const [emailtemplate, setEmailTemplate] = useState({ isHtml : 0 });
  const [companies, setCompanies] = useState([]); 
  const [companyId, setCompanyId] = useState(undefined);
  const [emailContent, setEmailContent] = useState(htmlbaseemail); 
  const [textContent, setTextContent] = useState(''); 
  const [loaderActive, setLoaderActive] = useState(false);

  const onHandleChange = (e) => {
    const { name, value } = e.target;
    setEmailTemplate(pre => ({
      ...pre,
      [name]: value 
    }));
  }  

  const cmbEmailTypeOnChange = async (e) => { 
    onHandleChange(e);        
  }

  const cmbCompanyOnChange = async (e) => { 
    onHandleChange(e);        
  }

  useEffect(() => { 
    async function load() {
        const _companies = await axios.get(`${constants.apiurl}/api/companies`);
        setCompanies([{idcompany: -1, name: 'Sin Empresa'}, ..._companies.data]);

        setCompanyId(getCompanyId());

        const currentWsTemplateID = localStorage.getItem('currentWsTemplateID');
        if(currentWsTemplateID && currentWsTemplateID  != 0) {
            const _emailtemplate =  await axios.get(`${constants.apiurl}/api/emailtemplate/${currentWsTemplateID}`);
            if(_emailtemplate.data) {
                setEmailTemplate(_emailtemplate.data);
                setTextContent(_emailtemplate.data.text)
            }
        }
    }

    load();
  }, []);

  function saveChanges(close = true) {
    axios.post(`${constants.apiurl}/api/emailtemplate`, emailtemplate).then(async (result) => {
        if(close) {
          navigate('/admin/emailtemplates');
        }        
    });
  }

  function sendPrompt(close = true) {
    setLoaderActive(true)
    axios.post(`${constants.apiurl}/api/improveaiemail`, {
        isHtml: emailtemplate.isHtml,
        systemContent: emailtemplate.prompt,
        text: textContent,
        html: emailContent
    }).then(async (result) => {
        setLoaderActive(false)
        if(emailtemplate.isHtml == 1) {
            const html = result.data.replace(/^```html\s*\n/, "").replace(/```$/, "");
            setEmailContent(html)   
        } else {            
            setTextContent(result.data)   
        }
         
    }).catch(e => {
        setLoaderActive(false)
    });
  }

  return (
    <>
      <div className="content">
      <Loader active={loaderActive} text={'Procesando la solicitud realizando cambios'}/>
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <h5 className="title">Plantilla de Email</h5>
              </CardHeader>
              <CardBody>
                <Form>
                   <Row>                        
                        <Col md="6">
                            <FormGroup>
                                <label>Nombre</label>
                                <Input placeholder="Nombre de la plantiall aqui" type="text" name='name' defaultValue={emailtemplate.name} onChange={onHandleChange}/>
                            </FormGroup>
                        </Col>
                        <Col md="6">
                          {
                            !companyId && 
                            <FormGroup>
                                <label>Empresa</label>
                                <select className="form-control" name="idcompany" value={emailtemplate.idcompany} onChange={cmbCompanyOnChange}>
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
                    <Col md="4">
                        <FormGroup>
                            <label>Tipo de Email</label>
                            <select className="form-control" name="isHtml" value={emailtemplate.isHtml} onChange={cmbEmailTypeOnChange}>
                                <option key={0} value={0}>Texto</option>
                                <option key={1} value={1}>Email</option>
                            </select>
                        </FormGroup>
                    </Col>
                    <Col className={`pr-md-1 ${emailtemplate.isHtml == 0 ? 'show' : 'hide'}`} md="12">
                        <FormGroup>
                            <label>Cuerpo del Email en texto</label>
                            <textarea className='form-control' rows="7" placeholder="Escriba el contenido aqui..." name="text" type="text" value={textContent} onChange={(e)=>{
                                const { value } = e.target;
                                setTextContent(value)
                                onHandleChange(e)
                            }}/>
                        </FormGroup>
                    </Col>
                    <Col className={`pr-md-1 ${emailtemplate.isHtml == 0 ? 'hide' : 'show'}`} md="12">
                        <FormGroup>
                            <label>Cuerpo del Email en Html</label>
                            {/* <div style={{width:'100%', height:'400px', maxHeight:'400px',  overflow: 'auto', border:'1px solid #1e1e2e'}} 
                            dangerouslySetInnerHTML={{ __html: emailContent }}>
                            </div> */}
                            <iframe style={{width:'100%', height:'400px', maxHeight:'400px',  overflow: 'auto', border:'1px solid #1e1e2e'}}  id={1} srcDoc={emailContent}>                                
                            </iframe>
                        </FormGroup>
                    </Col>
                  </Row>                

                  <Row>
                    <Col className="pr-md-1" md="11">
                        <FormGroup>
                            <Input placeholder="Mejora el contenido del Email, escribele a la IA aqui" type="text" name='prompt' onChange={onHandleChange}/>
                        </FormGroup>
                    </Col>
                    <Col  className="pr-md-1" md="1">
                        <Button style={{margin: '0px'}} className="btn-fill" color="primary" type="button" onClick={sendPrompt}>
                            <i className="fa-solid fa-arrow-up"></i>
                        </Button>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                        <FormGroup>
                            <label>Archivos adjuntos</label>                           
                        </FormGroup>
                    </Col>
                    <Col md="1">
                        <Button style={{margin: '0px'}} className="btn-fill" color="secondary"  title='Adjuntar archivos' type="button" onClick={sendPrompt}>
                            <i class="fa-solid fa-paperclip"></i>
                        </Button>                    
                    </Col>
                    <Col md="1">
                        <Button style={{margin: '0px'}} className="btn-fill" color="info" title='Generar archivo con IA' type="button" onClick={sendPrompt}>
                          <i class="fa-solid fa-wand-magic-sparkles"></i>
                        </Button>                    
                    </Col>
                  </Row>
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

export default EmailTemplate;
