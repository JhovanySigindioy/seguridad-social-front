---
name: frontend-patterns
description: "Úsala cuando trabajes con paginación de listas, gestión de caché de TanStack Query, lazy loading de rutas, el sistema de notificaciones Toast, o cuando necesites decidir si algo debe ir en Zustand o en TanStack Query."
---

# Patrones Avanzados del Frontend

Este documento complementa `react-advanced-stack` y `workspace-architecture`. Define patrones concretos que resuelven problemas recurrentes de escalabilidad y calidad senior.

---

## 1. Regla Fundamental: Server State vs UI State

Esta es la regla más importante para evitar bugs de sincronización. Antes de decidir dónde guardar un dato, evalúa:

| ¿De dónde viene el dato? | ¿Dónde vive? | Herramienta |
|---|---|---|
| Del servidor (API) | Caché de red | **TanStack Query** (`useQuery`, `useMutation`) |
| Estado de la sesión del usuario | Persiste en `localStorage` | **Zustand** (`useAuthStore`) |
| Preferencia de UI (tema, sidebar) | Persiste en `localStorage` | **Zustand** (`useThemeStore`) |
| Estado efímero de un componente | Solo en el componente | **`useState`** |

**Regla práctica:** Si el dato existe en la base de datos, **nunca** lo guardes en Zustand. TanStack Query es la fuente de verdad para datos del servidor.

```typescript
// ❌ MAL: copiar datos del servidor a Zustand
const { data } = useQuery({ queryKey: ['clients'], queryFn: getClients });
useClientStore.setState({ clients: data }); // ← NUNCA hagas esto

// ✅ BIEN: consumir directamente desde TanStack Query
const { data: clients } = useQuery({ queryKey: ['clients', officeId], queryFn: () => getClients(officeId) });
```

---

## 2. Convención de Query Keys (TanStack Query)

Las query keys son la clave de la invalidación de caché. Sin una convención, la caché se desincroniza silenciosamente.

**Regla:** Usa arrays con estructura jerárquica: `[entidad, scope?, filtros?]`

```typescript
// Patrón estándar del proyecto
['affiliations']                                    // Todas las afiliaciones (raro)
['affiliations', officeId]                          // Por oficina
['affiliations', officeId, { month: 5, year: 2026 }] // Con filtros
['clients', companyId]                              // Clientes de una empresa
['clients', 'detail', clientId]                     // Un cliente específico

// Invalidación correcta después de mutación
queryClient.invalidateQueries({ queryKey: ['affiliations', officeId] });
// ↑ Invalida TODAS las queries que empiecen con ['affiliations', officeId]
```

**Centraliza las keys en cada feature** para evitar strings duplicados:

```typescript
// src/features/affiliations/hooks/affiliation.keys.ts
export const affiliationKeys = {
  all: ['affiliations'] as const,
  byOffice: (officeId: number) => ['affiliations', officeId] as const,
  byPeriod: (officeId: number, month: number, year: number) =>
    ['affiliations', officeId, { month, year }] as const,
};
```

---

## 3. Patrón de Paginación (Frontend)

Para listas que pueden crecer (afiliaciones, clientes), usa paginación desde el inicio.

```typescript
// Hook estándar de paginación con useQuery
import { useQuery } from '@tanstack/react-query';
import { affiliationKeys } from './affiliation.keys';
import { AffiliationService } from '../services/AffiliationService';

interface PaginationParams {
  page: number;
  limit: number;
  officeId: number;
  month?: number;
  year?: number;
}

export const useAffiliations = (params: PaginationParams) => {
  return useQuery({
    queryKey: affiliationKeys.byPeriod(params.officeId, params.month ?? 0, params.year ?? 0),
    queryFn: () => AffiliationService.getAll(params),
    placeholderData: (prev) => prev, // Mantiene datos anteriores mientras carga la nueva página
    staleTime: 1000 * 60 * 2, // 2 minutos — ajustar según frecuencia de cambio del dato
  });
};
```

**Interfaz de respuesta esperada del backend:**
```typescript
// src/types/pagination.types.ts
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

## 4. Lazy Loading de Rutas (Performance)

Para evitar que el bundle inicial crezca con cada feature que se agrega:

```typescript
// src/routes/index.tsx — patrón estándar del proyecto
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// ✅ Cada página se carga solo cuando se navega a ella
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'));

const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="animate-spin h-8 w-8 rounded-full border-4 border-indigo-600 border-t-transparent" />
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense>,
  },
  // ...
]);
```

---

## 5. Sistema de Notificaciones Toast (Toast Bridge)

El proyecto usa un patrón "Toast Bridge" que permite a Axios (fuera del árbol React) disparar notificaciones globales.

**Arquitectura:**
```
axios-instance.ts  →  registerToastBridge(showToast, logout)
                              ↑
                         App.tsx (AppBridge component registra al montar)
                              ↑
                         ToastProvider (provee el contexto)
```

**Reglas de uso:**

- **Errores HTTP globales (401, 403, 5xx, red):** Manejados automáticamente por el interceptor. NO los captures en los componentes.
- **Errores de UX local (ej: credenciales inválidas en formulario):** Muéstralos inline en el formulario con `onError` del `useMutation`. NO uses `showToast` para esto.
- **Éxito de operaciones:** Usa `showToast` desde `onSuccess` del `useMutation`.

```typescript
// Patrón correcto en un hook de mutación
const { mutate: createAffiliation } = useMutation({
  mutationFn: AffiliationService.create,
  onSuccess: () => {
    showToast('Afiliación creada exitosamente.', 'success');
    queryClient.invalidateQueries({ queryKey: affiliationKeys.byOffice(officeId) });
  },
  onError: (error: any) => {
    // Solo captura errores de validación de negocio (409 Conflict, 422)
    if (error?.response?.status === 409) {
      setFormError(error.response.data.error);
    }
    // El resto (500, red) ya los maneja el interceptor → no hagas nada aquí
  },
});
```

---

## 6. Acceso a Toast fuera de componentes

Para usar `showToast` dentro de un hook, impórtalo con `useToast()`:

```typescript
import { useToast } from '../../components/Toast';

export const useCreateClient = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ClientService.create,
    onSuccess: () => {
      showToast('Cliente registrado correctamente.', 'success');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};
```
