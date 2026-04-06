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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
        </svg>
      </button>
    </div>

    <!-- Buttons -->
    <div class="flex gap-3">
      <button
        @click="handleTranslate"
        :disabled="loading || !text.trim()"
        class="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
        :class="loading || !text.trim()
          ? (light ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-70' : 'bg-slate-700/50 text-slate-500 cursor-not-allowed opacity-70')
          : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.97]'"
      >
        <svg v-if="loading" class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="opacity-25"/>
          <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="opacity-75"/>
        </svg>
        {{ loading ? t('translating') : t('translateBtn') }}
      </button>
      <BaseButton
        class="flex-1"
        :variant="pageTranslated ? 'danger' : 'success'"
        size="sm"
        @click="togglePageTranslate"
        :title="pageTranslated ? t('restorePage') : t('translatePage')"
      >
        {{ pageTranslated ? t('restorePage') : t('translatePage') }}
      </BaseButton>
    </div>

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
              <svg v-if="!copied" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#4CAF50"/>
              </svg>
            </button>
            <button
              @click="speakText(translated, selectedLang)"
              class="bg-blue-500/15 hover:bg-blue-500/30 text-blue-400 rounded-lg p-2.5 transition-all duration-200 hover:scale-105"
              :title="t('listen')"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/>
              </svg>
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
import { storage, runtime } from "../services/chrome.js";
import { useTranslate } from "../composables/useTranslate.js";
import { useTTS } from "../composables/useTTS.js";
import LangDropdown from "./LangDropdown.vue";
import BaseButton from "./ui/BaseButton.vue";

const theme = inject("theme", ref("dark"));
const light = computed(() => theme.value === "light");

const selectedLang = defineModel("lang", { default: "uz" });
const { text, translated, detectedLang, loading, translate, clear } = useTranslate();
const { speakText } = useTTS();

const copied = ref(false);
const pageTranslated = ref(false);

watch(selectedLang, (val) => {
  storage.sync.set({ targetLang: val });
});

function handleTranslate() {
  translate(selectedLang.value);
}

function togglePageTranslate() {
  if (pageTranslated.value) {
    runtime.sendMessage({ action: "restore-page" });
  } else {
    runtime.sendMessage({ action: "translate-page" });
  }
  pageTranslated.value = !pageTranslated.value;
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
