// Enhanced Animation Utilities for NSS Portal
class NSS_Animations {
  constructor() {
    this.defaultEasing = 'power3.out';
    this.defaultDuration = 0.8;
    this.observers = new Map();
    this.isInitialized = false;
    
    this.init();
  }
  
  init() {
    if (this.isInitialized) return;
    
    // Wait for GSAP to be available
    if (typeof gsap === 'undefined') {
      setTimeout(() => this.init(), 100);
      return;
    }
    
    this.setupScrollAnimations();
    this.setupHoverEffects();
    this.setupLoadingAnimations();
    this.setupPageTransitions();
    this.isInitialized = true;
  }
  
  // Scroll-triggered animations
  setupScrollAnimations() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateOnScroll(entry.target);
            observer.unobserve(entry.target); // Animate only once
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });
      
      // Observe elements with animation classes
      document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
      });
      
      this.observers.set('scroll', observer);
    }
  }
  
  animateOnScroll(element) {
    const animationType = element.dataset.animate;
    const delay = parseFloat(element.dataset.delay) || 0;
    const duration = parseFloat(element.dataset.duration) || this.defaultDuration;
    const stagger = parseFloat(element.dataset.stagger) || 0;
    
    switch (animationType) {
      case 'fade-up':
        this.fadeUp(element, { delay, duration });
        break;
      case 'fade-in':
        this.fadeIn(element, { delay, duration });
        break;
      case 'slide-left':
        this.slideLeft(element, { delay, duration });
        break;
      case 'slide-right':
        this.slideRight(element, { delay, duration });
        break;
      case 'scale-in':
        this.scaleIn(element, { delay, duration });
        break;
      case 'bounce-in':
        this.bounceIn(element, { delay, duration });
        break;
      case 'stagger-fade':
        this.staggerFadeUp(element.children, { delay, duration, stagger: stagger || 0.1 });
        break;
      default:
        this.fadeUp(element, { delay, duration });
    }
  }
  
  // Basic animations with enhanced easing
  fadeUp(element, options = {}) {
    const { delay = 0, duration = this.defaultDuration } = options;
    
    gsap.fromTo(element, 
      { 
        opacity: 0, 
        y: 50,
        scale: 0.95
      },
      { 
        opacity: 1, 
        y: 0,
        scale: 1,
        duration, 
        delay,
        ease: this.defaultEasing
      }
    );
  }
  
  fadeIn(element, options = {}) {
    const { delay = 0, duration = this.defaultDuration } = options;
    
    gsap.fromTo(element,
      { opacity: 0 },
      { 
        opacity: 1, 
        duration, 
        delay,
        ease: this.defaultEasing
      }
    );
  }
  
  slideLeft(element, options = {}) {
    const { delay = 0, duration = this.defaultDuration } = options;
    
    gsap.fromTo(element,
      { 
        opacity: 0, 
        x: 100,
        scale: 0.95
      },
      { 
        opacity: 1, 
        x: 0,
        scale: 1,
        duration, 
        delay,
        ease: this.defaultEasing
      }
    );
  }
  
  slideRight(element, options = {}) {
    const { delay = 0, duration = this.defaultDuration } = options;
    
    gsap.fromTo(element,
      { 
        opacity: 0, 
        x: -100,
        scale: 0.95
      },
      { 
        opacity: 1, 
        x: 0,
        scale: 1,
        duration, 
        delay,
        ease: this.defaultEasing
      }
    );
  }
  
  scaleIn(element, options = {}) {
    const { delay = 0, duration = this.defaultDuration } = options;
    
    gsap.fromTo(element,
      { 
        opacity: 0, 
        scale: 0.8,
        rotation: -5
      },
      { 
        opacity: 1, 
        scale: 1,
        rotation: 0,
        duration, 
        delay,
        ease: 'back.out(1.7)'
      }
    );
  }
  
  bounceIn(element, options = {}) {
    const { delay = 0, duration = this.defaultDuration } = options;
    
    gsap.fromTo(element,
      { 
        opacity: 0, 
        scale: 0.3,
        y: -50
      },
      { 
        opacity: 1, 
        scale: 1,
        y: 0,
        duration, 
        delay,
        ease: 'elastic.out(1, 0.5)'
      }
    );
  }
  
  // Stagger animations with enhanced effects
  staggerFadeUp(elements, options = {}) {
    const { 
      delay = 0, 
      duration = this.defaultDuration, 
      stagger = 0.1 
    } = options;
    
    gsap.fromTo(elements,
      { 
        opacity: 0, 
        y: 50,
        scale: 0.9
      },
      { 
        opacity: 1, 
        y: 0,
        scale: 1,
        duration, 
        delay,
        stagger,
        ease: this.defaultEasing
      }
    );
  }
  
  staggerScaleIn(elements, options = {}) {
    const { 
      delay = 0, 
      duration = this.defaultDuration, 
      stagger = 0.1 
    } = options;
    
    gsap.fromTo(elements,
      { 
        opacity: 0, 
        scale: 0.8,
        rotation: -10
      },
      { 
        opacity: 1, 
        scale: 1,
        rotation: 0,
        duration, 
        delay,
        stagger,
        ease: 'back.out(1.7)'
      }
    );
  }
  
  // Enhanced hover effects
  setupHoverEffects() {
    // Card hover effects with magnetic attraction
    document.querySelectorAll('.hover-lift, .stat-card, .action-button, .feature-card').forEach(card => {
      let isHovering = false;
      
      card.addEventListener('mouseenter', (e) => {
        isHovering = true;
        gsap.to(card, {
          y: -8,
          scale: 1.02,
          duration: 0.3,
          ease: 'power2.out',
          boxShadow: '0 20px 40px rgba(107, 52, 245, 0.2)'
        });
      });
      
      card.addEventListener('mouseleave', () => {
        isHovering = false;
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
        });
      });
      
      // Magnetic effect
      card.addEventListener('mousemove', (e) => {
        if (!isHovering) return;
        
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(card, {
          x: x * 0.1,
          y: y * 0.1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });
    
    // Button hover effects with ripple
    document.querySelectorAll('.hover-glow, .login-button, .submit-btn, button').forEach(button => {
      button.addEventListener('mouseenter', () => {
        gsap.to(button, {
          scale: 1.05,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      
      button.addEventListener('mouseleave', () => {
        gsap.to(button, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      
      // Click ripple effect
      button.addEventListener('click', (e) => {
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          pointer-events: none;
          transform: scale(0);
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        gsap.to(ripple, {
          scale: 2,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => ripple.remove()
        });
      });
    });
  }
  
  // Loading animations
  setupLoadingAnimations() {
    this.createLoadingSpinner();
    this.createPulseEffect();
    this.createShimmerEffect();
  }
  
  createLoadingSpinner() {
    const style = document.createElement('style');
    style.textContent = `
      .nss-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(107, 52, 245, 0.1);
        border-left: 4px solid #6B34F5;
        border-radius: 50%;
        animation: nss-spin 1s linear infinite;
      }
      
      @keyframes nss-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .nss-spinner-dots {
        display: inline-block;
        position: relative;
        width: 40px;
        height: 40px;
      }
      
      .nss-spinner-dots div {
        position: absolute;
        top: 16px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #6B34F5;
        animation-timing-function: cubic-bezier(0, 1, 1, 0);
      }
      
      .nss-spinner-dots div:nth-child(1) {
        left: 4px;
        animation: nss-dots1 0.6s infinite;
      }
      
      .nss-spinner-dots div:nth-child(2) {
        left: 4px;
        animation: nss-dots2 0.6s infinite;
      }
      
      .nss-spinner-dots div:nth-child(3) {
        left: 16px;
        animation: nss-dots2 0.6s infinite;
      }
      
      .nss-spinner-dots div:nth-child(4) {
        left: 28px;
        animation: nss-dots3 0.6s infinite;
      }
      
      @keyframes nss-dots1 {
        0% { transform: scale(0); }
        100% { transform: scale(1); }
      }
      
      @keyframes nss-dots3 {
        0% { transform: scale(1); }
        100% { transform: scale(0); }
      }
      
      @keyframes nss-dots2 {
        0% { transform: translate(0, 0); }
        100% { transform: translate(12px, 0); }
      }
    `;
    document.head.appendChild(style);
  }
  
  createPulseEffect() {
    const style = document.createElement('style');
    style.textContent = `
      .nss-pulse {
        animation: nss-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      
      @keyframes nss-pulse {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.7;
          transform: scale(1.05);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  createShimmerEffect() {
    const style = document.createElement('style');
    style.textContent = `
      .nss-shimmer {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: nss-shimmer 1.5s infinite;
      }
      
      @keyframes nss-shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Page transition animations
  setupPageTransitions() {
    // Create page transition overlay
    if (!document.querySelector('.page-transition')) {
      const overlay = document.createElement('div');
      overlay.className = 'page-transition';
      document.body.appendChild(overlay);
    }
  }
  
  pageTransitionIn(callback) {
    const overlay = document.querySelector('.page-transition');
    if (!overlay) return;
    
    const tl = gsap.timeline({
      onComplete: callback
    });
    
    tl.set(overlay, { x: '-100%' })
      .to(overlay, {
        x: '0%',
        duration: 0.5,
        ease: 'power2.inOut'
      })
      .to(overlay, {
        x: '100%',
        duration: 0.5,
        ease: 'power2.inOut',
        delay: 0.1
      });
  }
  
  pageTransitionOut() {
    const overlay = document.querySelector('.page-transition');
    if (!overlay) return;
    
    gsap.set(overlay, { x: '-100%' });
  }
  
  // Enhanced counter animation
  animateCounter(element, targetValue, options = {}) {
    const { 
      duration = 2000, 
      suffix = '', 
      prefix = '',
      decimals = 0,
      ease = 'power3.out'
    } = options;
    
    const obj = { value: 0 };
    
    gsap.to(obj, {
      value: targetValue,
      duration: duration / 1000,
      ease: ease,
      onUpdate: () => {
        element.textContent = prefix + obj.value.toFixed(decimals) + suffix;
      }
    });
  }
  
  // Enhanced typewriter effect
  typeWriter(element, text, options = {}) {
    const { 
      speed = 50, 
      delay = 0,
      cursor = true,
      onComplete = null,
      scramble = false
    } = options;
    
    element.textContent = '';
    
    if (cursor) {
      element.style.borderRight = '2px solid currentColor';
      element.style.animation = 'blink 1s infinite';
    }
    
    const chars = text.split('');
    let currentIndex = 0;
    
    const typeChar = () => {
      if (currentIndex < chars.length) {
        if (scramble && Math.random() > 0.7) {
          // Add scramble effect
          const scrambleChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
          element.textContent += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          setTimeout(() => {
            element.textContent = element.textContent.slice(0, -1) + chars[currentIndex];
            currentIndex++;
            setTimeout(typeChar, speed);
          }, speed / 2);
        } else {
          element.textContent += chars[currentIndex];
          currentIndex++;
          setTimeout(typeChar, speed);
        }
      } else {
        if (cursor) {
          element.style.borderRight = 'none';
          element.style.animation = 'none';
        }
        if (onComplete) onComplete();
      }
    };
    
    setTimeout(typeChar, delay);
  }
  
  // Morphing shapes animation
  morphShape(element, paths, options = {}) {
    const { duration = 1, ease = 'power2.inOut', loop = true } = options;
    
    if (paths.length < 2) return;
    
    let currentIndex = 0;
    
    const animate = () => {
      const nextIndex = (currentIndex + 1) % paths.length;
      
      gsap.to(element, {
        attr: { d: paths[nextIndex] },
        duration,
        ease,
        onComplete: () => {
          currentIndex = nextIndex;
          if (loop) {
            setTimeout(animate, 1000);
          }
        }
      });
    };
    
    animate();
  }
  
  // Enhanced particle system
  createParticleSystem(container, options = {}) {
    const {
      count = 50,
      color = '#6B34F5',
      size = 2,
      speed = 0.5,
      interactive = true
    } = options;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = interactive ? 'auto' : 'none';
    
    container.appendChild(canvas);
    
    const particles = [];
    let mouse = { x: 0, y: 0 };
    
    // Mouse interaction
    if (interactive) {
      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });
    }
    
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * size + 1,
        opacity: Math.random() * 0.5 + 0.2,
        originalSize: Math.random() * size + 1
      });
    }
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        // Mouse interaction
        if (interactive) {
          const dx = mouse.x - particle.x;
          const dy = mouse.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const force = (100 - distance) / 100;
            particle.vx += (dx / distance) * force * 0.01;
            particle.vy += (dy / distance) * force * 0.01;
            particle.size = particle.originalSize * (1 + force);
          } else {
            particle.size = particle.originalSize;
          }
        }
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Boundary collision
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    return {
      canvas,
      destroy: () => {
        container.removeChild(canvas);
      },
      updateOptions: (newOptions) => {
        Object.assign(options, newOptions);
      }
    };
  }
  
  // Cleanup
  destroy() {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
    this.isInitialized = false;
  }
}

// CSS for additional animations
const animationStyles = `
  @keyframes blink {
    0%, 50% { border-color: transparent; }
    51%, 100% { border-color: currentColor; }
  }
  
  .page-transition {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #6B34F5, #00DDEB);
    z-index: 9999;
    transform: translateX(-100%);
    pointer-events: none;
  }
  
  .hover-lift {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .hover-glow {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  [data-animate] {
    opacity: 0;
  }
  
  .loading .nss-spinner,
  .loading .nss-spinner-dots {
    display: inline-block;
  }
  
  .loading .nss-pulse {
    animation-play-state: running;
  }
  
  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }
  
  /* Enhanced focus styles */
  *:focus {
    outline: 2px solid var(--accent-color, #6B34F5);
    outline-offset: 2px;
    border-radius: 4px;
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

// Inject styles
if (!document.getElementById('animation-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'animation-styles';
  styleSheet.textContent = animationStyles;
  document.head.appendChild(styleSheet);
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.nssAnimations = new NSS_Animations();
});

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NSS_Animations;
}