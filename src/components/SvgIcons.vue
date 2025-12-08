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
        'sparkles': 'bell-bing.svg',          // notification bell
        'books': 'clipboard-list.svg',         // clipboard with list (document/knowledge)
        'search': 'code-scan.svg',            // code scan (search/analysis)
        'robot': 'bomb-minimalistic.svg',     // bomb (unique/special)
        'chart': 'align-vertical-spacing.svg', // spacing (data visualization)
        'lock': 'archive-check.svg',           // archive with checkmark (secure)
        'lightning': 'bottle.svg',             // bottle (unique visual)
        'code': 'code-scan.svg',               // code scan
        'user': 'buildings.svg',               // buildings (community/team)
        'mail': 'clipboard-add.svg',           // clipboard add (communication)
        'briefcase': 'buildings-2.svg',        // buildings variant (business)
        'telegram': 'bell-off.svg',            // bell off (messaging)
        'github': 'corkscrew.svg',             // corkscrew (tools)
        'arrowUp': 'arrow-to-top-left.svg',   // arrow up-left
        'moon': 'circle-top-up.svg',           // circle up (dark theme)
        'sun': 'circle-bottom-down.svg'        // circle down (light theme)
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
