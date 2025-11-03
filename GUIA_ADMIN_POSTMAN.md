# Guía para Crear y Usar el Usuario Administrador en Postman

## Paso 1: Crear el Usuario Admin en Supabase

1. **Ve al panel de Supabase:**
   - Accede a: https://supabase.com/dashboard/project/nxlmuoozrtqhdqqpdscr/auth/users

2. **Crea el usuario:**
   - Haz clic en "Add user" → "Create new user"
   - Email: `admin@sena.com` (o el que prefieras)
   - Password: `llavemaestra`
   - ✅ Marca "Auto Confirm User" (para que no requiera confirmación de email)
   - Haz clic en "Create user"

3. **Copia el User ID:**
   - Después de crear el usuario, verás una lista
   - Haz clic en el usuario que acabas de crear
   - Copia el **User ID** (es un UUID como: `123e4567-e89b-12d3-a456-426614174000`)

## Paso 2: Asignar Rol de Admin

1. **Ve al Editor SQL de Supabase:**
   - Accede a: https://supabase.com/dashboard/project/nxlmuoozrtqhdqqpdscr/sql/new

2. **Ejecuta este SQL** (reemplaza `TU_USER_ID_AQUI` con el User ID que copiaste):
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('TU_USER_ID_AQUI', 'admin');
   ```

3. **Haz clic en "Run"**

4. **Verifica que se creó correctamente:**
   ```sql
   SELECT * FROM public.user_roles WHERE role = 'admin';
   ```

## Paso 3: Obtener el Token JWT para Postman

### Opción A: Usando la Interfaz Web (Más Fácil)

1. **Inicia sesión en tu aplicación:**
   - Ve a tu aplicación: http://localhost:3000
   - Inicia sesión con:
     - Email: `admin@sena.com`
     - Password: `llavemaestra`

2. **Abre la Consola del Navegador:**
   - Presiona F12 (o clic derecho → Inspeccionar)
   - Ve a la pestaña "Console"

3. **Ejecuta este código:**
   ```javascript
   (async () => {
     const { data } = await supabase.auth.getSession();
     console.log('Tu Access Token:');
     console.log(data.session.access_token);
     console.log('\nTu Refresh Token:');
     console.log(data.session.refresh_token);
   })();
   ```

4. **Copia el Access Token** que aparece en la consola

### Opción B: Usando Postman Directamente

1. **Crea una nueva petición en Postman**
2. **Configura así:**
   - **Método:** `POST`
   - **URL:** `https://nxlmuoozrtqhdqqpdscr.supabase.co/auth/v1/token?grant_type=password`
   - **Headers:**
     ```
     apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bG11b296cnRxaGRxcXBkc2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NTM3MTIsImV4cCI6MjA2NDAyOTcxMn0.-fm1beUbeN3WpH_FRVoF4J4jbOLsuqGijsf74lcRRkY
     Content-Type: application/json
     ```
   - **Body (raw JSON):**
     ```json
     {
       "email": "admin@sena.com",
       "password": "llavemaestra"
     }
     ```

3. **Haz clic en "Send"**

4. **En la respuesta, copia el `access_token`**
   - Ejemplo de respuesta:
     ```json
     {
       "access_token": "eyJhbGc...",
       "token_type": "bearer",
       "expires_in": 3600,
       "refresh_token": "..."
     }
     ```

## Paso 4: Configurar Postman para Usar el Token

### Opción 1: Crear un Environment (Recomendado)

1. **En Postman, crea un nuevo Environment:**
   - Haz clic en "Environments" (icono de engranaje arriba a la derecha)
   - Clic en "Create Environment"
   - Nombre: `SENA API - Admin`

2. **Agrega estas variables:**
   ```
   Variable: base_url
   Initial Value: https://nxlmuoozrtqhdqqpdscr.supabase.co
   Current Value: https://nxlmuoozrtqhdqqpdscr.supabase.co

   Variable: apikey
   Initial Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bG11b296cnRxaGRxcXBkc2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NTM3MTIsImV4cCI6MjA2NDAyOTcxMn0.-fm1beUbeN3WpH_FRVoF4J4jbOLsuqGijsf74lcRRkY
   Current Value: [igual]

   Variable: access_token
   Initial Value: [PEGA_TU_TOKEN_AQUI]
   Current Value: [PEGA_TU_TOKEN_AQUI]
   ```

