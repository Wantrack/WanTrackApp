import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, CardBody, CardHeader, Col, Form, Row } from 'reactstrap';
import { eventsApi, emptyGuest, guestInput, confirmationLabels } from '../../services/eventsApi';
import EventField from './EventFields';
import PageControls from './PageControls';
import SendInvitations from './SendInvitations';

export default function EventGuests({ eventId }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);
  const [original, setOriginal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    // Debounce search and ignore results from previous filters/pages.
    const timer = setTimeout(() => {
      eventsApi.guests(eventId, page, search, status)
        .then(result => { if (active) setData(result); })
        .catch(error => { if (active) setError(error.message); })
        .finally(() => { if (active) setLoading(false); });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [eventId, page, search, status, refresh]);
  function edit(guest) {
    setOriginal(guest);
    setForm(guest ? { ...emptyGuest, ...guest, phone: guest.phone || '', tableLabel: guest.tableLabel || '',
      comments: guest.comments || '', invitationSentAt: (guest.invitationSentAt || '').replace(' ', 'T') } : { ...emptyGuest });
    setSaveError('');
    setMessage('');
  }
  async function save(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setSaveError('');
    try {
      const input = guestInput(form, eventId, original);
      if (!event.currentTarget.checkValidity()) {
        event.currentTarget.reportValidity();
        return;
      }
      await eventsApi.saveGuest(original?.id, input);
      setForm(null);
      setMessage(original ? 'Invitación actualizada.' : 'Invitación agregada.');
      setRefresh(value => value + 1);
    } catch (error) { setSaveError(error.message); }
    finally { setSaving(false); }
  }
  const change = (key, value) => setForm(current => ({ ...current, [key]: value }));
  return <Card>
    <CardHeader className="d-flex justify-content-between align-items-center flex-wrap">
      <h5 className="title">Invitaciones</h5>
      <div>
        {!form && <Button color="primary" onClick={() => edit(null)}>Agregar invitación</Button>}
      </div>
    </CardHeader>
    <CardBody>
      <SendInvitations eventId={eventId} onSent={() => setRefresh(value => value + 1)} />
      {message && <Alert color="success" role="status">{message}</Alert>}
      {form && <Form onSubmit={save} className="mb-4" noValidate>
        <h6>{original ? 'Editar invitación' : 'Nueva invitación'}</h6>
        {saveError && <Alert color="danger" role="alert">{saveError}</Alert>}
        <fieldset disabled={saving}>
          <Row>
            <Col md="6"><EventField name="fullName" label="Nombre del invitado" value={form.fullName} onChange={change} required maxLength={200} /></Col>
            <Col md="3"><EventField name="seats" label="Cupos" type="number" min="0" max="2147483647" step="1" value={form.seats} onChange={change} required /></Col>
            <Col md="3"><EventField name="phone" label="Teléfono con código de país" type="tel" inputMode="numeric" placeholder="573001234567" value={form.phone} onChange={change} required aria-describedby="guest-phone-help" /></Col>
            <Col md="4"><EventField name="tableLabel" label="Mesa" value={form.tableLabel} onChange={change} maxLength={50} /></Col>
            <Col md="4"><EventField name="confirmationStatus" label="Confirmación" type="select" value={form.confirmationStatus} onChange={change}>
              {Object.entries(confirmationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </EventField></Col>
            <Col md="4"><EventField name="invitationSentAt" label="Fecha de envío registrada" type="datetime-local" step="1" value={form.invitationSentAt} onChange={change} /></Col>
            <Col md="12"><EventField name="comments" label="Comentarios" type="textarea" value={form.comments} onChange={change} /></Col>
          </Row>
          <p id="guest-phone-help" className="text-muted">Teléfono obligatorio con código de país, solo números. Ejemplo para Colombia: 573001234567 (57 + número de celular).</p>
          <p className="text-muted">Guarda al invitado antes de enviar su invitación por WhatsApp.</p>
          <Button color="primary" type="submit">{saving ? 'Guardando…' : 'Guardar invitación'}</Button>
          <Button type="button" onClick={() => setForm(null)}>Cancelar</Button>
        </fieldset>
      </Form>}
      <Row>
        <Col md="8"><EventField name="guestSearch" label="Buscar invitaciones" placeholder="Nombre del invitado" value={search}
          onChange={(_, value) => { setSearch(value); setPage(1); }} /></Col>
        <Col md="4"><EventField name="guestStatus" label="Estado" type="select" value={status}
          onChange={(_, value) => { setStatus(value); setPage(1); }}>
          <option value="">Todos</option>
          {Object.entries(confirmationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </EventField></Col>
      </Row>
      {error && <Alert color="danger">{error} <Button size="sm" onClick={() => setRefresh(value => value + 1)}>Reintentar</Button></Alert>}
      {loading && <p role="status">Cargando invitaciones…</p>}
      {!loading && !error && data && <>
        {data.total === 0 ? <p>No hay invitaciones para mostrar.</p> : <div className="table-responsive"><table className="table table-hover">
          <thead><tr><th>Invitado</th><th>Teléfono</th><th>Cupos</th><th>Mesa</th><th>Estado</th><th>Envío registrado</th><th>Confirmación registrada</th><th>Acciones</th></tr></thead>
          <tbody>{data.items.map(guest => <tr key={guest.id}>
            <td>{guest.fullName}</td><td>{guest.phone || '—'}</td><td>{guest.seats}</td><td>{guest.tableLabel || '—'}</td>
            <td>{confirmationLabels[guest.confirmationStatus]}</td><td>{guest.invitationSentAt || '—'}</td><td>{guest.confirmedAt || '—'}</td>
            <td><Button size="sm" color="primary" disabled={!!form} onClick={() => edit(guest)}>Editar</Button></td>
          </tr>)}</tbody>
        </table></div>}
        <PageControls data={data} onChange={setPage} />
      </>}
    </CardBody>
  </Card>;
}
