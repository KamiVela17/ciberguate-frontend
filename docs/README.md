# Documentación del Frontend

| Documento | Contenido |
| --- | --- |
| [Arquitectura](architecture.md) | Capas, componentes y dependencias |
| [Rutas y casos de uso](routes-and-use-cases.md) | Navegación, actores y flujos |
| [Estado global](state-management.md) | Redux Toolkit, RTK Query y sesión |
| [Dashboards y reportes](reporting.md) | Chart.js, React PDF y trazabilidad |
| [Desarrollo](development.md) | Entorno local, Docker y CI/CD |
| [Seguridad](security.md) | Controles del cliente web |

El frontend presenta y captura información; el backend realiza la evaluación, persistencia y autorización definitiva.

```mermaid
flowchart LR
    U[Usuario] --> UI[React]
    UI --> ST[Redux Toolkit]
    ST --> API[RTK Query]
    API --> BE[API CiberGuate]
    UI --> CH[Chart.js]
    UI --> PDF[React PDF]
```
