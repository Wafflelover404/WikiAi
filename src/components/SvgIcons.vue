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
        'sparkles': 'star.svg',                 // star for logo
        'books': 'book-bookmark.svg',         // book with bookmark for knowledge
        'search': 'magnifer.svg',             // magnifying glass for search
        'robot': 'cpu.svg',                   // CPU for AI features
        'chart': 'chart-2.svg',               // chart for analytics
        'lock': 'lock-keyhole.svg',           // lock for security
        'lightning': 'bolt.svg',              // bolt for speed
        'code': 'code-2.svg',                 // code symbol
        'user': 'user-circle.svg',            // user circle for team
        'mail': 'letter.svg',                 // letter for email
        'briefcase': 'suitcase.svg',         // suitcase for business
        'telegram': 'chat-round.svg',         // chat bubble for messaging
        'phone': 'phone.svg',                 // phone for contact
        'github': 'star.svg',                 // star for github (no github icon available)
        'arrowUp': 'arrow-to-top-left.svg',   // arrow up for back to top
        'moon': 'moon-sleep.svg',             // moon for dark mode
        'sun': 'sun-2.svg',                   // sun for light mode
        'home': 'home-2.svg',                 // home icon
        'eye': 'eye-scan.svg',                // eye for show password
        'eye-closed': 'eye-closed.svg',       // closed eye for hide password
        'russia': 'translation-2.svg',        // translation icon for Russian
        'uk': 'translation.svg',              // translation icon for English
        'folder': 'folder.svg',               // folder for file list
        'brain': 'lightbulb-minimalistic.svg', // lightbulb for quiz/brain
        'clipboard': 'clipboard.svg',         // clipboard for copy
        'printer': 'printer.svg',             // printer for print
        'download': 'download.svg',           // download arrow
        'inbox': 'inbox.svg',                 // inbox for empty state
        'danger': 'danger-circle.svg',        // danger/warning icon
        'world': 'earth.svg',                  // globe for all/world
        'document': 'document.svg',           // document file
        'notebook': 'notebook.svg',           // notebook
        'book': 'book-2.svg',                 // book
        'palette': 'palette.svg',             // palette for CSS
        'chat': 'chat-round.svg',             // chat/messenger
        'key': 'key.svg',                     // key for password
        'person': 'user.svg',                 // person/user
        'role': 'user-rounded.svg',           // role/user
        'package': 'box.svg',                 // package/box
        'refresh': 'refresh.svg',             // refresh/reload
        'checkmark': 'check-circle.svg',      // checkmark/success
        'close': 'close-circle.svg',          // close/error
        'blocked': 'forbidden-circle.svg',    // blocked/no access
        'listing': 'list-check.svg',          // list for listings
        'shopping': 'shop-2.svg',             // shopping/store for products
        'settings': 'settings.svg',           // settings/gear
        'plug': 'power.svg',                  // plug/power
        'info': 'info-circle.svg',            // info icon
        'tools': 'tuning.svg',                // tools/wrench
        'clock': 'history.svg',               // clock/history
        'edit': 'pen.svg',                    // edit/pencil
        'trash': 'trash-bin-2.svg',           // trash bin for delete
        'target': 'target.svg',               // target/aim
        'lightbulb': 'lightbulb.svg',         // lightbulb/idea
        'gift': 'gift.svg',                   // gift
        'arrow-right': 'arrow-right.svg',     // arrow right
        'flag-ru': 'translation-2.svg',       // russia flag
        'flag-gb': 'translation.svg',         // GB flag
        'green-circle': 'check-circle.svg',   // green circle/success
        'trending-up': 'circle-top-up.svg',   // trending up
        'trending-down': 'circle-top-down.svg', // trending down
        'pause': 'alarm-pause.svg',           // pause icon
        'play': 'alarm-play.svg'              // play icon
      }
    }
  },
  computed: {
    iconStyle() {
      if (this.isDarkMode) {
        return {
          filter: 'invert(1) brightness(1.8) saturate(0.9)',
          opacity: '0.95'
        };
      }
      return {
        filter: 'invert(0) brightness(1) saturate(1)',
        opacity: '0.9'
      };
    }
  },
  methods: {
    getIconPath() {
      return `/solar-linear-icons/${this.iconMap[this.icon] || 'star.svg'}`;
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

/* Dark mode is handled via JavaScript iconStyle computed property */
</style>
