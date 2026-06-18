<script setup lang="ts">
defineProps<{ panelWidth?: number }>()
</script>

<template>
  <div class="work">
    <div class="canvas"><slot name="canvas" /></div>
    <aside class="panel" :style="{ width: (panelWidth ?? 400) + 'px', flexBasis: (panelWidth ?? 400) + 'px' }">
      <slot name="panel" />
    </aside>
  </div>
</template>

<style scoped>
.work { flex: 1; display: flex; min-height: 0; }
.canvas { flex: 1; min-width: 0; min-height: 0; position: relative; background: var(--neutral-10); display: flex; align-items: center; justify-content: center; padding: 20px; overflow: hidden; }
.panel { flex-grow: 0; flex-shrink: 0; border-left: 1px solid var(--border-secondary-enabled); background: var(--background-primary-a-enabled); display: flex; flex-direction: column; min-height: 0; overflow-y: auto; }
</style>
