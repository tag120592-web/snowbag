<script setup lang="ts">
defineProps<{
  project?: { name: string; address?: string } | null
}>()

const emit = defineEmits<{ home: [] }>()
</script>

<template>
  <header class="header">
    <button type="button" class="brand" @click="emit('home')">
      <img class="logo" src="/app-icon.png" alt="Формула расчета" width="34" height="34" />
      <div class="brand-text">
        <span class="title">Формула расчета</span>
        <span class="subtitle">Вычислительный комплекс</span>
      </div>
    </button>

    <template v-if="project">
      <div class="divider" />
      <div class="project">
        <span class="project-name">{{ project.name }}</span>
        <span
          v-if="project.address && project.address !== 'Укажите адрес объекта'"
          class="project-address"
          :title="project.address"
        >· {{ project.address }}</span>
      </div>
    </template>

    <div class="spacer" />
    <div class="user">
      <div class="avatar">ГА</div>
      <div>
        <div class="user-name">Громов А. И.</div>
        <div class="user-role">Инженер-проектировщик</div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid var(--border-secondary-enabled);
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}
.logo {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  object-fit: contain;
  flex-shrink: 0;
}
.brand-text { display: flex; flex-direction: column; line-height: 1.15; text-align: left; }
.title { font-size: 15px; font-weight: 700; }
.subtitle { font-size: 11px; color: var(--content-tertiary-enabled); }
.divider { width: 1px; height: 26px; background: var(--border-secondary-enabled); }
.project { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; max-width: min(42vw, 520px); font-size: 14px; line-height: 1.25; }
.project-name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.project-address { color: var(--content-tertiary-enabled); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; font-size: 12px; }
.spacer { flex: 1; }
.user { display: flex; align-items: center; gap: 10px; }
.avatar {
  width: 32px; height: 32px; border-radius: 999px;
  background: var(--blue-10); color: var(--blue-60);
  font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.user-name { font-size: 13px; font-weight: 600; line-height: 1.2; }
.user-role { font-size: 11px; color: var(--content-tertiary-enabled); line-height: 1.2; }
</style>
