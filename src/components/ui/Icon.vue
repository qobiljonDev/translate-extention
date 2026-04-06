<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    v-html="iconPath"
  ></svg>
</template>

<script setup>
import { computed } from "vue";
import { icons } from "../../assets/svg/icons.js";

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 14 },
});

const iconPath = computed(() => icons[props.name] || "");
</script>
