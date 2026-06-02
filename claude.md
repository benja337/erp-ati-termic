# CLAUDE.md — ERP ATI Termic SpA

## Descripción del Proyecto

Sistema ERP web de uso interno para **ATI Termic SpA**, empresa chilena de climatización industrial. El sistema gestiona obras en terreno: trabajadores, materiales, finanzas, documentación legal y seguridad ocupacional.

Dos roles de usuario:
- **AdministradorTotal**: acceso completo a todos los módulos.
- **SupervisorObra**: acceso operativo a terreno (bitácoras, evidencias, incidentes, recepción).

---

## Stack Tecnológico

### Frontend
- **React.js** (SPA - Single Page Application, responsiva/mobile adaptable)
- **Axios** para peticiones HTTP a la API REST
- **React Signature Canvas** para firma digital en terreno
- **Leaflet.js / Google Maps API** para mapas interactivos y geolocalización de obras
- **Web Geolocation API** (nativa del navegador) para GPS y validación de radio de trabajo

### Backend
- **Node.js** como entorno de ejecución
- **Express.js** para enrutamiento y API REST
- **Sequelize** como ORM para abstracción de consultas MySQL
- **Multer** para subida de archivos (PDFs e imágenes)
- **Nodemailer** para notificaciones por correo y tokens de recuperación
- **PDFKit / jsPDF** para generación de documentos legales, EPP y anexos en PDF

### Autenticación y Seguridad
- **JWT (JSON Web Tokens)** para sesiones con roles: AdministradorTotal y SupervisorDeObra
- **Bcrypt** para hash seguro de contraseñas
- **HTTPS / TLS 1.2+** para transmisión cifrada

### Base de Datos
- **MySQL** (RDBMS) — base: `erp_ati_termic`
- Accedida vía **Sequelize ORM**

### Infraestructura (producción)
- **Nginx** como proxy inverso hacia la API Node.js
- **Ubuntu Server** en VPS/Cloud (AWS, DigitalOcean o similar)

### Herramientas de Desarrollo
- Git + GitHub, Postman, VS Code, npm

---

## Conexión a Base de Datos (Sequelize)

```js
// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
  }
);

module.exports = sequelize;
```

```env
# .env
DB_HOST=localhost
DB_USER=root
DB_PASS=TU_PASSWORD
DB_NAME=erp_ati_termic
JWT_SECRET=clave_secreta_segura
PORT=3000
```

---

## Esquema de Base de Datos (tablas reales)

