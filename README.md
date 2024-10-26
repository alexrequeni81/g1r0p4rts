# Mi Aplicación Web

Esta es una aplicación web simple que utiliza React en el frontend, Node.js y Express en el backend, y MongoDB como base de datos. La autenticación se maneja con Auth0.

## Estructura del Proyecto

- `frontend/`: Contiene la aplicación React
- `backend/`: Contiene el servidor Express y la conexión a MongoDB

## Configuración

1. Frontend:
   - Navega a la carpeta `frontend/`
   - Ejecuta `npm install` para instalar las dependencias
   - Crea un archivo `.env` en la raíz de `frontend/` y añade tus credenciales de Auth0:
     ```
     REACT_APP_AUTH0_DOMAIN=tu-dominio-auth0.auth0.com
     REACT_APP_AUTH0_CLIENT_ID=tu-client-id-auth0
     ```

2. Backend:
   - Navega a la carpeta `backend/`
   - Ejecuta `npm install` para instalar las dependencias
   - Asegúrate de que el archivo `.env` en la raíz de `backend/` contenga tu URI de MongoDB

## Ejecución

1. Frontend:
   - En la carpeta `frontend/`, ejecuta `npm start`
   - La aplicación estará disponible en `http://localhost:3000`

2. Backend:
   - En la carpeta `backend/`, ejecuta `npm start`
   - El servidor estará disponible en `http://localhost:5000`

## Despliegue

- Frontend: Despliega la carpeta `frontend/build/` en GitHub Pages
- Backend: Despliega la carpeta `backend/` en Render