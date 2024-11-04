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
                <td>${user.direcciones ? user.direcciones.map(d => `${d.tipo_via} ${d.nombre_via} ${d.numero}, ${d.poblacion}, ${d.provincia} - ${d.cp}`).join('<br>') : 'Sin direcciones'}</td>
                <td>
                    <button class="editUser" data-id="${user._id}">Editar</button>
                    <button class="deleteUser" data-id="${user._id}">Eliminar</button>
                </td>
            `;
            usersBody.appendChild(row);
        });

        // Añadir eventos a los botones de editar y eliminar
        document.querySelectorAll('.editUser').forEach(button => {
            button.addEventListener('click', () => editUser(button.dataset.id));
        });

        document.querySelectorAll('.deleteUser').forEach(button => {
            button.addEventListener('click', () => deleteUser(button.dataset.id));
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
    }
}

async function deleteUser(userId) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        try {
            const response = await fetch(`https://g1r0p4rts.onrender.com/api/users/${userId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                alert('Usuario eliminado exitosamente');
                fetchUsers(); // Refrescar la lista de usuarios
            } else {
                alert('Error al eliminar el usuario');
            }
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
        }
    }
}

async function editUser(userId) {
    // Aquí puedes implementar la lógica para editar un usuario
    // Por ejemplo, abrir un formulario con los datos del usuario
    alert(`Editar usuario con ID: ${userId}`);
}

function exportUsers() {
    const usersTable = document.getElementById('usersTable');
    const wb = XLSX.utils.table_to_book(usersTable, { sheet: "Usuarios" });
    XLSX.writeFile(wb, 'usuarios.xlsx');
}

async function importUsers() {
    const fileInput = document.getElementById('fileInput');
    fileInput.click();

    fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        const data = new Uint8Array(await file.arrayBuffer());
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const users = XLSX.utils.sheet_to_json(firstSheet);

        // Aquí puedes enviar los usuarios a tu API para guardarlos en la base de datos
        for (const user of users) {
            await fetch('https://g1r0p4rts.onrender.com/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });
        }
        alert('Usuarios importados exitosamente');
        fetchUsers(); // Refrescar la lista de usuarios
    };
}

document.getElementById('exportUsers').addEventListener('click', exportUsers);
document.getElementById('importUsers').addEventListener('click', importUsers);

fetchUsers();
