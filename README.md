# Bun Auth CRUD API

Este proyecto es una API RESTful básica construida con Bun, Express, TypeScript, Prisma y SQLite. Permite realizar operaciones CRUD sobre usuarios.

## ¿Cómo funciona este CRUD?

La API expone los siguientes endpoints para la entidad `User`:

- **GET /users**  
  Lista todos los usuarios.

- **GET /users/:id**  
  Obtiene un usuario por su ID.

- **POST /users**  
  Crea un nuevo usuario.  
  **Body JSON:**

  ```json
  {
    "name": "Nombre",
    "email": "correo@email.com"
  }
  ```

- **PUT /users/:id**  
  Actualiza un usuario existente.  
  **Body JSON:**

  ```json
  {
    "name": "Nuevo Nombre",
    "email": "nuevo@email.com"
  }
  ```

- **DELETE /users/:id**  
  Elimina un usuario por su ID.

## ¿Cómo levantar este API?

1. **Instala las dependencias**

   ```sh
   bun install
   ```

2. **Configura Prisma y la base de datos**

   - Si no existe, crea el archivo `prisma/schema.prisma` con el siguiente contenido:

     ```prisma
     datasource db {
       provider = "sqlite"
       url      = "file:./dev.db"
     }

     generator client {
       provider = "prisma-client-js"
       output   = "../generated/prisma"
     }

     model User {
       id    Int    @id @default(autoincrement())
       name  String
       email String @unique
     }
     ```

   - Ejecuta las migraciones y genera el cliente Prisma:
     ```sh
     npx prisma migrate dev --name init
     npx prisma generate
     ```

3. **Inicia el servidor**

   ```sh
   bun run index.ts
   ```

   El servidor estará disponible en [http://localhost:3000](http://localhost:3000).

4. **(Opcional) Visualiza la base de datos con Prisma Studio**
   ```sh
   npx prisma studio
   ```

## Probar la API

Puedes usar Thunder Client, Postman o curl para probar los endpoints descritos arriba.

---

¿Dudas o problemas? ¡Abre un issue!
