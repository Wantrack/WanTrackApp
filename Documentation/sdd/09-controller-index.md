# Backend controller index

Read-only snapshot of sibling `WanTrackApi`, generated from TypeScript ASTs. Includes every tracked file named `*Controller.ts` and the conversation store, including compatibility exports and unmounted controllers. Method inputs are lexical references, not validation guarantees. SQL names are heuristic candidates, not a complete schema. Active route ownership is recorded in [the API relationship](08-api-relationship.md).

## src/controllers/DashboardController.ts

- [src/controllers/DashboardController.ts](../../../WanTrackApi/src/controllers/DashboardController.ts)
- Dependencies: `../services/auditTrailEmailService`, `../services/emailPixelService`, `../tools/errorHandler`.
- `getEmailDataByDate` (line 15): `req.query`.
- `getEmailPixelData` (line 32): `req.query`.

## src/controllers/automatizationBlocksController.ts

- [src/controllers/automatizationBlocksController.ts](../../../WanTrackApi/src/controllers/automatizationBlocksController.ts)
- Dependencies: `../interfaces/AutomatizationBlock`, `../services/automatizationBlocksService`, `../tools/errorHandler`.
- `getAll` (line 13): no direct request-field reference.
- `getById` (line 22): `req.params.id`.
- `getByAutomatization` (line 31): `req.params.id`.
- `createOrUpdate` (line 40): `req.body`.
- `delete` (line 53): `req.params.id`.

## src/controllers/automatizationController.ts

- [src/controllers/automatizationController.ts](../../../WanTrackApi/src/controllers/automatizationController.ts)
- Dependencies: `../interfaces/Automatization`, `../services/automatizationService`, `../tools/errorHandler`.
- `getAll` (line 12): no direct request-field reference.
- `get` (line 21): `req.params.id`.
- `createOrUpdate` (line 30): `req.body`.
- `delete` (line 45): `req.params.id`.

## src/controllers/automatizationReferenceTypeController.ts

- [src/controllers/automatizationReferenceTypeController.ts](../../../WanTrackApi/src/controllers/automatizationReferenceTypeController.ts)
- Dependencies: `../interfaces/AutomatizationReferenceType`, `../services/automatizationReferenceTypeService`, `../tools/errorHandler`.
- `getAll` (line 12): no direct request-field reference.
- `get` (line 21): `req.params.id`.
- `createOrUpdate` (line 30): `req.body`.
- `delete` (line 41): `req.params.id`.

## src/controllers/colorProfileController.ts

- [src/controllers/colorProfileController.ts](../../../WanTrackApi/src/controllers/colorProfileController.ts)
- Dependencies: `../model/ColorProfile`, `../services/colorProfileService`, `../tools/errorHandler`.
- `getAll` (line 14): no direct request-field reference.
- `get` (line 23): `req.params.id`.
- `createOrUpdate` (line 33): `req.body`.
- `delete` (line 52): `req.params.id`.

## src/controllers/comicUserController.ts

- [src/controllers/comicUserController.ts](../../../WanTrackApi/src/controllers/comicUserController.ts)
- Dependencies: `../services/comicUserService`, `../interfaces/ComicUser`, `../tools/errorHandler`.
- `getAll` (line 12): no direct request-field reference.
- `getbyemail` (line 21): `req.params.email`, `req.params.birthdate`.
- `get` (line 34): `req.params.id`.
- `createOrUpdate` (line 43): `req.body`.
- `delete` (line 53): `req.params.id`.

## src/controllers/conversationSummaryController.ts

- [src/controllers/conversationSummaryController.ts](../../../WanTrackApi/src/controllers/conversationSummaryController.ts)
- Dependencies: `../model/ConversationSummary`, `../services/conversationSummaryService`, `../tools/errorHandler`.
- `getAll` (line 12): no direct request-field reference.
- `get` (line 21): `req.params.id`.
- `createOrUpdate` (line 31): `req.body`.
- `delete` (line 52): `req.params.id`.

## src/controllers/customerDatabaseController.ts

- [src/controllers/customerDatabaseController.ts](../../../WanTrackApi/src/controllers/customerDatabaseController.ts)
- Dependencies: `../interfaces/CustomerDatabase`, `../services/customerDatabaseService`, `../tools/errorHandler`.
- `getAll` (line 12): no direct request-field reference.
- `get` (line 21): `req.params.id`.
- `createOrUpdate` (line 31): `req.body`.
- `delete` (line 42): `req.params.id`.

## src/controllers/documentCheckRuleController.ts

- [src/controllers/documentCheckRuleController.ts](../../../WanTrackApi/src/controllers/documentCheckRuleController.ts)
- Dependencies: `../interfaces/DocumentCheckRule`, `../services/documentCheckRuleService`, `../tools/errorHandler`.
- `getAll` (line 12): no direct request-field reference.
- `get` (line 21): `req.params.id`.
- `createOrUpdate` (line 30): `req.body`.
- `delete` (line 41): `req.params.id`.

## src/controllers/documentsCheckController.ts

- [src/controllers/documentsCheckController.ts](../../../WanTrackApi/src/controllers/documentsCheckController.ts)
- Dependencies: `../interfaces/DocumentsCheck`, `../services/documentsCheckService`, `../services/documentCheckRuleService`, `../services/rulesService`, `../tools/errorHandler`, `axios`.
- `getAll` (line 22): no direct request-field reference.
- `get` (line 31): `req.params.id`.
- `getWithRules` (line 40): `req.params.id`.
- `getByVerificator` (line 50): `req.params.id`.
- `getAllWithVerificator` (line 59): no direct request-field reference.
- `createOrUpdate` (line 68): `req.body`.
- `delete` (line 83): `req.params.id`.
- `getExtension` (line 92): no direct request-field reference.
- `analize` (line 96): `req.body`.

## src/controllers/emailAttachmentsController.ts

- [src/controllers/emailAttachmentsController.ts](../../../WanTrackApi/src/controllers/emailAttachmentsController.ts)
- Dependencies: `../services/emailAttachmentsService`, `../interfaces/EmailAttachment`, `../tools/errorHandler`.
- `getAll` (line 12): no direct request-field reference.
- `get` (line 21): `req.params.id`.
- `createOrUpdate` (line 31): `req.body`.
- `delete` (line 42): `req.params.id`.

## src/controllers/emailTestController.ts

- [src/controllers/emailTestController.ts](../../../WanTrackApi/src/controllers/emailTestController.ts)
- Dependencies: `../queues/emailPublisher`, `../interfaces/EmailMessage`.
- `sendTest` (line 5): `req.body`.

## src/controllers/externalUserController.ts

- [src/controllers/externalUserController.ts](../../../WanTrackApi/src/controllers/externalUserController.ts)
- Dependencies: `../model/ExternalUser`, `../services/externalUserService`, `../tools/errorHandler`.
- `getAll` (line 12): no direct request-field reference.
- `get` (line 21): `req.params.id`.
- `createOrUpdate` (line 31): `req.body`.
- `delete` (line 53): `req.params.id`.

## src/controllers/metaController.ts

- [src/controllers/metaController.ts](../../../WanTrackApi/src/controllers/metaController.ts)
- Dependencies: `express`, `../services/metaService`.

## src/controllers/missionController.ts

- [src/controllers/missionController.ts](../../../WanTrackApi/src/controllers/missionController.ts)
- Dependencies: `../model/Mission`, `../services/missionService`, `../tools/errorHandler`.
- `getAll` (line 12): no direct request-field reference.
- `get` (line 21): `req.params.id`.
- `createOrUpdate` (line 31): `req.body`.
- `delete` (line 46): `req.params.id`.

## src/controllers/rulesController.ts

