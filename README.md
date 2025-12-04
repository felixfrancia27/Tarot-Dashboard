# Tarot Dashboard - ElevenLabs

Dashboard moderno para visualizar y gestionar las conversaciones de tu agente de ElevenLabs Conversational AI.

## Características

- **Login por cliente**: Cada cliente puede acceder con sus propias credenciales de ElevenLabs
- **Dashboard con estadísticas**: Vista general de llamadas, duración, mensajes y tasa de éxito
- **Lista de conversaciones**: Historial completo con filtros y búsqueda
- **Detalle de conversación**: Transcripción completa, análisis, metadatos y audio
- **Diseño moderno**: Tema oscuro con estética mística/tarot
- **Angular 17**: Usando las últimas características (signals, standalone components, etc.)

## Requisitos

- Node.js 18+
- npm o yarn
- Angular CLI 17

## Instalación

```bash
# Navegar al directorio del proyecto
cd tarot-dashboard

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

El servidor se iniciará en `http://localhost:4200`

## Uso

### Login

1. Ingresa el nombre de tu cliente
2. Ingresa tu ElevenLabs API Key (la encuentras en tu perfil de ElevenLabs)
3. Ingresa el Agent ID de tu agente de Conversational AI
4. (Opcional) Nombre del agente

### Dashboard

- Vista general de estadísticas
- Llamadas recientes
- Métricas de uso

### Conversaciones

- Lista completa de todas las conversaciones
- Filtros por estado (Exitoso, En proceso, Fallido)
- Búsqueda por ID

### Detalle de Conversación

- Transcripción completa con roles (usuario/agente)
- Tiempo de cada mensaje en la llamada
- Análisis y resumen generado
- Metadatos (costo, créditos, duración)
- Audio de la conversación (si está disponible)

## API de ElevenLabs utilizada

El dashboard consume los siguientes endpoints:

- `GET /v1/convai/conversations` - Lista todas las conversaciones
- `GET /v1/convai/conversations/:id` - Detalle de una conversación
- `GET /v1/convai/conversations/:id/audio` - Audio de la conversación
- `DELETE /v1/convai/conversations/:id` - Eliminar conversación

## Estructura del proyecto

```
src/app/
├── components/
│   ├── layout/           # Layout principal con sidebar
│   └── sidebar/          # Sidebar de navegación
├── guards/
│   └── auth.guard.ts     # Guard de autenticación
├── interceptors/
│   └── auth.interceptor.ts # Interceptor para API key
├── models/
│   └── conversation.model.ts # Modelos TypeScript
├── pages/
│   ├── login/            # Página de login
│   ├── dashboard/        # Dashboard principal
│   ├── conversations/    # Lista de conversaciones
│   └── conversation-detail/ # Detalle de conversación
├── services/
│   ├── auth.service.ts   # Servicio de autenticación
│   └── elevenlabs.service.ts # Cliente API ElevenLabs
├── app.component.ts
└── app.routes.ts
```

## Tecnologías

- **Angular 17** - Framework frontend
- **TypeScript 5.4** - Lenguaje tipado
- **RxJS 7.8** - Programación reactiva
- **SCSS** - Estilos con variables CSS

## Personalización

### Tema

Los colores y estilos se pueden personalizar en `src/styles.scss`:

```scss
:root {
  --color-primary: #6C5CE7;      // Color principal
  --color-secondary: #00CEC9;    // Color secundario
  --bg-dark: #0F0E17;            // Fondo oscuro
  // ... más variables
}
```

### Logo

Reemplaza el SVG en el componente `login.component.ts` y `sidebar.component.ts`.

## Producción

```bash
# Build de producción
npm run build

# Los archivos se generan en dist/tarot-dashboard
```

## Licencia

MIT

