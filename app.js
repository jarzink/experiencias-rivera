let experiencias = [];
let reservas = [];
let categoriaActual = "todas";
let ordenPrecioValor = "mayor"; 

const catalogo = document.querySelector("#catalogo");
const contador = document.querySelector("#contador");
const botones = document.querySelectorAll("[data-categoria]");
const buscador = document.querySelector("#buscador");
const ordenar = document.querySelector("#ordenar");
const listaReservas = document.querySelector("#listaReservas");
const total = document.querySelector("#total");

async function cargarExperiencias() {
    try {
        contador.textContent = "Cargando experiencias...";
        const respuesta = await fetch("./data/experiencias.json");
        if (!respuesta.ok) {
            throw new Error("No fue posible cargar las experiencias");
        }
        experiencias = await respuesta.json();
        actualizarCatalogo();
    } catch (error) {
        contador.textContent = "Error al cargar la información";
        console.error(error);
    }
}

function mostrarExperiencias(lista) {
    if (lista.length === 0) {
        catalogo.innerHTML = `
            <p class="sin-resultados">
                No se encontraron experiencias.
                Intenta con otra búsqueda.
            </p>
        `;
        contador.textContent = "0 experiencias encontradas";
        return;
    }

    catalogo.innerHTML = lista.map(experiencia => `
        <article class="tarjeta">
            <div class="imagen">${experiencia.icono}</div>

            <div class="informacion">
                <span class="etiqueta">
                    ${experiencia.categoria}
                </span>

                <h3>${experiencia.nombre}</h3>

                <p class="cupo-texto">Cupo disponible: ${experiencia.cupo}</p>

                <p class="precio">
                    $${experiencia.precio} MXN
                </p>

                <label>Personas:
                    <input type="number" id="cantidad-${experiencia.id}" min="1" max="15" value="1">
                </label>

                <button class="btn-reservar" data-id="${experiencia.id}">
                    Agregar a reservación
                </button>
            </div>
        </article>
    `).join("");

    contador.textContent = `${lista.length} experiencia${lista.length !== 1 ? "s" : ""}`;
    agregarEventosReservar();
}

function actualizarCatalogo() {
    const texto = buscador.value.trim().toLowerCase();

    let resultados = experiencias.filter(experiencia => {
        const coincideCategoria =
            categoriaActual === "todas" ||
            experiencia.categoria === categoriaActual;

        const coincideTexto =
            experiencia.nombre.toLowerCase().includes(texto);

        return coincideCategoria && coincideTexto;
    });

    resultados.sort((a, b) => {
        if (ordenPrecioValor === "mayor") {
            return b.precio - a.precio;
        }
        return a.precio - b.precio;
    });

    mostrarExperiencias(resultados);
}

botones.forEach(boton => {
    boton.addEventListener("click", () => {
        botones.forEach(elemento => {
            elemento.classList.remove("activo");
        });

        boton.classList.add("activo");
        categoriaActual = boton.dataset.categoria;

        actualizarCatalogo();
    });
});

buscador.addEventListener("input", actualizarCatalogo);

ordenar.addEventListener("click", () => {
    ordenPrecioValor = ordenPrecioValor === "mayor" ? "menor" : "mayor";

    ordenar.textContent =
        ordenPrecioValor === "mayor"
            ? "Precio: mayor a menor ↓"
            : "Precio: menor a mayor ↑";

    actualizarCatalogo();
});

function agregarEventosReservar() {
    document.querySelectorAll(".btn-reservar").forEach(boton => {
        boton.addEventListener("click", () => {
            const id = Number(boton.dataset.id);
            agregarReserva(id);
        });
    });
}

function agregarReserva(id) {
    const experiencia = experiencias.find(e => e.id === id);
    const entradaCantidad = document.querySelector(`#cantidad-${id}`);
    const cantidad = Number(entradaCantidad.value);

    if (cantidad > 15) {
        alert("El límite máximo es de 15 personas por reserva.");
        return;
    }

    if (cantidad < 1 || cantidad > experiencia.cupo) {
        alert("Cantidad no válida o supera el cupo disponible.");
        return;
    }

    const reservaExistente = reservas.find(r => r.experienciaId === id);

    if (reservaExistente) {
        const nuevaCantidad = reservaExistente.cantidad + cantidad;
        if (nuevaCantidad > 15) {
            alert("No puedes superar el límite de 15 personas acumuladas en esta experiencia.");
            return;
        }
        if (nuevaCantidad > experiencia.cupo) {
            alert("La cantidad total supera el cupo disponible.");
            return;
        }
        reservaExistente.cantidad = nuevaCantidad;
        reservaExistente.subtotal = nuevaCantidad * experiencia.precio;
    } else {
        reservas.push({
            experienciaId: experiencia.id,
            nombre: experiencia.nombre,
            precio: experiencia.precio,
            cantidad: cantidad,
            subtotal: experiencia.precio * cantidad
        });
    }

    mostrarReservas();
}

function mostrarReservas() {
    if (reservas.length === 0) {
        listaReservas.innerHTML = "<p>No hay experiencias seleccionadas.</p>";
        total.textContent = "$0 MXN";
        return;
    }

    listaReservas.innerHTML = reservas.map(r => `
        <article class="item-reserva">
            <div>
                <strong>${r.nombre}</strong>
                <p>${r.cantidad} persona(s) x $${r.precio}</p>
            </div>
            <div>
                <strong>$${r.subtotal} MXN</strong>
                <button class="btn-eliminar" data-id="${r.experienciaId}">Eliminar</button>
            </div>
        </article>
    `).join("");

    const totalReserva = reservas.reduce((suma, r) => suma + r.subtotal, 0);
    total.textContent = `$${totalReserva} MXN`;

    listaReservas.innerHTML += `
        <div style="margin-top: 20px; border-top: 1px solid #e0ede9; padding-top: 15px; display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
            <button class="btn-vaciar" onclick="vaciarReservas()" style="background: var(--peligro, #b3261e); color: white; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 0.9rem; font-weight: bold;">
                Vaciar reservas
            </button>
            <button onclick="confirmarReservaFinal()" style="background: #00695c; color: white; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer; font-size: 0.95rem; font-weight: bold;">
                Reservar
            </button>
        </div>
    `;

    agregarEventosEliminar();
}

function agregarEventosEliminar() {
    document.querySelectorAll(".btn-eliminar").forEach(boton => {
        boton.addEventListener("click", () => {
            const id = Number(boton.dataset.id);
            eliminarReserva(id);
        });
    });
}

function eliminarReserva(id) {
    reservas = reservas.filter(r => r.experienciaId !== id);
    mostrarReservas();
}

function vaciarReservas() {
    const confirmar = confirm("¿Estás seguro de que deseas eliminar todas tus reservas?");
    if (confirmar) {
        reservas = [];
        mostrarReservas();
    }
}

function confirmarReservaFinal() {
    if (reservas.length === 0) {
        alert("No tienes ninguna reserva pendiente.");
        return;
    }
    alert("¡Reservación realizada con éxito! Disfruta tu experiencia en la Riviera Maya.");
    reservas = [];
    mostrarReservas();
}

cargarExperiencias();
