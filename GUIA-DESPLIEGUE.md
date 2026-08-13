# Puente Legal — guía de puesta en marcha

De cero a la plataforma en línea. Son seis pasos y no hay que escribir código.
Tiempo estimado: entre 45 y 90 minutos la primera vez.

Todo lo que necesitas está en esta carpeta. Los servicios que se usan tienen
plan gratuito suficiente para este proyecto.

---

## Cómo funciona, en una frase

El abogado llena tu formulario de Tally → Tally avisa a la plataforma → el
abogado entra a la fila de su área. La persona afectada entra al sitio, elige
el tema, cuenta su caso y deja su celular → el sistema saca al siguiente
abogado de esa fila y le manda el caso por correo → el abogado la contacta.

```
Tally (abogados)  ──webhook──▶  Base de datos  ◀──── Sitio en Vercel (víctimas)
                                     │                        │
                                     └── rotación por área ────┘
                                                │
                                     correo al abogado asignado
```

---

## Paso 1 — Crear la base de datos (15 min)

La base de datos guarda los abogados y los casos. Usamos Supabase porque el
plan gratuito alcanza de sobra y trae un editor de tablas visual.

1. Entra a [supabase.com](https://supabase.com) y crea una cuenta.
2. **New project**. Ponle un nombre, elige región **East US (North Virginia)**
   (es la más cercana con menor latencia desde Colombia) y guarda la
   contraseña que te genera.
3. Espera a que el proyecto termine de crearse (unos 2 minutos).
4. En el menú lateral, abre **SQL Editor** → **New query**.
5. Abre el archivo `schema.sql` de esta carpeta, cópialo **completo**
   y pégalo en el editor. Dale **Run**.
6. Debe decir *Success*. Ve a **Table Editor** y verifica que aparezcan las
   tablas `abogados` y `casos`.

Ahora copia dos datos que vas a necesitar. Están en
**Project Settings → API**:

| Dato | Dónde está | Para qué |
|---|---|---|
| Project URL | `https://xxxx.supabase.co` | `SUPABASE_URL` |
| service_role key | Sección *Project API keys*, la clave larga marcada `service_role` | `SUPABASE_SERVICE_ROLE_KEY` |

> La llave `service_role` da acceso total a la base. Va únicamente en las
> variables de entorno de Vercel. Nunca la pegues en un chat, en un
> documento compartido ni en el código.

---

## Paso 2 — Subir el código a GitHub (15 min)

El proyecto está organizado para que solo necesites **dos carpetas**: `pages`
y `pages/api`. Todo lo demás va suelto en la raíz. Eso hace que se pueda subir
desde el navegador, sin instalar nada.

El punto crítico: la carga por arrastre del navegador aplana las carpetas.
Por eso vamos a subir en tres tandas.

### 2a. Crea el repositorio

Crea uno nuevo en GitHub, **privado**, sin README ni .gitignore. Déjalo vacío
para que te muestre la pantalla de subida.

### 2b. Primera tanda: los archivos de la raíz

En **Add file → Upload files**, arrastra estos 14 archivos. Son archivos
sueltos, así que aquí no hay estructura que perder:

```
package.json          tsconfig.json         globals.css
package-lock.json     next.config.mjs       areas.ts
schema.sql            postcss.config.mjs    db.ts
importar-csv.mjs      tailwind.config.ts    email.ts
GUIA-DESPLIEGUE.md                          tallymap.ts
```

Commit.

### 2c. Segunda tanda: la carpeta `pages`

1. **Add file → Create new file**.
2. En el campo del nombre escribe exactamente: `pages/marcador.txt`
   Al escribir la barra, GitHub crea la carpeta automáticamente.
3. En el contenido escribe cualquier cosa, por ejemplo `temporal`.
4. Commit.
5. Ahora entra a la carpeta `pages` que acaba de aparecer.
6. Estando **dentro** de `pages`, usa **Add file → Upload files** y arrastra
   los 7 archivos que tienes en tu carpeta local `pages`:

```
_app.tsx      index.tsx      abogados.tsx     admin.tsx
_document.tsx solicitar.tsx  privacidad.tsx
```

7. Commit.

### 2d. Tercera tanda: la carpeta `pages/api`

1. **Add file → Create new file**.
2. Nombre: `pages/api/marcador.txt`, contenido `temporal`. Commit.
3. Entra a `pages/api`.
4. **Add file → Upload files** y arrastra los 3 archivos de tu carpeta local
   `pages/api`: `casos.ts`, `tally.ts`, `admin.ts`. Commit.

### 2e. Limpia y verifica

Borra los dos `marcador.txt`: entra a cada uno, clic en el ícono de basura,
Commit.

El repositorio debe quedar así:

```
pages/
  api/
    admin.ts
    casos.ts
    tally.ts
  _app.tsx
  _document.tsx
  abogados.tsx
  admin.tsx
  index.tsx
  privacidad.tsx
  solicitar.tsx
areas.ts
db.ts
email.ts
globals.css
importar-csv.mjs
next.config.mjs
package.json
package-lock.json
postcss.config.mjs
schema.sql
tailwind.config.ts
tsconfig.json
```

Si te queda algún archivo suelto en la raíz que debería estar dentro de
`pages`, entra al archivo, clic en el lápiz para editarlo, y en el nombre
ponle el prefijo de la carpeta (`pages/index.tsx`). GitHub lo mueve solo.

## Paso 3 — Desplegar en Vercel (10 min)

1. Entra a [vercel.com](https://vercel.com) y regístrate con tu cuenta de GitHub.
2. **Add New → Project** → elige el repositorio `puente-legal` → **Import**.
3. Vercel detecta Next.js solo. **No cambies nada** en la configuración de build.
4. Antes de dar Deploy, abre **Environment Variables** y agrega estas dos
   (las demás las agregas en el paso 5):

   ```
   SUPABASE_URL                 = https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY    = eyJhbGciOi...
   ADMIN_PASSWORD               = (inventa una contraseña larga)
   ```

5. **Deploy**. En unos 2 minutos tendrás una URL tipo
   `https://puente-legal.vercel.app`.
6. Ábrela. Debe cargar la página de inicio.
7. Entra a `tu-url.vercel.app/admin` y prueba la contraseña. Verás el panel
   vacío: eso está bien, todavía no hay abogados.

---

## Paso 4 — Cargar los abogados que ya tienes (10 min)

Tienes dos caminos y conviene hacer los dos: el CSV para los que ya se
inscribieron, y el webhook para los que se inscriban de ahora en adelante.

### 4a. Los que ya llenaron el formulario

1. En Tally, abre tu formulario → **Submissions** → **Export as CSV**.
2. En la terminal de tu computador, dentro de la carpeta del proyecto:

   ```bash
   npm install
   export SUPABASE_URL="https://xxxx.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."
   node importar-csv.mjs tally-export.csv
   ```

3. El script te dice cuántos creó. Entra a `/admin` y revisa que las áreas
   quedaran bien asignadas en la columna **Áreas**.

Si no quieres usar terminal: en Supabase → **Table Editor** → tabla
`abogados` → botón **Insert** → **Import data from CSV**. Tendrás que
renombrar las columnas de tu CSV para que coincidan con las de la tabla, y
la columna `areas` debe llevar el formato `{laboral,vivienda}`.

### 4b. Los que se inscriban de ahora en adelante

1. En Tally, abre tu formulario → **Integrations** → **Webhooks** → **Connect**.
2. En *Endpoint URL* pon: `https://tu-url.vercel.app/api/tally`
3. Copia el **Signing secret** que te muestra Tally.
4. Vuelve a Vercel → **Settings → Environment Variables** y agrega:
   `TALLY_SIGNING_SECRET = el-secreto-que-copiaste`
5. Vuelve a desplegar (**Deployments → ⋯ → Redeploy**) para que tome la
   variable nueva.
6. Llena tú misma el formulario con datos de prueba y verifica en `/admin`
   que aparezca el registro.

**Sobre el mapeo de campos.** El webhook reconoce las preguntas de tu
formulario por palabras clave en el título: *nombre*, *correo*, *celular*,
*tarjeta profesional*, *ciudad*, *área* y *cuántos casos*. Si tus preguntas
usan otras palabras, ábrelas en `tallymap.ts` y agrégalas a la lista
`CLAVES`. Si el sistema no reconoce el área de alguien, lo mete en
orientación general en vez de dejarlo fuera, y lo anota en los logs de Vercel.

---

## Paso 5 — Activar el correo al abogado (15 min)

Sin este paso la plataforma funciona, pero nadie le avisa al abogado: los
casos quedan solo en el panel y tocaría revisarlos a mano. Vale la pena
hacerlo.

1. Crea una cuenta en [resend.com](https://resend.com). El plan gratuito
   permite 3.000 correos al mes.
2. **Domains → Add Domain**. Pon el dominio desde el que quieres enviar
   (por ejemplo `puentelegal.org`). Resend te da unos registros DNS para
   agregar donde tengas el dominio. Sin dominio propio puedes usar
   `onboarding@resend.dev` para probar, pero muchos correos caerán en spam.
3. **API Keys → Create API Key**. Cópiala.
4. En Vercel agrega estas variables y vuelve a desplegar:

   ```
   RESEND_API_KEY        = re_xxxxx
   EMAIL_REMITENTE       = Puente Legal <casos@tudominio.org>
   EMAIL_COORDINACION    = tu-correo@ejemplo.com
   ```

   `EMAIL_COORDINACION` es a donde llegan las respuestas cuando un abogado
   contesta el correo diciendo que no puede tomar el caso.

---

## Paso 6 — Las variables que faltan y la prueba final

Agrega en Vercel las últimas tres y vuelve a desplegar:

```
NEXT_PUBLIC_TALLY_URL      = https://tally.so/r/xxxxxx
NEXT_PUBLIC_ORGANIZACION   = Legal Hackers Bogotá
NEXT_PUBLIC_EMAIL_CONTACTO = datos@tudominio.org
```

Las dos últimas salen en la política de tratamiento de datos. Ponlas con los
datos reales de la organización responsable: es lo que exige la Ley 1581.

### Prueba de punta a punta

1. Inscribe dos abogados de prueba en la misma área (usa correos tuyos).
2. Entra al sitio como si fueras una persona afectada y registra un caso de
   esa área. Debe salir el nombre del **primer** abogado y llegarte el correo.
3. Registra un segundo caso igual. Debe salir el **segundo** abogado.
4. Registra un tercero. Debe volver al **primero**.
5. En `/admin`, cierra uno de los casos y verifica que la columna **Carga**
   baje.

Si los tres pasos dan lo esperado, la rotación está funcionando.

---

## Cómo se opera el día a día

**El panel** está en `tu-url.vercel.app/admin`. Ahí ves todos los casos, quién
quedó asignado, y cuáles están marcados como urgentes (aparecen resaltados).

**Cuando un caso queda sin abogado** (estado `sin abogado`) es porque todos
los de esa área tienen el cupo lleno. Tienes tres salidas: subirle el
`max_casos` a alguien desde Supabase, conseguir más voluntarios de esa área,
o asignarlo a mano cambiando el `abogado_id` en la tabla `casos`.

**Cuando un abogado no responde**, entra al panel y dale **Desactivar**. Deja
de recibir casos nuevos sin que se pierda su registro.

**Cerrar casos importa.** Cada caso cerrado libera un cupo del abogado. Si
nadie cierra casos, la fila se tapona en unos días. Vale la pena que alguien
del equipo revise el panel una vez al día.

---

## Lo que hay que vigilar

**Nadie verifica las tarjetas profesionales.** Elegiste que los abogados
entren automáticamente al llenar Tally. Eso significa que cualquiera puede
inscribirse como abogado y recibir los datos de contacto de personas en
situación de vulnerabilidad. La plataforma incluye tres mitigaciones: se
guarda el número de tarjeta profesional, la persona ve un aviso que le pide
verificarlo en el registro del Consejo Superior de la Judicatura antes de
compartir documentos, y desde el panel puedes desactivar a alguien en un
clic. Aun así, la mitigación real es que una persona del equipo revise la
columna **T.P.** del panel una vez al día y desactive lo que no cuadre.
Toma cinco minutos y es la diferencia entre un riesgo controlado y uno abierto.

**El aviso de "48 horas" es una promesa.** El sitio le dice a la persona que
la contactarán en ese plazo. Si el equipo no puede sostenerlo, cambia el
texto en `pages/solicitar.tsx` y en `email.ts` antes de lanzar.

**Los datos son sensibles.** Hay relatos de fallecimientos, desapariciones y
pérdida de vivienda. El acceso al panel es una sola contraseña compartida:
dásela al mínimo número de personas posible y cámbiala si alguien sale del
equipo.

---

## Qué agregar después, si el proyecto crece

En orden de rendimiento por esfuerzo:

1. **Aviso por WhatsApp al abogado** en vez de solo correo. Los abogados abren
   WhatsApp mucho más rápido. Se hace con la API de WhatsApp Business o con
   Twilio, y se conecta en `email.ts`.
2. **Recordatorio automático a las 48 horas** si el caso sigue sin marcarse
   como contactado. Un cron de Vercel y un correo.
3. **Página de consulta de estado** donde la persona meta su radicado y vea
   en qué va, sin tener que llamar.
4. **Verificación previa de abogados**, con un estado `pendiente` que un
   moderador aprueba antes de que entre a la rotación.
5. **Reporte de cobertura por área**: qué áreas se están quedando sin
   abogados. Sirve para saber a quién reclutar.

---

## Estructura del proyecto

```
pages/
  index.tsx          Página de inicio
  solicitar.tsx      Formulario guiado de 4 pasos (lo que ve la víctima)
  abogados.tsx       Página de reclutamiento, enlaza a Tally
  privacidad.tsx     Política de tratamiento de datos
  admin.tsx          Panel de coordinación
  _app.tsx           Encabezado, pie de página y estilos globales
  api/
    casos.ts         Recibe el caso, asigna abogado, manda el correo
    tally.ts         Recibe cada inscripción de Tally
    admin.ts         Entrar, salir, cerrar caso, activar abogado
areas.ts             Las 11 categorías. Edita aquí los textos.
tallymap.ts          Traduce las respuestas de Tally a la base
email.ts             Plantilla del correo al abogado
db.ts                Conexión a la base
globals.css          Estilos base
schema.sql           Tablas y motor de rotación
importar-csv.mjs     Carga inicial desde el export de Tally
```

**Para cambiar los textos de las categorías**, edita `areas.ts`. Es un solo
archivo y los cambios se reflejan en el formulario, en el panel y en el
correo al abogado.