```
USUARIO(usuario_rut PK, usuario_nombre, usuario_correo_institucional, usuario_password_hash)
ADMINISTRADOR(administrador_id PK, nivel_acceso, fecha_asignacion, usuario_rut FK)
SUPERVISOR_TERRENO(supervisor_terreno_id PK, registro_certificacion, telefono_emergencia, usuario_rut FK)
SESION(sesion_id PK, fecha_inicio, ultima_actividad, estado, usuario_rut FK)
TOKEN_RECUPERACION(token_codigo_hash PK, fecha_expiracion, usuario_rut FK)
LOG_AUDITORIA(log_id PK, fecha_hora, accion, modulo, usuario_rut FK)

ESPECIALIDAD(especialidad_id PK, especialidad_nombre)
ESTADO_PROYECTO(estado_proyecto_id PK, estado_proyecto_nombre)
PROYECTO(proyecto_codigo_correlativo PK, nombre_obra, porcentaje_avance, presupuesto_asignado, correo_contacto, estado_proyecto_id FK)
TRABAJADOR(trabajador_rut PK, telefono, nombres, correo, especialidad_id FK, proyecto_codigo_correlativo FK)
CONTRATO_LABORAL(contrato_id PK, fecha_inicio, fecha_termino, trabajador_rut FK)
DOCUMENTO_LEGAL(documento_id PK, tipo_documento, anexos, url_pdf, trabajador_rut FK)
ENTREGA_EPP(entrega_epp_id PK, fecha_entrega, detalle_equipos, firma_digital, trabajador_rut FK)

HITO_TECNICO(hito_tecnico_id PK, nombre_hito, avance_fisico, proyecto_codigo_correlativo FK)
EVIDENCIA_FOTOGRAFICA(evidencia_nro PK, url_foto, fecha_captura, latitud, longitud, estado_aprobacion, hito_tecnico_id FK)
BITACORA_DIARIA(bitacora_id PK, fecha, descripcion_actividad, usuario_rut FK, proyecto_codigo_correlativo FK)

PROVEEDOR(proveedor_rut PK, razon_social, giro, contacto)
MATERIAL(material_id PK, nombre, sku, stock_actual, nivel_minimo, unidad_medida)
LOTE_INVENTARIO(lote_id PK, stock_total, fecha_ingreso, cantidad, costo_unitario, material_id FK)
SOLICITUD_MATERIAL(solicitud_id PK, fecha_emision, cantidad_pedida, proyecto_codigo_correlativo FK)
ORDEN_COMPRA(orden_id PK, folio, fecha_generacion, estado, fecha_entrega_pactada, fecha_entrega_real, proyecto_codigo_correlativo FK, proveedor_rut FK)
DETALLE_ORDEN_COMPRA(orden_compra_id FK, material_id FK, cantidad_pedida, precio_unitario)
GUIA_DESPACHO(guia_id PK, folio, fecha_emision, transportista, estado, proveedor_rut FK)
GENERA_GUIA(orden_compra_id FK, guia_despacho_id FK)
DETALLE_GUIA_DESPACHO(orden_compra_id FK, guia_despacho_id FK, estado_entrega)
FACTURA(factura_id PK, folio, fecha_facturacion, monto_total, url_pdf, orden_compra_id FK)

EGRESO_CAJA_CHICA(egreso_id PK, monto, fecha, concepto, proyecto_codigo_correlativo FK)
CONTROL_CAMBIO_PPTO(control_id PK, fecha, motivo, monto_anterior, monto_nuevo, proyecto_codigo_correlativo FK)
PARAMETRO_SISTEMA(clave_parametro PK, valor_numerico, fecha_vigencia)

INCIDENTE_SSO(incidente_id PK, descripcion, fecha_hora, gravedad, proyecto_codigo_correlativo FK)
ACCIDENTE(accidente_id PK, dias_perdidos, riesgo_potencial, incidente_sso_id FK, trabajador_rut FK, proyecto_codigo_correlativo FK)
CAUSA_ACCIDENTE(causa_id PK, riesgo_potencial, incidente_sso_id FK)

MODELO_HVAC(modelo_hvac_id PK, nombre, url_ficha, url_manual)
EQUIPO_HVAC(numero_serie PK, fecha_instalacion, estado_operativo, modelo_hvac_id FK, proyecto_codigo_correlativo FK)
HERRAMIENTA_ACTIVO(herramienta_id PK, estado_operativo, nombre, proyecto_codigo_correlativo FK, trabajador_rut FK)
```

---

## Casos de Uso con Diagrama de Secuencia (los 17 disponibles)

### CU14 — Registrando Bitácora Técnica Diaria
**Actor:** SupervisorObra
**Tablas:** BITACORA_DIARIA, PROYECTO
**Flujo principal:**
1. Supervisor selecciona proyecto → sistema obtiene `proyecto_codigo` y `nombre_obra`
2. Sistema despliega formulario con fecha actual
3. Supervisor redacta descripción de actividades
4. Sistema valida texto (longitud mínima)
5. `INSERT INTO BITACORA_DIARIA(descripcion, fecha, usuario_rut, proyecto_codigo)`
6. Muestra confirmación "Bitácora registrada exitosamente"

**Excepciones:** texto insuficiente → solicitar más info | error de red → guardar borrador local

---

### CU15 — Asociando Subcontratista a Proyecto
**Actor:** AdministradorTotal
**Tablas:** PROYECTO, PROVEEDOR
**Flujo principal:**
1. Admin accede a configuración del proyecto
2. Sistema carga entidades asociadas actuales
3. Admin selecciona "Agregar Subcontratista"
4. Sistema lista proveedores disponibles (`SELECT * FROM PROVEEDOR`)
5. Admin selecciona `proveedor_rut`
6. Sistema valida vinculación (sin duplicados)
7. `UPDATE PROYECTO SET proveedor_rut = ?`
8. Confirmación "Subcontratista asociado exitosamente"

**Excepciones:** subcontratista no existe → sugerir crear en módulo Proveedor | duplicado → informar

---

