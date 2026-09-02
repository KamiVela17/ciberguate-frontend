# Arquitectura del Frontend

## Vista de contenedores

```mermaid
flowchart LR
    USER[Usuario] -->|HTTPS| EDGE[Entrada pública]
    EDGE -->|Archivos estáticos| WEB[React en Nginx]
    WEB -->|REST y JWT| API[Backend Node.js]
    WEB -->|OAuth2| IDP[Proveedor de identidad]
```

## Capas internas

```mermaid
flowchart TB
    ROUTER[React Router DOM] --> LAYOUT[Layout y navegación]
    ROUTER --> PAGES[Páginas funcionales]
    PAGES --> COMPONENTS[Componentes UI]
    PAGES --> STORE[Redux Store]
    STORE --> AUTH[Auth slice]
    STORE --> UI[UI slice]
    STORE --> RTK[RTK Query API]
    RTK --> HTTP[Backend REST]
    COMPONENTS --> CHARTS[Chart.js]
    COMPONENTS --> REPORTS[React PDF]
```

| Capa | Responsabilidad |
| --- | --- |
| Router | Resolver URL, retorno posterior al login y protección de rutas |
| Páginas | Orquestar cada capacidad y estados de carga/error |
| Store | Compartir sesión, interfaz y caché de datos |
| RTK Query | Consultas, mutaciones, etiquetas y errores HTTP |
| Componentes | Presentación reutilizable, gráficas y documentos |

## Diagrama de componentes

```mermaid
classDiagram
    class AppRouter {
      +routes
      +ProtectedRoute
    }
    class StoreProvider {
      +authSlice
      +uiSlice
      +platformApi
    }
    class Page {
      +render()
      +handleAction()
    }
    class PlatformApi {
      +queries
      +mutations
      +tags
    }
    class ChartComponents
    class ReportDocuments
    AppRouter --> StoreProvider
    AppRouter --> Page
    Page --> PlatformApi
    Page --> ChartComponents
    Page --> ReportDocuments
```

## Decisiones

- La URL es la fuente de verdad de la sección activa y permite enlaces directos.
- Redux conserva estado transversal; los datos remotos viven en RTK Query.
- Gráficas y reportes se derivan de la API, no de datos simulados.
- Cada resultado presenta fecha, alcance y detalle verificable.
