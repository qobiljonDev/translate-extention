<template>
  <div
    class="rounded-xl p-3 text-sm transition-all duration-200"
    :class="[
      light
        ? 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
        : 'bg-slate-800/40 border border-slate-700/40 hover:bg-slate-800/60 hover:border-slate-600/50',
      { group: removable }
    ]"
  >
    <div class="text-xs mb-1 truncate" :class="light ? 'text-gray-500' : 'text-slate-400'">{{ item.original }}</div>
    <div class="font-medium" :class="light ? 'text-gray-800' : 'text-slate-100'">{{ item.translated }}</div>
    <div class="flex items-center justify-between mt-2">
      <span class="text-[10px]" :class="light ? 'text-gray-400' : 'text-slate-600'">{{ formatTime(item.timestamp) }}</span>
      <div class="flex gap-1">
        <button
          @click="$emit('copy', item.translated)"
          class="transition-colors p-1.5 rounded-lg cursor-pointer"
          :class="light ? 'text-gray-400 hover:text-gray-700 hover:bg-gray-100' : 'text-slate-500 hover:text-white hover:bg-slate-700/50'"
          title="Nusxalash"
        >
          <Icon name="copy" :size="12" />
        </button>
        <button
          @click="$emit('speak', item.translated, item.targetLang)"
          class="text-blue-400 hover:text-blue-500 transition-colors p-1.5 rounded-lg hover:bg-blue-500/10 cursor-pointer"
          title="Tinglash"
        >
          <Icon name="speakerSmall" :size="12" />
        </button>
        <button
          v-if="removable"
          @click="$emit('remove')"
          class="transition-colors p-1.5 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100 cursor-pointer"
          :class="light ? 'text-gray-400 hover:text-red-500' : 'text-slate-500 hover:text-red-400'"
          title="O'chirish"
        >
          <Icon name="close" :size="12" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed } from "vue";
import { formatTime } from "../services/utils.js";
import Icon from "./ui/Icon.vue";

const theme = inject("theme", ref("dark"));
const light = computed(() => theme.value === "light");

defineProps({
  item: Object,
  removable: { type: Boolean, default: false },
});
defineEmits(["copy", "speak", "remove"]);
</script>
