<template>
  <slot v-bind="{ isDark, change, toggle }" />
</template>

<script setup>
import { computed, nextTick } from "vue";

const props = defineProps({
  modelValue: { type: String, required: true },
  animationDuration: { type: Number, default: 1500 },
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
    const full = `circle(${endRadius}px at ${x}px ${y}px)`;
    const zero = `circle(0px at ${x}px ${y}px)`;

    const keyframes = goingDark
      ? [
          { clipPath: zero, opacity: 1 },
          { clipPath: full, opacity: 1 },
        ]
      : [
          { clipPath: full, opacity: 1, offset: 0 },
          { clipPath: `circle(${endRadius * 0.08}px at ${x}px ${y}px)`, opacity: 1, offset: 0.85 },
          { clipPath: zero, opacity: 0, offset: 1 },
        ];

    const anim = html.animate(keyframes, {
      duration: props.animationDuration,
      easing: goingDark
        ? "cubic-bezier(0.83, 0, 0.17, 1)"
        : "cubic-bezier(0.64, 0, 0.78, 0)",
      fill: "forwards",
      pseudoElement: goingDark
        ? "::view-transition-new(root)"
        : "::view-transition-old(root)",
    });
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