- [src/controllers/rulesController.ts](../../../WanTrackApi/src/controllers/rulesController.ts)
- Dependencies: `../interfaces/Rules`, `../services/rulesService`, `../tools/errorHandler`.
- `getAll` (line 12): no direct request-field reference.
- `get` (line 21): `req.params.id`.
- `getByIdVerificator` (line 30): `req.params.id`.
- `createOrUpdate` (line 39): `req.body`.
- `delete` (line 54): `req.params.id`.

## src/controllers/verificatorController.ts

- [src/controllers/verificatorController.ts](../../../WanTrackApi/src/controllers/verificatorController.ts)
- Dependencies: `../interfaces/verificator`, `../services/verificatorService`, `../tools/errorHandler`.
- `getAll` (line 12): `req.user`.
- `get` (line 25): `req.params.id`.
- `createOrUpdate` (line 34): `req.body`.
- `delete` (line 49): `req.params.id`.

## src/modules/channels/notificationController.ts

- [src/modules/channels/notificationController.ts](../../../WanTrackApi/src/modules/channels/notificationController.ts)
- Dependencies: `../../queries/manager`.
- SQL table candidates: `notification`.
- `getNotifications` (line 13): `req.user`.
- `add` (line 39): no direct request-field reference.
- `delete` (line 55): `req.user`.

## src/modules/channels/whastAppTemplateController.ts

- [src/modules/channels/whastAppTemplateController.ts](../../../WanTrackApi/src/modules/channels/whastAppTemplateController.ts)
- Dependencies: `../../queries/manager`, `../../services/metaService`, `../../queries/pagination`.
- SQL table candidates: `wstemplate`, `name`, `whatsapp_accounts`, `INFORMATION_SCHEMA`.
- `getAll` (line 16): `req.user`, `req.query`.
- `getByCompany` (line 56): `req.user`.
- `getAllMethod` (line 71): no direct request-field reference.
- `get` (line 89): `req.params.id`.
- `getByCompanyMethod` (line 107): no direct request-field reference.
- `add` (line 126): `req.body`, `req.user`.
- `refreshMetaStatus` (line 222): `req.params.id`.
- `getCompanyPhoneNumberAccount` (line 269): no direct request-field reference.
- `getTemplateWhatsAppAccount` (line 280): no direct request-field reference.
- `getMetaTemplateStatus` (line 294): no direct request-field reference.
- `validateTemplate` (line 311): no direct request-field reference.
- `buildMetaTemplatePayload` (line 345): no direct request-field reference.
- `resolveHeaderHandle` (line 404): no direct request-field reference.
- `buildMetaButton` (line 420): no direct request-field reference.
- `buildVariableSamples` (line 443): no direct request-field reference.
- `parseButtons` (line 450): no direct request-field reference.
- `normalizeButtons` (line 460): no direct request-field reference.
- `getHeaderToSave` (line 464): no direct request-field reference.
- `countVariables` (line 468): no direct request-field reference.
- `countNonVariableCharacters` (line 473): no direct request-field reference.
- `normalizeExternalError` (line 477): no direct request-field reference.
- `ensureTemplateColumns` (line 492): no direct request-field reference.

## src/modules/channels/whatsappAccountController.ts

- [src/modules/channels/whatsappAccountController.ts](../../../WanTrackApi/src/modules/channels/whatsappAccountController.ts)
- Dependencies: `../../queries/manager`.
- SQL table candidates: `whatsapp_accounts`, `companies`.
- `getAll` (line 13): `req.user`.
- `get` (line 42): `req.params.id`.
- `getById` (line 58): no direct request-field reference.
- `getByCompany` (line 74): `req.params.idcompany`.
- `createOrUpdate` (line 90): `req.body`, `req.user.idrol`, `req.user.idCompany`.
- `delete` (line 139): `req.body`.

## src/modules/companies/apiTokenController.ts

- [src/modules/companies/apiTokenController.ts](../../../WanTrackApi/src/modules/companies/apiTokenController.ts)
- Dependencies: `crypto`, `../../security/authenticate`, `../../queries/manager`.
- SQL table candidates: `api_tokens`, `companies`.
- `list` (line 15): `req.user`, `req.params.idcompany`.
- `create` (line 38): `req.user`, `req.params.idcompany`, `req.body?.name`, `req.user.iduser`.
- `revoke` (line 101): `req.user`, `req.params.idcompany`, `req.params.id`.
- `verify` (line 124): `req.user`.

## src/modules/companies/companiesController.ts

- [src/modules/companies/companiesController.ts](../../../WanTrackApi/src/modules/companies/companiesController.ts)
- Dependencies: `../../interfaces/company`, `../../queries/manager`, `../../queries/pagination`.
- SQL table candidates: `companies`, `whatsapp_accounts`, `name`, `departments`, `iddepartments`.
- `getAll` (line 15): `req.user`, `req.query`.
- `get` (line 71): `req.user`, `req.params.id`.
- `getIdByPhoneNumberId` (line 91): no direct request-field reference.
- `getTokenByPhoneNumberId` (line 108): no direct request-field reference.
- `getTrainDataByPhoneNumberId` (line 123): no direct request-field reference.
- `getGptByPhoneNumberId` (line 138): no direct request-field reference.
- `createOrUpdate` (line 153): `req.body`, `req.user.idrol`, `req.user`.
- `getDepartments` (line 182): `req.params.id`, `req.user`.
- `saveDepartment` (line 200): `req.params.id`, `req.user`, `req.body.name`, `req.body.iddepartment`, `req.body.active`, `req.body.sortorder`.
- `deleteDepartment` (line 228): `req.params.id`, `req.params.iddepartment`, `req.user`.
- `canManageCompany` (line 249): no direct request-field reference.
- `delete` (line 253): `req.body`.

## src/modules/companies/placesController.ts

- [src/modules/companies/placesController.ts](../../../WanTrackApi/src/modules/companies/placesController.ts)
- Dependencies: `../../queries/manager`.
- SQL table candidates: `country`, `state`, `cities`.
- `getCounties` (line 13): no direct request-field reference.
- `getStatesByCountry` (line 27): `req.params.idcountry`.
- `getCitiesByState` (line 45): `req.params.idstate`.

## src/modules/conversations/answerController.ts

- [src/modules/conversations/answerController.ts](../../../WanTrackApi/src/modules/conversations/answerController.ts)
- Dependencies: `../../interfaces/answer`, `../../queries/manager`.
- SQL table candidates: `answer`.
- `getByIdMessage` (line 14): no direct request-field reference.
- `getAll` (line 33): no direct request-field reference.
- `add` (line 46): no direct request-field reference.

## src/modules/conversations/answerTemplateTypeController.ts

- [src/modules/conversations/answerTemplateTypeController.ts](../../../WanTrackApi/src/modules/conversations/answerTemplateTypeController.ts)
- Dependencies: `../../queries/manager`.
- SQL table candidates: `answer_template_type`.
- `getAll` (line 13): no direct request-field reference.

## src/modules/conversations/buttonTypeController.ts

- [src/modules/conversations/buttonTypeController.ts](../../../WanTrackApi/src/modules/conversations/buttonTypeController.ts)
- Dependencies: `../../interfaces/buttonType`, `../../queries/manager`.
- SQL table candidates: `buttonType`.
- `getAll` (line 14): no direct request-field reference.
- `exist` (line 25): `req.params.id`.
- `get` (line 38): `req.params.id`.
- `createOrUpdate` (line 51): `req.body`.
- `add` (line 60): `req.body`.
- `update` (line 77): `req.body`.
- `delete` (line 93): `req.body`.

## src/modules/conversations/buttonsTemplateController.ts

