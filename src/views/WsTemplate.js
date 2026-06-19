import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
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
  { value: 'en_US', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'pt_BR', label: 'Portuguese (Brazil)' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
];

const buttonTypes = [
  { value: 'QUICK_REPLY', label: 'Quick reply' },
  { value: 'URL', label: 'Visit website' },
  { value: 'PHONE_NUMBER', label: 'Call phone number' },
];

function countVariables(value = '') {
  const matches = value.match(/{{\d+}}/g);
  return matches ? matches.length : 0;
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
    category: 'UTILITY',
    ...data,
    body: data.body || data.text || '',
    buttons,
  };
}

function WsTemplate() {
  const navigate = useNavigate();
  const [wstemplate, setWsTemplate] = useState(normalizeTemplate());
  const [companies, setCompanies] = useState([]);
  const [buttonTypeToAdd, setButtonTypeToAdd] = useState('QUICK_REPLY');

  const updateTemplate = (name, value) => {
    setWsTemplate(pre => ({
      ...pre,
      [name]: value,
      text: name === 'body' ? value : pre.text,
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

  function saveChanges(close = true) {
    const payload = {
      ...wstemplate,
      text: wstemplate.body || '',
      buttons: JSON.stringify(wstemplate.buttons || []),
    };

    axios.post(`${constants.apiurl}/api/wstemplate`, payload).then(async () => {
      if (close) {
        navigate('/admin/wstemplates');
      }
    });
  }

  const headerDisabled = wstemplate.mediaSample !== 'NONE';
  const buttons = wstemplate.buttons || [];

  return (
    <>
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
                <div className="section-title">Template name and language</div>
                <Row>
                  <Col className="pr-md-1" md="8">
                    <FormGroup>
                      <label>Name your template</label>
                      <div className="field-shell">
                        <Input
                          className="with-count"
                          maxLength={TEMPLATE_LIMITS.name}
                          name="name"
                          onChange={onHandleChange}
                          placeholder="Enter a template name"
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
                      <label>Select language</label>
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
                  <div className="section-title">Content</div>
                  <p className="helper-text">
                    Add a header, body and footer for your template. Cloud API hosted by Meta reviews template variables and content before approval.
                    {' '}
                    <a
                      className="doc-link"
                      href="https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/components/"
                      rel="noreferrer"
                      target="_blank"
                    >
                      About templates
                    </a>
                  </p>

                  <Row>
                    <Col md="2">
                      <FormGroup>
                        <label>Type of variable <i className="fa fa-info-circle" title="Variables are inserted as {{1}}, {{2}}, and so on." /></label>
                        <select className="form-control" name="variableType" value={wstemplate.variableType || 'NUMBER'} onChange={onHandleChange}>
                          <option value="NUMBER">Number</option>
                          <option value="NAME">Name</option>
                        </select>
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="2">
                      <FormGroup>
                        <label>Media sample <span className="optional-label">- Optional</span></label>
                        <select className="form-control" name="mediaSample" value={wstemplate.mediaSample || 'NONE'} onChange={onHandleChange}>
                          <option value="NONE">None</option>
                          <option value="IMAGE">Image</option>
                          <option value="VIDEO">Video</option>
                          <option value="DOCUMENT">Document</option>
                        </select>
                      </FormGroup>
                    </Col>
                  </Row>

                  {wstemplate.mediaSample !== 'NONE' && (
                    <Row>
                      <Col md="12">
                        <FormGroup>
                          <label>Sample media URL <span className="optional-label">- Required by Meta when using a media header</span></label>
                          <Input
                            name="mediaSampleUrl"
                            onChange={onHandleChange}
                            placeholder="https://example.com/sample-file"
                            type="url"
                            value={wstemplate.mediaSampleUrl || ''}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  )}

                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <label>Header <span className="optional-label">- Optional</span></label>
                        <div className="field-shell">
                          <Input
                            className="with-count"
                            disabled={headerDisabled}
                            maxLength={TEMPLATE_LIMITS.header}
                            name="header"
                            onChange={onHandleChange}
                            placeholder={headerDisabled ? 'Text header is disabled when a media header is selected' : 'Add a short line of text to the header of your message in English'}
                            type="text"
                            value={wstemplate.header || ''}
                          />
                          <span className="field-count">{(wstemplate.header || '').length}/{TEMPLATE_LIMITS.header}</span>
                        </div>
                        <div className="field-actions">
                          <button className="text-button" disabled={headerDisabled || countVariables(wstemplate.header) >= 1} onClick={() => addVariable('header')} type="button">
                            <i className="fa fa-plus" /> Add variable
                          </button>
                          <i className="fa fa-info-circle" title="Meta allows one variable in a text header." />
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <label>Body</label>
                        <div className="field-shell">
                          <textarea
                            className="form-control with-count"
                            maxLength={TEMPLATE_LIMITS.body}
                            name="body"
                            onChange={onHandleChange}
                            placeholder="Write the message body. Variables can be added as {{1}}, {{2}}, etc."
                            rows="6"
                            value={wstemplate.body || ''}
                          />
                          <span className="field-count">{(wstemplate.body || '').length}/{TEMPLATE_LIMITS.body}</span>
                        </div>
                        <div className="format-actions">
                          <button className="format-button" onClick={() => applyBodyFormat('*')} title="Bold" type="button"><strong>B</strong></button>
                          <button className="format-button" onClick={() => applyBodyFormat('_')} title="Italic" type="button"><em>I</em></button>
                          <button className="format-button" onClick={() => applyBodyFormat('~')} title="Strikethrough" type="button"><s>S</s></button>
                          <button className="format-button" onClick={() => applyBodyFormat('`')} title="Monospace" type="button"><code>&lt;/&gt;</code></button>
                          <button className="text-button" onClick={() => addVariable('body')} type="button">
                            <i className="fa fa-plus" /> Add variable
                          </button>
                          <i className="fa fa-info-circle" title="Body is required and supports variables, emojis, and WhatsApp text formatting." />
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <label>Footer <span className="optional-label">- Optional</span></label>
                        <div className="field-shell">
                          <Input
                            className="with-count"
                            maxLength={TEMPLATE_LIMITS.footer}
                            name="footer"
                            onChange={onHandleChange}
                            placeholder="Add a short line of text to the bottom of your message in English"
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
                  Buttons <span className="optional-label">- Optional</span>
                </div>
                <p className="helper-text">
                  Create buttons that let customers respond to your message or take action. You can add up to 10 buttons.
                  {buttons.length > 3 && <span className="meta-pill">More than 3 buttons will appear in a list.</span>}
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
                    <i className="fa fa-plus mr-1" /> Add button
                  </Button>
                </div>

                {buttons.map((button, index) => (
                  <div className="button-row" key={index}>
                    <Row>
                      <Col md="3">
                        <FormGroup>
                          <label>Button type</label>
                          <select className="form-control" value={button.type} onChange={(e) => updateButton(index, 'type', e.target.value)}>
                            {buttonTypes.map(type =>
                              <option key={type.value} value={type.value}>{type.label}</option>
                            )}
                          </select>
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <label>Button text</label>
                          <div className="field-shell">
                            <Input
                              className="with-count"
                              maxLength={TEMPLATE_LIMITS.buttonText}
                              onChange={(e) => updateButton(index, 'text', e.target.value)}
                              placeholder="Button label"
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
                            <label>Website URL</label>
                            <Input
                              onChange={(e) => updateButton(index, 'url', e.target.value)}
                              placeholder="https://example.com"
                              type="url"
                              value={button.url || ''}
                            />
                          </FormGroup>
                        </Col>
                      )}
                      {button.type === 'PHONE_NUMBER' && (
                        <Col md="4">
                          <FormGroup>
                            <label>Phone number</label>
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
