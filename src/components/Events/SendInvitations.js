import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { eventsApi, guestPhoneError } from '../../services/eventsApi';
import EventField from './EventFields';

async function loadPending(eventId) {
  const pending = new Map();
  for (let page = 1, lastPage = 1; page <= lastPage; page++) {
    const result = await eventsApi.guests(eventId, page);
    if (page === 1) lastPage = Math.ceil(result.total / result.pageSize);
    result.items.filter(guest => !guest.invitationSentAt).forEach(guest => pending.set(guest.id, guest));
  }
  return [...pending.values()];
}

export default function SendInvitations({ eventId, onSent }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState(null);
  const [pending, setPending] = useState([]);
  const [accountId, setAccountId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const mounted = useRef(true);
  const sending = useRef(false);
  const loadId = useRef(0);
  const busy = progress !== null;
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function load(companyId) {
    const request = ++loadId.current;
    const isCurrent = () => mounted.current && request === loadId.current;
    setLoading(true);
    setError('');
    setAccountId('');
    setTemplateId('');
    setOptions(null);
    try {
      const [choices, guests] = await Promise.all([eventsApi.invitationOptions(companyId), loadPending(eventId)]);
      if (!isCurrent()) return;
      setOptions(choices);
      setPending(guests);
    } catch (error) {
      if (isCurrent()) setError(error.response?.data?.error || 'No se pudieron cargar las opciones de envío.');
    } finally { if (isCurrent()) setLoading(false); }
  }

  function show() {
    setOpen(true);
    setResults(null);
    setError('');
    setPending([]);
    setOptions(null);
    load();
  }

  async function send() {
    if (sending.current || !options || !accountId || !templateId || !pending.length) return;
    sending.current = true;
    setProgress(0);
    setError('');
    const summary = { sent: 0, skipped: 0, failed: [], uncertain: [], notAttempted: 0 };
    try {
      for (const [index, guest] of pending.entries()) {
        if (!mounted.current) break;
        const validation = guestPhoneError(guest.phone || '');
        if (validation || !guest.fullName?.trim()) {
          summary.failed.push(`${guest.fullName || 'Invitado'}: ${validation || 'El nombre es obligatorio.'}`);
          setProgress(index + 1);
          continue;
        }
        try {
          const result = await eventsApi.sendInvitation(eventId, guest.id, {
            companyId: options.companyId, accountId, templateId,
          });
          if (result.status === 'sent' || result.status === 'skipped') summary[result.status]++;
          else if (result.status === 'failed') summary.failed.push(`${guest.fullName}: ${result.message}`);
          else summary.uncertain.push(guest.fullName);
        } catch (error) {
          const status = error.response?.status;
          if (status >= 400 && status < 500) summary.failed.push(`${guest.fullName}: ${error.response?.data?.error || 'No se pudo enviar.'}`);
          else summary.uncertain.push(guest.fullName);
          summary.notAttempted = pending.length - index - 1;
          break;
        }
        if (mounted.current) setProgress(index + 1);
      }
    } finally {
      sending.current = false;
      if (mounted.current) {
        setResults(summary);
        setProgress(null);
        onSent();
      }
    }
  }

  const toggle = () => {
    if (busy) return;
    loadId.current++;
    setLoading(false);
    setOpen(false);
  };
  const templates = options?.templates.filter(item => String(item.idwsaccount) === accountId) || [];
  return <>
    <Button color="primary" type="button" onClick={show}>Enviar invitaciones</Button>
    {open && <Modal isOpen toggle={toggle} backdrop={busy ? 'static' : true} keyboard={!busy}>
      <ModalHeader toggle={busy ? undefined : toggle}>Enviar invitaciones por WhatsApp</ModalHeader>
      <ModalBody>
        {loading && <p role="status">Cargando invitados y opciones de WhatsApp…</p>}
        {error && <Alert color="danger">{error} <Button size="sm" onClick={() => load()}>Reintentar</Button></Alert>}
        {options && !loading && !results && <>
          <p>{pending.length ? `Se procesarán ${pending.length} invitaciones pendientes de este evento.` : 'No hay invitaciones pendientes.'}</p>
          <fieldset disabled={busy}>
            <EventField name="invitationCompany" label="Empresa" type="select" value={options.companyId || ''}
              onChange={(_, value) => load(value)}>
              {!options.companyId && <option value="">Sin empresa disponible</option>}
              {options.companies.map(company => <option key={company.idcompany} value={company.idcompany}>{company.name}</option>)}
            </EventField>
            <EventField name="invitationAccount" label="Cuenta de WhatsApp" type="select" value={accountId}
              onChange={(_, value) => { setAccountId(value); setTemplateId(''); }}>
              <option value="">Selecciona una cuenta</option>
              {options.accounts.map(account => <option key={account.idwhatsapp_accounts} value={account.idwhatsapp_accounts}>{account.displayname}</option>)}
            </EventField>
            <EventField name="invitationTemplate" label="Plantilla" type="select" value={templateId} disabled={!accountId}
              onChange={(_, value) => setTemplateId(value)}>
              <option value="">Selecciona una plantilla</option>
              {templates.map(item => <option key={item.idwstemplate} value={item.idwstemplate}>{item.name} ({item.language || 'es_MX'})</option>)}
            </EventField>
            {accountId && !templates.length && <p>No hay plantillas aprobadas para esta cuenta con una variable en el cuerpo y un botón de URL dinámico.</p>}
          </fieldset>
        </>}
        {busy && <p role="status">Procesando invitaciones… {progress} de {pending.length}</p>}
        {results && <div role="status">
          <p>Aceptadas por WhatsApp: {results.sent}. Omitidas por envío previo: {results.skipped}.</p>
          {!!results.notAttempted && <p>Sin intentar: {results.notAttempted}.</p>}
          {!!results.failed.length && <><p>Sin enviar:</p><ul>{results.failed.map((item, index) => <li key={index}>{item}</li>)}</ul></>}
          {!!results.uncertain.length && <><p>Envío sin confirmar. Revisa estos destinatarios antes de repetirlo:</p>
            <ul>{results.uncertain.map((name, index) => <li key={index}>{name}</li>)}</ul></>}
        </div>}
      </ModalBody>
      <ModalFooter>
        <Button type="button" disabled={busy} onClick={toggle}>{results ? 'Cerrar' : 'Cancelar'}</Button>
        {!results && <Button color="primary" type="button" onClick={send}
          disabled={busy || loading || !options || !accountId || !templateId || !pending.length}>
          Confirmar envío
        </Button>}
      </ModalFooter>
    </Modal>}
  </>;
}
