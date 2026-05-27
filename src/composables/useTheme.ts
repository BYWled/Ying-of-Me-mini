import { ref } from 'vue'

const isDark = ref(false)
let initialized = false

export function useTheme() {
  if (!initialized) {
    initialized = true
    try {
      const saved = uni.getStorageSync('theme_mode')
      if (saved === 'dark') {
        isDark.value = true
      } else if (saved === 'light') {
        isDark.value = false
      } else {
        const appBaseInfo = uni.getAppBaseInfo?.() as any
        isDark.value = (appBaseInfo?.theme || 'light') === 'dark'
      }
    } catch (_e) {
      isDark.value = false
    }

    uni.onThemeChange?.((res: any) => {
      const saved = uni.getStorageSync('theme_mode')
      if (saved !== 'light' && saved !== 'dark') {
        isDark.value = res.theme === 'dark'
      }
    })
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    uni.setStorageSync('theme_mode', isDark.value ? 'dark' : 'light')
    uni.vibrateShort?.({})
  }

  return { isDark, toggleTheme }
}
