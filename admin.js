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
                <td>${user.direcciones.map(d => `${d.tipo_via} ${d.nombre_via} ${d.numero}, ${d.poblacion}, ${d.provincia} - ${d.cp}`).join('<br>')}</td>
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
                <td>${part.REFERENCIA}</td>
                <td>${part.DESCRIPCIÓN}</td>
                <td>${part.CANTIDAD}</td>
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
