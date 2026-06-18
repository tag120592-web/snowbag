# Инструкция для программиста: роза ветров и тепловая карта снеговых мешков

> Проект: SmartRoof / калькулятор снеговых мешков.
> Стек: React + TypeScript + Vite (frontend), FastAPI + SQLAlchemy + NumPy (backend).
> Контуры кровли рисуются вручную — разделы про автоопределение контуров и работу с картой (Leaflet/OSM) здесь не рассматриваются.

---

## 1. Общая архитектура

```text
Frontend
  ├─ pages/CalculatorPage.tsx          — страница, orchestrator
  ├─ api/api.ts                        — HTTP-клиент
  ├─ components/calculator/WindRose.tsx   — SVG-роза ветров
  ├─ components/calculator/LoadHeatmap.tsx — Canvas-тепловая карта
  └─ types/calculator.ts               — TypeScript-типы

Backend
  ├─ app/routers/calculator.py         — эндпоинты /calculator/*
  ├─ app/services/calculator/wind.py   — Open-Meteo + агрегация секторов
  ├─ app/services/calculator/engine.py — главный движок расчёта
  ├─ app/services/calculator/sp20.py   — базовая снеговая нагрузка СП 20.13330
  ├─ app/services/calculator/sp_drift.py — пригрузы у парапетов (приложение Б)
  ├─ app/services/calculator/geometry.py — геометрия кровли и регулярная сетка
  └─ app/schemas/schemas.py            — Pydantic-схемы
```

---

## 2. Роза ветров

### 2.1. Frontend: запрос к backend

**Файл:** `frontend/src/api/api.ts`

```ts
const API_BASE = (() => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocal) return 'http://localhost:8000';
  return '/api';
})();

async function apiFetch(path: string, options: RequestInit = {}, timeoutMs = 30000): Promise<any> {
  const url = `${API_BASE}${path}`;
  const token = localStorage.getItem("smart_roof_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
  const res = await fetch(url, { ...options, headers, cache: 'no-store' });
  // ...обработка 401, ошибок, JSON
}

export const api = {
  calculator: {
    windRose: (lat: number, lon: number, seasons = 5) =>
      apiFetch(`/calculator/wind-rose?lat=${lat}&lon=${lon}&seasons=${seasons}`),
  },
};
```

**Вызов со страницы:** `frontend/src/pages/CalculatorPage.tsx`

```ts
useEffect(() => {
  let cancelled = false;
  setWindRose(null);
  setWindRoseLoading(true);

  api.calculator
    .windRose(lat, lon, 5)
    .then((data) => {
      if (!cancelled) setWindRose(data);
    })
    .catch((e) => console.error('Wind rose fetch failed:', e))
    .finally(() => {
      if (!cancelled) setWindRoseLoading(false);
    });

  return () => { cancelled = true; };
}, [lat, lon]);
```

### 2.2. Backend: эндпоинт

**Файл:** `backend/app/routers/calculator.py`

```python
@router.get("/wind-rose", response_model=WindRoseResponse)
async def wind_rose(
    lat: float,
    lon: float,
    seasons: int = 5,
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> WindRoseResponse:
    records = await fetch_wind_rose(lat, lon, seasons=seasons)
    summary = summarize_wind_rose(records)
    return WindRoseResponse(
        sectors=summary["sectors"],
        total_hours=summary["total_hours"],
        source=records["source"],
        latitude=records["latitude"],
        longitude=records["longitude"],
    )
```

Роутер подключается в `backend/app/main.py`:

```python
from app.routers.calculator import router as calculator_router
app.include_router(calculator_router)
```

Полный URL: `GET /calculator/wind-rose?lat=55.7558&lon=37.6173&seasons=5`.

### 2.3. Backend: внешний источник данных

**Файл:** `backend/app/services/calculator/wind.py`

Источник: **Open-Meteo Historical Weather API**  
`https://archive-api.open-meteo.com/v1/archive`

#### 2.3.1. fetch_wind_rose

Логика:
1. Берётся `seasons` полных зим (декабрь–февраль).
2. Последняя полная зима заканчивается в феврале текущего года, если сейчас март или позже; иначе в феврале предыдущего года.
3. Запрашиваются почасовые поля `wind_direction_10m` и `wind_speed_10m`.
4. Из ответа отбрасываются месяцы, не входящие в зиму (март–ноябрь).

