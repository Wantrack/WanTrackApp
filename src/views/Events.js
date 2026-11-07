import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, CardBody, CardHeader } from 'reactstrap';
import { eventsApi } from '../services/eventsApi';
import PageControls from '../components/Events/PageControls';

export default function Events() {
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    eventsApi.list(page).then(result => { if (active) setData(result); })
      .catch(error => { if (active) setError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, refresh]);
  return <div className="content"><Card>
    <CardHeader className="d-flex justify-content-between align-items-center flex-wrap">
      <h5 className="title">Eventos</h5>
      <Link className="btn btn-primary" to="/admin/event">Agregar evento</Link>
    </CardHeader>
    <CardBody>
      {error && <Alert color="danger">{error} <Button size="sm" onClick={() => setRefresh(value => value + 1)}>Reintentar</Button></Alert>}
      {loading && <p role="status">Cargando eventos…</p>}
      {!loading && !error && data && <>
        {data.total === 0 ? <p>No hay eventos registrados. Agrega el primero para comenzar.</p> :
          <div className="table-responsive"><table className="table table-hover">
            <thead><tr><th>Lugar</th><th>Tipo</th><th>Fecha</th><th>Hora de inicio</th><th>Acciones</th></tr></thead>
            <tbody>{data.items.map(event => <tr key={event.id}>
              <td><Link to={`/admin/event?id=${encodeURIComponent(event.id)}`}>{event.venue}</Link></td>
              <td>{event.eventType.name}</td><td>{event.eventDate}</td><td>{event.startsAt}</td>
              <td><Link className="btn btn-sm btn-primary" to={`/admin/event?id=${encodeURIComponent(event.id)}`}>Editar / Invitaciones</Link></td>
            </tr>)}</tbody>
          </table></div>}
        <PageControls data={data} onChange={setPage} />
      </>}
    </CardBody>
  </Card></div>;
}
