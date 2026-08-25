# Auditoria de endpoints API vs App

Fecha de corte: 2026-07-28

Fuentes revisadas:

- API principal: `backend/WanTrackApi/src/queries/index.ts`
- Consumo app React: `src/**/*.js`
- Cliente HTTP app: `src/config/https.js`
- Helper de paginacion: `src/components/Pagination/useServerPagination.js`

Notas:

- Este cruce es estatico. No valida uso por integraciones externas, webhooks, jobs, sockets, SDKs o clientes fuera de React.
- Los endpoints marcados como "no usados por app" no deben eliminarse automaticamente. Primero hay que validar si son publicos, webhooks, utilidades internas o dependencias de terceros.
- Se normalizaron parametros dinamicos como `/api/user/${id}` contra `/api/user/:id`.
- Varias vistas ahora consumen endpoints con query params de paginacion: `page`, `pageSize`, `search` y filtros por compania.

## Resumen

- Rutas declaradas despues del refactor de rutas: 262
- Rutas bajo `/api` despues del refactor de rutas: 260
- Referencias unicas a `/api/...` encontradas en la app: 143
- Endpoints del API sin referencia directa desde React: 127 aproximadamente
- Hallazgos principales:
  - Se agregaron rutas nuevas desde la ultima revision: Meta, THT, upload de media, status de templates y nuevos modulos CRUD.
  - Ya existen en API varios endpoints que antes aparecian como faltantes: `/api/meta/...`, `/api/aws/uploadtemplatemedia/:companyId` y `/api/wstemplate/:id/status`.
  - `POST /api/document` quedó cubierto con alias.
  - `DELETE /api/conversation/:id` sigue pendiente porque no debe mapearse a borrado de grupo sin confirmar contrato de negocio.
  - La diferencia de casing quedó cubierta con alias: `POST /api/scatterList` apunta al mismo handler de `POST /api/scatterlist`.

## Cambios detectados desde la revision anterior

### Agregados o corregidos en API

| Metodo | Endpoint | Estado actual |
| --- | --- | --- |
| POST | `/api/meta/:wabaId/subscribed-apps` | Ahora existe en `query/index.ts`. |
| GET | `/api/meta/:wabaId/phone-numbers` | Ahora existe en `query/index.ts`. |
| POST | `/api/meta/:phoneNumberId/register` | Ahora existe en `query/index.ts`. |
| POST | `/api/aws/uploadtemplatemedia/:companyId` | Ahora existe en `query/index.ts`. |
| POST | `/api/aws/uploadtemplatemedia/:bucketName/:companyId` | Nueva variante disponible en API. |
| POST | `/api/aws/uploadscatterlistimage/:companyId` | Nueva ruta disponible en API. |
| POST | `/api/aws/uploadscatterlistimage/:bucketName/:companyId` | Nueva variante disponible en API. |
| POST | `/api/wstemplate/:id/status` | Ahora existe en `query/index.ts`. |
| GET/POST/DELETE | `/api/externalUser` | Nuevo modulo CRUD en API. |
| GET/POST/DELETE | `/api/mission` | Nuevo modulo CRUD en API. |
| GET/POST/DELETE | `/api/colorprofile` | Nuevo modulo CRUD en API. |
| GET/POST/DELETE | `/api/conversationsummary` | Nuevo modulo CRUD en API. |
| POST | `/api/webhook/YmFuYW5hdGltZQ==` | Nuevo webhook cliente. |
| POST | `/api/webhook/dGh0Y29tcGFueQ==` | Nuevo webhook cliente. |
| POST | `/api/webhook/Qmx1YWNjZXNz` | Nuevo webhook cliente. |
| POST | `/api/webhook/QlRHUGFjdHVhbA==` | Nuevo webhook cliente. |

### Cambios detectados en app

- Varias listas ahora usan paginacion server-side:
  - `GET /api/users?page=...`
  - `GET /api/companies?page=...`
  - `GET /api/templates?page=...`
  - `GET /api/emailtemplates?page=...`
  - `GET /api/wstemplates?page=...`
  - `GET /api/webhook/webhooks?page=...`
  - `GET /api/scatterlists?page=...`
  - `GET /api/scatterlistsleads?page=...`
  - `GET /api/adviserByCompany/:idcompany?page=...`
