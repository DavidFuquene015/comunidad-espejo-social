# DOCUMENTACIÓN TÉCNICA DEL PROYECTO
## RED SOCIAL UNIVERSITARIA - SENA

---

## 1. INFORMACIÓN GENERAL DEL PROYECTO

**Nombre del Proyecto:** Red Social Universitaria Interactiva

**Institución:** Servicio Nacional de Aprendizaje (SENA)

**Tipo de Proyecto:** Aplicación Web Full-Stack con APIs REST

**Tecnologías Principales:** React, TypeScript, Supabase, PostgreSQL, APIs REST

**Fecha de Elaboración:** 2025

---

## 2. PLANTEAMIENTO DEL PROBLEMA

### 2.1 Descripción del Problema

En el entorno universitario actual, los estudiantes enfrentan desafíos significativos para:

- **Comunicación efectiva:** Dificultad para conectar con compañeros de clase y formar grupos de estudio
- **Colaboración académica:** Falta de una plataforma centralizada para compartir proyectos y recursos académicos
- **Movilidad sostenible:** Necesidad de optimizar el transporte mediante viajes compartidos entre estudiantes
- **Gestión de información:** Acceso limitado a bibliotecas digitales y recursos académicos centralizados
- **Networking profesional:** Carencia de espacios digitales para mostrar portafolios y conectar con otros estudiantes

### 2.2 Justificación

La creación de una red social universitaria especializada permitirá:

1. Mejorar la comunicación entre estudiantes mediante chats privados y grupales
2. Facilitar la colaboración en proyectos académicos
3. Optimizar recursos de transporte mediante viajes compartidos
4. Centralizar el acceso a recursos académicos digitales
5. Promover el networking profesional entre estudiantes

---

## 3. OBJETIVOS

### 3.1 Objetivo General

Desarrollar una aplicación web full-stack que funcione como red social universitaria, integrando funcionalidades de comunicación, colaboración académica, gestión de recursos bibliográficos y movilidad compartida, mediante una arquitectura basada en APIs REST y buenas prácticas de desarrollo de software.

### 3.2 Objetivos Específicos

1. **Implementar un sistema de autenticación y perfiles de usuario** que permita a los estudiantes crear y gestionar sus perfiles académicos y profesionales.

2. **Desarrollar un sistema de comunicación en tiempo real** mediante chats privados y grupales con soporte para mensajería multimedia.

3. **Crear un módulo de publicaciones y feed social** que permita compartir contenido académico, proyectos y actualizaciones entre estudiantes.

4. **Implementar un sistema de grupos colaborativos** con canales de texto y voz para facilitar el trabajo en equipo.

5. **Desarrollar un módulo de viajes compartidos** que permita a los estudiantes coordinar transporte de manera eficiente y sostenible.

6. **Integrar una biblioteca académica digital** con sistema de búsqueda y gestión de recursos bibliográficos.

7. **Construir una arquitectura basada en APIs REST** siguiendo estándares de la industria para garantizar escalabilidad y mantenibilidad.

8. **Implementar medidas de seguridad robustas** mediante Row Level Security (RLS) y autenticación JWT.

---

## 4. ALCANCE DEL PROYECTO

### 4.1 Alcance Funcional

El proyecto incluye:

✅ Sistema completo de autenticación de usuarios
✅ Gestión de perfiles personalizados con información académica y profesional
✅ Feed de publicaciones con reacciones y comentarios
✅ Sistema de historias efímeras (24 horas)
✅ Chat privado uno a uno con mensajería multimedia
✅ Grupos colaborativos con múltiples canales de comunicación
✅ Sistema de solicitudes y gestión de amistades
✅ Módulo de viajes compartidos (solicitudes y ofertas)
✅ Biblioteca académica con búsqueda de libros
✅ Portafolio de proyectos por usuario
✅ 6 APIs REST completamente documentadas
✅ Base de datos relacional con 17 tablas
✅ Sistema de almacenamiento de archivos multimedia

