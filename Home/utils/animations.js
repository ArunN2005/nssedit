// Enhanced Animation Utilities for NSS Portal
class NSS_Animations {
  constructor() {
    this.defaultEasing = 'cubic-bezier(0.4, 0, 0.2, 1)';
    this.defaultDuration = 0.6;
    this.observers = new Map();
    
    this.init();
  }
  
  init() {
    this.setupScrollAnimations();
    this.setupHoverEffects();
    this.setupLoadingAnimations();
  }
  
  // Scroll-triggered animations
  setupScrollAnimations() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateOnScroll(entry.target);
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
      default:
        this.fadeUp(element, { delay, duration });
    }
  }
  
  // Basic animations
  fadeUp(element, options = {}) {
    const { delay = 0, duration = this.defaultDuration } = options;
    
    gsap.fromTo(element, 
      { 
        opacity: 0, 
        y: 50 
      },
      { 
        opacity: 1, 
        y: 0, 
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
        x: 100 
      },
      { 
        opacity: 1, 
        x: 0, 
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
        x: -100 
      },
      { 
        opacity: 1, 
        x: 0, 
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
        scale: 0.8 
      },
      { 
        opacity: 1, 
        scale: 1, 
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
        scale: 0.3 
      },
      { 
        opacity: 1, 
        scale: 1, 
        duration, 
        delay,
        ease: 'elastic.out(1, 0.5)' 
      }
    );
  }
  
  // Stagger animations
  staggerFadeUp(elements, options = {}) {
    const { 
      delay = 0, 
      duration = this.defaultDuration, 
      stagger = 0.1 
    } = options;
    
    gsap.fromTo(elements,
      { 
        opacity: 0, 
        y: 50 
      },
      { 
        opacity: 1, 
        y: 0, 
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
        scale: 0.8 
      },
      { 
        opacity: 1, 
        scale: 1, 
        duration, 
        delay,
        stagger,
        ease: 'back.out(1.7)' 
      }
    );
  }
  
  // Hover effects
  setupHoverEffects() {
    // Card hover effects
    document.querySelectorAll('.hover-lift').forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -8,
          scale: 1.02,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });
    
    // Button hover effects
    document.querySelectorAll('.hover-glow').forEach(button => {
      button.addEventListener('mouseenter', () => {
        gsap.to(button, {
          boxShadow: '0 0 20px rgba(107, 52, 245, 0.5)',
          scale: 1.05,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      
      button.addEventListener('mouseleave', () => {
        gsap.to(button, {
          boxShadow: '0 4px 15px rgba(107, 52, 245, 0.3)',
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });
  }
  
  // Loading animations
  setupLoadingAnimations() {
    this.createLoadingSpinner();
    this.createPulseEffect();
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
        }
        50% {
          opacity: 0.5;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Page transition animations
  pageTransitionIn(callback) {
    const tl = gsap.timeline({
      onComplete: callback
    });
    
    tl.to('.page-transition', {
      x: '100%',
      duration: 0.5,
      ease: 'power2.inOut'
    })
    .set('.page-transition', {
      x: '-100%'
    })
    .to('.page-transition', {
      x: '0%',
      duration: 0.5,
      ease: 'power2.inOut'
    });
  }
  
  pageTransitionOut() {
    gsap.to('.page-transition', {
      x: '100%',
      duration: 0.5,
      ease: 'power2.inOut'
    });
  }
  
  // Counter animation
  animateCounter(element, targetValue, options = {}) {
    const { 
      duration = 2000, 
      suffix = '', 
      prefix = '',
      decimals = 0 
    } = options;
    
    const startTime = performance.now();
    const startValue = 0;
    
    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (targetValue - startValue) * easedProgress;
      
      element.textContent = prefix + currentValue.toFixed(decimals) + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }
    
    requestAnimationFrame(updateCounter);
  }
  
  // Typewriter effect
  typeWriter(element, text, options = {}) {
    const { 
      speed = 50, 
      delay = 0,
      cursor = true,
      onComplete = null 
    } = options;
    
    element.textContent = '';
    
    if (cursor) {
      element.style.borderRight = '2px solid';
      element.style.animation = 'blink 1s infinite';
    }
    
    setTimeout(() => {
      let i = 0;
      const timer = setInterval(() => {
        element.textContent += text.charAt(i);
        i++;
        
        if (i >= text.length) {
          clearInterval(timer);
          if (cursor) {
            element.style.borderRight = 'none';
            element.style.animation = 'none';
          }
          if (onComplete) onComplete();
        }
      }, speed);
    }, delay);
  }
  
  // Morphing shapes animation
  morphShape(element, paths, options = {}) {
    const { duration = 1, ease = 'power2.inOut' } = options;
    
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
          setTimeout(animate, 1000);
        }
      });
    };
    
    animate();
  }
  
  // Particle system
  createParticleSystem(container, options = {}) {
    const {
      count = 50,
      color = '#6B34F5',
      size = 2,
      speed = 0.5
    } = options;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    
    container.appendChild(canvas);
    
    const particles = [];
    
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * size + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    return {
      canvas,
      destroy: () => {
        container.removeChild(canvas);
      }
    };
  }
  
  // Cleanup
  destroy() {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
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
  
  .loading .nss-spinner {
    display: inline-block;
  }
  
  .loading .nss-pulse {
    animation-play-state: running;
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