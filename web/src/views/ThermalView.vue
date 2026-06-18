<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { listProjects } from '@/api/client'
import type { ProjectListItem } from '@/types'
import { MODULES } from '@/api/thermal'
import { useThermalCalc } from '@/composables/useThermalCalc'
import ThermoParamsStep from '@/components/thermal/ThermoParamsStep.vue'
import ThermoHeteroStep from '@/components/thermal/ThermoHeteroStep.vue'
import ThermoResultStep from '@/components/thermal/ThermoResultStep.vue'

const router = useRouter()
const route = useRoute()
const t = useThermalCalc()
const projects = ref<ProjectListItem[]>([])
const pickedId = ref('')
const loading = ref(true)
const localError = ref('')

const phase = ref<'select' | 'wizard'>('select')
const modules = ref<Record<string, boolean>>({ snow: false, thermal: true, vapor: false, wind: false })
const step = ref(0)
const wizardSteps = [
  { n: 1, label: 'Состав и параметры' },
  { n: 2, label: 'Неоднородности' },
  { n: 3, label: 'Результат' },
]

onMounted(async () => {
  try {
    projects.value = await listProjects()
    const fromQuery = route.query.project ? String(route.query.project) : ''
    if (fromQuery && projects.value.some((p) => p.id === fromQuery)) pickedId.value = fromQuery
    else if (projects.value.length) pickedId.value = projects.value[0].id
  } catch (e) {
    localError.value = e instanceof Error ? e.message : 'Ошибка загрузки проектов'
  } finally {
    loading.value = false
  }
})

const selectedProject = computed(() => projects.value.find((p) => p.id === pickedId.value) ?? null)
const selectedCount = computed(() => MODULES.filter((m) => modules.value[m.id] && m.ready).length)
const activeModules = computed(() => MODULES.filter((m) => modules.value[m.id] && m.ready))
function toggleModule(id: string, ready: boolean) {
  if (ready) modules.value[id] = !modules.value[id]
}

function goToData() {
  if (!pickedId.value) {
    localError.value = 'Выберите проект'
    return
  }
  const calc = [modules.value.snow ? 'snow' : '', modules.value.thermal ? 'thermal' : ''].filter(Boolean).join(',')
  const newFlag = route.query.new === '1' ? '&new=1' : ''
  router.push(`/wizard/${pickedId.value}?calc=${calc}${newFlag}`)
}
async function next() {
  if (step.value === 0) {
    await t.runCalc()
    step.value = 1
  } else if (step.value === 1) {
    await t.runCalc()
    step.value = 2
  }
}
function back() {
  if (step.value > 0) step.value -= 1
  else phase.value = 'select'
}
function goStep(i: number) {
  if (i <= step.value || t.result.value) step.value = i
}

const footerHint = computed(() => (step.value === 0 ? 'Состав получен из ПИМ' : step.value === 1 ? 'Расчёт по СП 50.13330 + СП 230' : ''))
const footerLabel = computed(() => (step.value === 1 ? 'Рассчитать' : step.value === 2 ? 'Пересчитать' : 'Далее'))
</script>

