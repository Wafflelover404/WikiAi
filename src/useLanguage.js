import { ref } from 'vue'
import { translations } from './i18n.js'

const language = ref('en')
const isDarkMode = ref(false)

export function useLanguage() {
  // Load from localStorage on first use
  if (language.value === 'en') {
    const savedLanguage = localStorage.getItem('language') || 'en'
    language.value = savedLanguage
    
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    isDarkMode.value = savedDarkMode
  }

  const t = {
    ...translations[language.value]
  }

  const setLanguage = (lang) => {
    if (translations[lang]) {
      language.value = lang
      localStorage.setItem('language', lang)
      document.documentElement.lang = lang
    }
  }

  const toggleLanguage = () => {
    setLanguage(language.value === 'en' ? 'ru' : 'en')
  }

  const getLanguage = () => language.value

  const getTranslations = () => translations[language.value]

  return {
    language,
    t,
    setLanguage,
    toggleLanguage,
    getLanguage,
    getTranslations
  }
}
