<template>
  <div class="landing-page" :class="{ 'dark-mode': darkMode }">
    <!-- Scroll Progress Bar -->
    <div class="scroll-progress" :style="{ width: scrollProgress + '%' }"></div>

    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <!-- Header/Navigation -->
    <header class="landing-header">
      <div class="header-container">
        <div class="logo-section">
          <div class="logo-icon">
            <SvgIcons icon="sparkles" />
          </div>
          <div class="logo-text">
            <h1>WikiAi</h1>
            <p class="tagline">{{ t.header.tagline }}</p>
          </div>
        </div>
        <button class="mobile-menu-toggle" @click="toggleMobileMenu" :aria-expanded="isMobileMenuOpen">
          <span class="menu-icon" :class="{ 'open': isMobileMenuOpen }">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        <nav class="header-nav" :class="{ 'mobile-visible': isMobileMenuOpen }">
          <a href="#product" class="nav-link" @click="closeMobileMenu">{{ t.header.product }}</a>
          <a href="#team" class="nav-link" @click="closeMobileMenu">{{ t.header.team }}</a>
          <a href="#goals" class="nav-link" @click="closeMobileMenu">{{ t.header.goals }}</a>
          <a href="#contact" class="nav-link" @click="closeMobileMenu">{{ t.header.contact }}</a>
          <div class="nav-actions">
            <button class="lang-toggle" @click="toggleLanguage" :title="`Switch to ${language === 'en' ? 'Русский' : 'English'}`">
              {{ language === 'en' ? '🇷🇺 РУ' : '🇬🇧 EN' }}
            </button>
            <button class="theme-toggle" @click="toggleDarkMode" :title="darkMode ? t.header.lightMode : t.header.darkMode">
              <SvgIcons v-if="!darkMode" icon="moon" />
              <SvgIcons v-else icon="sun" />
            </button>
            <router-link to="/app" class="btn-primary">{{ t.header.getStarted }}</router-link>
          </div>                                  
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-grid">
        <div class="hero-content">
          <h2 class="hero-title">
            <span class="word" v-for="(word, index) in t.hero.title" :key="index">{{ index === t.hero.title.length - 1 ? '' : '' }}<span :class="{ highlight: index === t.hero.title.length - 1 }">{{ word }}</span></span>
          </h2>
          <p class="hero-subtitle">{{ t.hero.subtitle }}</p>
          <div class="hero-buttons">
            <router-link to="/app" class="btn-large btn-primary">{{ t.hero.launchApp }}</router-link>
            <a href="#product" class="btn-large btn-secondary">{{ t.hero.learnMore }}</a>
          </div>
          <div class="hero-stats">
            <div class="stat">
              <span class="stat-number">10K+</span>
              <span class="stat-label">{{ t.hero.documentsIndexed }}</span>
            </div>
            <div class="stat">
              <span class="stat-number">99.9%</span>
              <span class="stat-label">{{ t.hero.uptime }}</span>
            </div>
            <div class="stat">
              <span class="stat-number">400ms</span>
              <span class="stat-label">{{ t.hero.avgSearch }}</span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="floating-card card-1" data-scroll>
            <div class="card-icon">
              <SvgIcons icon="books" />
            </div>
            <p>{{ t.heroCards.knowledgeBase }}</p>
          </div>
          <div class="floating-card card-2" data-scroll>
            <div class="card-icon">
              <SvgIcons icon="search" />
            </div>
            <p>{{ t.heroCards.smartSearch }}</p>
          </div>
          <div class="floating-card card-3" data-scroll>
            <div class="card-icon">
              <SvgIcons icon="robot" />
            </div>
            <p>{{ t.heroCards.aiInsights }}</p>
          </div>
          <svg class="circle-svg" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="url(#gradient)" stroke-width="2" opacity="0.3"/>
            <circle cx="100" cy="100" r="60" fill="none" stroke="url(#gradient)" stroke-width="1.5" opacity="0.2"/>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#4a90e2;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#66b3ff;stop-opacity:1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </section>

    <!-- Product Features Section -->
    <section id="product" class="product-section">
      <div class="section-container">
        <div class="section-header">
          <h2>{{ t.product.title }}</h2>
          <p>{{ t.product.subtitle }}</p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card" v-for="(feature, index) in t.product.features" :key="index" :style="{ '--index': index }" data-scroll>
            <div class="feature-bg"></div>
            <div class="feature-icon">
              <SvgIcons :icon="['books', 'search', 'robot', 'chart', 'lock', 'lightning'][index]" />
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
            <div class="feature-arrow">→</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section id="team" class="team-section">
      <div class="section-container">
        <div class="section-header">
          <h2>{{ t.team.title }}</h2>
          <p>{{ t.team.subtitle }}</p>
        </div>
        
        <div class="team-grid">
          <div class="team-card" v-for="(member, index) in t.team.members" :key="index" :style="{ '--delay': index * 0.1 + 's' }" data-scroll>
            <div class="team-avatar">
              <SvgIcons :icon="['user', 'user', 'user'][index]" />
            </div>
            <h3>{{ member.name }}</h3>
            <p class="role">{{ member.role }}</p>
            <p class="bio">{{ member.bio }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Goals Section -->
    <section id="goals" class="goals-section">
      <div class="section-container">
        <div class="section-header">
          <h2>{{ t.goals.title }}</h2>
          <p>{{ t.goals.subtitle }}</p>
        </div>
        
        <div class="goals-grid">
          <div class="goal-card" v-for="(goal, index) in t.goals.items" :key="index" :style="{ '--delay': index * 0.15 + 's' }" data-scroll>
            <div class="goal-number">{{ String(index + 1).padStart(2, '0') }}</div>
            <h3>{{ goal.title }}</h3>
            <p>{{ goal.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="contact-section">
      <div class="section-container">
        <div class="section-header">
          <h2>{{ t.contact.title }}</h2>
          <p>{{ t.contact.subtitle }}</p>
        </div>
        
        <div class="contact-grid">
          <div class="contact-card" v-for="(contact, index) in t.contact.items" :key="index" :style="{ '--delay': index * 0.1 + 's' }" data-scroll>
            <div class="contact-icon">
              <SvgIcons :icon="['mail', 'phone', 'telegram', 'code'][index]" />
            </div>
            <h3>{{ contact.title }}</h3>
            <a :href="getContactHref(index)" :target="getContactTarget(index)">{{ contact.text }}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-content">
          <p>{{ t.footer.copyright }}</p>
          <div class="footer-links">
            <a href="#product">{{ t.footer.product }}</a>
            <a href="#team">{{ t.footer.team }}</a>
            <a href="#goals">{{ t.footer.goals }}</a>
            <a href="#contact">{{ t.footer.contact }}</a>
          </div>
        </div>
        <button class="scroll-to-top" @click="scrollToTop" v-if="showScrollTop">
          <SvgIcons icon="arrowUp" />
        </button>
      </div>
    </footer>
  </div>
</template>

<script>
import { translations } from '../i18n.js'
import SvgIcons from './SvgIcons.vue'

export default {
  name: 'LandingPage',
  components: {
    SvgIcons
  },
  data() {
    return {
      darkMode: false,
      showScrollTop: false,
      language: 'en',
      isMobileMenuOpen: false,
      isMobile: window.innerWidth <= 768,
      scrollProgress: 0,
      scrollElements: []
    }
  },
  computed: {
    t() {
      return translations[this.language]
    }
  },
  mounted() {
    // Load saved preferences
    const darkMode = localStorage.getItem('darkMode') === 'true'
    const language = localStorage.getItem('language') || 'en'
    
    this.darkMode = darkMode
    this.language = language
    this.isMobile = window.innerWidth <= 768
    
    if (darkMode) {
      document.documentElement.classList.add('dark-mode')
    }
    
    // Set HTML lang attribute
    document.documentElement.lang = language
    
    // Setup scroll elements for intersection observer
    this.$nextTick(() => {
      this.scrollElements = document.querySelectorAll('[data-scroll]')
      this.setupIntersectionObserver()
    })
    
    window.addEventListener('scroll', this.handleScroll)
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
    window.removeEventListener('resize', this.handleResize)
    document.body.style.overflow = '';
  },
  methods: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      localStorage.setItem('darkMode', this.darkMode)
      document.documentElement.classList.toggle('dark-mode')
      // Notify icon components about dark mode change
      window.dispatchEvent(new Event('darkModeChange'))
    },
    toggleLanguage() {
      this.language = this.language === 'en' ? 'ru' : 'en'
      localStorage.setItem('language', this.language)
      document.documentElement.lang = this.language
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
      if (this.isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
      document.body.style.overflow = '';
    },
    handleResize() {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isMobile) {
        this.closeMobileMenu();
      }
    },
    handleScroll() {
      this.showScrollTop = window.scrollY > 300
      
      // Calculate scroll progress
      const windowHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = (window.scrollY / windowHeight) * 100
      this.scrollProgress = Math.min(scrolled, 100)
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    getContactHref(index) {
      const hrefs = [
        'mailto:info.wikiai@gmail.com',  // Email
        'tel:+375297345682',            // Phone
        'https://t.me/vikigolubeva',    // Telegram
        '/index.html'                    // Support
      ]
      return hrefs[index] || '#'
    },
    getContactTarget(index) {
      return index < 2 ? '_blank' : ''
    },
    setupIntersectionObserver() {
      const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-visible')
            observer.unobserve(entry.target)
          }
        })
      }, options)
      
      this.scrollElements.forEach((el) => {
        observer.observe(el)
      })
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Scroll Progress Bar */
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light), var(--color-primary));
  z-index: 2000;
  transition: width 0.1s ease-out;
  box-shadow: 0 0 8px var(--color-primary-light);
}

