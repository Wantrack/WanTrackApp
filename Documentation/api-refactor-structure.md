# Estructura de rutas API

Fecha: 2026-07-28

Decision tomada: organizar por dominio/entidad, no por capas globales.

Motivo:

- En este API hay muchos endpoints y varias entidades con reglas propias.
- La estructura por dominio permite ubicar rapido todo lo relacionado con un modulo.
- Para reducir riesgo, esta primera fase solo mueve el registro de rutas. Controllers y services quedan donde estaban.

## Fase 1 aplicada

`backend/WanTrackApi/src/queries/index.ts` queda como punto de inicializacion:

- crea `Manager`
- instancia controllers actuales
- crea el `RouteContext`
- registra grupos de rutas

Rutas usadas por la app:

```text
backend/WanTrackApi/src/routes/app/authUserRoutes.ts
backend/WanTrackApi/src/routes/app/companyRoutes.ts
backend/WanTrackApi/src/routes/app/adviserCallRoutes.ts
backend/WanTrackApi/src/routes/app/templateConversationRoutes.ts
backend/WanTrackApi/src/routes/app/scatterRoutes.ts
backend/WanTrackApi/src/routes/app/chatRoutes.ts
backend/WanTrackApi/src/routes/app/whatsappTemplateRoutes.ts
backend/WanTrackApi/src/routes/app/reportRoutes.ts
backend/WanTrackApi/src/routes/app/integrationRoutes.ts
backend/WanTrackApi/src/routes/app/documentRoutes.ts
```

Rutas no confirmadas por la app:

```text
backend/WanTrackApi/src/routes/review/pendingReviewRoutes.ts
backend/WanTrackApi/src/routes/review/jobs/jobUtilityReviewRoutes.ts
backend/WanTrackApi/src/routes/review/webhooks/inboundWebhookReviewRoutes.ts
backend/WanTrackApi/src/routes/review/webhooks/clientWebhookReviewRoutes.ts
backend/WanTrackApi/src/routes/review/reviewExternalRoutes.ts
backend/WanTrackApi/src/routes/review/reviewCatalogRoutes.ts
backend/WanTrackApi/src/routes/review/reviewReportRoutes.ts
backend/WanTrackApi/src/routes/review/reviewOperationsRoutes.ts
backend/WanTrackApi/src/routes/review/reviewAutomationRoutes.ts
backend/WanTrackApi/src/routes/review/reviewDocumentAdminRoutes.ts
```

`pendingReviewRoutes.ts` funciona como agregador. Los archivos `review*Routes.ts` separan lo dudoso por tipo para decidir despues que se conserva, se mueve a app o se elimina.

## Webhooks y jobs separados

Posibles webhooks/integraciones entrantes:

```text
backend/WanTrackApi/src/routes/review/webhooks/inboundWebhookReviewRoutes.ts
```

- `GET /api/whastapp/receivemessage`
- `POST /api/whastapp/receivemessage`
- `GET /api/messenger/receivemessage`
- `POST /api/messenger/receivemessage`
- `POST /api/sendemail/:id`

Webhooks por cliente:

```text
backend/WanTrackApi/src/routes/review/webhooks/clientWebhookReviewRoutes.ts
```

- `POST /api/webhook/YmFuYW5hdGltZQ==`
- `POST /api/webhook/aW5jb250YWN0bw==`
- `POST /api/webhook/aW5jb250YWN0b2xlYWRz`
- `POST /api/webhook/dGh0Y29tcGFueQ==`
- `POST /api/webhook/Qmx1YWNjZXNz`
- `POST /api/webhook/QlRHUGFjdHVhbA==`

Posibles jobs/utilidades:

```text
backend/WanTrackApi/src/routes/review/jobs/jobUtilityReviewRoutes.ts
```

- `POST /api/agent/asigment`
- `GET/POST/DELETE /api/schedulescatter`
- `GET /api/schedulescatter/:id`
- `GET /api/schedulescatterbetween`
- `GET /api/clients`
- `POST /api/createflow`
- `POST /api/testpoc/:messageid`
- `GET /api/aws/getfile/:bucketName/:companyId/:apikey/:fileName`
- `GET /api/aws/getfileAudio/:bucketName/:companyId/:apikey/:fileName`
- `POST /api/aws/uploadauidoemotionapp/:bucketName/:companyId/:idadviser`
- `POST /api/aws/uploadscatterlistimage/:companyId`
- `POST /api/aws/uploadscatterlistimage/:bucketName/:companyId`
- `POST /api/aws/uploadtemplatemedia/:bucketName/:companyId`

## Contratos corregidos para la app

Se agregaron rutas alias para no cambiar logica ni tocar la app en esta fase:

- `POST /api/document` usa el mismo handler que `POST /api/documents-check`.
- `POST /api/scatterList` usa el mismo handler que `POST /api/scatterlist`.

Pendiente por definir correctamente:

- `DELETE /api/conversation/:id`: la app lo usa, pero no se debe mapear a `DELETE /api/group/:id` porque no necesariamente representan la misma operacion de negocio.

Rutas base/sistema:

```text
backend/WanTrackApi/src/routes/systemRoutes.ts
backend/WanTrackApi/src/routes/types.ts
```

## Pendiente para fase 2

Cuando validemos que no hay regresiones, podemos mover cada dominio a una carpeta propia:

