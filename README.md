# 🚀 CloudTasks — Configuración y Guía de Despliegue

Este repositorio contiene la interfaz cliente de **CloudTasks**. La infraestructura de la aplicación está desplegada siguiendo una arquitectura desacoplada en la nube:

`Usuario` ➔ `Cloudflare (Reverse Proxy / CDN)` ➔ `Vercel (Hosting Frontend)` ➔ `Supabase (Database PostgreSQL)`

---

## 🛠️ Requisitos Previos

Antes de realizar cambios o enviar código, asegúrate de tener:
- **Node.js** y **Git** instalados localmente.
- Acceso al repositorio remoto en GitHub.

---

## 🔄 Flujo de Trabajo y Commits (Git Workflow)

Para mantener el pipeline sincronizado y asegurar que cada actualización se refleje automáticamente en la nube, sigan estos pasos al subir sus cambios:

1. **Obtener la versión más reciente del código:**
   ```bash
   git pull origin main
