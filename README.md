# CloudTasks ☁️

CloudTasks es una aplicación web para la gestión de tareas personales o de equipo. El proyecto fue desarrollado como parte del **Laboratorio Desafío del Seminario de Ingeniería de Software de la Universidad Icesi**.

La aplicación permite crear, consultar, completar y eliminar tareas, además de filtrarlas según su estado y prioridad. En su etapa actual, la información se almacena de forma persistente en **Supabase (PostgreSQL)** y las operaciones con la base de datos se realizan de manera asíncrona desde JavaScript.

## Tecnologías utilizadas

- **HTML5** — estructura de la aplicación.
- **CSS3** — estilos, distribución y diseño responsive.
- **JavaScript** — lógica de negocio, interacción con la interfaz y operaciones CRUD.
- **Supabase** — backend y base de datos PostgreSQL.
- **Git / GitHub** — control de versiones y trabajo colaborativo.

## Funcionalidades

### Gestión de tareas

- Crear tareas con:
  - Título.
  - Descripción opcional.
  - Prioridad: baja, media o alta.
  - Fecha límite opcional.
- Consultar las tareas almacenadas en Supabase.
- Marcar una tarea como completada o pendiente.
- Eliminar tareas.
- Mostrar la cantidad total de tareas y de tareas pendientes.
- Detectar y mostrar visualmente las tareas cuyo plazo ya venció.

### Filtrado

Las tareas pueden filtrarse por dos criterios simultáneamente:

- **Estado:** todas, pendientes o completadas.
- **Prioridad:** todas, alta, media o baja.

### Validación y experiencia de usuario

- El título de la tarea es obligatorio.
- El título debe tener al menos 3 caracteres.
- Se muestran mensajes de confirmación o error mediante notificaciones (*toast*).
- El formulario se limpia automáticamente después de crear una tarea.
- Los datos introducidos por el usuario se escapan antes de ser incorporados al HTML, reduciendo el riesgo de inyección de contenido.

## Arquitectura

La aplicación sigue una arquitectura sencilla de cliente web conectado directamente con Supabase:

```text
┌──────────────────────┐
│      Navegador       │
│                      │
│  HTML + CSS + JS     │
└──────────┬───────────┘
           │
           │ Supabase JS Client
           ▼
┌──────────────────────┐
│       Supabase       │
│                      │
│     PostgreSQL       │
└──────────────────────┘
```

El archivo `js/app.js` concentra la lógica principal de la aplicación. Desde allí se realizan las operaciones CRUD sobre la tabla `tasks` de Supabase.

## Operaciones CRUD

| Operación | Función | Descripción |
|---|---|---|
| **Create** | `addTask()` | Inserta una nueva tarea en Supabase. |
| **Read** | `loadTasks()` | Consulta las tareas almacenadas. |
| **Update** | `toggleTask()` | Cambia una tarea entre pendiente y completada. |
| **Delete** | `deleteTask()` | Elimina una tarea de la base de datos. |

Después de las operaciones de escritura, la aplicación vuelve a consultar los datos para mantener la interfaz sincronizada con la base de datos.

## Estructura del proyecto

```text
cloudtasks-equipo07/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   └── README.md
└── .gitignore
```

### `index.html`

Contiene la estructura principal de la aplicación:

- Encabezado y estadísticas.
- Formulario para crear tareas.
- Controles de filtrado.
- Lista de tareas.
- Área para mensajes de estado.

### `css/styles.css`

Contiene los estilos visuales de CloudTasks, incluyendo el diseño de la interfaz, tarjetas de tareas, botones, filtros, prioridades y estados.

### `js/app.js`

Contiene la lógica de la aplicación:

- Configuración del cliente de Supabase.
- Estado local de las tareas y filtros.
- Validación del formulario.
- Operaciones CRUD.
- Filtrado.
- Renderizado dinámico de las tareas.
- Manejo de eventos.
- Mensajes de estado.

## Modelo de datos

La aplicación utiliza una tabla llamada `tasks` en Supabase. Los campos utilizados por el frontend son:

| Campo | Descripción |
|---|---|
| `id` | Identificador de la tarea. |
| `title` | Título de la tarea. |
| `description` | Descripción opcional. |
| `priority` | Prioridad (`low`, `medium` o `high`). |
| `deadline` | Fecha límite opcional. |
| `completed` | Indica si la tarea está completada. |
| `created_at` | Fecha de creación de la tarea. |

## Ejecución local

Como la aplicación está compuesta por archivos estáticos, puede ejecutarse localmente de forma sencilla.

### Opción 1 — Abrir directamente

Abrir el archivo:

```text
index.html
```

en un navegador web.

### Opción 2 — Servidor local

También puede utilizarse un servidor HTTP local. Por ejemplo, con Python:

```bash
python -m http.server 8000
```

Luego abrir en el navegador:

```text
http://localhost:8000
```

## Configuración de Supabase

La conexión con Supabase se realiza desde `js/app.js` mediante el cliente oficial de JavaScript:

```javascript
const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
```

La aplicación utiliza una clave pública (`anon/publishable key`) para comunicarse con Supabase desde el navegador.

> **Importante:** aunque la clave pública de Supabase puede utilizarse en aplicaciones frontend, la seguridad de los datos debe garantizarse mediante las políticas de acceso de Supabase (RLS). No se deben exponer claves privadas o claves con privilegios administrativos en el código del navegador.

## Flujo de funcionamiento

Al cargar la página:

1. Se inicializa el cliente de Supabase.
2. `loadTasks()` consulta la tabla `tasks`.
3. Las tareas obtenidas se almacenan en el estado local.
4. La interfaz se renderiza con `renderAll()`.

Cuando el usuario crea una tarea:

1. Se valida el formulario.
2. Se construye el objeto de la nueva tarea.
3. Se inserta en Supabase.
4. Se vuelven a cargar las tareas.
5. Se actualizan las estadísticas y la lista.
6. Se muestra una notificación de confirmación.

El mismo principio se utiliza para actualizar y eliminar tareas.

## Control de versiones

El proyecto utiliza **Git** para el control de versiones y el trabajo colaborativo.

Entre los cambios registrados se encuentran:

- Estructura inicial del proyecto.
- Implementación de la Etapa 1 con almacenamiento local.
- Integración con Supabase.
- Correcciones de HTML y JavaScript.
- Rediseño de la interfaz.
- Trabajo sobre la documentación.

## Etapas del proyecto

El proyecto se ha desarrollado progresivamente:

| Etapa | Descripción |
|---|---|
| **Etapa 1 — Local** | Aplicación web estática con HTML, CSS, JavaScript y persistencia local. |
| **Etapa 2 — Nube** | Integración con Supabase y persistencia en PostgreSQL. |
| **Etapa 3 — Seguridad** | Etapa prevista para incorporar mecanismos adicionales de seguridad, infraestructura y despliegue. |

## Equipo

- Mauricio
- Juan Felipe
- Elías
- Daniel

---

**CloudTasks — Seminario de Ingeniería de Software · Universidad Icesi**
