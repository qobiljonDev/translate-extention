<template>
  <slot v-bind="{ isDark, change, toggle }" />
</template>

<script setup>
import { computed, nextTick } from "vue";

const props = defineProps({
  modelValue: { type: String, required: true },
  animationDuration: { type: Number, default: 1000 },
});
const emit = defineEmits(["update:modelValue"]);

const isDark = computed(() => props.modelValue === "dark");

const supportsVT = computed(
  () =>
    typeof document !== "undefined" &&
    "startViewTransition" in document &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
);

function applyClass(value) {
  const el = document.documentElement;
  el.classList.toggle("dark", value === "dark");
  el.classList.toggle("light", value === "light");
}

async function change(value, event) {
  if (value === props.modelValue) return;

  if (!supportsVT.value || !event?.clientX) {
    applyClass(value);
    emit("update:modelValue", value);
    return;
  }

  const x = event.clientX;
  const y = event.clientY;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const killer = document.createElement("style");
  killer.textContent =
    "*,*::before,*::after{transition:none !important;animation-duration:0s !important;}";
  document.head.appendChild(killer);

  const goingDark = value === "dark";
  const html = document.documentElement;
  html.classList.add(goingDark ? "vt-to-dark" : "vt-to-light");

  const transition = document.startViewTransition(async () => {
    applyClass(value);
    emit("update:modelValue", value);
    await nextTick();
  });

  try {
    await transition.ready;
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ];
    const anim = html.animate(
      { clipPath: goingDark ? clipPath : [...clipPath].reverse() },
      {
        duration: props.animationDuration,
        easing: "cubic-bezier(0.65, 0, 0.35, 1)",
        pseudoElement: goingDark
          ? "::view-transition-new(root)"
          : "::view-transition-old(root)",
      },
    );
    await anim.finished.catch(() => {});
    await transition.finished.catch(() => {});
  } catch {}
  html.classList.remove("vt-to-dark", "vt-to-light");
  killer.remove();
}

function toggle(event) {
  change(isDark.value ? "light" : "dark", event);
}
</script>
