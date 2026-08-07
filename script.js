
const btnIniciar = document.getElementById("btnIniciar");
const btnModo = document.getElementById("btnModo");

const principal = document.getElementById("principal")

const dificultad = [10, 8, 8] 

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
let minasRestantes = 0;
let ancho = 0;
let alto = 0;
let victoria = false;

function configurar(cantMinas, nuevoAncho, nuevoAlto) {
    minas = cantMinas;
    minasRestantes = cantMinas;
    ancho = nuevoAncho;
    alto = nuevoAlto;
}


function verificarVictoria() {
    if (minasRestantes === 0) {
        victoria = true;
    }
}

function ruleta(tope) {
    return Math.floor(Math.random() * tope);
}

function iniciarJuego(configuracion) {
    const tableroAnterior = document.getElementById("completo")
    if (tableroAnterior) {
        tableroAnterior.remove()
    }
    configurar(...configuracion)
    const tablero = crearTablero("completo")
    //const tablero_visible = crearTablero("visible")
    principal.append(tablero)
    //principal.append(tablero_visible)
}

function crearTablero(id) {
    const tablero = document.createElement("div")
    tablero.id = id;
    tablero.classList.add("tablero", "fila", "contenedor")
    const escalaTablero = 100*ancho;
    tablero.style.width = `${escalaTablero}px`;
    

    const matriz = generarMatriz(ancho, alto)

    const escalaCelda = 100 / ancho;

    for (const fila of matriz) {
        for (const celda of fila) {
            const cuadrado = document.createElement("div")
            cuadrado.style.width = `${escalaCelda}%`;
            cuadrado.style.color = colores[celda];
            cuadrado.style.borderColor = "black";
            cuadrado.style.aspectRatio = "1/1";
            cuadrado.style.display = "flex";
            cuadrado.style.alignItems = "center";
            cuadrado.style.justifyContent = "center"
            if (celda === Number("-1")) {
                cuadrado.textContent = "💣";
            } else {
                cuadrado.textContent = celda
            }
            tablero.append(cuadrado)
        }
    }
    return tablero
}

function generarMatriz(dh, dv) {
    const matriz = []
    for (let i = 0; i < dh; i++) {
        const actual = []
        for (let j = 0; j < dv; j++) {
            actual.push(0)            
        }
        matriz.push(actual)
    } 
    return colocarMinas(matriz)
}

function colocarMinas(matriz) {
    let restantes = minas;
    const coords = []
    while (restantes > 0) {
        const x = ruleta(ancho)
        const y = ruleta(alto)
        if (matriz[x][y] !== -1) {
            matriz[x][y] = -1;
            const coord = [x, y];
            coords.push(coord);
            restantes = restantes - 1;
        }
    }
    return calcularNumeros(matriz, coords)
}

function calcularNumeros(matriz, coords) {
    const posiciones = [[-1,0],[1,0],[0,1],[0,-1],[-1,1],[1,1],[-1,-1],[1,-1]]
    for (const coord of coords) {
        for (const posicion of posiciones) {
            if (enRango(coord, posicion)) {
                matriz[coord[0]+posicion[0]][coord[1]+posicion[1]] += 1;
            }
        }
    }

    for (const coord of coords) {
        matriz[coord[0]][coord[1]] = -1
    }

    return matriz
}

function enRango(coord1, coord2) {
    const horizontal = coord1[0] + coord2[0]
    const vertical = coord1[1] + coord2[1]
    if ((0 <= horizontal && horizontal < ancho) && (0 <= vertical && vertical < alto)) {
        return true;
    } else {
        return false
    }
}

btnIniciar.addEventListener("click", function () {
    iniciarJuego(dificultad)
})