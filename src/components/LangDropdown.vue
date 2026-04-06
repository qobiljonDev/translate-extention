<template>
  <div class="relative" ref="dropdownRef">
    <button
      @click="open = !open"
      class="w-full p-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm flex items-center gap-2 hover:border-blue-400 transition-colors"
    >
      <img :src="getFlag(modelValue)" class="w-5 h-4 rounded-sm object-cover" />
      <span class="flex-1 text-left">{{ languages[modelValue]?.label }}</span>
      <svg
        class="text-slate-400 transition-transform duration-200"
        :class="{ 'rotate-180': open }"
        width="14" height="14" viewBox="0 0 24 24" fill="none"
      >
        <path d="M7 10l5 5 5-5z" fill="currentColor"/>
      </svg>
    </button>

    <Transition name="dropdown">
      <div
        v-if="open"
        class="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden"
      >
        <button
          v-for="(lang, code) in languages"
          :key="code"
          @click="select(code)"
          class="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-slate-700 transition-colors text-left"
          :class="{ 'bg-blue-500/20 text-blue-300': modelValue === code }"
        >
          <img :src="getFlag(code)" class="w-5 h-4 rounded-sm object-cover" />
          <span>{{ lang.label }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { languages, getFlag } from "../config.js";

const props = defineProps({ modelValue: String });
const emit = defineEmits(["update:modelValue"]);

const open = ref(false);
const dropdownRef = ref(null);

function select(code) {
  emit("update:modelValue", code);
  open.value = false;
}

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", handleClickOutside));
</script>

<style scoped>
.dropdown-enter-active { transition: all 0.2s ease-out; }
.dropdown-leave-active { transition: all 0.15s ease-in; }
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
