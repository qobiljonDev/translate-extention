<template>
  <div class="relative" ref="dropdownRef">
    <button
      @click="open = !open"
      class="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm flex items-center gap-3 transition-all duration-200 hover:border-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      :aria-expanded="open"
      aria-haspopup="listbox"
    >
      <img :src="getFlag(modelValue)" class="w-6 h-4 rounded object-cover shadow-sm" />
      <span class="flex-1 text-left font-medium">{{ languages[modelValue]?.label }}</span>
      <svg
        class="text-slate-500 transition-transform duration-200"
        :class="{ 'rotate-180': open }"
        width="16" height="16" viewBox="0 0 24 24" fill="none"
      >
        <path d="M7 10l5 5 5-5z" fill="currentColor"/>
      </svg>
    </button>

    <Transition name="dropdown">
      <div
        v-if="open"
        class="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
        role="listbox"
      >
        <button
          v-for="(lang, code) in languages"
          :key="code"
          @click="select(code)"
          class="w-full px-4 py-3 flex items-center gap-3 text-sm transition-all duration-150 text-left"
          :class="modelValue === code
            ? 'bg-blue-500/15 text-blue-300'
            : 'hover:bg-slate-700/60 text-slate-300 hover:text-white'"
          role="option"
          :aria-selected="modelValue === code"
        >
          <img :src="getFlag(code)" class="w-6 h-4 rounded object-cover shadow-sm" />
          <span class="font-medium">{{ lang.label }}</span>
          <svg v-if="modelValue === code" class="ml-auto text-blue-400" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
          </svg>
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

<style>
.dropdown-enter-active { transition: opacity 0.15s ease-out; }
.dropdown-leave-active { transition: opacity 0.1s ease-in; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; }
</style>
