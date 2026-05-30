---
name: react-advanced-stack
description: "Úsala cuando el usuario pida crear, refactorizar o analizar código técnico de React, lógica de estado con Zustand, esquemas de validación con Zod, o peticiones de datos con TanStack Query y Axios."
---

# Contexto del Stack Tecnológico Avanzado

Este proyecto utiliza un stack de React moderno con tipado estricto, abstracción de servicios y herramientas específicas de rendimiento. Siempre que generes o edites código, debes seguir obligatoriamente estas reglas:

## 1. Tipado Estricto (TypeScript)
- No utilices `any` bajo ninguna circunstancia. Si un tipo es desconocido o complejo, usa genéricos o tipos abstractos seguros.
- Define las Props de los componentes utilizando `interface` o `type` de forma explícita.

## 2. Gestión de Estado (Zustand)
- El estado global se maneja mediante stores de Zustand localizados dentro de la carpeta `src/store/` (si es global) o en `src/features/{feature}/store/` (si es local de un módulo).
- Ejemplo de patrón esperado:
  ```typescript
  import { create } from 'zustand';
  interface AuthState { user: null | string; login: (user: string) => void }
  export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    login: (user) => set({ user }),
  }));

## 3. Peticiones de Datos e Interceptación de Errores (TanStack Query + Axios)
Queda estrictamente prohibido el uso de useEffect para operaciones de fetch de datos.

Manejo de Errores DRY: Queda prohibido escribir bloques try/catch locales dentro de los servicios de POO o dentro de los componentes para manejar errores de API.

Los errores de red y respuestas HTTP (401, 403, 500) deben delegarse exclusivamente a los Interceptores de Axios globales.

Los efectos secundarios de los errores en la UI (como mostrar notificaciones flotantes/Toasts) deben centralizarse de forma global a través del QueryCache o MutationCache de TanStack Query.

Toda consulta de datos (GET) debe usar el hook useQuery. Toda operación de escritura/modificación (POST, PUT, DELETE) debe usar useMutation.

## 4. Validación de Datos (Zod)
Valida las respuestas de las APIs externas o los inputs de formularios complejos utilizando esquemas de Zod antes de mutar el estado de la aplicación o guardarlos en Zustand.

Extrae los tipos de TypeScript directamente de los esquemas usando z.infer<typeof schema>.

## 5. Estilos y Animaciones
Diseña interfaces utilizando exclusivamente clases utilitarias de Tailwind CSS.

Para transiciones complejas o componentes que se montan/desmontan del DOM, integra framer-motion.

## 6. Paradigmas y Buenas Prácticas (DRY & POO)
Principio DRY: Evita la duplicación de lógica. Centraliza comportamientos repetitivos en hooks personalizados, utilidades globales (src/utils/) o componentes compartidos.

Paradigma Funcional vs POO:

Los componentes de interfaz y el manejo de estado deben ser estrictamente funcionales (Functional Components y React Hooks). Queda prohibido el uso de componentes de clase.

La POO (Clases) está permitida y recomendada únicamente de forma aislada para: Clientes de servicios API, mapeadores de datos (Data Mappers) o modelos de entidades complejos que requieran métodos calculados internos.