- `Chat.js` ahora codifica parametros con `encodeURIComponent` para llamadas como `/api/chats/:phone/:phoneNumberId` y `/api/chatisstop/:phone/:phoneNumberId`.
- `HistoryTrans.js` ahora arma URLs separadas para `messagesent` y `messagesentCount` con filtros.

## Usados por la app pero no encontrados en rutas actuales

| Metodo | Endpoint usado en app | Archivo(s) | Observacion |
| --- | --- | --- | --- |
| DELETE | `/api/conversation/:id` | `src/views/Conversations.js:35` | Pendiente de definir. No mapear a `DELETE /api/group/:id` sin validar comportamiento esperado. |

## Diferencias de casing o contrato

| Metodo | App | API | Riesgo |
| --- | --- | --- | --- |
| POST | `/api/scatterList` | `/api/scatterlist` | Cubierto con alias. Pendiente normalizar en frontend para eliminar el alias mas adelante. |

## Endpoints usados por la app y encontrados en query/index.ts

Agrupado por modulo funcional:

- Auth/usuarios: `POST /api/login`, `GET /api/validate/:token`, `GET /api/users`, `GET /api/user/:id`, `GET /api/users/getByEmail/:email`, `POST /api/user`, `GET /api/roles`.
- Companias/lugares: `GET /api/companies`, `GET /api/company/:id`, `POST /api/company`, `GET /api/places/countries`.
- Advisors/calls/reportes: `GET /api/adviser/:idadviser`, `POST /api/adviser`, `GET /api/adviserByCompany/:idcompany`, `GET /api/callByAdviser/:idadviser`, `GET /api/callByCompany/:idcompany`, endpoints `GET /api/call/report/...` usados por `Advisor.js` y `DashboardConversation.js`.
- Dashboard mensajes: `GET /api/MessageSendChart`, `GET /api/MessageDeliveredChart`, `GET /api/MessageReadChart`, `GET /api/MessageFailedChart`, `GET /api/MessageReceiveChart`, `GET /api/CompleteReportByCampaing`, `GET /api/messagesent`, `GET /api/messagesentCount`, `GET /api/messagesentCountByYearMonth/:year/:month`.
- Conversaciones/templates: `GET /api/groups`, `GET /api/group/:id`, `POST /api/group`, `POST /api/message`, `GET /api/messageByIdGroup/:idGroup`, `POST /api/option`, `GET /api/optionsByMessage/:idMessage`, `GET /api/optionsByGroupAndNotAsociated/:idGroup`, `GET /api/templates`, `GET /api/template/:id`, `DELETE /api/template/:id`, `POST /api/createOrUpdateTemplate`, `GET /api/types`.
- Componentes WhatsApp template: `GET /api/clientAnswerTypes`, `GET /api/headertypes`, `GET /api/buttontypes`, `GET /api/answerTemplateType`, `GET /api/buttonstemplateByTemplate/:id`, `GET /api/buttonstemplateByTemplateOptions/:id`, `GET /api/headersbyTemplate/:id`, `POST /api/createOrUpdateButtonstemplate`, `POST /api/createOrUpdateHeaders`.
- Scatter/campanas/leads: `GET /api/scatterlists`, `GET /api/scatterlistsleads`, `GET /api/scatterlist/:id`, `POST /api/scatterlist`, `POST /api/scatterlistscopy`, `GET /api/getCountByScatterList/:id`, `POST /api/scatterlistdetail`, `GET /api/scatterlistdetailbyScatterlist/:idscatterlist`, `PATCH /api/scatterlistdetailSelected`, `PATCH /api/scatterlistdetailSelectedAll`, `POST /api/sendscatterlist`, `GET /api/downloadReportExcel/:tkn/:idscatterlist`, `GET /api/leadsflows/:idscatterlist`.
- Chats: `GET /api/chats`, `GET /api/chats/:phone/:phoneNumberId`, `POST /api/chatssendmessage`, `GET /api/suggestionText/:text`, `GET /api/chatisstop/:phone/:phoneNumberId`, `POST /api/chatasesorstart`, `POST /api/chatasesorstop`, `GET /api/chatdownloadReportExcel/:tkn/:idgroup`.
- WhatsApp accounts/templates: `GET /api/wsaccounts`, `GET /api/wsaccounts/:id`, `POST /api/wsaccounts`, `GET /api/wsaccountsbyCompany/:idcompany`, `GET /api/wstemplates`, `GET /api/wstemplate/:id`, `POST /api/wstemplate`, `POST /api/wstemplate/:id/status`, `GET /api/wstemplatebyCompany/:idcompany`, `GET /api/documentstrain/:idwhatsappaccount`, `POST /api/documentstrain`.
- Meta/WhatsApp setup: `POST /api/meta/:wabaId/subscribed-apps`, `GET /api/meta/:wabaId/phone-numbers`, `POST /api/meta/:phoneNumberId/register`.
- Email: `GET /api/emailtemplates`, `GET /api/emailtemplate/:id`, `POST /api/emailtemplate`, `POST /api/improveaiemail`, `GET /api/emailpixel/:from/:to/:idcompany`.
- Webhooks UI: `GET /api/webhook/webhooks`, `GET /api/webhook/webhook/:id`, `POST /api/webhook/webhook`, `GET /api/webhook/webhookrule/:idwebhookmessages`, `POST /api/webhook/webhookrule`.
- Document check/verificator/rules: `GET /api/verificators`, `GET /api/verificators/:id`, `GET /api/rulesbyVerificator/:id`, `POST /api/rules`, `GET /api/documents-checkbyVerificator/:id`, `GET /api/documents-check/:id/rules`, `POST /api/documents-check/analize`, `POST /api/aws/uploaddocumentcheck/:bucketName/:companyId`.
- Feelings/audio/AWS: `POST /api/aws/uploadauidoemotion/:bucketName/:companyId`, `POST /api/aws/uploadtemplatemedia/:companyId`, `POST /api/feelings`, `POST /api/feelingsSummary`, `POST /api/feelingsSummaryChat/:idadviser/:languague`, `POST /api/getSpecificFeeling`, `GET /api/aws/getfileImage/:bucketName/:fileName`.
- Notificaciones: `GET /api/notifications`, `DELETE /api/notification`.
- POC flow: `POST /api/executeFlow/:scatterlistid`.