### 4.2 Alcance Técnico

**Frontend:**
- Single Page Application (SPA) con React 18
- TypeScript para tipado estático
- Tailwind CSS para diseño responsive
- React Router para navegación
- React Query para gestión de estado servidor

**Backend:**
- 6 Supabase Edge Functions (APIs REST)
- PostgreSQL como base de datos
- Row Level Security (RLS) para seguridad
- Supabase Auth para autenticación JWT
- Supabase Storage para archivos multimedia

**Arquitectura:**
- Arquitectura basada en microservicios (Edge Functions)
- Comunicación mediante APIs REST
- Real-time con Supabase Subscriptions
- Diseño modular y escalable

### 4.3 Limitaciones

El proyecto NO incluye:

❌ Aplicación móvil nativa (solo web responsive)
❌ Sistema de pagos o monetización
❌ Videoconferencias en tiempo real
❌ Sistema de calificaciones o evaluaciones académicas
❌ Integración con sistemas académicos institucionales
❌ Geolocalización en tiempo real para viajes

---

## 5. MÓDULOS DEL SISTEMA

### 5.1 Módulo de Autenticación y Perfiles

**Funcionalidades:**
- Registro de usuarios con email y contraseña
- Inicio de sesión seguro con JWT
- Gestión de perfiles personalizados
- Carga de avatar y foto de perfil
- Información académica (universidad, programa, año de graduación)
- Enlaces a redes sociales profesionales (GitHub, LinkedIn)
- Gestión de habilidades y biografía

**Tablas involucradas:** `profiles`

**API REST:** `/profiles-api`

### 5.2 Módulo de Red Social (Feed)

**Funcionalidades:**
- Crear publicaciones con texto y multimedia
- Reaccionar a publicaciones con emojis
- Comentar en publicaciones
- Ver feed ordenado cronológicamente
- Cargar medios (imágenes, videos)

**Tablas involucradas:** `posts`, `post_reactions`, `post_comments`

**API REST:** `/posts-api`

### 5.3 Módulo de Historias

**Funcionalidades:**
- Crear historias con foto o video
- Visualizar historias de amigos
- Expiración automática después de 24 horas
- Agregar caption a historias

**Tablas involucradas:** `stories`

**API REST:** `/stories-api`

### 5.4 Módulo de Amistades

**Funcionalidades:**
- Enviar solicitudes de amistad
- Aceptar o rechazar solicitudes
- Listar amigos
- Ver perfiles de usuarios sugeridos
- Buscar usuarios

**Tablas involucradas:** `friend_requests`, `friendships`

**API REST:** `/profiles-api`

### 5.5 Módulo de Chat Privado

**Funcionalidades:**
- Chat uno a uno en tiempo real
- Envío de mensajes de texto
- Envío de archivos multimedia
- Indicador de mensajes leídos
- Historial de conversaciones

**Tablas involucradas:** `private_chats`, `private_messages`

**API REST:** `/chats-api`

### 5.6 Módulo de Grupos Colaborativos

**Funcionalidades:**
- Crear grupos temáticos
- Gestionar miembros (roles de admin y member)
- Crear múltiples canales de texto
- Canales de voz
- Enviar mensajes con multimedia en canales
- Personalizar grupos con imagen de fondo

**Tablas involucradas:** `groups`, `group_members`, `channels`, `messages`

**APIs asociadas:** Base de datos directa con RLS

### 5.7 Módulo de Viajes Compartidos

**Funcionalidades:**
- Crear solicitudes de viaje
- Crear ofertas de viaje
- Especificar origen y destino
- Definir horarios de salida
- Gestionar asientos disponibles
- Crear coincidencias (matches) entre solicitudes y ofertas
- Expiración automática después de 30 minutos

**Tablas involucradas:** `ride_requests`, `ride_offers`, `ride_matches`