### CU16 — Cargando Evidencias Fotográficas de Avance
**Actor:** SupervisorObra
**Tablas:** EVIDENCIA_FOTOGRAFICA, HITO_TECNICO
**Flujo principal:**
1. Supervisor accede a sección de evidencia del proyecto
2. Sistema solicita permisos de cámara (Web API nativa)
3. Sistema obtiene hito activo del proyecto
4. Supervisor captura fotografía → vista previa
5. Supervisor confirma subida
6. Sistema captura latitud y longitud vía Web Geolocation API
7. `INSERT INTO EVIDENCIA_FOTOGRAFICA(url_foto, fecha_captura, latitud, longitud, hito_tecnico_id)`
8. Confirmación "Evidencia cargada con éxito"

**Excepciones:** permiso cámara denegado → informar | fallo de carga → reintentar o cola

---

### CU17 — Validando Evidencias de Avance
**Actor:** AdministradorTotal
**Tablas:** EVIDENCIA_FOTOGRAFICA
**Dependencia:** CU16
**Flujo principal:**
1. Admin accede a revisiones pendientes
2. `SELECT * FROM EVIDENCIA_FOTOGRAFICA WHERE estado_aprobacion = 'pendiente'`
3. Admin selecciona foto → vista completa
4. Admin presiona Aprobar o Rechazar
5. `UPDATE EVIDENCIA_FOTOGRAFICA SET estado_aprobacion = 'aprobado'/'rechazado'`
6. Sistema envía notificación al supervisor vía **Nodemailer**
7. Confirmación "Validación registrada correctamente"

**Excepciones:** foto ilegible → solicitar re-captura | rechazar → ingresar comentario

---

### CU35 — Generando Orden de Compra Automáticamente
**Actor:** AdministradorTotal
**Tablas:** SOLICITUD_MATERIAL, ORDEN_COMPRA, DETALLE_ORDEN_COMPRA
**Flujo principal:**
1. Admin aprueba solicitud de material (`solicitud_material_id`)
2. `UPDATE SOLICITUD_MATERIAL SET estado = 'Aprobada'`
3. Sistema consulta materiales, cantidades, precios y `proveedor_rut`
4. Sistema genera folio de orden de compra
5. `INSERT INTO ORDEN_COMPRA(folio, fecha, estado, proveedor_rut, proyecto_codigo)`
6. `INSERT INTO DETALLE_ORDEN_COMPRA(material_id, cantidad, precio_unitario)`
7. Confirmación "Orden de compra generada con éxito"

**Excepciones:** falta proveedor → pausar y solicitar completar información

---

### CU37 — Vinculando Facturas Digitales a Procesos de Compra
**Actor:** AdministradorTotal
**Tablas:** ORDEN_COMPRA, GUIA_DESPACHO, FACTURA
**Flujo principal:**
1. Admin accede a módulo adquisiciones
2. `SELECT * FROM ORDEN_COMPRA WHERE estado != 'Facturado'`
3. Admin selecciona orden de compra → sistema carga guías de despacho asociadas
4. Admin ingresa folio y adjunta PDF de factura (vía **Multer**)
5. Sistema valida folio y montos (sin duplicados, sin discrepancias)
6. `INSERT INTO FACTURA(folio, monto_total, fecha, url_pdf, orden_compra_id)`
7. `UPDATE ORDEN_COMPRA SET estado = 'Facturado'`
8. Confirmación "Factura vinculada correctamente"

**Excepciones:** discrepancia montos → alerta | folio duplicado → bloquear

---

### CU39 — Registrando Egreso de Caja Chica
**Actor:** Supervisor o Admin
**Tablas:** EGRESO_CAJA_CHICA, PROYECTO
**Flujo principal:**
1. Actor selecciona nuevo egreso
2. `SELECT * FROM PROYECTO WHERE estado = 'En Ejecución'`
3. Actor selecciona proyecto
4. Sistema calcula saldo: `presupuesto_asignado - SUM(egresos existentes)`
5. Sistema muestra saldo disponible
6. Actor ingresa monto y concepto
7. Sistema valida monto contra saldo (no puede superar saldo)
8. `INSERT INTO EGRESO_CAJA_CHICA(monto, concepto, fecha, proyecto_codigo)`
9. Confirmación "Egreso registrado correctamente"

**Excepciones:** saldo insuficiente → advertir y bloquear registro

---

