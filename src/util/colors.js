// Definir el arreglo de 20 colores hexadecimales
const colores1 = [
    '#32021F', '#4B2E39', '#6c596e', '#6f7d8c', '#77a0a9',
    '#5e0b15', '#90323d', '#d9cab3', '#bc8034', '#8c7a6b',
    '#04080f', '#507dbc', '#a1c6ea', '#bbd1ea', '#dae3e5 ',
    '#f0f7ee', '#c4d7f2', '#afdedc', '#91a8a4', '#776871'
];
  
const colores2 = [
    '#00e8fc', '#f9c846', '#241e4e'
];

function crearSufle(colores) {
  let shuffledColors = [...colores]; // Crear una copia del arreglo original
  let currentIndex = shuffledColors.length, temporaryValue, randomIndex;

  // Mientras queden elementos para mezclar
  while (currentIndex !== 0) {
    // Elegir un elemento sin mezclar
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // E intercambiarlo con el elemento actual
    temporaryValue = shuffledColors[currentIndex];
    shuffledColors[currentIndex] = shuffledColors[randomIndex];
    shuffledColors[randomIndex] = temporaryValue;
  }

  return shuffledColors;
}

let coloresMezclados = crearSufle(colores1);
let indiceActual = 0;

function obtenerColor(useC2 = false) {
  if (indiceActual >= coloresMezclados.length) {
    // Re-mezclar los colores si se han utilizado todos
    coloresMezclados = crearSufle(useC2 ? colores2 : colores1);
    indiceActual = 0;
  }
  return coloresMezclados[indiceActual++];
}

export { obtenerColor }