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
          <Icon name="download" :size="12" />
          {{ t('exportBtn') }}
        </button>
        <button
          @click="doImport"
          class="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Icon name="upload" :size="12" />
          {{ t('importBtn') }}
        </button>
        <button
          v-if="items.length"
          @click="clear"
          class="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Icon name="delete" :size="12" />
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
import Icon from "./ui/Icon.vue";

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