```text
src/modules/user/
  user.routes.ts
  user.controller.ts
  user.service.ts

src/modules/scatter/
  scatter.routes.ts
  scatter.controller.ts
  scatter.service.ts
```

Los endpoints en `pendingReviewRoutes.ts` deben revisarse antes de eliminarse. Algunos pueden ser webhooks, integraciones externas o jobs internos.

## Fase 2 iniciada

Dominio usuarios/acceso:

```text
backend/WanTrackApi/src/modules/users/loginController.ts
backend/WanTrackApi/src/modules/users/userController.ts
backend/WanTrackApi/src/modules/users/rolController.ts
```

Se movieron desde `src/queries` conservando los nombres de clases y la logica existente. `src/queries/index.ts` ahora importa estos controllers desde `src/modules/users`.

Dominio companias/lugares:

```text
backend/WanTrackApi/src/modules/companies/companiesController.ts
backend/WanTrackApi/src/modules/companies/placesController.ts
```

`src/queries/companiesController.ts` y `src/queries/placesController.ts` quedan como shims temporales para no romper imports internos existentes en bot, WhatsApp, webhooks y otros controllers.

Dominio conversaciones/templates:

```text
backend/WanTrackApi/src/modules/conversations/answerController.ts
backend/WanTrackApi/src/modules/conversations/answerTemplateTypeController.ts
backend/WanTrackApi/src/modules/conversations/clientAnswerTypeController.ts
backend/WanTrackApi/src/modules/conversations/groupController.ts
backend/WanTrackApi/src/modules/conversations/messageController.ts
backend/WanTrackApi/src/modules/conversations/lastMessageController.ts
backend/WanTrackApi/src/modules/conversations/optionController.ts
backend/WanTrackApi/src/modules/conversations/templateController.ts
backend/WanTrackApi/src/modules/conversations/typeController.ts
backend/WanTrackApi/src/modules/conversations/headerTypeController.ts
backend/WanTrackApi/src/modules/conversations/headersController.ts
backend/WanTrackApi/src/modules/conversations/buttonTypeController.ts
backend/WanTrackApi/src/modules/conversations/urlTypeController.ts
backend/WanTrackApi/src/modules/conversations/buttonsTemplateController.ts
```

Los archivos equivalentes en `src/queries` quedan como shims temporales para no romper imports internos de bot, WhatsApp y controllers que aun dependen de esa ruta historica.

Dominio reportes/mensajes:

```text
backend/WanTrackApi/src/modules/reports/messageSentController.ts
backend/WanTrackApi/src/modules/reports/messageReportController.ts
backend/WanTrackApi/src/modules/reports/wantrackPixelController.ts
```

Los archivos equivalentes en `src/queries` quedan como shims temporales porque `messageSentController` todavia es usado por WhatsApp, webhooks, status polling, bot y scatter.

Dominio scatter/leads:

```text
backend/WanTrackApi/src/modules/scatter/scatterListController.ts
backend/WanTrackApi/src/modules/scatter/scatterListDetailsController.ts
backend/WanTrackApi/src/modules/scatter/leadsFlowController.ts
```

Los archivos equivalentes en `src/queries` quedan como shims temporales porque scatter/leads todavia es usado por bot, PoC y reportes.

Dominio canales:

```text
backend/WanTrackApi/src/modules/channels/whastAppTemplateController.ts
backend/WanTrackApi/src/modules/channels/whatsappAccountController.ts
backend/WanTrackApi/src/modules/channels/notificationController.ts
```

Los archivos equivalentes en `src/queries` quedan como shims temporales porque bot, conversaciones y rutas historicas todavia importan desde `queries`.

Dominio integraciones:

```text
backend/WanTrackApi/src/modules/integrations/emailTemplateController.ts
backend/WanTrackApi/src/modules/integrations/webhookController.ts
backend/WanTrackApi/src/modules/integrations/webhookRuleController.ts
backend/WanTrackApi/src/modules/integrations/emailWebhookController.ts
```

Los archivos equivalentes en `src/queries` quedan como shims temporales porque los webhooks entrantes y rutas en revision aun dependen de la ruta historica.

Dominio soporte/chat:

```text
backend/WanTrackApi/src/modules/support/chatsController.ts
backend/WanTrackApi/src/modules/support/adviserController.ts
backend/WanTrackApi/src/modules/support/callController.ts
backend/WanTrackApi/src/modules/support/stopAiListController.ts
```

Los archivos equivalentes en `src/queries` quedan como shims temporales porque bot, analisis de llamadas y algunos endpoints en revision aun importan desde `queries`.

Dominio mensajeria/webhooks entrantes:

```text
backend/WanTrackApi/src/modules/messaging/whastAppController.ts
backend/WanTrackApi/src/modules/messaging/messengerController.ts
backend/WanTrackApi/src/modules/messaging/messageReceiveController.ts
backend/WanTrackApi/src/modules/messaging/whatsappStatusController.ts
```

Los archivos equivalentes en `src/queries` quedan como shims temporales porque `api.ts`, bot y los webhooks en revision aun importan desde la ruta historica.

## Validacion realizada

- Conteo despues del refactor: 262 rutas totales.
- Conteo bajo `/api`: 260 rutas.
- Build ejecutado en `backend/WanTrackApi`: `npm run build`.
- Resultado: compilacion exitosa.
