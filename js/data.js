// js/data.js

// --- SIMULACIÓN DE DATOS ESTATICOS ---

// 1. CATEGORÍAS
const CATEGORIAS_GLOBAL = [
    { id: 1, nombre: "Generación y suministro de energía" },
    { id: 2, nombre: "Iluminación" },
    { id: 3, nombre: "Conductores y accesorios de cableado" },
    { id: 4, nombre: "Aparatos de protección y control" },
    { id: 5, nombre: "Herramientas y accesorios eléctricos" },
    { id: 6, nombre: "Instalaciones y accesorios domésticos" },
    { id: 7, nombre: "Motores y equipos electromecánicos" },
    { id: 8, nombre: "Electrónica y automatización" }
];

// 2. PRODUCTOS (BASADO EN TU LÓGICA DE BACKEND)
const PRODUCTOS_GLOBAL = [
    // Generación y suministro de energía
    // RUTA CORREGIDA para la carpeta duplicada: "images/images/..."
    { id: 1, nombre: "Generador de energía electrica de Gasolina 1500W", modelo: "GEN-1B", precio: 110.00, stock: 50, imagenUrl: "images/images/prod-1.jpg", categoriaId: 1, descripcion: "Unidad compacta de respaldo, ideal para el hogar o camping. Arranque manual y tanque de 4 litros." },
    { id: 2, nombre: "Panel Solar Monocristalino 100W", modelo: "GEN-1P", precio: 370.00, stock: 30, imagenUrl: "images/images/prod-2.jpg", categoriaId: 1, descripcion: "Alta eficiencia para sistemas aislados o interconexión a red. Certificación IP67 y marco de aluminio." },

    // Iluminación
    { id: 3, nombre: "Foco LED A19 Luz Blanca 10W", modelo: "ILU-2B", precio: 120.00, stock: 50, imagenUrl: "images/images/prod-3.jpg", categoriaId: 2, descripcion: "Foco LED de uso diario, equivalente a 60W incandescente. Base E27 estándar. 15,000 horas de vida." },
    { id: 4, nombre: "Tira LED RGB (5m) Controlable Wi-Fi", modelo: "ILU-2P", precio: 390.00, stock: 30, imagenUrl: "images/images/prod-4.jpg", categoriaId: 2, descripcion: "Iluminación ambiental y decorativa, control total por aplicación móvil. 16 millones de colores y modos dinámicos." },

    // Conductores y accesorios de cableado
    { id: 5, nombre: "Cable Eléctrico THW Calibre 12 (Rollo 100m)", modelo: "CON-3B", precio: 130.00, stock: 50, imagenUrl: "images/images/prod-5.jpg", categoriaId: 3, descripcion: "Cable de cobre suave con aislamiento termoplástico. Soporta 90°C. Color negro, para uso residencial." },
    { id: 6, nombre: "Canaleta Adhesiva PVC (2m)", modelo: "CON-3P", precio: 410.00, stock: 30, imagenUrl: "images/images/prod-6.jpg", categoriaId: 3, descripcion: "Sistema de gestión de cables de fácil instalación, ideal para cableado expuesto en oficinas o casas. Adhesivo 3M." },

    // Aparatos de protección y control
    { id: 7, nombre: "Interruptor Termomagnético 1 Polos (20A)", modelo: "APA-4B", precio: 140.00, stock: 50, imagenUrl: "images/images/prod-7.jpg", categoriaId: 4, descripcion: "Breaker de seguridad esencial para protección de circuitos en centros de carga residenciales, con certificación NOM." },
    { id: 8, nombre: "Supresor de Picos de Voltaje con USB", modelo: "APA-4P", precio: 430.00, stock: 30, imagenUrl: "images/images/prod-8.jpg", categoriaId: 4, descripcion: "Protección avanzada contra sobretensiones para equipo sensible (PC, TV, consolas). 6 tomas y 2 puertos USB." },

    // Herramientas y accesorios eléctricos
    { id: 9, nombre: "Multímetro Digital Básico (Volts/Ohms)", modelo: "HER-5B", precio: 150.00, stock: 50, imagenUrl: "images/images/prod-9.jpg", categoriaId: 5, descripcion: "Herramienta portátil y compacta para pruebas de voltaje DC/AC y continuidad. Incluye puntas de prueba." },
    { id: 10, nombre: "Pinza Amperimétrica TRMS Profesional", modelo: "HER-5P", precio: 450.00, stock: 30, imagenUrl: "images/images/prod-10.jpg", categoriaId: 5, descripcion: "Medición de corriente sin contacto. Con verdadero valor eficaz (TRMS) para máxima precisión en entornos ruidosos." },

    // Instalaciones y accesorios domésticos
    { id: 11, nombre: "Contacto Doble Polarizado 15A", modelo: "INS-6B", precio: 160.00, stock: 50, imagenUrl: "images/images/prod-11.jpg", categoriaId: 6, descripcion: "Placa de pared estándar con dos receptáculos, ideal para la mayoría de los aparatos domésticos. Fácil instalación." },
    { id: 12, nombre: "Apagador Atenuador (Dimmer) Wi-Fi", modelo: "INS-6P", precio: 470.00, stock: 30, imagenUrl: "images/images/prod-12.jpg", categoriaId: 6, descripcion: "Regula la intensidad de la luz y programa horarios desde tu smartphone. Compatible con focos LED dimeables." },

    // Motores y equipos electromecánicos
    { id: 13, nombre: "Bomba de Agua Periférica (1/2 HP)", modelo: "MOT-7B", precio: 170.00, stock: 50, imagenUrl: "images/images/prod-13.jpg", categoriaId: 7, descripcion: "Bomba compacta para aumento de presión en sistemas domésticos y riego de jardines. Motor silencioso." },
    { id: 14, nombre: "Motor Eléctrico Monofásico (1 HP)", modelo: "MOT-7P", precio: 490.00, stock: 30, imagenUrl: "images/images/prod-14.jpg", categoriaId: 7, descripcion: "Motor de propósito general con carcasa de hierro fundido, apto para compresores y sierras industriales." },

    // Electrónica y automatización
    { id: 15, nombre: "Sensor de Movimiento Infrarrojo PIR", modelo: "ELE-8B", precio: 180.00, stock: 50, imagenUrl: "images/images/prod-15.jpg", categoriaId: 8, descripcion: "Dispositivo para encendido automático de luces o alarmas. Ángulo de detección de 120 grados." },
    { id: 16, nombre: "Controlador Lógico Programable (PLC) Básico", modelo: "ELE-8P", precio: 510.00, stock: 30, imagenUrl: "images/images/prod-16.jpg", categoriaId: 8, descripcion: "Unidad de control compacta para automatización de procesos. Incluye 8 entradas y 4 salidas digitales." }
];

// 3. TARJETAS DE EJEMPLO (Simulación de BBDD)
const TARJETAS_EJEMPLO = [
    { id: 101, tipo: 'VISA', digitosFinales: '4444', fechaVencimiento: '12/29' },
    { id: 102, tipo: 'MASTERCARD', digitosFinales: '8888', fechaVencimiento: '10/28' }
];

// --- FUNCIONES DE AYUDA ---

// Función para simular la búsqueda de un producto por ID
function findProductById(id) {
    // Convierte el ID a número por si acaso
    const productId = parseInt(id);
    return PRODUCTOS_GLOBAL.find(p => p.id === productId);
}

// Función para simular la búsqueda de una categoría por nombre
function findCategoryByName(name) {
    return CATEGORIAS_GLOBAL.find(c => c.nombre === name);
}

// Generador simple de IDs para Pedidos/Tarjetas añadidas
function generateNextId(type) {
    let lastId = parseInt(localStorage.getItem(`last${type}Id`)) || 1000;
    lastId++;
    localStorage.setItem(`last${type}Id`, lastId);
    return lastId;
}