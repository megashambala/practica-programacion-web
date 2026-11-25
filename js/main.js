comprobarSesion();
document.getElementById("nombreUsuario").innerHTML = localStorage.getItem("usuario") || "Usuario";
let todos = []; 

function cargarCoches() {
    let token = localStorage.getItem("token");

    fetch(`${API}/cars`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(response => {
            if (response.status === 401) {
                cerrarSesion();   // token inválido o caducado
                throw new Error("Sesión caducada");
            }
            if (!response.ok) throw new Error("No se pudieron cargar los coches");
            return response.json();
        })
        .then(coches => {
            console.log(coches);  
            todos = coches;
            aplicarFiltros();
        })
        .catch(error => {
            document.getElementById("cuerpoCoches").innerHTML =
                `<tr><td colspan="8">${error.message}</td></tr>`;
        });
}
function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
}
function dibujar(lista) {
    let cuerpo = document.getElementById("cuerpoCoches");
    cuerpo.innerHTML = "";
    let usuario = localStorage.getItem("usuario");
    let carrito = obtenerCarrito();
    if (lista.length === 0) {
        cuerpo.innerHTML = `<tr><td colspan="8" class="text-center">No hay coches con esos criterios</td></tr>`;
        return;
    }
    lista.forEach(c => {
        let comprado = c.state=== "Comprado";
        let estado = comprado
        ? `<span class="badge bg-secondary">Comprado</span>`
        : `<span class="badge bg-warning text-dark">Disponible</span>`;
        let boton;
        if (comprado) {
            boton = "-";
        } else if (c.idUser === usuario) {
            boton = `<span class="text-secondary">Tu coche</span>`;
        } else if (carrito.some(item => item._id === c._id)) {
            boton = `<button class="btn btn-secondary btn-sm" disabled>En el carrito</button>`;
        } else {
            boton = `<button class="btn btn-oro btn-sm" onclick="anadirAlCarrito('${c._id}')">Añadir al carrito</button>`;
        }

        cuerpo.innerHTML += `
            <tr>
                <td>${c.name}</td>
                <td>${c.description}</td>
                <td>${c.km}</td>
                <td>${c.price} €</td>
                <td>${c.category}</td>
                <td><img src="${c.image}" class="img-thumbnail foto-coche" alt="${c.name}"></td>
                <td>${estado}</td>
                <td>${boton}</td>
            </tr>`;
    });
}
function anadirAlCarrito(id) {
    let coche = todos.find(c => c._id === id);
    let carrito = obtenerCarrito();

    carrito.push(coche);
    localStorage.setItem("carrito", JSON.stringify(carrito));

    aplicarFiltros();
}
function aplicarFiltros() {
    let texto = document.getElementById("buscador").value.toLowerCase();
    let categoria = document.getElementById("filtroCategoria").value.toLowerCase();
    let orden = document.getElementById("orden").value;

    let resultado = todos.filter(c => (c.name || "").toLowerCase().includes(texto));

    if (categoria !== "") {
        resultado = resultado.filter(c => (c.category || "").toLowerCase() === categoria);
    }

    if (orden === "asc") {
        resultado.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (orden === "desc") {
        resultado.sort((a, b) => Number(b.price) - Number(a.price));
    }

    dibujar(resultado);
}
function cargarMisCoches() {
    let token = localStorage.getItem("token");
    let usuario = localStorage.getItem("usuario");

    fetch(`${API}/cars`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(response => {
            if (response.status === 401) {
                cerrarSesion();
                throw new Error("Sesión caducada");
            }
            if (!response.ok) throw new Error("No se pudieron cargar tus coches");
            return response.json();
        })
        .then(coches => {
            let mios = coches.filter(c => c.idUser === usuario);
            dibujarMisCoches(mios);
        })
        .catch(error => {
            document.getElementById("cuerpoMisCoches").innerHTML =
                `<tr><td colspan="8">${error.message}</td></tr>`;
        });
}

function dibujarMisCoches(lista) {
    let cuerpo = document.getElementById("cuerpoMisCoches");
    cuerpo.innerHTML = "";

    if (lista.length === 0) {
        cuerpo.innerHTML = `<tr><td colspan="8" class="text-center">Todavía no has publicado ningún coche</td></tr>`;
        return;
    }

    lista.forEach(c => {
        let estado = c.state === "Comprado"
            ? `<span class="badge bg-secondary">Comprado</span>`
            : `<span class="badge bg-warning text-dark">En venta</span>`;

        cuerpo.innerHTML += `
            <tr>
                <td>${c.name}</td>
                <td>${c.description}</td>
                <td>${c.km}</td>
                <td>${c.price} €</td>
                <td>${c.category}</td>
                <td><img src="${c.image}" class="img-thumbnail foto-coche" alt="${c.name}"></td>
                <td>${estado}</td>
                <td>
                    <a href="editar.html?id=${c._id}" class="btn btn-warning btn-sm">Editar</a>
                    <button class="btn btn-danger btn-sm" onclick="eliminarCoche('${c._id}')">Eliminar</button>
                </td>
            </tr>`;
    });
}

function eliminarCoche(id) {
    if (!confirm("¿Seguro que quieres eliminar este coche?")) return;

    let token = localStorage.getItem("token");

    fetch(`${API}/cars/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(response => {
            if (!response.ok) throw new Error("No se pudo eliminar el coche");
            mostrarMensaje("Coche eliminado", "success");
            cargarMisCoches();
        })
        .catch(error => {
            mostrarMensaje(error.message, "danger");
        });
}

function agregarCoche(event) {
    event.preventDefault();

    let token = localStorage.getItem("token");

    let coche = {
        name: document.getElementById("nombre").value,
        price: Number(document.getElementById("precio").value),
        km: Number(document.getElementById("km").value),
        category: document.getElementById("categoria").value,
        description: document.getElementById("descripcion").value,
        image: document.getElementById("imagen").value,
        idUser: localStorage.getItem("usuario")
    };

    fetch(`${API}/cars`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(coche)
    })
        .then(response => {
            if (!response.ok) throw new Error("No se pudo publicar el coche");
            mostrarMensaje("Coche publicado. Redirigiendo...", "success");
            setTimeout(() => {
                window.location.href = "mis_coches.html";
            }, 1500);
        })
        .catch(error => {
            mostrarMensaje(error.message, "danger");
        });
}
let cocheEditando = null;

function cargarCocheParaEditar() {
    let id = new URLSearchParams(window.location.search).get("id");
    let token = localStorage.getItem("token");

    fetch(`${API}/cars/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(response => {
            if (!response.ok) throw new Error("No se encontró el coche");
            return response.json();
        })
        .then(coche => {
            if (coche.idUser !== localStorage.getItem("usuario")) {
                window.location.href = "mis_coches.html";
                return;
            }
            cocheEditando = coche;
            document.getElementById("nombre").value = coche.name;
            document.getElementById("descripcion").value = coche.description;
            document.getElementById("precio").value = coche.price;
            document.getElementById("km").value = coche.km;
            document.getElementById("categoria").value = coche.category;
            document.getElementById("imagen").value = coche.image;
        })
        .catch(error => {
            mostrarMensaje(error.message, "danger");
        });
}

function guardarCambios(event) {
    event.preventDefault();

    if (!cocheEditando) return;

    let id = new URLSearchParams(window.location.search).get("id");
    let token = localStorage.getItem("token");

    let coche = {
        name: document.getElementById("nombre").value,
        price: Number(document.getElementById("precio").value),
        km: Number(document.getElementById("km").value),
        category: document.getElementById("categoria").value,
        description: document.getElementById("descripcion").value,
        image: document.getElementById("imagen").value,
        idUser: cocheEditando.idUser
    };

    fetch(`${API}/cars/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(coche)
    })
        .then(response => {
            if (!response.ok) throw new Error("No se pudieron guardar los cambios");
            mostrarMensaje("Cambios guardados. Redirigiendo...", "success");
            setTimeout(() => {
                window.location.href = "mis_coches.html";
            }, 1500);
        })
        .catch(error => {
            mostrarMensaje(error.message, "danger");
        });
}
if (document.getElementById("cuerpoCoches")) {
    cargarCoches();
}
if (document.getElementById("cuerpoMisCoches")) {
    cargarMisCoches();
}
if (document.getElementById("formEditar")) {
    cargarCocheParaEditar();
}