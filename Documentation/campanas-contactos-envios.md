# Contactos y envíos de campañas

## Reglas implementadas

- Los teléfonos se conservan tal como se reciben. No se agregan indicativos, no se eliminan signos o espacios y no se infiere país.
- Solo se rechazan duplicados exactos dentro de la misma campaña o importación. `300`, `57300`, `+57300` y `300 ` son diferentes.
- Un contacto sin historial ni trabajos reservados puede editarse o eliminarse. Se comprueban tanto el teléfono anterior como el nuevo. El bloqueo se aplica también a registros duplicados antiguos del mismo número.
- Cualquier intento reservado bloquea ese destinatario, incluso si Meta rechaza el mensaje. Los pendientes no seleccionados siguen siendo editables.
- Una campaña con cualquier registro en `messageSent` o `scatter_send_jobs` no se puede eliminar. Mientras haya trabajos en cola, procesando, aceptados o por verificar tampoco se pueden modificar sus parámetros o selección.
- El borrado es lógico y queda auditado. No se eliminan físicamente campañas, contactos ni registros contables. Los registros eliminados se excluyen de importación, listas, copias y envíos.
- Si el historial antiguo contiene teléfonos que no coinciden exactamente con ningún contacto de esa campaña, se bloquea la edición/eliminación de contactos hasta conciliarlos. El código anterior quitaba `+` al registrar ciertos envíos: no se intenta reconstruir esa relación por suposición.
- Las rutas de integración `createflow` y `executeFlow` pasan por las mismas reglas y ahora requieren el token de usuario. Los consumidores de esas rutas deben enviar `Authorization: Bearer …`.

## Importación y lectura

`POST /api/scatterlistdetails/import` recibe `{idscatterlist, contacts}` con hasta 500 contactos por petición. Devuelve `inserted`, `duplicates`, `duplicateRows` y `rejected` con fila y motivo. Cada lote se guarda en una transacción; si una petición falla, los lotes anteriores permanecen. Reintentar el archivo no vuelve a insertar teléfonos exactos ya guardados.

Cada fila contiene nombre, teléfono, Extra1 y Extra2, en ese orden, como en la carga anterior. Los teléfonos deben mantenerse como texto en Excel para conservar ceros y signos. No hay detección automática de países ni encabezados.

La lectura muestra 25 registros por página y el último envío de cada teléfono; ya no agrupa arbitrariamente por teléfono. Los duplicados antiguos se muestran para su revisión y no se borran durante la migración. El envío selecciona un solo registro por teléfono idéntico (el de menor ID entre los seleccionados).

## Cola, historial y cobros

`POST /api/sendscatterlist` devuelve HTTP 202 con `batchId` y `queued`. Recibe `requestKey` para que una repetición de la misma petición no cree otro envío. La interfaz conserva esa clave durante una petición con resultado incierto. Una nueva operación de envío terminada es un reenvío explícito y requiere la confirmación habitual.

La reserva bloquea la fila de la campaña y crea, en la misma transacción, el lote y los trabajos con una copia del contacto, parámetros, empresa, plantilla, cuenta emisora y precio. La lectura e inserción se hacen en páginas de 500; los mensajes no se envían dentro de esa transacción.

El worker toma un trabajo con `FOR UPDATE SKIP LOCKED`. Procesa hasta cinco trabajos por ciclo, secuencialmente, con una pausa de un segundo entre ciclos. Las instancias adicionales no toman el mismo trabajo, aunque su capacidad total se suma; configurar el número de instancias según la cuenta de Meta.

| Estado | Significado |
| --- | --- |
| queued | Reservado, todavía no intentado |
| processing | Intento iniciado |
| accepted | Meta devolvió un identificador; falta completar el registro local |
| recorded | Se guardó `messageSent` junto con la finalización del trabajo |
| failed | Meta rechazó la petición con una respuesta 4xx |
| unknown | No se puede confirmar el resultado; requiere revisión |

Crear trabajos no crea filas en `messageSent` ni genera cobros. Solo una respuesta con `messages[0].id` permite registrar el envío, utilizando el precio capturado al reservar. La inserción contable y el cambio a `recorded` se confirman juntos; los trabajos `accepted` pueden recuperarse sin contactar otra vez a Meta.

