# PROMPT INICIAL — ERP ATI Termic SpA (Entrega 30%)

Lee el archivo `CLAUDE.md` completo antes de escribir cualquier línea de código. Contiene el esquema de base de datos, los flujos exactos de cada caso de uso, el stack tecnológico oficial, el sistema de diseño y las convenciones del proyecto.

---

## Stack obligatorio

- **Frontend:** React.js (SPA) + Axios + lucide-react (íconos)
- **Backend:** Node.js + Express.js con API REST
- **ORM:** Sequelize conectado a MySQL (`erp_ati_termic`)
- **Auth:** JWT + Bcrypt
- **Archivos:** Multer para imágenes y PDFs
- **Emails:** Nodemailer (solo en CU17)
- **Fuentes:** Barlow + Barlow Condensed (Google Fonts)

---

## Tu misión para esta entrega

Desarrolla la aplicación completa (backend + frontend React) implementando estos 5 casos de uso funcionales y conectados a la base de datos real:

1. **CU14** — Registrar Bitácora Técnica Diaria
2. **CU39** — Registrar Egreso de Caja Chica
3. **CU57** — Registrar Incidente SSO (Seguridad y Salud Ocupacional)
4. **CU16** — Cargar Evidencias Fotográficas de Avance
5. **CU17** — Validar Evidencias de Avance (solo AdministradorTotal)

---

## Diseño de la Interfaz (OBLIGATORIO — leer antes de crear cualquier componente)

### Identidad visual
El logo de la empresa es `AtiTermicSinFondo.png` (está en la raíz del proyecto).
- Copiarlo a `client/src/assets/logo.png`
- Mostrarlo en el sidebar (arriba, max-width 160px) y en la pantalla de login (centrado, max-width 180px)
- El logo tiene fondo negro; úsalo sobre los fondos oscuros definidos en el sistema de diseño

### Reglas de diseño que NO se pueden romper
- **Tema oscuro completo** usando exactamente los colores del CLAUDE.md (paleta derivada del logo)
- **Tipografía:** Solo `Barlow` (body) y `Barlow Condensed` (títulos). Importar desde Google Fonts. NUNCA Inter, Roboto, Arial ni system-ui
- **Sin gradientes** en fondos ni botones — todo colores planos
- **Sin efectos neon, blur decorativo ni sombras de colores**
- **Sin emojis** en ninguna parte de la interfaz — usar íconos de `lucide-react`
- **Bordes de 1px** con `var(--color-border)`, border-radius 6px en cards, 4px en inputs/botones
- **Badges de estado** con fondo oscuro + borde del color del estado (ver CLAUDE.md)
- **Toasts** en esquina inferior derecha con borde lateral de 3px

### Layout
- **Desktop:** Sidebar fija de 240px a la izquierda + área de contenido a la derecha
- **Mobile (< 768px):** Hamburger button en top bar, sidebar como drawer deslizable con overlay

### Pantalla de Login
- Fondo `#0D1117`, card centrada (420px) con fondo `#161B22`
- Logo arriba centrado, luego divisor sutil, luego título "Iniciar Sesión" en Barlow Condensed 700
- Campos: RUT y Contraseña con labels visibles sobre los inputs
- Botón full-width en azul `#1E40D8`

---

## Requisitos de Backend

- Definir modelos Sequelize para todas las tablas que usan los 5 CU
- Middleware JWT protege todas las rutas; expone `req.user` con `{ rut, rol }`
- CU17 solo accesible si `req.user.rol === 'admin'`; devolver 403 si es supervisor
- Registrar en `LOG_AUDITORIA` cada acción exitosa (INSERT/UPDATE)
- Validaciones de negocio:
  - CU14: descripción con mínimo 10 caracteres
  - CU39: monto no puede superar el saldo disponible del proyecto
  - CU57: trabajador debe estar asignado al proyecto seleccionado
  - CU16: capturar latitud/longitud enviados desde el frontend
  - CU17: estado solo puede ser `'aprobado'` o `'rechazado'`
- Responder siempre JSON: `{ success: true, data: {...} }` o `{ success: false, error: "..." }`
- Exponer `/uploads` como carpeta estática para servir imágenes de evidencia

---

## Endpoints requeridos