- [src/modules/conversations/buttonsTemplateController.ts](../../../WanTrackApi/src/modules/conversations/buttonsTemplateController.ts)
- Dependencies: `../../interfaces/buttonsTemplate`, `../../queries/manager`.
- SQL table candidates: `buttonsTemplate`, `buttonType`, `country`, `urlType`.
- `getAll` (line 14): no direct request-field reference.
- `exist` (line 31): `req.params.id`.
- `get` (line 44): `req.params.id`.
- `getByTemplate` (line 62): `req.params.id`.
- `_getByTemplate` (line 80): no direct request-field reference.
- `getByTemplateOption` (line 98): `req.params.id`.
- `createOrUpdate` (line 116): `req.body`.
- `add` (line 125): `req.body`.
- `update` (line 142): `req.body`.
- `delete` (line 160): `req.body`.

## src/modules/conversations/clientAnswerTypeController.ts

- [src/modules/conversations/clientAnswerTypeController.ts](../../../WanTrackApi/src/modules/conversations/clientAnswerTypeController.ts)
- Dependencies: `../../queries/manager`.
- SQL table candidates: `clientAnswerType`.
- `getAll` (line 13): no direct request-field reference.

## src/modules/conversations/groupController.ts

- [src/modules/conversations/groupController.ts](../../../WanTrackApi/src/modules/conversations/groupController.ts)
- Dependencies: `../../queries/manager`.
- SQL table candidates: `group_message`, `message`, `auditTrail`.
- `getAll` (line 13): `req.user`.
- `getAllMethod` (line 28): no direct request-field reference.
- `getAllMethodCompany` (line 48): no direct request-field reference.
- `get` (line 69): `req.params.id`.
- `createOrUpdate` (line 80): `req.body`.
- `delete` (line 89): `req.params.id`.
- `add` (line 100): `req.body`.
- `update` (line 118): `req.body`.

## src/modules/conversations/headerTypeController.ts

- [src/modules/conversations/headerTypeController.ts](../../../WanTrackApi/src/modules/conversations/headerTypeController.ts)
- Dependencies: `../../interfaces/headerType`, `../../queries/manager`.
- SQL table candidates: `headerType`.
- `getAll` (line 14): no direct request-field reference.
- `exist` (line 25): `req.params.id`.
- `get` (line 38): `req.params.id`.
- `createOrUpdate` (line 51): `req.body`.
- `add` (line 60): `req.body`.
- `update` (line 77): `req.body`.
- `delete` (line 93): `req.body`.

## src/modules/conversations/headersController.ts

- [src/modules/conversations/headersController.ts](../../../WanTrackApi/src/modules/conversations/headersController.ts)
- Dependencies: `../../interfaces/headers`, `../../queries/manager`.
- SQL table candidates: `headers`.
- `getAll` (line 14): no direct request-field reference.
- `exist` (line 26): `req.params.id`.
- `get` (line 39): `req.params.id`.
- `getByTemplateMethod` (line 52): no direct request-field reference.
- `getByTemplate` (line 60): `req.params.id`.
- `createOrUpdate` (line 70): `req.body`.
- `add` (line 79): `req.body`.
- `update` (line 96): `req.body`.
- `delete` (line 112): `req.body`.

## src/modules/conversations/lastMessageController.ts

- [src/modules/conversations/lastMessageController.ts](../../../WanTrackApi/src/modules/conversations/lastMessageController.ts)
- Dependencies: `../../interfaces/lastMessage`, `../../queries/manager`.
- SQL table candidates: `lastmessage`, `answer`, `message`, `template`, `options`, `idmessage`.
- `getAll` (line 14): no direct request-field reference.
- `get` (line 26): `req.params.id`.
- `deleteLastMessage` (line 39): no direct request-field reference.
- `startNewConversation` (line 53): no direct request-field reference.
- `add` (line 80): `req.body`.
- `getByIdUsermethod` (line 97): no direct request-field reference.
- `addmethod` (line 114): no direct request-field reference.
- `updateLastAnswerClientAnswer` (line 139): no direct request-field reference.

## src/modules/conversations/messageController.ts

- [src/modules/conversations/messageController.ts](../../../WanTrackApi/src/modules/conversations/messageController.ts)
- Dependencies: `../../queries/manager`.
- SQL table candidates: `message`, `template`, `options`.
- `getAll` (line 13): no direct request-field reference.
- `getAllMethod` (line 23): no direct request-field reference.
- `get` (line 37): `req.params.id`.
- `getById` (line 47): no direct request-field reference.
- `getByIdTemplate` (line 62): no direct request-field reference.
- `getByIdTemplatePreviousMessage` (line 77): no direct request-field reference.
- `getByIdGroupAndIndexRequest` (line 93): `req.params.idGroup`, `req.params.index`.
- `getByIdGroupAndIndex` (line 103): no direct request-field reference.
- `getNextMesssage` (line 118): no direct request-field reference.
- `getNextMesssageInteractive` (line 134): no direct request-field reference.
- `messageByIdGroup` (line 150): `req.params.idGroup`.
- `createOrUpdate` (line 165): `req.body`.
- `add` (line 174): `req.body`.
- `update` (line 200): `req.body`.

## src/modules/conversations/optionController.ts

- [src/modules/conversations/optionController.ts](../../../WanTrackApi/src/modules/conversations/optionController.ts)
- Dependencies: `../../queries/manager`, `axios`, `../../storage/hardcodetext.json`, `./lastMessageController`, `../../queries/companiesController`, `../../queries/notificationController`, `../../SocketsWanTrack`, `../../queries/alertController`, `../../queries/stopAiListController`, `../../tools/chatgpt`, `../../queries/whatsappAccountController`, `../support/chatsController`.
- SQL table candidates: `options`, `message`, `group_message`, `answer`.
- `getAll` (line 24): no direct request-field reference.
- `getAllMethod` (line 34): no direct request-field reference.
- `get` (line 46): `req.params.id`.
- `optionsByMessage` (line 59): `req.params.idMessage`.
- `optionsById` (line 73): no direct request-field reference.
- `optionsByAction` (line 87): no direct request-field reference.
- `optionByActionWithJsonFormat` (line 101): no direct request-field reference.
- `optionByAction` (line 119): no direct request-field reference.
- `getPrompt` (line 134): no direct request-field reference.
- `getInAnswer` (line 151): no direct request-field reference.
- `getInAnswerLike` (line 164): no direct request-field reference.
- `optionsByGroupAndNotAsociated` (line 262): `req.params.idGroup`.
- `createOrUpdate` (line 279): `req.body`.
- `add` (line 288): `req.body`.
- `update` (line 305): `req.body`.
- `removeUnUsefulWords` (line 322): no direct request-field reference.
- `chatGptIntent` (line 332): no direct request-field reference.
- `chatGptIntentHumanAgent` (line 372): no direct request-field reference.

## src/modules/conversations/templateController.ts

- [src/modules/conversations/templateController.ts](../../../WanTrackApi/src/modules/conversations/templateController.ts)
- Dependencies: `../../interfaces/template`, `../../queries/manager`, `../../queries/pagination`.
- SQL table candidates: `template`, `headerType`, `types`, `companies`, `scatterlist_details`.
- `getAll` (line 15): `req.query`.
- `exist` (line 50): `req.params.id`.
- `get` (line 63): `req.params.id`.
- `getOne` (line 85): no direct request-field reference.
- `createOrUpdate` (line 118): `req.body`.
- `add` (line 128): `req.body`.
- `update` (line 154): `req.body`.
- `delete` (line 180): `req.params.id`.
- `replacePlaceholders` (line 192): no direct request-field reference.

## src/modules/conversations/typeController.ts

