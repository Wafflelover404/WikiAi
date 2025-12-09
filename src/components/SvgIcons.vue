<template>
  <div class="svg-icons" :class="{ 'dark-mode': isDarkMode }">
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
        'sun': 'sun-2.svg'                    // sun for light mode
      }
    }
  },
  computed: {
    iconStyle() {
      return {
        filter: this.isDarkMode 
          ? 'brightness(200%) saturate(100%)' 
          : 'brightness(0) saturate(100%)',
        opacity: this.isDarkMode ? '0.95' : '0.9'
      }
    }
  },
  mounted() {
    this.checkDarkMode()
    window.addEventListener('darkModeChange', this.checkDarkMode)
  },
  beforeUnmount() {
    window.removeEventListener('darkModeChange', this.checkDarkMode)
  },
  methods: {
    getIconPath() {
      return `/solar-linear-icons/${this.iconMap[this.icon] || 'bell.svg'}`
    },
    checkDarkMode() {
      this.isDarkMode = document.documentElement.classList.contains('dark-mode')
    }
  }
}
</script>

<style scoped>
.svg-icons {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 1em;
  height: 1em;
  display: inline-block;
  vertical-align: -0.125em;
  transition: filter 0.3s ease, opacity 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .icon {
    filter: brightness(200%) saturate(100%);
    opacity: 0.95;
  }
}
</style>
