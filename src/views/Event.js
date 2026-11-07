import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Button, Card, CardBody, CardHeader, Col, Form, Input, Label, Row } from 'reactstrap';
import { eventsApi, emptyEvent, eventForm, eventInput } from '../services/eventsApi';
import EventField from '../components/Events/EventFields';
import EventGuests from '../components/Events/EventGuests';
import SendInvitations from '../components/Events/SendInvitations';

export default function Event() {
  const [params, setParams] = useSearchParams();
  const id = params.get('id');
  const invitationRef = useRef(null);
  const createdEventId = useRef(null);
  const [sendRevision, setSendRevision] = useState(0);
  const [form, setForm] = useState({ ...emptyEvent });
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    createdEventId.current = null;
    setLoading(true);
    setLoadError('');
    setSaveError('');
    Promise.all([eventsApi.types(), id ? eventsApi.get(id) : Promise.resolve(null)])
      .then(([catalog, event]) => {
        if (!active) return;
        if (id && !event) throw new Error('No se encontró el evento.');
        setTypes(catalog);
        setForm(event ? eventForm(event) : { ...emptyEvent });
      }).catch(error => { if (active) setLoadError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, refresh]);
  const change = (key, value) => { setForm(current => ({ ...current, [key]: value })); setMessage(''); };
  async function save(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setSaveError('');
    setMessage('');
    let saved;
    try {
      const saveInvitationSettings = invitationRef.current?.prepareSave();
      saved = await eventsApi.save(id || createdEventId.current, eventInput(form));
      if (!id) createdEventId.current = saved.id;
      setForm(eventForm(saved));
      if (saveInvitationSettings) await saveInvitationSettings(saved.id);
      setMessage(saveInvitationSettings
        ? 'Evento y configuración de envío guardados.'
        : 'Evento guardado. Puedes agregar invitaciones a continuación.');
      if (!id) setParams({ id: saved.id }, { replace: true });
    } catch (error) {
      const detail = error.response?.data?.error || error.message;
      setSaveError(saved ? `El evento se guardó, pero faltó guardar la configuración de envío. ${detail} Vuelve a pulsar Guardar evento para reintentar.` : detail);
    }
    finally { setSaving(false); }
  }
  const field = (name, label, props = {}) => <EventField name={name} label={label} value={form[name]} onChange={change} {...props} />;
  return <div className="content">
    <Link className="btn btn-secondary mb-3" to="/admin/events">Volver a eventos</Link>
    <Card><CardHeader><h5 className="title">{id ? 'Editar evento' : 'Crear evento'}</h5></CardHeader>
      <CardBody>
        {loading && <p role="status">Cargando evento…</p>}
        {loadError && <Alert color="danger">{loadError} <Button size="sm" onClick={() => setRefresh(value => value + 1)}>Reintentar</Button></Alert>}
        {!loading && !loadError && <>
          {message && <Alert color="success" role="status">{message}</Alert>}
          {saveError && <Alert color="danger">{saveError}</Alert>}
          <Form onSubmit={save}>
            <fieldset disabled={saving}>
              <Row>
                <Col md="6"><EventField name="eventTypeId" label="Tipo de evento" type="select" value={form.eventTypeId} onChange={change} required>
                  <option value="">Selecciona un tipo</option>
                  {types.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                </EventField></Col>
                <Col md="12">{field('venue', 'Lugar del evento', { required: true, maxLength: 200 })}</Col>
                <Col md="4">{field('eventDate', 'Fecha', { type: 'date', required: true })}</Col>
                <Col md="4">{field('startsAt', 'Hora de inicio', { type: 'time', step: '1', required: true })}</Col>
                <Col md="4">{field('endsAt', 'Hora de finalización', { type: 'time', step: '1' })}</Col>
                <Col md="12">{field('locationUrl', 'Enlace de ubicación', { type: 'url', maxLength: 2048 })}</Col>
                <Col md="6">{field('latitude', 'Latitud', { type: 'number', min: -90, max: 90, step: 'any' })}</Col>
                <Col md="6">{field('longitude', 'Longitud', { type: 'number', min: -180, max: 180, step: 'any' })}</Col>
                <Col md="6">{field('dressCodeMen', 'Vestimenta para hombres', { type: 'textarea' })}</Col>
                <Col md="6">{field('dressCodeWomen', 'Vestimenta para mujeres', { type: 'textarea' })}</Col>
                <Col md="12">{field('invitationLink', 'Enlace de invitación', { type: 'url', maxLength: 2048 })}</Col>
                <Col md="12"><Label check className="ml-4 mb-3"><Input type="checkbox" checked={form.hasBot} onChange={event => change('hasBot', event.target.checked)} /> Evento con bot</Label></Col>
                <Col md="12">{field('botTrainingInfo', 'Información para el bot', { type: 'textarea', rows: 4 })}</Col>
              </Row>
              <SendInvitations ref={invitationRef} eventId={id} onSent={() => setSendRevision(value => value + 1)} />
              <Button color="primary" type="submit">{saving ? 'Guardando…' : 'Guardar evento'}</Button>
            </fieldset>
          </Form>
        </>}
      </CardBody>
    </Card>
    {!loading && !loadError && (id ? <EventGuests key={id} eventId={id} sendRevision={sendRevision} /> :
      <Card><CardBody><h5>Invitaciones</h5><p>Guarda el evento para comenzar a agregar invitaciones.</p></CardBody></Card>)}
  </div>;
}