<template>
  <div class="app">
    <header class="phead">
      <button class="brand" @click="router.push('/')">
        <div class="logo">TN</div>
        <div class="brand-text"><span class="b1">Расчёты кровли</span><span class="b2">Платформа инженерных расчётов ТН</span></div>
      </button>
      <template v-if="selectedProject && phase === 'wizard'">
        <div class="vline" />
        <div class="proj"><span class="pn">{{ selectedProject.name }}</span><span class="pa">· {{ selectedProject.city }}</span></div>
        <div class="mtags"><span v-for="m in activeModules" :key="m.id" class="mtag" :style="{ color: m.ink, background: m.tint }">{{ m.icon }} {{ m.id === 'snow' ? 'Снег' : 'Теплотехника' }}</span></div>
      </template>
      <div class="spacer" />
      <div class="user"><div class="avatar">ГА</div><div><div class="un">Громов А. И.</div><div class="ur">Инженер-проектировщик</div></div></div>
    </header>

    <!-- ВЫБОР РАСЧЁТОВ -->
    <div v-if="phase === 'select'" class="select-scroll">
      <div class="select-inner">
        <button class="back" @click="router.push('/')">← Все объекты</button>
        <h1>Выбор расчётов для объекта</h1>
        <label class="proj-pick"><span>Объект</span>
          <select v-model="pickedId" :disabled="loading"><option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }} · {{ p.city }}</option></select>
        </label>
        <p class="sub">Выберите один или несколько расчётов. Все они используют общую цифровую модель кровли — исходные данные собираются один раз.</p>
        <div class="cards">
          <button v-for="m in MODULES" :key="m.id" type="button" class="card" :class="{ on: modules[m.id] && m.ready, soon: !m.ready }" :disabled="!m.ready" @click="toggleModule(m.id, m.ready)">
            <div class="card-top">
              <div class="card-ic" :style="{ background: m.tint }">{{ m.icon }}</div>
              <div class="card-tt"><div class="cn">{{ m.name }}</div><div class="cnorm">{{ m.norm }}</div></div>
              <span v-if="!m.ready" class="soon-tag">Скоро</span>
              <span v-else class="check" :class="{ checked: modules[m.id] }">{{ modules[m.id] ? '✓' : '' }}</span>
            </div>
            <div class="card-desc">{{ m.desc }}</div>
            <div v-if="m.outputs.length" class="card-out"><span v-for="o in m.outputs" :key="o" class="out">{{ o }}</span></div>
          </button>
        </div>
        <div class="arch">
          <div class="arch-l"><div class="arch-ic">▦</div><div><div class="arch-t">Единая цифровая модель кровли</div><div class="arch-s">Геометрия · площади · узлы · примыкания · элементы</div></div></div>
          <span class="arrow">→</span>
          <div class="arch-r"><span v-if="!activeModules.length" class="arch-empty">выберите хотя бы один расчёт</span><span v-for="m in activeModules" :key="m.id" class="mtag" :style="{ color: m.ink, background: m.tint }">{{ m.icon }} {{ m.id === 'snow' ? 'Снег' : 'Теплотехника' }}</span></div>
        </div>
        <div class="select-foot">
          <span class="cnt">Выбрано расчётов: <b>{{ selectedCount }}</b></span>
          <div class="spacer" />
          <button class="ghost" @click="router.push('/')">Отмена</button>
          <button class="primary" :disabled="selectedCount === 0" @click="goToData">Перейти к данным →</button>
        </div>
        <p v-if="localError" class="error">{{ localError }}</p>
      </div>
    </div>

    <!-- МАСТЕР -->
    <template v-else>
      <nav class="stepper">
        <template v-for="(s, i) in wizardSteps" :key="i">
          <button class="st" :class="{ active: i === step, done: i < step }" @click="goStep(i)"><span class="st-n">{{ i < step ? '✓' : s.n }}</span><span class="st-l">{{ s.label }}</span></button>
          <span v-if="i < wizardSteps.length - 1" class="st-line" :class="{ done: i < step }" />
        </template>
      </nav>

      <ThermoParamsStep v-if="step === 0" />
      <ThermoHeteroStep v-else-if="step === 1" />
      <ThermoResultStep v-else />

      <footer class="wfoot">
        <button class="ghost" @click="back">← Назад</button>
        <span v-if="footerHint" class="fhint">ⓘ {{ footerHint }}</span>
        <div class="spacer" />
        <span class="fstep">Шаг {{ step + 1 }} из {{ wizardSteps.length }}</span>
        <button class="primary" :disabled="t.calculating.value" @click="next">{{ footerLabel }} →</button>
      </footer>
    </template>
  </div>
</template>

