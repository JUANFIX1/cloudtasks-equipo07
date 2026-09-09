# CloudTasks

Aplicación web para gestión de tareas personales o de equipo, desarrollada como parte del Laboratorio Desafío del Seminario de Ingeniería de Software — Universidad ICESI.

## Stack

| Etapa | Tecnologías |
|-------|-------------|
| 1 — Local | HTML, CSS, JavaScript, Git, GitHub |
| 2 — Nube  | + Supabase (PostgreSQL), Vercel |
| 3 — Seguro | + Cloudflare (DNS, HTTPS, CDN) |

## Funcionalidades

- Crear tareas con título, descripción, prioridad y fecha límite
- Marcar tareas como completadas
- Eliminar tareas
- Filtrar por estado (pendiente / completada) y por prioridad
- Validación de formulario
- Persistencia local en Etapa 1 (localStorage), base de datos en Etapa 2+

## Estructura

```
cloudtasks/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── README.md
└── .gitignore
```

## Cómo correr localmente

Abre `index.html` directamente en el navegador. No requiere servidor en la Etapa 1.

## Equipo

- Mauricio
- Juan Felipe
- Elías
- Daniel
