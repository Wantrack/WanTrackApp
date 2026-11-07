import { axios } from '../config/https';
import { eventsApi, emptyEvent, eventForm, eventInput, emptyGuest, guestInput } from './eventsApi';

jest.mock('../config/https', () => ({ axios: { post: jest.fn() } }));
beforeEach(() => jest.clearAllMocks());

it('posts GraphQL variables and preserves the items pagination envelope', async () => {
  const page = { items: [{ id: '3' }], total: 25, page: 2, pageSize: 10 };
  axios.post.mockResolvedValue({ data: { data: { events: page } } });
  expect(await eventsApi.list(2)).toEqual(page);
  expect(axios.post).toHaveBeenCalledWith(expect.stringMatching(/\/events\/graphql$/), {
    query: expect.stringContaining('events(page: $page)'), variables: { page: { page: 2, pageSize: 10 } },
  });
});

it('rejects GraphQL errors even with HTTP success and partial data', async () => {
  axios.post.mockResolvedValue({ data: { data: { createEvent: null }, errors: [{ message: 'Event type not found' }] } });
  await expect(eventsApi.save(null, {})).rejects.toThrow('Event type not found');
});

it('rejects malformed envelopes but permits a missing event result', async () => {
  axios.post.mockResolvedValueOnce({ data: {} }).mockResolvedValueOnce({ data: { data: { event: null } } });
  await expect(eventsApi.get('8')).rejects.toThrow('Respuesta inesperada');
  expect(await eventsApi.get('8')).toBeNull();
});

it('scopes paginated guest filters to the current event', async () => {
  axios.post.mockResolvedValue({ data: { data: { guests: { items: [], total: 0, page: 1, pageSize: 10 } } } });
  await eventsApi.guests('42', 1, 'Invitado', 'CONFIRMED');
  expect(axios.post.mock.calls[0][1].variables).toEqual({
    filter: { eventId: '42', search: 'Invitado', confirmationStatus: 'CONFIRMED' }, page: { page: 1, pageSize: 10 },
  });
});

it('uses distinct create/update input types and sends ids as variables', async () => {
  axios.post.mockResolvedValueOnce({ data: { data: { createEvent: { id: '5' } } } })
    .mockResolvedValueOnce({ data: { data: { updateEvent: { id: '5' } } } });
  await eventsApi.save(null, { venue: 'Salón' });
  await eventsApi.save('5', { venue: 'Otro salón' });
  expect(axios.post.mock.calls[0][1].query).toContain('$input: EventInput!');
  expect(axios.post.mock.calls[1][1]).toEqual({ query: expect.stringContaining('$input: EventUpdateInput!'), variables: { id: '5', input: { venue: 'Otro salón' } } });
});

it('preserves calendar dates, zero coordinates, and leaves existing timeline untouched', () => {
  const input = eventInput(eventForm({ ...emptyEvent, eventType: { id: '2' }, venue: ' Salón ',
    eventDate: '2026-12-31', startsAt: '23:30:00', latitude: 0, longitude: -74.1, timeline: { legacy: true } }));
  expect(input).toMatchObject({ eventTypeId: '2', venue: 'Salón', eventDate: '2026-12-31', startsAt: '23:30:00', latitude: 0, longitude: -74.1, endsAt: null });
  expect(input).not.toHaveProperty('eventType');
  expect(input).not.toHaveProperty('timeline');
  expect(() => eventInput({ ...emptyEvent, venue: '  ' })).toThrow('Completa');
});

it('does not overwrite confirmation timestamp when editing other guest fields', () => {
  const form = { ...emptyGuest, fullName: ' Invitado ', confirmationStatus: 'CONFIRMED', seats: '0', phone: '573001234567', invitationSentAt: '2026-11-07T12:30:00' };
  const input = guestInput(form, '42', { confirmationStatus: 'CONFIRMED' });
  expect(input).toMatchObject({ eventId: '42', fullName: 'Invitado', seats: 0, phone: '573001234567', invitationSentAt: '2026-11-07 12:30:00' });
  expect(input).not.toHaveProperty('confirmationStatus');
  expect(input).not.toHaveProperty('confirmedAt');
  expect(guestInput({ ...form, confirmationStatus: 'PENDING' }, '42', form).confirmationStatus).toBe('PENDING');
  expect(guestInput(form, '42').confirmationStatus).toBe('CONFIRMED');
});

it.each(['', '-1', '1.5', '2147483648'])('rejects invalid guest seat count %s', seats => {
  expect(() => guestInput({ ...emptyGuest, fullName: 'Invitado', phone: '573001234567', seats }, '42')).toThrow('cupos');
});

it.each(['', '   ', '+573001234567', '57 3001234567', '57300abc4567', '3001234567', '9993001234567', '0573001234567', '5730012345678901'])('rejects missing or invalid international guest phone %s', phone => {
  expect(() => guestInput({ ...emptyGuest, fullName: 'Invitado', phone }, '42')).toThrow(/teléfono/);
});

it.each(['573001234567', '12025550123', '34612345678'])('accepts a digits-only international phone %s', phone => {
  expect(guestInput({ ...emptyGuest, fullName: 'Invitado', phone }, '42').phone).toBe(phone);
});

it('reports both required fields when name and phone are empty', () => {
  expect(() => guestInput({ ...emptyGuest, fullName: '   ' }, '42')).toThrow('El nombre del invitado es obligatorio. El teléfono del invitado es obligatorio.');
});