```python
async def fetch_wind_rose(lat: float, lon: float, seasons: int = 5) -> dict[str, Any]:
    today = date.today()
    last_winter_end_year = today.year if today.month > 2 else today.year - 1
    first_winter_start_year = last_winter_end_year - seasons + 1

    start_date = f"{first_winter_start_year - 1}-12-01"
    end_date = f"{last_winter_end_year}-02-28"

    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": "wind_direction_10m,wind_speed_10m",
        "timezone": "auto",
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(OPEN_METEO_ARCHIVE_URL, params=params)
        response.raise_for_status()
        data = response.json()

    hourly = data.get("hourly", {})
    times = hourly.get("time", [])
    directions = hourly.get("wind_direction_10m", [])
    speeds = hourly.get("wind_speed_10m", [])

    winter_hours, winter_directions, winter_speeds = [], [], []
    for t, d, s in zip(times, directions, speeds):
        month = int(t[5:7])
        if month in (12, 1, 2):
            winter_hours.append(t)
            winter_directions.append(d)
            winter_speeds.append(s)

    return {
        "hours": winter_hours,
        "speed_ms": winter_speeds,
        "direction_deg": winter_directions,
        "source": "open-meteo-archive-winter",
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "seasons": seasons,
    }
```

#### 2.3.2. summarize_wind_rose

Агрегирует почасовые наблюдения в **16 секторов** по 22.5°.

```python
SECTORS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
           "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]

index = int((d + 11.25) % 360 / 22.5) % 16
```

Сектор `N` центрирован на 0°, границы ±11.25°.  
Для каждого сектора считается:
- `count` — число часов;
- `avg_speed_ms` — средняя скорость ветра в секторе.

```python
def summarize_wind_rose(records: dict[str, Any]) -> dict[str, Any]:
    directions = records.get("direction_deg", [])
    speeds = records.get("speed_ms", [])

    counts = {s: 0 for s in SECTORS}
    speed_sums = {s: 0.0 for s in SECTORS}

    for d, s in zip(directions, speeds):
        if d is None or s is None:
            continue
        index = int((d + 11.25) % 360 / 22.5) % 16
        sector = SECTORS[index]
        counts[sector] += 1
        speed_sums[sector] += float(s)

    return {
        "sectors": [
            {
                "sector": sector,
                "count": counts[sector],
                "avg_speed_ms": round(speed_sums[sector] / counts[sector], 2)
                                if counts[sector] else 0.0,
            }
            for sector in SECTORS
        ],
        "total_hours": len(directions),
    }
```

### 2.4. Схемы данных

**Backend:** `backend/app/schemas/schemas.py`

```python
class WindRoseSector(BaseModel):
    sector: str
    count: int
    avg_speed_ms: float

class WindRoseResponse(BaseModel):
    sectors: list[WindRoseSector]
    total_hours: int
    source: str = "open-meteo"
    latitude: float
    longitude: float
```

**Frontend:** `frontend/src/types/calculator.ts`

```ts
export interface WindRoseSector {
  sector: string;
  count: number;
  avg_speed_ms: number;
}

export interface WindRoseResponse {
  sectors: WindRoseSector[];
  total_hours: number;
  source: string;
  latitude: number;
  longitude: number;
}
```

### 2.5. Визуализация: WindRose.tsx

**Файл:** `frontend/src/components/calculator/WindRose.tsx`

Компонент рисует SVG-розу: 16 клиньев + концентрические круги + оси + подписи сторон света.

```ts
const SECTOR_TO_DEG: Record<string, number> = {
  N: 0, NNE: 22.5, NE: 45, ENE: 67.5,
  E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
  S: 180, SSW: 202.5, SW: 225, WSW: 247.5,
  W: 270, WNW: 292.5, NW: 315, NNW: 337.5,
};

const SECTOR_LABELS: Record<string, string> = {
  N: 'С', NNE: 'ССВ', NE: 'СВ', ENE: 'ВСВ',
  E: 'В', ESE: 'ВЮВ', SE: 'ЮВ', SSE: 'ЮЮВ',
  S: 'Ю', SSW: 'ЮЮЗ', SW: 'ЮЗ', WSW: 'ЗЮЗ',
  W: 'З', WNW: 'ЗСЗ', NW: 'СЗ', NNW: 'ССЗ',
};
```

#### 2.5.1. Построение сектора

```ts
const sectorPath = (deg: number, value: number) => {
  const angleWidth = Math.PI / 8;               // 22.5°
  const angle = (deg - 90) * (Math.PI / 180);   // поворот: 0° = верх (север)
  const radius = maxRadius * value;             // value = count / maxCount

  const x1 = center + radius * Math.cos(angle - angleWidth / 2);
  const y1 = center + radius * Math.sin(angle - angleWidth / 2);
  const x2 = center + radius * Math.cos(angle + angleWidth / 2);
  const y2 = center + radius * Math.sin(angle + angleWidth / 2);

  return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
};
```

Почему `deg - 90`: в SVG ось Y направлена вниз, а 0° — это 3 часа. Чтобы север был сверху, поворачиваем на -90°.

#### 2.5.2. Рендер

