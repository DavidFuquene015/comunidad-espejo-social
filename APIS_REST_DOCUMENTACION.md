# 📚 Documentación de APIs REST - Red Social SENA

## 🎯 Resumen Ejecutivo

Este proyecto implementa **6 APIs REST completas** usando **Edge Functions de Supabase** (TypeScript + Deno). Todas las operaciones del frontend consumen estas APIs, cumpliendo con arquitectura de 3 capas: Frontend (React) → API REST → Base de Datos (PostgreSQL).

---

## 📋 Índice de APIs

1. [Books API](#1-books-api) - CRUD de libros académicos
2. [Stories API](#2-stories-api) - Historias efímeras (24h)
3. [Posts API](#3-posts-api) - Publicaciones, reacciones y comentarios
4. [Chats API](#4-chats-api) - Mensajería privada
5. [Rides API](#5-rides-api) - Sistema de viajes compartidos
6. [Profiles API](#6-profiles-api) - Perfiles, amigos y proyectos

---

## 🔐 Autenticación

**Todas las APIs (excepto Books API) requieren autenticación JWT.**

### Headers requeridos:
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Obtener Token:
El token se obtiene mediante login en Supabase Auth y se envía automáticamente desde el cliente React.

---

## 1. Books API

**Base URL:** `https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/books-api`

**Autenticación:** ❌ No requerida (API pública)

### Endpoints:

#### GET `/` - Listar todos los libros
```bash
curl https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/books-api
```

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "title": "Introducción a la Programación",
    "author": "Juan Pérez",
    "isbn": "978-3-16-148410-0",
    "genre": "Tecnología",
    "description": "Libro sobre programación básica",
    "publication_year": 2023,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### GET `/:id` - Obtener un libro específico
```bash
curl https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/books-api/{book_id}
```

#### POST `/` - Crear libro
```bash
curl -X POST https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/books-api \
  -H "Content-Type: application/json" \
  -d '{
    "title": "React Avanzado",
    "author": "María García",
    "isbn": "978-1-234-56789-0",
    "genre": "Programación",
    "description": "Guía avanzada de React",
    "publication_year": 2024
  }'
```

#### PUT `/:id` - Actualizar libro
```bash
curl -X PUT https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/books-api/{book_id} \
  -H "Content-Type: application/json" \
  -d '{"title": "React Avanzado 2da Edición"}'
```

#### DELETE `/:id` - Eliminar libro
```bash
curl -X DELETE https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/books-api/{book_id}
```

---

## 2. Stories API

**Base URL:** `https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/stories-api`

**Autenticación:** ✅ JWT requerido

### Endpoints:

#### GET `/stories` - Obtener historias activas
```bash
curl https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/stories-api/stories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "media_url": "https://...",
    "media_type": "image",
    "caption": "Mi día en el SENA",
    "created_at": "2024-01-01T10:00:00Z",
    "expires_at": "2024-01-02T10:00:00Z",
    "profiles": {
      "full_name": "Juan Estudiante",
      "avatar_url": "https://..."
    }
  }
]
```

#### POST `/stories` - Crear historia
```bash
curl -X POST https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/stories-api/stories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "media_url": "https://storage.supabase.co/...",
    "media_type": "image",
    "caption": "Aprendiendo React en el SENA"
  }'
```

#### DELETE `/stories/:id` - Eliminar historia
```bash
curl -X DELETE https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/stories-api/stories/{story_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Nota:** Las historias expiran automáticamente después de 24 horas.

---

## 3. Posts API

**Base URL:** `https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/posts-api`

**Autenticación:** ✅ JWT requerido

### Endpoints:

#### GET `/posts` - Obtener feed de posts
```bash
curl https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/posts-api/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "content": "Terminé mi proyecto final!",
    "media_url": "https://...",
    "media_type": "image",
    "created_at": "2024-01-01T12:00:00Z",
    "profiles": {
      "full_name": "María López",
      "avatar_url": "https://..."
    },
    "reactions": [
      {"id": "uuid", "emoji": "👍", "user_id": "uuid"}
    ],
    "comments": [
      {
        "id": "uuid",
        "content": "Felicidades!",
        "user_id": "uuid",
        "created_at": "2024-01-01T12:30:00Z",
        "profiles": {
          "full_name": "Pedro Sánchez",
          "avatar_url": "https://..."
        }
      }
    ],
    "_count": {
      "reactions": 5,
      "comments": 2
    }
  }
]
```

#### POST `/posts` - Crear publicación
```bash
curl -X POST https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/posts-api/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Aprendí TypeScript hoy!",
    "media_url": null,
    "media_type": null
  }'
```

#### POST `/reactions` - Agregar/quitar reacción
```bash
curl -X POST https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/posts-api/reactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": "uuid",
    "emoji": "❤️",
    "remove": false
  }'
```

#### POST `/comments` - Agregar comentario
```bash
curl -X POST https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/posts-api/comments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": "uuid",
    "content": "Excelente trabajo!"
  }'
```

---

## 4. Chats API

**Base URL:** `https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/chats-api`

**Autenticación:** ✅ JWT requerido

### Endpoints:

#### GET `/chats` - Listar conversaciones
```bash
curl https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/chats-api/chats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "user1_id": "uuid",
    "user2_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T15:00:00Z",
    "other_user": {
      "id": "uuid",
      "full_name": "Ana Martínez",
      "avatar_url": "https://..."
    },
    "last_message": {
      "id": "uuid",
      "content": "Hola, cómo estás?",
      "created_at": "2024-01-01T15:00:00Z",
      "read_at": null,
      "sender": {
        "full_name": "Ana Martínez",
        "avatar_url": "https://..."
      }
    },
    "unread_count": 3
  }
]
```

#### POST `/chats` - Crear o obtener chat
```bash
curl -X POST https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/chats-api/chats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "friend_id": "uuid"
  }'
