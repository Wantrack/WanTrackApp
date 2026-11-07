import { axios } from '../config/https';
import constants from '../util/constans';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

const eventFields = `id eventType { id name } venue eventDate startsAt endsAt
  locationUrl latitude longitude dressCodeMen dressCodeWomen timeline invitationLink hasBot botTrainingInfo`;
const guestFields = `id eventId fullName seats confirmationStatus invitationSentAt confirmedAt phone tableLabel comments`;

async function request(query, variables, field) {
  const { data } = await axios.post(`${constants.apiurl}/events/graphql`, { query, variables });
  // GraphQL can return HTTP 200 with errors (including partial data).
  if (data.errors?.length) throw new Error(data.errors.map(error => error.message).join('; '));
  if (!data.data || !(field in data.data)) throw new Error('Respuesta inesperada del servicio de eventos.');
  return data.data[field];
}

export const eventsApi = {
  list: (page = 1) => request(`query($page: PageInput) {
    events(page: $page) { items { ${eventFields} } total page pageSize }
  }`, { page: { page, pageSize: 10 } }, 'events'),
  get: id => request(`query($id: ID!) { event(id: $id) { ${eventFields} } }`, { id }, 'event'),
  types: () => request('query { eventTypes { id name } }', {}, 'eventTypes'),
  save: (id, input) => id
    ? request(`mutation($id: ID!, $input: EventUpdateInput!) { updateEvent(id: $id, input: $input) { ${eventFields} } }`, { id, input }, 'updateEvent')
    : request(`mutation($input: EventInput!) { createEvent(input: $input) { ${eventFields} } }`, { input }, 'createEvent'),
  guests: (eventId, page = 1, search = '', confirmationStatus = '') => request(`query($filter: GuestFilter, $page: PageInput) {
    guests(filter: $filter, page: $page) { items { ${guestFields} } total page pageSize }
  }`, { filter: { eventId, search, ...(confirmationStatus ? { confirmationStatus } : {}) }, page: { page, pageSize: 10 } }, 'guests'),
  saveGuest: (id, input) => id
    ? request(`mutation($id: ID!, $input: GuestUpdateInput!) { updateGuest(id: $id, input: $input) { ${guestFields} } }`, { id, input }, 'updateGuest')
    : request(`mutation($input: GuestInput!) { createGuest(input: $input) { ${guestFields} } }`, { input }, 'createGuest'),
};

export const emptyEvent = {
  eventTypeId: '', venue: '', eventDate: '', startsAt: '', endsAt: '', locationUrl: '',
  latitude: '', longitude: '', dressCodeMen: '', dressCodeWomen: '', invitationLink: '',
  hasBot: false, botTrainingInfo: '',
};

export function eventForm(event) {
  return Object.fromEntries(Object.keys(emptyEvent).map(key => [key,
    key === 'eventTypeId' ? event.eventType.id : (event[key] ?? emptyEvent[key])
  ]));
}

export function eventInput(form) {
  const input = { ...form, venue: form.venue.trim() };
  if (!input.eventTypeId || !input.venue || !input.eventDate || !input.startsAt) {
    throw new Error('Completa el tipo, lugar, fecha y hora de inicio del evento.');
  }
  ['endsAt', 'locationUrl', 'dressCodeMen', 'dressCodeWomen', 'invitationLink', 'botTrainingInfo'].forEach(key => {
    input[key] = form[key].trim() || null;
  });
  ['latitude', 'longitude'].forEach(key => {
    input[key] = String(form[key]).trim() === '' ? null : Number(form[key]);
    const max = key === 'latitude' ? 90 : 180;
    if (input[key] !== null && (!Number.isFinite(input[key]) || Math.abs(input[key]) > max)) {
      throw new Error(`La ${key === 'latitude' ? 'latitud' : 'longitud'} debe estar entre -${max} y ${max}.`);
    }
  });
  return input;
}

export const emptyGuest = { fullName: '', seats: 1, phone: '', tableLabel: '', comments: '', confirmationStatus: 'PENDING', invitationSentAt: '' };
export const confirmationLabels = { PENDING: 'Pendiente', CONFIRMED: 'Confirmada', DECLINED: 'Rechazada' };

export function guestInput(form, eventId, original) {
  const seats = Number(form.seats);
  const errors = [];
  if (!form.fullName.trim()) errors.push('El nombre del invitado es obligatorio.');
  const phone = form.phone;
  if (!phone.trim()) {
    errors.push('El teléfono del invitado es obligatorio.');
  } else if (!/^[0-9]+$/.test(phone)) {
    errors.push('El teléfono debe contener solo números, sin espacios, signos ni letras.');
  } else {
    // No default country: the user must provide the international calling code.
    const parsed = parsePhoneNumberFromString(`+${phone}`);
    if (!parsed || !parsed.isValid() || parsed.number !== `+${phone}` || phone.length > 15) {
      errors.push('Ingresa un teléfono válido con código de país. Ejemplo para Colombia: 573001234567.');
    }
  }
  if (errors.length) throw new Error(errors.join(' '));
  if (String(form.seats).trim() === '' || !Number.isInteger(seats) || seats < 0 || seats > 2147483647) {
    throw new Error('Los cupos deben ser un número entero mayor o igual a cero.');
  }
  const input = { eventId, fullName: form.fullName.trim(), seats,
    phone, tableLabel: form.tableLabel.trim() || null,
    comments: form.comments.trim() || null, invitationSentAt: form.invitationSentAt.replace('T', ' ') || null };
  // Sending an unchanged status would reset confirmed_at to NOW() in the backend.
  if (!original || original.confirmationStatus !== form.confirmationStatus) input.confirmationStatus = form.confirmationStatus;
  return input;
}