```tsx
<svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px]">
  {/* Фоновые кольца */}
  {[0.25, 0.5, 0.75, 1].map((r) => (
    <circle cx={center} cy={center} r={maxRadius * r} fill="none" stroke="#e8e0d5" />
  ))}

  {/* Оси */}
  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
    const a = (deg - 90) * (Math.PI / 180);
    return <line x1={center} y1={center} x2={center + maxRadius * Math.cos(a)} ... />;
  })}

  {/* Секторы */}
  {data.sectors.map((s) => {
    const deg = SECTOR_TO_DEG[s.sector];
    const value = s.count / maxCount;
    return (
      <path
        d={sectorPath(deg, value)}
        fill="rgba(217, 119, 73, 0.7)"
        stroke="#d97749"
      />
    );
  })}

  {/* Подписи сторон света */}
  {Object.entries(SECTOR_TO_DEG).map(([sector, deg]) => {
    const a = (deg - 90) * (Math.PI / 180);
    const r = maxRadius + 18;
    return (
      <text x={center + r * Math.cos(a)} y={center + r * Math.sin(a)} ...>
        {SECTOR_LABELS[sector]}
      </text>
    );
  })}
</svg>
```

Параметры визуализации:

| Параметр | Значение | Смысл |
|----------|----------|-------|
| `size` | 280 px | viewBox |
| `maxRadius` | `size * 0.36` ≈ 100.8 px | максимальный радиус сектора |
| `rings` | `[0.25, 0.5, 0.75, 1]` | концентрические круги |
| `angleWidth` | π/8 | ширина сектора 22.5° |
| Нормализация | `count / maxCount` | относительная частота |

### 2.6. Использование преобладающего ветра

**Файл:** `frontend/src/pages/CalculatorPage.tsx`

```ts
const dominantWind = useMemo(() => {
  if (!windRose) return null;
  return windRose.sectors.reduce(
    (max, s) => (max === null || s.count > max.count ? s : max),
    null as WindRoseResponse['sectors'][0] | null,
  );
}, [windRose]);

const useDominantWind = () => {
  if (!dominantWind) return;
  const deg = SECTOR_TO_DEG[dominantWind.sector];
  setParams((p) => ({ ...p, wind_direction_deg: deg }));
  toast.info(`Направление ветра установлено: ${SECTOR_LABELS[dominantWind.sector]} (${deg}°)`);
};
```

Преобладающий ветер — сектор с максимальным `count`. Его азимут (`SECTOR_TO_DEG`) записывается в параметр `wind_direction_deg` и отправляется на backend при расчёте.

### 2.7. Подводные камни розы ветров

1. **Метеорологическое направление.** `wind_direction_10m` в Open-Meteo — это направление, **откуда** дует ветер. В расчёте дрифта это сохраняется: ветер «приходит» из заданного азимута.
2. **Пустые данные.** `summarize_wind_rose` пропускает пары `(d, s)`, где хотя бы один `None`.
3. **Зима = декабрь–февраль.** Open-Meteo возвращает весь диапазон дат; лишние месяцы отсекаются на стороне Python.
4. **Внешний API.** Open-Meteo может быть недоступен или медленным. На фронте ошибка только пишется в `console.error`, UI показывает «Нет данных».
5. **Авторизация опциональна.** Эндпоинт использует `get_current_user_optional`.

---

## 3. Расчёт снеговой нагрузки

### 3.1. Frontend: вызов расчёта

**Файл:** `frontend/src/api/api.ts`

```ts
calculator: {
  calculate: (geometry: any, params: any) =>
    apiFetch("/calculator/calculate", {
      method: "POST",
      body: JSON.stringify({ geometry, params }),
    }),
}
```

**Файл:** `frontend/src/pages/CalculatorPage.tsx`

```ts
const geometry = {
  contours: contours.map((c) => ({
    contour_type: c.contour_type,
    points: c.points,
    level_m: c.level_m ?? undefined,
    parapet_top_m: c.parapet_top_m ?? undefined,
    name: c.name,
  })),
  roof_type: 'flat' as const,
  slope_deg: params.mu === undefined ? 0 : undefined,
  north_direction_deg: northDirectionDeg,
};

const res = await api.calculator.calculate(geometry, params);
setResult(res);
```

### 3.2. Типы данных

**Frontend:** `frontend/src/types/calculator.ts`

```ts
export interface CalculationPoint {
  x: number;
  y: number;
  z?: number;
}

export interface CalculationContour {
  contour_type: 'outer' | 'inner';
  points: CalculationPoint[];
  level_m?: number | null;
  parapet_top_m?: number | null;
  name?: string;
}

export interface CalculationRoofGeometry {
  contours?: CalculationContour[];
  // Deprecated flat fields kept for backward compatibility.
  outer_contour?: CalculationPoint[];
  obstacles?: CalculationObstacle[];
  roof_type?: 'flat' | 'pitched' | 'shed';
  slope_deg?: number;
  level_m?: number;
  north_direction_deg?: number;
}

export interface CalculationParams {
  snow_region_value_kpa?: number;
  snow_region_code?: string;
  ce?: number;
  ct?: number;
  mu?: number;
  slope_deg?: number;
  wind_direction_deg?: number;
  wind_speed_ms?: number;
  ground_snow_load_kpa?: number;
}

export interface GridCell {
  x: number;
  y: number;
  value_kpa: number;
}

export interface CalculationResult {
  grid: GridCell[];
  width: number;
  height: number;
  cell_size_m: number;
  min_value_kpa: number;
  max_value_kpa: number;
  bounds: {
    min_x: number;
    max_x: number;
    min_y: number;
    max_y: number;
  };
  wind_direction_deg: number;
  local_wind_direction_deg?: number;
  north_direction_deg?: number;
}
```

