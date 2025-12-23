<template>
  <div class="p-4 w-[320px] text-gray-800">
    <h2 class="text-xl font-bold mb-3 text-center">UZ Hover Translator</h2>

    <label class="block text-sm font-medium mb-1">Tarjima tili:</label>
    <select
      v-model="selectedLang"
      class="w-full p-2 border rounded mb-4"
      @change="saveLang"
    >
      <option v-for="(label, code) in languages" :key="code" :value="code">
        {{ label }}
      </option>
    </select>

    <input
      v-model="text"
      type="text"
      placeholder="Tarjima qilinadigan matn..."
      class="w-full p-2 border rounded mb-3"
    />

    <button
      @click="translateText"
      class="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
    >
      Tarjima qilish
    </button>

    <div v-if="translated" class="mt-3 bg-gray-100 p-3 rounded text-sm">
      <div class="flex items-start justify-between gap-2">
        <div class="flex-1"><strong>Tarjima:</strong> {{ translated }}</div>
        <button
          @click="speakText"
          class="flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition-all hover:scale-110 flex items-center justify-center"
          title="Ovoz orqali o'qish"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const text = ref("");
const translated = ref("");
const selectedLang = ref("uz");

const languages = {
  uz: "O‘zbek",
  en: "Ingliz",
  ru: "Rus",
  tr: "Turk",
  ar: "Arab",
  fr: "Fransuz",
};

onMounted(() => {
  const savedLang = localStorage.getItem("targetLang");
  if (savedLang) selectedLang.value = savedLang;
});

const saveLang = () => {
  localStorage.setItem("targetLang", selectedLang.value);
};

const translateText = async () => {
  if (!text.value.trim()) return;

  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${
        selectedLang.value
      }&dt=t&q=${encodeURIComponent(text.value)}`
    );
    const data = await res.json();
    translated.value = data[0][0][0];
  } catch (err) {
    translated.value = "Tarjima topilmadi";
  }
};

const speakText = () => {
  if (!translated.value || !("speechSynthesis" in window)) {
    return;
  }

  // Avval to'xtatish
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(translated.value);

  // Til kodini sozlash
  const langMap = {
    uz: "uz-UZ",
    en: "en-US",
    ru: "ru-RU",
    tr: "tr-TR",
    ar: "ar-SA",
    fr: "fr-FR",
  };

  utterance.lang = langMap[selectedLang.value] || langMap["en"];
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
};
</script>

<style scoped>
body {
  font-family: sans-serif;
}
</style>