.landing-page {
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
  color: var(--color-text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  overflow-x: hidden;
  position: relative;
  min-height: 100%;
  width: 100%;
  display: block;
  visibility: visible;
  opacity: 1;
  scroll-behavior: smooth;
}

.dark-mode .landing-page {
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
  color: var(--color-text-primary);
}

/* Animated Background */
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.1;
  mix-blend-mode: multiply;
}

.blob-1 {
  width: 300px;
  height: 300px;
  background: #4a90e2;
  top: -50px;
  left: -50px;
  animation: float 8s ease-in-out infinite;
}

.blob-2 {
  width: 250px;
  height: 250px;
  background: #66b3ff;
  bottom: -50px;
  right: -50px;
  animation: float 10s ease-in-out infinite 2s;
}

.blob-3 {
  width: 200px;
  height: 200px;
  background: #8ab4f8;
  top: 50%;
  left: 50%;
  animation: float 12s ease-in-out infinite 4s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(30px, -30px); }
  50% { transform: translate(-20px, 20px); }
  75% { transform: translate(20px, 30px); }
}

/* Header */
.landing-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(74, 144, 226, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  animation: slideDown 0.6s ease-out;
}

.dark-mode .landing-header {
  background: rgba(15, 17, 19, 0.95);
  border-bottom-color: rgba(102, 179, 255, 0.1);
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.logo-section:hover {
  transform: scale(1.05);
}

.logo-icon {
  font-size: 28px;
  animation: spin 3s linear infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a90e2;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.logo-text h1 {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #4a90e2, #66b3ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-text .tagline {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.dark-mode .logo-text .tagline {
  color: #999;
}

.header-nav {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.nav-link {
  color: #1a1a2e;
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  position: relative;
  transition: all 0.3s ease;
  padding: 6px 0;
}

.dark-mode .nav-link {
  color: #e0e0e0;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #4a90e2, #66b3ff);
  transition: width 0.3s ease;
}

.nav-link:hover {
  color: #4a90e2;
}

.dark-mode .nav-link:hover {
  color: #66b3ff;
}

.nav-link:hover::after {
  width: 100%;
}

.theme-toggle {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.3s ease;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a90e2;
}

.dark-mode .theme-toggle {
  color: #66b3ff;
}

.theme-toggle:hover {
  transform: rotate(20deg) scale(1.1);
}

.lang-toggle {
  background: rgba(74, 144, 226, 0.1);
  color: #4a90e2;
  border: 1px solid #4a90e2;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dark-mode .lang-toggle {
  background: rgba(102, 179, 255, 0.1);
  color: #66b3ff;
  border-color: #66b3ff;
}

.lang-toggle:hover {
  background: rgba(74, 144, 226, 0.2);
  transform: scale(1.05);
}

.dark-mode .lang-toggle:hover {
  background: rgba(102, 179, 255, 0.2);
}

.btn-primary {
  background: linear-gradient(135deg, #4a90e2, #2e5c99);
  color: white;
  padding: 10px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
}

/* Hero Section */
.hero {
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 24px 80px;
  position: relative;
  z-index: 10;
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-title {
  font-size: clamp(36px, 6vw, 56px);
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  z-index: 10;
}

.word {
  display: inline-block;
  animation: fadeInUp 0.8s ease-out backwards;
}

.word:nth-child(1) { animation-delay: 0.1s; }
.word:nth-child(2) { animation-delay: 0.2s; }
.word:nth-child(3) { animation-delay: 0.3s; }
.word:nth-child(4) { animation-delay: 0.4s; }

.word.highlight {
  background: linear-gradient(135deg, #4a90e2, #66b3ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

.hero-subtitle {
  font-size: clamp(16px, 2vw, 18px);
  color: #666;
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 500px;
  animation: fadeInUp 0.8s ease-out 0.5s backwards;
}

.dark-mode .hero-subtitle {
  color: #aaa;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
  animation: fadeInUp 0.8s ease-out 0.6s backwards;
}

.btn-large {
  padding: 14px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  display: inline-block;
  border: none;
  cursor: pointer;
}

.btn-secondary {
  background: rgba(74, 144, 226, 0.1);
  color: #4a90e2;
  border: 2px solid #4a90e2;
}

.dark-mode .btn-secondary {
  background: rgba(102, 179, 255, 0.1);
  color: #66b3ff;
  border-color: #66b3ff;
}

.btn-secondary:hover {
  background: rgba(74, 144, 226, 0.2);
  transform: translateY(-2px);
}

.hero-stats {
  display: flex;
  gap: 40px;
  animation: fadeInUp 0.8s ease-out 0.7s backwards;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #4a90e2;
}

.dark-mode .stat-number {
  color: #66b3ff;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.hero-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  animation: fadeInUp 0.8s ease-out 0.8s backwards;
}

.floating-card {
  position: absolute;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
}

.dark-mode .floating-card {
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.card-1 {
  top: 10px;
  left: 20px;
  animation: float-card 3s ease-in-out infinite;
}

.card-2 {
  bottom: 30px;
  right: 40px;
  animation: float-card 4s ease-in-out infinite 1s;
}

.card-3 {
  top: 50%;
  right: 20px;
  animation: float-card 3.5s ease-in-out infinite 0.5s;
}

@keyframes float-card {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.card-icon {
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a90e2;
  min-height: 32px;
}

.dark-mode .card-icon {
  color: #66b3ff;
}

.floating-card p {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}

.dark-mode .floating-card p {
  color: #e0e0e0;
}

.circle-svg {
  position: absolute;
  width: 300px;
  height: 300px;
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Product Section */
.product-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 24px;
  position: relative;
  z-index: 10;
  background: rgba(255, 255, 255, 0.5);
}

.dark-mode .product-section {
  background: rgba(15, 17, 19, 0.5);
}

.section-container {
  width: 100%;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-header h2 {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 16px;
  animation: fadeInUp 0.8s ease-out;
}

.section-header p {
  font-size: 18px;
  color: #666;
  animation: fadeInUp 0.8s ease-out 0.2s backwards;
}

.dark-mode .section-header p {
  color: #aaa;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.feature-card {
  background: white;
  padding: 32px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(74, 144, 226, 0.1);
  animation: fadeInUp 0.8s ease-out backwards;
  animation-delay: calc(var(--index) * 0.1s);
}

.dark-mode .feature-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(102, 179, 255, 0.1);
}

.feature-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.1), rgba(102, 179, 255, 0.05));
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.3s ease;
  z-index: 0;
}

.feature-card:hover .feature-bg {
  transform: scaleY(1);
}

.feature-icon {
  font-size: 40px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  z-index: 1;
  position: relative;
  color: #4a90e2;
  min-height: 40px;
}

.dark-mode .feature-icon {
  color: #66b3ff;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1) rotate(10deg);
}

.feature-card h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #1a1a2e;
  position: relative;
  z-index: 1;
}

.dark-mode .feature-card h3 {
  color: #e0e0e0;
}

.feature-card p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

.dark-mode .feature-card p {
  color: #aaa;
}

.feature-arrow {
  position: absolute;
  bottom: 16px;
  right: 16px;
  font-size: 24px;
  opacity: 0;
  transform: translate(-10px, 10px);
  transition: all 0.3s ease;
}

.feature-card:hover .feature-arrow {
  opacity: 1;
  transform: translate(0, 0);
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(74, 144, 226, 0.15);
}

/* Scroll Reveal Animation */
[data-scroll] {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

[data-scroll].scroll-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered Animation for Cards */
.floating-card[data-scroll],
.feature-card[data-scroll],
.team-card[data-scroll],
.goal-card[data-scroll],
.contact-card[data-scroll] {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.floating-card[data-scroll]:nth-child(1),
.feature-card[data-scroll]:nth-child(1),
.team-card[data-scroll]:nth-child(1),
.goal-card[data-scroll]:nth-child(1),
.contact-card[data-scroll]:nth-child(1) {
  transition-delay: 0s;
}

.floating-card[data-scroll]:nth-child(2),
.feature-card[data-scroll]:nth-child(2),
.team-card[data-scroll]:nth-child(2),
.goal-card[data-scroll]:nth-child(2),
.contact-card[data-scroll]:nth-child(2) {
  transition-delay: 0.1s;
}

.floating-card[data-scroll]:nth-child(3),
.feature-card[data-scroll]:nth-child(3),
.team-card[data-scroll]:nth-child(3),
.goal-card[data-scroll]:nth-child(3),
.contact-card[data-scroll]:nth-child(3) {
  transition-delay: 0.2s;
}

.feature-card[data-scroll]:nth-child(4),
.goal-card[data-scroll]:nth-child(4),
.contact-card[data-scroll]:nth-child(4) {
  transition-delay: 0.3s;
}

.feature-card[data-scroll]:nth-child(5) {
  transition-delay: 0.4s;
}

.feature-card[data-scroll]:nth-child(6) {
  transition-delay: 0.5s;
}

/* Team Section */
.team-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 24px;
  position: relative;
  z-index: 10;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

.team-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  padding: 32px;
  border-radius: 16px;
  text-align: center;
  border: 1px solid rgba(74, 144, 226, 0.1);
  transition: all 0.3s ease;
  animation: fadeInUp 0.8s ease-out backwards;
  animation-delay: var(--delay);
}

.dark-mode .team-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(102, 179, 255, 0.1);
}

.team-card:hover {
  transform: translateY(-12px);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 16px 32px rgba(74, 144, 226, 0.2);
}

.dark-mode .team-card:hover {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 16px 32px rgba(102, 179, 255, 0.15);
}

.team-avatar {
  font-size: 64px;
  margin-bottom: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  color: #4a90e2;
  min-height: 64px;
  min-width: 64px;
}

.dark-mode .team-avatar {
  color: #66b3ff;
}

.team-card:hover .team-avatar {
  transform: scale(1.1) rotate(5deg);
}

.team-card h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1a1a2e;
}

.dark-mode .team-card h3 {
  color: #e0e0e0;
}

.role {
  color: #4a90e2;
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 14px;
}

.dark-mode .role {
  color: #66b3ff;
}

.bio {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.dark-mode .bio {
  color: #aaa;
}

/* Goals Section */
.goals-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 24px;
  position: relative;
  z-index: 10;
  background: rgba(74, 144, 226, 0.05);
  border-radius: 20px;
  margin-bottom: 60px;
}

.dark-mode .goals-section {
  background: rgba(102, 179, 255, 0.05);
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.goal-card {
  background: white;
  padding: 32px;
  border-radius: 12px;
  border-left: 4px solid #4a90e2;
  position: relative;
  animation: fadeInUp 0.8s ease-out backwards;
  animation-delay: var(--delay);
}

.dark-mode .goal-card {
  background: rgba(255, 255, 255, 0.05);
  border-left-color: #66b3ff;
}

.goal-number {
  display: inline-block;
  font-size: 36px;
  font-weight: 700;
  color: #4a90e2;
  opacity: 0.3;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.goal-card:hover .goal-number {
  opacity: 1;
  color: #2e5c99;
  transform: scale(1.1);
}

.dark-mode .goal-card:hover .goal-number {
  color: #66b3ff;
}

.goal-card h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #1a1a2e;
}

.dark-mode .goal-card h3 {
  color: #e0e0e0;
}

.goal-card p {
  color: #666;
  line-height: 1.6;
  font-size: 14px;
}

.dark-mode .goal-card p {
  color: #aaa;
}

/* Contact Section */
.contact-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 24px;
  position: relative;
  z-index: 10;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.contact-card {
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.1), rgba(102, 179, 255, 0.05));
  padding: 32px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(74, 144, 226, 0.2);
  transition: all 0.3s ease;
  animation: fadeInUp 0.8s ease-out backwards;
  animation-delay: var(--delay);
  cursor: pointer;
}

.dark-mode .contact-card {
  background: linear-gradient(135deg, rgba(102, 179, 255, 0.1), rgba(102, 179, 255, 0.05));
  border-color: rgba(102, 179, 255, 0.2);
}

.contact-card:hover {
  transform: translateY(-8px);
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.2), rgba(102, 179, 255, 0.1));
  box-shadow: 0 12px 24px rgba(74, 144, 226, 0.2);
}

.dark-mode .contact-card:hover {
  background: linear-gradient(135deg, rgba(102, 179, 255, 0.2), rgba(102, 179, 255, 0.15));
  box-shadow: 0 12px 24px rgba(102, 179, 255, 0.15);
}

.contact-icon {
  font-size: 40px;
  margin-bottom: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  color: #4a90e2;
  min-height: 40px;
  min-width: 40px;
}

.dark-mode .contact-icon {
  color: #66b3ff;
}

.contact-card:hover .contact-icon {
  transform: scale(1.1) rotate(-10deg);
}

.contact-card h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #1a1a2e;
}

