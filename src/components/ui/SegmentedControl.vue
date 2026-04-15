<template>
  <div
    class="relative grid gap-0 p-1 rounded-xl"
    :class="[
      gridCols,
      light
        ? 'bg-gray-100 border border-gray-200 shadow-inner'
        : 'bg-slate-900/60 border border-slate-700/60 shadow-inner shadow-black/20',
    ]"
  >
    <div
      class="absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out"
      :class="[indicatorBg, light ? 'shadow-md shadow-black/10' : 'shadow-md shadow-black/40 ring-1 ring-white/10']"
      :style="indicatorStyle"
    ></div>
    <button
      v-for="opt in options"
      :key="opt.value"
      @click="(e) => select(opt.value, e)"
      class="relative z-10 py-2 rounded-lg text-xs font-semibold transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
      :class="modelValue === opt.value
        ? 'text-white drop-shadow-sm'
        : (light ? 'text-gray-600 hover:text-gray-900' : 'text-slate-400 hover:text-white')"
    >
      <Icon v-if="opt.icon" :name="opt.icon" :size="12" />
      {{ opt.label }}
    </button>
  </div>
</template>

<script setup>
import { computed, inject, ref } from "vue";
import Icon from "./Icon.vue";

const props = defineProps({
  modelValue: { type: [String, Boolean, Number], required: true },
  options: { type: Array, required: true },
  variant: { type: String, default: "blue" },
});
const emit = defineEmits(["update:modelValue"]);

const theme = inject("theme", ref("dark"));
const light = computed(() => theme.value === "light");

const colorMap = {
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  danger: "bg-red-500",
};

const gridColsMap = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
};

const gridCols = computed(() => gridColsMap[props.options.length] || "grid-cols-2");

const activeIndex = computed(() => {
  const i = props.options.findIndex((o) => o.value === props.modelValue);
  return i < 0 ? 0 : i;
});

const indicatorStyle = computed(() => {
  const count = props.options.length;
  return {
    width: `calc((100% - 0.5rem) / ${count})`,
    left: `calc(0.25rem + ${activeIndex.value} * (100% - 0.5rem) / ${count})`,
  };
});

const indicatorBg = computed(() => {
  const active = props.options[activeIndex.value];
  return colorMap[active?.color || props.variant] || colorMap.blue;
});

function select(value, event) {
  emit("update:modelValue", value, event);
}
</script>
