@echo off
setlocal

set ROOT=%~dp0
set SNAPSHOT=%ROOT%design-snapshots\affiliate-portal-2026-08-17-current

if not exist "%SNAPSHOT%" (
  echo Snapshot no encontrado: %SNAPSHOT%
  exit /b 1
)

xcopy "%SNAPSHOT%\src\pages\AffiliateLoginPage.tsx" "%ROOT%src\pages\AffiliateLoginPage.tsx" /Y /Q >nul
xcopy "%SNAPSHOT%\src\pages\AffiliatePortalPage.tsx" "%ROOT%src\pages\AffiliatePortalPage.tsx" /Y /Q >nul
xcopy "%SNAPSHOT%\src\pages\AffiliateAffiliationDetailPage.tsx" "%ROOT%src\pages\AffiliateAffiliationDetailPage.tsx" /Y /Q >nul
xcopy "%SNAPSHOT%\src\features\affiliate-portal\components\AffiliatePortalShell.tsx" "%ROOT%src\features\affiliate-portal\components\AffiliatePortalShell.tsx" /Y /Q >nul
xcopy "%SNAPSHOT%\src\features\affiliate-portal\components\AffiliationPeriodRow.tsx" "%ROOT%src\features\affiliate-portal\components\AffiliationPeriodRow.tsx" /Y /Q >nul
xcopy "%SNAPSHOT%\src\features\affiliate-portal\components\DocumentPreviewModal.tsx" "%ROOT%src\features\affiliate-portal\components\DocumentPreviewModal.tsx" /Y /Q >nul
xcopy "%SNAPSHOT%\src\features\affiliate-portal\hooks\useAffiliatePortal.ts" "%ROOT%src\features\affiliate-portal\hooks\useAffiliatePortal.ts" /Y /Q >nul
xcopy "%SNAPSHOT%\src\features\affiliate-portal\utils\affiliate-portal.helpers.ts" "%ROOT%src\features\affiliate-portal\utils\affiliate-portal.helpers.ts" /Y /Q >nul
xcopy "%SNAPSHOT%\src\features\affiliate-portal\styles\affiliate-portal.css" "%ROOT%src\features\affiliate-portal\styles\affiliate-portal.css" /Y /Q >nul
xcopy "%SNAPSHOT%\src\App.tsx" "%ROOT%src\App.tsx" /Y /Q >nul

echo Snapshot restaurado correctamente.
endlocal