- [src/modules/conversations/typeController.ts](../../../WanTrackApi/src/modules/conversations/typeController.ts)
- Dependencies: `../../queries/manager`.
- SQL table candidates: `types`.
- `getAll` (line 13): no direct request-field reference.
- `get` (line 25): `req.params.id`.

## src/modules/conversations/urlTypeController.ts

- [src/modules/conversations/urlTypeController.ts](../../../WanTrackApi/src/modules/conversations/urlTypeController.ts)
- Dependencies: `../../interfaces/urlType`, `../../queries/manager`.
- SQL table candidates: `urlType`.
- `getAll` (line 14): no direct request-field reference.
- `exist` (line 25): `req.params.id`.
- `get` (line 38): `req.params.id`.
- `createOrUpdate` (line 51): `req.body`.
- `add` (line 60): `req.body`.
- `update` (line 77): `req.body`.
- `delete` (line 93): `req.body`.

## src/modules/integrations/emailTemplateController.ts

- [src/modules/integrations/emailTemplateController.ts](../../../WanTrackApi/src/modules/integrations/emailTemplateController.ts)
- Dependencies: `../../queries/manager`, `../../tools/chatgpt`, `../../queries/pagination`.
- SQL table candidates: `emailtemplate`, `name`.
- `getAll` (line 15): `req.user`, `req.query`.
- `improveAiEmail` (line 51): `req.body`.
- `getAllMethod` (line 67): no direct request-field reference.
- `getAllMethodCompany` (line 81): no direct request-field reference.
- `get` (line 96): `req.params.id`.
- `add` (line 111): `req.body`.

## src/modules/integrations/emailWebhookController.ts

- [src/modules/integrations/emailWebhookController.ts](../../../WanTrackApi/src/modules/integrations/emailWebhookController.ts)
- Dependencies: `process`, `@aws-sdk/client-ses`, `../../interfaces/emailSend`, `../../queries/logController`, `../../queries/manager`, `../../config/config.json`.
- `post` (line 21): `req.body`.
- `validateDns` (line 92): no direct request-field reference.
- `validateEmail` (line 103): no direct request-field reference.
- `emailParameterValidation` (line 108): no direct request-field reference.

## src/modules/integrations/webhookController.ts

- [src/modules/integrations/webhookController.ts](../../../WanTrackApi/src/modules/integrations/webhookController.ts)
- Dependencies: `../../communication/whatsapp`, `../../interfaces/webhookJson`, `../../interfaces/webhookMessage`, `../../queries/manager`, `../../queries/messageSentController`, `../../tools/util`, `../../queries/companiesController`, `../../queries/pagination`.
- SQL table candidates: `webhookmessages`, `wstemplate`, `companies`, `whatsapp_accounts`, `name`.
- `getAll` (line 20): `req.query.idcompany`, `req.query`.
- `getAllMethod` (line 55): no direct request-field reference.
- `getMethod` (line 69): no direct request-field reference.
- `getMethodByName` (line 90): no direct request-field reference.
- `get` (line 114): `req.params.id`.
- `getByCompany` (line 124): `req.params.idcompany`.
- `getByCompanyMethod` (line 134): no direct request-field reference.
- `add` (line 155): `req.body`.
- `sendMessage` (line 174): `req.body`, `req.user?.typ`, `req.user.idCompany`, `req.body?.templateName`.

## src/modules/integrations/webhookRuleController.ts

- [src/modules/integrations/webhookRuleController.ts](../../../WanTrackApi/src/modules/integrations/webhookRuleController.ts)
- Dependencies: `../../communication/whatsapp`, `../../interfaces/webhookJson`, `../../interfaces/webhookMessage`, `../../queries/manager`, `../../queries/messageSentController`, `../../tools/util`, `../../queries/companiesController`.
- SQL table candidates: `webhook_rule`, `property`.
- `getByWebHook` (line 19): `req.params.idwebhookmessages`.
- `add` (line 35): `req.body`.

## src/modules/messaging/messageReceiveController.ts

- [src/modules/messaging/messageReceiveController.ts](../../../WanTrackApi/src/modules/messaging/messageReceiveController.ts)
- Dependencies: `../../interfaces/messageReceive`, `../../queries/manager`.
- SQL table candidates: `messageReceive`, `companies`, `whatsapp_accounts`, `auditTrail`.
- `getAll` (line 14): no direct request-field reference.
- `getAllMethod` (line 24): no direct request-field reference.
- `get` (line 40): `req.params.id`.
- `getByCompany` (line 58): `req.params.idcompany`.
- `getCompanyByPhoneNumber` (line 76): no direct request-field reference.
- `validateLastMessage` (line 88): no direct request-field reference.
- `add` (line 110): no direct request-field reference.

## src/modules/messaging/messengerController.ts

- [src/modules/messaging/messengerController.ts](../../../WanTrackApi/src/modules/messaging/messengerController.ts)
- Dependencies: `../../queries/manager`, `../../tools/chatgpt`, `../../communication/instagram`.
- `get` (line 15): `req.query`.
- `post` (line 33): `req.body`, `req.body.object`, `req.body.entry`.

## src/modules/messaging/whastAppController.ts

- [src/modules/messaging/whastAppController.ts](../../../WanTrackApi/src/modules/messaging/whastAppController.ts)
- Dependencies: `../../tools/chatgpt`, `../../communication/whatsapp`, `../../communication/whatsappIdentity`, `../../queries/manager`, `../../bot/botActions`, `../../queries/companiesController`, `../../queries/messageSentController`, `../../server/aws`, `../support/conversationStore`, `../../queries/logController`.
- `get` (line 26): `req.query`.
- `post` (line 44): `req.body`.
- `isForwarded` (line 198): no direct request-field reference.
- `ingestMirroredWebhook` (line 202): no direct request-field reference.
- `forwardWebhook` (line 257): `req.body`.
- `postSimple` (line 278): no direct request-field reference.

## src/modules/messaging/whatsappStatusController.ts

- [src/modules/messaging/whatsappStatusController.ts](../../../WanTrackApi/src/modules/messaging/whatsappStatusController.ts)
- Dependencies: `@aws-sdk/client-sqs`, `../../server/awsConfig`, `../../queries/manager`, `../../queries/messageSentController`.
- `pollQueue` (line 16): no direct request-field reference.
- `postSimple` (line 71): no direct request-field reference.

## src/modules/reports/messageReportController.ts

- [src/modules/reports/messageReportController.ts](../../../WanTrackApi/src/modules/reports/messageReportController.ts)
- Dependencies: `console`, `../../queries/manager`.
- SQL table candidates: `messageSent`, `wantrackdb`, `scatterlist`.
- `MessageSendChart` (line 17): `req.query.idcompany`, `req.query.phone`, `req.query.idTemplate`, `req.query.startCreatedDate`, `req.query.endCreatedDate`.
- `MessageDeliveredChart` (line 28): `req.query.idcompany`, `req.query.phone`, `req.query.idTemplate`, `req.query.startCreatedDate`, `req.query.endCreatedDate`.
- `MessageFailedChart` (line 39): `req.query.idcompany`, `req.query.phone`, `req.query.idTemplate`, `req.query.startCreatedDate`, `req.query.endCreatedDate`.
- `MessageReadChart` (line 50): `req.query.idcompany`, `req.query.phone`, `req.query.idTemplate`, `req.query.startCreatedDate`, `req.query.endCreatedDate`.
- `MessageSendPerMonthByCompany` (line 61): no direct request-field reference.
- `MessageSendPerMonth` (line 133): no direct request-field reference.
- `MessageReceiveChart` (line 199): `req.query.idcompany`, `req.query.phone`, `req.query.idTemplate`, `req.query.startCreatedDate`, `req.query.endCreatedDate`.
- `MessageReceivePerMonthByCompany` (line 210): no direct request-field reference.
- `MessageReceivePerMonth` (line 258): no direct request-field reference.
- `CompleteReportByCampaing` (line 285): `req.user`.

