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
          <Icon name="globe" :size="12" />
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
          <Icon name="moon" :size="14" />
          {{ t('dark') }}
        </button>
        <button
          @click="setTheme('light')"
          class="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          :class="theme === 'light'
            ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30'
            : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300'"
        >
          <Icon name="sun" :size="14" />
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
          <Icon name="download" :size="14" />
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
        <Icon v-if="!cacheCleared" name="delete" :size="14" />
        <Icon v-else name="check" :size="14" />
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
import Icon from "./ui/Icon.vue";

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