### CU41 — Graficando Desviación de Costos
**Actor:** AdministradorTotal
**Tablas:** PROYECTO, FACTURA, PARAMETRO_SISTEMA
**Flujo principal:**
1. Admin accede a control de costos
2. `SELECT proyecto_codigo, presupuesto_asignado FROM PROYECTO WHERE estado activo`
3. Admin selecciona proyecto y período
4. `SELECT SUM(monto_total) FROM FACTURA JOIN ORDEN_COMPRA WHERE proyecto_codigo`
5. `SELECT valor_numerico FROM PARAMETRO_SISTEMA WHERE clave = 'umbral_desviacion'`
6. Sistema calcula varianza financiera (presupuesto vs gastos reales)
7. Sistema despliega gráfico con curvas de costo y alertas

**Excepciones:** datos insuficientes → informar | error de cálculo → detectar inconsistencias

---

### CU42 — Consolidando Costo de Mano de Obra Mensual
**Actor:** AdministradorTotal
**Tablas:** TRABAJADOR, BITACORA_DIARIA, CONTRATO_LABORAL, EGRESO_CAJA_CHICA
**Flujo principal:**
1. Admin selecciona proyecto y período (mes/año)
2. `SELECT * FROM TRABAJADOR WHERE proyecto_codigo`
3. `SELECT COUNT(bitacora_id) FROM BITACORA_DIARIA WHERE trabajador y período` → días trabajados
4. `SELECT sueldo_base, leyes_sociales FROM CONTRATO_LABORAL WHERE trabajador_rut`
5. Sistema calcula costo total
6. Admin confirma consolidación
7. `INSERT INTO EGRESO_CAJA_CHICA(concepto='ManoObra', monto_total, proyecto_codigo, fecha)`
8. Confirmación "Consolidación mensual finalizada con éxito"

**Excepciones:** datos incompletos → detener | inconsistencia asistencia → regularizar primero

---

### CU44 — Registrando Comunicación del Proyecto
**Actor:** AdministradorTotal
**Tablas:** BITACORA_DIARIA, PROYECTO
**Flujo principal:**
1. Admin accede a bitácora de comunicaciones del proyecto
2. Sistema carga historial previo
3. Admin selecciona tipo de comunicación
4. Sistema habilita campos: fecha, hora, participantes
5. Admin ingresa descripción y adjunta archivo (vía **Multer**)
6. Sistema valida campos y tamaño de archivo
7. `INSERT INTO BITACORA_DIARIA(descripcion, fecha, tipo, participantes, url_adjunto, proyecto_codigo)`
8. Confirmación "Comunicación registrada exitosamente"

**Excepciones:** archivo demasiado pesado → informar y solicitar versión más ligera

---

### CU45 — Gestionando Portafolio de Obras
**Actor:** AdministradorTotal
**Tablas:** PROYECTO, EVIDENCIA_FOTOGRAFICA
**Flujo principal:**
1. Admin accede a portafolio de obras
2. `SELECT * FROM PROYECTO`
3. Admin selecciona o agrega proyecto
4. Sistema habilita campos de edición (título, descripción, ubicación)
5. Admin redacta contenido y selecciona fotos
6. Sistema valida formato y tamaño de imágenes (solo JPG/PNG)
7. `UPDATE PROYECTO SET nombre_obra, correo_contacto WHERE proyecto_codigo`
8. `INSERT INTO EVIDENCIA_FOTOGRAFICA(url_foto, fecha, proyecto_codigo)`
9. Confirmación "Portafolio actualizado exitosamente"

**Excepciones:** formato no compatible → informar | error de carga → permitir reintentar

---

### CU47 — Buscando Documentos Legales
**Actor:** AdministradorTotal
**Tablas:** DOCUMENTO_LEGAL, TRABAJADOR
**Flujo principal:**
1. Admin accede al buscador global
2. Sistema despliega formulario de búsqueda (RUT, código_obra)
3. Admin ingresa criterio de búsqueda
4. Sistema valida formato del criterio
5. `SELECT * FROM DOCUMENTO_LEGAL WHERE trabajador_rut OR proyecto_codigo`
6. `SELECT trabajador_nombres FROM TRABAJADOR WHERE trabajador_rut`
7. Sistema despliega lista de resultados
8. Admin selecciona documento → vista previa y descarga del PDF

**Excepciones:** sin resultados → informar | archivo dañado → alerta al admin

---

