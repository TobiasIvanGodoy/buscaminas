`Tareas restantes: 
-Colocar Menú selector de dificultad (hecho)
-Agregar popups de victoria y derrota (hecho)
-Agregar revelador automatico para casillas seguras (hecho)
-efectoDomino() no revela banderas (hecho)
-Funcion de zoomIn-Out (hecho)
-Que la primera celda no sea una bomba (hecho)
-Contador de bombas restantes (hecho)
-Arreglar el timer (hecho)
`

const btnIniciar = document.getElementById("btnIniciar");
const btnModo = document.getElementById("btnModo");
const btnZoom = document.getElementById("btnZoom")
const tiempo = document.getElementById("tiempo")
const minasRestantes = document.getElementById("minasRestantes")
const overlay = document.getElementById("overlay")

const principal = document.getElementById("principal");

const posiciones = [
   [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]];

const colores = {
    "-1": "red",
    0: "transparent",
    1: "blue",
    2: "green",
    3: "orange",
    4: "purple",
    5: "brown",
    6: "cyan",
    7: "black",
    8: "gray"
};

let minas = 0;
let ubicacionMinas = [];

let banderas = [];
let acertadas = 0;
let falsaAlarma = 0;

let tableroInterno = [];
let ancho = 0;
let alto = 0;

let escalas = [30, 40, 50, 60, 70, 80, 90, 100];
let escalasFuente = ["10px", "12.86px", "15.71px", "18.57px", "21.43px", "24.29px", "27.14px", "30px"];
let indiceEscala = 0;
let escalaTablero = escalas[indiceEscala] * ancho;

let celdasRestantes = ancho * alto - minas;

let comenzado = false;
let finalizado = false;
let derrota = false;

let modo = false;
let partida = false;
let reglas = [99, 30, 16, escalas[indiceEscala]];

function configurar(cantMinas, nuevoAncho, nuevoAlto, escala) {
    minas = cantMinas;
    ancho = nuevoAncho;
    alto = nuevoAlto;
    escalaTablero = escala * ancho;

    finalizado = false;
    comenzado = false;
    derrota = false;
    modo = false;

    btnModo.textContent = "💣";
    acertadas = 0;
    falsaAlarma = 0;
    
    banderas = []
    ubicacionMinas = []
    
    celdasRestantes = ancho * alto - minas;
    
    minasRestantes.textContent = "0"
    setTimeout(() => {tiempo.textContent = "0"}, 10)
}

function cambiarEscala() {
    if (indiceEscala >= escalas.length - 1) {
        indiceEscala = 0
    } else {
        indiceEscala += 1
    }
    escalaTablero = escalas[indiceEscala] * ancho;
    btnZoom.textContent = `x${indiceEscala + 1}`;
    setTimeout(() => {btnZoom.textContent = "🔎"}, 200)
    
    const tableroExiste = document.getElementById("completo");
    if (tableroExiste) {
        tableroExiste.style.width = `${escalaTablero}px`;
        for (const celda of tableroExiste.children) {
            celda.style.fontSize = escalasFuente[indiceEscala];
        }
    }
}

function crearMenu() {
    overlay.classList.remove("oculto")
    overlay.innerHTML = ""

    const menu = document.createElement("div")
    menu.classList.add("contenedor", "columna")
    menu.id = "menu"
    
    const principiante = document.createElement("button")
    principiante.classList.add("contenedor", "fila", "dificultad")
    principiante.textContent = "Dificultad principiante"
    principiante.addEventListener("click", function() {
        reglas = [10, 9, 9, escalas[indiceEscala]]
        iniciarJuego(reglas)
        overlay.classList.add("oculto")
    })

    const intermedio = document.createElement("button")
    intermedio.classList.add("contenedor", "fila", "dificultad")
    intermedio.textContent = "Dificultad intermedio"
    intermedio.addEventListener("click", function() {
        reglas = [40, 16, 16, escalas[indiceEscala]]
        iniciarJuego(reglas)
        overlay.classList.add("oculto")
    })

    const experto = document.createElement("button")
    experto.classList.add("contenedor", "fila", "dificultad")
    experto.textContent = "Dificultad experto"
    experto.addEventListener("click", function() {
        reglas = [99, 30, 16, escalas[indiceEscala]]
        iniciarJuego(reglas)
        overlay.classList.add("oculto")
    })
    crearBtnCerrar(menu)
    menu.append(principiante)
    menu.append(intermedio)
    menu.append(experto)
    overlay.append(menu)
}

