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
      <strong>Tarjima:</strong> {{ translated }}
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
</script>

<style scoped>
body {
  font-family: sans-serif;
}
</style>
