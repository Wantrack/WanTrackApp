import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import SendInvitations from './SendInvitations';
import { eventsApi } from '../../services/eventsApi';

jest.mock('../../services/eventsApi', () => ({
  ...jest.requireActual('../../services/eventsApi'),
  eventsApi: { guests: jest.fn(), invitationOptions: jest.fn(), invitationSettings: jest.fn(), saveInvitationSettings: jest.fn(), sendInvitation: jest.fn() },
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
  const saved = { companyId: 3, accountId: 9, templateId: 6 };
  eventsApi.invitationSettings.mockResolvedValueOnce(null).mockResolvedValue(saved);
  eventsApi.saveInvitationSettings.mockResolvedValue(saved);
  eventsApi.invitationOptions.mockResolvedValue({
    companyId: 3, companies: [{ idcompany: 3, name: 'Empresa de prueba' }],
    accounts: [{ idwhatsapp_accounts: 9, displayname: 'Cuenta de prueba' }],
    templates: [
      { idwstemplate: 6, idwsaccount: 9, name: 'invitacion', language: 'es', compatible: true },
      { idwstemplate: 7, idwsaccount: 9, name: 'pendiente', language: 'es', compatible: false, reason: 'Estado en Meta: PENDING' },
      { idwstemplate: 8, idwsaccount: 10, name: 'otra_cuenta', language: 'es', compatible: true },
    ],
  });
  eventsApi.guests.mockResolvedValueOnce({ total: 3, pageSize: 2, items: [
    { id: '1', fullName: 'Ya invitado', invitationSentAt: '2026-11-07 12:00:00' },
    { id: '2', fullName: 'Invitada Uno', phone: '573001234567' },
  ] }).mockResolvedValueOnce({ items: [{ id: '3', fullName: 'Invitado Dos', phone: '12025550123' }] });
  eventsApi.sendInvitation.mockResolvedValueOnce({ status: 'sent' }).mockResolvedValueOnce({ status: 'uncertain' });
  try {
    await act(async () => root.render(<SendInvitations eventId="42" onSent={onSent} />));
    await act(async () => select('invitationAccount', '9'));
    expect(document.querySelector('#events-invitationTemplate option[value="7"]').disabled).toBe(true);
    expect(document.querySelector('#events-invitationTemplate option[value="7"]').textContent).toContain('Estado en Meta: PENDING');
    expect(document.querySelector('#events-invitationTemplate option[value="8"]')).toBeNull();
    await act(async () => select('invitationTemplate', '6'));
    expect([...document.querySelectorAll('button')].find(button => button.textContent === 'Enviar invitaciones').disabled).toBe(true);
    await act(async () => click('Guardar plantilla'));
    expect(eventsApi.saveInvitationSettings).toHaveBeenCalledWith('42', { companyId: 3, accountId: '9', templateId: '6' });
    await act(async () => root.render(<SendInvitations key="reopen" eventId="42" onSent={onSent} />));
    expect(document.querySelector('#events-invitationTemplate').value).toBe('6');
    await act(async () => click('Enviar invitaciones'));
    expect(eventsApi.guests.mock.calls).toEqual([['42', 1], ['42', 2]]);
    expect(eventsApi.sendInvitation).not.toHaveBeenCalled();
    await act(async () => click('Confirmar envío'));
    expect(eventsApi.sendInvitation.mock.calls).toEqual([
      ['42', '2', saved],
      ['42', '3', saved],
    ]);
    expect(document.body.textContent).toContain('Aceptadas por WhatsApp: 1');
    expect(document.body.textContent).toContain('Envío sin confirmar');
    expect(onSent).toHaveBeenCalledTimes(1);
  } finally {
    await act(async () => root.unmount());
    container.remove();
  }
});