## src/modules/reports/messageSentController.ts

- [src/modules/reports/messageSentController.ts](../../../WanTrackApi/src/modules/reports/messageSentController.ts)
- Dependencies: `../../interfaces/messageSent`, `../../queries/manager`, `../../interfaces/client`, `../../communication/sendEmails`, `../support/conversationStore`.
- SQL table candidates: `messageSent`, `scatterlist`, `wstemplate`, `phone`.
- `getAll` (line 17): `req.user`, `req.query.start`, `req.query.year`, `req.query.month`.
- `getAllCount` (line 32): `req.user`, `req.query.year`, `req.query.month`.
- `messagesentCountByYearMonth` (line 47): `req.user`, `req.params.year`, `req.params.month`.
- `getAllMethodCount` (line 62): no direct request-field reference.
- `getScatterListByMessageId` (line 78): no direct request-field reference.
- `getAllMethod` (line 95): no direct request-field reference.
- `get` (line 123): `req.params.id`.
- `getByCompany` (line 149): `req.params.idcompany`, `req.query.start`.
- `getByCompanyMethodCount` (line 159): no direct request-field reference.
- `getByCompanyMethod` (line 180): no direct request-field reference.
- `add` (line 209): no direct request-field reference.
- `addWebhook` (line 230): no direct request-field reference.
- `updatedDelivered` (line 249): no direct request-field reference.
- `updatedRead` (line 267): no direct request-field reference.
- `updatedFailed` (line 286): no direct request-field reference.
- `testPoC` (line 305): `req.params.messageid`.
- `SendEmailWhenFaildMessage` (line 310): no direct request-field reference.
- `getmessageSent` (line 320): no direct request-field reference.

## src/modules/reports/wantrackPixelController.ts

- [src/modules/reports/wantrackPixelController.ts](../../../WanTrackApi/src/modules/reports/wantrackPixelController.ts)
- Dependencies: `../../queries/manager`.
- SQL table candidates: `emailPixel`.
- `add` (line 13): `req.body`, `req.params.from`, `req.params.to`, `req.params.idcompany`.

## src/modules/scatter/leadsFlowController.ts

- [src/modules/scatter/leadsFlowController.ts](../../../WanTrackApi/src/modules/scatter/leadsFlowController.ts)
- Dependencies: `../../interfaces/leadsFlow`, `../../interfaces/messageSent`, `../../queries/manager`.
- SQL table candidates: `leadsFlow`.
- `getAll` (line 15): `req.params.idscatterlist`.
- `getAllMethod` (line 30): no direct request-field reference.
- `add` (line 48): no direct request-field reference.

## src/modules/scatter/scatterListController.ts

- [src/modules/scatter/scatterListController.ts](../../../WanTrackApi/src/modules/scatter/scatterListController.ts)
- Dependencies: `../../communication/whatsapp`, `../../tools/util`, `../../queries/companiesController`, `../../queries/manager`, `../../queries/messageSentController`, `../../queries/pagination`, `xlsx`.
- SQL table candidates: `scatterlist`, `companies`, `wstemplate`, `whatsapp_accounts`, `scatterlist_details`, `name`, `messageSent`.
- `getAll` (line 22): `req.query`.
- `getAllLeads` (line 32): `req.query`.
- `getLists` (line 42): no direct request-field reference.
- `getMethod` (line 75): no direct request-field reference.
- `getScatterlistdetailsMethod` (line 91): no direct request-field reference.
- `get` (line 106): `req.params.id`.
- `getByCompany` (line 116): `req.params.idcompany`.
- `add` (line 134): `req.body`.
- `replaceText` (line 156): no direct request-field reference.
- `sleep` (line 164): no direct request-field reference.
- `copyScatterList` (line 168): `req.body`.
- `sendScatterListById` (line 190): no direct request-field reference.
- `sendScatterList` (line 222): `req.body`.
- `countYesNoValues` (line 252): no direct request-field reference.
- `escapeXml` (line 265): no direct request-field reference.
- `getZipPartText` (line 274): no direct request-field reference.
- `upsertZipPart` (line 279): no direct request-field reference.
- `pngChunk` (line 290): no direct request-field reference.
- `createPieChartPng` (line 299): no direct request-field reference.
- `twoCellPictureAnchor` (line 363): no direct request-field reference.
- `addPieImagesToWorkbook` (line 386): no direct request-field reference.
- `downloadReportExcel` (line 436): `req.params.idscatterlist`.
- `sendMessage` (line 520): no direct request-field reference.

## src/modules/scatter/scatterListDetailsController.ts

- [src/modules/scatter/scatterListDetailsController.ts](../../../WanTrackApi/src/modules/scatter/scatterListDetailsController.ts)
- Dependencies: `../../queries/manager`.
- SQL table candidates: `scatterlist_details`, `messageSent`, `phone`.
- `getAll` (line 13): no direct request-field reference.
- `get` (line 27): `req.params.id`.
- `getCountByScatterList` (line 42): `req.params.id`.
- `billedContactMessage` (line 60): no direct request-field reference.
- `hasBilledMessage` (line 64): no direct request-field reference.
- `getByScatterList` (line 74): `req.query.pstart`, `req.params.idscatterlist`.
- `add` (line 144): `req.body`.
- `remove` (line 192): `req.params.id`.
- `updateSelected` (line 220): `req.body`.
- `updateSelectedAll` (line 240): `req.body`.

## src/modules/support/adviserController.ts

- [src/modules/support/adviserController.ts](../../../WanTrackApi/src/modules/support/adviserController.ts)
- Dependencies: `../../queries/manager`, `../../interfaces/adviser`, `../../queries/pagination`.
- SQL table candidates: `adviser`, `name`.
- `getAll` (line 15): no direct request-field reference.
- `getAllMethod` (line 25): no direct request-field reference.
- `get` (line 41): `req.params.idadviser`.
- `getById` (line 51): no direct request-field reference.
- `getByCompany` (line 64): `req.query`, `req.params.idcompany`.
- `createOrUpdate` (line 95): `req.body`.
- `delete` (line 115): `req.body`.

## src/modules/support/callController.ts

- [src/modules/support/callController.ts](../../../WanTrackApi/src/modules/support/callController.ts)
- Dependencies: `../../queries/manager`, `../../interfaces/call`.
- SQL table candidates: `adviser`, `transcription`.
- `getAll` (line 14): no direct request-field reference.
- `getAllMethod` (line 24): no direct request-field reference.
- `get` (line 41): `req.params.idcall`.
- `getById` (line 51): no direct request-field reference.
- `getByAdviser` (line 64): `req.params.idadviser`.
- `getByCompany` (line 78): `req.params.idcompany`.
- `CallExist` (line 96): no direct request-field reference.
- `CallTranscriptionExist` (line 111): no direct request-field reference.
- `clonecall` (line 135): no direct request-field reference.
- `createOrUpdate` (line 153): `req.body`.
- `createOrUpdateMethod` (line 178): no direct request-field reference.
- `delete` (line 202): `req.body`.
- `getAVGByAdvise` (line 221): `req.params.idadviser`.
- `getAVGByCompany` (line 236): `req.params.idcompany`.
- `getMainEmotionByAdvise` (line 252): `req.params.idadviser`.
- `getMainEmotionByCompany` (line 266): `req.params.idcompany`.
- `getMainFellingByAdvise` (line 281): `req.params.idadviser`.
- `getMainFellingByCompany` (line 295): `req.params.idcompany`.
- `getDurationByAdvise` (line 310): `req.params.idadviser`.
- `getDurationByCompany` (line 323): `req.params.idcompany`.
- `getScorenpsByAdvise` (line 337): `req.params.idadviser`.
- `getScorenpsByCompany` (line 350): `req.query`, `req.params.idcompany`.
- `getSatisfactionByAdvise` (line 401): `req.params.idadviser`.
- `getSatisfactionByCompany` (line 414): `req.params.idcompany`.
- `getChatsByAdvise` (line 428): `req.params.idadviser`.
- `getCallsByAdvise` (line 441): `req.params.idadviser`.
- `getChatsByCompany` (line 454): `req.params.idcompany`.
- `getCallsByCompany` (line 468): `req.params.idcompany`.
- `getInformationCompanyByAdvise` (line 482): `req.params.idcompany`.
- `getLastInformationCompany` (line 504): `req.params.months`, `req.params.idcompany`.

