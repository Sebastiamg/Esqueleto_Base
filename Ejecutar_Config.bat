@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion

title Modificar config.js - VERSION ULTRA ESTABLE
cls

echo =============================================
echo   MODIFICANDO: mobile\javascript\config.js
echo =============================================
echo.

:: Normaliza rutas UNC / red
pushd "%~dp0"

set "CONFIG_PATH=mobile\javascript\config.js"
set "BACKUP_PATH=%CONFIG_PATH%.backup"
set "PS_SCRIPT=%TEMP%\mod_config_temp.ps1"

:: Verificación REAL
if not exist "%CONFIG_PATH%" (
    echo ERROR: No se encontro config.js
    echo Ruta evaluada:
    echo %CD%\%CONFIG_PATH%
    pause
    popd
    exit /b 1
)

echo Creando copia de seguridad...
copy "%CONFIG_PATH%" "%BACKUP_PATH%" >nul

:: ====== PASO CRÍTICO ======
:: Pasamos la ruta por variable de entorno (NO se rompe con tildes)
set "CONFIG_JS_FULL=%CD%\%CONFIG_PATH%"

echo Generando script PowerShell temporal...

> "%PS_SCRIPT%" echo $ErrorActionPreference = 'Stop'
>>"%PS_SCRIPT%" echo $p = $env:CONFIG_JS_FULL
>>"%PS_SCRIPT%" echo if (-not (Test-Path -LiteralPath $p)) { throw "No existe: $p" }
>>"%PS_SCRIPT%" echo $c = Get-Content -LiteralPath $p -Raw -Encoding Default
>>"%PS_SCRIPT%" echo $inserted = $false
>>"%PS_SCRIPT%" echo $replaced = $false
>>"%PS_SCRIPT%" echo $helpReplaced = $false

>>"%PS_SCRIPT%" echo $bloque = @'
>>"%PS_SCRIPT%" echo function getParameterByName(name) {
>>"%PS_SCRIPT%" echo     name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
>>"%PS_SCRIPT%" echo     var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
>>"%PS_SCRIPT%" echo     results = regex.exec(location.search);
>>"%PS_SCRIPT%" echo     return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
>>"%PS_SCRIPT%" echo }
>>"%PS_SCRIPT%" echo var unidades = {
>>"%PS_SCRIPT%" echo     paginaInicial: init(),
>>"%PS_SCRIPT%" echo     paginaFinal: final(),
>>"%PS_SCRIPT%" echo }
>>"%PS_SCRIPT%" echo function init() {
>>"%PS_SCRIPT%" echo     return getParameterByName('init');
>>"%PS_SCRIPT%" echo }
>>"%PS_SCRIPT%" echo function final() {
>>"%PS_SCRIPT%" echo     return getParameterByName('final');
>>"%PS_SCRIPT%" echo }
>>"%PS_SCRIPT%" echo.
>>"%PS_SCRIPT%" echo '@

>>"%PS_SCRIPT%" echo if ($c -match 'var\s+aliasConfig') {
>>"%PS_SCRIPT%" echo   if ($c -notmatch 'function getParameterByName') {
>>"%PS_SCRIPT%" echo     $c = $c -replace 'var\s+aliasConfig', ($bloque + 'var aliasConfig')
>>"%PS_SCRIPT%" echo     $inserted = $true
>>"%PS_SCRIPT%" echo   }
>>"%PS_SCRIPT%" echo }

>>"%PS_SCRIPT%" echo if ($c -match 'bookConfig\.totalPageCount\s*=\s*\d+\s*;') {
>>"%PS_SCRIPT%" echo   $c = $c -replace 'bookConfig\.totalPageCount\s*=\s*\d+\s*;', 'bookConfig.totalPageCount = unidades.paginaFinal;'
>>"%PS_SCRIPT%" echo   $replaced = $true
>>"%PS_SCRIPT%" echo }

>>"%PS_SCRIPT%" echo if ($c -match 'frmHowToUse\s*:\s*"How To Use"') {
>>"%PS_SCRIPT%" echo   $c = $c -replace 'frmHowToUse\s*:\s*"How To Use"', 'frmHowToUse:"Uso del libro"'
>>"%PS_SCRIPT%" echo   $c = $c -replace 'lblHelpPage1\s*:\s*"Move your finger to flip the book page\."', 'lblHelpPage1:"Mueva su dedo para voltear la página del libro."'
>>"%PS_SCRIPT%" echo   $c = $c -replace 'lblHelpPage2\s*:\s*"Zoom in by using gesture or double click on the page\."', 'lblHelpPage2:"Acérquese usando sus dedos o haga doble clic en la página."'
>>"%PS_SCRIPT%" echo   $c = $c -replace 'lblHelpPage3\s*:\s*"Click to view the table of content, bookmarks and share your books via social networks\."', 'lblHelpPage3:"Haga clic para ver la tabla de contenido y marcadores."'
>>"%PS_SCRIPT%" echo   $c = $c -replace 'lblHelpPage4\s*:\s*"Add bookmarks, use search function and auto flip the book\."', 'lblHelpPage4:"Agregue marcadores, use la función de búsqueda y voltee automáticamente el libro."'
>>"%PS_SCRIPT%" echo   $c = $c -replace 'lblHelpPage5\s*:\s*"Open the thumbnails to overview all book pages\."', 'lblHelpPage5:"Abra las miniaturas para ver todas las páginas del libro."'
>>"%PS_SCRIPT%" echo   $helpReplaced = $true
>>"%PS_SCRIPT%" echo }

>>"%PS_SCRIPT%" echo Set-Content -LiteralPath $p -Value $c -Encoding Default
>>"%PS_SCRIPT%" echo Write-Host '---------------------------------------------'
>>"%PS_SCRIPT%" echo if ($inserted) { Write-Host '[OK] Bloque insertado correctamente' } else { Write-Host '[ADVERTENCIA] Bloque ya existia o no se encontro var aliasConfig' }
>>"%PS_SCRIPT%" echo if ($replaced) { Write-Host '[OK] bookConfig.totalPageCount reemplazado' } else { Write-Host '[ADVERTENCIA] No se encontro bookConfig.totalPageCount = numero;' }
>>"%PS_SCRIPT%" echo if ($helpReplaced) { Write-Host '[OK] Textos de ayuda traducidos' } else { Write-Host '[ADVERTENCIA] No se encontraron textos de ayuda en ingles' }
>>"%PS_SCRIPT%" echo Write-Host '---------------------------------------------'

echo Ejecutando PowerShell...

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%"

if errorlevel 1 (
    echo ERROR: Fallo PowerShell
    pause
    del "%PS_SCRIPT%" >nul 2>&1
    popd
    exit /b 1
)

del "%PS_SCRIPT%" >nul 2>&1

echo.
echo ¡Listo! Cambios aplicados correctamente.
echo Backup: %CD%\%BACKUP_PATH%
echo.

pause
popd
