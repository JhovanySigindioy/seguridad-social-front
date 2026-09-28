# Snapshot portal afiliados

Este respaldo guarda el estado actual del portal de afiliados antes del siguiente rediseño.

Fecha base: `2026-08-17`

Archivos incluidos:
- `src/pages/AffiliateLoginPage.tsx`
- `src/pages/AffiliatePortalPage.tsx`
- `src/pages/AffiliateAffiliationDetailPage.tsx`
- `src/features/affiliate-portal/components/AffiliatePortalShell.tsx`
- `src/features/affiliate-portal/components/AffiliationPeriodRow.tsx`
- `src/features/affiliate-portal/components/DocumentPreviewModal.tsx`
- `src/features/affiliate-portal/hooks/useAffiliatePortal.ts`
- `src/features/affiliate-portal/utils/affiliate-portal.helpers.ts`
- `src/features/affiliate-portal/styles/affiliate-portal.css`
- `src/App.tsx`

Para restaurar este punto:

```bat
restore-affiliate-portal-2026-08-17.bat
```

Luego vuelva a levantar el frontend con `npm run dev`.