**Backend:** `backend/app/schemas/schemas.py`

```python
class CalculationPoint(BaseModel):
    x: float
    y: float
    z: Optional[float] = 0.0

class CalculationContour(BaseModel):
    contour_type: str          # "outer" | "inner"
    points: list[CalculationPoint]
    level_m: Optional[float] = None
    parapet_top_m: Optional[float] = None
    name: Optional[str] = None

class CalculationRoofGeometry(BaseModel):
    contours: list[CalculationContour] = []
    outer_contour: list[CalculationPoint] = []   # legacy
    obstacles: list[CalculationObstacle] = []    # legacy
    roof_type: str = "flat"
    slope_deg: Optional[float] = None
    level_m: Optional[float] = None
    north_direction_deg: float = 0.0

class CalculationParams(BaseModel):
    snow_region_value_kpa: Optional[float] = None
    snow_region_code: Optional[str] = None
    ce: float = 1.0
    ct: float = 1.0
    mu: Optional[float] = None
    wind_direction_deg: float = 0.0
    wind_speed_ms: Optional[float] = None
    ground_snow_load_kpa: Optional[float] = None
```

### 3.3. Backend: главный движок

**Файл:** `backend/app/services/calculator/engine.py`

```python
def calculate_snow_load(
    geometry: CalculationRoofGeometry,
    params: CalculationParams,
    cell_size: float = 0.25,
) -> dict:
```

#### 3.3.1. Порядок работы

1. **Геометрия.**
   ```python
   if geometry.contours:
       roof = RoofGeometry(contours=geometry.contours)
   else:
       roof = RoofGeometry(
           outer_contour=geometry.outer_contour,
           obstacles=geometry.obstacles or [],
       )
   ```

2. **Сетка.**
   ```python
   grid = roof.build_grid(cell_size=cell_size)
   points = grid["points"]   # (N, 2)
   mask = grid["mask"]       # (N,) bool
   ```

3. **Базовая нагрузка.**
   ```python
   sg = params.ground_snow_load_kpa or params.snow_region_value_kpa or 1.5
   ce = params.ce if params.ce is not None else 1.0
   ct = params.ct if params.ct is not None else 1.0
   slope = geometry.slope_deg if geometry.slope_deg is not None else 0.0

   base_values = apply_sp20_uniform(
       grid_mask=mask,
       ground_snow_load_kpa=sg,
       slope_deg=slope,
       ce=ce,
       ct=ct,
       mu=params.mu,
   )
   s_base = sp20_base_load(sg, slope, ce, ct, params.mu)
   ```

4. **Переход в локальную систему кровли.**
   ```python
   wind_direction_deg = params.wind_direction_deg if params.wind_direction_deg is not None else 0.0
   north = geometry.north_direction_deg if geometry.north_direction_deg is not None else 0.0
   local_wind_direction_deg = wind_direction_deg - north
   ```

5. **Пригруз от парапетов (приложение Б).**
   ```python
   mu_field = np.ones_like(base_values)
   outer = roof.outer
   if len(outer) >= 3 and s_base > 0.0:
       contour_parapet_height = _contour_parapet_height(geometry)
       if contour_parapet_height > 0.0:
           mu_field = parapet_drift_mu(
               grid_points=points,
               grid_mask=mask,
               roof_poly=outer,
               parapet_height_m=contour_parapet_height,
               wind_direction_deg=local_wind_direction_deg,
               base_load_kpa=s_base,
           )

       for segment, height in _obstacle_parapets(geometry.obstacles or []):
           mu_field = np.maximum(
               mu_field,
               parapet_segment_drift_mu(
                   grid_points=points,
                   grid_mask=mask,
                   roof_poly=outer,
                   segment=segment,
                   parapet_height_m=height,
                   wind_direction_deg=local_wind_direction_deg,
                   base_load_kpa=s_base,
               ),
           )
   ```

6. **Финальное поле.**
   ```python
   values = base_values * mu_field
   values[~mask] = 0.0
   ```

7. **Ответ.**
   ```python
   return {
       "grid": [
           {"x": float(x), "y": float(y), "value_kpa": float(v)}
           for (x, y), inside, v in zip(points, mask, values)
           if inside
       ],
       "width": grid["width"],
       "height": grid["height"],
       "cell_size_m": cell_size,
       "min_value_kpa": float(values[mask].min()) if mask.any() else 0.0,
       "max_value_kpa": float(values[mask].max()) if mask.any() else 0.0,
       "bounds": {"min_x": min_x, "max_x": max_x, "min_y": min_y, "max_y": max_y},
       "wind_direction_deg": wind_direction_deg,
       "local_wind_direction_deg": local_wind_direction_deg,
       "north_direction_deg": north,
   }
   ```

