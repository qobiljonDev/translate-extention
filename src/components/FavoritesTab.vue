<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs text-slate-400">{{ items.length }} ta sevimli</span>
      <button
        v-if="items.length"
        @click="clearAll"
        class="text-xs text-red-400 hover:text-red-300 transition-colors"
      >
        Tozalash
      </button>
    </div>

    <div v-if="!items.length" class="text-center text-slate-500 text-sm py-8">
      Sevimli so'zlar yo'q
    </div>

    <div class="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scroll">
      <TranslationItem
        v-for="(item, i) in items"
        :key="i"
        :item="item"
        :removable="true"
        @copy="copyText"
        @speak="speakAny"
        @remove="removeItem(i)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getTtsLang } from "../config.js";
import TranslationItem from "./TranslationItem.vue";

const items = ref([]);

onMounted(() => {
  chrome.storage.local.get("favorites", (result) => {
    items.value = result.favorites || [];
  });
});

function removeItem(index) {
  items.value.splice(index, 1);
  chrome.storage.local.set({ favorites: items.value });
}

function clearAll() {
  chrome.storage.local.set({ favorites: [] });
  items.value = [];
}

function copyText(text) {
  navigator.clipboard.writeText(text);
}

function speakAny(text, lang) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getTtsLang(lang);
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}
</script>
