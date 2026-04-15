<template>
  <div class="space-y-5">
    <!-- Til tanlash -->
    <div>
      <label class="block text-[11px] font-semibold uppercase tracking-wider mb-2.5" :class="light ? 'text-gray-500' : 'text-slate-400'">{{ t('translateLang') }}</label>
      <LangDropdown v-model="selectedLang" />
    </div>

    <!-- Input -->
    <div class="relative">
      <input
        v-model="text"
        type="text"
        :placeholder="t('inputPlaceholder')"
        class="w-full px-4 py-3.5 pr-10 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        :class="light
          ? 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 hover:border-gray-300'
          : 'bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 hover:border-slate-600'"
        @keyup.enter="handleTranslate"
      />
      <button
        v-if="text"
        @click="clear"
        class="absolute right-3 top-1/2 -translate-y-1/2 transition-colors p-1 rounded-full"
        :class="light ? 'text-gray-400 hover:text-gray-700 hover:bg-gray-100' : 'text-slate-500 hover:text-white hover:bg-slate-700/50'"
      >
        <Icon name="close" :size="14" />
      </button>
    </div>

    <!-- Button -->
    <button
      @click="handleTranslate"
      :disabled="loading || !text.trim()"
      class="w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
      :class="loading || !text.trim()
        ? (light ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-70' : 'bg-slate-700/50 text-slate-500 cursor-not-allowed opacity-70')
        : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.97]'"
    >
      <Icon v-if="loading" name="spinner" :size="16" class="animate-spin" />
      {{ loading ? t('translating') : t('translateBtn') }}
    </button>

    <!-- Result -->
    <Transition name="result">
      <div v-if="translated" class="p-4 rounded-xl" :class="light ? 'bg-white border border-gray-200 shadow-sm' : 'bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50'">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[10px] text-blue-400/70 uppercase tracking-widest font-bold">{{ t('result') }}</span>
              <span v-if="detectedLang" class="text-[10px] px-1.5 py-0.5 rounded" :class="light ? 'text-gray-500 bg-gray-100' : 'text-slate-500 bg-slate-700/50'">
                {{ t('detectedLang') }}: {{ getLangName(detectedLang) }}
              </span>
            </div>
            <p class="text-sm leading-relaxed" :class="light ? 'text-gray-800' : 'text-slate-100'">{{ translated }}</p>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <button
              @click="handleCopy"
              class="rounded-lg p-2.5 transition-all duration-200 hover:scale-105"
              :class="light ? 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700' : 'bg-slate-700/60 hover:bg-slate-600/60 text-slate-400 hover:text-white'"
              :title="copied ? t('copied') : t('copy')"
            >
              <Icon v-if="!copied" name="copy" :size="14" />
              <Icon v-else name="check" :size="14" class="text-green-500" />
            </button>
            <button
              @click="speakText(translated, selectedLang)"
              class="bg-blue-500/15 hover:bg-blue-500/30 text-blue-400 rounded-lg p-2.5 transition-all duration-200 hover:scale-105"
              :title="t('listen')"
            >
              <Icon name="speaker" :size="14" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, inject, computed, watch } from "vue";
import { getLangName } from "../services/config.js";
import { t } from "../services/i18n.js";
import { storage } from "../services/chrome.js";
import { useTranslate } from "../composables/useTranslate.js";
import { useTTS } from "../composables/useTTS.js";
import LangDropdown from "./LangDropdown.vue";
import Icon from "./ui/Icon.vue";

const theme = inject("theme", ref("dark"));
const light = computed(() => theme.value === "light");

const selectedLang = defineModel("lang", { default: "uz" });
const { text, translated, detectedLang, loading, translate, clear } = useTranslate();
const { speakText } = useTTS();

const copied = ref(false);

watch(selectedLang, (val) => {
  storage.sync.set({ targetLang: val });
});

function handleTranslate() {
  translate(selectedLang.value);
}

function handleCopy() {
  navigator.clipboard.writeText(translated.value).catch(() => {});
  copied.value = true;
  setTimeout(() => (copied.value = false), 1500);
}
</script>

<style scoped>
.result-enter-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.result-leave-active { transition: all 0.2s ease-in; }
.result-enter-from { opacity: 0; transform: translateY(-10px) scale(0.98); }
.result-leave-to { opacity: 0; transform: translateY(4px); }
</style>
