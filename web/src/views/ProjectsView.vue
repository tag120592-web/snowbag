<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { createProject, deleteProject, downloadExport, listCalculations, listProjects, recalculateProject } from '@/api/client'
import type { CalculationHistory, CalculationRunItem, ProjectListItem } from '@/types'

const router = useRouter()
const projects = ref<ProjectListItem[]>([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const expandedId = ref<string | null>(null)
const histories = ref<Record<string, CalculationHistory>>({})
const historyLoading = ref<Record<string, boolean>>({})
const selectedRunId = ref<Record<string, string>>({})
const recalculating = ref<Record<string, boolean>>({})
const deleting = ref<Record<string, boolean>>({})
const downloading = ref<Record<string, boolean>>({})

onMounted(async () => {
  try {
    projects.value = await listProjects()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
})

const filtered = () => {
  const q = search.value.trim().toLowerCase()
  if (!q) return projects.value
  return projects.value.filter((p) =>
    [p.name, p.city, p.number, p.customer].some((v) => v.toLowerCase().includes(q)),
  )
}

async function toggleRow(p: ProjectListItem, event: MouseEvent) {
  if ((event.target as HTMLElement).closest('.row-action')) return
  if (expandedId.value === p.id) {
    expandedId.value = null
    return
  }
  expandedId.value = p.id
  if (!histories.value[p.id] && p.calcs > 0) {
    await loadHistory(p.id)
  }
}

async function loadHistory(projectId: string) {
  historyLoading.value[projectId] = true
  try {
    const history = await listCalculations(projectId)
    histories.value[projectId] = history
    const current = history.items.find((item) => item.current)
    if (current && !selectedRunId.value[projectId]) {
      selectedRunId.value[projectId] = current.id
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить историю'
  } finally {
    historyLoading.value[projectId] = false
  }
}

function selectRun(projectId: string, run: CalculationRunItem) {
  selectedRunId.value[projectId] = run.id
}

async function openProject(p: ProjectListItem) {
  const runId = selectedRunId.value[p.id]
  const query: Record<string, string> = {}
  if (runId) query.runId = runId
  await router.push({ name: 'wizard', params: { id: p.id }, query })
}

async function newProject() {
  try {
    const p = await createProject({
      name: 'Новый объект',
      city: 'Екатеринбург',
      address: 'Укажите адрес объекта',
    })
    await router.push({ name: 'wizard', params: { id: p.id }, query: { new: '1' } })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось создать проект'
  }
}

async function runRecalculate(p: ProjectListItem) {
  recalculating.value[p.id] = true
  error.value = ''
  try {
    const res = await recalculateProject(p.id)
    histories.value[p.id] = res.history
    const idx = projects.value.findIndex((item) => item.id === p.id)
    if (idx >= 0) {
      projects.value[idx] = {
        ...projects.value[idx],
        calcNo: res.project.calcNo,
        sensors: res.calculation.metrics?.sensors ?? projects.value[idx].sensors,
        status: 'Готово',
        calcs: res.history.items.length,
      }
    }
    const current = res.history.items.find((item) => item.current)
    if (current) selectedRunId.value[p.id] = current.id
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось пересчитать'
  } finally {
    recalculating.value[p.id] = false
  }
}

async function runDelete(p: ProjectListItem) {
  const ok = window.confirm(`Удалить объект «${p.name}»? Это действие необратимо.`)
  if (!ok) return
  deleting.value[p.id] = true
  error.value = ''
  try {
    await deleteProject(p.id)
    projects.value = projects.value.filter((item) => item.id !== p.id)
    delete histories.value[p.id]
    delete selectedRunId.value[p.id]
    if (expandedId.value === p.id) expandedId.value = null
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось удалить объект'
  } finally {
    deleting.value[p.id] = false
  }
}

async function runDownloadReport(p: ProjectListItem) {
  downloading.value[p.id] = true
  error.value = ''
  try {
    await downloadExport(p.id, 'pdf')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось скачать отчёт'
  } finally {
    downloading.value[p.id] = false
  }
}

function statusTone(status: string) {
  return status === 'Готово' ? 'green' : 'neutral'
}

function runTone(run: CalculationRunItem) {
  return run.status === 'Готово' ? 'green' : 'neutral'
}
</script>

<template>
  <div class="layout">
    <AppHeader @home="router.push('/')" />
    <main class="page">
      <div class="container">
        <div class="head">
          <div>
            <h1>Проекты</h1>
            <p>Проектирование систем мониторинга снеговой нагрузки на плоских кровлях</p>
          </div>
          <div class="head-actions">
            <input v-model="search" class="search" placeholder="Поиск по объектам" />
            <button class="btn accent" @click="newProject">+ Новый проект</button>
          </div>
        </div>

        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="loading" class="muted">Загрузка…</p>

        <div v-else class="table-card">
          <div class="table-head">Все объекты · {{ filtered().length }}</div>
          <div class="table-cols">
            <span>Объект</span><span>№ объекта</span><span>Город</span><span>Площадь</span><span>Датчики</span><span>Статус</span><span />
          </div>

          <div v-for="p in filtered()" :key="p.id" class="row-wrap">
            <button
              type="button"
              class="row"
              :class="{ open: expandedId === p.id }"
              @click="toggleRow(p, $event)"
            >
              <div class="obj">
                <div class="obj-icon">🏢</div>
                <div>
                  <div class="obj-name-row">
                    <span class="obj-name">{{ p.name }}</span>
                    <span v-if="p.calcs > 0" class="tag red sm">текущий</span>
                  </div>
                  <div class="obj-meta">
                    Дата создания: {{ p.created }} · расчётов: {{ p.calcs || '—' }}
                  </div>
                </div>
              </div>
              <span class="mono">{{ p.number }}</span>
              <span>{{ p.city }}</span>
              <span>{{ p.areaM2 ? `${Math.round(p.areaM2).toLocaleString('ru-RU')} м²` : '—' }}</span>
              <span>{{ p.sensors || '—' }}</span>
              <span><span class="tag" :class="statusTone(p.status)">{{ p.status }}</span></span>
              <span class="chev" :class="{ rotated: expandedId === p.id }">›</span>
            </button>

            <div v-if="expandedId === p.id" class="detail">
              <div class="detail-card">
                <div class="detail-head">
                  <span class="detail-title">О расчёте</span>
                  <div class="detail-actions row-action">
                    <button
                      type="button"
                      class="btn btn-danger"
                      :disabled="deleting[p.id]"
                      @click.stop="runDelete(p)"
                    >
                      {{ deleting[p.id] ? 'Удаление…' : 'Удалить' }}
                    </button>
                    <button
                      v-if="p.calcs > 0"
                      type="button"
                      class="btn"
                      :disabled="downloading[p.id]"
                      @click.stop="runDownloadReport(p)"
                    >
                      {{ downloading[p.id] ? 'Загрузка…' : 'Скачать отчёт' }}
                    </button>
                    <button
                      v-if="p.calcs > 0"
                      type="button"
                      class="btn"
                      :disabled="recalculating[p.id]"
                      @click.stop="runRecalculate(p)"
                    >
                      {{ recalculating[p.id] ? 'Пересчёт…' : 'Пересчитать' }}
                    </button>
                    <button type="button" class="btn accent" @click.stop="openProject(p)">
                      Открыть расчёт
                    </button>
                  </div>
                </div>

                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-k">Объект</div>
                    <div class="info-v">{{ p.name }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-k">№ объекта (КИСО)</div>
                    <div class="info-v mono">{{ p.number }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-k">Город</div>
                    <div class="info-v">{{ p.city }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-k">Номер расчёта</div>
                    <div class="info-v mono">{{ histories[p.id]?.calcNo ?? p.calcNo }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-k">Заказчик расчёта</div>
                    <div class="info-v">{{ p.customer || '—' }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-k">Всего расчётов</div>
                    <div class="info-v">{{ p.calcs ? `${p.calcs} шт.` : '—' }}</div>
                  </div>
                </div>

                <p v-if="historyLoading[p.id]" class="muted history-loading">Загрузка истории…</p>
                <div v-else-if="histories[p.id]?.items.length" class="history">
                  <div class="history-head">
                    История расчётов объекта · {{ histories[p.id].items.length }}
                  </div>
                  <div class="history-list">
                    <button
                      v-for="run in histories[p.id].items"
                      :key="run.id"
                      type="button"
                      class="history-item row-action"
                      :class="{ selected: selectedRunId[p.id] === run.id, current: run.current }"
                      @click.stop="selectRun(p.id, run)"
                    >
                      <span class="history-icon">📄</span>
                      <div class="history-body">
                        <div class="history-no">
                          {{ run.calcNo }}{{ run.current ? ' · текущий' : '' }}
                        </div>
                        <div class="history-meta">
                          {{ run.created }} · {{ run.author || '—' }} · {{ run.sensors || 0 }} датч.
                        </div>
                      </div>
                      <span class="tag" :class="runTone(run)">{{ run.status }}</span>
                    </button>
                  </div>
                </div>
                <p v-else-if="p.calcs === 0" class="muted history-empty">
                  Расчёт ещё не выполнен. Откройте объект и пройдите мастер.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout { display: flex; flex-direction: column; min-height: 100vh; }
.page { flex: 1; overflow: auto; background: var(--neutral-10); }
.container { max-width: 1180px; margin: 0 auto; padding: 32px 40px 48px; }
.head { display: flex; align-items: flex-end; gap: 16px; margin-bottom: 24px; }
.head h1 { margin: 0; font-size: 28px; font-weight: 800; }
.head p { margin: 6px 0 0; color: var(--content-tertiary-enabled); }
.head-actions { display: flex; gap: 12px; margin-left: auto; align-items: center; }
.search {
  width: 280px; height: 48px; padding: 0 16px;
  border: 1px solid var(--border-secondary-enabled); border-radius: var(--radius-md);
  background: #fff;
}
.btn {
  height: 40px; padding: 0 16px; border-radius: var(--radius-md);
  border: 1px solid var(--border-secondary-enabled); background: #fff;
  font-weight: 600; cursor: pointer; font-size: 14px;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn.accent { background: var(--background-accent-enabled); color: #fff; border-color: var(--red-60); }
.btn-danger { color: var(--red-60); border-color: var(--red-40); }
.btn-danger:hover:not(:disabled) { background: var(--red-10); }
.table-card { background: #fff; border: 1px solid var(--border-secondary-enabled); border-radius: var(--radius-lg); overflow: hidden; }
.table-head { padding: 14px 22px; border-bottom: 1px solid var(--border-secondary-enabled); font-weight: 700; }
.table-cols, .row {
  display: grid; grid-template-columns: minmax(0,2.1fr) 1.15fr 1fr 0.8fr 0.7fr 0.95fr 36px;
  align-items: center; padding: 10px 22px;
}
.table-cols { font-size: 12px; font-weight: 600; color: var(--content-tertiary-enabled); text-transform: uppercase; border-bottom: 1px solid var(--neutral-15); }
.row-wrap { border-bottom: 1px solid var(--neutral-15); }
.row { width: 100%; text-align: left; border: none; background: #fff; cursor: pointer; font: inherit; transition: background .12s; }
.row:hover, .row.open { background: var(--neutral-10); }
.obj { display: flex; gap: 13px; align-items: center; min-width: 0; }
.obj-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: var(--blue-10); border-radius: 8px; flex-shrink: 0; }
.obj-name-row { display: flex; align-items: center; gap: 8px; }
.obj-name { font-weight: 600; }
.obj-meta { font-size: 12.5px; color: var(--content-tertiary-enabled); margin-top: 2px; }
.mono { font-family: var(--font-family-mono); font-size: 13.5px; color: var(--content-secondary-enabled); }
.tag { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
.tag.sm { padding: 2px 8px; font-size: 11px; }
.tag.green { background: var(--green-10); color: var(--green-55); }
.tag.neutral { background: var(--neutral-15); color: var(--neutral-65); }
.tag.red { background: var(--red-10); color: var(--red-60); }
.chev { color: var(--neutral-40); font-size: 20px; transition: transform .15s; }
.chev.rotated { transform: rotate(90deg); display: inline-block; }
.detail { padding: 4px 22px 20px 75px; background: var(--neutral-10); }
.detail-card { background: #fff; border: 1px solid var(--border-secondary-enabled); border-radius: var(--radius-lg); padding: 18px 20px; }
.detail-head { display: flex; align-items: center; margin-bottom: 14px; gap: 12px; }
.detail-title { font-size: 14px; font-weight: 700; }
.detail-actions { display: flex; gap: 8px; margin-left: auto; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px 16px; margin-bottom: 16px; }
.info-k { font-size: 11.5px; color: var(--content-tertiary-enabled); margin-bottom: 2px; }
.info-v { font-size: 14px; font-weight: 600; }
.history-head { font-size: 12.5px; font-weight: 600; color: var(--content-tertiary-enabled); margin-bottom: 8px; }
.history-list { display: flex; flex-direction: column; gap: 6px; }
.history-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 10px;
  border: 1px solid var(--border-secondary-enabled); border-radius: var(--radius-md);
  background: #fff; cursor: pointer; text-align: left; width: 100%; font: inherit;
}
.history-item.current, .history-item.selected { border-color: var(--red-60); background: var(--red-10); }
.history-icon { font-size: 16px; flex-shrink: 0; }
.history-body { flex: 1; min-width: 0; }
.history-no { font-size: 13px; font-weight: 600; }
.history-meta { font-size: 11.5px; color: var(--content-tertiary-enabled); margin-top: 2px; }
.history-loading, .history-empty { margin: 8px 0 0; font-size: 13px; }
.error { color: var(--red-60); }
.muted { color: var(--content-tertiary-enabled); }
</style>
