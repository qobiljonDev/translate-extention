<template>
  <div>
    <label class="block text-xs text-slate-400 font-medium mb-1.5">Tarjima tili</label>
    <LangDropdown v-model="selectedLang" class="mb-3" />

    <!-- Input -->
    <div class="relative mb-3">
      <input
        v-model="text"
        type="text"
        placeholder="Matn kiriting..."
        class="w-full p-2.5 pr-10 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 hover:border-slate-500 transition-colors focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
        @keyup.enter="translate"
      />
      <button
        v-if="text"
        @click="text = ''; translated = ''"
        class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
        </svg>
      </button>
    </div>

    <!-- Buttons -->
    <div class="flex gap-2 mb-3">
      <button
        @click="translate"
        :disabled="loading || !text.trim()"
        class="flex-1 p-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
        :class="loading || !text.trim()
          ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
          : 'bg-blue-500 hover:bg-blue-400 text-white hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]'"
      >
        <svg v-if="loading" class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="opacity-25"/>
          <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="opacity-75"/>
        </svg>
        {{ loading ? "Tarjima..." : "Tarjima qilish" }}
      </button>
      <button
        @click="translatePageAction"
        class="p-2.5 rounded-lg text-sm transition-all duration-200 bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-lg active:scale-[0.98]"
        title="Sahifani tarjima qilish"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2z" fill="currentColor"/>
        </svg>
      </button>
    </div>

    <!-- Result -->
    <Transition name="result">
      <div v-if="translated" class="bg-slate-700/40 border border-slate-600/50 p-3.5 rounded-lg">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1">
            <span class="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Tarjima</span>
            <p class="text-sm mt-1 leading-relaxed">{{ translated }}</p>
          </div>
          <div class="flex gap-1">
            <button
              @click="copy"
              class="flex-shrink-0 bg-slate-600/50 hover:bg-slate-500/50 text-slate-300 rounded-full p-1.5 transition-all duration-200 hover:scale-110"
              :title="copied ? 'Nusxalandi!' : 'Nusxalash'"
            >
              <svg v-if="!copied" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#4CAF50"/>
              </svg>
            </button>
            <button
              @click="speak"
              class="flex-shrink-0 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-full p-1.5 transition-all duration-200 hover:scale-110"
              title="Tinglash"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <div class="mt-3 text-center text-[10px] text-slate-500">
      Matn belgilang — avtomatik tarjima | Ctrl+Shift+T
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { getTtsLang } from "../config.js";
import { fetchTranslation } from "../utils.js";
import LangDropdown from "./LangDropdown.vue";

const selectedLang = defineModel("lang", { default: "uz" });
const emit = defineEmits(["langChange"]);

const text = ref("");
const translated = ref("");
const loading = ref(false);
const copied = ref(false);

watch(selectedLang, (val) => {
  chrome.storage.sync.set({ targetLang: val });
});

async function translate() {
  if (!text.value.trim() || loading.value) return;
  loading.value = true;
  try {
    const result = await fetchTranslation(text.value, selectedLang.value);
    translated.value = result.translated;
  } catch {
    translated.value = "Tarjima topilmadi";
  } finally {
    loading.value = false;
  }
}

function translatePageAction() {
  chrome.runtime.sendMessage({ action: "translate-page" });
  window.close();
}

function copy() {
  navigator.clipboard.writeText(translated.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 1500);
}

function speak() {
  if (!translated.value || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(translated.value);
  const voiceLang = getTtsLang(selectedLang.value);
  const voices = window.speechSynthesis.getVoices();
  const matched =
    voices.find((v) => v.lang === voiceLang && !v.localService) ||
    voices.find((v) => v.lang === voiceLang) ||
    voices.find((v) => v.lang.startsWith(selectedLang.value));
  if (matched) utterance.voice = matched;
  utterance.lang = voiceLang;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}
</script>

<style scoped>
.result-enter-active { transition: all 0.3s ease-out; }
.result-leave-active { transition: all 0.2s ease-in; }
.result-enter-from { opacity: 0; transform: translateY(-8px); }
.result-leave-to { opacity: 0; transform: translateY(4px); }
</style>
