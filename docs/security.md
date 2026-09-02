# Seguridad del Frontend

## Límites de confianza

```mermaid
flowchart LR
    B[Browser no confiable] -->|HTTPS| E[Entrada pública]
    E --> W[Aplicación estática]
    W -->|JWT| A[API autorizadora]
    W -.->|redirección OAuth2| I[Proveedor de identidad]
```

El navegador nunca se considera una autoridad. Ocultar un botón mejora la experiencia, pero sólo el backend puede autorizar una operación.

## Controles

| Riesgo | Control |
| --- | --- |
| Exposición persistente del token | Uso de `sessionStorage`, cierre explícito y ausencia en logs |
| Acceso sin sesión | Rutas protegidas y validación de `/auth/me` |
| Sesión expirada | Manejo de 401 y retorno al login |
| Inyección en la interfaz | Renderizado escapado de React; evitar HTML arbitrario |
| Dependencias vulnerables | Lockfile, auditoría y compilación en CI |
| Datos engañosos | Estados de error explícitos y evidencia junto a KPIs |
| Transporte inseguro | HTTPS en el punto de entrada público |

## Autenticación

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend
    participant A as Backend
    U->>F: Credenciales
    F->>A: POST /auth/login
    A-->>F: JWT o desafío MFA
    opt MFA requerido
      U->>F: Código temporal
      F->>A: POST /auth/mfa/verify
      A-->>F: JWT
    end
    F->>A: GET /auth/me con Bearer
    A-->>F: Identidad válida
```

No documente contraseñas, tokens, claves OAuth ni valores de Kubernetes Secret. Los archivos `.env` locales deben permanecer fuera del control de versiones.
