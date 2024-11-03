document.getElementById('userForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evitar el envío del formulario por defecto

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const direcciones = Array.from(document.querySelectorAll('.direccion')).map(direccion => ({
        tipo_via: direccion.querySelector('.tipo_via').value,
        nombre_via: direccion.querySelector('.nombre_via').value,
        numero: direccion.querySelector('.numero').value,
        telefono: direccion.querySelector('.telefono').value,
        cp: direccion.querySelector('.cp').value,
        poblacion: direccion.querySelector('.poblacion').value,
        provincia: direccion.querySelector('.provincia').value,
    }));

    const userData = { nombre, email, direcciones };

    try {
        const response = await fetch('https://g1r0p4rts.onrender.com/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (response.ok) {
            alert('Usuario agregado exitosamente');
            window.location.href = '/'; // Redirigir a la página principal
        } else {
            alert('Error al agregar el usuario');
        }
    } catch (error) {
        console.error('Error al enviar los datos:', error);
    }
});

function addDireccion() {
    const direccionesDiv = document.getElementById('direcciones');
    const nuevaDireccion = document.createElement('div');
    nuevaDireccion.classList.add('direccion');
    nuevaDireccion.innerHTML = `
        <label for="tipo_via">Tipo de Vía:</label>
        <input type="text" class="tipo_via" required>
        
        <label for="nombre_via">Nombre de Vía:</label>
        <input type="text" class="nombre_via" required>
        
        <label for="numero">Número:</label>
        <input type="text" class="numero" required>
        
        <label for="telefono">Teléfono:</label>
        <input type="text" class="telefono" required>
        
        <label for="cp">Código Postal:</label>
        <input type="text" class="cp" required>
        
        <label for="poblacion">Población:</label>
        <input type="text" class="poblacion" required>
        
        <label for="provincia">Provincia:</label>
        <input type="text" class="provincia" required>
    `;
    direccionesDiv.appendChild(nuevaDireccion);
}
