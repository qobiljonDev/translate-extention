<template>
  <div
    class="w-[360px] min-h-[280px] bg-gradient-to-br from-slate-900 to-slate-800 text-white font-sans"
  >
    <div class="flex items-center justify-center gap-2 pt-4 pb-3 px-5">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"
          fill="#60a5fa"
        />
      </svg>
      <h2 class="text-base font-bold tracking-wide">UZ Hover Translator</h2>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-slate-700 px-5 gap-1">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-3 py-2 text-xs font-medium transition-all duration-200 rounded-t-lg -mb-px"
        :class="
          activeTab === tab.id
            ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50'
            : 'text-slate-400 hover:text-slate-300'
        "
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="p-4">
      <TranslateTab
        v-if="activeTab === 'translate'"
        v-model:lang="selectedLang"
      />
      <HistoryTab v-if="activeTab === 'history'" />
      <FavoritesTab v-if="activeTab === 'favorites'" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import TranslateTab from "./components/TranslateTab.vue";
import HistoryTab from "./components/HistoryTab.vue";
import FavoritesTab from "./components/FavoritesTab.vue";

const activeTab = ref("translate");
const selectedLang = ref("uz");

const tabs = [
  { id: "translate", label: "Tarjima" },
  { id: "history", label: "Tarix" },
  { id: "favorites", label: "Sevimlilar" },
];

onMounted(() => {
  chrome.storage.sync.get("targetLang", (result) => {
    if (result.targetLang) selectedLang.value = result.targetLang;
  });
  if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
  }
});
</script>

<style>
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 2px;
}
</style>
