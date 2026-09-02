# Estado global y acceso a datos

## Diseño

```mermaid
flowchart LR
    VIEW[Vista] -->|dispatch| SLICE[Redux slices]
    SLICE --> STORE[Store]
    STORE --> VIEW
    VIEW -->|hook query o mutation| RTK[RTK Query]
    RTK -->|Bearer token| API[API REST]
    API --> RTK
    RTK -->|caché normalizada por endpoint| VIEW
```

| Módulo | Contenido | Persistencia |
| --- | --- | --- |
| `authSlice` | Token, usuario y estado de autenticación | `sessionStorage` |
| `uiSlice` | Preferencias transversales de interfaz | Memoria |
| `platformApi` | Consultas, mutaciones y caché de API | Memoria |

El token se conserva durante la sesión del navegador, no de forma permanente. `prepareHeaders` lo agrega como `Authorization: Bearer` a las solicitudes protegidas.

## Ciclo de mutación

```mermaid
sequenceDiagram
    participant C as Componente
    participant Q as RTK Query
    participant A as API
    C->>Q: Ejecuta mutación
    Q->>A: Solicitud autenticada
    A-->>Q: Recurso actualizado
    Q->>Q: Invalida etiquetas
    Q->>A: Actualiza consultas activas
    A-->>Q: Estado vigente
    Q-->>C: Renderiza resultado
```

## Convenciones

- Estado local para formularios temporales; Redux sólo para datos compartidos.
- No duplicar respuestas de RTK Query dentro de slices.
- Usar etiquetas específicas para evitar recargar módulos no relacionados.
- Representar explícitamente `isLoading`, `isFetching`, `error` y estado vacío.
- Cerrar la sesión ante credenciales inválidas y evitar registrar el token.
