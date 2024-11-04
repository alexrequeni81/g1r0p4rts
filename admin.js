async function fetchUsers() {
    try {
        const response = await fetch('https://g1r0p4rts.onrender.com/api/users');
        const users = await response.json();
        const usersBody = document.getElementById('usersBody');

        // Limitar a los primeros 10 usuarios
        users.slice(0, 10).forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.nombre}</td>
                <td>${user.email}</td>
            `;
            usersBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
    }
}

async function fetchParts() {
    try {
        const response = await fetch('https://g1r0p4rts.onrender.com/api/parts');
        const parts = await response.json();
        const partsBody = document.getElementById('partsBody');

        // Limitar a los primeros 10 repuestos
        parts.slice(0, 10).forEach(part => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${part.referencia}</td>
                <td>${part.descripcion}</td>
                <td>${part.cantidad}</td>
            `;
            partsBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al obtener repuestos:', error);
    }
}

// Llamar a las funciones para obtener datos
fetchUsers();
fetchParts();
