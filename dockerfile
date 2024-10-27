# Usa una imagen base de Node.js
FROM node:14

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia los archivos package.json y package-lock.json (si está disponible)
COPY backend/package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia los archivos del proyecto al directorio de trabajo del contenedor
COPY backend/ .

# Expone el puerto en el que se ejecutará la aplicación
EXPOSE 5000

# Define la variable de entorno para el puerto
ENV PORT=5000

# Comando para ejecutar la aplicación
CMD [ "npm", "start" ]