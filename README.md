# Racional · Portafolio en Tiempo Real

Visualización interactiva de la evolución de un portafolio de inversión, conectada en tiempo real al documento `investmentEvolutions/user1` en Cloud Firestore.

---

## Stack

| Tecnología | Rol |
|---|---|
| React 18 + Vite 5 | Framework UI y servidor de desarrollo |
| Firebase Web SDK v10 | Conexión a Firestore (tiempo real) |
| Chart.js + react-chartjs-2 | Visualización del gráfico de área |
| CSS puro con variables | Estilos (tema oscuro, sin framework) |

---

## Requisitos previos

- Node.js 18 o superior
- npm 9 o superior
- Acceso a las credenciales del proyecto Firebase `racional-exam`

---

## Configuración del entorno

Antes de levantar el proyecto es necesario crear el archivo `.env` en la raíz del proyecto. Este archivo **no se incluye en el repositorio** por seguridad.

1. Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

2. Completa cada variable con las credenciales del proyecto Firebase:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el servidor de desarrollo
npm run dev
```

La app queda disponible en `http://localhost:5173` y se actualiza automáticamente con los cambios de Firestore.

### Otros comandos

```bash
# Build de producción
npm run build

# Preview del build
npm run preview

# Verificar que el documento existe en Firestore
node checkFire.js

# Inspeccionar la estructura del documento
node inspectFire.js
```

> Los scripts `checkFire.js` e `inspectFire.js` también leen las credenciales desde `.env`, por lo que no requieren configuración adicional.

---

## Estructura del proyecto

```
racional-app/
├── .env.example                     # Plantilla de variables de entorno
├── checkFire.js                     # Script: verifica existencia del documento
├── inspectFire.js                   # Script: inspecciona la forma del documento
├── scripts/
│   └── firebaseClient.js            # Config y cliente Firestore compartido (scripts Node)
└── src/
    ├── lib/
    │   └── firebase.js              # Inicialización del SDK de Firebase (app cliente)
    ├── services/
    │   └── investmentService.js     # Abstracción de onSnapshot (acceso a Firestore)
    ├── hooks/
    │   └── useInvestmentEvolution.js# Suscripción reactiva + estado (series, status, error)
    ├── utils/
    │   ├── format.js                # Formateo: CLP, %, notación compacta
    │   ├── normalize.js             # Normalización del documento Firestore → serie
    │   └── dateFilters.js           # Filtrado por rango de fechas (1M, 3M, 6M, 1Y)
    ├── constants/
    │   └── filters.js               # Definición de los rangos de filtro
    ├── components/
    │   ├── Dashboard.jsx            # Orquestador: estado de filtro, KPIs, layout
    │   ├── EvolutionChart.jsx       # Gráfico de área (Chart.js)
    │   ├── FilterBar.jsx            # Botones de filtro temporal (1M / 3M / 6M / 1Y / Todo)
    │   ├── KPICard.jsx              # Tarjeta de métrica reutilizable
    │   ├── ConnectionStatus.jsx     # Indicador de estado (conectando / en vivo / error)
    │   └── ErrorBoundary.jsx        # Error boundary de React con fallback visual
    ├── App.jsx
    ├── main.jsx
    └── index.css                    # Variables CSS globales + estilos de componentes
```

---

## Decisiones de arquitectura

### Separación en capas
La lógica sigue un flujo claro: **Firestore → servicio → hook → componente**. `investmentService.js` es el único lugar que conoce `onSnapshot`. El hook solo maneja estado. Los componentes solo renderizan.

### Normalización defensiva
El documento de Firestore puede venir en distintos shapes (campos `evolution`, `points`, `history`, `array`, etc.). El normalizador en `utils/normalize.js` acepta todas las variantes razonables y convierte automáticamente `Firestore Timestamp`, epoch en segundos, epoch en milisegundos e ISO strings a `Date`. Si nada calza, el inspector colapsable al pie del dashboard muestra el payload raw.

