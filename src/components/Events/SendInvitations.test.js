import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import SendInvitations from './SendInvitations';
import { eventsApi } from '../../services/eventsApi';

jest.mock('../../services/eventsApi', () => ({
  ...jest.requireActual('../../services/eventsApi'),
  eventsApi: { guests: jest.fn(), invitationOptions: jest.fn(), sendInvitation: jest.fn() },
}));
jest.mock('../../config/https', () => ({ axios: { post: jest.fn() } }));

it('requires confirmation and processes pending recipients from every page', async () => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const onSent = jest.fn();
  const click = label => [...document.querySelectorAll('button')].find(button => button.textContent === label).click();
  const select = (name, value) => {
    const input = document.querySelector('#events-' + name);
    input.value = value;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };
  eventsApi.invitationOptions.mockResolvedValue({
    companyId: 3, companies: [{ idcompany: 3, name: 'Empresa de prueba' }],
    accounts: [{ idwhatsapp_accounts: 9, displayname: 'Cuenta de prueba' }],
    templates: [{ idwstemplate: 6, idwsaccount: 9, name: 'invitacion', language: 'es' }],
  });
  eventsApi.guests.mockResolvedValueOnce({ total: 3, pageSize: 2, items: [
    { id: '1', fullName: 'Ya invitado', invitationSentAt: '2026-11-07 12:00:00' },
    { id: '2', fullName: 'Invitada Uno', phone: '573001234567' },
  ] }).mockResolvedValueOnce({ items: [{ id: '3', fullName: 'Invitado Dos', phone: '12025550123' }] });
  eventsApi.sendInvitation.mockResolvedValueOnce({ status: 'sent' }).mockResolvedValueOnce({ status: 'uncertain' });
  try {
    await act(async () => root.render(<SendInvitations eventId="42" onSent={onSent} />));
    await act(async () => click('Enviar invitaciones'));
    expect(eventsApi.guests.mock.calls).toEqual([['42', 1], ['42', 2]]);
    await act(async () => select('invitationAccount', '9'));
    await act(async () => select('invitationTemplate', '6'));
    expect(eventsApi.sendInvitation).not.toHaveBeenCalled();
    await act(async () => click('Confirmar envío'));
    expect(eventsApi.sendInvitation.mock.calls).toEqual([
      ['42', '2', { companyId: 3, accountId: '9', templateId: '6' }],
      ['42', '3', { companyId: 3, accountId: '9', templateId: '6' }],
    ]);
    expect(document.body.textContent).toContain('Aceptadas por WhatsApp: 1');
    expect(document.body.textContent).toContain('Envío sin confirmar');
    expect(onSent).toHaveBeenCalledTimes(1);
  } finally {
    await act(async () => root.unmount());
    container.remove();
  }
});
