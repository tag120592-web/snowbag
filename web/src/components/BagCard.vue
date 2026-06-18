<script setup lang="ts">
import type { Snowbag } from '@/types'

const props = defineProps<{
  bag: Snowbag
  selected?: boolean
}>()

const emit = defineEmits<{ click: [] }>()

const riskMeta: Record<string, { label: string; line: string; soft: string; tone: string }> = {
  critical: { label: 'Критическая', line: 'var(--red-60)', soft: 'var(--red-10)', tone: 'red' },
  high: { label: 'Высокая', line: 'var(--orange-60)', soft: 'var(--orange-10)', tone: 'orange' },
  medium: { label: 'Средняя', line: 'var(--yellow-40)', soft: 'var(--yellow-10)', tone: 'yellow' },
}

const meta = () => riskMeta[props.bag.risk] ?? riskMeta.medium

function formatMu(mu: number) {
  return mu.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}
</script>

<template>
  <button
    type="button"
    class="bag-card"
    :class="{ selected }"
    :style="{
      borderColor: selected ? meta().line : 'var(--border-secondary-enabled)',
      borderLeftColor: meta().line,
      background: selected ? meta().soft : '#fff',
    }"
    @click="emit('click')"
  >
    <div class="head">
      <span class="id" :style="{ color: meta().line }">{{ bag.id }}</span>
      <span class="name">{{ bag.name }}</span>
      <span class="tag" :class="meta().tone">{{ meta().label }}</span>
    </div>
    <div class="stats">
      <div><span>Коэф. μ</span><strong>{{ formatMu(bag.mu) }}</strong></div>
      <div><span>Нагрузка S</span><strong>{{ bag.load }} кПа</strong></div>
      <div><span>Площадь</span><strong>{{ bag.area }} м²</strong></div>
    </div>
    <p class="basis">Основание: {{ bag.basis }}<span v-if="bag.scheme" class="scheme"> · {{ bag.scheme }}</span></p>
  </button>
</template>

<style scoped>
.bag-card {
  text-align: left;
  width: 100%;
  border: 1px solid var(--border-secondary-enabled);
  border-left-width: 4px;
  border-radius: var(--radius-md, 8px);
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}
.head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.id { font-size: 13px; font-weight: 800; }
.name { font-size: 14px; font-weight: 600; flex: 1; }
.tag {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}
.tag.red { background: var(--red-10); color: var(--red-60); }
.tag.orange { background: var(--orange-10); color: var(--orange-60); }
.tag.yellow { background: var(--yellow-10); color: var(--yellow-40); }
.stats {
  display: flex;
  gap: 18px;
  margin-bottom: 6px;
}
.stats span { display: block; font-size: 11px; color: var(--content-tertiary-enabled); }
.stats strong { font-size: 14px; }
.basis { margin: 0; font-size: 12px; color: var(--content-tertiary-enabled); }
.scheme { font-weight: 600; }
</style>