```
POST   /api/auth/login
POST   /api/auth/logout

GET    /api/bitacora/proyectos
POST   /api/bitacora

GET    /api/caja-chica/proyectos
GET    /api/caja-chica/saldo/:codigo
POST   /api/caja-chica

GET    /api/sso/proyectos
GET    /api/sso/trabajadores/:codigo
POST   /api/sso/incidente              (Multer: campo "fotos", múltiples archivos)

GET    /api/evidencia/hito/:codigo
POST   /api/evidencia                  (Multer: campo "foto", un archivo)
GET    /api/evidencia/pendientes       (solo admin)
PATCH  /api/evidencia/:id/validar      (solo admin)
```

---

## Seed de Base de Datos

Crear y ejecutar `seed.js` con:
- 1 usuario admin: RUT `11111111-1`, pass `Admin1234!`, correo `admin@atitermic.cl`
- 1 usuario supervisor: RUT `22222222-2`, pass `Super1234!`, correo `supervisor@atitermic.cl`
- Registros en tablas ADMINISTRADOR y SUPERVISOR_TERRENO vinculados a esos usuarios
- 2 proyectos en estado "En Ejecución" con presupuesto asignado
- 3 trabajadores asignados a los proyectos con especialidades
- 2 hitos técnicos activos (avance_fisico: 0.00)
- 1 guía de despacho en estado "Pendiente"

---

## Pasos a seguir (en este orden)

1. Copiar `AtiTermicSinFondo.png` a `client/src/assets/logo.png`

2. Instalar dependencias backend:
```
npm install express sequelize mysql2 bcryptjs jsonwebtoken dotenv multer nodemailer cors
```

3. Crear `.env` con las variables del CLAUDE.md

4. Crear `config/database.js` con Sequelize

5. Definir modelos Sequelize: Usuario, Administrador, SupervisorTerreno, Proyecto, EstadoProyecto, Trabajador, BitacoraDiaria, EgresoCajaChica, IncidenteSSO, Accidente, HitoTecnico, EvidenciaFotografica, LogAuditoria

6. Crear y ejecutar `seed.js`

7. Implementar `POST /api/auth/login` con bcrypt + JWT

8. Implementar endpoints de cada CU: CU14 → CU39 → CU57 → CU16 → CU17

9. Crear el frontend React:
```
npx create-react-app client
cd client && npm install axios react-router-dom lucide-react
```

10. Configurar proxy en `client/package.json`:
```json
"proxy": "http://localhost:3000"
```

11. Crear `client/src/styles/index.css` con todas las variables CSS del CLAUDE.md y el import de Google Fonts (Barlow + Barlow Condensed)

12. Crear componentes: `Sidebar.jsx`, `Toast.jsx`, `Badge.jsx`

13. Crear instancia Axios en `client/src/api/axios.js` con interceptor que agrega el JWT de localStorage

14. Implementar páginas en orden: `Login.jsx` → `Bitacora.jsx` → `CajaChica.jsx` → `SSO.jsx` → `Evidencia.jsx`

15. Probar cada flujo completo end-to-end

---

## Restricciones importantes

- RUT chileno es PK de USUARIO y TRABAJADOR (formato: `12345678-9`, con guión)
- `proyecto_codigo_correlativo` es VARCHAR(50), no entero
- `estado_aprobacion` en EVIDENCIA_FOTOGRAFICA: solo `'pendiente'`, `'aprobado'`, `'rechazado'`
- `estado_proyecto_id` en PROYECTO es FK a tabla ESTADO_PROYECTO, no string libre
- Saldo en caja chica = `presupuesto_asignado - SUM(egreso_caja_chica.monto)` del proyecto
- Las imágenes de evidencia se guardan en `/uploads/evidencias/` y se almacena la ruta relativa
- Nunca guardar credenciales en el código; usar `.env`
- Backend en puerto del `.env` (default 3000), React en 3001 con proxy configurado

---

## Entregable esperado

- `node index.js` levanta el backend en localhost:3000
- `npm start` dentro de `/client` levanta el frontend en localhost:3001
- Login funcional con los dos usuarios del seed
- Los 5 módulos operativos y conectados a MySQL
- Diseño 100% consistente con el sistema visual del CLAUDE.md