## src/modules/support/chatsController.ts

- [src/modules/support/chatsController.ts](../../../WanTrackApi/src/modules/support/chatsController.ts)
- Dependencies: `../../communication/whatsapp`, `../../interfaces/log`, `../../interfaces/sendMessage`, `../../tools/chatgpt`, `../../queries/alertController`, `../../queries/manager`, `../../interfaces/chatAssignments`, `xlsx`, `./stopAiListController`, `../channels/notificationController`, `../../SocketsWanTrack`, `./conversationStore`.
- SQL table candidates: `companies`, `whatsapp_accounts`, `auditTrail`, `user_department`, `departments`, `users`, `chatAssignments`, `stopIAList`, `alert`, `message`, `scatterlist_details`.
- `getChatsCount` (line 24): `req.user`, `req.query`.
- `getChats` (line 39): `req.user`, `req.query`.
- `getChatCompanies` (line 52): `req.user?.idrol`.
- `getChatLines` (line 68): `req.user?.idrol`, `req.user?.idCompany`, `req.user.idCompany`, `req.query`.
- `getChatsByPhone` (line 105): `req.user`, `req.params.phone`, `req.params.phoneNumberId`, `req.query.markRead`, `req.query.limit`, `req.query.before`.
- `getByDate` (line 134): `req.params.phone`, `req.params.startDate`, `req.params.endDate`.
- `sendMessage` (line 156): `req.user`, `req.body.phone`, `req.body.phoneNumberId`, `req.body`.
- `sendMedia` (line 169): `req.body`, `req.user`.
- `getSuggestionText` (line 193): `req.params.text`.
- `add` (line 209): no direct request-field reference.
- `validateSelectedChatInfo` (line 228): no direct request-field reference.
- `addChatAssignment` (line 237): `req.body.phoneNumberId`, `req.user.idrol`, `req.user.idCompany`, `req.body.phone`, `req.body.iddept`.
- `claim` (line 261): `req.user`, `req.body.phone`, `req.body.phoneNumberId`, `req.body.iddept`, `req.user.iduser`.
- `getAvailableDepartments` (line 295): no direct request-field reference.
- `assignChat` (line 309): no direct request-field reference.
- `getAssignment` (line 464): `req.user`, `req.params.phone`, `req.params.phoneNumberId`.
- `getActiveAssignments` (line 485): `req.user`, `req.query`.
- `closeAssignmentById` (line 528): `req.params.id`, `req.user`.
- `closeAllAssignments` (line 577): `req.user`, `req.body?.companyIds`, `req.body?.phoneNumberIds`, `req.body?.allCompanies`.
- `closeAssignment` (line 638): no direct request-field reference.
- `activateHumanAttention` (line 655): no direct request-field reference.
- `canAccessChat` (line 674): no direct request-field reference.
- `sendMessageMethod` (line 699): no direct request-field reference.
- `getLastMessageTime` (line 724): no direct request-field reference.
- `downloadReportExcel` (line 747): `req.params.idgroup`.

## src/modules/support/conversationStore.ts

- [src/modules/support/conversationStore.ts](../../../WanTrackApi/src/modules/support/conversationStore.ts)
- Dependencies: `../../queries/manager`, `../../interfaces/log`, `../../communication/whatsappIdentity`, `../../queries/pagination`, `../../SocketsWanTrack`.
- SQL table candidates: `whatsapp_accounts`, `conversations`, `phone_number_id`, `conversation_messages`, `body`, `companies`, `user_department`, `chatAssignments`, `users`, `departments`.
- `recordFromAudit` (line 17): no direct request-field reference.
- `isPlatformAdmin` (line 138): no direct request-field reference.
- `companyAssignmentEnabled` (line 142): no direct request-field reference.
- `assignmentVisibilitySql` (line 152): no direct request-field reference.
- `phoneNumberFilter` (line 169): no direct request-field reference.
- `appendPhoneNumberFilter` (line 184): no direct request-field reference.
- `companyFilter` (line 195): no direct request-field reference.
- `appendCompanyFilter` (line 210): no direct request-field reference.
- `listInbox` (line 222): no direct request-field reference.
- `countInbox` (line 333): no direct request-field reference.
- `getThread` (line 363): no direct request-field reference.
- `getTextContext` (line 418): no direct request-field reference.
- `markRead` (line 444): no direct request-field reference.
- `hoursSinceLastInbound` (line 462): no direct request-field reference.
- `setStatus` (line 489): no direct request-field reference.
- `updateStatusByWamid` (line 521): no direct request-field reference.
- `findByPhone` (line 557): no direct request-field reference.
- `getByPeer` (line 566): no direct request-field reference.
- `getInboxRow` (line 574): no direct request-field reference.
- `normalizeWamid` (line 609): no direct request-field reference.
- `mapMetaStatus` (line 620): no direct request-field reference.
- `emitLive` (line 628): no direct request-field reference.

## src/modules/support/stopAiListController.ts

- [src/modules/support/stopAiListController.ts](../../../WanTrackApi/src/modules/support/stopAiListController.ts)
- Dependencies: `../../queries/manager`, `./conversationStore`.
- SQL table candidates: `stopIAList`, `whatsapp_accounts`, `chatAssignments`, `user_department`.
- `isStopAI` (line 14): no direct request-field reference.
- `isStoped` (line 31): `req.user`, `req.params.phone`, `req.params.phoneNumberId`.
- `start` (line 51): `req.user`, `req.body.phone`, `req.body.phoneNumberId`.
- `stop` (line 72): `req.user`, `req.body.phone`, `req.body.phoneNumberId`, `req.user.idrol`, `req.user.iduser`.
- `add` (line 107): no direct request-field reference.
- `delete` (line 123): no direct request-field reference.
- `canAccessChat` (line 138): no direct request-field reference.

## src/modules/users/loginController.ts

- [src/modules/users/loginController.ts](../../../WanTrackApi/src/modules/users/loginController.ts)
- Dependencies: `../../security/authenticate`, `../../queries/manager`, `crypto`.
- SQL table candidates: `users`, `user_rol`.
- `post` (line 15): `req.body`.
- `validate` (line 44): `req.params.token`.

## src/modules/users/rolController.ts

- [src/modules/users/rolController.ts](../../../WanTrackApi/src/modules/users/rolController.ts)
- Dependencies: `../../queries/manager`.
- SQL table candidates: `roles`, `user_rol`.
- `getAll` (line 13): no direct request-field reference.
- `asign` (line 23): no direct request-field reference.

## src/modules/users/userController.ts