**API REST:** `/rides-api`

### 5.8 Módulo de Biblioteca Académica

**Funcionalidades:**
- Búsqueda de libros
- Visualizar información bibliográfica
- Filtrar por autor, género, título
- Gestión de recursos académicos

**Tablas involucradas:** `books`

**API REST:** `/books-api`

### 5.9 Módulo de Proyectos (Portafolio)

**Funcionalidades:**
- Agregar proyectos personales
- Subir imágenes de proyectos
- Especificar tecnologías utilizadas
- Enlaces a GitHub y sitio web
- Visualizar proyectos en perfil público

**Tablas involucradas:** `projects`

**API REST:** `/profiles-api`

---

## 6. REQUERIMIENTOS FUNCIONALES

### RF-01: Gestión de Usuarios
- El sistema debe permitir el registro de nuevos usuarios
- El sistema debe autenticar usuarios mediante email y contraseña
- El sistema debe permitir actualizar información de perfil
- El sistema debe generar tokens JWT para sesiones seguras

### RF-02: Gestión de Publicaciones
- El sistema debe permitir crear publicaciones con texto y/o multimedia
- El sistema debe permitir reaccionar con emojis a publicaciones
- El sistema debe permitir comentar en publicaciones
- El sistema debe mostrar un feed ordenado cronológicamente

### RF-03: Gestión de Historias
- El sistema debe permitir crear historias con multimedia
- El sistema debe eliminar automáticamente historias después de 24 horas
- El sistema debe mostrar solo historias de amigos

### RF-04: Gestión de Amistades
- El sistema debe permitir enviar solicitudes de amistad
- El sistema debe permitir aceptar o rechazar solicitudes
- El sistema debe crear relaciones bidireccionales al aceptar solicitudes
- El sistema debe sugerir usuarios para conectar

### RF-05: Sistema de Mensajería
- El sistema debe permitir chat privado entre usuarios
- El sistema debe soportar mensajes de texto y multimedia
- El sistema debe actualizar mensajes en tiempo real
- El sistema debe marcar mensajes como leídos

### RF-06: Gestión de Grupos
- El sistema debe permitir crear grupos colaborativos
- El sistema debe permitir crear canales dentro de grupos
- El sistema debe soportar canales de texto y voz
- El sistema debe gestionar roles de administrador y miembro

### RF-07: Sistema de Viajes Compartidos
- El sistema debe permitir crear solicitudes de viaje
- El sistema debe permitir crear ofertas de viaje
- El sistema debe crear coincidencias entre solicitudes y ofertas
- El sistema debe expirar viajes automáticamente después de 30 minutos

### RF-08: Biblioteca Académica
- El sistema debe permitir buscar libros
- El sistema debe mostrar información bibliográfica completa
- El sistema debe permitir filtrar resultados

### RF-09: Portafolio de Proyectos
- El sistema debe permitir agregar proyectos al perfil
- El sistema debe permitir subir imágenes de proyectos
- El sistema debe permitir especificar tecnologías utilizadas
- El sistema debe mostrar proyectos en perfil público

### RF-10: APIs REST
- El sistema debe exponer 6 APIs REST documentadas
- Cada API debe manejar autenticación JWT
- Las APIs deben retornar respuestas en formato JSON
- Las APIs deben implementar manejo de errores estándar

---

## 7. REQUERIMIENTOS NO FUNCIONALES

### RNF-01: Rendimiento
- El tiempo de carga inicial de la aplicación no debe superar los 3 segundos
- Las consultas a APIs deben responder en menos de 2 segundos
- El sistema debe soportar al menos 100 usuarios concurrentes
- Las imágenes deben cargarse con lazy loading

### RNF-02: Seguridad
- Todas las contraseñas deben estar encriptadas
- El sistema debe implementar Row Level Security (RLS) en todas las tablas
- Las APIs deben validar tokens JWT en cada petición
- Los archivos multimedia deben almacenarse en buckets seguros
- Las políticas RLS deben prevenir acceso no autorizado a datos

