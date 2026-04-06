<template>
  <div class="w-[340px] min-h-[200px] bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 font-sans">
    <!-- Header -->
    <div class="flex items-center justify-center gap-2 mb-4">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" fill="#60a5fa"/>
      </svg>
      <h2 class="text-lg font-bold tracking-wide">UZ Hover Translator</h2>
    </div>

    <!-- Til tanlash -->
    <label class="block text-xs text-slate-400 font-medium mb-1.5">Tarjima tili</label>
    <div class="relative mb-4">
      <select
        v-model="selectedLang"
        class="w-full p-2.5 pl-10 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm appearance-none cursor-pointer hover:border-blue-400 transition-colors focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
        @change="saveLang"
      >
        <option v-for="(lang, code) in languages" :key="code" :value="code" class="bg-slate-800">
          {{ lang.flag }} {{ lang.label }}
        </option>
      </select>
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none">
        {{ languages[selectedLang]?.flag }}
      </span>
      <svg class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M7 10l5 5 5-5z" fill="currentColor"/>
      </svg>
    </div>

    <!-- Input -->
    <div class="relative mb-3">
      <input
        v-model="text"
        type="text"
        placeholder="Matn kiriting..."
        class="w-full p-2.5 pr-10 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 hover:border-slate-500 transition-colors focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
        @keyup.enter="translateText"
      />
      <button
        v-if="text"
        @click="text = ''; translated = ''"
        class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
        title="Tozalash"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
        </svg>
      </button>
    </div>

    <!-- Tarjima tugmasi -->
    <button
      @click="translateText"
      :disabled="loading || !text.trim()"
      class="w-full p-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
      :class="loading || !text.trim()
        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
        : 'bg-blue-500 hover:bg-blue-400 text-white hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]'"
    >
      <!-- Spinner -->
      <svg v-if="loading" class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="opacity-25"/>
        <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="opacity-75"/>
      </svg>
      {{ loading ? "Tarjima qilinmoqda..." : "Tarjima qilish" }}
    </button>

    <!-- Natija -->
    <Transition name="result">
      <div v-if="translated" class="mt-4 bg-slate-700/40 border border-slate-600/50 p-3.5 rounded-lg">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1">
            <span class="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Tarjima</span>
            <p class="text-sm mt-1 leading-relaxed">{{ translated }}</p>
          </div>
          <button
            @click="speakText"
            class="flex-shrink-0 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-full p-2 transition-all duration-200 hover:scale-110 flex items-center justify-center"
            title="Ovoz orqali o'qish"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Footer -->
    <div class="mt-4 text-center text-[10px] text-slate-500">
      Matn belgilang — avtomatik tarjima
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const text = ref("");
const translated = ref("");
const selectedLang = ref("uz");
const loading = ref(false);

const languages = {
  uz: { label: "O'zbek", flag: "\u{1F1FA}\u{1F1FF}" },
  en: { label: "Ingliz", flag: "\u{1F1FA}\u{1F1F8}" },
  ru: { label: "Rus", flag: "\u{1F1F7}\u{1F1FA}" },
  tr: { label: "Turk", flag: "\u{1F1F9}\u{1F1F7}" },
  ar: { label: "Arab", flag: "\u{1F1F8}\u{1F1E6}" },
  fr: { label: "Fransuz", flag: "\u{1F1EB}\u{1F1F7}" },
};

onMounted(() => {
  chrome.storage.sync.get("targetLang", (result) => {
    if (result.targetLang) selectedLang.value = result.targetLang;
  });

  if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
  }
});

const saveLang = () => {
  chrome.storage.sync.set({ targetLang: selectedLang.value });
};

const translateText = async () => {
  if (!text.value.trim() || loading.value) return;

  loading.value = true;
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${selectedLang.value}&dt=t&q=${encodeURIComponent(text.value)}`
    );
    const data = await res.json();
    translated.value = data[0][0][0];
  } catch (err) {
    translated.value = "Tarjima topilmadi";
  } finally {
    loading.value = false;
  }
};

const speakText = () => {
  if (!translated.value || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(translated.value);

  const langMap = {
    uz: "uz-UZ",
    en: "en-US",
    ru: "ru-RU",
    tr: "tr-TR",
    ar: "ar-SA",
    fr: "fr-FR",
  };

  const voiceLang = langMap[selectedLang.value] || "en-US";
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice =
    voices.find((v) => v.lang === voiceLang && !v.localService) ||
    voices.find((v) => v.lang === voiceLang) ||
    voices.find((v) => v.lang.startsWith(selectedLang.value));

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.lang = voiceLang;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
};
</script>

<style scoped>
.result-enter-active {
  transition: all 0.3s ease-out;
}
.result-leave-active {
  transition: all 0.2s ease-in;
}
.result-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.result-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
