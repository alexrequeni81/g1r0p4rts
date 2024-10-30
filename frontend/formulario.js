let clienteActual = null;

async function verificarCliente() {
    const email = document.getElementById('emailCliente').value;
    try {
        const response = await fetch('/api/clientes/verificar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo: email })
        });
        
        const data = await response.json();
        
        if (data.exists) {
            clienteActual = data.cliente;
            mostrarFormularioPedido();
        } else {
            document.getElementById('datosClienteForm').style.display = 'block';
            document.getElementById('nombreCliente').focus();
        }
    } catch (error) {
        mostrarError('Error al verificar el cliente');
    }
}

async function guardarDatosCliente() {
    const nombre = document.getElementById('nombreCliente').value;
    const direccion = document.getElementById('direccionCliente').value;
    const email = document.getElementById('emailCliente').value;

    try {
        const response = await fetch('/api/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre,
                correo: email,
                direcciones: [direccion]
            })
        });

        const data = await response.json();
        clienteActual = data;
        mostrarFormularioPedido();
    } catch (error) {
        mostrarError('Error al guardar los datos del cliente');
    }
}

async function buscarReferencia(button) {
    const itemDiv = button.parentElement;
    const referenciaInput = itemDiv.querySelector('.referencia-input');
    const descripcionInput = itemDiv.querySelector('.descripcion-input');

    try {
        const response = await fetch(`/api/parts/referencia/${referenciaInput.value}`);
        const data = await response.json();

        if (data.part) {
            descripcionInput.value = data.part.DESCRIPCIÓN;
        } else {
            mostrarError('Referencia no encontrada');
        }
    } catch (error) {
        mostrarError('Error al buscar la referencia');
    }
}

function agregarItem() {
    const itemsContainer = document.getElementById('itemsPedido');
    const nuevoItem = document.createElement('div');
    nuevoItem.className = 'item-pedido';
    nuevoItem.innerHTML = `
        <input type="text" placeholder="Referencia" class="referencia-input">
        <input type="text" placeholder="Descripción" class="descripcion-input" readonly>
        <input type="number" placeholder="Cantidad" class="cantidad-input">
        <button type="button" onclick="buscarReferencia(this)">Buscar</button>
    `;
    itemsContainer.appendChild(nuevoItem);
}

async function enviarPedido() {
    const items = [];
    const itemsDivs = document.querySelectorAll('.item-pedido');

    itemsDivs.forEach(div => {
        const referencia = div.querySelector('.referencia-input').value;
        const descripcion = div.querySelector('.descripcion-input').value;
        const cantidad = div.querySelector('.cantidad-input').value;

        if (referencia && cantidad) {
            items.push({ referencia, descripcion, cantidad: Number(cantidad) });
        }
    });

    if (items.length === 0) {
        mostrarError('Debe agregar al menos un ítem al pedido');
        return;
    }

    try {
        // Verificar stock disponible antes de enviar
        for (const item of items) {
            const response = await fetch(`/api/parts/referencia/${item.referencia}`);
            const data = await response.json();
            if (!data.part || data.part.CANTIDAD < item.cantidad) {
                mostrarError(`Stock insuficiente para ${item.referencia}`);
                return;
            }
        }
        
        const response = await fetch('/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cliente: clienteActual._id,
                direccionEntrega: document.getElementById('direccionCliente').value,
                items
            })
        });

        if (response.ok) {
            mostrarExito('Pedido enviado correctamente');
            setTimeout(() => window.location.reload(), 2000);
        } else {
            mostrarError('Error al enviar el pedido');
        }
    } catch (error) {
        mostrarError('Error al procesar el pedido');
    }
}

function mostrarFormularioPedido() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('datosClienteForm').style.display = 'none';
    document.getElementById('pedidoForm').style.display = 'block';
}

function mostrarError(mensaje) {
    const errorDiv = document.getElementById('mensajeError');
    errorDiv.textContent = mensaje;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 3000);
}

function mostrarExito(mensaje) {
    const exitoDiv = document.getElementById('mensajeExito');
    exitoDiv.textContent = mensaje;
    exitoDiv.style.display = 'block';
    setTimeout(() => exitoDiv.style.display = 'none', 3000);
}