<template>
  <div class="space-y-5">
    <!-- Interfeys tili -->
    <div>
      <label class="block text-[11px] font-semibold uppercase tracking-wider mb-2.5" :class="light ? 'text-gray-500' : 'text-slate-400'">{{ t('language') }}</label>
      <SegmentedControl
        :model-value="currentUILang"
        :options="langOptions"
        variant="blue"
        @update:model-value="setUILang"
      />
    </div>

    <!-- Tema -->
    <div>
      <label class="block text-[11px] font-semibold uppercase tracking-wider mb-2.5" :class="light ? 'text-gray-500' : 'text-slate-400'">{{ t('theme') }}</label>
      <DarkToggle :model-value="theme" @update:model-value="onThemeChange" v-slot="{ change }">
        <SegmentedControl
          :model-value="theme"
          :options="themeOptions"
          @update:model-value="change"
        />
      </DarkToggle>
    </div>

    <!-- Bu sayt -->
    <div v-if="currentHost">
      <label class="block text-[11px] font-semibold uppercase tracking-wider mb-2.5" :class="light ? 'text-gray-500' : 'text-slate-400'">{{ t('siteControl') }}</label>
      <div
        class="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl"
        :class="light ? 'bg-gray-50 border border-gray-200' : 'bg-slate-800/40 border border-slate-700/40'"
      >
        <Icon name="globe" :size="12" :class="light ? 'text-gray-400' : 'text-slate-500'" />
        <span class="text-[11px] font-mono truncate" :class="light ? 'text-gray-700' : 'text-slate-300'">{{ currentHost }}</span>
      </div>
      <SegmentedControl
        :model-value="isDisabled"
        :options="siteOptions"
        @update:model-value="setSiteDisabled"
      />
    </div>

    <!-- Offline cache -->
    <div>
      <label class="block text-[11px] font-semibold uppercase tracking-wider mb-2.5" :class="light ? 'text-gray-500' : 'text-slate-400'">{{ t('offlineCache') }}</label>
      <button
        @click="handleClearCache"
        class="w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        :class="cacheCleared
          ? 'bg-green-500/15 text-green-400'
          : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'"
      >
        <Icon v-if="!cacheCleared" name="delete" :size="14" />
        <Icon v-else name="check" :size="14" />
        {{ cacheCleared ? t('cacheCleared') : t('clearCache') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { t, currentUILang, setUILang, uiLanguages } from "../services/i18n.js";
import { clearOfflineCache } from "../services/cache.js";
import { storage, tabs } from "../services/chrome.js";
import Icon from "./ui/Icon.vue";
import SegmentedControl from "./ui/SegmentedControl.vue";
import DarkToggle from "./ui/DarkToggle.vue";

const props = defineProps({
  theme: { type: String, default: "dark" },
});

const emit = defineEmits(["update:theme"]);

const light = computed(() => props.theme === "light");

const cacheCleared = ref(false);
const currentHost = ref("");
const disabledSites = ref([]);
const isDisabled = computed(() => disabledSites.value.includes(currentHost.value));

const langOptions = computed(() =>
  uiLanguages.map((l) => ({ value: l.code, label: l.label, icon: "globe" }))
);

const themeOptions = computed(() => [
  { value: "dark", label: t("dark"), icon: "moon", color: "blue" },
  { value: "light", label: t("light"), icon: "sun", color: "amber" },
]);

const siteOptions = computed(() => [
  { value: false, label: t("siteEnabled"), icon: "check", color: "emerald" },
  { value: true, label: t("siteDisabled"), icon: "close", color: "danger" },
]);

onMounted(() => {
  tabs.queryActive((tab) => {
    if (tab?.url) {
      try {
        const url = new URL(tab.url);
        if (url.protocol === "http:" || url.protocol === "https:") {
          currentHost.value = url.hostname;
        }
      } catch {}
    }
  });
  storage.sync.get("disabledSites", (result) => {
    if (Array.isArray(result.disabledSites)) disabledSites.value = result.disabledSites;
  });
});

function setSiteDisabled(disable) {
  if (!currentHost.value) return;
  if (disable === isDisabled.value) return;
  const next = disable
    ? [...disabledSites.value, currentHost.value]
    : disabledSites.value.filter((h) => h !== currentHost.value);
  disabledSites.value = next;
  storage.sync.set({ disabledSites: next });
}

function onThemeChange(value) {
  emit("update:theme", value);
}

function handleClearCache() {
  clearOfflineCache();
  cacheCleared.value = true;
  setTimeout(() => (cacheCleared.value = false), 2000);
}
</script>