### CU54 — Registrando Control de Cambios Presupuestarios
**Actor:** AdministradorTotal
**Tablas:** PROYECTO, CONTROL_CAMBIO_PPTO
**Flujo principal:**
1. Admin accede al presupuesto del proyecto
2. `SELECT presupuesto_asignado FROM PROYECTO WHERE proyecto_codigo` → monto_anterior
3. Admin modifica ítem de costo (monto_nuevo)
4. Sistema detecta diferencia y solicita justificación
5. Admin redacta motivo (campo obligatorio)
6. `UPDATE PROYECTO SET presupuesto_asignado = monto_nuevo`
7. `INSERT INTO CONTROL_CAMBIO_PPTO(fecha, motivo, monto_anterior, monto_nuevo, proyecto_codigo)`
8. Confirmación "Cambio registrado en el historial"

**Excepciones:** justificación ausente → bloquear guardado | error en log → revertir cambio

---

### CU55 — Gestionando Pólizas de Seguros por Faena
**Actor:** AdministradorTotal
**Tablas:** DOCUMENTO_LEGAL, TRABAJADOR, PROYECTO
**Flujo principal:**
1. Admin accede a asignación de pólizas
2. `SELECT trabajador_rut, nombres FROM TRABAJADOR`
3. `SELECT proyecto_codigo, nombre_obra FROM PROYECTO WHERE activo`
4. Admin selecciona trabajador y proyecto
5. Admin adjunta PDF de póliza y fecha de vencimiento (vía **Multer**)
6. Sistema valida formato, fecha (no expirada) y existencia previa
7. `INSERT INTO DOCUMENTO_LEGAL(tipo='poliza', url_pdf, fecha_vencimiento, trabajador_rut, proyecto_codigo)`
8. Confirmación "Póliza registrada exitosamente"

**Excepciones:** fecha expirada → bloquear | póliza vigente ya existe → informar conflicto

---

### CU56 — Emitiendo Certificado de Instalación Técnica
**Actor:** Supervisor o Admin
**Tablas:** PROYECTO, EQUIPO_HVAC, DOCUMENTO_LEGAL
**Flujo principal:**
1. Actor selecciona proyecto finalizado
2. `SELECT nombre_obra, correo_contacto, porcentaje_avance FROM PROYECTO`
3. `SELECT numero_serie, modelo_hvac_id, estado_operativo FROM EQUIPO_HVAC WHERE proyecto_codigo`
4. Sistema despliega borrador del certificado
5. Actor completa detalles técnicos finales
6. Sistema valida campos obligatorios
7. Sistema genera PDF vía **PDFKit o jsPDF**
8. `INSERT INTO DOCUMENTO_LEGAL(tipo='certificado', url_pdf, estado='PendienteFirma', trabajador_rut, proyecto_codigo)`
9. Confirmación "Certificado generado. Estado: Pendiente de Firma"

**Excepciones:** datos incompletos → informar campos faltantes y bloquear emisión

---

### CU57 — Registrando Incidentes de Seguridad y Salud Ocupacional
**Actor:** Supervisor o Admin
**Tablas:** INCIDENTE_SSO, ACCIDENTE, TRABAJADOR
**Flujo principal:**
1. Actor accede a nuevo reporte de incidente
2. Sistema despliega formulario (tiempo, lugar, gravedad)
3. Actor selecciona proyecto y vincula trabajadores (RUTs)
4. `SELECT * FROM TRABAJADOR WHERE trabajador_rut AND proyecto_codigo`
5. Actor describe incidente, adjunta fotos (vía **Multer**) y categoría
6. Sistema valida campos obligatorios
7. Actor confirma envío
8. `INSERT INTO INCIDENTE_SSO(descripcion, fecha_hora, gravedad, proyecto_codigo)`
9. Si hay lesionados: `INSERT INTO ACCIDENTE(dias_perdidos, riesgo_potencial, incidente_sso_id, trabajador_rut)`
10. Sistema retorna folio único (`incidente_sso_id`)
11. Confirmación "Reporte de incidente registrado"

**Excepciones:** trabajador no asignado a la obra → advertir | error de envío → guardar borrador

---

### CU58 — Registrando Recepción de Insumos en Obra
**Actor:** SupervisorObra
**Tablas:** GUIA_DESPACHO
**Flujo principal:**
1. Supervisor presiona "Confirmar Recepción Final"
2. Sistema solicita posición GPS vía **Web Geolocation API**
3. Sistema obtiene coordenadas de la obra del proyecto
4. Sistema calcula distancia entre supervisor y obra
5. Si dentro del rango permitido: habilita finalizar registro
6. Supervisor confirma recepción
7. `UPDATE GUIA_DESPACHO SET estado = 'Recibido', ubicacion_verificada = true`
8. Confirmación "Recepción confirmada. Ubicación Verificada"

