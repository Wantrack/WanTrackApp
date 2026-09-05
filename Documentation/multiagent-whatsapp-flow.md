# Flujo multiagente de WhatsApp

## Puesta en marcha

1. Ejecutar `backend/WanTrackApi/migrations/20260825_multiagent_chat_routing.sql` sobre la base de datos.
2. En **Empresas > Perfil de empresa**, habilitar **Múltiples agentes**.
3. Crear al menos un departamento o grupo de atención.
4. En **Usuarios > Perfil de usuario**, asignar uno o más departamentos a cada persona que atenderá chats.
5. Opcionalmente habilitar **Permitir elegir departamento** para que el cliente elija el área desde WhatsApp.

## Verificación previa de base de datos

Después de ejecutar la migración, esta consulta debe devolver todas las filas indicadas:

```sql
SELECT TABLE_NAME, COLUMN_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND (
    (TABLE_NAME = 'companies' AND COLUMN_NAME IN ('multiagent', 'multidept'))
    OR (TABLE_NAME = 'departments' AND COLUMN_NAME IN
      ('iddepartments', 'idcompany', 'name', 'active', 'sortorder'))
    OR (TABLE_NAME = 'user_department' AND COLUMN_NAME IN
      ('iduser', 'iddepartment', 'idcompany'))
    OR (TABLE_NAME = 'chatAssignments' AND COLUMN_NAME IN
      ('idchatAssignments', 'iduser', 'idwsaccount', 'iddept', 'phone',
       'idcompany', 'active', 'creationdate', 'modificationDate', 'activeConversationKey'))
  )
ORDER BY TABLE_NAME, COLUMN_NAME;
```

Verificar que no queden asignaciones activas duplicadas:

```sql
SELECT idwsaccount, phone, COUNT(*) AS active_count
FROM chatAssignments
WHERE active = 1
GROUP BY idwsaccount, phone
HAVING COUNT(*) > 1;
```

Resultado esperado: cero filas.

## Preparación de la prueba

### Configuración temporal: solo Luis

Para las pruebas iniciales de Wantrack SAS, la base quedó configurada con Luis (`iduser = 15`) como único agente asociado al departamento `Default`. Walter y Mauricio no fueron desactivados; únicamente se retiraron temporalmente sus asociaciones en `user_department`.

Para restaurarlos después de las pruebas:

```sql
INSERT INTO user_department (iduser, iddepartment, idcompany)
VALUES (14, 1, 4), (13, 1, 4);
```

Conviene utilizar dos usuarios de prueba y dos teléfonos de cliente diferentes:

1. Iniciar backend y frontend con sus comandos habituales.
2. Abrir el perfil de la empresa que posee la cuenta de WhatsApp.
3. Habilitar **Múltiples agentes** y guardar.
4. Crear `Ventas` y `Soporte` como departamentos.
5. Asignar el usuario A a `Ventas` y el usuario B a `Soporte`.
6. Confirmar en base de datos:

```sql
SELECT ud.idcompany, ud.iduser, u.name AS agent, d.name AS department
FROM user_department ud
INNER JOIN users u ON u.iduser = ud.iduser
INNER JOIN departments d ON d.iddepartments = ud.iddepartment
ORDER BY ud.idcompany, ud.iduser;
```

## Prueba 1: reparto sin elección de departamento

1. Dejar **Permitir elegir departamento** deshabilitado.
2. Desde el teléfono de cliente A escribir: `Quiero hablar con un asesor humano`.
3. Debe recibirse la confirmación de que un asesor atenderá pronto.
4. El chat debe aparecer para el agente asignado y no para el otro agente.
5. Repetir desde el cliente B. El reparto debe favorecer al agente con menos chats activos.
6. Consultar el resultado:

```sql
SELECT ca.idchatAssignments, ca.phone, ca.active,
       u.name AS agent, d.name AS department, ca.creationdate
FROM chatAssignments ca
INNER JOIN users u ON u.iduser = ca.iduser
INNER JOIN departments d ON d.iddepartments = ca.iddept
WHERE ca.active = 1
ORDER BY ca.creationdate DESC;
```

## Prueba 2: elección de departamento

1. Habilitar **Permitir elegir departamento** y guardar la empresa.
2. Escribir nuevamente desde un teléfono que no tenga una asignación activa.
3. WhatsApp debe mostrar únicamente departamentos activos con agentes configurados.
4. Elegir `Ventas`.
5. Debe mostrarse la confirmación con el agente asignado.
6. La consulta anterior debe mostrar `Ventas` y un usuario perteneciente a ese departamento.

