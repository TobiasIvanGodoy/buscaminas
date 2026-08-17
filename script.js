`Tareas restantes: 
-Colocar Menú selector de dificultad 
-Agregar popups de victoria y derrota 
-Agregar revelador automatico para casillas seguras (hecho)
-efectoDomino() no revela banderas (hecho)
-Funcion de zoomIn-Out
-Que la primera celda no sea una bomba
-Contador de bombas restantes (hecho)
`

const btnIniciar = document.getElementById("btnIniciar");
const btnModo = document.getElementById("btnModo");
const tiempo = document.getElementById("tiempo")
const minasRestantes = document.getElementById("minasRestantes")

const principal = document.getElementById("principal");

let reglas = [10, 8, 8, 80]; //configuracion para el juego

const posiciones = [
    [-1, 0],
    [1, 0],
    [0, 1],
    [0, -1],
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, -1]
];

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
let escalaTablero = 80 * ancho;
let celdasRestantes = ancho * alto - minas;

let comenzado = false;
let finalizado = false;
let derrota = false;

let modo = false;
let partida = false

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

function verificarVictoria() {
    const opcion1 = acertadas === minas;
    const opcion2 = falsaAlarma === 0;
    const opcion3 = celdasRestantes === 0;

    if ((opcion1 && opcion2) || opcion3 || finalizado) {
        finalizado = true;

        if (derrota) {
            btnIniciar.textContent = "😵";
        } else {
            btnIniciar.textContent = "😎";
        }
    }
}

function contarMinasRestantes() {
    minasRestantes.textContent = minas - banderas.length;
}

function ruleta(tope) {
    return Math.floor(Math.random() * tope);
}

function iniciarJuego(configuracion) {
    const tableroAnterior = document.getElementById("completo");

    if (tableroAnterior) {
        tableroAnterior.remove();
    }
    partida = !partida
    configurar(...configuracion);
    btnIniciar.textContent = "🙂";

    const tablero = crearTablero("completo");
    principal.append(tablero);
    contarMinasRestantes()
}

function crearTablero(id) {
    const tablero = document.createElement("div");

    tablero.id = id;
    tablero.classList.add("tablero", "fila", "contenedor");

    tablero.style.width = `${escalaTablero}px`;

    generarMatriz();
    mostrarTablero(tablero);

    return tablero;
}

// Tablero visible

function mostrarTablero(tablero) {
    const escalaCelda = 100 / ancho;

    for (let i = 0; i < tableroInterno.length; i++) {
        for (let j = 0; j < tableroInterno[i].length; j++) {
            const celda = document.createElement("button");

            celda.posicion = {f: i, c: j};
            celda.revelada = false;

            if (tableroInterno[i][j] === Number("-1")) {
                ubicacionMinas.push(celda)
            }

            celda.classList.add("celda") //estilo de celda no descubierta
            celda.style.width = `${escalaCelda}%`;

            celda.addEventListener("click", function () {
                const pos = celda.posicion;

                if (!finalizado) {

                    if (celda.revelada) {
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
            celda.classList.add("bomba")
            celda.textContent = celda.textContent.concat(" ", "💣");
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

function generarMatriz() {
    const matriz = [];

    for (let fila = 0; fila < alto; fila++) {
        const actual = [];

        for (let columna = 0; columna < ancho; columna++) {
            actual.push(0);
        }

        matriz.push(actual);
    }

    tableroInterno = colocarMinas(matriz);
}

function colocarMinas(matriz) {
    let restantes = minas;
    const coords = [];

    while (restantes > 0) {
        const columna = ruleta(ancho);
        const fila = ruleta(alto);

        if (matriz[fila][columna] !== -1) {
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

    console.log(matriz);

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
        let timer = 0
        const actual = partida
        comenzado = true;
        incrementar(timer, actual)
    }
}

function incrementar(timer, actual) {
    setTimeout(() => {
        timer += 0.01
        tiempo.textContent = timer.toFixed(2);
        if (!finalizado && actual === partida) {
            incrementar(timer, actual)
        }
    }, 10);
}

// eventos para los botones

btnIniciar.addEventListener("click", function () {
    iniciarJuego(reglas);
});

btnModo.addEventListener("click", function () {
    if (modo) {
        btnModo.textContent = "💣";
    } else {
        btnModo.textContent = "🚩";
    }
    modo = !modo;
});