// Enhanced Navbar Component
class NSS_Navbar {
  constructor(options = {}) {
    this.options = {
      brand: options.brand || 'NSS Portal',
      logo: options.logo || '/images/mainlogo.png',
      links: options.links || [],
      theme: options.theme || 'dark',
      ...options
    };
    
    this.init();
  }
  
  init() {
    this.createNavbar();
    this.bindEvents();
    this.initTheme();
  }
  
  createNavbar() {
    const navbar = document.createElement('nav');
    navbar.className = 'nss-navbar';
    navbar.innerHTML = this.getNavbarHTML();
    
    // Insert at the beginning of body
    document.body.insertBefore(navbar, document.body.firstChild);
  }
  
  getNavbarHTML() {
    return `
      <div class="nav-container">
        <div class="nav-brand">
          <img src="${this.options.logo}" alt="${this.options.brand}" class="nav-logo">
          <span class="nav-brand-text">${this.options.brand}</span>
        </div>
        
        <ul class="nav-links">
          ${this.options.links.map(link => `
            <li class="nav-item">
              <a href="${link.href}" class="nav-link ${link.active ? 'active' : ''}">
                ${link.icon ? `<span class="nav-icon">${link.icon}</span>` : ''}
                ${link.text}
              </a>
            </li>
          `).join('')}
        </ul>
        
        <div class="nav-actions">
          <button class="theme-toggle" id="theme-toggle">
            <span class="theme-icon">🌙</span>
          </button>
          <button class="nav-menu-toggle" id="nav-menu-toggle">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    `;
  }
  
  bindEvents() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('nav-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    menuToggle?.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle?.addEventListener('click', () => {
      this.toggleTheme();
    });
    
    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
      });
    });
  }
  
  initTheme() {
    const savedTheme = localStorage.getItem('nss-theme') || this.options.theme;
    this.setTheme(savedTheme);
  }
  
  toggleTheme() {
    const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
  
  setTheme(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    
    if (theme === 'light') {
      document.body.classList.add('light-mode');
      if (themeIcon) themeIcon.textContent = '☀️';
    } else {
      document.body.classList.remove('light-mode');
      if (themeIcon) themeIcon.textContent = '🌙';
    }
    
    localStorage.setItem('nss-theme', theme);
  }
  
  updateActiveLink(href) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === href) {
        link.classList.add('active');
      }
    });
  }
  
  addLink(link) {
    this.options.links.push(link);
    this.refresh();
  }
  
  removeLink(href) {
    this.options.links = this.options.links.filter(link => link.href !== href);
    this.refresh();
  }
  
  refresh() {
    const navbar = document.querySelector('.nss-navbar');
    if (navbar) {
      navbar.innerHTML = this.getNavbarHTML();
      this.bindEvents();
    }
  }
}

// Navbar Styles
const navbarStyles = `
  .nss-navbar {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: var(--nav-bg, rgba(10, 10, 15, 0.95));
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border, rgba(107, 52, 245, 0.3));
    box-shadow: var(--shadow, 0 20px 40px rgba(0, 0, 0, 0.3));
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .nav-container {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
  }
  
  .nav-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    color: var(--text-color, #E0E0E0);
  }
  
  .nav-logo {
    height: 40px;
    filter: brightness(1.2) drop-shadow(0 0 10px rgba(107, 52, 245, 0.3));
    transition: all 0.3s ease;
  }
  
  .nav-logo:hover {
    transform: scale(1.05);
    filter: brightness(1.3) drop-shadow(0 0 15px rgba(107, 52, 245, 0.5));
  }
  
  .nav-brand-text {
    font-size: 1.25rem;
    font-weight: 700;
    background: var(--gradient, linear-gradient(135deg, #6B34F5, #00DDEB));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .nav-links {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 2rem;
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-color, #E0E0E0);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }
  
  .nav-link::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: var(--gradient, linear-gradient(135deg, #6B34F5, #00DDEB));
    opacity: 0.1;
    transition: left 0.3s ease;
    z-index: -1;
  }
  
  .nav-link:hover::before,
  .nav-link.active::before {
    left: 0;
  }
  
  .nav-link:hover,
  .nav-link.active {
    color: var(--accent-color, #6B34F5);
    transform: translateY(-2px);
  }
  
  .nav-icon {
    font-size: 1.1rem;
  }
  
  .nav-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .theme-toggle {
    width: 50px;
    height: 25px;
    background: var(--gradient, linear-gradient(135deg, #6B34F5, #00DDEB));
    border: none;
    border-radius: 25px;
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease;
  }
  
  .theme-toggle:hover {
    transform: scale(1.05);
  }
  
  .theme-icon {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 21px;
    height: 21px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: transform 0.3s ease;
  }
  
  .light-mode .theme-icon {
    transform: translateX(25px);
  }
  
  .nav-menu-toggle {
    display: none;
    flex-direction: column;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    gap: 4px;
  }
  
  .nav-menu-toggle span {
    width: 25px;
    height: 3px;
    background: var(--text-color, #E0E0E0);
    border-radius: 2px;
    transition: all 0.3s ease;
  }
  
  .nav-menu-toggle.active span:nth-child(1) {
    transform: rotate(45deg) translate(6px, 6px);
  }
  
  .nav-menu-toggle.active span:nth-child(2) {
    opacity: 0;
  }
  
  .nav-menu-toggle.active span:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -6px);
  }
  
  @media (max-width: 768px) {
    .nav-container {
      padding: 1rem;
    }
    
    .nav-links {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--nav-bg, rgba(10, 10, 15, 0.95));
      backdrop-filter: blur(20px);
      flex-direction: column;
      padding: 2rem;
      border-top: 1px solid var(--border, rgba(107, 52, 245, 0.3));
      transform: translateY(-100%);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      gap: 1rem;
    }
    
    .nav-links.active {
      transform: translateY(0);
      opacity: 1;
      visibility: visible;
    }
    
    .nav-menu-toggle {
      display: flex;
    }
    
    .nav-brand-text {
      display: none;
    }
  }
`;

// Inject styles
if (!document.getElementById('navbar-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'navbar-styles';
  styleSheet.textContent = navbarStyles;
  document.head.appendChild(styleSheet);
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NSS_Navbar;
}