import os

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/test?retryWrites=true&w=majority")