function crearBtnCerrar(contenedor) {

    const cerrar = document.createElement("div");
    cerrar.classList.add("contenedor", "fila");
    cerrar.style.justifyContent = "flex-end";
    cerrar.style.border = "none";
    cerrar.style.width = "100%";
    cerrar.style.height = "4vh";
    contenedor.appendChild(cerrar);

    const btnCerrar = document.createElement("button");
    btnCerrar.id = "btnCerrar";
    cerrar.appendChild(btnCerrar);

    const img = document.createElement("img");
    img.alt = "cerrar ventana";
    img.src = "btnCerrar.png";
    btnCerrar.appendChild(img)

    btnCerrar.addEventListener("click", function (){
        overlay.classList.add("oculto")
    })

}

function verificarVictoria() {
    const opcion1 = acertadas === minas;
    const opcion2 = falsaAlarma === 0;
    const opcion3 = celdasRestantes === 0;

    if ((opcion1 && opcion2) || opcion3 || finalizado) {
        finalizado = true;

        if (derrota) {
            btnIniciar.textContent = "😵";
            mostrarResultado(false)
        } else {
            btnIniciar.textContent = "😎";
            mostrarResultado(true)
        }
    }
}

function mostrarResultado(resultado) {
    overlay.classList.remove("oculto");
    overlay.innerHTML = "";

    const popup = document.createElement("div");
    popup.id = "menu"
    popup.style.width = "min(80vw, 400px)";
    popup.style.height = "min(80vh, 500px)";
    popup.classList.add("contenedor", "columna");
    crearBtnCerrar(popup);

    const titulo = document.createElement("h2");
    titulo.style.border = "none";
    const mensaje = document.createElement("p");
    mensaje.style.border = "none";
    mensaje.style.textAlign = "center";

    setTimeout(() => {
        const restantes = Number(document.getElementById("minasRestantes").textContent);
        if (resultado) {
            titulo.style.color = "green"
            titulo.textContent = "¡Victoria!";
            mensaje.innerHTML = `Encontraste todas las minas.<br>
            tiempo = ${document.getElementById("tiempo").textContent}<br>
            minas restantes = ${restantes + falsaAlarma}<br>
            falsas alarmas = ${falsaAlarma}`;

        } else {
            titulo.style.color = "red"
            titulo.textContent = "Derrota";
            mensaje.innerHTML = `Pisaste una bomba.<br>
            tiempo = ${document.getElementById("tiempo").textContent}<br>
            minas restantes = ${restantes + falsaAlarma}<br>
            falsas alarmas = ${falsaAlarma}`;
        }
    }, 10)
    
    const boton = document.createElement("button");
    boton.textContent = "Jugar de nuevo";
    boton.classList.add("contenedor", "fila", "dificultad")

    boton.addEventListener("click", function(){
        overlay.classList.add("oculto");
        iniciarJuego(reglas);
    });

    popup.append(titulo, mensaje, boton);
    overlay.append(popup);
}

function contarMinasRestantes() {
    minasRestantes.textContent = minas - banderas.length;
}

function ruleta(tope) {
    return Math.floor(Math.random() * tope);
}

