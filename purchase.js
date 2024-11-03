// Almacenar el nombre y el email en el almacenamiento local
const nombre = localStorage.getItem('nombre');
const email = localStorage.getItem('email');

if (!nombre || !email) {
    // Redirigir a la página de control de acceso si no hay datos
    window.location.href = 'index.html';
} else {
    // Si hay datos, mostrar los detalles del cliente
    mostrarDetallesCliente(nombre, email);
}

async function mostrarDetallesCliente(nombre, email) {
    try {
        const response = await fetch(`https://g1r0p4rts.onrender.com/api/users?nombre=${nombre}&email=${email}`);
        if (response.ok) {
            const user = await response.json();
            if (user.length > 0) {
                // Usuario encontrado, mostrar detalles del cliente
                const cliente = user[0];
                document.getElementById('clienteNombre').innerText = `Nombre: ${cliente.nombre}`;
                const direccionesDiv = document.getElementById('direccionesCliente');
                direccionesDiv.innerHTML = ''; // Limpiar direcciones anteriores
                cliente.direcciones.forEach(direccion => {
                    const direccionElement = document.createElement('div');
                    direccionElement.innerText = `${direccion.tipo_via} ${direccion.nombre_via} ${direccion.numero}, ${direccion.poblacion}, ${direccion.provincia} - ${direccion.cp}`;
                    direccionesDiv.appendChild(direccionElement);
                });
                document.getElementById('userDetails').style.display = 'block';
                document.getElementById('purchaseDetails').style.display = 'block';
            } else {
                alert('Usuario no encontrado. Por favor, verifica los datos.');
            }
        } else {
            alert('Error al verificar el usuario.');
        }
    } catch (error) {
        console.error('Error al enviar los datos:', error);
    }
}

// Función para añadir una fila a la tabla de compra
document.getElementById('addRow').addEventListener('click', () => {
    const compraBody = document.getElementById('compraBody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Referencia" required></td>
        <td><input type="text" placeholder="Descripción" required></td>
        <td><input type="number" placeholder="Cantidad" required></td>
        <td><button class="removeRow">Eliminar</button></td>
    `;
    compraBody.appendChild(newRow);

    // Añadir evento para eliminar la fila
    newRow.querySelector('.removeRow').addEventListener('click', () => {
        compraBody.removeChild(newRow);
    });
});

// Aquí puedes agregar más funciones para manejar el envío de la solicitud de pedido y el resumen del pedido