```

**Respuesta:**
```json
{
  "chat_id": "uuid"
}
```

#### GET `/messages/:chat_id` - Obtener mensajes
```bash
curl https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/chats-api/messages/{chat_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### POST `/messages` - Enviar mensaje
```bash
curl -X POST https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/chats-api/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "uuid",
    "content": "Hola! Te escribo para...",
    "media_url": null,
    "media_type": null
  }'
```

#### PUT `/messages/read/:chat_id` - Marcar mensajes como leídos
```bash
curl -X PUT https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/chats-api/messages/read/{chat_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 5. Rides API

**Base URL:** `https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/rides-api`

**Autenticación:** ✅ JWT requerido

### Endpoints:

#### GET `/requests` - Listar solicitudes de viaje
```bash
curl https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/rides-api/requests \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "student_id": "uuid",
    "origin_address": "SENA Cali",
    "origin_latitude": 3.4372,
    "origin_longitude": -76.5225,
    "destination_address": "Universidad del Valle",
    "destination_latitude": 3.3722,
    "destination_longitude": -76.5339,
    "departure_time": "2024-01-02T07:00:00Z",
    "max_passengers": 2,
    "description": "Busco viaje compartido",
    "status": "active",
    "expires_at": "2024-01-02T07:30:00Z",
    "student": {
      "full_name": "Carlos Rodríguez",
      "avatar_url": "https://..."
    }
  }
]
```

#### GET `/offers` - Listar ofertas de viaje
```bash
curl https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/rides-api/offers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### POST `/matches` - Crear match de viaje
```bash
curl -X POST https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/rides-api/matches \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": "uuid",
    "offer_id": "uuid"
  }'
```

**Nota:** Las solicitudes y ofertas expiran automáticamente después de 30 minutos.

---

## 6. Profiles API

**Base URL:** `https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/profiles-api`

**Autenticación:** ✅ JWT requerido

### Endpoints:

#### GET `/friends/:user_id` - Obtener amigos de un usuario
```bash
curl https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/profiles-api/friends/{user_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "full_name": "Laura Gómez",
    "avatar_url": "https://...",
    "bio": "Aprendiz de desarrollo web"
  }
]
```

