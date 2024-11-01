async function registrarCliente() {
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;

    const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, email })
    });

    if (response.ok) {
        alert('Cliente registrado correctamente');
        obtenerClientes(); // Actualizar la lista de clientes
    } else {
        alert('Error al registrar el cliente');
    }
}

async function obtenerClientes() {
    const response = await fetch('/api/clients');
    const clientes = await response.json();
    const lista = document.getElementById('clientes');
    lista.innerHTML = ''; // Limpiar la lista

    clientes.forEach(cliente => {
        const li = document.createElement('li');
        li.textContent = `${cliente.nombre} - ${cliente.email}`;
        lista.appendChild(li);
    });
}

// Cargar clientes al inicio
document.addEventListener('DOMContentLoaded', obtenerClientes);
