import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import EventGuests from './EventGuests';
import { eventsApi } from '../../services/eventsApi';

jest.mock('../../services/eventsApi', () => ({
  ...jest.requireActual('../../services/eventsApi'),
  eventsApi: { guests: jest.fn(), saveGuest: jest.fn() },
}));
jest.mock('./SendInvitations', () => () => null);
jest.mock('../../config/https', () => ({ axios: { post: jest.fn() } }));
let container, root;
const guest = { id: '7', eventId: '42', fullName: 'Invitado de prueba', seats: 2,
  confirmationStatus: 'CONFIRMED', confirmedAt: '2026-11-01 15:00:00', phone: '573001234567', invitationSentAt: null };
function button(label) { return [...container.querySelectorAll('button')].find(button => button.textContent === label); }
async function render() {
  await act(async () => root.render(<EventGuests eventId="42" />));
  await act(async () => jest.advanceTimersByTime(250));
}
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  jest.useFakeTimers(); jest.clearAllMocks();
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  eventsApi.guests.mockResolvedValue({ items: [guest], page: 1, pageSize: 10, total: 1 });
  eventsApi.saveGuest.mockResolvedValue(guest);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); jest.useRealTimers(); });

it('saves guest edits within the event and preserves unchanged confirmation timestamps', async () => {
  await render();
  await act(async () => button('Editar').click());
  await act(async () => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(eventsApi.saveGuest).toHaveBeenCalledWith('7', expect.objectContaining({ eventId: '42', fullName: guest.fullName, seats: 2 }));
  expect(eventsApi.saveGuest.mock.calls[0][1]).not.toHaveProperty('confirmationStatus');
  expect(eventsApi.saveGuest.mock.calls[0][1]).not.toHaveProperty('confirmedAt');
  expect(container.textContent).toContain('Invitación actualizada');
  await act(async () => jest.advanceTimersByTime(250));
  expect(eventsApi.guests).toHaveBeenCalledTimes(2);
});

it('retains the editable invitation on a failed save', async () => {
  eventsApi.saveGuest.mockRejectedValue(new Error('No se pudo guardar la invitación'));
  await render();
  await act(async () => button('Editar').click());
  await act(async () => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(container.textContent).toContain('No se pudo guardar la invitación');
  expect(container.querySelector('#events-fullName').value).toBe(guest.fullName);
  expect(button('Guardar invitación').disabled).toBe(false);
});

it('adds a new invitation to the current event', async () => {
  await render();
  await act(async () => button('Agregar invitación').click());
  await act(async () => {
    const input = container.querySelector('#events-fullName');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Nueva invitada');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const phone = container.querySelector('#events-phone');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(phone, '573001234567');
    phone.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(async () => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(eventsApi.saveGuest).toHaveBeenCalledWith(undefined, expect.objectContaining({ eventId: '42', fullName: 'Nueva invitada', seats: 1, confirmationStatus: 'PENDING' }));
  expect(container.querySelector('form')).toBeNull();
});

it('shows both required errors and does not submit an empty guest', async () => {
  await render();
  await act(async () => button('Agregar invitación').click());
  await act(async () => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(container.querySelector('[role="alert"]').textContent).toContain('El nombre del invitado es obligatorio.');
  expect(container.querySelector('[role="alert"]').textContent).toContain('El teléfono del invitado es obligatorio.');
  expect(eventsApi.saveGuest).not.toHaveBeenCalled();
  expect(container.querySelector('form')).not.toBeNull();
});

it.each(['', '3001234567', '57 3001234567', 'abc'])('prevents saving guest edits with invalid phone %s', async phoneValue => {
  await render();
  await act(async () => button('Editar').click());
  await act(async () => {
    const phone = container.querySelector('#events-phone');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(phone, phoneValue);
    phone.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(async () => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(container.querySelector('[role="alert"]').textContent).toMatch(/teléfono/);
  expect(eventsApi.saveGuest).not.toHaveBeenCalled();
  expect(container.querySelector('#events-phone').value).toBe(phoneValue);
});
