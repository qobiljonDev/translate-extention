<template>
  <div
    class="h-[450px] flex flex-col font-sans overflow-hidden transition-colors duration-300"
    :class="theme === 'light'
      ? 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 text-gray-900'
      : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white'"
  >
    <!-- Header -->
    <div class="relative overflow-hidden flex-shrink-0">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-transparent"></div>
      <div class="relative flex items-center justify-center gap-3 px-6 pt-7 pb-5">
        <div class="p-2.5 bg-blue-500/10 rounded-xl ring-1 ring-blue-500/20">
          <Icon name="translate" :size="24" class="text-blue-400" />
        </div>
        <div>
          <h1 class="text-lg font-bold tracking-tight">UZ Hover Translator</h1>
          <p class="text-[11px] -mt-0.5" :class="theme === 'light' ? 'text-gray-400' : 'text-slate-400'">Tez va qulay tarjimon</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <TabBar v-model="activeTab" :tabs="tabs" />

    <!-- Content -->
    <div class="flex-1 overflow-y-auto custom-scroll px-6 py-6">
      <KeepAlive>
        <TranslateTab v-if="activeTab === 'translate'" v-model:lang="selectedLang" />
      </KeepAlive>
      <KeepAlive>
        <HistoryTab v-if="activeTab === 'history'" />
      </KeepAlive>
      <KeepAlive>
        <FavoritesTab v-if="activeTab === 'favorites'" />
      </KeepAlive>
      <KeepAlive>
        <SettingsTab v-if="activeTab === 'settings'" :theme="theme" @update:theme="setTheme" />
      </KeepAlive>
    </div>

    <!-- Footer -->
    <div class="px-6 pb-4 pt-2 flex-shrink-0">
      <div class="flex items-center justify-center gap-3 text-[10px]" :class="theme === 'light' ? 'text-gray-400' : 'text-slate-600'">
        <span>Ctrl+Shift+T</span>
        <span class="w-1 h-1 rounded-full" :class="theme === 'light' ? 'bg-gray-300' : 'bg-slate-700'"></span>
        <span>{{ t("shortcutHint") }}</span>
        <span class="w-1 h-1 rounded-full" :class="theme === 'light' ? 'bg-gray-300' : 'bg-slate-700'"></span>
        <span>{{ t("rightClick") }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, provide, onMounted } from "vue";
import { storage } from "./services/chrome.js";
import { t, loadUILang } from "./services/i18n.js";
import { useTheme } from "./composables/useTheme.js";
import { initVoices } from "./services/tts.js";
import Icon from "./components/ui/Icon.vue";
import TabBar from "./components/ui/TabBar.vue";
import TranslateTab from "./components/TranslateTab.vue";
import HistoryTab from "./components/HistoryTab.vue";
import FavoritesTab from "./components/FavoritesTab.vue";
import SettingsTab from "./components/SettingsTab.vue";

const activeTab = ref("translate");
const selectedLang = ref("uz");
const { theme, load: loadTheme, set: setTheme } = useTheme();
provide("theme", theme);

const tabs = computed(() => [
  { id: "translate", label: t("translateTab"), icon: "translate" },
  { id: "history", label: t("historyTab"), icon: "history" },
  { id: "favorites", label: t("favoritesTab"), icon: "star" },
  { id: "settings", label: t("settingsTab"), icon: "settings" },
]);

onMounted(() => {
  loadUILang();
  loadTheme();
  storage.sync.get("targetLang", (result) => {
    if (result.targetLang) selectedLang.value = result.targetLang;
  });
  initVoices();
});
</script>
