<template>
  <button
    class="transition-all duration-200 rounded-lg cursor-pointer flex items-center justify-center"
    :class="[sizeClass, colorClass]"
    :title="title"
    @click="$emit('click', $event)"
  >
    <Icon :name="icon" :size="iconSize" />
  </button>
</template>

<script setup>
import { ref, inject, computed } from "vue";
import Icon from "./Icon.vue";

const theme = inject("theme", ref("dark"));
const light = computed(() => theme.value === "light");

const props = defineProps({
  icon: { type: String, required: true },
  title: { type: String, default: "" },
  color: { type: String, default: "default" }, // default, blue, red
  size: { type: String, default: "md" }, // sm, md
});

defineEmits(["click"]);

const iconSize = computed(() => (props.size === "sm" ? 12 : 14));

const sizeClass = computed(() => (props.size === "sm" ? "p-1.5" : "p-2.5"));

const colorClass = computed(() => {
  const colors = {
    default: light.value
      ? "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
      : "text-slate-500 hover:text-white hover:bg-slate-700/50",
    blue: "text-blue-400 hover:text-blue-500 hover:bg-blue-500/10",
    red: light.value
      ? "text-gray-400 hover:text-red-500 hover:bg-red-500/10"
      : "text-slate-500 hover:text-red-400 hover:bg-red-500/10",
    success: light.value
      ? "bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700"
      : "bg-slate-700/60 hover:bg-slate-600/60 text-slate-400 hover:text-white",
  };
  return colors[props.color] || colors.default;
});
</script>
