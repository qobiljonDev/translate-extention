<template>
  <button
    class="rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
    :class="[sizeClass, variantClass]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <Icon v-if="icon" :name="icon" :size="iconSize" />
    <slot />
  </button>
</template>

<script setup>
import { ref, inject, computed } from "vue";
import Icon from "./Icon.vue";

const theme = inject("theme", ref("dark"));
const light = computed(() => theme.value === "light");

const props = defineProps({
  variant: { type: String, default: "primary" }, // primary, secondary, success, danger, ghost
  size: { type: String, default: "md" }, // sm, md, lg
  icon: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
});

defineEmits(["click"]);

const iconSize = computed(() => {
  if (props.size === "sm") return 12;
  if (props.size === "lg") return 18;
  return 14;
});

const sizeClass = computed(() => {
  if (props.size === "sm") return "px-3 py-2 text-sm";
  if (props.size === "lg") return "px-5 py-4 text-sm";
  return "px-4 py-3.5";
});

const variantClass = computed(() => {
  if (props.disabled) {
    return light.value
      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
      : "bg-slate-700/50 text-slate-500 cursor-not-allowed";
  }

  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.97]",
    success: "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.97]",
    danger: "bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400 hover:shadow-lg hover:shadow-orange-500/20 active:scale-[0.97]",
    secondary: light.value
      ? "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
      : "bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300",
    ghost: light.value
      ? "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-300",
  };

  return variants[props.variant] || variants.primary;
});
</script>
