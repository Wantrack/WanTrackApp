import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
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

export default function SendInvitations({ eventId, onSent, ref }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState(null);
  const [saved, setSaved] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState('');
  const [selectionEdited, setSelectionEdited] = useState(false);
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
  const configLoadId = useRef(0);
  const busy = progress !== null;
  useEffect(() => {
    mounted.current = true;
    loadSettings();
    return () => { mounted.current = false; };
  }, [eventId]);

  async function loadSettings(companyId) {
    const request = ++configLoadId.current;
    const isCurrent = () => mounted.current && request === configLoadId.current;
    setConfigLoading(true);
    setConfigError('');
    setSelectionEdited(false);
    setSaved(null);
    try {
      const settings = eventId ? await eventsApi.invitationSettings(eventId, companyId) : null;
      const choices = await eventsApi.invitationOptions(companyId ?? settings?.companyId);
      if (!isCurrent()) return;
      const validAccount = choices.accounts.some(item => String(item.idwhatsapp_accounts) === String(settings?.accountId));
      const validTemplate = choices.templates.some(item =>
        String(item.idwstemplate) === String(settings?.templateId) && String(item.idwsaccount) === String(settings?.accountId)
          && item.compatible !== false);
      setOptions(choices);
      setAccountId(validAccount ? String(settings.accountId) : '');
      setTemplateId(validAccount && validTemplate ? String(settings.templateId) : '');
      setSaved(validAccount && validTemplate ? settings : null);
      if (settings && (!validAccount || !validTemplate)) setConfigError('La cuenta o plantilla guardada ya no está disponible. Selecciona otra.');
    } catch (error) {
      if (isCurrent()) setConfigError(error.response?.data?.error || 'No se pudo cargar la configuración de invitaciones.');
    } finally { if (isCurrent()) setConfigLoading(false); }
  }

  async function loadPendingGuests() {
    const request = ++loadId.current;
    const isCurrent = () => mounted.current && request === loadId.current;
    setLoading(true);
    setError('');
    try {
      const guests = await loadPending(eventId);
      if (isCurrent()) setPending(guests);
    } catch {
      if (isCurrent()) setError('No se pudieron cargar los invitados pendientes.');
    } finally { if (isCurrent()) setLoading(false); }
  }

  function show() {
    if (!ready) return;
    setOpen(true);
    setResults(null);
    setPending([]);
    loadPendingGuests();
  }

  async function send() {
    if (sending.current || !ready || !pending.length) return;
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
          const result = await eventsApi.sendInvitation(eventId, guest.id, saved);
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
  const ready = eventId && saved && String(saved.accountId) === accountId && String(saved.templateId) === templateId
    && String(saved.companyId) === String(options?.companyId) && !configLoading;
  useImperativeHandle(ref, () => ({
    prepareSave() {
      if (!selectionEdited || ready) return null;
      if (!options?.companyId || !accountId || !templates.some(item =>
        String(item.idwstemplate) === templateId && item.compatible !== false)) {
        throw new Error('Selecciona una cuenta de WhatsApp y una plantilla compatible para guardar la configuración de envío.');
      }
      const selection = { companyId: options.companyId, accountId, templateId };
      return async savedEventId => {
        const settings = await eventsApi.saveInvitationSettings(savedEventId, selection);
        if (mounted.current) {
          setSaved(settings);
          setSelectionEdited(false);
        }
      };
    },
  }));
  return <div className="mb-4">
    <h6>Configuración de invitaciones por WhatsApp</h6>
    {configLoading && <p role="status">Cargando configuración…</p>}
    {configError && <Alert color="danger">{configError}{!options && <Button type="button" size="sm" onClick={() => loadSettings()}>Reintentar</Button>}</Alert>}
    {options && <>
      <fieldset disabled={configLoading || busy || open}>
        <EventField name="invitationCompany" label="Empresa" type="select" value={options.companyId || ''}
          onChange={(_, value) => loadSettings(value)}>
          {!options.companyId && <option value="">Sin empresa disponible</option>}
          {options.companies.map(company => <option key={company.idcompany} value={company.idcompany}>{company.name}</option>)}
        </EventField>
        <EventField name="invitationAccount" label="Cuenta de WhatsApp" type="select" value={accountId}
          onChange={(_, value) => { setAccountId(value); setTemplateId(''); setSelectionEdited(true); }}>
          <option value="">Selecciona una cuenta</option>
          {options.accounts.map(account => <option key={account.idwhatsapp_accounts} value={account.idwhatsapp_accounts}>{account.displayname}</option>)}
        </EventField>
        <EventField name="invitationTemplate" label="Plantilla" type="select" value={templateId} disabled={!accountId}
          onChange={(_, value) => { setTemplateId(value); setSelectionEdited(true); }}>
          <option value="">Selecciona una plantilla</option>
          {templates.map(item => <option key={item.idwstemplate} value={item.idwstemplate} disabled={item.compatible === false}>
            {item.name} ({item.language || 'es_MX'}){item.reason ? ' · ' + item.reason : ''}
          </option>)}
        </EventField>
        {!!templates.length && templates.every(item => item.compatible === false) && <p>Ninguna plantilla de esta cuenta está lista para invitaciones. El selector indica el motivo.</p>}
        {accountId && !templates.length && <p>No hay plantillas vinculadas a esta cuenta. Revisa la cuenta asignada en Plantillas de WhatsApp.</p>}
      </fieldset>
      <p className="text-muted">La selección se guarda con el evento.</p>
    </>}
    {eventId && <Button color="primary" type="button" onClick={show} disabled={!ready || open}>Enviar invitaciones</Button>}
    {open && <Modal isOpen toggle={toggle} backdrop={busy ? 'static' : true} keyboard={!busy}>
      <ModalHeader toggle={busy ? undefined : toggle}>Enviar invitaciones por WhatsApp</ModalHeader>
      <ModalBody>
        {loading && <p role="status">Cargando invitados pendientes…</p>}
        {error && <Alert color="danger">{error} <Button size="sm" onClick={loadPendingGuests}>Reintentar</Button></Alert>}
        {ready && !loading && !error && !results && <>
          <p>{pending.length ? `Se procesarán ${pending.length} invitaciones pendientes de este evento.` : 'No hay invitaciones pendientes.'}</p>
          <p>Plantilla: <strong>{templates.find(item => String(item.idwstemplate) === templateId)?.name}</strong></p>
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
          disabled={busy || loading || !!error || !ready || !pending.length}>
          Confirmar envío
        </Button>}
      </ModalFooter>
    </Modal>}
  </div>;
}
