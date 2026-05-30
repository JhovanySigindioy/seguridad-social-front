---
name: workspace-architecture
description: "Úsala cuando el usuario pida crear una nueva funcionalidad (feature), configurar rutas con React Router Dom, agregar componentes de UI, usar Shadcn, organizar la estructura de archivos o planificar la arquitectura de carpetas."
---

# Guía de Estructura de Carpetas, UI y Enrutamiento

Este proyecto sigue un patrón de diseño basado en Funcionalidades (Feature-driven architecture), integra Shadcn UI para componentes base y utiliza React Router Dom para el enrutamiento global.

## 1. Estructura General de la Carpeta `src/`

```text
src/
├── components/          # COMPONENTES GLOBALES (Shared/Common)
│   ├── ui/              # COMPONENTES DE SHADCN UI (Button, Input, Dialog, etc.)
│   └── layout/          # Estructura global compartida (Navbar, Sidebar, MainLayout)
├── features/            # ESTRUCTURA POR FEATURES (Lógica de Negocio Modular)
│   ├── auth/            # Ejemplo: Módulo de Autenticación
│   │   ├── components/  # Componentes exclusivos de esta feature
│   │   ├── hooks/       # Hooks exclusivos de la feature (ej. useLoginActions)
│   │   ├── pages/       # Vistas/Páginas de la feature atadas a una ruta (ej. LoginPage.tsx)
│   │   ├── services/    # Clases de servicios API (POO) exclusivas de auth
│   │   └── store/       # Estado de Zustand exclusivo de auth
│   └── dashboard/       # Ejemplo: Módulo de Dashboard
├── routes/              # CONFIGURACIÓN DE ENRUTAMIENTO GLOBAL
│   └── index.tsx        # Definición de rutas centralizada (AppRouter)
├── utils/               # Funciones utilitarias globales (formatters, helpers)
└── App.tsx

## 2. Reglas para React Router Dom

Las rutas del sistema se definen de manera centralizada en src/routes/index.tsx utilizando el enfoque moderno basado en objetos (createBrowserRouter).

Las vistas completas de una funcionalidad deben crearse dentro de una subcarpeta pages/ de su respectiva feature (ej. src/features/auth/pages/LoginPage.tsx). El archivo de rutas global se encargará de importarlas y conectarlas a sus respectivas URLs.

Utiliza componentes de Layout de src/components/layout/ para envolver rutas protegidas o compartidas usando el componente <Outlet /> de React Router Dom.

## 3. Reglas Estrictas para Shadcn UI
Cuando se pida un componente básico de interfaz (botón, modal, dropdown, tabla), comprueba o asume que el componente base existe en src/components/ui/.

Si el componente no existe en el proyecto, indícale explícitamente al usuario el comando CLI necesario para instalarlo (ej. npx shadcn@latest add [componente]).

Si requieres personalizar un componente de Shadcn de forma global, modifica su archivo directamente en src/components/ui/. Si la modificación es local o específica de una vista, usa la propiedad className combinada con la función utilitaria cn(...).

## 4. Reglas de Decisión para Archivos (Feature vs Global)

Para mantener el proyecto ordenado y evitar el acoplamiento rígido, evalúa la siguiente lógica antes de crear o mover un archivo:

¿Es un elemento atómico/UI general? VIVE EN src/components/ui/ (Manejado por Shadcn).

¿Es una página o vista completa atada a una URL? VIVE EN src/features/{nombre_feature}/pages/.

¿Es un componente que solo se usa dentro de una funcionalidad específica? VIVE EN src/features/{nombre_feature}/components/.

¿Es un layout que envuelve múltiples páginas globales? VIVE EN src/components/layout/.