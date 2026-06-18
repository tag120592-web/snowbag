<script setup lang="ts">
defineProps<{
  project?: { name: string; address?: string } | null
}>()

const emit = defineEmits<{ home: [] }>()
</script>

<template>
  <header class="header">
    <button type="button" class="brand" @click="emit('home')">
      <div class="logo">TN</div>
      <div class="brand-text">
        <span class="title">Снеговые мешки</span>
        <span class="subtitle">Мониторинг снеговой нагрузки</span>
      </div>
    </button>

    <template v-if="project">
      <div class="divider" />
      <div class="project">
        <span class="project-name">{{ project.name }}</span>
        <span v-if="project.address" class="project-address">· {{ project.address }}</span>
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
  background: var(--red-60);
  color: #fff;
  font-weight: 800;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.brand-text { display: flex; flex-direction: column; line-height: 1.15; text-align: left; }
.title { font-size: 15px; font-weight: 700; }
.subtitle { font-size: 11px; color: var(--content-tertiary-enabled); }
.divider { width: 1px; height: 26px; background: var(--border-secondary-enabled); }
.project { display: flex; align-items: center; gap: 8px; min-width: 0; font-size: 14px; }
.project-name { font-weight: 600; white-space: nowrap; }
.project-address { color: var(--content-tertiary-enabled); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
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