### RNF-03: Escalabilidad
- La arquitectura debe ser modular y escalable
- El sistema debe usar Edge Functions para procesamiento distribuido
- La base de datos debe optimizarse con índices apropiados
- El sistema debe soportar crecimiento horizontal

### RNF-04: Usabilidad
- La interfaz debe ser intuitiva y fácil de usar
- El diseño debe ser responsive (mobile, tablet, desktop)
- El sistema debe proporcionar retroalimentación visual (toasts, loaders)
- Los mensajes de error deben ser claros y descriptivos

### RNF-05: Mantenibilidad
- El código debe seguir estándares de TypeScript
- El código debe estar modularizado en componentes reutilizables
- El proyecto debe incluir documentación técnica completa
- Las APIs deben estar documentadas con ejemplos de uso

### RNF-06: Disponibilidad
- El sistema debe estar disponible 24/7
- El sistema debe implementar manejo de errores gracioso
- Las funciones críticas deben tener fallbacks

### RNF-07: Compatibilidad
- La aplicación debe funcionar en navegadores modernos (Chrome, Firefox, Safari, Edge)
- El diseño debe ser responsive para dispositivos móviles
- El sistema debe soportar formatos multimedia estándar (JPEG, PNG, MP4, WebM)

### RNF-08: Confiabilidad
- El sistema debe implementar backups automáticos de la base de datos
- Los datos deben mantener integridad referencial
- El sistema debe registrar logs de errores para debugging

---

## 8. ARQUITECTURA DEL SISTEMA

### 8.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Pages   │  │Components│  │  Hooks   │  │ Utils   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS/REST
┌─────────────────────▼───────────────────────────────────┐
│              SUPABASE EDGE FUNCTIONS (APIs REST)         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Stories   │  │  Posts   │  │  Chats   │  │  Rides  │ │
│  │   API    │  │   API    │  │   API    │  │   API   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│  ┌──────────┐  ┌──────────┐                             │
│  │Profiles  │  │  Books   │                             │
│  │   API    │  │   API    │                             │
│  └──────────┘  └──────────┘                             │
└─────────────────────┬───────────────────────────────────┘
                      │ PostgreSQL
┌─────────────────────▼───────────────────────────────────┐
│              SUPABASE BACKEND                            │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │   PostgreSQL DB  │  │  Supabase Auth   │            │
│  │   (17 Tables)    │  │  (JWT Tokens)    │            │
│  └──────────────────┘  └──────────────────┘            │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │     Storage      │  │    Real-time     │            │
│  │ (Media Files)    │  │  (Subscriptions) │            │
│  └──────────────────┘  └──────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Stack Tecnológico

**Frontend:**
- React 18.3.1
- TypeScript 5.x
- Tailwind CSS 3.x
- React Router DOM 6.x
- React Query (TanStack Query)
- Shadcn/ui (componentes)

**Backend:**
- Supabase (BaaS - Backend as a Service)
- PostgreSQL 15
- Deno Runtime (Edge Functions)
- Row Level Security (RLS)

**APIs:**
- Supabase Edge Functions
- REST Architecture
- JSON responses
- JWT Authentication

**DevOps:**
- Git (control de versiones)
- Vite (build tool)
- ESLint (linting)
- GitHub (repositorio)

---

## 9. MODELO DE BASE DE DATOS

### 9.1 Tablas Principales