function iniciarJuego(configuracion) {
    const tableroAnterior = document.getElementById("juego");

    if (tableroAnterior) {
        tableroAnterior.remove();
    }
    partida = !partida
    configurar(...configuracion);
    btnIniciar.textContent = "🙂";

    const juego = document.createElement("div")
    juego.id = "juego"; 
    const tablero = crearTablero("completo");
    juego.append(tablero);
    principal.append(juego);
    contarMinasRestantes()
}

function crearTablero(id) {
    const tablero = document.createElement("div");

    tablero.id = id;
    tablero.classList.add("tablero", "fila", "contenedor");

    tablero.style.width = `${escalaTablero}px`;
    tablero.style.fontSize = escalasFuente[indiceEscala];

    mostrarTablero(tablero);

    return tablero;
}

// Tablero visible

function mostrarTablero(tablero) {
    const escalaCelda = 100 / ancho;

    for (let i = 0; i < alto; i++) {
        for (let j = 0; j < ancho; j++) {
            const celda = document.createElement("button");

            celda.posicion = {f: i, c: j};
            celda.revelada = false;

            celda.classList.add("celda") //estilo de celda no descubierta
            celda.style.fontSize = escalasFuente[indiceEscala];
            celda.style.width = `${escalaCelda}%`;

            celda.addEventListener("click", function () {
                const pos = celda.posicion;

                if (!comenzado) {
                    generarMatriz(pos);
                }

                if (!finalizado) {

                    if (celda.revelada ) {
                        revelarAdyacentes(celda, pos);
                    }

                    if (modo) {
                        colocarBandera(celda, pos);
                    } else if (celda.textContent !== "🚩") {
                        efectoDomino(pos);
                    }
                }

            });

            tablero.append(celda);
        }
    }
}

function guardarMinas() {
    const tablero = document.getElementById("completo")
    for (const celda of tablero.children) {
        if (tableroInterno[celda.posicion.f][celda.posicion.c] === Number("-1")) {
                ubicacionMinas.push(celda)
            }
    }
}

function revelarAdyacentes(celda, pos) {
    const banderasAdyacentes = contarBanderas(pos)
    if (banderasAdyacentes === Number(celda.textContent)) {
        for (const posicion of posiciones) {
            if (enRango(pos, posicion)) {
                
                const nuevaFila = pos.f + posicion[0];
                const nuevaColumna = pos.c + posicion[1];

                efectoDomino({f: nuevaFila, c : nuevaColumna})
            }
        }
    }
}

function contarBanderas(pos) {
    let res = 0
    const tablero = document.getElementById("completo")
    for (const posicion of posiciones) {
        if (enRango(pos, posicion)) {
            const celda = {f : pos.f + posicion[0], c: pos.c + posicion[1]}
            for (const otra of tablero.children) {
                if (
                    celda.f === otra.posicion.f &&
                    celda.c === otra.posicion.c && otra.textContent === "🚩"
                ) {
                    res += 1
                }
            }
        }
    }
    return res
}

function tranquilizar() {
    setTimeout(() => {
        btnIniciar.textContent = "🙂";

        if (finalizado && !derrota) {
            btnIniciar.textContent = "😎";
        } else if (derrota) {
            btnIniciar.textContent = "😵";
        }
    }, 500);
}

function colocarBandera(celda, pos) {
    if (celda.textContent !== "🚩" && !celda.revelada) {
        celda.textContent = "🚩";

        if (tableroInterno[pos.f][pos.c] === -1) {
            acertadas += 1;
        } else {
            falsaAlarma += 1;
        }
        banderas.push(pos)

    } else if (celda.textContent === "🚩" && !celda.revelada) {
        celda.innerHTML = "";

        if (tableroInterno[pos.f][pos.c] === -1) {
            acertadas -= 1;
        } else {
            falsaAlarma -= 1;
        }
        let i = 0
        while (i < banderas.length && banderas[i] !== pos) {
            i += 1;
        }
        if (i < banderas.length) {
            banderas.splice(i, 1)
        }
    }
    contarMinasRestantes()
    verificarVictoria();
}

