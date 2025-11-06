/* ============================================
   PERFORMANCE BOOST - Optimizaciones críticas
   ============================================ */

// 1. Passive Event Listeners para scroll/touch
(function() {
  // Override addEventListener para hacer scroll/touch passive por defecto
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    const passiveEvents = ['scroll', 'touchstart', 'touchmove', 'wheel', 'mousewheel'];
    
    if (passiveEvents.includes(type)) {
      if (typeof options === 'object') {
        options.passive = options.passive !== false;
      } else {
        options = { passive: true, capture: !!options };
      }
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };
})();

// 2. Debounce helper para resize/scroll
window.debounce = function(func, wait = 16) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 3. Throttle helper para eventos frecuentes
window.throttle = function(func, limit = 16) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 4. RequestAnimationFrame wrapper para animaciones
window.rafThrottle = function(callback) {
  let requestId = null;
  let lastArgs;
  
  const later = (context) => () => {
    requestId = null;
    callback.apply(context, lastArgs);
  };
  
  const throttled = function(...args) {
    lastArgs = args;
    if (requestId === null) {
      requestId = requestAnimationFrame(later(this));
    }
  };
  
  throttled.cancel = () => {
    cancelAnimationFrame(requestId);
    requestId = null;
  };
  
  return throttled;
};

// 5. Intersection Observer para lazy animations
window.lazyAnimate = function(selector, callback, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { ...defaultOptions, ...options });
  
  document.querySelectorAll(selector).forEach(el => observer.observe(el));
  
  return observer;
};

// 6. Defer non-critical tasks
window.deferTask = function(task, priority = 'low') {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(task, { timeout: priority === 'high' ? 1000 : 5000 });
  } else {
    setTimeout(task, priority === 'high' ? 100 : 1000);
  }
};

console.log('⚡ Performance Boost loaded');