## Prueba 3: idempotencia

1. Con una conversación todavía activa, repetir la solicitud de asesor o reenviar la misma selección.
2. Debe conservarse la asignación original.
3. La siguiente consulta debe devolver `1`:

```sql
SELECT COUNT(*) AS active_count
FROM chatAssignments ca
INNER JOIN whatsapp_accounts ws ON ws.idwhatsapp_accounts = ca.idwsaccount
WHERE ws.phoneNumberId = '<PHONE_NUMBER_ID>'
  AND ca.phone = '<TELEFONO_CLIENTE>'
  AND ca.active = 1;
```

## Prueba 4: cierre y retorno a la IA

1. Entrar al chat como el agente asignado.
2. Usar **Desactivar respuesta humana**.
3. El chat debe desaparecer de la bandeja exclusiva del agente.
4. Verificar que la asignación quedó cerrada y que el bloqueo de IA desapareció:

```sql
SELECT active
FROM chatAssignments ca
INNER JOIN whatsapp_accounts ws ON ws.idwhatsapp_accounts = ca.idwsaccount
WHERE ws.phoneNumberId = '<PHONE_NUMBER_ID>'
  AND ca.phone = '<TELEFONO_CLIENTE>'
ORDER BY ca.creationdate DESC
LIMIT 1;

SELECT COUNT(*) AS ai_stopped
FROM stopIAList
WHERE phoneNumberId = '<PHONE_NUMBER_ID>'
  AND phone = '<TELEFONO_CLIENTE>';
```

Resultados esperados: `active = 0` y `ai_stopped = 0`. Al enviar otro mensaje, la IA debe responder nuevamente.

### Limpieza desde la interfaz

La pantalla **Chats** incluye el bloque **Asignaciones activas**. Este bloque también muestra asignaciones antiguas que no tienen mensajes en `auditTrail` y que, por ello, no aparecen en el listado general.

1. Usar **Liberar** para cerrar una asignación específica.
2. Usar **Liberar todas** para cerrar todas las asignaciones visibles para el usuario.
3. Confirmar el aviso. Esta acción conserva el historial y vuelve a habilitar las respuestas del bot.
4. Recargar la pantalla y confirmar que el contador sea `0`.

Un agente normal solo puede listar y liberar sus propias asignaciones. Un administrador puede gestionar las asignaciones de su empresa.

Para confirmar el estado directamente en base de datos:

```sql
SELECT COUNT(*) AS active_assignments
FROM chatAssignments
WHERE active = 1;
```

El resultado esperado después de una limpieza total es `0`.

## Prueba 5: casos de error

- Departamento sin agentes: no debe aparecer en la lista de WhatsApp.
- Empresa sin ningún agente configurado: el cliente debe recibir un mensaje de indisponibilidad y la IA no debe quedar bloqueada.
- Agente A intentando abrir o responder el chat del agente B mediante la URL o API: debe recibir HTTP `403`.
- Desactivar un departamento no debe borrar conversaciones históricas.
- Deshabilitar **Múltiples agentes** debe conservar el flujo humano anterior.

## Criterio de aprobación

El cambio puede considerarse aprobado cuando:

- Los builds de frontend y backend terminan correctamente.
- La verificación del esquema devuelve todas las columnas.
- No existen asignaciones activas duplicadas.
- Las cinco pruebas anteriores cumplen sus resultados esperados.
- Un mensaje normal que no solicita asesor sigue siendo contestado por el bot.

## Comportamiento

- Sin multiagentes se conserva el flujo humano anterior.
- Con multiagentes y sin selección de departamento, se asigna el agente configurado con menos chats activos.
- Con departamentos habilitados, WhatsApp muestra únicamente áreas activas que tienen al menos un agente.
- La selección usa identificadores internos; cambiar el nombre visible de un departamento no rompe el enrutamiento.
- Una conversación activa no puede asignarse dos veces desde la aplicación: si el webhook se repite, se conserva la asignación existente.
- Los usuarios con departamentos asignados solo ven sus conversaciones activas. Los administradores de plataforma y usuarios de empresa sin departamentos conservan la vista general.
- Al desactivar la atención humana se libera la asignación y la IA vuelve a quedar disponible.

## Límites de WhatsApp

La lista se limita a diez departamentos y cada nombre se restringe a 24 caracteres, de acuerdo con los límites de las listas interactivas de WhatsApp.
