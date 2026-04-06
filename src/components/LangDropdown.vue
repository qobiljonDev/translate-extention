<template>
  <div class="relative" ref="dropdownRef">
    <button
      @click="open = !open"
      class="w-full px-4 py-3.5 rounded-xl text-sm flex items-center gap-3 cursor-pointer transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      :class="
        light
          ? 'bg-white border border-gray-200 text-gray-900 hover:border-gray-300'
          : 'bg-slate-800/60 border border-slate-700 text-white hover:border-slate-600'
      "
      :aria-expanded="open"
      aria-haspopup="listbox"
    >
      <img
        :src="getFlag(modelValue)"
        class="w-6 h-4 rounded object-cover shadow-sm"
      />
      <span class="flex-1 text-left font-medium">{{
        languages[modelValue]?.label
      }}</span>
      <Icon
        name="chevronDown"
        :size="16"
        class="transition-transform duration-200"
        :class="[
          { 'rotate-180': open },
          light ? 'text-gray-400' : 'text-slate-500',
        ]"
      />
    </button>

    <Transition name="dropdown">
      <div
        v-if="open"
        class="absolute z-50 w-full mt-2 rounded-xl shadow-2xl overflow-hidden"
        :class="
          light
            ? 'bg-white border border-gray-200 shadow-gray-200/50'
            : 'bg-slate-800 border border-slate-700 shadow-black/50'
        "
        role="listbox"
      >
        <button
          v-for="(lang, code) in languages"
          :key="code"
          @click="select(code)"
          class="w-full px-4 py-3 flex items-center gap-3 text-sm transition-all duration-150 text-left cursor-pointer"
          :class="
            modelValue === code
              ? 'bg-blue-500/15 text-blue-500'
              : light
                ? 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                : 'hover:bg-slate-700/60 text-slate-300 hover:text-white'
          "
          role="option"
          :aria-selected="modelValue === code"
        >
          <img
            :src="getFlag(code)"
            class="w-6 h-4 rounded object-cover shadow-sm"
          />
          <span class="font-medium">{{ lang.label }}</span>
          <Icon
            v-if="modelValue === code"
            name="check"
            :size="16"
            class="ml-auto text-blue-400"
          />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, inject, computed, onMounted, onBeforeUnmount } from "vue";
import { languages, getFlag } from "../services/config.js";
import Icon from "./ui/Icon.vue";

const theme = inject("theme", ref("dark"));
const light = computed(() => theme.value === "light");

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
onBeforeUnmount(() =>
  document.removeEventListener("click", handleClickOutside),
);
</script>

<style>
.dropdown-enter-active {
  transition: opacity 0.15s ease-out;
}
.dropdown-leave-active {
  transition: opacity 0.1s ease-in;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
}
</style>
