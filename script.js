// ============================================
// SCRIPT PRINCIPAL - CLÍNICA VETERINARIA FISAC FERRÁNDEZ
// Versión moderna con todas las funcionalidades integradas
// ============================================

document.addEventListener('DOMContentLoaded', function() {

    // ============================================
    // SISTEMA DE ACCESIBILIDAD
    // ============================================

    console.log('🔧 Iniciando sistema de accesibilidad...');

    const accessibilityBtn = document.querySelector('.accessibility-btn');
    const accessibilityMenu = document.querySelector('.accessibility-menu');
    const closeBtn = document.querySelector('.accessibility-close');

    let fontSizeLevel = 0;

    const accessibilityState = {
        fontSize: 0,
        grayscale: false,
        highContrast: false,
        negativeContrast: false,
        lightBackground: false,
        underlineLinks: false,
        readableFont: false
    };

    if (accessibilityBtn && accessibilityMenu) {
        console.log('✓ Elementos de accesibilidad encontrados');

        // Toggle menú principal
        accessibilityBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            accessibilityMenu.classList.toggle('active');
        });

        // Cerrar con botón X
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                accessibilityMenu.classList.remove('active');
            });
        }

        // Cerrar al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!accessibilityBtn.contains(e.target) && !accessibilityMenu.contains(e.target)) {
                accessibilityMenu.classList.remove('active');
            }
        });

        // Prevenir cierre al hacer clic dentro del menú
        accessibilityMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        // Cerrar con tecla Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && accessibilityMenu.classList.contains('active')) {
                accessibilityMenu.classList.remove('active');
            }
        });

        // ============================================
        // FUNCIONES DE ACCESIBILIDAD
        // ============================================

        // 1. Aumentar texto
        const increaseFontBtn = document.getElementById('increase-font');
        if (increaseFontBtn) {
            increaseFontBtn.addEventListener('click', function() {
                if (fontSizeLevel < 3) {
                    fontSizeLevel++;
                    document.body.classList.remove('small-text');
                    document.body.classList.add('large-text');
                    document.body.style.fontSize = (100 + (fontSizeLevel * 10)) + '%';
                    this.classList.add('active');
                    accessibilityState.fontSize = fontSizeLevel;
                    saveAccessibilitySettings();
                }
            });
        }

        // 2. Disminuir texto
        const decreaseFontBtn = document.getElementById('decrease-font');
        if (decreaseFontBtn) {
            decreaseFontBtn.addEventListener('click', function() {
                if (fontSizeLevel > -2) {
                    fontSizeLevel--;
                    document.body.classList.remove('large-text');
                    if (fontSizeLevel < 0) {
                        document.body.classList.add('small-text');
                        document.body.style.fontSize = (100 + (fontSizeLevel * 10)) + '%';
                    } else {
                        document.body.classList.remove('small-text');
                        document.body.style.fontSize = '100%';
                    }
                    this.classList.add('active');
                    accessibilityState.fontSize = fontSizeLevel;
                    saveAccessibilitySettings();
                }
            });
        }

        // 3. Escala de grises
        const grayscaleBtn = document.getElementById('grayscale');
        if (grayscaleBtn) {
            grayscaleBtn.addEventListener('click', function() {
                const isActive = document.body.classList.toggle('grayscale-mode');
                this.classList.toggle('active');
                accessibilityState.grayscale = isActive;
                saveAccessibilitySettings();
            });
        }

        // 4. Alto contraste
        const highContrastBtn = document.getElementById('high-contrast');
        if (highContrastBtn) {
            highContrastBtn.addEventListener('click', function() {
                document.body.classList.remove('negative-contrast-mode');
                const negBtn = document.getElementById('negative-contrast');
                if (negBtn) {
                    negBtn.classList.remove('active');
                }

                const isActive = document.body.classList.toggle('high-contrast-mode');
                this.classList.toggle('active');
                accessibilityState.highContrast = isActive;
                accessibilityState.negativeContrast = false;
                saveAccessibilitySettings();
            });
        }

        // 5. Contraste negativo
        const negativeContrastBtn = document.getElementById('negative-contrast');
        if (negativeContrastBtn) {
            negativeContrastBtn.addEventListener('click', function() {
                document.body.classList.remove('high-contrast-mode');
                const highBtn = document.getElementById('high-contrast');
                if (highBtn) {
                    highBtn.classList.remove('active');
                }

                const isActive = document.body.classList.toggle('negative-contrast-mode');
                this.classList.toggle('active');
                accessibilityState.negativeContrast = isActive;
                accessibilityState.highContrast = false;
                saveAccessibilitySettings();
            });
        }

        // 6. Fondo claro
        const lightBackgroundBtn = document.getElementById('light-background');
        if (lightBackgroundBtn) {
            lightBackgroundBtn.addEventListener('click', function() {
                const isActive = document.body.classList.toggle('light-background-mode');
                this.classList.toggle('active');
                accessibilityState.lightBackground = isActive;
                saveAccessibilitySettings();
            });
        }

        // 7. Subrayar enlaces
        const underlineLinksBtn = document.getElementById('underline-links');
        if (underlineLinksBtn) {
            underlineLinksBtn.addEventListener('click', function() {
                const isActive = document.body.classList.toggle('underline-links-mode');
                this.classList.toggle('active');
                accessibilityState.underlineLinks = isActive;
                saveAccessibilitySettings();
            });
        }

        // 8. Fuente legible
        const readableFontBtn = document.getElementById('readable-font');
        if (readableFontBtn) {
            readableFontBtn.addEventListener('click', function() {
                const isActive = document.body.classList.toggle('readable-font-mode');
                this.classList.toggle('active');
                accessibilityState.readableFont = isActive;
                saveAccessibilitySettings();
            });
        }

        // 9. Restablecer todo
        const resetBtn = document.getElementById('reset-accessibility');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                document.body.classList.remove(
                    'large-text', 'small-text', 'grayscale-mode',
                    'high-contrast-mode', 'negative-contrast-mode',
                    'light-background-mode', 'underline-links-mode',
                    'readable-font-mode'
                );
                document.body.style.fontSize = '100%';
                fontSizeLevel = 0;

                accessibilityState.fontSize = 0;
                accessibilityState.grayscale = false;
                accessibilityState.highContrast = false;
                accessibilityState.negativeContrast = false;
                accessibilityState.lightBackground = false;
                accessibilityState.underlineLinks = false;
                accessibilityState.readableFont = false;

                document.querySelectorAll('.accessibility-option').forEach(function(btn) {
                    btn.classList.remove('active');
                });

                localStorage.removeItem('accessibilitySettings');

                showNotification('Configuración de accesibilidad restablecida', 'success');
            });
        }

        // Guardar configuración
        function saveAccessibilitySettings() {
            try {
                localStorage.setItem('accessibilitySettings', JSON.stringify(accessibilityState));
            } catch (e) {
                console.warn('No se pudo guardar la configuración:', e);
            }
        }

        // Cargar configuración guardada
        function loadAccessibilitySettings() {
            try {
                const saved = localStorage.getItem('accessibilitySettings');
                if (saved) {
                    const settings = JSON.parse(saved);

                    fontSizeLevel = settings.fontSize || 0;
                    if (fontSizeLevel !== 0) {
                        document.body.style.fontSize = (100 + (fontSizeLevel * 10)) + '%';
                        if (fontSizeLevel > 0) {
                            document.body.classList.add('large-text');
                            const incBtn = document.getElementById('increase-font');
                            if (incBtn) incBtn.classList.add('active');
                        } else if (fontSizeLevel < 0) {
                            document.body.classList.add('small-text');
                            const decBtn = document.getElementById('decrease-font');
                            if (decBtn) decBtn.classList.add('active');
                        }
                    }

                    if (settings.grayscale) {
                        document.body.classList.add('grayscale-mode');
                        const btn = document.getElementById('grayscale');
                        if (btn) btn.classList.add('active');
                    }

                    if (settings.highContrast) {
                        document.body.classList.add('high-contrast-mode');
                        const btn = document.getElementById('high-contrast');
                        if (btn) btn.classList.add('active');
                    }

                    if (settings.negativeContrast) {
                        document.body.classList.add('negative-contrast-mode');
                        const btn = document.getElementById('negative-contrast');
                        if (btn) btn.classList.add('active');
                    }

                    if (settings.lightBackground) {
                        document.body.classList.add('light-background-mode');
                        const btn = document.getElementById('light-background');
                        if (btn) btn.classList.add('active');
                    }

                    if (settings.underlineLinks) {
                        document.body.classList.add('underline-links-mode');
                        const btn = document.getElementById('underline-links');
                        if (btn) btn.classList.add('active');
                    }

                    if (settings.readableFont) {
                        document.body.classList.add('readable-font-mode');
                        const btn = document.getElementById('readable-font');
                        if (btn) btn.classList.add('active');
                    }

                    Object.assign(accessibilityState, settings);
                }
            } catch (e) {
                console.warn('No se pudo cargar la configuración:', e);
            }
        }

        loadAccessibilitySettings();
        console.log('✓ Sistema de accesibilidad inicializado');

    } else {
        console.warn('⚠️ Elementos de accesibilidad no encontrados en esta página');
    }

    // ============================================
    // MENÚ HAMBURGUESA RESPONSIVE
    // ============================================

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-menu a').forEach(function(link) {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // ============================================
    // SCROLL SUAVE
    // ============================================

    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // ANIMACIONES AL HACER SCROLL
    // ============================================

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(
        '.card, .team-card, .service-card'
    );
    animatedElements.forEach(function(el) {
        observer.observe(el);
    });

    // ============================================
    // VALIDACIÓN DE FORMULARIOS
    // ============================================

    const forms = document.querySelectorAll('form');
    forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(function(input) {
            input.addEventListener('blur', function() {
                validateField(this);
            });

            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    });

    function validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(function(field) {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        const emailFields = form.querySelectorAll('input[type="email"]');
        emailFields.forEach(function(field) {
            if (field.value && !isValidEmail(field.value)) {
                showFieldError(field, 'Formato de email inválido');
                isValid = false;
            }
        });

        const phoneFields = form.querySelectorAll('input[type="tel"]');
        phoneFields.forEach(function(field) {
            if (field.value && !isValidPhone(field.value)) {
                showFieldError(field, 'Formato de teléfono inválido (9 dígitos)');
                isValid = false;
            }
        });

        return isValid;
    }

    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.getAttribute('name') || 'Este campo';

        if (field.hasAttribute('required') && !value) {
            showFieldError(field, fieldName + ' es requerido');
            return false;
        }

        if (value) {
            if (field.type === 'email') {
                if (!isValidEmail(value)) {
                    showFieldError(field, 'Formato de email inválido');
                    return false;
                }
            } else if (field.type === 'tel') {
                if (!isValidPhone(value)) {
                    showFieldError(field, 'Formato de teléfono inválido (9 dígitos)');
                    return false;
                }
            }
        }

        clearFieldError(field);
        return true;
    }

    function showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.add('error');

        let errorMessage = formGroup.querySelector('.error-message');
        if (!errorMessage) {
            errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.style.cssText = 'color: #dc3545; font-size: 0.875rem; margin-top: 0.5rem;';
            formGroup.appendChild(errorMessage);
        }
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.remove('error');
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^[6-9]\d{8}$/;
        const cleanPhone = phone.replace(/\s/g, '');
        return phoneRegex.test(cleanPhone);
    }

    // ============================================
    // NOTIFICACIONES
    // ============================================

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = 'notification notification-' + type;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10001;
            animation: slideIn 0.3s ease-out;
            font-weight: 600;
        `;

        document.body.appendChild(notification);

        setTimeout(function() {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(function() {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // ============================================
    // LAZY LOADING DE IMÁGENES
    // ============================================

    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });
    }

    // ============================================
    // MANEJO DE ERRORES DE IMÁGENES
    // ============================================

    document.querySelectorAll('img').forEach(function(img) {
        img.addEventListener('error', function() {
            console.warn('Error cargando imagen:', this.src);
            this.style.opacity = '0.5';
        });
    });

    // ============================================
    // MENSAJE DE ÉXITO EN FORMULARIOS
    // ============================================

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        showNotification('✓ Mensaje enviado correctamente. Te contactaremos pronto.', 'success');
    } else if (urlParams.get('error') === 'true') {
        showNotification('✗ Hubo un error al enviar el mensaje. Inténtalo de nuevo.', 'error');
    }

    // ============================================
    // PREVENCIÓN DE SPAM
    // ============================================

    let lastSubmitTime = 0;
    const minTimeBetweenSubmits = 5000;

    document.querySelectorAll('form').forEach(function(form) {
        form.addEventListener('submit', function(e) {
            const currentTime = Date.now();
            if (currentTime - lastSubmitTime < minTimeBetweenSubmits) {
                e.preventDefault();
                showNotification('Por favor, espera unos segundos antes de enviar otro mensaje.', 'error');
                return false;
            }
            lastSubmitTime = currentTime;
        });
    });

    // ============================================
    // HEADER AL HACER SCROLL
    // ============================================

    let lastScrollTop = 0;
    const header = document.querySelector('header');

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (header) {
            if (scrollTop > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        lastScrollTop = scrollTop;
    });

    // ============================================
    // ANIMACIONES CSS
    // ============================================

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(30px);
            }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .fade-in {
            animation: fadeInUp 0.6s ease-out;
        }
    `;
    document.head.appendChild(style);

    console.log('✅ Script principal cargado completamente');
});

// ============================================
// FUNCIONES GLOBALES
// ============================================

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ============================================
// MANEJO DE ERRORES GLOBALES
// ============================================

window.addEventListener('error', function(e) {
    console.error('Error detectado:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Promesa rechazada:', e.reason);
});