## Declarados en API pero no referenciados directamente por la app

Candidatos a revisar antes de refactor/eliminacion:

```text
GET    /api/
POST   /api/agent/asigment
GET    /api/answerController
GET    /api/automatization/:id/blocks
GET    /api/automatization-blocks
POST   /api/automatization-blocks
DELETE /api/automatization-blocks/:id
GET    /api/automatization-blocks/:id
GET    /api/automatization-reference-types
POST   /api/automatization-reference-types
DELETE /api/automatization-reference-types/:id
GET    /api/automatization-reference-types/:id
GET    /api/automatizations
POST   /api/automatizations
DELETE /api/automatizations/:id
GET    /api/automatizations/:id
GET    /api/aws/getfile/:bucketName/:companyId/:apikey/:fileName
GET    /api/aws/getfileAudio/:bucketName/:companyId/:apikey/:fileName
POST   /api/aws/uploadauidoemotionapp/:bucketName/:companyId/:idadviser
POST   /api/aws/uploadscatterlistimage/:bucketName/:companyId
POST   /api/aws/uploadscatterlistimage/:companyId
POST   /api/aws/uploadtemplatemedia/:bucketName/:companyId
GET    /api/buttonstemplate/:id
GET    /api/buttonstemplateexist/:id
GET    /api/buttonstemplates
GET    /api/buttontype/:id
GET    /api/buttontypeexist/:id
DELETE /api/call
GET    /api/call
POST   /api/call
GET    /api/call/:idcall
GET    /api/call/report/callsByAdvise/:idadviser
GET    /api/chatsCount
GET    /api/clients
DELETE /api/colorprofile
GET    /api/colorprofile
POST   /api/colorprofile
GET    /api/colorprofile/:id
GET    /api/comicusers
GET    /api/comicusers/:email/:birthdate
DELETE /api/conversationsummary
GET    /api/conversationsummary
POST   /api/conversationsummary
GET    /api/conversationsummary/:id
POST   /api/createflow
POST   /api/createOrUpdateButtontype
POST   /api/createOrUpdateHeadertype
POST   /api/createOrUpdateUrltype
GET    /api/customer-database
POST   /api/customer-database
DELETE /api/customer-database/:id
GET    /api/customer-database/:id
DELETE /api/deleteButtonstemplate
DELETE /api/deleteButtontype
DELETE /api/deleteheaders
DELETE /api/deleteHeadertype
DELETE /api/deleteUrltype
GET    /api/document-check-rules
POST   /api/document-check-rules
DELETE /api/document-check-rules/:id
GET    /api/document-check-rules/:id
GET    /api/documents-check
POST   /api/documents-check
GET    /api/documents-check-with-verificator
GET    /api/email-attachments
POST   /api/email-attachments
DELETE /api/email-attachments/:id
GET    /api/email-attachments/:id
DELETE /api/externalUser
GET    /api/externalUser
POST   /api/externalUser
GET    /api/externalUser/:id
GET    /api/getByIdGroupAndIndex/:idGroup/:index
GET    /api/headers
GET    /api/headers/:id
GET    /api/headersexist/:id
GET    /api/headertype/:id
GET    /api/headertypeexist/:id
PATCH  /api/hiddenUser
POST   /api/lastmessage
GET    /api/lastmessage/:id
GET    /api/lastmessages
GET    /api/message/:id
GET    /api/messages
GET    /api/messagesent/:idcompany
GET    /api/messenger/receivemessage
POST   /api/messenger/receivemessage
DELETE /api/mission
GET    /api/mission
POST   /api/mission
GET    /api/mission/:id
POST   /api/notification
GET    /api/option/:id
GET    /api/options
GET    /api/places/cities/:idstate
GET    /api/places/states/:idcountry
GET    /api/pollyaudio/:number
POST   /api/rolasign
DELETE /api/rules/:id
GET    /api/rules/:id
GET    /api/scatterlistbyCompany/:idcompany
GET    /api/scatterlistdetail/:id
GET    /api/scatterlistdetails
DELETE /api/schedulescatter
GET    /api/schedulescatter
POST   /api/schedulescatter
GET    /api/schedulescatter/:id
GET    /api/schedulescatterbetween
GET    /api/score
POST   /api/sendemail/:id
GET    /api/templateexist/:id
POST   /api/testpoc/:messageid
GET    /api/type/:id
GET    /api/urltype/:id
GET    /api/urltypeexist/:id
GET    /api/urltypes
POST   /api/webhook/aW5jb250YWN0b2xlYWRz
POST   /api/webhook/aW5jb250YWN0bw==
POST   /api/webhook/dGh0Y29tcGFueQ==
POST   /api/webhook/QlRHUGFjdHVhbA==
POST   /api/webhook/Qmx1YWNjZXNz
POST   /api/webhook/YmFuYW5hdGltZQ==
GET    /api/whastapp/receivemessage
POST   /api/whastapp/receivemessage
```

## Recomendaciones para el siguiente paso

1. Corregir primero los faltantes reales: `DELETE /api/conversation/:id` y `POST /api/document`.
2. Normalizar casing de `scatterList`/`scatterlist` antes de mover rutas.
3. Separar las rutas no usadas por app en tres grupos: publicas/webhooks, internas/job, y realmente obsoletas.
4. Revisar si los nuevos modulos THT (`externalUser`, `mission`, `colorprofile`, `conversationsummary`) tendran UI propia o quedaran como integracion externa.
5. Crear un modulo de cliente API en frontend para evitar URLs sueltas y controlar paginacion, filtros y nombres de rutas desde un solo lugar.