.dark-mode .contact-card h3 {
  color: #e0e0e0;
}

.contact-card a {
  color: #4a90e2;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.dark-mode .contact-card a {
  color: #66b3ff;
}

.contact-card a:hover {
  color: #2e5c99;
  text-decoration: underline;
}

/* Footer */
.footer {
  background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%);
  color: white;
  padding: 40px 24px;
  position: relative;
  z-index: 10;
}

.dark-mode .footer {
  background: linear-gradient(135deg, #0a0d10 0%, #0f1113 100%);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-content {
  flex: 1;
}

.footer-content p {
  margin-bottom: 12px;
  font-size: 14px;
  opacity: 0.8;
}

.footer-links {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.footer-links a {
  color: #aaa;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #4a90e2;
}

.dark-mode .footer-links a:hover {
  color: #66b3ff;
}

.scroll-to-top {
  background: linear-gradient(135deg, #4a90e2, #66b3ff);
  color: white;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.scroll-to-top:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  padding: 12px;
  cursor: pointer;
  z-index: 1001;
}

.menu-icon {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 20px;
  position: relative;
}

.menu-icon span {
  display: block;
  width: 100%;
  height: 2px;
  background-color: #1a1a2e;
  transition: all 0.3s ease;
  transform-origin: center;
}

.dark-mode .menu-icon span {
  background-color: #e0e0e0;
}

.menu-icon.open span:nth-child(1) {
  transform: translateY(9px) rotate(45deg);
}

.menu-icon.open span:nth-child(2) {
  opacity: 0;
}

.menu-icon.open span:nth-child(3) {
  transform: translateY(-9px) rotate(-45deg);
}

/* Responsive Design */
@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: block;
  }

  .header-container {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
  }

  .header-nav {
    position: fixed;
    top: 0;
    right: -100%;
    width: 80%;
    max-width: 320px;
    height: 100vh;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    flex-direction: column;
    justify-content: flex-start;
    padding: 80px 24px 24px;
    transition: right 0.3s ease-in-out;
    z-index: 1000;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
  }

  .dark-mode .header-nav {
    background: rgba(15, 17, 19, 0.98);
  }

  .header-nav.mobile-visible {
    right: 0;
  }

  .nav-link {
    padding: 12px 0;
    font-size: 16px;
    display: block;
    width: 100%;
    text-align: left;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .dark-mode .nav-link {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .nav-actions {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }

  .theme-toggle,
  .lang-toggle {
    width: 100%;
    justify-content: center;
  }

  .hero {
    padding: 80px 16px 60px;
  }

  .hero-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .hero-title {
    font-size: 36px;
    margin-bottom: 16px;
  }

  .hero-subtitle {
    font-size: 16px;
    margin-bottom: 24px;
  }

  .hero-buttons {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 32px;
  }

  .btn-large {
    width: 100%;
    text-align: center;
  }

  .hero-stats {
    flex-direction: column;
    gap: 20px;
  }

  .hero-visual {
    height: 300px;
    margin-top: 20px;
  }

  .floating-card {
    padding: 16px;
    max-width: 140px;
  }

  .section-header h2 {
    font-size: 32px;
  }

  .section-header p {
    font-size: 16px;
  }

  .features-grid,
  .team-grid,
  .goals-grid,
  .contact-grid {
    grid-template-columns: 1fr;
  }

  .feature-card,
  .team-card,
  .goal-card,
  .contact-card {
    padding: 24px 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .footer-container {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }

  .footer-links {
    justify-content: center;
  }

  .scroll-to-top {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }
  
  .hero {
    padding: 60px 24px 40px;
  }

  .hero-title {
    font-size: 36px;
  }

  .hero-visual {
    height: 300px;
  }

  .circle-svg {
    width: 200px;
    height: 200px;
  }

  .hero-stats {
    gap: 20px;
  }

  .section-header h2 {
    font-size: 28px;
  }

  .feature-card,
  .team-card,
  .goal-card,
  .contact-card {
    padding: 24px;
  }

  .features-grid,
  .team-grid,
  .goals-grid,
  .contact-grid {
    grid-template-columns: 1fr;
  }

  .footer-container {
    flex-direction: column;
    gap: 24px;
  }

  .footer-links {
    justify-content: center;
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

@media (max-width: 480px) {
  .logo-text h1 {
    font-size: 20px;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-buttons {
    flex-direction: column;
  }

  .btn-large {
    width: 100%;
    text-align: center;
  }
}
}
</style>
