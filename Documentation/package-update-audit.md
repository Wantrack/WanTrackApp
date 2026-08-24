# Auditoria de paquetes

Fecha: 2026-08-24

Objetivo: revisar dependencias antes de continuar el refactor para evitar paquetes deprecados, vulnerabilidades conocidas y actualizaciones grandes mezcladas con cambios de arquitectura.

## Comandos ejecutados

Frontend:

```text
npm audit --json
npm outdated --json
npm ls --depth=0
```

API:

```text
npm audit --json
npm outdated --json
npm ls --depth=0
```

Resultado de seguridad:

- Frontend: 0 vulnerabilidades reportadas por `npm audit`.
- API: 0 vulnerabilidades reportadas por `npm audit`.

## Hallazgos principales

### Frontend

Dependencia directa deprecada:

- `bootstrap@4.6.2`: version sin soporte. Migrar a Bootstrap 5 requiere revisar SCSS y componentes porque el tema actual importa parciales de Bootstrap 4 como `custom-forms`, `jumbotron`, `media` y `print`.

Dependencias transitivas deprecadas:

- El lockfile contiene deprecaciones heredadas principalmente de `react-scripts@5.0.1` y su toolchain: plugins Babel `proposal-*`, `eslint@8`, `glob@7`, `inflight`, `rimraf@3`, `rollup-plugin-terser`, Workbox y otros.
- No conviene intentar corregir esas transitivas una por una. La salida real es migrar fuera de CRA/react-scripts o actualizar el toolchain completo en una fase propia.

Paquetes con actualizacion menor/parche razonable:

```text
ajv: 8.17.1 -> 8.20.0
axios: 1.9.0 -> 1.19.0
react: 19.1.0 -> 19.2.8
react-dom: 19.1.0 -> 19.2.8
react-pdftotext: 1.3.4 -> 1.3.6
react-tooltip: 5.28.1 -> 5.30.1
socket.io-client: 4.8.1 -> 4.8.3
```

Paquetes con actualizacion mayor o riesgo funcional:

```text
@fortawesome/fontawesome-free: 6.4.0 -> 7.3.1
bootstrap: 4.6.2 -> 5.3.8
chart.js: 3.9.1 -> 4.5.1
react-chartjs-2: 3.3.0 -> 5.3.1
react-loader-spinner: 6.1.6 -> 8.0.2
react-router-dom: 6.11.1 -> 7.18.2
react-tooltip: 5.x -> 6.x
react-spinners: 0.13.8 -> 0.17.0
sass: 1.62.1 -> 1.103.1
typescript: 5.0.4 -> 7.0.2
```

Notas:

- `xlsx@0.18.5` no reporta vulnerabilidades en `npm audit`, pero se usa para leer archivos del usuario en frontend (`src/util/files.js`, `src/views/ScatterList.js`) y en API (`PoCrigsController`). Conviene revisarlo aparte porque el paquete npm no muestra una ruta simple de upgrade mayor.
- `react-scripts@5.0.1` mantiene mucho ruido transitorio deprecado. Recomendacion: no tocarlo en la misma fase que Bootstrap/Router/Chart; planear migracion a Vite u otro build tool.

### API

Dependencias directas deprecadas:

- `aws-sdk@2.1692.0`: AWS SDK v2 esta en end-of-support. Ya existe uso parcial de AWS SDK v3 en `server/aws.ts` con `@aws-sdk/client-s3`, pero quedan usos de v2 en SES, Polly y SQS.
- `fluent-ffmpeg@2.1.3`: paquete sin soporte.
- `multer@1.4.5-lts.1`: Multer 1.x esta deprecado por vulnerabilidades corregidas en 2.x.

Dependencias transitivas deprecadas:

- `node-domexception`: heredado; bajo riesgo directo.
- `querystring`: API legacy; aparece como dependencia transitiva.

Paquetes con actualizacion menor/parche razonable:

