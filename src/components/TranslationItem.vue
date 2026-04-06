<template>
  <div class="bg-slate-700/30 border border-slate-700/50 rounded-lg p-2.5 text-sm" :class="{ group: removable }">
    <div class="text-slate-400 text-xs mb-1 truncate">{{ item.original }}</div>
    <div class="text-white">{{ item.translated }}</div>
    <div class="flex items-center justify-between mt-1.5">
      <span class="text-[10px] text-slate-500">{{ formatTime(item.timestamp) }}</span>
      <div class="flex gap-1">
        <button
          @click="$emit('copy', item.translated)"
          class="text-slate-500 hover:text-white transition-colors p-1"
          title="Nusxalash"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
          </svg>
        </button>
        <button
          @click="$emit('speak', item.translated, item.targetLang)"
          class="text-slate-500 hover:text-blue-400 transition-colors p-1"
          title="Tinglash"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" fill="currentColor"/>
          </svg>
        </button>
        <button
          v-if="removable"
          @click="$emit('remove')"
          class="text-slate-500 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
          title="O'chirish"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatTime } from "../utils.js";

defineProps({
  item: Object,
  removable: { type: Boolean, default: false },
});
defineEmits(["copy", "speak", "remove"]);
</script>
