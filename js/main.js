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
            dibujar(todos);
        })
        .catch(error => {
            document.getElementById("cuerpoCoches").innerHTML =
                `<tr><td colspan="8">${error.message}</td></tr>`;
        });
}

function dibujar(lista) {
    let cuerpo = document.getElementById("cuerpoCoches");
    cuerpo.innerHTML = "";

    lista.forEach(c => {
        let comprado = c.state=== "Comprado";

        let estado = comprado
            ? `<span class="badge bg-secondary">Comprado</span>`
            : `<span class="badge bg-warning text-dark">Disponible</span>`;

        let boton = comprado
            ? "-"
            : `<button class="btn btn-oro btn-sm">Añadir al carrito</button>`;

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

cargarCoches();