### 3.4. Базовая нагрузка: sp20.py

**Файл:** `backend/app/services/calculator/sp20.py`

#### 3.4.1. Формула

СП 20.13330.2016, формула 10.1:

```
S = 0.7 · c_e · c_t · μ_f · S_g
```

```python
def sp20_base_load(
    ground_snow_load_kpa: float,
    slope_deg: float = 0.0,
    ce: float = 1.0,
    ct: float = 1.0,
    mu: Optional[float] = None,
) -> float:
    if mu is None:
        mu = _snow_load_shape_coefficient(slope_deg)
    return 0.7 * ce * ct * mu * ground_snow_load_kpa
```

#### 3.4.2. Коэффициент формы μ

Таблица 10.1 СП 20.13330.2016:

```python
def _snow_load_shape_coefficient(slope_deg: float) -> float:
    if slope_deg <= 10:
        return 1.0
    if slope_deg <= 30:
        return 0.8
    if slope_deg < 60:
        return 0.8 * (60.0 - slope_deg) / 30.0
    return 0.0
```

| Уклон | μ |
|-------|---|
| ≤ 10° | 1.0 |
| 10°–30° | 0.8 |
| 30°–60° | линейная интерполяция 0.8 → 0 |
| ≥ 60° | 0 |

Для плоских кровель `μ = 1.0`.

#### 3.4.3. Распределение на сетке

```python
def apply_sp20_uniform(
    grid_mask: np.ndarray,
    ground_snow_load_kpa: float,
    slope_deg: float = 0.0,
    ce: float = 1.0,
    ct: float = 1.0,
    mu: Optional[float] = None,
) -> np.ndarray:
    base = sp20_base_load(ground_snow_load_kpa, slope_deg, ce, ct, mu)
    values = np.zeros_like(grid_mask, dtype=float)
    values[grid_mask] = base
    return values
```

Базовая нагрузка одинакова во всех точках внутри кровли.

### 3.5. Геометрия и сетка: geometry.py

**Файл:** `backend/app/services/calculator/geometry.py`

#### 3.5.1. RoofGeometry

```python
class RoofGeometry:
    def __init__(self, contours=None, outer_contour=None, obstacles=None):
```

- Требуется **ровно один** `outer` контур, минимум 3 точки.
- `inner`-контуры — вырезы в кровле.
- Для каждого контура, если заданы `level_m` и `parapet_top_m`, высота парапета вычисляется как `parapet_top_m - level_m` и сохраняется в `self.obstacles`.

#### 3.5.2. build_grid

```python
def build_grid(self, cell_size: float, include_obstacles: bool = True) -> dict:
    min_x, min_y, max_x, max_y = self.bounds
    width = max(1, int(np.ceil((max_x - min_x) / cell_size)))
    height = max(1, int(np.ceil((max_y - min_y) / cell_size)))

    xs = min_x + (np.arange(width) + 0.5) * cell_size
    ys = min_y + (np.arange(height) + 0.5) * cell_size
    xx, yy = np.meshgrid(xs, ys)
    points = np.column_stack([xx.ravel(), yy.ravel()])

    # Ячейка активна, если центр внутри полигона...
    mask = self.point_in_polygon(points)

    # ...или если хотя бы один угол ячейки внутри полигона.
    half = cell_size / 2.0
    corners = np.array([[-half, -half], [-half, half], [half, -half], [half, half]])
    any_corner = np.zeros(len(points), dtype=bool)
    for dx, dy in corners:
        any_corner |= self.point_in_polygon(points + np.array([dx, dy]))
    mask = mask | any_corner

    return {
        "xs": xs,
        "ys": ys,
        "points": points,
        "mask": mask,
        "width": width,
        "height": height,
        "cell_size": cell_size,
    }
```

#### 3.5.3. Point-in-polygon

```python
def _point_in_single_polygon(points: np.ndarray, poly: np.ndarray) -> np.ndarray:
    x, y = points[:, 0], points[:, 1]
    n = len(poly)
    inside = np.zeros(len(points), dtype=bool)

    j = n - 1
    for i in range(n):
        xi, yi = poly[i]
        xj, yj = poly[j]
        condition = ((yi > y) != (yj > y)) & (
            x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi
        )
        inside ^= condition
        j = i

    return inside
```

Векторизованный ray casting. Для многоугольника с отверстиями:

```python
def point_in_polygon(self, points: np.ndarray) -> np.ndarray:
    inside = _point_in_single_polygon(points, self.outer)
    for hole in self.inner:
        inside &= ~_point_in_single_polygon(points, hole)
    return inside
```