- [src/modules/users/userController.ts](../../../WanTrackApi/src/modules/users/userController.ts)
- Dependencies: `../../interfaces/user`, `../../queries/manager`, `../../queries/pagination`, `./rolController`.
- SQL table candidates: `users`, `user_rol`, `roles`, `user_department`, `rol_module`, `name`, `departments`, `user`.
- `getAll` (line 16): `req.user`, `req.query`.
- `get` (line 53): `req.params.id`, `req.user.idrol`, `req.user.idCompany`.
- `getByEmail` (line 83): `req.params.email`.
- `createOrUpdate` (line 102): `req.body`, `req.user`.
- `syncDepartments` (line 134): no direct request-field reference.
- `hiddenUser` (line 166): `req.body`.

## src/queries/PoCrigsController.ts

- [src/queries/PoCrigsController.ts](../../../WanTrackApi/src/queries/PoCrigsController.ts)
- Dependencies: `./manager`, `../interfaces/client`, `../communication/whatsapp`, `xlsx`, `uuid`, `./scatterListController`.
- SQL table candidates: `scatterlist`, `name`, `scatterlist_details`, `phone`, `data`.
- `getAll` (line 18): no direct request-field reference.
- `addScatterlist` (line 27): no direct request-field reference.
- `addScatterlistDetail` (line 81): no direct request-field reference.
- `ExecuteFlow` (line 116): `req.params.scatterlistid`.
- `CreateFlow` (line 124): `req.body.data`.

## src/queries/adviserController.ts

