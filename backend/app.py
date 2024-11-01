from flask import Flask, jsonify, request
from pymongo import MongoClient
import os

app = Flask(__name__)

# Configuración de la base de datos
client = MongoClient("mongodb+srv://dbuser:uI7HMA2doZIxf8P5@g1r0p4rts.6yiod.mongodb.net/?retryWrites=true&w=majority")
db = client['test']
collection = db['users']

@app.route('/api/clients', methods=['GET'])
def get_clients():
    clients = list(collection.find())
    return jsonify(clients)

@app.route('/api/clients', methods=['POST'])
def add_client():
    data = request.json
    collection.insert_one(data)
    return jsonify({"message": "Cliente agregado"}), 201

@app.route('/')
def index():
    return app.send_static_file('index.html')  # Asegúrate de que index.html esté en la carpeta static

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # Usa el puerto asignado por Render
    app.run(host='0.0.0.0', port=port, debug=True)  # Escucha en todas las interfaces
