const API = "https://practicaprogramacionweb.duckdns.org";

// Muestra una alerta de Bootstrap en el <div id="mensaje">
function mostrarMensaje(texto, tipo) {
    document.getElementById("mensaje").innerHTML =
        `<div class="alert alert-${tipo}">${texto}</div>`;
}

// REGISTRO
function registrar(event) {
    event.preventDefault();

    let nombre = document.getElementById("nombre").value;
    let email = document.getElementById("email").value;
    let latitud = document.getElementById("latitud").value;
    let longitud = document.getElementById("longitud").value;
    let password = document.getElementById("password").value;
    let confirmacion = document.getElementById("confirmacion").value;

    if (nombre === "" || email === "" || latitud === "" || longitud === "" ||
        password === "" || confirmacion === "") {
        mostrarMensaje("Rellena todos los campos", "warning");
        return;
    }

    if (password !== confirmacion) {
        mostrarMensaje("Las contraseñas no coinciden", "warning");
        return;
    }

    fetch(`${API}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: nombre,
            email: email,
            password: password,
            latitude: Number(latitud),
            longitude: Number(longitud)
        })
    })
        .then(response => {
            if (response.status === 409) throw new Error("Ese usuario o email ya existe");
            if (!response.ok) throw new Error("No se pudo registrar");

            mostrarMensaje("Cuenta creada. Redirigiendo al login...", "success");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        })
        .catch(error => {
            mostrarMensaje(error.message, "danger");
        });
}

// LOGIN 
function login(event) {
    event.preventDefault();

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password })
    })
        .then(response => {
            if (!response.ok) throw new Error("Email o contraseña incorrectos");
            return response.json();
        })
        .then(datos => {
            console.log(datos); 
            let token = datos.access_token || datos.token;
            if (!token) throw new Error("La API no devolvió el token");

            localStorage.setItem("token", token);
            localStorage.setItem("usuario", datos.user);
            window.location.href = "coches.html";
        })
        .catch(error => {
            mostrarMensaje(error.message, "danger");
        });
}

// SESIÓN 

// Si no hay token, vuelve al login
function comprobarSesion() {
    if (!localStorage.getItem("token")) {
        window.location.href = "login.html";
    }
}

// Borra todo lo guardado y vuelve al login
function cerrarSesion() {
    localStorage.clear();
    window.location.href = "login.html";
}