### Filtros del lado del cliente
Los botones 1M / 3M / 6M / 1Y / Todo filtran la serie ya normalizada en memoria. No se vuelve a consultar Firestore. El cutoff se calcula desde el **último punto de la serie** (no desde la fecha actual) para que el filtro siempre muestre datos aunque el portafolio no tenga actividad reciente.

### UX para demo de inversiones
- Indicador "En vivo" con animación de pulso: deja claro que los datos son reactivos, no un snapshot.
- KPIs del período (valor actual, variación, máximo, mínimo) se recalculan al cambiar el filtro con `useMemo`.
- El gráfico cambia de color verde a rojo según la tendencia del período seleccionado.
- El tooltip muestra el valor en CLP y la variación absoluta y porcentual desde el inicio del período.
- Línea de referencia horizontal en el valor inicial del período para contextualizar visualmente la variación.
- Estados explícitos `connecting` / `live` / `error` con banners, nunca un spinner genérico.

### Credenciales protegidas
Las variables de Firebase se leen desde `.env` tanto en la app (prefijo `VITE_`, leído por Vite) como en los scripts Node (leídas por `dotenv`). El mismo archivo `.env` alimenta ambos entornos. Nunca se commitean credenciales al repositorio.

---

## Uso de IA

Utilicé **Claude (Anthropic)** como asistente durante el desarrollo de este desafío. A continuación describo cómo lo integré y en qué partes del trabajo influyó realmente.

### Qué hizo la IA

**Scaffolding y boilerplate**
Generé la estructura inicial del proyecto (configuración de Vite, setup de Firebase, esqueleto de componentes) con soporte de Claude, lo que me permitió llegar al problema central de datos más rápido.

**Borrador del hook y la normalización**
El primer borrador de `useInvestmentEvolution` y la función `normalize()` los trabajé con la IA como copiloto. Luego endurecí manualmente los casos borde: qué pasa si el array viene vacío, si `date` es un Timestamp de Firestore, si `value` es string, si ningún campo conocido calza.

**Revisión de arquitectura**
Usé a Claude para validar la separación en capas (servicio / hook / componente), la extracción de utilidades a archivos propios y la estrategia de filtrado client-side. La IA propuso alternativas y yo elegí las que mejor encajaban con el scope del desafío.

**Estilos y detalles de UX**
Iterar variantes del tema oscuro, el tooltip personalizado, el gradiente dinámico y la animación del indicador "En vivo" fue mucho más ágil con la IA generando opciones para evaluar.

**Migración de librerías**
El cambio de Recharts a Chart.js (requerido por el desafío) lo ejecuté con asistencia de la IA: reescritura del componente, configuración de plugins para el gradiente y la línea de referencia, y ajuste del tooltip con callbacks nativos de Chart.js.

### Qué decidí yo

La IA ejecuta bien cuando tiene contexto claro. Las decisiones que le dieron ese contexto fueron mías:

- Qué KPIs mostrar y por qué (período filtrado, no el histórico completo).
- Que el filtro operara client-side sobre la serie ya cargada, no re-consultando Firestore.
- Que el cutoff del filtro se calculara desde el último punto de la serie y no desde `new Date()`.
- Qué campos del documento Firestore considerar en la normalización (`portfolioValue` vs `portfolioIndex`).
- La estructura de carpetas final y el contrato de cada módulo.
- Qué mostrar en el inspector y cuándo mostrar el empty state vs el error state.

### Conclusión

La IA comprime el tiempo de ejecución en partes donde el problema ya está bien definido (boilerplate, conversión de librerías, iteración de estilos). El valor como desarrollador está en definir el problema correctamente, evaluar las propuestas que genera y tomar las decisiones de producto y arquitectura que no se pueden delegar.

---

## Notas para la demo

- El inspector de payload (al final del dashboard) muestra en vivo cómo cambia el documento en Firestore mientras corre la app, útil para presentar el flujo de tiempo real.
- Si las reglas de Firestore requieren autenticación y la lectura falla con `permission-denied`, agregar `signInAnonymously` en `src/lib/firebase.js` resuelve el acceso sin modificar el resto del código.
