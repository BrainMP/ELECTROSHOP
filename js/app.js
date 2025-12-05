// js/app.js

// Importamos los datos estáticos simulados.
// Asegúrate de que el archivo data.js se cargue antes que app.js en el HTML.
// (En un proyecto real, esto sería fetch/AJAX).
// Usamos las variables globales de data.js directamente: PRODUCTOS_GLOBAL, CATEGORIAS_GLOBAL, etc.

document.addEventListener('DOMContentLoaded', () => {
    // Estado de la aplicación
    let appState = {
        // Simulación de sesión (datos que vendrían del servidor)
        isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
        usuarioNombre: localStorage.getItem('usuarioNombre') || 'Invitado',
        usuarioEmail: localStorage.getItem('usuarioEmail') || '',
        usuario: { // Objeto para simular la sesión completa para la vista de perfil
            nombre: localStorage.getItem('usuarioNombre') || 'Usuario de Prueba',
            email: localStorage.getItem('usuarioEmail') || 'test@example.com',
            // CORREGIDO: Usando .slice() para evitar el Uncaught Error en la inicialización
            tarjetas: JSON.parse(localStorage.getItem('userCards')) || TARJETAS_EJEMPLO.slice()
        },
        // Carrito de compras (simulado con localStorage)
        cart: JSON.parse(localStorage.getItem('cartItems')) || [],
        // Pedidos (simulado con localStorage)
        pedidos: JSON.parse(localStorage.getItem('userOrders')) || [],
        // Página actual
        currentPage: 'catalogo',
        // Parámetros de la página actual
        currentParams: {}
    };

    // Inicializa la app y añade listeners
    initApp();

    function initApp() {
        // Cargar los datos iniciales si es la primera vez
        if (!localStorage.getItem('userCards')) {
            localStorage.setItem('userCards', JSON.stringify(TARJETAS_EJEMPLO));
        }
        if (!localStorage.getItem('lastPedidoId')) {
            localStorage.setItem('lastPedidoId', 1000);
        }

        // --- LÓGICA DE DETECCIÓN DE PÁGINA INICIAL ---
        const query = new URLSearchParams(window.location.search);
        let initialPage = 'catalogo';
        
        const simulatedPage = query.get('page');
        if (simulatedPage) {
             initialPage = simulatedPage;
        }

        appState.currentPage = initialPage;
        if (query.get('cat')) {
            appState.currentParams.cat = query.get('cat');
        }
        if (query.get('q')) {
            appState.currentParams.q = query.get('q');
        }
        if (query.get('view')) {
            appState.currentParams.view = query.get('view');
        }
        if (query.get('id')) {
            appState.currentParams.id = parseInt(query.get('id'));
        }

        // Renderizar la página completa por primera vez
        renderPage();

        // Aplicar listeners al DOM, ya que el contenido principal es dinámico
        attachGlobalListeners();
        attachFormListeners();
        attachCartListeners();
        attachProfileListeners();

        // 1. LÓGICA DE MODAL DE ELIMINAR TARJETA (Perfil)
        window.abrirModalEliminar = abrirModalEliminar;
        window.cerrarModal = cerrarModal;

        // 2. LÓGICA DE MODALES (Modal de Archivar Pedido)
        attachPedidoDetailModal();
    }
    
    // ===================================================================================================
    //                              RENDERIZADO DE VISTAS Y DATOS
    // ===================================================================================================

    // Función para renderizar el contenido de la página basado en el estado
    function renderPage() {
        const header = renderHeader();
        const mainContent = renderMainContent(appState.currentPage, appState.currentParams);
        const footer = renderFooter();

        document.body.innerHTML = header + mainContent + footer;
        updateUI(); // Llamar después de renderizar el nuevo HTML
        // Volver a adjuntar listeners después de reemplazar el DOM
        attachGlobalListeners();
        attachFormListeners();
        attachCartListeners();
        attachProfileListeners();
        attachPedidoDetailModal(); // Re-attach modal logic

        // Asegurarse de que el scroll esté arriba en cada navegación
        window.scrollTo(0, 0);
    }

    // Lógica para actualizar elementos comunes (carrito, nombre de usuario)
    function updateUI() {
        const cartItemCount = appState.cart.reduce((total, item) => total + item.cantidad, 0);
        const cartCountSpans = document.querySelectorAll('.cart-link span');
        cartCountSpans.forEach(span => span.textContent = cartItemCount);

        const usuarioNombreEl = document.querySelector('.dropdown-header strong');
        if (usuarioNombreEl) {
            usuarioNombreEl.textContent = appState.usuarioNombre;
        }

        // Mostrar u ocultar enlaces de usuario/logout vs. login
        document.querySelectorAll('.user-link').forEach(el => el.style.display = appState.isLoggedIn ? 'none' : 'block');
        document.querySelectorAll('.user-menu-container').forEach(el => el.style.display = appState.isLoggedIn ? 'block' : 'none');
        document.querySelectorAll('.dropdown-header strong').forEach(el => el.textContent = appState.usuarioNombre);

        // Renderizar las categorías en el menú principal y footer
        const mainNavUL = document.querySelector('.main-nav ul');
        if (mainNavUL) {
            mainNavUL.innerHTML = CATEGORIAS_GLOBAL.map(cat => `
                <li>
                    <a href="index.html?page=catalogo&cat=${cat.nombre}" data-nav-target="catalogo" data-cat-name="${cat.nombre}" class="nav-link">${cat.nombre}</a>
                </li>
            `).join('');
        }
        const footerCatUL = document.getElementById('footer-cat').querySelector('ul');
        if (footerCatUL) {
            footerCatUL.innerHTML = CATEGORIAS_GLOBAL.map(cat => `
                <li>
                    <a href="index.html?page=catalogo&cat=${cat.nombre}" data-nav-target="catalogo" data-cat-name="${cat.nombre}">${cat.nombre}</a>
                </li>
            `).join('');
        }
    }

    // ===================================================================================================
    //                              FUNCIONES DE COMPONENTES/FRAGMENTS
    // ===================================================================================================

function renderHeader() {
    // Adaptación del header.html: Se elimina la sintaxis th:fragment, th:text, th:each, th:href y Spring Security
    return `
        <header class="header-steren">
            <div class="header-top">
                <button id="menu-toggle" class="menu-toggle">
                    &#9776;
                </button>
                <div class="logo">
                    <a href="index.html" class="logo-link" data-nav-target="catalogo">
                        <img src="images/images/electroshop-logo.png" alt="ELECTRO SHOP Logo" class="main-logo">
                    </a>
                </div>
                <form id="search-form" class="search-bar">
                    <input type="text" name="q" placeholder="Buscar en toda la tienda...">
                    <button type="submit" class="search-btn">🔍</button>
                </form>
                <div class="user-links">
                    <a href="index.html?page=login" class="user-link" data-nav-target="login" style="display: ${appState.isLoggedIn ? 'none' : 'block'}">
                        Iniciar sesión
                    </a>
                    <div class="user-menu-container" style="display: ${appState.isLoggedIn ? 'block' : 'none'}">
                        <button id="user-menu-trigger" class="user-menu-trigger">
                            <img src="images/images/usuario-logo.png" alt="Mi Cuenta" class="user-icon-img">
                        </button>
                        <div id="user-menu-dropdown" class="user-menu-dropdown">
                            <div class="dropdown-header">
                                Hola, <strong>${appState.usuarioNombre}</strong>
                            </div>
                            <ul class="dropdown-links">
                                <li>
                                    <a href="index.html?page=perfil" data-nav-target="perfil">Editar Perfil</a>
                                </li>
                                <li>
                                    <a href="index.html?page=pedidos" data-nav-target="pedidos">Mis Pedidos</a>
                                </li>
                            </ul>
                            <div class="dropdown-footer">
                                <button type="button" id="logout-btn" class="btn-logout">Cerrar Sesión</button>
                            </div>
                        </div>
                    </div>
                    <a href="index.html?page=cart" data-nav-target="cart" class="cart-link" >
                        <img src="images/images/logo-carrito.png" alt="Carrito" class="cart-icon-img">
                        (<span class="cart-item-count">${appState.cart.length}</span>)
                    </a>
                </div>
            </div>
            <div id="main-menu" class="main-menu-container">
                <nav class="main-nav">
                    <ul>
                        </ul>
                </nav>
            </div>
        </header>`;
}

function renderFooter() {
    const currentYear = new Date().getFullYear();
    return `
        <footer class="footer-steren">
            <div class="footer-grid">
                <div class="footer-col">
                    <h3 class="footer-toggle" data-target="footer-cat">CATEGORÍAS</h3>
                    <div id="footer-cat" class="footer-content">
                        <ul></ul>
                    </div>
                </div>
                <div class="footer-col">
                    <h3 class="footer-toggle" data-target="footer-shop">ELECTRO SHOP</h3>
                    <div id="footer-shop" class="footer-content">
                        <ul>
                            <li><a href="index.html?page=acerca" data-nav-target="info-page" data-page-id="acerca">Acerca de Nosotros</a></li>
                            <li><a href="index.html?page=tiendas" data-nav-target="info-page" data-page-id="tiendas">Ubicación de Tiendas</a></li>
                            <li><a href="index.html?page=catalogo-digital" data-nav-target="catalogo-digital">Catálogo Digital</a></li>
                            <li><a href="index.html?page=empleo" data-nav-target="info-page" data-page-id="empleo">Únete al equipo</a></li>
                        </ul>
                    </div>
                </div>
                <div class="footer-col">
                    <h3 class="footer-toggle" data-target="footer-politicas">POLÍTICAS</h3>
                    <div id="footer-politicas" class="footer-content">
                        <ul>
                            <li><a href="index.html?page=terminos" data-nav-target="terminos">Términos y Condiciones</a></li>
                            <li><a href="index.html?page=privacidad" data-nav-target="privacidad">Política de Privacidad</a></li>
                            <li><a href="index.html?page=garantias" data-nav-target="garantias">Información de Garantías</a></li>
                        </ul>
                    </div>
                </div>
                <div class="footer-col">
                    <h3 class="footer-toggle" data-target="footer-social">SÍGUENOS</h3>
                    <div id="footer-social" class="footer-content social-links">
                        <a href="https://www.facebook.com/share/1CSZYx3hR9/?mibextid=wwXIfr" class="social-icon" target="_blank" aria-label="Facebook">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                        <a href="https://www.instagram.com/electroshop1650?igsh=bGk3ZWU0YnZ2Y3Z4&utm_source=qr" class="social-icon" target="_blank" aria-label="Instagram">
                            <i class="fab fa-instagram"></i>
                        </a>
                        <a href="https://www.tiktok.com/@electro._shop" class="social-icon" target="_blank" aria-label="TikTok">
                            <i class="fab fa-tiktok"></i>
                        </a>
                    </div>
                </div>
            <div class="footer-bottom">
                <p>&copy; <span>${currentYear}</span> ELECTRO SHOP. Fue creado para un proyecto universitario.</p>
            </div>
        </footer>
    `;
}

    // ===================================================================================================
    //                                  MANEJO DE VISTAS (MAIN CONTENT)
    // ===================================================================================================

    function renderMainContent(page, params = {}) {
        let html = '';
        const title = getPageTitle(page, params);
        document.title = title + " - ELECTRO SHOP";
        
        // Simulación de alerts (que antes venían del modelo)
        const alertHtml = localStorage.getItem('flashAlert') || '';
        if (alertHtml) {
            html += alertHtml;
            localStorage.removeItem('flashAlert');
        }

        switch (page) {
            case 'catalogo':
                html += renderCatalogo(params);
                break;
            case 'detalle-producto':
                html += renderDetalleProducto(params.id);
                break;
            case 'cart':
                html += renderCartView();
                break;
            case 'login':
                html += renderLogin();
                break;
            case 'register':
                html += renderRegister();
                break;
            case 'perfil':
            case 'tarjeta-add':
                html += renderPerfil(params);
                break;
            case 'pedidos':
                html += renderPedidos();
                break;
            case 'pedido-detalle':
                html += renderPedidoDetalle(params.id);
                break;
            case 'terminos':
            case 'privacidad':
            case 'garantias':
            case 'catalogo-digital':
            case 'info-page': // Para Acerca, Tiendas, Empleo
                html += renderInfoPage(page, params);
                break;
            default:
                html += renderCatalogo({});
        }

        return `<main class="container">${html}</main>`;
    }

    // ===================================================================================================
    //                                  FUNCIONES DE VISTA ESPECÍFICAS
    // ===================================================================================================

    // --- CATÁLOGO ---
function renderCatalogo(params) {
    let titulo = 'Catálogo de Productos Eléctricos';
    let productos = PRODUCTOS_GLOBAL;

    if (params.cat) {
        titulo = 'Catálogo: ' + params.cat;
        const categoria = findCategoryByName(params.cat);
        if (categoria) {
            productos = PRODUCTOS_GLOBAL.filter(p => p.categoriaId === categoria.id);
        } else {
            productos = []; // No hay productos para esta categoría si no existe
        }
    } else if (params.q) {
          titulo = 'Resultados de Búsqueda: ' + params.q;
          const query = params.q.toLowerCase();
          productos = PRODUCTOS_GLOBAL.filter(p => 
            p.nombre.toLowerCase().includes(query) || 
            p.modelo.toLowerCase().includes(query)
          );
    }

    let productosHtml = productos.length > 0 ? productos.map(p => `
        <div class="producto-card">
            <a href="index.html?page=detalle-producto&id=${p.id}" data-nav-target="detalle-producto" data-product-id="${p.id}" style="text-decoration: none;">
                <img src="${p.imagenUrl}" alt="Imagen de Producto" style="width:100%; max-height: 150px;">
                <div class="producto-info">
                    <p class="producto-nombre">${p.nombre}</p>
                    <p class="producto-modelo">${p.modelo}</p>
                    <p class="producto-precio">$${p.precio.toFixed(2)}</p>
                    <p class="iva-incluido">IVA Incluido</p>
                </div>
            </a>
            <form data-form-type="add-to-cart">
                <input type="hidden" name="productoId" value="${p.id}">
                <button type="submit" class="btn-comprar">Añadir al Carrito</button>
            </form>
        </div>
    `).join('') : `
        <div style="grid-column: 1 / -1; text-align: center; padding: 50px;">
            <p>No contamos con ese producto</p>
        </div>
    `;

    return `
        <h1>${titulo}</h1>
        <div class="productos-grid">
            ${productosHtml}
        </div>
    `;
}

    // --- DETALLE DE PRODUCTO ---
    function renderDetalleProducto(id) {
        const producto = findProductById(id);
        if (!producto) return '<h1>Producto no encontrado</h1>';

        const categoria = CATEGORIAS_GLOBAL.find(c => c.id === producto.categoriaId);

        return `
            <h1 style="margin-top: 20px; font-size: 1.8em;">${producto.nombre}</h1>
            <hr>
            <div class="detalle-container">
                <div class="detalle-img">
                    <img src="${producto.imagenUrl}" alt="${producto.nombre}" style="max-width: 100%; border: 1px solid #ddd;">
                </div>
                <div class="detalle-info">
                    <p class="precio-grande">$${producto.precio.toFixed(2)}</p>
                    <h3 style="font-size: 1.2em;">Descripción del Producto:</h3>
                    <p class="detalle-desc">${producto.descripcion}</p>
                    <div class="modelo-stock">
                        <p><strong>Modelo:</strong> <span>${producto.modelo}</span></p>
                        <p><strong>Categoría:</strong> <span>${categoria ? categoria.nombre : 'N/A'}</span></p>
                        <p><strong>Stock Disponible:</strong> <span>${producto.stock}</span> unidades</p>
                    </div>
                    <form data-form-type="add-to-cart" class="add-to-cart-detail-form">
                        <input type="hidden" name="productoId" value="${producto.id}">
                        <input type="number" name="cantidad" value="1" min="1">
                        <button type="submit" class="btn-comprar">Añadir al Carrito</button>
                    </form>
                </div>
            </div>
        `;
    }

    // --- CARRITO DE COMPRAS ---
    function renderCartView() {
        if (!appState.cart || appState.cart.length === 0) {
            return `
                <div class="cart-container">
                    <p class="empty-cart-message">Tu carrito está vacío. ¡Explora nuestros
                        <a href="index.html" data-nav-target="catalogo" class="link-productos">productos</a>!
                    </p>
                </div>`;
        }

        const itemsHtml = appState.cart.map(item => {
            const producto = findProductById(item.productoId);
            if (!producto) return ''; // Manejar producto no encontrado

            const totalItem = producto.precio * item.cantidad;

            return `
                <div class="cart-item-card" data-product-id="${item.productoId}">
                    <div class="cart-item-image">
                        <img src="${producto.imagenUrl}" alt="Producto" class="product-thumbnail">
                    </div>
                    <div class="cart-item-info">
                        <div class="product-code">${producto.modelo}</div>
                        <h4 class="product-title">${producto.nombre}</h4>
                        <div class="quantity-controls-wrapper">
                            <div class="quantity-selector">
                                <button type="button" data-cart-action="decrease" data-product-id="${item.productoId}" class="qty-btn minus">-</button>
                                <span class="qty-display">${item.cantidad}</span>
                                <button type="button" data-cart-action="increase" data-product-id="${item.productoId}" class="qty-btn plus">+</button>
                            </div>
                        </div>
                        <div class="discount-badge">IVA Incluido</div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="item-total-price">$${totalItem.toFixed(2)}</div>
                        <button type="button" data-cart-action="remove" data-product-id="${item.productoId}" class="remove-product-btn">
                            Eliminar
                        </button>
                    </div>
                </div>`;
        }).join('');

        const total = appState.cart.reduce((sum, item) => {
            const producto = findProductById(item.productoId);
            return sum + (producto ? producto.precio * item.cantidad : 0);
        }, 0);

        const tarjetas = appState.isLoggedIn ? appState.usuario.tarjetas : [];
        const tarjetasHtml = tarjetas.map(t => `
            <div class="radio-card-option">
                <input type="radio" name="tarjetaId"
                        id="card-${t.id}"
                        value="${t.id}" required>
                <label for="card-${t.id}">
                    <i class="fab fa-cc-visa" style="display:${t.tipo === 'VISA' ? 'inline' : 'none'}"></i>
                    <i class="fab fa-cc-mastercard" style="display:${t.tipo === 'MASTERCARD' ? 'inline' : 'none'}"></i>
                    <i class="fas fa-credit-card" style="display:${t.tipo !== 'VISA' && t.tipo !== 'MASTERCARD' ? 'inline' : 'none'}"></i>
                    <span class="card-text-type">${t.tipo}</span>
                    <span class="card-text-digits">**** <span>${t.digitosFinales}</span></span>
                    <span class="card-text-expiry">
                        Vence: <span>${t.fechaVencimiento}</span>
                    </span>
                </label>
            </div>
        `).join('');

        const isCardEmpty = tarjetas.length === 0;

        return `
            <main class="cart-container">
                <div class="delivery-options-card">
                    <h3 class="delivery-title">Elige como quieres recibir tu pedido</h3>
                    <div class="delivery-buttons-container">
                        <button class="delivery-option-btn active">Recoge en tienda</button>
                        <button class="delivery-option-btn">Recibe a domicilio</button>
                    </div>
                </div>

                <div class="cart-items-wrapper">${itemsHtml}</div>

                <div class="payment-method-selection">
                    <h2 class="payment-section-title">Seleccionar Método de Pago</h2>
                    ${appState.isLoggedIn ? (isCardEmpty ? `
                        <div class="no-cards-alert">
                            Aún no tienes tarjetas guardadas.
                            <a href="index.html?page=perfil&view=tarjeta-add" data-nav-target="tarjeta-add">Añadir una tarjeta</a> para pagar.
                        </div>` : `
                        <form id="checkoutForm" data-form-type="checkout">${tarjetasHtml}</form>
                    `) : `<div class="no-cards-alert">
                            Necesitas <a href="index.html?page=login" data-nav-target="login">Iniciar Sesión</a> para seleccionar un método de pago.
                          </div>`}
                </div>

                <div class="cart-summary-card">
                    <div class="total-section">
                        <div class="subtotal-line">
                            <span class="total-label">Subtotal:</span>
                            <span class="total-amount">$${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="checkout-buttons">
                        <button 
                            type="button"
                            id="btn-pagar-ahora"
                            class="btn-pagar-ahora"
                            ${!appState.isLoggedIn || isCardEmpty ? 'disabled' : ''}>
                            PAGAR AHORA
                        </button>
                        ${!appState.isLoggedIn ? `<p class="no-card-warning">Debes iniciar sesión para pagar.</p>` : (isCardEmpty ? `<p class="no-card-warning">Debe añadir una tarjeta para poder pagar.</p>` : '')}
                        <a href="index.html" data-nav-target="catalogo" class="secondary-checkout-btn">
                            Seguir Comprando
                        </a>
                    </div>
                </div>
            </main>
        `;
    }

    // --- LOGIN ---
    function renderLogin() {
        return `
            <main class="container centered-view">
                <div class="login-container">
                    <h1>Iniciar Sesión</h1>
                    <div id="login-error-alert" class="alert alert-danger" style="display:none;"></div>
                    <form id="login-form" data-form-type="login">
                        <div class="form-group">
                            <label for="username">Email</label>
                            <input type="text" id="username" name="username" class="form-control" value="test@example.com" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Contraseña</label>
                            <input type="password" id="password" name="password" class="form-control" value="password" required>
                        </div>
                        <button type="submit" class="btn-login">Entrar</button>
                    </form>
                    <div class="register-link">
                        <p>¿No tienes una cuenta? <a href="index.html?page=register" data-nav-target="register">Regístrate aquí</a></p>
                    </div>
                </div>
            </main>
        `;
    }

    // --- REGISTER ---
    function renderRegister() {
        return `
            <main class="container centered-view">
                <div class="login-container">
                    <h1>Crear Nueva Cuenta</h1>
                    <div id="register-error-alert" class="alert alert-danger" style="display:none;"></div>
                    <form id="register-form" data-form-type="register">
                        <div class="form-group">
                            <label for="nombre">Nombre Completo</label>
                            <input type="text" id="nombre" name="nombre" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Contraseña</label>
                            <input type="password" id="password" name="password" class="form-control" required>
                        </div>
                        <button type="submit" class="btn-login">Registrarse</button>
                    </form>
                    <div class="login-link">
                        ¿Ya tienes una cuenta? <a href="index.html?page=login" data-nav-target="login">Inicia sesión aquí</a>
                    </div>
                </div>
            </main>
        `;
    }
    
// --- PERFIL (Incluye Añadir Tarjeta) ---
function renderPerfil(params) {
    if (!appState.isLoggedIn) {
        setFlashAlert('error', 'Debes iniciar sesión para ver tu perfil.');
        appState.currentPage = 'login';
        return renderLogin();
    }

    const usuario = appState.usuario;
    const tarjetas = usuario.tarjetas;

    const isAddCardView = params.view === 'tarjeta-add';

    if (isAddCardView) {
        // (Código para añadir tarjeta — no modificado en este bloque)
        return `
        <main class="container">
            <div class="login-container">
                <h1 class="login-title">Añadir Tarjeta</h1>
                <div id="card-add-error" class="alert alert-danger" style="display:none;"></div>
                <form id="add-card-form" data-form-type="add-card">
                    <div class="form-group">
                        <label for="numero">Número de Tarjeta</label>
                        <input type="text" id="numero" name="numero" class="form-control"
                               placeholder="XXXX XXXX XXXX 1234" maxlength="16" required>
                    </div>
                    <div style="display: flex; gap: 20px;">
                        <div class="form-group" style="flex: 1;">
                            <label for="vencimiento">Vencimiento (MM/AA)</label>
                            <input type="text" id="vencimiento" name="vencimiento" class="form-control"
                                   placeholder="MM/AA" maxlength="5" required>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label for="cvv">CVV</label>
                            <input type="text" id="cvv" name="cvv" class="form-control"
                                   placeholder="123" maxlength="4" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="titular">Nombre del Titular</label>
                        <input type="text" id="titular" name="titular" class="form-control" required>
                    </div>
                    <button type="submit" class="btn-login">Guardar Tarjeta</button>
                </form>
                <div class="register-link">
                    <a href="index.html?page=perfil" data-nav-target="perfil">← Volver al Perfil</a>
                </div>
            </div>
        </main>
        `;
    }

    // Vista de Perfil Principal
    const tarjetasHtml = tarjetas.length > 0 ? tarjetas.map(t => `
        <div class="card-item" data-card-id="${t.id}">
            <div class="card-info">
                <i class="fab fa-cc-visa" style="display:${t.tipo === 'VISA' ? 'inline' : 'none'}"></i>
                <i class="fab fa-cc-mastercard" style="display:${t.tipo === 'MASTERCARD' ? 'inline' : 'none'}"></i>
                <i class="fas fa-credit-card" style="display:${t.tipo !== 'VISA' && t.tipo !== 'MASTERCARD' ? 'inline' : 'none'}"></i>
                <span class="card-text">
                    <strong>${t.tipo}</strong>
                    **** <span>${t.digitosFinales}</span>
                    <span class="card-expiry">(Vence: <span>${t.fechaVencimiento}</span>)</span>
                </span>
            </div>
            <button type="button" class="btn-delete-card" onclick="abrirModalEliminar(${t.id})" title="Eliminar tarjeta">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `).join('') : '<div class="alert alert-info"><p>No tienes tarjetas guardadas.</p></div>';

    return `
        <main class="container">
            <div class="login-container">
                <h1 class="login-title">Mi Perfil</h1>
                <div id="profile-alert" class="alert alert-success" style="display:none;"></div>

                <img src="images/images/usuario-logo.png" alt="Usuario" class="user-icon-img">

                <div class="profile-section">
                    <h2><i class="fas fa-user-circle"></i> Información Personal</h2>
                    <form data-form-type="update-nombre">
                        <div class="form-group"> 
                            <label for="nombre">Nombre:</label>
                            <input type="text" id="nombre" name="nombre" class="form-control"
                                   value="${usuario.nombre}" required> 
                            <button type="submit" class="btn-sm btn-blue btn-profile-action">Guardar Nombre</button>
                        </div>
                        <div class="form-group email-display-group">
                            <label>Email:</label>
                            <p><strong>${usuario.email}</strong></p>
                        </div>
                    </form>
                </div>

                <div class="profile-section">
                    <h2><i class="fas fa-envelope"></i> Cambiar Correo Electrónico</h2>
                    <form data-form-type="cambiar-email">
                        <div class="form-group">
                            <label for="nuevoEmail">Nuevo Correo Electrónico:</label>
                            <input type="email" id="nuevoEmail" name="nuevoEmail" class="form-control"
                                   value="${usuario.email}" required>
                            <button type="submit" class="btn-sm btn-blue btn-profile-action">Actualizar Email</button>
                            <p class="info-text-small">
                                *Al cambiar tu correo, se cerrará tu sesión por seguridad.
                            </p>
                        </div>
                    </form>
                </div>

                <div class="profile-section">
                    <h2><i class="fas fa-lock"></i> Seguridad</h2>
                    <form data-form-type="cambiar-password">
                        <div class="form-group">
                            <label for="currentPassword">Contraseña Actual:</label>
                            <input type="password" id="currentPassword" name="currentPassword"
                                   class="form-control" required placeholder="Ingresa tu contraseña actual">
                        </div>
                        <div class="form-group">
                            <label for="newPassword">Nueva Contraseña:</label>
                            <input type="password" id="newPassword" name="newPassword"
                                   class="form-control" required placeholder="Ingresa la nueva contraseña">
                            <button type="submit" class="btn-sm btn-blue btn-profile-action">Actualizar Contraseña</button>
                        </div>
                    </form>
                </div>

                <div class="profile-section">
                    <h2><i class="fas fa-credit-card"></i> Métodos de Pago</h2>
                    <div class="add-card-btn-container">
                        <a href="index.html?page=perfil&view=tarjeta-add" data-nav-target="tarjeta-add" class="btn-primary btn-blue btn-add-card">
                            + Añadir Nueva Tarjeta
                        </a>
                    </div>
                    <div class="card-list">${tarjetasHtml}</div>
                </div>

                <div class="register-link back-link">
                    <a href="index.html" data-nav-target="catalogo">← Volver al Inicio</a>
                </div>
            </div>
        </main>
        <div id="modalEliminar" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-icon"><i class="fas fa-exclamation-circle"></i></div>
                <h3>¿Eliminar Tarjeta?</h3>
                <p class="modal-text">Esta acción no se puede deshacer.<br>¿Estás seguro de que deseas continuar?</p>
                <div class="modal-buttons">
                    <button type="button" onclick="cerrarModal()" class="btn-modal-cancel">Cancelar</button>
                    <form data-form-type="delete-card" id="formEliminarTarjeta" style="margin:0;">
                        <input type="hidden" name="tarjetaId" id="inputTarjetaId">
                        <button type="submit" class="btn-modal-confirm">Sí, Eliminar</button>
                    </form>
                </div>
            </div>
        </div>
    `;
}

    // --- PEDIDOS (Detalle) ---
    function renderPedidoDetalle(id) {
        if (!appState.isLoggedIn) {
            setFlashAlert('error', 'Debes iniciar sesión para ver los detalles del pedido.');
            appState.currentPage = 'login';
            return renderLogin();
        }

        const pedido = appState.pedidos.find(p => p.id === id);
        if (!pedido) return '<h1>Pedido no encontrado</h1>';

        const detallesHtml = pedido.detalles.map(d => `
            <tr>
                <td><img src="${d.imagenUrl}" alt="Imagen de Producto" class="product-img"></td>
                <td>${d.nombreProducto}</td>
                <td>${d.modeloProducto}</td>
                <td>${d.cantidad}</td>
                <td>$${d.precioUnitario.toFixed(2)}</td>
                <td>$${(d.precioUnitario * d.cantidad).toFixed(2)}</td>
            </tr>
        `).join('');

        const canCancel = pedido.estado === 'PENDIENTE';
        const canArchive = !pedido.archivado && pedido.estado !== 'PENDIENTE';

        return `
            <a href="index.html?page=pedidos" data-nav-target="pedidos" class="btn btn-secondary mb-3"><i class="fas fa-arrow-left"></i> Volver a Mis Pedidos</a>
            <h1 style="margin-top: 20px;">Detalle del Pedido #${pedido.id}</h1>
            <div class="row" style="display:flex; gap: 20px;">
                <div class="col-md-8" style="flex: 2;">
                    <div class="detail-card">
                        <h2>Productos en la Orden</h2>
                        <table class="product-table">
                            <thead>
                            <tr>
                                <th></th>
                                <th>Producto</th>
                                <th>Modelo</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th>Subtotal</th>
                            </tr>
                            </thead>
                            <tbody>${detallesHtml}</tbody>
                        </table>
                    </div>
                </div>
                <div class="col-md-4" style="flex: 1;">
                    <div class="detail-card">
                        <h2>Resumen y Estado</h2>
                        <p><strong>ID de Pedido:</strong> <span>${pedido.id}</span></p>
                        <p><strong>Fecha:</strong> <span>${pedido.fechaCreacion}</span></p>
                        <p><strong>Estado Actual:</strong>
                            <span class="status-badge-detail status-${pedido.estado}">
                                ${pedido.estado}
                            </span>
                        </p>
                        <div class="summary-box mt-4">
                            <p>Subtotal: <span>$${pedido.montoTotal.toFixed(2)}</span></p>
                            <p>Envío: <span>$0.00</span></p>
                            <p class="total-line">Total: <span>$${pedido.montoTotal.toFixed(2)}</span></p>
                        </div>
                        <div class="action-buttons">
                            ${canCancel ? `
                                <button type="button" data-form-type="cancel-pedido" data-pedido-id="${pedido.id}" class="btn-cancel">
                                    <i class="fas fa-times"></i> Cancelar Pedido
                                </button>
                            ` : ''}
                            ${canArchive ? `
                                <button type="button" class="btn-archive" id="openArchiveModal" data-pedido-id="${pedido.id}">
                                    <i class="fas fa-archive"></i> Archivar
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
            <div id="archiveModal" class="modal">
                <div class="modal-content archive-modal-content">
                    <span class="close-button">&times;</span>
                    <div class="modal-icon"><i class="fas fa-archive"></i></div>
                    <h2>¿Archivar Pedido?</h2>
                    <p>Archivar este pedido lo ocultará de la lista principal de pedidos activos. Puedes encontrarlo en tu historial de pedidos archivados.</p>
                    <div class="modal-buttons">
                        <button class="btn-modal-cancel">Cancelar</button>
                        <button type="button" data-form-type="archive-pedido" data-pedido-id="${pedido.id}" class="btn-modal-confirm-archive">Sí, Archivar</button>
                    </div>
                </div>
            </div>
        `;
    }


    // --- PÁGINAS INFORMATIVAS (Términos, Privacidad, etc.) ---
    function renderInfoPage(page, params) {
        let content = getInfoPageContent(page, params.page);
        
        return `
            <div class="info-page-container">
                <div class="info-page-header">
                    <h1>${content.pageHeader}</h1>
                    <p class="intro-text">${content.introText}</p>
                </div>
                <div class="info-content">
                    ${content.htmlContent}
                </div>
                <div class="back-to-home">
                    <a href="index.html" data-nav-target="catalogo" class="btn-back">← Volver al Inicio</a>
                </div>
            </div>
        `;
    }

    // Función que contiene el contenido de las páginas informativas (sustituyendo las variables Thymeleaf)
function getInfoPageContent(page, subPage) {
    const year = new Date().getFullYear();
    let htmlContent = '';
    let header = '';
    let intro = '';

    // Usamos el 'page' o 'subPage' para determinar qué contenido mostrar.
    const currentPage = subPage || page;

    if (currentPage === 'terminos') {
        header = 'Términos y Condiciones';
        intro = 'Este documento establece el marco legal y las reglas obligatorias aplicables a todo usuario que navegue o realice compras dentro del sitio web de ELECTRO SHOP.';
        htmlContent = `
            <h3 class="titulo-seccion">I. Aceptación y Alcance</h3>
            <p class="content-paragraph">El presente documento establece los Términos y Condiciones (T&amp;C) que rigen el uso del sitio web de <strong>ELECTRO SHOP</strong>, una empresa 100% mexicana dedicada a proveer soluciones en material eléctrico, iluminación y tecnología.</p>
            <p class="content-paragraph">Al utilizar este portal, el usuario manifiesta su aceptación y sujeción a todas las disposiciones contenidas en estos T&amp;C. Si el usuario no está de acuerdo con ellos, deberá abstenerse inmediatamente de continuar utilizando el sitio.</p>
            <h3 class="titulo-seccion">II. Uso del Sitio Web y Cuenta de Usuario</h3>
            <p class="content-paragraph"><strong>Registro:</strong> Para realizar una compra, el usuario puede crear una cuenta proporcionando datos verídicos y actualizados. Será responsabilidad del usuario mantener la confidencialidad de su contraseña y restringir el acceso a su equipo. ELECTRO SHOP no se hace responsable por el uso no autorizado de la cuenta si el usuario no ejerció la debida diligencia.</p>
            <p class="content-paragraph"><strong>Conducta:</strong> El usuario se compromete a no utilizar el sitio para actividades ilegales o que vulneren los derechos de terceros. Se prohíbe la extracción o copia de contenido para reventa o uso comercial sin autorización expresa de ELECTRO SHOP.</p>
            <h3 class="titulo-seccion">III. Condiciones de Compra, Precios y Existencias</h3>
            <p class="content-paragraph"><strong>Moneda y Precios:</strong> Todos los precios publicados están en Pesos Mexicanos (MXN) e incluyen el IVA. Los precios no incluyen gastos de envío ni seguros, excepto cuando se indique lo contrario.</p>
            <p class="content-paragraph"><strong>Confirmación de Pedido:</strong> Un pedido se considera <em>confirmado</em> únicamente cuando ELECTRO SHOP valida el pago y envía una confirmación electrónica al cliente.</p>
            <p class="content-paragraph"><strong>Disponibilidad:</strong> La disponibilidad de productos (como cables, contactos y focos LED) se muestra en tiempo real, pero puede variar. En caso de indisponibilidad posterior al pago, ELECTRO SHOP notificará al cliente para ofrecer:
            <br>• Sustitución por un producto similar,
            <br>• o el reembolso total del importe pagado.</p>
            <h3 class="titulo-seccion">IV. Limitación de Responsabilidad y Advertencia</h3>
            <p class="content-paragraph"><strong>Naturaleza de los Productos:</strong> Los productos comercializados por ELECTRO SHOP son materiales eléctricos que requieren conocimientos técnicos para su correcta instalación y manejo.</p>
            <p class="content-paragraph"><strong>Deslinde:</strong> ELECTRO SHOP se deslinda de toda responsabilidad por daños materiales, personales o a terceros derivados de:
            <br>• incorrecta instalación,
            <br>• manipulación inadecuada,
            <br>• uso indebido de los productos,
            <br>incluyendo cortocircuitos, variaciones de voltaje o accidentes eléctricos,
            <br>cuando estos no hayan sido instalados por personal calificado o sin seguir las normativas vigentes.</p>
        `;
    } else if (currentPage === 'privacidad') {
        header = 'Política de Privacidad';
        intro = 'Esta política tiene como objetivo cumplir con la normativa legal vigente en México y generar confianza al informar claramente cómo recopilamos, utilizamos y protegemos los datos personales de nuestros clientes.';
        htmlContent = `
            <h3 class="titulo-seccion">I. Identidad y Domicilio del Responsable</h3>
            <p class="content-paragraph">El responsable del tratamiento y protección de sus datos personales es <strong>ELECTRO SHOP</strong>, una marca perteneciente a <strong>electroshop</strong>, con domicilio para oír y recibir notificaciones en <strong>Predio Tetenco, Colonia Centro, en el pueblo de San Miguel Topilejo, Tlalpan, CDMX</strong>.</p>
            <h3 class="titulo-seccion">II. Datos Personal Recabados</h3>
            <p class="content-paragraph">ELECTRO SHOP recaba los siguientes datos personales con el propósito de operar correctamente nuestro servicio de comercio electrónico:</p>
            <p class="content-paragraph"><strong>Identificación y Contacto:</strong> Nombre completo, correo electrónico y número de teléfono.</p>
            <p class="content-paragraph"><strong>Domiciliación:</strong> Dirección completa de envío y, en caso necesario, datos fiscales para facturación.</p>
            <p class="content-paragraph"><strong>Datos de Navegación:</strong> Información sobre su actividad dentro del sitio, tal como historial de pedidos, contenido del carrito y preferencias de navegación.</p>
            <h3 class="titulo-seccion">V. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)</h3>
            <p class="content-paragraph">Usted tiene derecho a:</p>
            <p class="content-paragraph">• Acceder a sus datos personales.<br>• Rectificarlos si son inexactos o están desactualizados.<br>• Cancelarlos si considera que no son necesarios para las finalidades previstas.<br>• Oponerse al tratamiento cuando existan causas legítimas.</p>
            <p class="content-paragraph">Para ejercer cualquiera de estos derechos ARCO, deberá enviar una solicitud formal a: <strong>privacidad@electroshop.com</strong></p>
            <div class="legal-notice">
                <h3>📞 Contacto para Ejercer Derechos ARCO</h3>
                <p>Para acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales, contacta a nuestro Departamento de Privacidad:</p>
                <p><strong>Email:</strong> privacidad@electroshop.com</p>
                <p><strong>Teléfono:</strong> (55) 1234-5678</p>
            </div>
        `;
    } else if (currentPage === 'garantias') {
        header = 'Información de Garantías';
        intro = 'La Póliza de Garantía es el documento contractual que respalda la calidad de los productos electrónicos básicos vendidos por ElectroShop. En cumplimiento con la normativa, esta póliza es clara, accesible y garantiza al consumidor la protección de sus derechos.';
        htmlContent = `
            <h3 class="titulo-seccion">I. Alcance y Vigencia de la Garantía</h3>
            <p class="content-paragraph"><strong>1. Vigencia Mínima Legal:</strong> Todo producto electrónico vendido por ElectroShop cuenta con una garantía mínima legal de 90 días naturales contra defectos de fabricación o fallas ocultas, contados a partir de la recepción del producto por parte del consumidor. Cualquier extensión adicional será indicada en la póliza particular del producto.</p>
            <p class="content-paragraph"><strong>2. Identificación del Responsable:</strong> La póliza debe especificar claramente el nombre, domicilio y datos de contacto de ElectroShop como proveedor responsable.</p>
            <h3 class="titulo-seccion">II. Procedimiento para Hacer Válida la Garantía</h3>
            <p class="content-paragraph">Si un producto adquirido en ElectroShop presenta una falla durante la vigencia de la garantía, el consumidor tiene derecho a contactar de inmediato al proveedor para solicitar su aplicación.</p>
            <p class="content-paragraph">El consumidor podrá ejercer su derecho de garantía en el domicilio donde adquirió el bien o en cualquier otro lugar especificado en la póliza correspondiente.</p>
            <div class="contact-info">
                <h3>🔧 Servicio de Garantías</h3>
                <p>Para procesar tu garantía, comunícate con nuestro centro de servicio:</p>
                <p><strong>Teléfono:</strong> (55) 8765-4321</p>
                <p><strong>Email:</strong> garantias@electroshop.com</p>
            </div>
        `;
    } else if (currentPage === 'catalogo-digital') {
        header = 'Catálogo Digital de Productos Eléctricos';
        intro = 'Explore la Colección Completa de Material Eléctrico Esencial y la información técnica que garantiza su seguridad y confianza.';
        htmlContent = `
            <h3 class="section-subtitle">Funcionalidades Clave de Nuestro Catálogo</h3>
            <h4 class="section-sub-title">1. Búsqueda y Navegación Interactiva (Online)</h4>
            <p class="content-paragraph">Puede consultar la versión dinámica y actualizada de todo nuestro inventario directamente en la sección principal de la tienda.</p>
            <h4 class="section-sub-title">2. Información Detallada del Producto</h4>
            <p class="content-paragraph">Aunque nuestro sitio web es la herramienta principal para la compra, la versión digital le garantiza que cada producto, desde un Foco LED A19 hasta un Panel Solar Monocristalino, cuenta con:</p>
            <p class="content-paragraph"><strong>Descripciones Claras:</strong> Detalles sobre el uso y las aplicaciones típicas de cada material.</p>
            <h4 class="section-sub-title">3. Descarga para Consulta Offline (PDF)</h4>
            <p class="content-paragraph">Para mayor comodidad en obra o en sitios con baja conexión, puede descargar el archivo PDF que incluye la información consolidada de nuestra oferta actual. Esto garantiza que tenga acceso a los detalles y especificaciones técnicas de todos nuestros productos sin necesidad de estar conectado.</p>
            <div class="download-section">
                <a href="docs/catalogo-electroshop.pdf" download="Catalogo-ElectroShop-${year}.pdf" class="btn-action btn-back">
                    Descargar (PDF) (Simulado)
                </a>
            </div>
        `;
    } else if (currentPage === 'acerca') {
        header = 'Acerca de Nosotros';
        intro = 'ELECTRO SHOP: Su socio de confianza en soluciones eléctricas.';
        htmlContent = `
            <h3 class="titulo-seccion">Misión</h3>
            <p>Ofrecer productos eléctricos de alta calidad y tecnología a precios competitivos, garantizando la seguridad y satisfacción total de nuestros clientes.</p>
            <h3 class="titulo-seccion">Visión</h3>
            <p>Ser la plataforma de comercio electrónico líder en material eléctrico, reconocida por su servicio excepcional y su catálogo completo y actualizado.</p>
            <p class="content-paragraph">Somos una empresa 100% mexicana dedicada a proveer soluciones en material eléctrico, iluminación y tecnología.</p>
        `;
    } else if (currentPage === 'tiendas') {
        header = 'Ubicación de Tiendas';
        intro = 'Encuentra tu tienda ELECTRO SHOP más cercana.';
        htmlContent = `
            <div class="store-hours">
                <h3>📅 Horario de Atención</h3>
                <p><strong>Lunes a Viernes:</strong> 9:00 AM - 6:00 PM</p>
                <p><strong>Sábados:</strong> 9:00 AM - 2:00 PM</p>
                <p><strong>Domingos:</strong> Cerrado</p>
            </div>
            <div class="store-info">
                <h3>📍 Tienda Principal - CDMX</h3>
                <p><strong>Dirección:</strong> Predio Tetenco, Colonia Centro, San Miguel Topilejo, Tlalpan, CDMX.</p>
                <p><strong>Teléfono:</strong> (55) 1234-5678</p>
            </div>
        `;
    } else if (currentPage === 'empleo') {
        header = 'Únete al equipo';
        intro = '¡Estamos buscando talento! Desarrolla tu carrera en el sector eléctrico.';
        htmlContent = `
            <p>Valoramos la pasión por la innovación y el compromiso con el servicio al cliente.</p>
            <div class="contact-info">
                <h3>📧 Envía tu CV</h3>
                <p>Envía tu curriculum vitae a:</p>
                <p><strong>Email:</strong> recursos.humanos@electroshop.com</p>
                <p><strong>Asunto:</strong> "Aplicación - [Puesto de interés]"</p>
            </div>
        `;
    } else if (page === 'catalogo') {
        // El catálogo principal no tiene un "content page", es la vista de productos
        header = 'Catálogo Principal';
        intro = 'Explora nuestros productos de material eléctrico e iluminación.';
        htmlContent = '';
    } else {
        header = 'Página No Encontrada';
        intro = 'La información que buscas no está disponible.';
        htmlContent = '';
    }

    return {
        pageHeader: header,
        introText: intro,
        htmlContent: htmlContent
    };
}
    
    // ===================================================================================================
    //                             MANEJO DE EVENTOS (Navegación y Lógica)
    // ===================================================================================================

// --- MANEJO DE NAVEGACIÓN (Para simular las rutas de Thymeleaf) ---
function navigate(e) {
    e.preventDefault(); // Detenemos la acción por defecto del enlace (el reload)
    const target = e.currentTarget;
    const page = target.getAttribute('data-nav-target');
    
    // Limpiar parámetros anteriores
    appState.currentParams = {};

    if (page === 'catalogo') {
        appState.currentParams.cat = target.getAttribute('data-cat-name');
        appState.currentParams.q = target.getAttribute('data-search-query') || new URLSearchParams(window.location.search).get('q');
    } else if (page === 'detalle-producto') {
        appState.currentParams.id = parseInt(target.getAttribute('data-product-id'));
    } else if (page === 'pedido-detalle') {
        appState.currentParams.id = parseInt(target.getAttribute('data-pedido-id'));
    } else if (page === 'info-page') {
        appState.currentParams.page = target.getAttribute('data-page-id');
    } else if (page === 'tarjeta-add') {
          appState.currentParams.view = 'tarjeta-add';
    } else if (page === 'terminos' || page === 'privacidad' || page === 'garantias' || page === 'catalogo-digital') {
          appState.currentParams.page = page; // Usamos la página como parámetro de info-page
    }

    appState.currentPage = page;
    
    // Simulación de URL en entorno local: Usamos index.html?page=TARGET
    let newPath = 'index.html';
    
    // Usamos el patrón index.html?page=PAGE&param=VALUE
    let queryParams = [];
    
    // Si la página NO es catálogo base, incluimos el parámetro 'page'
    if (appState.currentPage !== 'catalogo' || appState.currentParams.cat || appState.currentParams.q) {
        queryParams.push(`page=${appState.currentPage}`);
    }
    
    // Agregamos parámetros de filtrado si existen
    if (appState.currentParams.cat) {
        queryParams.push(`cat=${appState.currentParams.cat}`);
    } else if (appState.currentParams.q) {
        queryParams.push(`q=${appState.currentParams.q}`);
    }
    
    // Parámetros de vista o ID
    if (appState.currentParams.view) {
        queryParams.push(`view=${appState.currentParams.view}`);
    }
    if (appState.currentParams.id) {
        queryParams.push(`id=${appState.currentParams.id}`);
    }
    
    // Construir la URL final solo si hay parámetros
    if (queryParams.length > 0) {
        newPath += `?${queryParams.join('&')}`;
    }
    
    history.pushState(appState, '', newPath); // Usamos la URL limpia para el historial

    renderPage();
}
    
    // Adjuntar listeners de navegación global
    function attachGlobalListeners() {
        document.querySelectorAll('[data-nav-target]').forEach(link => {
            link.removeEventListener('click', navigate); // Evitar duplicados
            link.addEventListener('click', navigate);
        });

        // Search Form (Simulación de búsqueda)
        const searchForm = document.getElementById('search-form');
        if (searchForm) {
            searchForm.removeEventListener('submit', handleSearch);
            searchForm.addEventListener('submit', handleSearch);
        }
        
        // Logout Button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.removeEventListener('click', handleLogout);
            logoutBtn.addEventListener('click', handleLogout);
        }
        
        // Footer Accordion (Tu JS original)
        const footerToggles = document.querySelectorAll('.footer-toggle');
        footerToggles.forEach(toggle => {
            toggle.removeEventListener('click', handleFooterToggle);
            toggle.addEventListener('click', handleFooterToggle);
        });

        // Menu Toggle (Tu JS original)
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.removeEventListener('click', handleMenuToggle);
            menuToggle.addEventListener('click', handleMenuToggle);
        }

        // User Menu Toggle (Tu JS original)
        const userMenuTrigger = document.getElementById('user-menu-trigger');
        if (userMenuTrigger) {
             userMenuTrigger.removeEventListener('click', handleUserMenuToggle);
             userMenuTrigger.addEventListener('click', handleUserMenuToggle);
             // Listener para cerrar al hacer clic fuera
             window.removeEventListener('click', closeUserMenuOnClickOutside);
             window.addEventListener('click', closeUserMenuOnClickOutside);
             // Listener para evitar cierre al hacer clic dentro
             const userMenuDropdown = document.getElementById('user-menu-dropdown');
             if (userMenuDropdown) {
                 userMenuDropdown.removeEventListener('click', stopPropagation);
                 userMenuDropdown.addEventListener('click', stopPropagation);
             }
        }
        
        // Manejo de Alerts (Tu JS original)
        const flashAlert = document.querySelector('.alert-success, .alert-danger, .alert-info');
        if (flashAlert) {
            handleFlashAlert(flashAlert);
        }
    }
    
    // --- MANEJO DE EVENTOS (FORMULARIOS) ---
    function attachFormListeners() {
        document.querySelectorAll('form[data-form-type]').forEach(form => {
            const formType = form.getAttribute('data-form-type');
            form.removeEventListener('submit', handleFormSubmit); // Evitar duplicados
            form.addEventListener('submit', (e) => handleFormSubmit(e, formType));
        });
        
        // Botón Pagar Ahora (fuera del form en cart-view.html)
        const pagarBtn = document.getElementById('btn-pagar-ahora');
        if (pagarBtn) {
             pagarBtn.removeEventListener('click', handleCheckout);
             pagarBtn.addEventListener('click', handleCheckout);
        }
    }
    
    // ===================================================================================================
    //                                  LÓGICA DE SIMULACIÓN DE BACKEND
    // ===================================================================================================

    // --- A. SESIÓN Y PERFIL ---
    function handleLogin(form) {
        // Simulación: Aceptar solo las credenciales de prueba
        const email = form.username.value;
        const password = form.password.value;

        if (email === 'test@example.com' && password === 'password') {
            appState.isLoggedIn = true;
            appState.usuarioNombre = 'Usuario de Prueba';
            appState.usuarioEmail = email;
            
            // Persistir la sesión
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('usuarioNombre', appState.usuarioNombre);
            localStorage.setItem('usuarioEmail', appState.usuarioEmail);
            
            setFlashAlert('success', `¡Bienvenido de nuevo, ${appState.usuarioNombre}!`);
            
            // Navegar a catálogo
            appState.currentPage = 'catalogo';
            history.pushState(appState, '', 'index.html'); // CORREGIDO: Redirigir a index
            renderPage();

        } else {
            // Mostrar error localmente
            const errorEl = document.getElementById('login-error-alert');
            if (errorEl) {
                errorEl.textContent = 'Email o contraseña incorrectos. Por favor, inténtelo de nuevo.';
                errorEl.style.display = 'block';
            }
        }
    }
    
    function handleLogout() {
        appState.isLoggedIn = false;
        appState.usuarioNombre = 'Invitado';
        appState.usuarioEmail = '';
        
        // Limpiar persistencia
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('usuarioNombre');
        localStorage.removeItem('usuarioEmail');

        setFlashAlert('success', '¡Has cerrado sesión correctamente!');
        
        // Navegar a catálogo
        appState.currentPage = 'catalogo';
        history.pushState(appState, '', 'index.html'); // CORREGIDO: Redirigir a index
        renderPage();
    }
    
    function handleRegister(form) {
        // Simulación: Simplemente aceptar cualquier registro y loguear
        const nombre = form.nombre.value;
        const email = form.email.value;
        const password = form.password.value; // No se guarda la contraseña, solo el estado de logueado

        if (nombre && email && password) {
            appState.isLoggedIn = true;
            appState.usuarioNombre = nombre;
            appState.usuarioEmail = email;
            appState.usuario.nombre = nombre; // Actualizar objeto usuario
            appState.usuario.email = email;

            // Persistir la sesión (simulación de registro)
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('usuarioNombre', appState.usuarioNombre);
            localStorage.setItem('usuarioEmail', appState.usuarioEmail);
            
            setFlashAlert('success', `Cuenta creada con éxito. ¡Bienvenido, ${appState.usuarioNombre}!`);

            // Navegar a catálogo
            appState.currentPage = 'catalogo';
            history.pushState(appState, '', 'index.html'); // CORREGIDO: Redirigir a index
            renderPage();
        } else {
             const errorEl = document.getElementById('register-error-alert');
             if (errorEl) {
                 errorEl.textContent = 'Todos los campos son obligatorios.';
                 errorEl.style.display = 'block';
             }
        }
    }
    
    function handleUpdateNombre(form) {
        const nuevoNombre = form.nombre.value;
        if (nuevoNombre) {
            appState.usuario.nombre = nuevoNombre;
            appState.usuarioNombre = nuevoNombre;
            localStorage.setItem('usuarioNombre', nuevoNombre);
            showProfileAlert('success', 'Nombre actualizado correctamente.');
        }
    }
    
    function handleCambiarEmail(form) {
        const nuevoEmail = form.nuevoEmail.value;
        if (nuevoEmail && nuevoEmail !== appState.usuarioEmail) {
            // Simulación de cambio de email + cierre de sesión
            appState.usuario.email = nuevoEmail;
            handleLogout(); // Cierra sesión por seguridad
            setFlashAlert('success', 'Correo actualizado y sesión cerrada por seguridad. Inicie sesión con su nuevo correo.');
        } else if (nuevoEmail === appState.usuarioEmail) {
            showProfileAlert('error', 'El nuevo correo es idéntico al actual.');
        } else {
            showProfileAlert('error', 'Por favor, ingrese un correo válido.');
        }
    }
    
    function handleCambiarPassword(form) {
        const currentPass = form.currentPassword.value;
        const newPass = form.newPassword.value;

        // Simulación: solo validamos que no estén vacíos y que no sean iguales
        if (!currentPass || !newPass) {
            showProfileAlert('error', 'Por favor, rellene ambos campos de contraseña.');
            return;
        }

        if (currentPass === newPass) {
             showProfileAlert('error', 'La nueva contraseña debe ser diferente a la actual.');
             return;
        }
        
        // Simulación: Si pasa la validación básica, asumimos éxito
        form.currentPassword.value = '';
        form.newPassword.value = '';
        showProfileAlert('success', 'Contraseña actualizada correctamente.');
    }
    
    function handleAddCard(form) {
        const numero = form.numero.value.replace(/\s/g, '');
        const vencimiento = form.vencimiento.value;
        const cvv = form.cvv.value;
        const titular = form.titular.value;

        if (numero.length !== 16 || !/^\d{4}\/\d{2}$/.test(vencimiento) || cvv.length < 3 || cvv.length > 4) {
            document.getElementById('card-add-error').textContent = 'Datos de tarjeta inválidos. Revise el formato.';
            document.getElementById('card-add-error').style.display = 'block';
            return;
        }
        
        const lastFour = numero.slice(-4);
        const cardType = numero.startsWith('4') ? 'VISA' : (numero.startsWith('5') ? 'MASTERCARD' : 'OTRA');

        const newCard = {
            id: generateNextId('Card'), // Genera un ID simulado
            tipo: cardType,
            digitosFinales: lastFour,
            fechaVencimiento: vencimiento,
        };

        appState.usuario.tarjetas.push(newCard);
        localStorage.setItem('userCards', JSON.stringify(appState.usuario.tarjetas));

        setFlashAlert('success', `Tarjeta ${cardType} **** ${lastFour} guardada con éxito.`);
        
        // Navegar a perfil principal
        appState.currentPage = 'perfil';
        history.pushState(appState, '', 'index.html?page=perfil'); // CORREGIDO
        renderPage();
    }
    
    function handleDeleteCard(form) {
        const tarjetaId = parseInt(form.tarjetaId.value);
        
        appState.usuario.tarjetas = appState.usuario.tarjetas.filter(t => t.id !== tarjetaId);
        localStorage.setItem('userCards', JSON.stringify(appState.usuario.tarjetas));
        
        cerrarModal(); // Cierra el modal de eliminación
        setFlashAlert('success', 'Tarjeta eliminada correctamente.');
        
        // Navegar a perfil principal
        appState.currentPage = 'perfil';
        history.pushState(appState, '', 'index.html?page=perfil'); // CORREGIDO
        renderPage();
    }
    
    // --- B. CARRITO Y PEDIDOS ---
    
    function handleAddToCart(form) {
        const productoId = parseInt(form.productoId.value);
        const cantidadInput = form.querySelector('input[name="cantidad"]');
        const cantidad = parseInt(cantidadInput ? cantidadInput.value : 1);
        
        if (cantidad <= 0 || isNaN(cantidad)) return;

        const existingItem = appState.cart.find(item => item.productoId === productoId);
        const producto = findProductById(productoId);

        if (!producto) {
             setFlashAlert('error', 'Producto no encontrado.');
             return;
        }

        if (existingItem) {
            existingItem.cantidad += cantidad;
        } else {
            appState.cart.push({ productoId, cantidad });
        }
        
        localStorage.setItem('cartItems', JSON.stringify(appState.cart));
        setFlashAlert('success', `${cantidad} x ${producto.nombre} añadido al carrito.`);
        
        // El carrito se actualiza con el `updateUI()` que se llama en `renderPage()`
        // En el caso del catálogo, recargar solo el header/footer es suficiente para ver el cambio.
        updateUI(); // Para actualizar solo el contador sin recargar toda la página
        
        // Si estamos en la página de detalle, limpiamos el input de cantidad
        if (cantidadInput) cantidadInput.value = 1;
    }
    
    function handleCartAction(productId, action) {
        let product;
        
        appState.cart = appState.cart.map(item => {
            if (item.productoId === productId) {
                product = findProductById(item.productoId);
                
                if (action === 'increase') {
                    item.cantidad++;
                    setFlashAlert('success', `Añadido 1 unidad de ${product.nombre}.`);
                } else if (action === 'decrease') {
                    item.cantidad--;
                    if (item.cantidad < 1) item.cantidad = 1; // Mínimo 1
                    setFlashAlert('success', `Eliminada 1 unidad de ${product.nombre}.`);
                }
            }
            return item;
        }).filter(item => item.cantidad > 0);
        
        if (action === 'remove') {
              const index = appState.cart.findIndex(item => item.productoId === productId);
              if (index > -1) {
                  product = findProductById(appState.cart[index].productoId);
                  appState.cart.splice(index, 1);
                  setFlashAlert('success', `Producto ${product.nombre} eliminado del carrito.`);
              }
        }
        
        localStorage.setItem('cartItems', JSON.stringify(appState.cart));
        
        // Recargar solo la vista del carrito para ver los cambios
        if (appState.currentPage === 'cart') {
              history.pushState(appState, '', 'index.html?page=cart'); // CORREGIDO
              renderPage();
        } else {
              updateUI();
        }
    }
    
    function handleCheckout() {
        if (!appState.isLoggedIn) {
              setFlashAlert('error', 'Debes iniciar sesión para completar el pago.');
              appState.currentPage = 'login';
              history.pushState(appState, '', 'index.html?page=login'); // CORREGIDO
              renderPage();
              return;
        }
        
        if (appState.cart.length === 0) {
              setFlashAlert('error', 'El carrito está vacío. No se puede procesar el pago.');
              appState.currentPage = 'catalogo';
              history.pushState(appState, '', 'index.html'); // CORREGIDO
              renderPage();
              return;
        }
        
        const selectedCard = document.querySelector('#checkoutForm input[name="tarjetaId"]:checked');
        if (!selectedCard) {
            setFlashAlert('error', 'Por favor, selecciona un método de pago.');
            return;
        }
        
        // Simulación: Creación de un Pedido (lo que antes hacía el backend)
        const total = appState.cart.reduce((sum, item) => {
            const producto = findProductById(item.productoId);
            return sum + (producto ? producto.precio * item.cantidad : 0);
        }, 0);
        
        const newPedido = {
            id: generateNextId('Pedido'),
            fechaCreacion: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            estado: 'PENDIENTE', // Siempre inicia como pendiente
            montoTotal: total,
            archivado: false,
            // Detalle del pedido (copia de los items del carrito)
            detalles: appState.cart.map(item => {
                const producto = findProductById(item.productoId);
                return {
                    imagenUrl: producto.imagenUrl,
                    nombreProducto: producto.nombre,
                    modeloProducto: producto.modelo,
                    cantidad: item.cantidad,
                    precioUnitario: producto.precio,
                };
            }),
        };

        appState.pedidos.unshift(newPedido); // Añadir al inicio
        localStorage.setItem('userOrders', JSON.stringify(appState.pedidos));
        
        // Vaciar el carrito
        appState.cart = [];
        localStorage.setItem('cartItems', JSON.stringify(appState.cart));
        
        setFlashAlert('success', `¡Pedido #${newPedido.id} realizado con éxito!`);
        
        // Navegar a la lista de pedidos
        appState.currentPage = 'pedidos';
        history.pushState(appState, '', 'index.html?page=pedidos'); // CORREGIDO
        renderPage();
    }
    
    function handleCancelPedido(pedidoId) {
        const pedido = appState.pedidos.find(p => p.id === pedidoId);
        if (pedido && pedido.estado === 'PENDIENTE' && confirm(`¿Estás seguro de que deseas cancelar el pedido #${pedidoId}?`)) {
            pedido.estado = 'CANCELADO';
            localStorage.setItem('userOrders', JSON.stringify(appState.pedidos));
            setFlashAlert('success', `Pedido #${pedidoId} ha sido cancelado.`);
            
            // Navegar a pedidos
            appState.currentPage = 'pedidos';
            history.pushState(appState, '', 'index.html?page=pedidos'); // CORREGIDO
            renderPage();
        }
    }
    
    function handleArchivePedido(pedidoId) {
        const pedido = appState.pedidos.find(p => p.id === pedidoId);
        if (pedido) {
            pedido.archivado = true;
            localStorage.setItem('userOrders', JSON.stringify(appState.pedidos));
            setFlashAlert('success', `Pedido #${pedidoId} ha sido archivado.`);
            
            // Navegar a pedidos
            appState.currentPage = 'pedidos';
            history.pushState(appState, '', 'index.html?page=pedidos'); // CORREGIDO
            renderPage();
        }
    }
    
    // --- C. MANEJO DE FORMULARIOS GENERAL ---

    function handleFormSubmit(e, formType) {
        e.preventDefault();
        const form = e.currentTarget;

        switch (formType) {
            case 'login': handleLogin(form); break;
            case 'register': handleRegister(form); break;
            case 'add-to-cart': handleAddToCart(form); break;
            case 'update-nombre': handleUpdateNombre(form); break;
            case 'cambiar-email': handleCambiarEmail(form); break;
            case 'cambiar-password': handleCambiarPassword(form); break;
            case 'add-card': handleAddCard(form); break;
            case 'delete-card': handleDeleteCard(form); break;
            // Botones fuera de formularios
            case 'cancel-pedido': handleCancelPedido(parseInt(form.getAttribute('data-pedido-id'))); break;
            case 'archive-pedido': handleArchivePedido(parseInt(form.getAttribute('data-pedido-id'))); break;
            default: console.log('Formulario no manejado:', formType);
        }
    }
    
    // --- D. MANEJO DE BÚSQUEDA ---
    function handleSearch(e) {
        e.preventDefault();
        const query = e.currentTarget.q.value.trim();

        if (query) {
            appState.currentPage = 'catalogo';
            appState.currentParams.q = query;
            history.pushState(appState, '', `index.html?page=catalogo&q=${query}`); // CORREGIDO
            renderPage();
        } else {
            // Navegar a catálogo base si la búsqueda está vacía
            appState.currentPage = 'catalogo';
            appState.currentParams = {};
            history.pushState(appState, '', 'index.html'); // CORREGIDO
            renderPage();
        }
    }

    // ===================================================================================================
    //                                  MANEJO DE EVENTOS ESPECÍFICOS DEL DOM
    // ===================================================================================================

    // --- Carrrito (Aumentar/Disminuir/Eliminar) ---
    function attachCartListeners() {
        document.querySelectorAll('[data-cart-action]').forEach(btn => {
            btn.removeEventListener('click', handleCartBtnClick);
            btn.addEventListener('click', handleCartBtnClick);
        });
    }

    function handleCartBtnClick(e) {
        const btn = e.currentTarget;
        const action = btn.getAttribute('data-cart-action');
        const productId = parseInt(btn.getAttribute('data-product-id'));
        
        handleCartAction(productId, action);
    }
    
    // --- Perfil (Modal de Tarjeta) ---
    function attachProfileListeners() {
        // La lógica de abrir/cerrar modal está adjunta a window.abrirModalEliminar / window.cerrarModal
        // que son funciones globales para que el HTML pueda llamarlas directamente.
        // Solo necesitamos que el formulario de eliminación use el listener adecuado
        const deleteCardForm = document.getElementById('formEliminarTarjeta');
        if (deleteCardForm) {
            deleteCardForm.removeEventListener('submit', handleFormSubmit);
            deleteCardForm.addEventListener('submit', (e) => handleFormSubmit(e, 'delete-card'));
        }
    }
    
    // --- Pedido Detalle (Modal de Archivar) ---
    function attachPedidoDetailModal() {
        const modalArchivar = document.getElementById("archiveModal");
        const openButtonArchivar = document.getElementById("openArchiveModal");

        if (modalArchivar) {
            const closeButtonArchivar = modalArchivar.querySelector(".close-button");
            const cancelButtonArchivar = modalArchivar.querySelector(".btn-modal-cancel");
            const confirmButtonArchivar = modalArchivar.querySelector(".btn-modal-confirm-archive");
            const pedidoId = confirmButtonArchivar ? parseInt(confirmButtonArchivar.getAttribute('data-pedido-id')) : null;

            // --- A. Abrir Modal ---
            if (openButtonArchivar) {
                openButtonArchivar.addEventListener('click', () => {
                    modalArchivar.style.display = 'flex';
                });
            }

            // --- B. Cerrar Modal con X o Cancelar ---
            const closeModal = () => modalArchivar.style.display = 'none';
            if (closeButtonArchivar) closeButtonArchivar.addEventListener('click', closeModal);
            if (cancelButtonArchivar) cancelButtonArchivar.addEventListener('click', closeModal);

            // --- C. Confirmar Archivar ---
            if (confirmButtonArchivar && pedidoId) {
                confirmButtonArchivar.removeEventListener('click', handleArchiveClick);
                confirmButtonArchivar.addEventListener('click', handleArchiveClick);
            }

            // --- D. Cerrar Modal si se hace clic fuera (Overlay) ---
            window.removeEventListener('click', handleModalOverlayClick);
            window.addEventListener('click', handleModalOverlayClick);
        }

        // Manejo de Cancelar Pedido (botón fuera del modal)
        const cancelBtn = document.querySelector('.btn-cancel[data-form-type="cancel-pedido"]');
        if (cancelBtn) {
            cancelBtn.removeEventListener('click', handleCancelClick);
            cancelBtn.addEventListener('click', handleCancelClick);
        }
    }
    
    // Handlers para el modal de pedido
    function handleArchiveClick(e) {
        e.preventDefault();
        const pedidoId = parseInt(e.currentTarget.getAttribute('data-pedido-id'));
        handleArchivePedido(pedidoId);
    }

    function handleCancelClick(e) {
        e.preventDefault();
        const pedidoId = parseInt(e.currentTarget.getAttribute('data-pedido-id'));
        handleCancelPedido(pedidoId);
    }
    
    function handleModalOverlayClick(event) {
        const modalArchivar = document.getElementById("archiveModal");
        if (event.target === modalArchivar) {
            modalArchivar.style.display = 'none';
        }
    }

    // --- FUNCIONES DE MANEJO DE DOM ORIGINALES (Ajustadas) ---

    function stopPropagation(event) {
        event.stopPropagation();
    }
    
    function handleFooterToggle(e) {
        if (window.innerWidth <= 769) {
            const toggle = e.currentTarget;
            const targetId = toggle.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);

            if (targetContent) {
                document.querySelectorAll('.footer-content.is-active').forEach(openContent => {
                    if (openContent.id !== targetId) {
                        openContent.classList.remove('is-active');
                        const relatedToggle = document.querySelector(`[data-target="${openContent.id}"]`);
                        if (relatedToggle) relatedToggle.classList.remove('is-active');
                    }
                });

                targetContent.classList.toggle('is-active');
                toggle.classList.toggle('is-active');
            }
        }
    }

    function handleMenuToggle() {
        const mainMenuContainer = document.getElementById('main-menu');
        if (mainMenuContainer) {
            mainMenuContainer.classList.toggle('is-open');
        }
    }
    
    function handleUserMenuToggle(event) {
        event.stopPropagation();
        const userMenuDropdown = document.getElementById('user-menu-dropdown');
        if (userMenuDropdown) {
             userMenuDropdown.classList.toggle('is-active');
        }
    }

    function closeUserMenuOnClickOutside() {
        const userMenuDropdown = document.getElementById('user-menu-dropdown');
        if (userMenuDropdown && userMenuDropdown.classList.contains('is-active')) {
            userMenuDropdown.classList.remove('is-active');
        }
    }

    // --- FUNCIÓN DE ALERTA RÁPIDA (Reemplazo de Flash Message de Backend) ---
    function setFlashAlert(type, message) {
        const alertHtml = `<div class="alert alert-${type}">${message}</div>`;
        localStorage.setItem('flashAlert', alertHtml);
    }
    
    function showProfileAlert(type, message) {
        const alertEl = document.getElementById('profile-alert');
        if (alertEl) {
            alertEl.className = `alert alert-${type}`;
            alertEl.textContent = message;
            alertEl.style.display = 'block';
            handleFlashAlert(alertEl);
        }
    }

    function handleFlashAlert(flashAlert) {
        // 1. Esperar 4 segundos (4000 milisegundos)
        setTimeout(() => {
            // 2. Aplicar la animación de salida
            flashAlert.style.animation = 'fadeOutUp 0.5s ease-in forwards';

            // 3. Esperar a que termine la animación (0.5s) y quitar el elemento del DOM
            setTimeout(() => {
                flashAlert.remove();
            }, 500); // 500ms = 0.5s

        }, 4000); // 4000ms = 4 segundos
    }
    
    // --- Función de utilería para el título de la página ---
    function getPageTitle(page, params) {
        switch (page) {
            case 'catalogo': return params.cat ? `Catálogo: ${params.cat}` : (params.q ? `Búsqueda: ${params.q}` : 'Catálogo Principal');
            case 'detalle-producto': {
                const p = findProductById(params.id);
                return p ? p.nombre : 'Producto';
            }
            case 'cart': return 'Carrito de Compras';
            case 'login': return 'Iniciar Sesión';
            case 'register': return 'Registro';
            case 'perfil': return 'Mi Perfil';
            case 'tarjeta-add': return 'Añadir Tarjeta';
            case 'pedidos': return 'Mis Pedidos';
            case 'pedido-detalle': return `Detalle Pedido #${params.id}`;
            case 'terminos': return 'Términos y Condiciones';
            case 'privacidad': return 'Política de Privacidad';
            case 'garantias': return 'Información de Garantías';
            case 'catalogo-digital': return 'Catálogo Digital';
            case 'info-page': 
                if (params.page === 'acerca') return 'Acerca de Nosotros';
                if (params.page === 'tiendas') return 'Ubicación de Tiendas';
                if (params.page === 'empleo') return 'Únete al equipo';
                return 'Información';
            default: return 'ELECTRO SHOP';
        }
    }
});