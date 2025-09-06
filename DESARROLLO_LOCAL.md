# Guía de Desarrollo Local - Proyecto Social Network

## 📋 Requisitos Previos

- **Node.js** versión 18 o superior
- **Git** instalado
- **npm** o **yarn** como gestor de paquetes
- Cuenta en **Supabase** (opcional para desarrollo)

## 🚀 Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone [URL_DEL_REPOSITORIO]
cd [NOMBRE_DEL_PROYECTO]
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configuración de Variables de Entorno

El proyecto **NO** usa archivos `.env`. Las credenciales de Supabase están directamente en el código:

**Ubicación**: `src/integrations/supabase/client.ts`

```typescript
const SUPABASE_URL = "https://nxlmuoozrtqhdqqpdscr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

**¿Por qué no hay .env?**
- Lovable maneja las credenciales de forma automática
- Las claves públicas (anon key) son seguras para el frontend
- El proyecto se conecta automáticamente a la base de datos de producción

### 4. Ejecutar el Proyecto

```bash
npm run dev
```

El proyecto estará disponible en: `http://localhost:8080`

## 🔗 Conexión con Supabase

### Base de Datos de Producción
- **URL**: `https://nxlmuoozrtqhdqqpdscr.supabase.co`
- **Project ID**: `nxlmuoozrtqhdqqpdscr`
- **Conexión**: Automática al ejecutar `npm run dev`

### Características de la API:
- **Autenticación**: JWT automático
- **REST API**: `/rest/v1/` endpoints
- **Storage**: Buckets para imágenes y archivos
- **Real-time**: Subscripciones en tiempo real
- **Edge Functions**: Funciones serverless

### Tablas Principales:
- `profiles` - Perfiles de usuario
- `posts` - Publicaciones del feed
- `stories` - Historias (24h expiración)
- `ride_offers` - Ofertas de viajes (30min expiración)
- `ride_requests` - Solicitudes de viajes (30min expiración)
- `private_chats` - Chats privados
- `groups` - Grupos y canales
- `friendships` - Sistema de amistades

## 👥 Workflow de Desarrollo en Equipo

### Estructura de Ramas Recomendada

```bash
main/master     # Producción (se sincroniza con Lovable)
develop         # Desarrollo principal
feature/[nombre] # Nuevas funcionalidades
hotfix/[nombre]  # Correcciones urgentes
```

### Flujo de Trabajo

1. **Crear nueva rama para funcionalidad**:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad
```

2. **Desarrollo y commits**:
```bash
git add .
git commit -m "feat: descripción de la funcionalidad"
git push origin feature/nueva-funcionalidad
```

3. **Pull Request**:
- Crear PR hacia `develop`
- Code review por el equipo
- Merge después de aprobación

4. **Deploy a producción**:
```bash
git checkout main
git merge develop
git push origin main
```

**⚠️ Importante**: Los cambios en `main` se sincronizan automáticamente con Lovable.

## 🛠️ Comandos Útiles

### Desarrollo
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Previsualizar build
npm run lint         # Linter
```

### Git
```bash
git status           # Ver estado
git log --oneline    # Historial compacto
git branch -a        # Ver todas las ramas
```

## 📁 Estructura del Proyecto

```
src/
├── components/      # Componentes React
│   ├── ui/         # Componentes de UI (shadcn)
│   ├── feed/       # Componentes del feed
│   ├── chat/       # Sistema de chat
│   ├── groups/     # Grupos y canales
│   └── profile/    # Perfil de usuario
├── hooks/          # Custom hooks
├── pages/          # Páginas principales
├── integrations/   # Integraciones (Supabase)
├── lib/           # Utilidades
└── main.tsx       # Punto de entrada
```

## 🔧 Tecnologías del Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Real-time**: Supabase Realtime
- **Routing**: React Router DOM
- **State**: React Query + React hooks

## 🐛 Debugging y Logs

### Logs de Desarrollo
```bash
# Los logs aparecen automáticamente en la consola
npm run dev
```

### Supabase Dashboard
- **URL**: `https://supabase.com/dashboard/project/nxlmuoozrtqhdqqpdscr`
- **SQL Editor**: Para consultas directas
- **Auth**: Gestión de usuarios
- **Storage**: Archivos subidos
- **Edge Functions**: Logs de funciones

### Herramientas de Debug
- **React DevTools**: Extensión de navegador
- **Console del navegador**: F12
- **Network tab**: Para ver requests API

## 🚨 Consideraciones Importantes

### Seguridad
- Las claves públicas están en el código (es seguro)
- Las RLS policies protegen los datos
- Autenticación JWT automática

### Performance
- Lazy loading implementado
- Optimización de imágenes automática
- Caching de React Query

### Base de Datos
- **Producción compartida**: Todos trabajan con los mismos datos
- **Migraciones**: Se aplican automáticamente
- **Backups**: Manejados por Supabase

## 📞 Soporte

### Problemas Comunes

1. **Error de conexión a Supabase**:
   - Verificar conexión a internet
   - Comprobar que las credenciales no hayan cambiado

2. **Dependencias faltantes**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Puerto ocupado**:
   ```bash
   # Cambiar puerto en vite.config.ts
   server: { port: 3000 }
   ```

### Recursos
- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Lovable Docs**: https://docs.lovable.dev

---

## ✅ Checklist de Configuración

- [ ] Node.js 18+ instalado
- [ ] Repositorio clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Proyecto ejecutándose (`npm run dev`)
- [ ] Acceso a http://localhost:8080
- [ ] Conexión a Supabase funcionando
- [ ] Autenticación de usuarios probada

**¡Tu equipo ya puede desarrollar colaborativamente!** 🎉