```text
@aws-sdk/client-s3: 3.686.0 -> 3.1116.0
@types/node: 20.17.30 -> 20.19.43
@types/nodemailer: 6.4.17 -> 6.4.24
aws-sdk: 2.1692.0 -> 2.1693.0
cheerio: 1.0.0 -> 1.2.0
chrono-node: 2.8.0 -> 2.10.1
compression: 1.7.5 -> 1.8.1
cors: 2.8.5 -> 2.8.6
express: 4.21.1 -> 4.22.2
jsonwebtoken: 9.0.2 -> 9.0.3
mongoose: 8.13.2 -> 8.24.4
morgan: 1.10.0 -> 1.11.0
multer: 1.4.5-lts.1 -> 1.4.5-lts.2
mysql2: 3.11.4 -> 3.24.2
newrelic: 12.6.0 -> 12.25.1
node-cron: 4.0.5 -> 4.6.0
nodemailer: 6.10.0 -> 6.10.1
openai: 4.95.1 -> 4.104.0
pdf-parse: 1.1.1 -> 1.1.4
socket.io: 4.8.1 -> 4.8.3
typescript: 5.6.3 -> 5.9.3
```

Paquetes con actualizacion mayor o riesgo funcional:

```text
amqplib: 0.10.9 -> 2.0.1
express: 4.x -> 5.x
helmet: 7.x -> 8.x
mime-types: 2.x -> 3.x
mongoose: 8.x -> 9.x
multer: 1.x -> 2.x
music-metadata: 7.x -> 11.x
natural: 7.x -> 8.x
newrelic: 12.x -> 13.x
nodemailer: 6.x -> 9.x
openai: 4.x -> 6.x
pdf-parse: 1.x -> 2.x
tesseract.js: 6.x -> 7.x
typescript: 5.x -> 7.x
```

Notas:

- `path@0.12.7` esta instalado como dependencia, pero el codigo usa `path` como builtin de Node. Se puede eliminar del `package.json` del API despues de validar build.
- `aws-sdk` v2 aparece en:
  - `src/communication/sendEmails.ts`
  - `src/modules/integrations/emailWebhookController.ts`
  - `src/tools/polly.ts`
  - `src/server/awsConfig.ts`
  - `src/providers/emailSESProvider.ts`
- `multer` aparece en uploads locales/memoria y S3. Migrar a `multer@2` debe validarse con endpoints de upload.

## Plan recomendado

### Fase A: actualizaciones conservadoras

Actualizar solo parches/minors dentro del mismo major y ejecutar builds.

Frontend:

```text
ajv
axios
react
react-dom
react-pdftotext
react-tooltip@5
socket.io-client
```

API:

```text
@aws-sdk/client-s3
@types/node@20
@types/nodemailer@6
cheerio
chrono-node
compression
cors
express@4
jsonwebtoken
mongoose@8
morgan
multer@1.4.5-lts.2
mysql2
newrelic@12
node-cron
nodemailer@6
openai@4
pdf-parse@1
socket.io
typescript@5
```

Validacion minima:

```text
npm run build
npm audit
```

### Fase B: deprecados con cambio controlado

Prioridad:

1. Migrar `multer` 1.x a 2.x y probar uploads.
2. Migrar AWS SDK v2 a v3 en SES, Polly y SQS.
3. Revisar reemplazo o encapsulamiento de `fluent-ffmpeg`.
4. Evaluar uso de `xlsx` para archivos subidos por usuarios.

### Fase C: frontend/toolchain

Planear como historia separada:

1. Migrar `react-scripts`/CRA.
2. Migrar Bootstrap 4 a 5.
3. Migrar Chart.js 3 a 4 junto con `react-chartjs-2`.
4. Migrar `react-router-dom` 6 a 7.

## Recomendacion inmediata

No mezclar Fase B/C con el refactor de endpoints. Primero ejecutar Fase A, confirmar build del app y API, y despues seguir con la organizacion por dominios. Las migraciones de `multer`, AWS SDK v3, Bootstrap 5 y CRA deben ir en ramas/pasos propios porque pueden cambiar comportamiento.

## Fase A aplicada

Fecha: 2026-08-24

Frontend actualizado:

