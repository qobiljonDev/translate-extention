<template>
  <div class="space-y-5">
    <!-- Interfeys tili -->
    <div>
      <label class="block text-[11px] font-semibold uppercase tracking-wider mb-2.5" :class="theme === 'light' ? 'text-gray-500' : 'text-slate-400'">{{ t('language') }}</label>
      <div class="flex gap-2">
        <button
          v-for="lang in uiLanguages"
          :key="lang.code"
          @click="changeUILang(lang.code)"
          class="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
          :class="currentUILang === lang.code
            ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30'
            : theme === 'light'
              ? 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300'"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 00-1.38-3.56A8.03 8.03 0 0118.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 015.08 16zm2.95-8H5.08a7.987 7.987 0 014.33-3.56A15.65 15.65 0 008.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 01-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" fill="currentColor"/></svg>
          {{ lang.label }}
        </button>
      </div>
    </div>

    <!-- Tema -->
    <div>
      <label class="block text-[11px] font-semibold uppercase tracking-wider mb-2.5" :class="theme === 'light' ? 'text-gray-500' : 'text-slate-400'">{{ t('theme') }}</label>
      <div class="flex gap-2">
        <button
          @click="setTheme('dark')"
          class="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          :class="theme === 'dark'
            ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30'
            : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" fill="currentColor"/>
          </svg>
          {{ t('dark') }}
        </button>
        <button
          @click="setTheme('light')"
          class="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          :class="theme === 'light'
            ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30'
            : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300'"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z" fill="currentColor"/>
          </svg>
          {{ t('light') }}
        </button>
      </div>
    </div>

    <!-- Eksport/Import -->
    <div>
      <label class="block text-[11px] font-semibold uppercase tracking-wider mb-2.5" :class="theme === 'light' ? 'text-gray-500' : 'text-slate-400'">{{ t('exportBtn') }} / {{ t('importBtn') }}</label>
      <div class="space-y-2">
        <button
          @click="doExportAll"
          class="w-full py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
          </svg>
          {{ t('exportAll') }}
        </button>
      </div>
    </div>

    <!-- Offline cache -->
    <div>
      <label class="block text-[11px] font-semibold uppercase tracking-wider mb-2.5" :class="theme === 'light' ? 'text-gray-500' : 'text-slate-400'">{{ t('offlineCache') }}</label>
      <button
        @click="handleClearCache"
        class="w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        :class="cacheCleared
          ? 'bg-green-500/15 text-green-400'
          : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'"
      >
        <svg v-if="!cacheCleared" width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
        </svg>
        {{ cacheCleared ? t('cacheCleared') : t('clearCache') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { t, currentUILang, setUILang, uiLanguages } from "../services/i18n.js";
import { clearOfflineCache } from "../services/cache.js";
import { exportAll } from "../services/export.js";

const props = defineProps({
  theme: { type: String, default: "dark" },
});

const emit = defineEmits(["update:theme"]);

const cacheCleared = ref(false);

function changeUILang(code) {
  setUILang(code);
}

function setTheme(value) {
  emit("update:theme", value);
}

function doExportAll() {
  exportAll();
}

function handleClearCache() {
  clearOfflineCache();
  cacheCleared.value = true;
  setTimeout(() => (cacheCleared.value = false), 2000);
}
</script>
