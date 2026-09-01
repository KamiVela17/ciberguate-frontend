# CiberGuate Frontend

Panel React/Next.js para inventario de activos, evaluación de riesgos NIST,
dashboard, recomendaciones y reportes. El pipeline ejecuta lint, TypeScript y
build; en `main` publica una imagen ECR con etiqueta igual al SHA completo del
commit y actualiza el overlay `dev` del repositorio GitOps.

```powershell
npm install
npm run dev
```

Variables del repositorio GitHub: `AWS_REGION`, `ECR_REPOSITORY` y
`GITOPS_REPOSITORY`. Secretos: `AWS_ROLE_ARN` y `GITOPS_DEPLOY_KEY`.
