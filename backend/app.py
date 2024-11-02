from flask import Flask, jsonify, request, send_from_directory
from pymongo import MongoClient
import os

app = Flask(__name__)

# Configuración de la base de datos
client = MongoClient("mongodb+srv://dbuser:uI7HMA2doZIxf8P5@g1r0p4rts.6yiod.mongodb.net/?retryWrites=true&w=majority")
db = client['test']
collection = db['users']

@app.route('/api/clients', methods=['GET'])
def get_clients():
    try:
        clients = list(collection.find())
        return jsonify(clients)
    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Devuelve el error como JSON

@app.route('/api/clients', methods=['POST'])
def add_client():
    data = request.json
    collection.insert_one(data)
    return jsonify({"message": "Cliente agregado"}), 201

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
