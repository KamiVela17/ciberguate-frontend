# CiberGuate Frontend

El MVP usa `react-router-dom` para las rutas protegidas `/dashboard`, `/assets`,
`/risks`, `/diagnostics`, `/monitoring`, `/alerts`, `/compliance`, `/documents`,
`/soc`, `/incidents`, `/reports` y `/security`. Incluye flujos para diagnóstico,
monitoreo, cumplimiento, SOC/SIEM, incidentes, MFA y reportes autenticados.

Panel React/Next.js para inventario de activos, evaluación de riesgos NIST,
dashboard, recomendaciones y reportes. El pipeline ejecuta lint, TypeScript y
build; en `main` publica una imagen ECR con etiqueta igual al SHA completo del
commit y actualiza el overlay `dev` del repositorio GitOps.

La aplicación inicia en una pantalla de autenticación y conserva el token de
acceso solamente durante la sesión del navegador.

```powershell
npm install
npm run dev
```

Variables del repositorio GitHub: `AWS_REGION`, `ECR_REPOSITORY` y
`GITOPS_REPOSITORY`. Secretos: `AWS_ROLE_ARN` y `GITOPS_DEPLOY_KEY`.
