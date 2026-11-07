import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useLocation } from 'react-router-dom';
import Event from './Event';
import { eventsApi } from '../services/eventsApi';

jest.mock('../services/eventsApi', () => ({
  ...jest.requireActual('../services/eventsApi'),
  eventsApi: { types: jest.fn(), get: jest.fn(), save: jest.fn(), guests: jest.fn() },
}));
jest.mock('../config/https', () => ({ axios: { post: jest.fn() } }));
jest.mock('../components/Events/EventGuests', () => ({ eventId }) => <div data-testid="guests">Invitaciones del evento {eventId}</div>);

let container, root;
const event = { id: '42', eventType: { id: '1', name: 'Celebración' }, venue: 'Salón de prueba', eventDate: '2026-12-31', startsAt: '18:00:00', hasBot: false };
function Location() { const location = useLocation(); return <span data-testid="location">{location.search}</span>; }
async function render(path) {
  await act(async () => root.render(<MemoryRouter initialEntries={[path]}><Event /><Location /></MemoryRouter>));
}
function change(id, value) {
  const input = container.querySelector(`#events-${id}`);
  const prototype = input.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value').set.call(input, value);
  input.dispatchEvent(new EventConstructor(input.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
}
const EventConstructor = window.Event;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  jest.clearAllMocks();
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  eventsApi.types.mockResolvedValue([event.eventType]);
  eventsApi.get.mockResolvedValue(event);
  eventsApi.save.mockResolvedValue(event);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

it('loads an existing event by URL and keeps invitations tied to that id', async () => {
  await render('/admin/event?id=42');
  expect(eventsApi.get).toHaveBeenCalledWith('42');
  expect(container.querySelector('#events-venue').value).toBe('Salón de prueba');
  expect(container.querySelector('[data-testid="guests"]').textContent).toContain('42');
  await act(async () => container.querySelector('form').dispatchEvent(new EventConstructor('submit', { bubbles: true, cancelable: true })));
  expect(eventsApi.save).toHaveBeenCalledWith('42', expect.objectContaining({ eventTypeId: '1', eventDate: '2026-12-31', startsAt: '18:00:00' }));
});

it('saves a new event before enabling invitations and replaces the URL with its id', async () => {
  await render('/admin/event');
  expect(container.querySelector('[data-testid="guests"]')).toBeNull();
  await act(async () => {
    change('eventTypeId', '1'); change('venue', 'Salón nuevo'); change('eventDate', '2026-12-31'); change('startsAt', '18:00');
  });
  await act(async () => container.querySelector('form').dispatchEvent(new EventConstructor('submit', { bubbles: true, cancelable: true })));
  expect(eventsApi.save).toHaveBeenCalledWith(null, expect.objectContaining({ venue: 'Salón nuevo' }));
  expect(container.querySelector('[data-testid="location"]').textContent).toBe('?id=42');
  expect(container.querySelector('[data-testid="guests"]').textContent).toContain('42');
});

it('keeps entered values and does not expose invitations after a failed create', async () => {
  eventsApi.save.mockRejectedValue(new Error('No se pudo guardar'));
  await render('/admin/event');
  await act(async () => { change('eventTypeId', '1'); change('venue', 'Salón nuevo'); change('eventDate', '2026-12-31'); change('startsAt', '18:00'); });
  await act(async () => container.querySelector('form').dispatchEvent(new EventConstructor('submit', { bubbles: true, cancelable: true })));
  expect(container.textContent).toContain('No se pudo guardar');
  expect(container.querySelector('#events-venue').value).toBe('Salón nuevo');
  expect(container.querySelector('[data-testid="guests"]')).toBeNull();
});

it('does not offer an editable blank form for a nonexistent event', async () => {
  eventsApi.get.mockResolvedValue(null);
  await render('/admin/event?id=999');
  expect(container.textContent).toContain('No se encontró el evento');
  expect(container.querySelector('form')).toBeNull();
});
