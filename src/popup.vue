<template>
  <div
    class="h-[450px] flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans overflow-hidden"
  >
    <div class="relative overflow-hidden flex-shrink-0">
      <div
        class="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-transparent"
      ></div>
      <div
        class="relative flex items-center justify-center gap-3 px-6 pt-7 pb-5"
      >
        <div class="p-2.5 bg-blue-500/10 rounded-xl ring-1 ring-blue-500/20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"
              fill="#60a5fa"
            />
          </svg>
        </div>
        <div>
          <h1 class="text-lg font-bold tracking-tight">UZ Hover Translator</h1>
          <p class="text-[11px] text-slate-400 -mt-0.5">
            Tez va qulay tarjimon
          </p>
        </div>
      </div>
    </div>

    <!-- Tabs (fixed) -->
    <div
      class="flex px-6 gap-2 bg-slate-900/95 backdrop-blur-sm flex-shrink-0 z-10"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="flex-1 py-3.5 text-xs font-semibold tracking-wide transition-all duration-200 border-b-2 flex items-center justify-center gap-1.5"
        :class="
          activeTab === tab.id
            ? 'text-blue-400 border-blue-400 bg-blue-400/5'
            : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-600'
        "
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          v-html="tab.icon"
        ></svg>
        {{ tab.label }}
      </button>
    </div>

    <!-- Content (scrollable) -->
    <div class="flex-1 overflow-y-auto custom-scroll px-6 py-6">
      <KeepAlive>
        <TranslateTab
          v-if="activeTab === 'translate'"
          v-model:lang="selectedLang"
        />
      </KeepAlive>
      <KeepAlive>
        <HistoryTab v-if="activeTab === 'history'" />
      </KeepAlive>
      <KeepAlive>
        <FavoritesTab v-if="activeTab === 'favorites'" />
      </KeepAlive>
    </div>

    <!-- Footer (fixed) -->
    <div class="px-6 pb-5 pt-2 flex-shrink-0">
      <div
        class="flex items-center justify-center gap-3 text-[10px] text-slate-600"
      >
        <span>Ctrl+Shift+T</span>
        <span class="w-1 h-1 rounded-full bg-slate-700"></span>
        <span>Matn belgilang</span>
        <span class="w-1 h-1 rounded-full bg-slate-700"></span>
        <span>O'ng tugma</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { storage } from "./chrome.js";
import TranslateTab from "./components/TranslateTab.vue";
import HistoryTab from "./components/HistoryTab.vue";
import FavoritesTab from "./components/FavoritesTab.vue";

const activeTab = ref("translate");
const selectedLang = ref("uz");

const tabs = [
  {
    id: "translate",
    label: "Tarjima",
    icon: '<path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" fill="currentColor"/>',
  },
  {
    id: "history",
    label: "Tarix",
    icon: '<path d="M13 3a9 9 0 00-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21a9 9 0 000-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" fill="currentColor"/>',
  },
  {
    id: "favorites",
    label: "Sevimlilar",
    icon: '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/>',
  },
];

onMounted(() => {
  storage.sync.get("targetLang", (result) => {
    if (result.targetLang) selectedLang.value = result.targetLang;
  });
  if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
  }
});
</script>
