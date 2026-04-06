<template>
  <div
    class="flex px-6 gap-1 flex-shrink-0 z-10 backdrop-blur-sm"
    :class="light ? 'bg-white/80' : 'bg-slate-900/95'"
  >
    <button
      v-for="tab in tabs"
      :key="tab.id"
      @click="$emit('update:modelValue', tab.id)"
      class="flex-1 py-3 text-[11px] font-semibold tracking-wide transition-all duration-200 border-b-2 flex items-center justify-center gap-1.5 cursor-pointer"
      :class="modelValue === tab.id
        ? 'text-blue-400 border-blue-400 bg-blue-400/5'
        : light
          ? 'text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-300'
          : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-600'"
    >
      <Icon :name="tab.icon" :size="13" />
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
import { ref, inject, computed } from "vue";
import Icon from "./Icon.vue";

const theme = inject("theme", ref("dark"));
const light = computed(() => theme.value === "light");

defineProps({
  tabs: { type: Array, required: true },
  modelValue: { type: String, required: true },
});

defineEmits(["update:modelValue"]);
</script>
