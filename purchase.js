document.getElementById('purchaseForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evitar el envío del formulario por defecto

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;

    try {
        const response = await fetch(`https://g1r0p4rts.onrender.com/api/users?nombre=${nombre}&email=${email}`);
        if (response.ok) {
            const user = await response.json();
            if (user.length > 0) {
                // Usuario encontrado, mostrar detalles de compra
                document.getElementById('purchaseDetails').style.display = 'block';
                document.getElementById('purchaseForm').style.display = 'none';
                // Aquí puedes agregar más campos para el formulario de compra
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
