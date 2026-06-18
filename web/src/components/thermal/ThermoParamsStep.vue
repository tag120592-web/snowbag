<script setup lang="ts">
import WorkArea from './WorkArea.vue'
import ThermalCrossSection from '@/components/ThermalCrossSection.vue'
import { BUILDING_CATEGORIES, THERMAL_SYSTEMS } from '@/api/thermal'
import { useThermalCalc } from '@/composables/useThermalCalc'

const t = useThermalCalc()
const fmt = (n: number | undefined, d = 2) => (n === undefined ? '—' : n.toFixed(d).replace('.', ','))
</script>

<template>
  <WorkArea>
    <template #canvas>
      <ThermalCrossSection v-if="t.displayLayers.value.length" :layers="t.displayLayers.value" :t-in="t.tIn.value" />
      <div v-else class="empty">Цифровая модель кровли</div>
    </template>
    <template #panel>
      <div class="ph">Параметры расчёта</div>
      <div class="pbody">
        <label class="fld"><span>Категория здания</span>
          <select v-model="t.categoryId.value"><option v-for="c in BUILDING_CATEGORIES" :key="c.id" :value="c.id">{{ c.title }}</option></select>
        </label>
        <div class="fld"><span class="sl">Температура помещения<b class="sv temp">+{{ t.tIn.value }} °C</b></span>
          <input v-model.number="t.tIn.value" class="rng temp" type="range" min="5" max="32" step="1" /></div>
        <div class="fld"><span class="sl">Влажность помещения<b class="sv hum">{{ t.humidityPct.value }}%</b><em class="reg" :class="t.humidityRegime.value.cls">{{ t.humidityRegime.value.label }}</em></span>
          <input v-model.number="t.humidityPct.value" class="rng hum" type="range" min="30" max="85" step="1" /></div>
        <label class="fld"><span>Система ТЕХНОНИКОЛЬ · из ПИМ</span>
          <select v-model="t.systemEkn.value"><option v-for="s in THERMAL_SYSTEMS" :key="s.slug" :value="s.slug">{{ s.name }}</option></select>
        </label>
        <div v-if="t.result.value?.climate" class="clim">📍 Автоматически из модели · {{ t.result.value.climate.city }} · ГСОП по СП 131</div>
      </div>
      <div class="ph">Состав системы<span class="cnt2">· {{ t.displayLayers.value.length }}</span></div>
      <div class="pbody layers">
        <div v-for="(l, i) in t.displayLayers.value" :key="i" class="lrow" :class="{ ins: l.isInsulant }">
          <div class="ln"><div class="lname">{{ l.material.name }}</div><div class="lrole">{{ l.role }} · λ {{ fmt(l.material.lambda, 3) }}</div></div>
          <div class="lt">{{ fmt(l.thicknessMm, 0) }} <span>мм</span></div>
        </div>
      </div>
      <div v-if="t.result.value?.thermal" class="rusl">
        <div><div class="rl">Сопротивление (без неоднородностей)</div><div class="rl">Rусл</div></div>
        <div class="sp" /><div class="rv">{{ fmt(t.result.value.thermal.rcond) }}</div><div class="ru">м²·°C/Вт</div>
      </div>
    </template>
  </WorkArea>
</template>

<style scoped>
.empty { color: var(--content-tertiary-enabled); }
.ph { display: flex; align-items: center; gap: 8px; padding: 18px 20px 12px; font-size: 15px; font-weight: 700; color: var(--content-primary-a-enabled); }
.cnt2 { font-size: 13px; font-weight: 600; color: var(--content-tertiary-enabled); }
.pbody { padding: 0 20px 14px; display: flex; flex-direction: column; gap: 13px; }
.fld { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
.fld > span { color: var(--content-secondary-enabled); }
select, input { padding: 8px 10px; border: 1px solid var(--border-secondary-enabled); border-radius: var(--radius-md); font-size: 14px; color: var(--content-primary-a-enabled); background: var(--background-primary-a-enabled); }
.sl { display: flex; align-items: center; gap: 8px; }
.sv { margin-left: auto; font-size: 16px; font-weight: 800; }
.sv.temp { color: var(--content-accent-enabled); }
.sv.hum { color: var(--blue-60); }
.rng { width: 100%; border: none; padding: 0; cursor: pointer; }
.rng.temp { accent-color: var(--content-accent-enabled); }
.rng.hum { accent-color: var(--blue-55); }
.reg { font-style: normal; font-size: 11px; padding: 2px 7px; border-radius: var(--radius-pill); }
.reg-dry { background: var(--blue-10); color: var(--blue-60); }
.reg-norm { background: var(--green-10); color: var(--content-system-positive); }
.reg-wet { background: var(--orange-10); color: var(--orange-50); }
.reg-soak { background: var(--red-10); color: var(--content-accent-enabled); }
.clim { font-size: 12px; color: var(--content-tertiary-enabled); background: var(--background-secondary-a-enabled); padding: 10px 12px; border-radius: var(--radius-md); }
.layers { gap: 7px; }
.lrow { display: flex; align-items: center; gap: 10px; padding: 9px 11px; border: 1px solid var(--border-secondary-enabled); border-radius: var(--radius-md); }
.lrow.ins { background: var(--orange-10); }
.ln { flex: 1; min-width: 0; }
.lname { font-size: 13px; font-weight: 600; color: var(--content-primary-a-enabled); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lrole { font-size: 11px; color: var(--content-tertiary-enabled); margin-top: 1px; }
.lt { font-size: 13px; font-weight: 600; color: var(--content-primary-a-enabled); white-space: nowrap; }
.lt span { font-size: 11px; color: var(--content-tertiary-enabled); }
.rusl { margin: 8px 20px 20px; padding: 14px 16px; background: var(--content-primary-a-enabled); border-radius: var(--radius-md); display: flex; align-items: center; color: #fff; }
.rl { font-size: 12px; color: rgba(255,255,255,.6); }
.sp { flex: 1; }
.rv { font-size: 24px; font-weight: 800; }
.ru { font-size: 12px; color: rgba(255,255,255,.6); margin-left: 6px; margin-top: 8px; }
</style>