```text
ajv -> ^8.20.0
axios -> ^1.19.0
react -> ^19.2.8
react-dom -> ^19.2.8
react-pdftotext -> ^1.3.6
react-tooltip -> ^5.30.1
socket.io-client -> ^4.8.3
```

API actualizado:

```text
@aws-sdk/client-s3 -> ^3.1116.0
@types/node -> ^20.19.43
@types/nodemailer -> ^6.4.24
cheerio -> ^1.2.0
chrono-node -> ^2.10.1
compression -> ^1.8.1
cors -> ^2.8.6
express -> ^4.22.2
jsonwebtoken -> ^9.0.3
mongoose -> ^8.24.4
morgan -> ^1.11.0
multer -> ^1.4.5-lts.2
mysql2 -> ^3.24.2
newrelic -> ^12.25.1
node-cron -> ^4.6.0
nodemailer -> ^6.10.1
openai -> ^4.104.0
pdf-parse -> ^1.1.4
socket.io -> ^4.8.3
typescript -> ^5.9.3
```

Limpieza aplicada:

- Se removio `path` del API porque el codigo usa el builtin de Node.

Validacion posterior:

```text
Frontend: npm audit -> 0 vulnerabilidades
Frontend: npm run build -> exitoso
API: npm audit -> 0 vulnerabilidades
API: npm run build -> exitoso
```

Observaciones:

- `multer@1.4.5-lts.2` seguia mostrando deprecacion porque toda la rama 1.x esta deprecada; se migro a `multer@2` en Fase B.
- `aws-sdk@2` quedaba pendiente por migrar a AWS SDK v3 en SES, Polly y SQS; se removio en Fase B.
- `fluent-ffmpeg` sigue pendiente de revision/reemplazo porque el paquete esta sin soporte.
- Los `package-lock.json` de frontend y API existen localmente, pero estan ignorados por `.gitignore`; por eso los cambios reproducibles quedan expresados en `package.json`.

## Fase B iniciada

Fecha: 2026-08-24

Cambios aplicados en API:

```text
multer -> ^2.2.0
@aws-sdk/client-ses -> ^3.1116.0
@aws-sdk/client-sqs -> ^3.1116.0
@aws-sdk/client-polly -> ^3.1116.0
aws-sdk v2 removido
```

Migraciones internas:

- `src/server/awsConfig.ts`: SQS paso de `AWS.SQS` a `SQSClient`.
- `src/server/aws.ts`: enqueue SQS paso a `SendMessageCommand`.
- `src/modules/messaging/whatsappStatusController.ts`: polling SQS paso a `ReceiveMessageCommand` y `DeleteMessageCommand`.
- `src/providers/emailSESProvider.ts`: envio SES paso a `SESClient` y `SendEmailCommand`.
- `src/modules/integrations/emailWebhookController.ts`: transporte SES para Nodemailer paso a `SESClient` y `SendRawEmailCommand`.
- `src/tools/polly.ts`: Polly paso a `PollyClient` y `SynthesizeSpeechCommand`.
- `src/communication/sendEmails.ts`: se retiro inicializacion AWS v2 que no se estaba usando porque el transporte SES estaba comentado.
- Se retiraron `fluent-ffmpeg` y `@ffmpeg-installer/ffmpeg` porque no tenian uso en `src` y `fluent-ffmpeg` esta deprecado.

Validacion posterior:

```text
API: npm audit -> 0 vulnerabilidades
API: npm run build -> exitoso
Busqueda: sin imports de aws-sdk v2, sin AWS.config y sin .promise() de SDK v2
Busqueda: sin uso de fluent-ffmpeg ni @ffmpeg-installer/ffmpeg
```

Pendiente de Fase B:

- Probar manualmente endpoints de upload que usan `multer@2`:
  - `POST /api/feelingsSummaryChat/:idadviser/:languague`
  - `POST /api/createflow`
  - endpoints AWS upload desde `awsController`
- Probar integraciones reales de AWS:
  - SES email webhook/provider
  - SQS enqueue/poll
  - Polly text-to-speech
- Revisar `xlsx` en flujos de carga de archivos, especialmente `PoCrigsController` y scatter lists.
