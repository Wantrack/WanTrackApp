import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import NotificationAlert from "react-notification-alert";
import {
  Button,
  Card,
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

const TEMPLATE_LIMITS = {
  name: 512,
  header: 60,
  body: 1024,
  footer: 60,
  buttonText: 25,
  buttons: 10,
};

const languages = [
  { value: 'en_US', label: 'Ingles' },
  { value: 'es', label: 'Espanol' },
  { value: 'pt_BR', label: 'Portugues (Brasil)' },
  { value: 'fr', label: 'Frances' },
  { value: 'de', label: 'Aleman' },
];

const buttonTypes = [
  { value: 'QUICK_REPLY', label: 'Respuesta rapida' },
  { value: 'URL', label: 'Visitar sitio web' },
  { value: 'PHONE_NUMBER', label: 'Llamar por telefono' },
];

function normalizeTemplateName(value = '') {
  return value
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function countVariables(value = '') {
  const matches = value.match(/{{\d+}}/g);
  return matches ? matches.length : 0;
}

function countNonVariableCharacters(value = '') {
  return value.replace(/{{\d+}}/g, '').replace(/\s+/g, '').length;
}

function nextVariable(value = '') {
  return `{{${countVariables(value) + 1}}}`;
}

function normalizeTemplate(data = {}) {
  let buttons = [];

  if (Array.isArray(data.buttons)) {
    buttons = data.buttons;
  } else if (data.buttons) {
    try {
      buttons = JSON.parse(data.buttons);
    } catch (error) {
      buttons = [];
    }
  }

  return {
    language: 'en_US',
    variableType: 'NUMBER',
    mediaSample: 'NONE',
    header: '',
    footer: '',
    category: 'MARKETING',
    ...data,
    body: data.body || data.text || '',
    buttons,
  };
}

function WsTemplate() {
  const navigate = useNavigate();
  const notificationAlertRef = useRef(null);
  const [wstemplate, setWsTemplate] = useState(normalizeTemplate());
  const [companies, setCompanies] = useState([]);
  const [buttonTypeToAdd, setButtonTypeToAdd] = useState('QUICK_REPLY');

  function sendNotification(message, type = 'success') {
    notificationAlertRef.current.notificationAlert({
      place: 'tr',
      message: (
        <div>
          <div>{message}</div>
        </div>
      ),
      type,
      icon: "tim-icons icon-bell-55",
      autoDismiss: 7,
    });
  }

  const updateTemplate = (name, value) => {
    const normalizedValue = name === 'name' ? normalizeTemplateName(value) : value;

    setWsTemplate(pre => ({
      ...pre,
      [name]: normalizedValue,
      header: name === 'mediaSample' && normalizedValue !== 'NONE' ? '' : pre.header,
      text: name === 'body' ? normalizedValue : pre.text,
    }));
  };

  const onHandleChange = (e) => {
    const { name, value } = e.target;
    updateTemplate(name, value);
  };

  const cmbCompanyOnChange = async (e) => {
    onHandleChange(e);
  };

  const addVariable = (field) => {
    const currentValue = wstemplate[field] || '';
    const value = `${currentValue}${currentValue ? ' ' : ''}${nextVariable(currentValue)}`;
    updateTemplate(field, value);
  };

  const applyBodyFormat = (prefix, suffix = prefix) => {
    const currentValue = wstemplate.body || '';
    updateTemplate('body', `${currentValue}${currentValue ? ' ' : ''}${prefix}text${suffix}`);
  };

  const addButton = (type = 'QUICK_REPLY') => {
    if ((wstemplate.buttons || []).length >= TEMPLATE_LIMITS.buttons) return;

    setWsTemplate(pre => ({
      ...pre,
      buttons: [
        ...(pre.buttons || []),
        {
          type,
          text: '',
          url: '',
          phoneNumber: '',
        },
      ],
    }));
  };

  const updateButton = (index, name, value) => {
    setWsTemplate(pre => ({
      ...pre,
      buttons: (pre.buttons || []).map((button, buttonIndex) => (
        buttonIndex === index ? { ...button, [name]: value } : button
      )),
    }));
  };

  const removeButton = (index) => {
    setWsTemplate(pre => ({
      ...pre,
      buttons: (pre.buttons || []).filter((button, buttonIndex) => buttonIndex !== index),
    }));
  };

  useEffect(() => {
    async function load() {
      const _companies = await axios.get(`${constants.apiurl}/api/companies`);
      setCompanies([{ idcompany: -1, name: 'Sin Empresa' }, ..._companies.data]);

      const currentWsTemplateID = localStorage.getItem('currentWsTemplateID');
      const _wstemplate = await axios.get(`${constants.apiurl}/api/wstemplate/${currentWsTemplateID}`);
      if (_wstemplate.data) {
        setWsTemplate(normalizeTemplate(_wstemplate.data));
      }
    }

    load();
  }, []);

  async function saveChanges(close = true) {
    const validationError = getTemplateValidationError();
    if (validationError) {
      sendNotification(validationError, 'danger');
      return;
    }

    const payload = {
      ...wstemplate,
      category: wstemplate.category || 'MARKETING',
      text: wstemplate.body || '',
      buttons: JSON.stringify(wstemplate.buttons || []),
    };

    try {
      await axios.post(`${constants.apiurl}/api/wstemplate`, payload);
      sendNotification('Plantilla creada en Meta y guardada en WanTrack.');
      if (close) {
        navigate('/admin/wstemplates');
      }
    } catch (error) {
      const message = error?.response?.data?.error || error?.response?.data?.meta?.message || 'No fue posible crear la plantilla en Meta.';
      sendNotification(message, 'danger');
    }
  }

  function getTemplateValidationError() {
    const body = wstemplate.body || '';
    const bodyVariables = countVariables(body);

    if (!wstemplate.name || /\s/.test(wstemplate.name)) {
      return 'El nombre de la plantilla no puede tener espacios.';
    }

    if (body.trim().match(/{{\d+}}$/)) {
      return 'El cuerpo del mensaje no puede terminar con una variable.';
    }

    if (bodyVariables > 0 && countNonVariableCharacters(body) < bodyVariables * 11) {
      return `El cuerpo debe tener al menos ${bodyVariables * 11} caracteres de texto por ${bodyVariables} variable(s).`;
    }

    return '';
  }

  const headerDisabled = wstemplate.mediaSample !== 'NONE';
  const buttons = wstemplate.buttons || [];

  return (
    <>
      <div className="react-notification-alert-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <div className="content ws-template-builder">
        <style>
          {`
            .ws-template-builder {
              color: #1c2b3a;
            }

            .ws-template-builder .template-panel {
              background: #ffffff;
              border: 1px solid #d9e1ea;
              border-radius: 3px;
              box-shadow: none;
              margin-bottom: 12px;
            }

            .ws-template-builder .template-panel .card-body,
            .ws-template-builder .template-panel .card-footer {
              padding: 14px 13px;
            }

            .ws-template-builder .section-title {
              color: #1d2a36;
              font-size: 16px;
              font-weight: 700;
              margin-bottom: 8px;
            }

            .ws-template-builder label {
              color: #1d2a36;
              font-size: 12px;
              font-weight: 700;
              margin-bottom: 6px;
            }

            .ws-template-builder .optional-label {
              color: #68778a;
              font-weight: 400;
            }

            .ws-template-builder .helper-text {
              color: #1d2a36;
              font-size: 12px;
              line-height: 1.45;
              margin-bottom: 10px;
            }

            .ws-template-builder .doc-link {
              color: #0b78c6;
            }

            .ws-template-builder .form-control,
            .ws-template-builder select.form-control {
              background-color: #ffffff;
              border: 1px solid #c8d2dc;
              border-radius: 2px;
              color: #1d2a36;
              font-size: 13px;
              min-height: 34px;
            }

            .ws-template-builder textarea.form-control {
              min-height: 110px;
              resize: vertical;
            }

            .ws-template-builder .field-shell {
              position: relative;
            }

            .ws-template-builder .field-count {
              color: #647386;
              font-size: 12px;
              position: absolute;
              right: 10px;
              top: 9px;
            }

            .ws-template-builder .with-count {
              padding-right: 64px;
            }

            .ws-template-builder .field-actions,
            .ws-template-builder .format-actions {
              align-items: center;
              display: flex;
              gap: 12px;
              justify-content: flex-end;
              min-height: 32px;
            }

            .ws-template-builder .text-button {
              align-items: center;
              background: transparent;
              border: 0;
              color: #1d2a36;
              cursor: pointer;
              display: inline-flex;
              font-size: 12px;
              gap: 6px;
              padding: 3px 0;
            }

            .ws-template-builder .text-button:disabled {
              color: #9aa5b1;
              cursor: not-allowed;
            }

            .ws-template-builder .format-button {
              background: transparent;
              border: 0;
              color: #1d2a36;
              cursor: pointer;
              font-size: 13px;
              height: 24px;
              min-width: 24px;
              padding: 0;
            }

            .ws-template-builder .button-row {
              background: #f7f9fb;
              border: 1px solid #d9e1ea;
              border-radius: 3px;
              margin-top: 10px;
              padding: 12px;
            }

            .ws-template-builder .add-button-select {
              max-width: 180px;
            }

            .ws-template-builder .meta-pill {
              color: #647386;
              font-size: 12px;
              margin-left: 6px;
            }
          `}
        </style>

        <Row>
          <Col md="12">
            <Card className="template-panel">
              <CardBody>
                <div className="section-title">Nombre de la plantilla e idioma</div>
                <Row>
                  <Col className="pr-md-1" md="8">
                    <FormGroup>
                      <label>Nombre de la plantilla</label>
                      <div className="field-shell">
                        <Input
                          className="with-count"
                          maxLength={TEMPLATE_LIMITS.name}
                          name="name"
                          onChange={onHandleChange}
                          placeholder="Escriba el nombre de la plantilla"
                          type="text"
                          value={wstemplate.name || ''}
                        />
                        <span className="field-count">{(wstemplate.name || '').length}/{TEMPLATE_LIMITS.name}</span>
                      </div>
                    </FormGroup>
                  </Col>
                  <Col className="px-md-1" md="2">
                    <FormGroup>
                      <label>Empresa</label>
                      <select className="form-control" name="idcompany" value={wstemplate.idcompany || -1} onChange={cmbCompanyOnChange}>
                        {companies?.map((company, index) =>
                          <option key={index} value={company.idcompany}>{company.name}</option>
                        )}
                      </select>
                    </FormGroup>
                  </Col>
                  <Col className="pl-md-1" md="2">
                    <FormGroup>
                      <label>Seleccione el idioma</label>
                      <select className="form-control" name="language" value={wstemplate.language || 'en_US'} onChange={onHandleChange}>
                        {languages.map(language =>
                          <option key={language.value} value={language.value}>{language.label}</option>
                        )}
                      </select>
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            <Card className="template-panel">
              <CardBody>
                <Form>
                  <div className="section-title">Contenido</div>
                  <p className="helper-text">
                    Agregue encabezado, cuerpo y pie de pagina para su plantilla. La Cloud API alojada por Meta revisa las variables y el contenido antes de aprobarla.
                    {' '}
                    <a
                      className="doc-link"
                      href="https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/components/"
                      rel="noreferrer"
                      target="_blank"
                    >
                      Acerca de las plantillas
                    </a>
                  </p>

                  <Row>
                    <Col md="2">
                      <FormGroup>
                        <label>Tipo de variable <i className="fa fa-info-circle" title="Las variables se insertan como {{1}}, {{2}}, etc." /></label>
                        <select className="form-control" name="variableType" value={wstemplate.variableType || 'NUMBER'} onChange={onHandleChange}>
                          <option value="NUMBER">Numero</option>
                          <option value="NAME">Nombre</option>
                        </select>
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="2">
                      <FormGroup>
                        <label>Muestra multimedia <span className="optional-label">- Opcional</span></label>
                        <select className="form-control" name="mediaSample" value={wstemplate.mediaSample || 'NONE'} onChange={onHandleChange}>
                          <option value="NONE">Ninguna</option>
                          <option value="IMAGE">Imagen</option>
                          <option value="VIDEO">Video</option>
                          <option value="DOCUMENT">Documento</option>
                        </select>
                      </FormGroup>
                    </Col>
                  </Row>

                  {wstemplate.mediaSample !== 'NONE' && (
                    <Row>
                      <Col md="12">
                        <FormGroup>
                          <label>Handle o URL de muestra multimedia <span className="optional-label">- Requerido por Meta cuando se usa un encabezado multimedia</span></label>
                          <Input
                            name="mediaSampleUrl"
                            onChange={onHandleChange}
                            placeholder="header_handle de Meta o https://ejemplo.com/archivo-de-muestra"
                            type="text"
                            value={wstemplate.mediaSampleUrl || ''}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  )}

                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <label>Encabezado <span className="optional-label">- Opcional</span></label>
                        <div className="field-shell">
                          <Input
                            className="with-count"
                            disabled={headerDisabled}
                            maxLength={TEMPLATE_LIMITS.header}
                            name="header"
                            onChange={onHandleChange}
                            placeholder={headerDisabled ? 'El encabezado de texto esta deshabilitado cuando se selecciona un encabezado multimedia' : 'Agregue una linea corta de texto al encabezado del mensaje'}
                            type="text"
                            value={wstemplate.header || ''}
                          />
                          <span className="field-count">{(wstemplate.header || '').length}/{TEMPLATE_LIMITS.header}</span>
                        </div>
                        <div className="field-actions">
                          <button className="text-button" disabled={headerDisabled || countVariables(wstemplate.header) >= 1} onClick={() => addVariable('header')} type="button">
                            <i className="fa fa-plus" /> Agregar variable
                          </button>
                          <i className="fa fa-info-circle" title="Meta permite una variable en el encabezado de texto." />
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <label>Cuerpo</label>
                        <div className="field-shell">
                          <textarea
                            className="form-control with-count"
                            maxLength={TEMPLATE_LIMITS.body}
                            name="body"
                            onChange={onHandleChange}
                            placeholder="Escriba el cuerpo del mensaje. Puede agregar variables como {{1}}, {{2}}, etc."
                            rows="6"
                            value={wstemplate.body || ''}
                          />
                          <span className="field-count">{(wstemplate.body || '').length}/{TEMPLATE_LIMITS.body}</span>
                        </div>
                        <div className="format-actions">
                          <button className="format-button" onClick={() => applyBodyFormat('*')} title="Negrita" type="button"><strong>B</strong></button>
                          <button className="format-button" onClick={() => applyBodyFormat('_')} title="Cursiva" type="button"><em>I</em></button>
                          <button className="format-button" onClick={() => applyBodyFormat('~')} title="Tachado" type="button"><s>S</s></button>
                          <button className="format-button" onClick={() => applyBodyFormat('`')} title="Monoespaciado" type="button"><code>&lt;/&gt;</code></button>
                          <button className="text-button" onClick={() => addVariable('body')} type="button">
                            <i className="fa fa-plus" /> Agregar variable
                          </button>
                          <i className="fa fa-info-circle" title="El cuerpo es obligatorio y admite variables, emojis y formato de texto de WhatsApp." />
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <label>Pie de pagina <span className="optional-label">- Opcional</span></label>
                        <div className="field-shell">
                          <Input
                            className="with-count"
                            maxLength={TEMPLATE_LIMITS.footer}
                            name="footer"
                            onChange={onHandleChange}
                            placeholder="Agregue una linea corta de texto al final del mensaje"
                            type="text"
                            value={wstemplate.footer || ''}
                          />
                          <span className="field-count">{(wstemplate.footer || '').length}/{TEMPLATE_LIMITS.footer}</span>
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>

            <Card className="template-panel">
              <CardBody>
                <div className="section-title">
                  Botones <span className="optional-label">- Opcional</span>
                </div>
                <p className="helper-text">
                  Cree botones para que los clientes respondan a su mensaje o realicen una accion. Puede agregar hasta 10 botones.
                  {buttons.length > 3 && <span className="meta-pill">Mas de 3 botones apareceran en una lista.</span>}
                </p>

                <div className="d-flex align-items-center">
                  <select
                    className="form-control add-button-select mr-2"
                    onChange={(e) => setButtonTypeToAdd(e.target.value)}
                    value={buttonTypeToAdd}
                  >
                    {buttonTypes.map(type =>
                      <option key={type.value} value={type.value}>{type.label}</option>
                    )}
                  </select>
                  <Button
                    color="secondary"
                    disabled={buttons.length >= TEMPLATE_LIMITS.buttons}
                    onClick={() => addButton(buttonTypeToAdd)}
                    size="sm"
                    type="button"
                  >
                    <i className="fa fa-plus mr-1" /> Agregar boton
                  </Button>
                </div>

                {buttons.map((button, index) => (
                  <div className="button-row" key={index}>
                    <Row>
                      <Col md="3">
                        <FormGroup>
                          <label>Tipo de boton</label>
                          <select className="form-control" value={button.type} onChange={(e) => updateButton(index, 'type', e.target.value)}>
                            {buttonTypes.map(type =>
                              <option key={type.value} value={type.value}>{type.label}</option>
                            )}
                          </select>
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <label>Texto del boton</label>
                          <div className="field-shell">
                            <Input
                              className="with-count"
                              maxLength={TEMPLATE_LIMITS.buttonText}
                              onChange={(e) => updateButton(index, 'text', e.target.value)}
                              placeholder="Etiqueta del boton"
                              type="text"
                              value={button.text || ''}
                            />
                            <span className="field-count">{(button.text || '').length}/{TEMPLATE_LIMITS.buttonText}</span>
                          </div>
                        </FormGroup>
                      </Col>
                      {button.type === 'URL' && (
                        <Col md="4">
                          <FormGroup>
                            <label>URL del sitio web</label>
                            <Input
                              onChange={(e) => updateButton(index, 'url', e.target.value)}
                              placeholder="https://ejemplo.com"
                              type="url"
                              value={button.url || ''}
                            />
                          </FormGroup>
                        </Col>
                      )}
                      {button.type === 'PHONE_NUMBER' && (
                        <Col md="4">
                          <FormGroup>
                            <label>Numero de telefono</label>
                            <Input
                              onChange={(e) => updateButton(index, 'phoneNumber', e.target.value)}
                              placeholder="+15551234567"
                              type="tel"
                              value={button.phoneNumber || ''}
                            />
                          </FormGroup>
                        </Col>
                      )}
                      <Col md={button.type === 'QUICK_REPLY' ? '5' : '1'} className="d-flex align-items-end justify-content-end">
                        <Button color="danger" onClick={() => removeButton(index)} size="sm" type="button">
                          <i className="fa fa-trash" />
                        </Button>
                      </Col>
                    </Row>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card className="template-panel">
              <CardFooter>
                <Button className="btn-fill" color="primary" type="button" onClick={() => saveChanges(true)}>
                  Guardar
                </Button>

                <Button className="btn-fill" color="primary" type="button" onClick={() => saveChanges(false)}>
                  Correr Prueba
                </Button>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default WsTemplate;