- [src/queries/adviserController.ts](../../../WanTrackApi/src/queries/adviserController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/support/adviserController`.

## src/queries/alertController.ts

- [src/queries/alertController.ts](../../../WanTrackApi/src/queries/alertController.ts)
- Dependencies: `./manager`.
- SQL table candidates: `alert`.
- `add` (line 13): no direct request-field reference.
- `delete` (line 29): no direct request-field reference.

## src/queries/answerController.ts

- [src/queries/answerController.ts](../../../WanTrackApi/src/queries/answerController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/conversations/answerController`.

## src/queries/answerTemplateTypeController.ts

- [src/queries/answerTemplateTypeController.ts](../../../WanTrackApi/src/queries/answerTemplateTypeController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/conversations/answerTemplateTypeController`.

## src/queries/awsController.ts

- [src/queries/awsController.ts](../../../WanTrackApi/src/queries/awsController.ts)
- Dependencies: `../interfaces/log`, `./manager`, `../server/aws`, `mime-types`, `./feelingBetaController`, `../config/config.json`.
- `getScatterListImagesBucket` (line 19): no direct request-field reference.
- `getTemplateMediaBucket` (line 26): no direct request-field reference.
- `getFile` (line 33): `req.params.apikey`, `req.params.fileName`, `req.params.bucketName`, `req.params.companyId`.
- `getFileAlternative` (line 57): `req.params.fileName`, `req.params.bucketName`.
- `getFileAudio` (line 82): `req.params.apikey`, `req.params.fileName`, `req.params.bucketName`, `req.params.companyId`.
- `uploadFile` (line 107): `req.params.bucketName`, `req.params.companyId`.
- `uploadScatterListImage` (line 126): `req.params.bucketName`.
- `uploadTemplateMedia` (line 149): `req.params.bucketName`.
- `uploadFileApp` (line 178): `req.params.bucketName`, `req.params.companyId`, `req.params.idadviser`.

## src/queries/buttonTypeController.ts

- [src/queries/buttonTypeController.ts](../../../WanTrackApi/src/queries/buttonTypeController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/conversations/buttonTypeController`.

## src/queries/buttonsTemplateController.ts

- [src/queries/buttonsTemplateController.ts](../../../WanTrackApi/src/queries/buttonsTemplateController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/conversations/buttonsTemplateController`.

## src/queries/callController.ts

- [src/queries/callController.ts](../../../WanTrackApi/src/queries/callController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/support/callController`.

## src/queries/chatsController.ts

- [src/queries/chatsController.ts](../../../WanTrackApi/src/queries/chatsController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/support/chatsController`.

## src/queries/clientAnswerTypeController.ts

- [src/queries/clientAnswerTypeController.ts](../../../WanTrackApi/src/queries/clientAnswerTypeController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/conversations/clientAnswerTypeController`.

## src/queries/companiesController.ts

- [src/queries/companiesController.ts](../../../WanTrackApi/src/queries/companiesController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/companies/companiesController`.

## src/queries/customerController.ts

- [src/queries/customerController.ts](../../../WanTrackApi/src/queries/customerController.ts)
- Dependencies: `./manager`.
- SQL table candidates: `customer`, `name`.
- `add` (line 13): no direct request-field reference.

## src/queries/documentsTrainController.ts

- [src/queries/documentsTrainController.ts](../../../WanTrackApi/src/queries/documentsTrainController.ts)
- Dependencies: `./manager`.
- SQL table candidates: `documentsTrain`, `name`.
- `getAll` (line 13): `req.params.idwhatsapp_account`.
- `get` (line 30): `req.params.id`.
- `getByWhatsAppAccount` (line 46): `req.params.idwhatsappaccount`.
- `createOrUpdate` (line 62): `req.body`.
- `delete` (line 83): `req.body`.

## src/queries/emailTemplateController.ts

- [src/queries/emailTemplateController.ts](../../../WanTrackApi/src/queries/emailTemplateController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/integrations/emailTemplateController`.

## src/queries/emailWebhookController.ts

- [src/queries/emailWebhookController.ts](../../../WanTrackApi/src/queries/emailWebhookController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/integrations/emailWebhookController`.

## src/queries/feelingBetaController.ts

- [src/queries/feelingBetaController.ts](../../../WanTrackApi/src/queries/feelingBetaController.ts)
- Dependencies: `../tools/chatgpt`, `./manager`, `axios`, `../tools/lexycon/afinn.json`, `../tools/lexycon/nrc.json`, `./callController`, `../conversationutil/jsonschemaFeelingSummary.json`, `../conversationutil/jsonschemaSpecificFeeling.json`, `music-metadata`.
- `getSpecificFeeling` (line 26): `req.body.json`.
- `getSpecificFeelingMethod` (line 47): no direct request-field reference.
- `getSpecificFeelingMethodChat` (line 73): no direct request-field reference.
- `getChatToJsonChat` (line 100): no direct request-field reference.
- `getSpecificFeelingSummaryMethod` (line 129): no direct request-field reference.
- `post` (line 156): `req.body.url`, `req.body.languague`.
- `analyzeSentiment` (line 198): no direct request-field reference.
- `requestTranscription` (line 203): no direct request-field reference.
- `getTranscriptionResult` (line 228): no direct request-field reference.
- `formatSeconds` (line 254): no direct request-field reference.
- `categorizeFeeling` (line 260): no direct request-field reference.
- `postSummaryChat` (line 275): `req.params.idadviser`, `req.params.languague`.
- `postSummary` (line 286): `req.body.url`, `req.body.idadviser`, `req.body.languague`.
- `postSummaryMethod` (line 311): no direct request-field reference.
- `summaryChat` (line 336): no direct request-field reference.
- `summary` (line 373): no direct request-field reference.
- `compareTranscription` (line 484): no direct request-field reference.
- `fetchAudioMetadata` (line 490): no direct request-field reference.
- `xmlShcemaaFeelingSummaryChat` (line 515): no direct request-field reference.
- `xmlSchemaChatConversation` (line 578): no direct request-field reference.
- `getEmotionsByLanguague` (line 597): no direct request-field reference.
- `getSentimentsByLanguague` (line 611): no direct request-field reference.
- `getLanguague` (line 625): no direct request-field reference.

## src/queries/groupController.ts

- [src/queries/groupController.ts](../../../WanTrackApi/src/queries/groupController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/conversations/groupController`.

## src/queries/headerTypeController.ts

- [src/queries/headerTypeController.ts](../../../WanTrackApi/src/queries/headerTypeController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/conversations/headerTypeController`.

## src/queries/headersController.ts

- [src/queries/headersController.ts](../../../WanTrackApi/src/queries/headersController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/conversations/headersController`.

## src/queries/lastMessageController.ts

- [src/queries/lastMessageController.ts](../../../WanTrackApi/src/queries/lastMessageController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/conversations/lastMessageController`.

## src/queries/leadsFlowController.ts

- [src/queries/leadsFlowController.ts](../../../WanTrackApi/src/queries/leadsFlowController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/scatter/leadsFlowController`.

## src/queries/logController.ts

- [src/queries/logController.ts](../../../WanTrackApi/src/queries/logController.ts)
- Dependencies: `../interfaces/log`, `./manager`, `../modules/support/conversationStore`.
- SQL table candidates: `auditTrail`, `auditrail_email`.
- `getByDate` (line 15): `req.params.phone`, `req.params.startDate`, `req.params.endDate`.
- `getContext` (line 33): no direct request-field reference.
- `add` (line 65): no direct request-field reference.
- `addEmail` (line 85): no direct request-field reference.

## src/queries/messageController.ts

- [src/queries/messageController.ts](../../../WanTrackApi/src/queries/messageController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/conversations/messageController`.

## src/queries/messageReceiveController.ts

- [src/queries/messageReceiveController.ts](../../../WanTrackApi/src/queries/messageReceiveController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/messaging/messageReceiveController`.

## src/queries/messageReportController.ts

- [src/queries/messageReportController.ts](../../../WanTrackApi/src/queries/messageReportController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/reports/messageReportController`.

## src/queries/messageSentController.ts

- [src/queries/messageSentController.ts](../../../WanTrackApi/src/queries/messageSentController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/reports/messageSentController`.

## src/queries/messengerController.ts

- [src/queries/messengerController.ts](../../../WanTrackApi/src/queries/messengerController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/messaging/messengerController`.

## src/queries/notificationController.ts

- [src/queries/notificationController.ts](../../../WanTrackApi/src/queries/notificationController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/channels/notificationController`.

## src/queries/optionController.ts

- [src/queries/optionController.ts](../../../WanTrackApi/src/queries/optionController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/conversations/optionController`.

## src/queries/placesController.ts

- [src/queries/placesController.ts](../../../WanTrackApi/src/queries/placesController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/companies/placesController`.

## src/queries/scatterListController.ts

- [src/queries/scatterListController.ts](../../../WanTrackApi/src/queries/scatterListController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/scatter/scatterListController`.

## src/queries/scatterListDetailsController.ts

- [src/queries/scatterListDetailsController.ts](../../../WanTrackApi/src/queries/scatterListDetailsController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/scatter/scatterListDetailsController`.

## src/queries/schedulescatterController.ts

- [src/queries/schedulescatterController.ts](../../../WanTrackApi/src/queries/schedulescatterController.ts)
- Dependencies: `./manager`, `../interfaces/schedulescatter`.
- SQL table candidates: `schedulescatter`, `date`.
- `getAll` (line 14): no direct request-field reference.
- `get` (line 28): `req.params.id`.
- `getByBetweenDates` (line 43): `req.query.startdate`, `req.query.enddate`.
- `add` (line 58): `req.body`.
- `delete` (line 77): `req.body`.

## src/queries/scoreController.ts

- [src/queries/scoreController.ts](../../../WanTrackApi/src/queries/scoreController.ts)
- Dependencies: `../interfaces/score`, `./manager`.
- SQL table candidates: `score`.
- `getAll` (line 14): no direct request-field reference.
- `add` (line 25): no direct request-field reference.

## src/queries/specialWordsController.ts

- [src/queries/specialWordsController.ts](../../../WanTrackApi/src/queries/specialWordsController.ts)
- Dependencies: `./manager`.
- SQL table candidates: `specialWords`, `answer`, `lastmessage`.
- `hasSpecialWordEnd` (line 13): no direct request-field reference.

## src/queries/stopAiListController.ts

- [src/queries/stopAiListController.ts](../../../WanTrackApi/src/queries/stopAiListController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/support/stopAiListController`.

## src/queries/templateController.ts

- [src/queries/templateController.ts](../../../WanTrackApi/src/queries/templateController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/conversations/templateController`.

## src/queries/typeController.ts

- [src/queries/typeController.ts](../../../WanTrackApi/src/queries/typeController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/conversations/typeController`.

## src/queries/urlTypeController.ts

- [src/queries/urlTypeController.ts](../../../WanTrackApi/src/queries/urlTypeController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/conversations/urlTypeController`.

## src/queries/wantrackPixelController.ts

- [src/queries/wantrackPixelController.ts](../../../WanTrackApi/src/queries/wantrackPixelController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/reports/wantrackPixelController`.

## src/queries/webhookController.ts

- [src/queries/webhookController.ts](../../../WanTrackApi/src/queries/webhookController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/integrations/webhookController`.

## src/queries/webhookRuleController.ts

- [src/queries/webhookRuleController.ts](../../../WanTrackApi/src/queries/webhookRuleController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/integrations/webhookRuleController`.

## src/queries/whastAppController.ts

- [src/queries/whastAppController.ts](../../../WanTrackApi/src/queries/whastAppController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/messaging/whastAppController`.

## src/queries/whastAppTemplateController.ts

- [src/queries/whastAppTemplateController.ts](../../../WanTrackApi/src/queries/whastAppTemplateController.ts)
- Dependencies: `./manager`, `../services/metaService`, `./pagination`.
- SQL table candidates: `wstemplate`, `name`, `whatsapp_accounts`, `INFORMATION_SCHEMA`.
- `getAll` (line 16): `req.user`, `req.query`.
- `getByCompany` (line 56): `req.user`.
- `getAllMethod` (line 71): no direct request-field reference.
- `get` (line 89): `req.params.id`.
- `getByCompanyMethod` (line 107): no direct request-field reference.
- `add` (line 126): `req.body`, `req.user`.
- `refreshMetaStatus` (line 222): `req.params.id`.
- `getCompanyPhoneNumberAccount` (line 269): no direct request-field reference.
- `getTemplateWhatsAppAccount` (line 280): no direct request-field reference.
- `getMetaTemplateStatus` (line 294): no direct request-field reference.
- `validateTemplate` (line 311): no direct request-field reference.
- `buildMetaTemplatePayload` (line 345): no direct request-field reference.
- `resolveHeaderHandle` (line 404): no direct request-field reference.
- `buildMetaButton` (line 420): no direct request-field reference.
- `buildVariableSamples` (line 443): no direct request-field reference.
- `parseButtons` (line 450): no direct request-field reference.
- `normalizeButtons` (line 460): no direct request-field reference.
- `getHeaderToSave` (line 464): no direct request-field reference.
- `countVariables` (line 468): no direct request-field reference.
- `countNonVariableCharacters` (line 473): no direct request-field reference.
- `normalizeExternalError` (line 477): no direct request-field reference.
- `ensureTemplateColumns` (line 492): no direct request-field reference.

## src/queries/whatsappAccountController.ts

- [src/queries/whatsappAccountController.ts](../../../WanTrackApi/src/queries/whatsappAccountController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/channels/whatsappAccountController`.

## src/queries/whatsappStatusController.ts

- [src/queries/whatsappStatusController.ts](../../../WanTrackApi/src/queries/whatsappStatusController.ts) — compatibility re-export; follow its import.
- Dependencies: `../modules/messaging/whatsappStatusController`.

