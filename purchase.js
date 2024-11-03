document.getElementById('purchaseForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evitar el envío del formulario por defecto

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;

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
                document.getElementById('purchaseForm').style.display = 'none';
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
});

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
