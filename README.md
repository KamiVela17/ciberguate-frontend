# CiberGuate IA — Frontend

Aplicación web de CiberGuate IA. Implementa autenticación, navegación protegida, activos, diagnósticos, riesgos, monitoreo, cumplimiento, incidentes, reportes y seguridad.

## Tecnologías

- React 19, TypeScript y React Router DOM.
- Redux Toolkit y RTK Query para estado global y API.
- Chart.js para tableros y React PDF para reportes.
- Docker y Nginx para producción.

## Inicio rápido

```bash
npm ci
npm run dev
```

Antes de publicar:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Documentación

El índice está en [docs/README.md](docs/README.md):

- [Arquitectura](docs/architecture.md)
- [Rutas y casos de uso](docs/routes-and-use-cases.md)
- [Estado global](docs/state-management.md)
- [Dashboards y reportes](docs/reporting.md)
- [Desarrollo y CI/CD](docs/development.md)
- [Seguridad](docs/security.md)

La rama `main` publica en Amazon ECR una imagen identificada con el SHA completo del commit y actualiza GitOps. Entorno publicado: <https://100.49.206.62.nip.io>.