1. **profiles** - Información de usuarios
2. **posts** - Publicaciones del feed
3. **post_reactions** - Reacciones a publicaciones
4. **post_comments** - Comentarios en publicaciones
5. **stories** - Historias efímeras
6. **friend_requests** - Solicitudes de amistad
7. **friendships** - Relaciones de amistad
8. **private_chats** - Conversaciones privadas
9. **private_messages** - Mensajes privados
10. **groups** - Grupos colaborativos
11. **group_members** - Miembros de grupos
12. **channels** - Canales dentro de grupos
13. **messages** - Mensajes en canales
14. **ride_requests** - Solicitudes de viaje
15. **ride_offers** - Ofertas de viaje
16. **ride_matches** - Coincidencias de viajes
17. **books** - Recursos bibliográficos
18. **projects** - Proyectos de usuarios

### 9.2 Relaciones Clave

- Un usuario (profile) puede tener muchas publicaciones (posts)
- Un usuario puede tener muchos amigos (friendships - relación many-to-many)
- Un grupo (groups) tiene muchos miembros (group_members)
- Un grupo tiene muchos canales (channels)
- Un canal tiene muchos mensajes (messages)
- Un chat privado (private_chats) tiene muchos mensajes (private_messages)

---

## 10. APIS REST DESARROLLADAS

### 10.1 Stories API
**Endpoint:** `/stories-api`

**Métodos:**
- `GET /stories` - Obtener todas las historias
- `POST /stories` - Crear nueva historia
- `DELETE /stories/:id` - Eliminar historia

### 10.2 Posts API
**Endpoint:** `/posts-api`

**Métodos:**
- `GET /posts` - Obtener publicaciones
- `POST /posts` - Crear publicación
- `POST /reactions` - Agregar/quitar reacción
- `POST /comments` - Agregar comentario

### 10.3 Chats API
**Endpoint:** `/chats-api`

**Métodos:**
- `GET /chats` - Obtener lista de chats
- `GET /chats/:id/messages` - Obtener mensajes de un chat
- `POST /chats` - Crear o encontrar chat
- `POST /messages` - Enviar mensaje
- `PATCH /messages/read` - Marcar mensajes como leídos

### 10.4 Rides API
**Endpoint:** `/rides-api`

**Métodos:**
- `GET /requests` - Obtener solicitudes de viaje
- `GET /offers` - Obtener ofertas de viaje
- `POST /matches` - Crear coincidencia

### 10.5 Profiles API
**Endpoint:** `/profiles-api`

**Métodos:**
- `GET /friends/:user_id` - Obtener amigos
- `GET /friends-count/:user_id` - Contar amigos
- `GET /projects-count/:user_id` - Contar proyectos
- `DELETE /projects/:project_id` - Eliminar proyecto

### 10.6 Books API
**Endpoint:** `/books-api`

**Métodos:**
- `GET /books` - Obtener libros (con búsqueda)

**Documentación completa:** Ver archivo `APIS_REST_DOCUMENTACION.md`

---

## 11. SEGURIDAD IMPLEMENTADA

### 11.1 Row Level Security (RLS)

Todas las tablas tienen políticas RLS implementadas:

- **profiles:** Los usuarios solo pueden editar su propio perfil
- **posts:** Los usuarios solo pueden editar/eliminar sus propias publicaciones
- **private_messages:** Solo los participantes del chat pueden ver mensajes
- **group_members:** Solo miembros pueden ver contenido del grupo
- **friendships:** Los usuarios solo ven sus propias amistades

### 11.2 Autenticación

- JWT (JSON Web Tokens) para sesiones
- Tokens enviados en header `Authorization: Bearer <token>`
- Validación en cada petición a las APIs
- Expiración automática de tokens

### 11.3 Validación de Datos

- Validación de inputs en frontend con React Hook Form + Zod
- Validación en backend antes de insertar datos
- Sanitización de datos de usuario

---

## 12. INSTRUCCIONES DE INSTALACIÓN Y USO

### 12.1 Requisitos Previos

- Node.js v18 o superior
- npm o yarn
- Git
- Cuenta de Supabase (ya configurada)

### 12.2 Instalación Local

