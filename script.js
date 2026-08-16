const btnIniciar = document.getElementById("btnIniciar");
const btnModo = document.getElementById("btnModo");

const principal = document.getElementById("principal");

const dificultad = [10, 4, 8];

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
let descubiertas = 0;
let falsaAlarma = 0;
let ancho = 0;
let alto = 0;
let celdasRestantes = ancho * alto - minas;
let finalizado = false;
let derrota = false;
let modo = false;
let tableroInterno = [];

function configurar(cantMinas, nuevoAncho, nuevoAlto) {
    minas = cantMinas;
    ancho = nuevoAncho;
    alto = nuevoAlto;
    finalizado = false;
    derrota = false;
    descubiertas = 0;
    falsaAlarma = 0;
    modo = false;

    btnModo.textContent = "🔎";

    celdasRestantes = ancho * alto - minas;
}

function verificarVictoria() {
    const opcion1 = descubiertas === minas;
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

function ruleta(tope) {
    return Math.floor(Math.random() * tope);
}

function iniciarJuego(configuracion) {
    const tableroAnterior = document.getElementById("completo");

    if (tableroAnterior) {
        tableroAnterior.remove();
    }

    configurar(...configuracion);
    btnIniciar.textContent = "🙂";

    const tablero = crearTablero("completo");
    principal.append(tablero);
}

function crearTablero(id) {
    const tablero = document.createElement("div");

    tablero.id = id;
    tablero.classList.add("tablero", "fila", "contenedor");

    const escalaTablero = 80 * ancho;
    tablero.style.width = `${escalaTablero}px`;

    generarMatriz();
    mostrarTablero(tablero);

    return tablero;
}

function mostrarTablero(tablero) {
    const escalaCelda = 100 / ancho;

    for (let i = 0; i < tableroInterno.length; i++) {
        for (let j = 0; j < tableroInterno[i].length; j++) {
            const celda = document.createElement("button");

            celda.posicion = {
                f: i,
                c: j
            };

            celda.revelada = false;

            celda.style.width = `${escalaCelda}%`;
            celda.style.borderColor = "black";
            celda.style.aspectRatio = "1/1";
            celda.style.color = "grey";

            celda.addEventListener("click", function () {
                if (finalizado) {
                    return;
                }

                const pos = celda.posicion;

                if (modo) {
                    colocarBandera(celda, pos);
                } else if (celda.textContent !== "🚩") {
                    efectoDomino(pos);
                }
            });

            tablero.append(celda);
        }
    }
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
            descubiertas += 1;
        } else {
            falsaAlarma += 1;
        }

    } else if (celda.textContent === "🚩" && !celda.revelada) {
        celda.innerHTML = "";

        if (tableroInterno[pos.f][pos.c] === -1) {
            descubiertas -= 1;
        } else {
            falsaAlarma -= 1;
        }
    }

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
            if (!celda.revelada) {
                celda.revelada = true;
                celda.innerHTML = "";

                if (valor !== -1) {
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
                    celda.textContent = "💣";
                    celda.style.backgroundColor = "red";

                    derrota = true;
                    finalizado = true;

                    for (const celda of tablero.children) {
                        efectoDomino(celda.posicion);
                    }
                }

                verificarVictoria();
            }
        }
    }
}

function estilizarCelda(celda, valor) {
    celda.style.display = "flex";
    celda.style.alignItems = "center";
    celda.style.justifyContent = "center";
    celda.style.backgroundColor = "white";

    celda.textContent = valor;
    celda.style.color = colores[valor];

    if (!finalizado) {
        celdasRestantes -= 1;
    }
}

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

btnIniciar.addEventListener("click", function () {
    iniciarJuego(dificultad);
});

btnModo.addEventListener("click", function () {
    if (modo) {
        btnModo.textContent = "🔎";
    } else {
        btnModo.textContent = "🚩";
    }

    modo = !modo;
});