<style scoped>
.app { display: flex; flex-direction: column; height: 100vh; width: 100vw; overflow: hidden; background: var(--neutral-10); }
.phead { height: 64px; flex: 0 0 64px; display: flex; align-items: center; gap: 16px; padding: 0 24px; background: var(--background-primary-a-enabled); border-bottom: 1px solid var(--border-secondary-enabled); }
.brand { display: flex; align-items: center; gap: 12px; border: none; background: none; cursor: pointer; padding: 0; }
.logo { width: 34px; height: 34px; border-radius: 8px; background: var(--red-60); color: #fff; font-weight: 800; font-size: 15px; display: flex; align-items: center; justify-content: center; }
.brand-text { display: flex; flex-direction: column; line-height: 1.15; text-align: left; }
.b1 { font-size: 15px; font-weight: 700; color: var(--content-primary-a-enabled); }
.b2 { font-size: 11px; color: var(--content-tertiary-enabled); }
.vline { width: 1px; height: 26px; background: var(--border-secondary-enabled); }
.proj { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
.pn { font-size: 14px; font-weight: 600; color: var(--content-primary-a-enabled); white-space: nowrap; }
.pa { font-size: 13px; color: var(--content-tertiary-enabled); white-space: nowrap; }
.mtags { display: flex; gap: 7px; }
.mtag { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; padding: 5px 10px; border-radius: var(--radius-pill); }
.spacer { flex: 1; }
.user { display: flex; align-items: center; gap: 10px; }
.avatar { width: 32px; height: 32px; border-radius: 999px; background: var(--blue-10); color: var(--blue-60); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.un { font-size: 13px; font-weight: 600; line-height: 1.2; }
.ur { font-size: 11px; color: var(--content-tertiary-enabled); line-height: 1.2; }

.select-scroll { flex: 1; overflow-y: auto; }
.select-inner { max-width: 980px; margin: 0 auto; padding: 40px 32px 48px; }
.back { border: none; background: none; cursor: pointer; color: var(--content-tertiary-enabled); font-size: 13px; font-weight: 600; padding: 0; margin-bottom: 16px; }
.select-inner h1 { margin: 0 0 14px; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; color: var(--content-primary-a-enabled); }
.proj-pick { display: flex; flex-direction: column; gap: 4px; max-width: 420px; margin-bottom: 14px; font-size: 13px; }
.proj-pick span { color: var(--content-secondary-enabled); }
.proj-pick select { padding: 8px 10px; border: 1px solid var(--border-secondary-enabled); border-radius: var(--radius-md); font-size: 14px; }
.sub { margin: 0 0 24px; font-size: 14px; color: var(--content-tertiary-enabled); max-width: 680px; }
.cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px; }
.card { text-align: left; cursor: pointer; padding: 20px; border-radius: var(--radius-lg); background: var(--background-primary-a-enabled); border: 2px solid var(--border-secondary-enabled); display: flex; flex-direction: column; gap: 14px; min-height: 180px; transition: all .14s; }
.card.soon { background: var(--neutral-10); opacity: 0.72; cursor: default; }
.card.on { border-color: var(--red-60); box-shadow: 0 0 0 4px var(--red-10); }
.card-top { display: flex; align-items: flex-start; gap: 13px; }
.card-ic { width: 46px; height: 46px; flex: 0 0 46px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); font-size: 22px; }
.card-tt { flex: 1; min-width: 0; }
.cn { font-size: 16px; font-weight: 700; color: var(--content-primary-a-enabled); }
.cnorm { font-size: 12.5px; color: var(--content-tertiary-enabled); margin-top: 2px; }
.soon-tag { font-size: 11px; font-weight: 600; color: var(--content-tertiary-enabled); background: var(--background-secondary-a-enabled); padding: 3px 9px; border-radius: var(--radius-pill); }
.check { width: 24px; height: 24px; flex: 0 0 24px; border-radius: 7px; display: flex; align-items: center; justify-content: center; border: 2px solid var(--neutral-30); color: #fff; font-size: 14px; font-weight: 700; }
.check.checked { border: none; background: var(--red-60); }
.card-desc { font-size: 13.5px; line-height: 1.5; color: var(--content-secondary-enabled); }
.card-out { display: flex; flex-wrap: wrap; gap: 6px; margin-top: auto; }
.out { font-size: 11.5px; font-weight: 600; color: var(--content-tertiary-enabled); background: var(--background-secondary-a-enabled); padding: 3px 9px; border-radius: var(--radius-pill); }
.arch { display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: var(--background-secondary-a-enabled); border: 1px solid var(--border-secondary-enabled); border-radius: var(--radius-lg); }
.arch-l { display: flex; align-items: center; gap: 11px; }
.arch-ic { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: var(--background-primary-a-enabled); border: 1px solid var(--border-secondary-enabled); border-radius: var(--radius-md); font-size: 18px; }
.arch-t { font-size: 13.5px; font-weight: 700; color: var(--content-primary-a-enabled); }
.arch-s { font-size: 12px; color: var(--content-tertiary-enabled); }
.arrow { color: var(--neutral-40); font-size: 18px; }
.arch-r { display: flex; gap: 8px; flex-wrap: wrap; }
.arch-empty { font-size: 13px; color: var(--content-tertiary-enabled); }
.select-foot { display: flex; align-items: center; gap: 14px; margin-top: 28px; }
.cnt { font-size: 14px; color: var(--content-tertiary-enabled); }
.cnt b { color: var(--content-primary-a-enabled); }
.error { color: var(--content-accent-enabled); font-size: 13px; margin-top: 10px; }

.stepper { height: 72px; flex: 0 0 72px; display: flex; align-items: center; padding: 0 24px; background: var(--background-primary-a-enabled); border-bottom: 1px solid var(--border-secondary-enabled); }
.st { display: flex; align-items: center; gap: 10px; border: none; background: none; padding: 6px 8px; cursor: pointer; }
.st-n { width: 28px; height: 28px; flex: 0 0 28px; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; background: var(--neutral-15); color: var(--neutral-50); border: 1px solid var(--neutral-25); }
.st.active .st-n { background: var(--red-60); color: #fff; border: none; }
.st.done .st-n { background: var(--content-primary-a-enabled); color: #fff; border: none; }
.st-l { font-size: 13.5px; font-weight: 600; color: var(--neutral-40); white-space: nowrap; }
.st.active .st-l { color: var(--red-60); font-weight: 700; }
.st.done .st-l { color: var(--content-primary-a-enabled); }
.st-line { flex: 1; height: 2px; min-width: 12px; background: var(--neutral-20); margin: 0 2px; border-radius: 2px; }
.st-line.done { background: var(--content-primary-a-enabled); }

.wfoot { height: 72px; flex: 0 0 72px; display: flex; align-items: center; gap: 14px; padding: 0 28px; background: var(--background-primary-a-enabled); border-top: 1px solid var(--border-secondary-enabled); }
.fhint { font-size: 13px; color: var(--content-tertiary-enabled); }
.fstep { font-size: 13px; font-weight: 600; color: var(--content-tertiary-enabled); }
.primary { padding: 10px 18px; background: var(--background-accent-enabled); color: #fff; border: none; border-radius: var(--radius-md); font-size: 14px; font-weight: 600; cursor: pointer; }
.primary:disabled { opacity: 0.5; cursor: default; }
.ghost { padding: 10px 16px; background: var(--background-primary-a-enabled); border: 1px solid var(--border-secondary-enabled); border-radius: var(--radius-md); font-size: 14px; cursor: pointer; color: var(--content-primary-a-enabled); }
</style>