```bash
# Clonar repositorio
git clone <URL_REPOSITORIO>

# Instalar dependencias
cd <NOMBRE_PROYECTO>
npm install

# Ejecutar en desarrollo
npm run dev
```

### 12.3 Variables de Entorno

Las credenciales de Supabase están configuradas en:
- `src/integrations/supabase/client.ts`

### 12.4 Despliegue

```bash
# Build de producción
npm run build

# El proyecto se despliega automáticamente desde Lovable
```

---

## 13. PRUEBAS Y VALIDACIÓN

### 13.1 Pruebas Funcionales Realizadas

✅ Registro e inicio de sesión de usuarios
✅ Creación y visualización de publicaciones
✅ Sistema de reacciones y comentarios
✅ Envío de mensajes privados
✅ Creación de grupos y canales
✅ Sistema de amistades
✅ Creación de ofertas y solicitudes de viaje
✅ Búsqueda en biblioteca académica
✅ Gestión de proyectos en perfil

### 13.2 Validación de APIs

Todas las APIs fueron probadas con:
- Postman (colección de requests)
- cURL (comandos desde terminal)
- Frontend integrado

Ver documentación en `APIS_REST_DOCUMENTACION.md`

---

## 14. CONCLUSIONES

### 14.1 Logros del Proyecto

1. ✅ Desarrollo completo de una aplicación web full-stack funcional
2. ✅ Implementación de 6 APIs REST siguiendo estándares de la industria
3. ✅ Arquitectura modular y escalable
4. ✅ Sistema de seguridad robusto con RLS y JWT
5. ✅ Base de datos relacional normalizada con 18 tablas
6. ✅ Interfaz de usuario responsive y moderna
7. ✅ Sistema de comunicación en tiempo real
8. ✅ Documentación técnica completa

### 14.2 Competencias Desarrolladas

- Desarrollo Frontend con React y TypeScript
- Desarrollo Backend con APIs REST
- Gestión de bases de datos relacionales
- Implementación de autenticación y seguridad
- Diseño de interfaces responsivas
- Arquitectura de software escalable
- Trabajo con control de versiones (Git)
- Documentación técnica profesional

### 14.3 Posibles Mejoras Futuras

1. Implementar sistema de notificaciones push
2. Agregar videoconferencias en canales de voz
3. Sistema de geolocalización en tiempo real para viajes
4. Aplicación móvil nativa con React Native
5. Sistema de recomendaciones con inteligencia artificial
6. Integración con sistemas académicos institucionales
7. Implementar tests automatizados (unit, integration, e2e)
8. Sistema de analytics y métricas de uso

---

## 15. REFERENCIAS

### 15.1 Documentación Técnica

- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/
- Supabase: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs

### 15.2 Repositorios y Recursos

- Repositorio del proyecto: (URL de GitHub)
- Supabase Dashboard: https://supabase.com/dashboard
- Documentación de APIs: `APIS_REST_DOCUMENTACION.md`
- Guía de desarrollo local: `DESARROLLO_LOCAL.md`

---

## 16. ANEXOS

### Anexo A: Estructura del Proyecto
```
proyecto/
├── src/
│   ├── components/      # Componentes React
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Páginas de la aplicación
│   ├── integrations/   # Integración con Supabase
│   └── lib/            # Utilidades
├── supabase/
│   ├── functions/      # Edge Functions (APIs REST)
│   └── migrations/     # Migraciones de BD
├── public/             # Archivos estáticos
└── docs/              # Documentación
```

### Anexo B: Comandos Útiles
```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run lint         # Linting
git status           # Estado de Git
git add .            # Agregar cambios
git commit -m "msg"  # Commit
git push             # Subir cambios
```

---

**Elaborado por:** [Nombre del estudiante]

**Ficha:** [Número de ficha]

**Centro de Formación:** [Centro SENA]

**Programa de Formación:** [Nombre del programa]

**Instructor:** [Nombre del instructor]

**Fecha:** Enero 2025