3. **Guarda el environment** y selecciónalo

### Opción 2: Headers Directos (Más Simple)

En cada petición, agrega estos headers:
```
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bG11b296cnRxaGRxcXBkc2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NTM3MTIsImV4cCI6MjA2NDAyOTcxMn0.-fm1beUbeN3WpH_FRVoF4J4jbOLsuqGijsf74lcRRkY
Authorization: Bearer [TU_ACCESS_TOKEN_AQUI]
Content-Type: application/json
```

## Paso 5: Ejemplos de Peticiones en Postman

### 📋 Ver Todos los Posts

```
Método: GET
URL: https://nxlmuoozrtqhdqqpdscr.supabase.co/rest/v1/posts?select=*
Headers:
  apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bG11b296cnRxaGRxcXBkc2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NTM3MTIsImV4cCI6MjA2NDAyOTcxMn0.-fm1beUbeN3WpH_FRVoF4J4jbOLsuqGijsf74lcRRkY
  Authorization: Bearer [TU_TOKEN]
```

### 🗑️ Eliminar un Post (Como Admin)

```
Método: DELETE
URL: https://nxlmuoozrtqhdqqpdscr.supabase.co/rest/v1/posts?id=eq.[POST_ID]
Headers:
  apikey: [TU_APIKEY]
  Authorization: Bearer [TU_TOKEN]
```

### 👥 Ver Todos los Usuarios

```
Método: GET
URL: https://nxlmuoozrtqhdqqpdscr.supabase.co/rest/v1/profiles?select=*
Headers:
  apikey: [TU_APIKEY]
  Authorization: Bearer [TU_TOKEN]
```

### 🚫 Eliminar un Usuario (Eliminar perfil)

```
Método: DELETE
URL: https://nxlmuoozrtqhdqqpdscr.supabase.co/rest/v1/profiles?id=eq.[USER_ID]
Headers:
  apikey: [TU_APIKEY]
  Authorization: Bearer [TU_TOKEN]
```

### 👥 Ver Todos los Grupos

```
Método: GET
URL: https://nxlmuoozrtqhdqqpdscr.supabase.co/rest/v1/groups?select=*
Headers:
  apikey: [TU_APIKEY]
  Authorization: Bearer [TU_TOKEN]
```

### 🗑️ Eliminar un Grupo

```
Método: DELETE
URL: https://nxlmuoozrtqhdqqpdscr.supabase.co/rest/v1/groups?id=eq.[GROUP_ID]
Headers:
  apikey: [TU_APIKEY]
  Authorization: Bearer [TU_TOKEN]
```

### ✏️ Actualizar Cualquier Post

```
Método: PATCH
URL: https://nxlmuoozrtqhdqqpdscr.supabase.co/rest/v1/posts?id=eq.[POST_ID]
Headers:
  apikey: [TU_APIKEY]
  Authorization: Bearer [TU_TOKEN]
  Content-Type: application/json
Body (raw JSON):
{
  "content": "Contenido actualizado por admin"
}
```

### 📊 Ver Estadísticas de Usuarios (Roles)

```
Método: GET
URL: https://nxlmuoozrtqhdqqpdscr.supabase.co/rest/v1/user_roles?select=*,profiles(full_name,email)
Headers:
  apikey: [TU_APIKEY]
  Authorization: Bearer [TU_TOKEN]
```

## 🔄 Renovar el Token (Cuando Expire)

El token expira después de 1 hora. Para renovarlo:

```
Método: POST
URL: https://nxlmuoozrtqhdqqpdscr.supabase.co/auth/v1/token?grant_type=refresh_token
Headers:
  apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bG11b296cnRxaGRxcXBkc2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NTM3MTIsImV4cCI6MjA2NDAyOTcxMn0.-fm1beUbeN3WpH_FRVoF4J4jbOLsuqGijsf74lcRRkY
  Content-Type: application/json
Body (raw JSON):
{
  "refresh_token": "[TU_REFRESH_TOKEN]"
}
```