### 3.6. Дрифт от парапетов: sp_drift.py

**Файл:** `backend/app/services/calculator/sp_drift.py`

Реализует **схему Б.16** СП 20.13330.2016 — снеговые мешки у парапетов на плоских кровлях.

#### 3.6.1. Параметры дрифта

```python
def _drift_parameters(h: float, base_load_kpa: float):
    if h <= base_load_kpa / 2.0 or base_load_kpa <= 0:
        return None
    mu_max = min(2.0 * h / base_load_kpa, 3.0)
    b = 2.0 * h
    if b <= 0:
        return None
    return mu_max, b
```

| Параметр | Формула | Смысл |
|----------|---------|-------|
| `h` | высота препятствия, м | `parapet_top_m - level_m` |
| `S₀` | `base_load_kpa` | базовая снеговая нагрузка, кПа |
| `μ_max` | `min(2h / S₀, 3)` | максимальный коэффициент формы у парапета |
| `b` | `2h` | ширина зоны пригруза, м |

Условие: пригруз возникает только если `h > S₀ / 2`.

#### 3.6.2. Направление ветра

```python
def _wind_from_vector(wind_direction_deg: float) -> np.ndarray:
    rad = math.radians(wind_direction_deg)
    return np.array([math.sin(rad), math.cos(rad)], dtype=float)
```

Вектор указывает **откуда** дует ветер (метеорологическое направление).

#### 3.6.3. Проверка «ветрового» ребра

```python
outward = -inward
if float(np.dot(outward, wind_from)) <= 0.0:
    return mu   # сегмент находится с подветренной стороны
```

- `inward` — единичная нормаль, направленная внутрь кровли.
- `outward` — наружу.
- Если вектор ветра `wind_from` смотрит наружу (`dot(outward, wind_from) > 0`), значит ветер ударяется о ребро — это наветренная сторона, пригруз нужен.

#### 3.6.4. Треугольное распределение

```python
def _apply_segment_triangular_mu(mu, grid_points, a, b, inward, wind_from, mu_max, zone_width):
    outward = -inward
    if float(np.dot(outward, wind_from)) <= 0.0:
        return mu

    dist = _perp_distance_inside_segment(grid_points, a, b, inward)
    in_zone = (dist > 0.0) & (dist <= zone_width)
    if not in_zone.any():
        return mu

    ratio = dist[in_zone] / zone_width
    edge_mu = mu_max - (mu_max - 1.0) * ratio
    edge_mu = np.clip(edge_mu, 1.0, mu_max)
    mu[in_zone] = np.maximum(mu[in_zone], edge_mu)
    return mu
```

- На ребре (`dist = 0`): `μ = μ_max`.
- На расстоянии `b` от ребра: `μ = 1.0`.
- Между ними: линейная интерполяция.

#### 3.6.5. parapet_drift_mu

```python
def parapet_drift_mu(
    grid_points: np.ndarray,
    grid_mask: np.ndarray,
    roof_poly: np.ndarray,
    parapet_height_m: float,
    wind_direction_deg: float,
    base_load_kpa: float,
) -> np.ndarray:
    mu = np.ones(len(grid_points), dtype=float)
    params = _drift_parameters(parapet_height_m, base_load_kpa)
    if params is None:
        return mu
    mu_max, b = params

    wind_from = _wind_from_vector(wind_direction_deg)
    inside_idx = np.where(grid_mask)[0]
    if inside_idx.size == 0:
        return mu

    poly = _ensure_ccw(np.asarray(roof_poly, dtype=float))
    mu_inside = mu[inside_idx].copy()

    n = len(poly)
    for i in range(n):
        a = poly[i]
        b_seg = poly[(i + 1) % n]
        inward = _segment_inward_normal(a, b_seg, poly)
        if np.linalg.norm(inward) < 0.001:
            continue
        mu_inside = _apply_segment_triangular_mu(
            mu_inside,
            grid_points[inside_idx],
            a,
            b_seg,
            inward,
            wind_from,
            mu_max,
            b,
        )

    mu[inside_idx] = mu_inside
    return mu
```

Проходит по всем рёбрам внешнего контура и накладывает треугольные пригрузы на наветренных сторонах.

#### 3.6.6. parapet_segment_drift_mu

То же самое, но для отдельного сегмента (например, частичного парапета или legacy obstacle). Используется, когда нужно задать препятствие не по всему периметру, а только на одном участке.

#### 3.6.7. height_difference_drift_mu

```python
def height_difference_drift_mu(...):
    """Simplified SP 20.13330 scheme Б.11 for height differences."""
    return np.ones(len(grid_points), dtype=float)
```

Заглушка. Схема Б.11 (перепады высот на больших кровлях) в текущей версии не реализована.

### 3.7. Frontend: отрисовка тепловой карты

**Файл:** `frontend/src/components/calculator/LoadHeatmap.tsx`

#### 3.7.1. Цветовая шкала

