<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs" :class="light ? 'text-gray-500' : 'text-slate-400'">{{ items.length }} {{ t('favorites') }}</span>
      <div class="flex gap-2">
        <button
          v-if="items.length"
          @click="doExport"
          class="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/></svg>
          {{ t('exportBtn') }}
        </button>
        <button
          @click="doImport"
          class="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" fill="currentColor"/></svg>
          {{ t('importBtn') }}
        </button>
        <button
          v-if="items.length"
          @click="clear"
          class="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/></svg>
          {{ t('clear') }}
        </button>
      </div>
    </div>

    <div v-if="!items.length" class="text-center text-sm py-8" :class="light ? 'text-gray-400' : 'text-slate-500'">
      {{ t('noFavorites') }}
    </div>

    <div class="space-y-2">
      <TranslationItem
        v-for="(item, i) in items"
        :key="i"
        :item="item"
        :removable="true"
        @copy="copyText"
        @speak="speakText"
        @remove="remove(i)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed, onActivated, onMounted } from "vue";
import { t } from "../services/i18n.js";
import { useTTS } from "../composables/useTTS.js";
import { useFavorites } from "../composables/useFavorites.js";
import TranslationItem from "./TranslationItem.vue";

const theme = inject("theme", ref("dark"));
const light = computed(() => theme.value === "light");
const { speakText } = useTTS();
const { items, load, clear, remove, doExport, doImport } = useFavorites();

function copyText(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

onMounted(load);
onActivated(load);
</script>
