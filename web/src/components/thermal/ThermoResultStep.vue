<script setup lang="ts">
import WorkArea from './WorkArea.vue'
import ThermalCrossSection from '@/components/ThermalCrossSection.vue'
import { useThermalCalc } from '@/composables/useThermalCalc'

const t = useThermalCalc()
const fmt = (n: number | undefined, d = 2) => (n === undefined ? '—' : n.toFixed(d).replace('.', ','))
</script>

<template>
  <WorkArea>
    <template #canvas>
      <ThermalCrossSection
        v-if="t.displayLayers.value.length"
        :layers="t.displayLayers.value"
        :t-in="t.tIn.value"
        :plane-index="t.result.value?.vapor ? t.result.value.vapor.planeLayerIndex : -1"
      />
      <div v-else class="empty">Нет данных расчёта</div>
    </template>
    <template #panel>
      <template v-if="t.result.value?.thermal">
        <div class="verdict" :class="t.result.value.thermal.verdict === 'Соответствует' ? 'ok' : 'bad'">
          <div class="vname">{{ t.result.value.thermal.verdict }} · СП 50</div>
          <div class="vsub">Запас по сопротивлению +{{ fmt(t.result.value.thermal.reservePct, 1) }}%</div>
        </div>
        <div class="metrics">
          <div><span>Rтр требуемое</span><b>{{ fmt(t.result.value.thermal.rreq) }}</b></div>
          <div><span>Rпр приведённое</span><b>{{ fmt(t.result.value.thermal.rred) }}</b></div>
          <div><span>Rусл условное</span><b>{{ fmt(t.result.value.thermal.rcond) }}</b></div>
          <div><span>Коэфф. однородности r</span><b>{{ fmt(t.result.value.thermal.r, 3) }}</b></div>
          <div class="span2"><span>Требуемая толщина теплоизоляции</span><b>{{ fmt(t.result.value.thermal.requiredInsulationMm, 0) }} мм</b></div>
        </div>
        <div v-if="t.result.value.thermal.surfaceTemps?.length" class="surf">
          Темп. внутр. поверхности {{ fmt(t.result.value.thermal.surfaceTemps[0].tauMin, 1) }} °C (норма ≥ {{ fmt(t.result.value.thermal.surfaceTemps[0].tauReq, 1) }}) —
          <b :class="t.result.value.thermal.surfaceTemps[0].pass ? 'green' : 'red'">{{ t.result.value.thermal.surfaceTemps[0].pass ? 'норма' : 'нарушение' }}</b>
        </div>
      </template>

      <div v-if="t.result.value?.vapor" class="vapor" :class="t.result.value.vapor.pass ? 'ok' : 'bad'">
        <div class="vname">Влагонакопление: {{ t.result.value.vapor.verdict }}</div>
        <div class="vrow">Плоскость увлажнения: {{ t.result.value.vapor.maxMoisturePlane }}</div>
        <div class="vrow">Rп факт {{ fmt(t.result.value.vapor.rvp) }} · требуется {{ fmt(t.result.value.vapor.rvpReqFinal) }}</div>
      </div>

      <template v-if="t.result.value?.thermal?.includedHetero?.length">
        <div class="ph">Учтённые неоднородности<span class="cnt2">· {{ t.result.value.thermal.includedHetero.length }}</span></div>
        <div class="pbody">
          <div v-for="h in t.result.value.thermal.includedHetero" :key="h.id" class="hrow">
            <span>{{ h.type || t.nodeLabel(h.sp230Node) }}</span>
            <span class="muted">{{ h.kind === 'linear' ? `ψ ${fmt(h.psi)}` : `χ ${fmt(h.chi)}` }}</span>
          </div>
        </div>
      </template>
    </template>
  </WorkArea>
</template>

<style scoped>
.empty { color: var(--content-tertiary-enabled); }
.verdict { margin: 18px 20px 6px; padding: 14px 16px; border-radius: var(--radius-lg); }
.verdict.ok, .vapor.ok { background: var(--green-10); border: 1px solid var(--green-30); }
.verdict.bad, .vapor.bad { background: var(--red-10); border: 1px solid var(--content-accent-enabled); }
.vname { font-size: 16px; font-weight: 800; color: var(--content-primary-a-enabled); }
.vsub { font-size: 13px; color: var(--content-secondary-enabled); margin-top: 2px; }
.metrics { padding: 12px 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.metrics div { background: var(--background-primary-a-enabled); border: 1px solid var(--border-secondary-enabled); border-radius: var(--radius-md); padding: 9px 11px; }
.metrics .span2 { grid-column: 1 / -1; }
.metrics span { display: block; font-size: 11px; color: var(--content-tertiary-enabled); margin-bottom: 3px; }
.metrics b { font-size: 18px; color: var(--content-primary-a-enabled); }
.surf { padding: 0 20px 10px; font-size: 13px; color: var(--content-secondary-enabled); }
.vapor { margin: 8px 20px; padding: 12px 14px; border-radius: var(--radius-md); }
.vrow { font-size: 12.5px; color: var(--content-secondary-enabled); margin-top: 3px; }
.ph { display: flex; align-items: center; gap: 8px; padding: 14px 20px 10px; font-size: 15px; font-weight: 700; color: var(--content-primary-a-enabled); }
.cnt2 { font-size: 13px; font-weight: 600; color: var(--content-tertiary-enabled); }
.pbody { padding: 0 20px 16px; }
.hrow { display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0; }
.muted { color: var(--content-tertiary-enabled); }
.green { color: var(--content-system-positive); }
.red { color: var(--content-accent-enabled); }
</style>