```ts
function heatColor(value: number, min: number, max: number): string {
  if (max <= min) return 'rgb(59, 130, 246)';
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  let r: number, g: number, b: number;
  if (t < 0.25) {
    const k = t / 0.25;
    r = 0;
    g = Math.round(100 + 155 * k);
    b = 255;
  } else if (t < 0.5) {
    const k = (t - 0.25) / 0.25;
    r = 0;
    g = 255;
    b = Math.round(255 * (1 - k));
  } else if (t < 0.75) {
    const k = (t - 0.5) / 0.25;
    r = Math.round(255 * k);
    g = 255;
    b = 0;
  } else {
    const k = (t - 0.75) / 0.25;
    r = 255;
    g = Math.round(255 * (1 - k));
    b = 0;
  }
  return `rgb(${r}, ${g}, ${b})`;
}
```

Градиент: синий → голубой → зелёный → жёлтый → красный.

#### 3.7.2. Преобразование координат

```ts
const widthM = bounds.max_x - bounds.min_x;
const heightM = bounds.max_y - bounds.min_y;
const scale = Math.min(cssWidth / widthM, cssHeight / heightM) * 0.92;
const offsetX = (cssWidth - widthM * scale) / 2;
const offsetY = (cssHeight - heightM * scale) / 2;

const toCanvas = (x: number, y: number) => ({
  x: offsetX + (x - bounds.min_x) * scale,
  y: cssHeight - (offsetY + (y - bounds.min_y) * scale),
});
```

- Входные единицы — **метры** (координаты ячеек сетки).
- Ось Y инвертирована (Canvas Y растёт вниз).
- `0.92` — зум-запас; карта центрируется в контейнере.

#### 3.7.3. HiDPI

```ts
const dpr = window.devicePixelRatio || 1;
canvas.style.width = `${cssWidth}px`;
canvas.style.height = `${cssHeight}px`;
canvas.width = Math.floor(cssWidth * dpr);
canvas.height = Math.floor(cssHeight * dpr);
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
```

Canvas масштабируется под `devicePixelRatio`, чтобы на Retina-экранах картинка была чёткой.

#### 3.7.4. Обрезка по внешнему контуру

```ts
const outer = contours.find((c) => c.contour_type === 'outer');
if (outer && outer.points.length >= 3) {
  ctx.save();
  ctx.beginPath();
  const first = toCanvas(outer.points[0].x, outer.points[0].y);
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < outer.points.length; i++) {
    const p = toCanvas(outer.points[i].x, outer.points[i].y);
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.clip();
}
```

Все ячейки рисуются только внутри внешнего контура — чтобы цветные квадраты не «выползали» за границу кровли.

#### 3.7.5. Отрисовка ячеек

```ts
const cellPx = Math.max(2, Math.ceil(cell_size_m * scale * 1.5) + 1);

for (const cell of grid) {
  const { x, y } = toCanvas(cell.x, cell.y);
  ctx.fillStyle = heatColor(cell.value_kpa, min_value_kpa, max_value_kpa);
  ctx.fillRect(Math.floor(x - cellPx / 2), Math.floor(y - cellPx / 2), cellPx, cellPx);
}
```

- `cellPx` — размер квадрата в пикселях.
- Множитель `1.5` даёт небольшое перекрытие, чтобы не было «дырок» в углах и на границах.

#### 3.7.6. Контуры поверх

```ts
ctx.lineWidth = 1.5;
for (const contour of contours) {
  if (contour.points.length < 2) continue;
  ctx.beginPath();
  // ...path...
  ctx.strokeStyle = contour.contour_type === 'outer' ? '#ffffff' : '#fbbf24';
  ctx.stroke();
}
```

Внешний контур — белый, внутренние (вырезы) — жёлтый.

#### 3.7.7. Легенда

```tsx
<div className="flex items-center justify-between text-xs text-warm-gray mt-2">
  <span>{min_value_kpa.toFixed(2)} кПа</span>
  <span
    className="h-2 flex-1 mx-2 rounded"
    style={{
      background:
        'linear-gradient(to right, rgb(0,100,255), rgb(0,255,255), rgb(0,255,0), rgb(255,255,0), rgb(255,0,0))',
    }}
  />
  <span>{max_value_kpa.toFixed(2)} кПа</span>
</div>
```

### 3.8. Подводные камни (расчёт и карта)