**Excepciones:** supervisor fuera de rango → alerta de recepción fuera del radio

---

## Casos de Uso Priorizados para Entrega 30%

| Prioridad | CU | Nombre | Motivo |
|-----------|-----|--------|--------|
| 1 | CU14 | Bitácora Técnica Diaria | Operación diaria del supervisor, bajo riesgo |
| 2 | CU39 | Egreso de Caja Chica | Financiero simple, sin dependencias externas |
| 3 | CU57 | Incidentes SSO | Obligatorio legal, formulario directo |
| 4 | CU16 | Evidencias Fotográficas | Core del avance de obra |
| 5 | CU17 | Validación de Evidencias | Depende de CU16, cierra el flujo de avance |

---

## Identidad Visual y Sistema de Diseño

### Logo
- Archivo: `AtiTermicSinFondo.png`
- Copiar a `client/src/assets/logo.png`
- Usar en: header del sidebar, pantalla de login (centrado, máx 180px de ancho)
- El logo tiene fondo negro original — en sidebar oscuro se ve directamente; en login usar sobre fondo `#0D1117`

### Paleta de Colores (extraída del logo)
```css
:root {
  /* Fondos */
  --color-bg-base:       #0D1117;   /* negro petróleo — fondo global */
  --color-bg-surface:    #161B22;   /* gris carbón — cards y panels */
  --color-bg-elevated:   #1C2128;   /* gris oscuro — inputs, hover */
  --color-border:        #2D3748;   /* borde sutil */

  /* Marca (extraído del logo) */
  --color-blue:          #1E40D8;   /* azul logo — acción primaria */
  --color-blue-hover:    #1730B0;   /* azul más oscuro — hover */
  --color-green:         #5DB835;   /* verde flecha — acento/estado OK */
  --color-green-hover:   #4A9E2A;   /* verde hover */

  /* Texto */
  --color-text-primary:  #E6EDF3;   /* blanco suave */
  --color-text-secondary:#8B949E;   /* gris medio */
  --color-text-muted:    #484F58;   /* gris oscuro */

  /* Estado */
  --color-warning:       #D4930A;   /* amarillo ocre — advertencia */
  --color-danger:        #C0392B;   /* rojo oscuro — error/peligro */
  --color-success:       --color-green;
}
```

### Tipografía
```css
/* Importar en index.css */
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap');

--font-body:    'Barlow', sans-serif;        /* cuerpo, formularios, tablas */
--font-display: 'Barlow Condensed', sans-serif; /* títulos de sección, labels de nav */
```
- Usar `Barlow Condensed 700` para títulos de módulo (mayúsculas, letter-spacing: 0.05em)
- Usar `Barlow 500` para texto de formulario y tablas
- Tamaño base: 14px en desktop, 15px en mobile
- NUNCA usar Inter, Roboto, Arial ni System UI

### Principios de Diseño (obligatorios)
- **Sin gradientes** en fondos ni botones. Colores planos, contrastes fuertes.
- **Sin blur / backdrop-filter** salvo para modales (sutil).
- **Sin emojis** en la interfaz. Usar íconos SVG de `lucide-react`.
- **Sin efectos neon** (sin `text-shadow`, sin `box-shadow` de colores brillantes).
- **Bordes de 1px** con `--color-border`. Radio de 6px en cards, 4px en inputs y botones.
- **Tablas sin zebra-striping de colores**: usar solo borde inferior entre filas.
- **Formularios**: labels sobre el input (nunca placeholder como único label), altura de input 40px, padding horizontal 12px.
- **Botón primario**: fondo `--color-blue`, texto blanco, sin sombra. Hover: `--color-blue-hover`.
- **Botón secundario**: fondo transparente, borde `--color-border`, texto `--color-text-primary`.
- **Botón peligro**: fondo `--color-danger`, texto blanco.
- **Botón éxito/confirmar**: fondo `--color-green`, texto blanco.

