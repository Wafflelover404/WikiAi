<template>
  <div class="svg-icon" :class="`icon-${icon}`">
    <img 
      :src="getIconPath()" 
      :alt="icon"
      class="icon"
      :style="iconStyle"
    />
  </div>
</template>

<script>
export default {
  name: 'SvgIcons',
  props: {
    icon: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isDarkMode: false,
      observer: null,
      iconMap: {
        'sparkles': 'sparkle-circle.svg',     // sparkle circle for logo
        'books': 'book-bookmark.svg',         // book with bookmark for knowledge
        'search': 'magnifer.svg',             // magnifying glass for search
        'robot': 'cpu.svg',                   // CPU for AI features
        'chart': 'chart-2.svg',               // chart for analytics
        'lock': 'lock-keyhole.svg',           // lock for security
        'lightning': 'bolt.svg',              // bolt for speed
        'code': 'code-2.svg',                 // code symbol
        'user': 'user-circle.svg',            // user circle for team
        'mail': 'letter.svg',                 // letter for email
        'briefcase': 'briefcase.svg',         // briefcase for business
        'telegram': 'chat-round.svg',         // chat bubble for messaging
        'phone': 'phone.svg',                 // phone for contact
        'github': 'github.svg',               // github logo
        'arrowUp': 'arrow-to-top-left.svg',   // arrow up for back to top
        'moon': 'moon-sleep.svg',             // moon for dark mode
        'sun': 'sun-2.svg',                   // sun for light mode
        'home': 'home-2.svg',                 // home icon
        'eye': 'eye-scan.svg',                // eye for show password
        'eye-closed': 'eye-closed.svg',       // closed eye for hide password
        'russia': 'translation-2.svg',        // translation icon for Russian
        'uk': 'translation.svg'               // translation icon for English
      }
    }
  },
  computed: {
    iconStyle() {
      if (this.isDarkMode) {
        return {
          filter: 'invert(1) brightness(1.8) saturate(0.9)',
          opacity: '0.95'
        }
      }
      return {
        filter: 'invert(0) brightness(1) saturate(1)',
        opacity: '0.9'
      }
    }
  },
  methods: {
    getIconPath() {
      return `/solar-linear-icons/${this.iconMap[this.icon] || 'sparkle-circle.svg'}`
    },
    updateDarkMode() {
      this.isDarkMode = document.documentElement.classList.contains('dark-mode')
    }
  },
  mounted() {
    this.updateDarkMode()
    // Listen for theme changes
    this.observer = new MutationObserver(this.updateDarkMode)
    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}
</script>

<style scoped>
.svg-icon {
  display: inline-flex;
  width: 1em;
  height: 1em;
  line-height: 1;
  background-color: transparent;
}

.icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: filter 0.3s ease, opacity 0.3s ease;
  background-color: transparent !important;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translateZ(0);
}

/* Ensure proper rendering in all browsers */
.icon {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: currentColor;
}

/* Dark mode overrides */
.dark-mode .icon {
  filter: brightness(1.8) saturate(0.9);
  opacity: 0.95;
}
</style>