function efectoDomino(pos) {
    const tablero = document.getElementById("completo");
    const valor = tableroInterno[pos.f][pos.c];

    for (const celda of tablero.children) {
        if (
            celda.posicion.f === pos.f &&
            celda.posicion.c === pos.c
        ) {
            if (!celda.revelada && celda.textContent === "") {
                revelarCelda(celda, pos, valor)
            }
        }
    }
}

function revelarCelda(celda, pos, valor) {
    celda.revelada = true;
    celda.innerHTML = "";

    if (valor !== -1) {
        iniciarTimer();
        btnIniciar.textContent = "😲";
        tranquilizar();

        estilizarCelda(celda, valor);

        for (const posicion of posiciones) {
            if (enRango(pos, posicion) && valor === 0) {
                const filaAdyacente = pos.f + posicion[0];
                const columnaAdyacente = pos.c + posicion[1];

                efectoDomino({
                    f: filaAdyacente,
                    c: columnaAdyacente
                });
            }
        }

    } else {
        derrota = true;
        finalizado = true;

        for (const celda of ubicacionMinas) {
            celda.classList.add("bomba");
            if (celda.textContent !== "🚩") {
                celda.textContent = "💣";
            }
        }
    }
    verificarVictoria();
}

function estilizarCelda(celda, valor) {
    celda.classList.add("descubierta") //estilo de celda descubierta

    celda.textContent = valor;
    celda.style.color = colores[valor];

    if (!finalizado) {
        celdasRestantes -= 1;
    }
}

// Crear tablero interno

function generarMatriz(pos) {
    const matriz = [];

    for (let fila = 0; fila < alto; fila++) {
        const actual = [];

        for (let columna = 0; columna < ancho; columna++) {
            actual.push(0);
        }

        matriz.push(actual);
    }

    tableroInterno = colocarMinas(matriz, pos);
}

function colocarMinas(matriz, pos) {
    let restantes = minas;
    const coords = [];

    while (restantes > 0) {
        const columna = ruleta(ancho);
        const fila = ruleta(alto);

        if (matriz[fila][columna] !== -1 && fila !== pos.f && columna !== pos.c) {
            matriz[fila][columna] = -1;

            coords.push({
                f: fila,
                c: columna
            });

            restantes -= 1;
        }
    }

    return calcularNumeros(matriz, coords);
}

function calcularNumeros(matriz, coords) {
    for (const coord of coords) {
        for (const posicion of posiciones) {
            if (enRango(coord, posicion)) {
                matriz[coord.f + posicion[0]][coord.c + posicion[1]] += 1;
            }
        }
    }

    for (const coord of coords) {
        matriz[coord.f][coord.c] = -1;
    }

    // console.log(matriz);

    return matriz;
}

function enRango(coord1, coord2) {
    const fila = coord1.f + coord2[0];
    const columna = coord1.c + coord2[1];

    return (
        0 <= fila &&
        fila < alto &&
        0 <= columna &&
        columna < ancho
    );
}

// temporizador 

function iniciarTimer() {
    if (!comenzado) {
        const inicio = Date.now();
        const actual = partida;
        guardarMinas();
        comenzado = true;

        incrementar(inicio, actual);
    }
}

function incrementar(inicio, actual) {
    setTimeout(() => {
        const ahora = Date.now();
        const tiempoActual = ahora - inicio;

        tiempo.textContent = (tiempoActual / 1000).toFixed(2);

        if (!finalizado && actual === partida) {
            incrementar(inicio, actual);
        }
    }, 10);
}

// eventos para los botones

btnIniciar.addEventListener("click", function () {
    crearMenu()
    
});

btnModo.addEventListener("click", function () {
    if (comenzado) {
        if (modo) {
            btnModo.textContent = "💣";
        } else {
            btnModo.textContent = "🚩";
        }
        modo = !modo;
    }    
});

btnZoom.addEventListener("click", function () {
    cambiarEscala()
})