No se cambian precios históricos ni fórmulas de facturación. Se conserva la convención existente de registrar mensajes aceptados y sus posteriores estados; esto no establece una nueva definición comercial de qué mensajes son facturables. El valor predeterminado histórico de `messageSent.delivered` se mantiene. Las notificaciones de entrega/lectura/fallo se conservan además en `scatter_delivery_receipts`, para aplicarlas aunque lleguen antes de que exista la fila de `messageSent`. La cola SQS solo confirma su consumo después de guardar el estado.

Un timeout, una desconexión, una respuesta sin ID o un 5xx no se reintentan automáticamente. Un trabajo `processing` que lleve más de 10 minutos pasa a `unknown`. Si el proceso cae después de que Meta aceptó pero antes de guardar el ID, hay que conciliarlo con Meta; no existe una garantía de exactamente un envío entre dos sistemas sin esa confirmación externa.

## Aplicación de la migración

La migración se conserva únicamente en local en `backend/WanTrackApi/migrations/20260911_scatter_safety.sql`; no se incluye en la rama. Requiere MySQL 8 e InnoDB. Se aplica **una sola vez** y no está diseñada para reejecutarse parcialmente. Debe estar disponible antes de publicar esta versión.

1. Respaldar la base y comprobar la migración en el entorno de pruebas.
2. Detener todas las instancias antiguas de API y envío, incluyendo integraciones que escriban directamente en estas tablas. Esperar a que finalicen los envíos anteriores.
3. Aplicar la migración. Añade `deleted_at`, índices y cuatro tablas; no reescribe teléfonos ni historial.
4. Desplegar el backend nuevo en todas las instancias y el frontend. No mezclar versiones: el código antiguo no respeta las reservas ni el borrado lógico.
5. El worker inicia con la API por defecto. Para validar sin procesar trabajos, usar `ENABLE_SCATTER_WORKER=false`; para operar, habilitar al menos una instancia.
6. Probar importación y edición con una campaña sin envíos, y verificar que una campaña histórica muestra bloqueos.

La migración no se ejecuta automáticamente al arrancar. No volver al backend anterior una vez que existan reservas o borrados lógicos.

## Conciliación de trabajos por verificar

Consultar `GET /api/scatterlist/:id/send-status` para el resumen del último lote. Para investigar desde una conexión administrativa:

```sql
SELECT id, batch_id, idscatterlist, contact_id, phone, status,
       message_id, error_detail, started_at, accepted_at
FROM scatter_send_jobs
WHERE status IN ('unknown', 'accepted')
ORDER BY id;
```

No convertir `unknown` a `queued`. Si Meta confirma el envío y se obtiene su ID, una conciliación administrativa puede guardar ese ID y la fecha de aceptación y pasar el trabajo a `accepted`; el worker registrará el historial sin reenviar. Si se confirma que no se envió, registrar la decisión y marcarlo `failed`. Estas decisiones requieren evidencia y no se automatizan. El bloqueo de edición del contacto se conserva en ambos casos.

## Pruebas

Backend: `npm run test:scatter` desde `backend/WanTrackApi`. La suite requiere el archivo de migración local indicado arriba; una clonación de la rama no lo incluye. Usa exclusivamente `127.0.0.1:33317`, usuario local de pruebas `root` sin contraseña, crea una base temporal y la elimina al terminar. No lee las credenciales de la aplicación ni llama a WhatsApp. `SCATTER_TEST_PORT` permite cambiar el puerto local.

Las pruebas cubren duplicados exactos y concurrentes, teléfonos sin transformaciones, aislamiento por empresa, edición/borrado, historial fallido, selección parcial, reserva contra eliminación simultánea, snapshots, idempotencia, dos workers, recuperación, separación del historial contable y webhooks anticipados.

La fixture `backend/WanTrackApi/tests/scatter-ui-fixture.cjs` permite revisar la interfaz con datos ficticios. El propio archivo documenta la compilación y el puerto local; no debe ejecutarse como servidor de producción.
