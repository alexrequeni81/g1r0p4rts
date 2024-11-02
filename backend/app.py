from flask import Flask, jsonify, request, send_from_directory
from pymongo import MongoClient
import os

app = Flask(__name__)

# Configuración de la base de datos
client = MongoClient("mongodb+srv://dbuser:uI7HMA2doZIxf8P5@g1r0p4rts.6yiod.mongodb.net/?retryWrites=true&w=majority")
db = client['test']
collection = db['users']

# Verificar conexión a la base de datos
try:
    client.admin.command('ping')  # Verifica la conexión
    print("Conexión a MongoDB exitosa.")
except Exception as e:
    print(f"Error de conexión a MongoDB: {str(e)}")

@app.route('/api/clients', methods=['GET'])
def get_clients():
    try:
        clients = list(collection.find())
        return jsonify(clients)
    except Exception as e:
        print(f"Error al obtener clientes: {str(e)}")  # Imprime el error en los registros
        return jsonify({"error": "No se pudieron obtener los clientes."}), 500

@app.route('/api/clients', methods=['POST'])
def add_client():
    try:
        data = request.json
        collection.insert_one(data)
        return jsonify({"message": "Cliente agregado"}), 201
    except Exception as e:
        print(f"Error al agregar cliente: {str(e)}")  # Imprime el error en los registros
        return jsonify({"error": "No se pudo agregar el cliente."}), 500

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')  # Sirve index.html desde la carpeta backend

@app.route('/styles.css')
def serve_css():
    return send_from_directory('.', 'styles.css')  # Sirve styles.css desde la carpeta backend

@app.route('/script.js')
def serve_js():
    return send_from_directory('.', 'script.js')  # Sirve script.js desde la carpeta backend

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # Usa el puerto asignado por Render
    app.run(host='0.0.0.0', port=port, debug=True)  # Escucha en todas las interfaces
