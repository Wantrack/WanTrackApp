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

const coloresAdvisers = [
  '#7289e2', '#999daf', '#f47a65', '#686d89', '#acb1bd', '#9c9d9f', '#83b7ff', '#feddc5',
  '#f0856a', '#fbb29c', '#d76b55', '#f68172', '#515156', '#808186', '#3c77fa', '#6c6c72', '#f27359', '#8f939f',
  '#66ad50', '#4f5055', '#85c664', '#28282e', '#1b1b22', '#fed0ba', '#4d526f', '#3f3f45', '#2663d3', '#5c617d',
  '#6179db', '#8498e9', '#ffead2', '#75b75a', '#2f3035', '#92da6e', '#3d425a', '#3a3f4e', '#aaaab2', '#5d5d60',
  '#747477', '#4f82fb', '#599d4a', '#70a7ff', '#fa8c72', '#565a67', '#fcc9af', '#4a4a50', '#c55f48', '#f89b87',
  '#a3d2ff', '#c4efff', '#999999', '#fb987d', '#fff4e0', '#3d3d42', '#80849b', '#2e2e34', '#7a91e5', '#59595e',
  '#336bd4', '#484d5b', '#fc9d82', '#828692', '#69696c', '#427f37', '#333338', '#4f4f53', '#1d1e2b', '#2b3348',
  '#6981df', '#3d71d5', '#8e8f94', '#a0eb77', '#9ba0ac', '#656a76', '#77777e', '#476ed7', '#707176', '#8d91a3',
  '#e4795f', '#4b8843', '#737783', '#608eff', '#747891', '#fca58a', '#fdaf91', '#5878d8', '#b4e5ff', '#b64f38',
  '#8d8e91', '#91c6ff', '#808083', '#3d4047', '#1f2543'
];

export { obtenerColor, coloresAdvisers }