### Layout General
```
┌─────────────────────────────────────────────────┐
│  SIDEBAR (240px fija, oscura)  │  MAIN CONTENT  │
│  ┌──────────────────────────┐  │                │
│  │  [LOGO]                  │  │  Header área   │
│  │  ─────────────────────   │  │  (título pág)  │
│  │  > Bitácora              │  │                │
│  │  > Caja Chica            │  │  Content area  │
│  │  > Incidentes SSO        │  │  (cards/tabla) │
│  │  > Evidencias            │  │                │
│  │  ─────────────────────   │  │                │
│  │  [Avatar] Nombre         │  │                │
│  │  [Cerrar sesión]         │  │                │
│  └──────────────────────────┘  │                │
└─────────────────────────────────────────────────┘
```

**Mobile (< 768px):**
- Sidebar se oculta; aparece hamburger en top bar
- Sidebar desliza desde la izquierda como drawer (overlay)
- Cards en una sola columna, padding reducido

### Componentes Clave

**Cards de datos:**
```
fondo: --color-bg-surface
borde: 1px solid --color-border
radio: 6px
padding: 20px 24px
sin sombra
```

**Badges de estado:**
- "En Ejecución" → fondo `#1A3A1A`, texto `--color-green`, borde `--color-green`
- "Pendiente" → fondo `#3A2A00`, texto `--color-warning`, borde `--color-warning`
- "Rechazado" → fondo `#3A1010`, texto `--color-danger`, borde `--color-danger`
- "Aprobado" → igual a En Ejecución
- Radio: 3px, padding: 2px 8px, font-size: 12px, font-weight: 600, uppercase

**Notificaciones Toast:**
- Aparecen en esquina inferior derecha
- Fondo `--color-bg-elevated`, borde izquierdo de 3px con el color del estado
- Sin iconos de emoji, usar `lucide-react` (CheckCircle, AlertTriangle, XCircle)
- Duración: 3.5 segundos, animación: slide-up + fade

**Pantalla de Login:**
- Fondo `--color-bg-base` (#0D1117) sin imágenes ni texturas
- Card centrada (420px ancho, padding 40px), fondo `--color-bg-surface`
- Logo arriba centrado (180px max-width)
- Debajo del logo: línea divisora sutil, luego título "Iniciar Sesión" en `Barlow Condensed 700`
- Campos: RUT y Contraseña con labels, sin placeholder decorativo
- Botón full-width al final

---

## Convenciones de Código

- API REST en Express: rutas bajo `/api/` → `/api/bitacora`, `/api/caja-chica`, `/api/sso`, `/api/evidencia`
- Respuestas JSON siempre: `{ success: true, data: {...} }` o `{ success: false, error: "..." }`
- Middleware JWT en todas las rutas protegidas; verificar `req.user.rol` para restricciones por rol
- Registrar en `LOG_AUDITORIA` cada INSERT/UPDATE exitoso (accion, modulo, usuario_rut, fecha_hora)
- Manejo de errores centralizado con try/catch en todos los controllers
- Variables de entorno en `.env` — nunca hardcodear credenciales
- Sequelize: definir modelos en `/models/`, usar `sequelize.query()` para consultas complejas con JOINs

---

## Estructura de Carpetas

```
erp-ati-termic/
├── .env
├── package.json
├── index.js                        # Entry point Express
├── config/
│   └── database.js                 # Sequelize connection
├── models/                         # Modelos Sequelize (uno por tabla)
│   ├── Usuario.js
│   ├── Proyecto.js
│   ├── BitacoraDiaria.js
│   └── ...
├── middleware/
│   ├── auth.js                     # Verificación JWT + rol
│   └── auditoria.js                # Log automático de acciones
├── routes/
│   ├── auth.js
│   ├── bitacora.js                 # CU14
│   ├── cajaChica.js                # CU39
│   ├── sso.js                      # CU57
│   └── evidencia.js                # CU16, CU17
├── controllers/
│   ├── bitacoraController.js
│   ├── cajaChicaController.js
│   ├── ssoController.js
│   └── evidenciaController.js
├── uploads/                        # Archivos subidos (Multer)
│   └── evidencias/
└── client/                         # Frontend React
    ├── public/
    └── src/
        ├── assets/
        │   └── logo.png            # AtiTermicSinFondo.png copiado aquí
        ├── styles/
        │   └── index.css           # Variables CSS globales + reset
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── Toast.jsx
        │   └── Badge.jsx
        ├── api/
        │   └── axios.js            # Instancia Axios con interceptor JWT
        ├── App.jsx
        └── pages/
            ├── Login.jsx
            ├── Bitacora.jsx
            ├── CajaChica.jsx
            ├── SSO.jsx
            └── Evidencia.jsx
```