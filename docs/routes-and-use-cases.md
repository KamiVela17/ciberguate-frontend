# Rutas y casos de uso

## Actores y capacidades

```mermaid
flowchart LR
    ADMIN[Administrador] --> AUTH[Administrar sesión y MFA]
    ADMIN --> ASSETS[Gestionar activos]
    ANALYST[Analista] --> SCAN[Ejecutar diagnósticos]
    ANALYST --> MON[Monitorear y gestionar incidentes]
    AUDITOR[Auditor] --> COMP[Revisar cumplimiento]
    AUDITOR --> REPORTS[Consultar y descargar reportes]
```

La autorización final depende del backend. Actualmente los usuarios autenticados comparten las capacidades funcionales disponibles.

## Mapa de navegación

| Ruta | Función | Datos |
| --- | --- | --- |
| `/login`, `/oauth/callback` | Autenticación | Sesión y token |
| `/dashboard` | Resumen ejecutivo | KPIs, riesgos, actividad |
| `/assets` | Inventario | Activos |
| `/risks` | Evaluación | Riesgos |
| `/diagnostics` | Ejecuciones y hallazgos | Escaneos |
| `/monitoring`, `/alerts` | Disponibilidad y alertas | Monitores |
| `/compliance` | NIST/ISO | Controles |
| `/documents` | Evidencia | Documentos |
| `/soc`, `/incidents` | Operación y respuesta | Eventos e incidentes |
| `/reports` | Historial y PDF | Reportes |
| `/plans`, `/security` | Oferta y configuración | Seguridad |

```mermaid
stateDiagram-v2
    [*] --> ValidandoSesion
    ValidandoSesion --> Login: sin token válido
    ValidandoSesion --> Aplicacion: sesión válida
    Login --> Aplicacion: autenticación correcta
    Aplicacion --> Login: cierre o respuesta 401
    Aplicacion --> Aplicacion: navegación interna
```

## Diagnóstico y evidencia

```mermaid
sequenceDiagram
    actor U as Analista
    participant F as Frontend
    participant A as API
    U->>F: Indica objetivo y ejecuta
    F->>A: POST /scans
    A-->>F: Puntaje y hallazgos
    F->>A: GET /scans
    A-->>F: Historial persistido
    F-->>U: KPIs, gráfica y detalle
    U->>F: Solicita reporte
    F-->>U: Documento con resultados
```

Toda mutación muestra progreso, éxito o error; los estados vacíos indican cómo generar información y cada KPI conserva acceso a su evidencia.
