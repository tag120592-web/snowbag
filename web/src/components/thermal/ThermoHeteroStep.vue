<script setup lang="ts">
import WorkArea from './WorkArea.vue'
import ThermalRoofPlan from '@/components/ThermalRoofPlan.vue'
import { HETERO_NODES } from '@/api/thermal'
import { useThermalCalc } from '@/composables/useThermalCalc'

const t = useThermalCalc()
const fmt = (n: number, d = 3) => n.toFixed(d).replace('.', ',')
</script>

<template>
  <WorkArea>
    <template #canvas>
      <ThermalRoofPlan :geometry="t.planGeometry.value" :active-ids="t.activeObstacleIds.value" @toggle="t.toggleObstacle" />
    </template>
    <template #panel>
      <div class="rblock">
        <div class="rlab">Коэффициент теплотехнической однородности</div>
        <div class="rbig">r = {{ fmt(t.rPct.value / 100) }} <span>выявлено: {{ t.hetero.value.length }}</span></div>
        <div class="rbar"><div class="rbar-f" :style="{ width: t.rPct.value + '%' }" /></div>
      </div>
      <div class="ph">Неоднородности (СП 230)</div>
      <div class="pbody">
        <p class="hint">Кликайте элементы на плане или добавляйте кнопками. ψ/χ — авто по СП 230.</p>
        <div class="chips">
          <button v-for="n in HETERO_NODES" :key="n.node" class="chip" @click="t.addHetero(n.node, n.kind)">+ {{ n.label }}</button>
        </div>
        <ul class="hlist">
          <li v-for="h in t.hetero.value" :key="h.id">
            <span class="hn">{{ t.nodeLabel(h.sp230Node) }}<em v-if="h.elementId" class="frm">с плана</em></span>
            <template v-if="h.kind === 'linear'"><input v-model.number="h.lengthM" type="number" min="1" /><span class="u">м</span></template>
            <template v-else><input v-model.number="h.count" type="number" min="1" /><span class="u">шт</span></template>
            <button class="rm" @click="t.removeHetero(h.id)">✕</button>
          </li>
          <li v-if="!t.hetero.value.length" class="muted">Пока ничего не выбрано — r = 1</li>
        </ul>
      </div>
    </template>
  </WorkArea>
</template>

<style scoped>
.rblock { padding: 18px 20px 14px; border-bottom: 1px solid var(--border-secondary-enabled); }
.rlab { font-size: 12px; font-weight: 600; color: var(--content-tertiary-enabled); margin-bottom: 8px; }
.rbig { font-size: 30px; font-weight: 800; color: var(--content-primary-a-enabled); margin-bottom: 10px; }
.rbig span { font-size: 13px; font-weight: 400; color: var(--content-tertiary-enabled); margin-left: 8px; }
.rbar { height: 8px; background: var(--neutral-15); border-radius: var(--radius-pill); overflow: hidden; }
.rbar-f { height: 100%; background: var(--content-system-positive); border-radius: var(--radius-pill); }
.ph { padding: 18px 20px 12px; font-size: 15px; font-weight: 700; color: var(--content-primary-a-enabled); }
.pbody { padding: 0 20px 14px; display: flex; flex-direction: column; gap: 12px; }
.hint { font-size: 12px; color: var(--content-tertiary-enabled); margin: 0; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { font-size: 12px; padding: 5px 9px; border: 1px solid var(--border-secondary-enabled); border-radius: var(--radius-pill); background: var(--background-primary-a-enabled); cursor: pointer; color: var(--content-primary-a-enabled); }
.chip:hover { border-color: var(--content-accent-enabled); color: var(--content-accent-enabled); }
.hlist { list-style: none; padding: 0; margin: 0; }
.hlist li { display: flex; align-items: center; gap: 8px; padding: 8px 0; font-size: 13px; border-bottom: 1px solid var(--border-secondary-enabled); }
.hn { flex: 1; }
.frm { font-style: normal; font-size: 10px; margin-left: 6px; padding: 1px 6px; border-radius: var(--radius-pill); background: var(--red-10); color: var(--content-accent-enabled); }
.hlist input { width: 70px; padding: 6px 8px; border: 1px solid var(--border-secondary-enabled); border-radius: var(--radius-md); font-size: 13px; }
.u { color: var(--content-tertiary-enabled); font-size: 12px; }
.rm { border: none; background: none; color: var(--content-tertiary-enabled); cursor: pointer; }
.muted { color: var(--content-tertiary-enabled); }
</style>