1. **Единицы измерения.** Все координаты контуров — в **метрах** локальной системы. Фронт передаёт метры, полученные из ручного редактора контуров.
2. **Север и ветер.** `local_wind_direction_deg = wind_direction_deg - north_direction_deg`. Расчёт дрифта использует локальное направление.
3. **Парапет должен быть задан.** Для внешнего контура нужны `level_m` и `parapet_top_m`. Иначе `contour_parapet_height = 0` и дрифта не будет.
4. **Условие дрифта.** Если `parapet_height <= base_load_kpa / 2`, `_drift_parameters` возвращает `None` — карта будет однородной.
5. **`μ` vs `slope_deg`.** Если пользователь ввёл `mu`, `slope_deg` игнорируется при расчёте базовой нагрузки.
6. **Приоритет S₀.** `ground_snow_load_kpa` важнее `snow_region_value_kpa`. Фронт заполняет `ground_snow_load_kpa` из автозаполнения по координатам.
7. **Пустой `grid`.** Если контур меньше ячейки или некорректен, `mask.any()` будет `false`, мин/макс станут `0`.
8. **Canvas и DPR.** Компонент масштабирует canvas под `window.devicePixelRatio` и сбрасывает `setTransform` при размонтировании.
9. **Контуры для обрезки.** `LoadHeatmap` принимает `contours`, но может работать и без них — тогда ячейки не будут обрезаны по внешнему контуру.
10. **Legacy-формат.** Движок поддерживает старые поля `outer_contour` + `obstacles`, но новый код должен использовать `contours`.
11. **Схема Б.11 не реализована.** Для больших кровель с перепадами высот (`l > 48 м`, `h > 1.2 м`) текущий движок возвращает `μ = 1.0`.

---

## 4. Полный пример запроса/ответа

### 4.1. Роза ветров

**Запрос:**
```http
GET /calculator/wind-rose?lat=55.7558&lon=37.6173&seasons=5
```

**Ответ:**
```json
{
  "sectors": [
    {"sector": "N", "count": 342, "avg_speed_ms": 5.4},
    {"sector": "NNE", "count": 120, "avg_speed_ms": 4.1},
    {"sector": "NE", "count": 98, "avg_speed_ms": 3.9},
    "..."
  ],
  "total_hours": 10800,
  "source": "open-meteo-archive-winter",
  "latitude": 55.7558,
  "longitude": 37.6173
}
```

### 4.2. Расчёт нагрузки

**Запрос:**
```http
POST /calculator/calculate
Content-Type: application/json

{
  "geometry": {
    "contours": [
      {
        "contour_type": "outer",
        "points": [
          {"x": 0, "y": 0},
          {"x": 10, "y": 0},
          {"x": 10, "y": 10},
          {"x": 0, "y": 10}
        ],
        "level_m": 0,
        "parapet_top_m": 1.2
      }
    ],
    "roof_type": "flat",
    "north_direction_deg": 0
  },
  "params": {
    "ground_snow_load_kpa": 1.0,
    "ce": 1.0,
    "ct": 1.0,
    "wind_direction_deg": 0,
    "slope_deg": 0
  }
}
```

**Ответ:**
```json
{
  "grid": [
    {"x": 0.125, "y": 0.125, "value_kpa": 0.70},
    {"x": 0.375, "y": 0.125, "value_kpa": 0.84},
    "..."
  ],
  "width": 40,
  "height": 40,
  "cell_size_m": 0.25,
  "min_value_kpa": 0.70,
  "max_value_kpa": 1.40,
  "bounds": {"min_x": 0, "max_x": 10, "min_y": 0, "max_y": 10},
  "wind_direction_deg": 0,
  "local_wind_direction_deg": 0,
  "north_direction_deg": 0
}
```

---

## 5. Чек-лист для повторения функционала

- [ ] Backend: роутер `/calculator` с эндпоинтами `/wind-rose` и `/calculate`.
- [ ] Backend: `fetch_wind_rose` через `https://archive-api.open-meteo.com/v1/archive` (зимние месяцы, `wind_direction_10m,wind_speed_10m`).
- [ ] Backend: `summarize_wind_rose` — 16 секторов, биннинг `(d + 11.25) % 360 / 22.5`.
- [ ] Frontend: вызов `api.calculator.windRose(lat, lon, seasons)` при смене координат.
- [ ] Frontend: SVG-компонент `<WindRose data={...}/>` с 16 клиньями, нормализованными по `maxCount`.
- [ ] Frontend: кнопка «Использовать преобладающий ветер» → `wind_direction_deg`.
- [ ] Backend: `/calculator/calculate` принимает `{geometry, params}` и возвращает `CalculationResultResponse`.
- [ ] Backend: `RoofGeometry` → `build_grid` → базовая нагрузка `0.7·ce·ct·μ·Sg` → дрифт от парапетов → умножение полей.
- [ ] Frontend: Canvas-компонент `<LoadHeatmap result={...} contours={...}/>`: метры → пиксели, цвет по `heatColor`, обрезка по `outer`, контуры поверх.

---

## 6. Зависимости

**Backend:**
- `fastapi`, `pydantic` — API и схемы.
- `numpy` — сетка, маски, векторные вычисления.
- `httpx` — запросы к Open-Meteo.

**Frontend:**
- `react` — компоненты и хуки.
- Canvas API + `ResizeObserver` — тепловая карта.
- SVG — роза ветров.
- `lucide-react`, `sonner` — иконки и уведомления (опционально).
