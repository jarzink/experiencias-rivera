# Sistema Dinámico de Reservaciones Turísticas - Riviera Maya

Proyecto frontend desarrollado como parte de la Actividad Sumativa de la asignatura de Aplicaciones Web. Permite consultar un catálogo de experiencias turísticas de forma asíncrona, filtrarlas por categorías, buscarlas en tiempo real, ordenarlas por precio, gestionar cupos y calcular un resumen de reservaciones dinámico.

## Tecnologías Utilizadas
- **HTML5** (Estructura semántica)
- **CSS3** (Diseño responsivo, Grid, Flexbox y variables)
- **JavaScript Puro / Vanilla JS** (Manipulación del DOM, eventos, métodos de arreglos y carga asíncrona con `fetch`)

## Estructura del Proyecto
- `index.html`: Estructura principal de la interfaz y secciones.
- `styles.css`: Estilos visuales adaptables para dispositivos móviles y escritorio.
- `app.js`: Lógica de la aplicación, control de estado y reactividad.
- `data/experiencias.json`: Base de datos simulada en formato JSON.

## Cómo Ejecutar el Proyecto
1. Clona este repositorio o descarga los archivos.
2. Abre la carpeta en **VS Code**.
3. Ejecuta el archivo `index.html` utilizando un servidor local (como **Live Server**) para evitar restricciones de seguridad con el archivo JSON (`fetch`).
