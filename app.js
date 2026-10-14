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

// Mostrar las experiencias en el catálogo respetando el diseño original
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
                    <input type="number" id="cantidad-${experiencia.id}" min="1" max="${experiencia.cupo}" value="1">
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

    // Ordenar la lista completa antes de mostrarla
    resultados.sort((a, b) => {
        if (ordenPrecioValor === "mayor") {
            return b.precio - a.precio;
        }
        return a.precio - b.precio;
    });

    mostrarExperiencias(resultados);
}

// Eventos para los botones de categorías originales
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

// Lógica de reservaciones
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

    if (cantidad < 1 || cantidad > experiencia.cupo) {
        alert("Cantidad no válida");
        return;
    }

    const reservaExistente = reservas.find(r => r.experienciaId === id);

    if (reservaExistente) {
        const nuevaCantidad = reservaExistente.cantidad + cantidad;
        if (nuevaCantidad > experiencia.cupo) {
            alert("La cantidad supera el cupo disponible");
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

// Iniciar aplicación cargando los datos con fetch mediante Live Server
cargarExperiencias();