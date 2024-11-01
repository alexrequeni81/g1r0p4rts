from flask import Flask, jsonify, request
from pymongo import MongoClient

app = Flask(__name__)

# Configuración de la base de datos
client = MongoClient("mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/test?retryWrites=true&w=majority")
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

if __name__ == '__main__':
    app.run(debug=True)