#### GET `/friends-count/:user_id` - Contar amigos
```bash
curl https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/profiles-api/friends-count/{user_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta:**
```json
{
  "count": 15
}
```

#### GET `/projects-count/:user_id` - Contar proyectos
```bash
curl https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/profiles-api/projects-count/{user_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### DELETE `/projects/:project_id` - Eliminar proyecto
```bash
curl -X DELETE https://nxlmuoozrtqhdqqpdscr.supabase.co/functions/v1/profiles-api/projects/{project_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐
│   React App     │  ← Frontend (Puerto 5173)
│   (TypeScript)  │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│  Edge Functions │  ← APIs REST (TypeScript + Deno)
│   (Supabase)    │
└────────┬────────┘
         │
         │ SQL
         │
┌────────▼────────┐
│   PostgreSQL    │  ← Base de Datos
│   (Supabase)    │
└─────────────────┘
```

### Flujo de Datos:
1. Usuario interactúa con React App
2. React llama a API REST usando `supabase.functions.invoke()`
3. Edge Function valida JWT y procesa petición
4. Edge Function consulta/modifica PostgreSQL
5. Respuesta JSON regresa a React
6. React actualiza UI

---

## 📊 Tabla Comparativa de Consumo

| Funcionalidad | Hook React | API REST Consumida | Método HTTP |
|--------------|------------|-------------------|-------------|
| Listar historias | `useStories()` | `stories-api/stories` | GET |
| Crear historia | `uploadStory()` | `stories-api/stories` | POST |
| Eliminar historia | `deleteStory()` | `stories-api/stories/:id` | DELETE |
| Listar posts | `usePosts()` | `posts-api/posts` | GET |
| Crear post | `createPost()` | `posts-api/posts` | POST |
| Reaccionar | `toggleReaction()` | `posts-api/reactions` | POST |
| Comentar | `addComment()` | `posts-api/comments` | POST |
| Listar chats | `usePrivateChats()` | `chats-api/chats` | GET |
| Crear chat | `getOrCreateChat()` | `chats-api/chats` | POST |
| Ver mensajes | `usePrivateMessages()` | `chats-api/messages/:id` | GET |
| Enviar mensaje | `sendMessage()` | `chats-api/messages` | POST |
| Marcar leído | `markMessagesAsRead()` | `chats-api/messages/read/:id` | PUT |
| Solicitudes viaje | `useRides()` | `rides-api/requests` | GET |
| Ofertas viaje | `useRides()` | `rides-api/offers` | GET |
| Hacer match | `createRideMatch()` | `rides-api/matches` | POST |
| Ver amigos | `ProfileFriends` | `profiles-api/friends/:id` | GET |
| Contar amigos | `ProfileHeader` | `profiles-api/friends-count/:id` | GET |
| Contar proyectos | `ProfileHeader` | `profiles-api/projects-count/:id` | GET |
| Eliminar proyecto | `ProfileProjects` | `profiles-api/projects/:id` | DELETE |

---

## 🔍 Ejemplos de Código Frontend

### Consumo desde React (useStories.tsx)

```typescript
// ❌ ANTES: Consulta directa a BD
const { data, error } = await supabase
  .from('stories')
  .select('*')
  .gt('expires_at', new Date().toISOString());

// ✅ AHORA: Consumo de API REST
const { data, error } = await supabase.functions.invoke('stories-api/stories', {
  method: 'GET',
});
```

### Ejemplo completo de POST

```typescript
const uploadStory = async (file: File, caption?: string) => {
  // 1. Subir archivo a Storage
  const { error: uploadError } = await supabase.storage
    .from('profile-images')
    .upload(filePath, file);

  // 2. Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('profile-images')
    .getPublicUrl(filePath);

  // 3. Llamar API REST para crear historia
  const { data, error } = await supabase.functions.invoke('stories-api/stories', {
    method: 'POST',
    body: {
      media_url: publicUrl,
      media_type: 'image',
      caption: caption || null,
    },
  });

  if (error) {
    toast({ title: "Error", description: "No se pudo crear la historia." });
    return null;
  }

  return data;
};
```

---

## 🛡️ Seguridad

### 1. Autenticación JWT
Todas las APIs (excepto Books) validan el token JWT:

```typescript
const { data: { user } } = await supabaseClient.auth.getUser();
if (!user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: corsHeaders,
  });
}
```

### 2. Row Level Security (RLS)
La base de datos tiene políticas RLS que garantizan:
- Los usuarios solo ven sus propios datos privados
- Las historias solo son visibles para amigos
- Los chats solo accesibles para participantes

### 3. CORS
Todas las APIs tienen headers CORS configurados:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

---

## 📈 Ventajas de esta Arquitectura

✅ **Separación de responsabilidades:** Frontend solo maneja UI, backend maneja lógica
✅ **Seguridad:** JWT y RLS protegen datos sensibles
✅ **Escalabilidad:** Edge Functions escalan automáticamente
✅ **Mantenibilidad:** Código organizado en APIs independientes
✅ **Testing:** APIs pueden probarse con Postman/curl
✅ **Reutilización:** Las APIs pueden consumirse desde otras apps

---

## 🚀 Cómo Probar las APIs

### 1. Con Postman

Importa las colecciones de Postman incluidas en:
- `postman_collections/`

### 2. Con cURL

Ejemplos incluidos en cada sección de este documento.

### 3. Desde el Frontend

Abre DevTools → Network → Filtra por "functions" para ver llamadas reales.

---

## 📞 Soporte

**Ubicación del código:**
- Edge Functions: `supabase/functions/`
- Hooks React: `src/hooks/`
- Componentes: `src/components/`

**Logs de las APIs:**
Ver en Supabase Dashboard → Functions → Logs

---

## 📝 Conclusión

Este proyecto implementa una arquitectura completa de 3 capas con **6 APIs REST funcionales** que gestionan:
- 📚 Biblioteca académica
- 📸 Historias temporales
- 📱 Red social (posts, reacciones, comentarios)
- 💬 Mensajería privada
- 🚗 Sistema de viajes compartidos
- 👥 Gestión de perfiles y amigos

**Todas las funcionalidades del frontend consumen exclusivamente estas APIs REST**, cumpliendo con los requisitos académicos del SENA.