## ⚠️ Troubleshooting

### Error: "JWT expired"
- Tu token expiró (dura 1 hora)
- Solución: Renueva el token con el refresh_token

### Error: "Invalid API key"
- Verifica que estás usando el apikey correcto
- Debe ser: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bG11b296cnRxaGRxcXBkc2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NTM3MTIsImV4cCI6MjA2NDAyOTcxMn0.-fm1beUbeN3WpH_FRVoF4J4jbOLsuqGijsf74lcRRkY`

### Error: "new row violates row-level security policy"
- Verifica que el usuario tenga el rol 'admin' en la tabla user_roles
- Ejecuta: `SELECT * FROM user_roles WHERE user_id = 'TU_USER_ID';`

### No puedo ver datos de otros usuarios
- Asegúrate de que el token sea del usuario admin
- Verifica que las políticas RLS estén activas

## 📝 Colección de Postman Lista

Puedes importar esta colección JSON en Postman:

```json
{
  "info": {
    "name": "SENA API - Admin Collection",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth - Login Admin",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "apikey",
            "value": "{{apikey}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"admin@sena.com\",\n  \"password\": \"llavemaestra\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/auth/v1/token?grant_type=password",
          "host": ["{{base_url}}"],
          "path": ["auth", "v1", "token"],
          "query": [
            {
              "key": "grant_type",
              "value": "password"
            }
          ]
        }
      }
    },
    {
      "name": "Posts - Get All",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "apikey",
            "value": "{{apikey}}"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{access_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/rest/v1/posts?select=*",
          "host": ["{{base_url}}"],
          "path": ["rest", "v1", "posts"],
          "query": [
            {
              "key": "select",
              "value": "*"
            }
          ]
        }
      }
    },
    {
      "name": "Posts - Delete",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "apikey",
            "value": "{{apikey}}"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{access_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/rest/v1/posts?id=eq.POST_ID_HERE",
          "host": ["{{base_url}}"],
          "path": ["rest", "v1", "posts"],
          "query": [
            {
              "key": "id",
              "value": "eq.POST_ID_HERE"
            }
          ]
        }
      }
    },
    {
      "name": "Groups - Get All",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "apikey",
            "value": "{{apikey}}"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{access_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/rest/v1/groups?select=*",
          "host": ["{{base_url}}"],
          "path": ["rest", "v1", "groups"],
          "query": [
            {
              "key": "select",
              "value": "*"
            }
          ]
        }
      }
    },
    {
      "name": "Groups - Delete",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "apikey",
            "value": "{{apikey}}"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{access_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/rest/v1/groups?id=eq.GROUP_ID_HERE",
          "host": ["{{base_url}}"],
          "path": ["rest", "v1", "groups"],
          "query": [
            {
              "key": "id",
              "value": "eq.GROUP_ID_HERE"
            }
          ]
        }
      }
    },
    {
      "name": "Profiles - Get All",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "apikey",
            "value": "{{apikey}}"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{access_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/rest/v1/profiles?select=*",
          "host": ["{{base_url}}"],
          "path": ["rest", "v1", "profiles"],
          "query": [
            {
              "key": "select",
              "value": "*"
            }
          ]
        }
      }
    }
  ]
}
```

## 🎯 Resumen Rápido

1. **Crea el usuario admin** en el panel de Supabase
2. **Asigna el rol admin** usando SQL
3. **Obtén el token JWT** haciendo login
4. **Usa el token** en el header `Authorization: Bearer [TOKEN]`
5. **¡Listo!** Ahora puedes hacer cualquier operación como admin

## 📞 Contacto y Soporte

Si tienes problemas:
1. Verifica que el usuario admin existe en Supabase
2. Verifica que el rol 'admin' está asignado en user_roles
3. Verifica que el token no haya expirado
4. Revisa los logs en Supabase para ver errores específicos

---

**Nota Importante:** El token JWT expira cada hora. Guarda el `refresh_token` para poder renovar el `access_token` sin necesidad de hacer login nuevamente.
