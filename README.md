# Racional · App (Frontend en tiempo real)

Visualización en tiempo real de la evolución de un portafolio de inversión, conectada al documento `investmentEvolutions/user1` en Firestore.

## Stack

- **React 18** + **Vite 5**
- **Firebase Web SDK v10** (modular)
- **Recharts** para el gráfico

## Cómo correr

```bash
npm install
npm run dev
```

La app abre en `http://localhost:5173`. La configuración de Firebase ya está embebida en `src/firebase.js` según lo entregado en el desafío.

## Estructura

```
src/
├── firebase.js                    # Inicialización del SDK (Firestore)
├── hooks/
│   └── useInvestmentEvolution.js  # Suscripción reactiva + normalización
├── components/
│   ├── Dashboard.jsx              # Composición principal
│   ├── EvolutionChart.jsx         # Gráfico de área con gradiente
│   ├── KPICard.jsx                # Tarjeta de métrica
│   └── ConnectionStatus.jsx       # Indicador "En vivo"
├── utils/
│   └── format.js                  # CLP, %, compact
├── App.jsx
├── main.jsx
└── index.css
```

## Decisiones de diseño

### Tiempo real correcto, no polling
Uso `onSnapshot` sobre el documento `investmentEvolutions/user1`. Cada cambio en Firestore se propaga al estado de React inmediatamente. La función de cleanup del `useEffect` cancela el listener al desmontar para evitar memory leaks.

### Lógica de datos separada de la UI
Toda la suscripción y normalización vive en `useInvestmentEvolution`. Los componentes solo consumen `series`, `status`, `lastUpdate` y `error`. Eso hace que el dashboard sea trivial de testear y el hook reusable para otros usuarios (`useInvestmentEvolution("user2")`).

### Normalización defensiva
El desafío no especifica el shape exacto del documento. El normalizador acepta varias formas razonables (`evolution`, `points`, `history`, `data`, `series` como arrays; o `values` como mapa fecha→valor) y maneja `Firestore Timestamp`, `Date`, ISO strings y epoch en segundos o milisegundos. Si nada calza, el inspector colapsable muestra el `raw` para no quedar a ciegas en la demo.

### UX pensada para una demo de inversiones
- **Indicador "En vivo"** con animación de pulso para que sea obvio que es real-time, no un snapshot.
- **KPIs** (valor actual, variación absoluta y %, máximo, mínimo) recalculados con `useMemo`.
- **Gradiente del área** que cambia de verde a rojo según la tendencia entre el primer y último punto.
- **Línea de referencia** en el valor inicial para contextualizar la variación visualmente.
- **Tooltip personalizado** con fecha + hora + valor formateado en CLP.
- **Formato localizado** (`es-CL`, currency CLP, números compactos en el eje Y).
- **Estados explícitos**: `connecting` / `live` / `error` con banner si falla.
- **Inspector de payload** colapsable, útil para presentar lo que viene de Firestore sin abrir la consola.

### Resiliencia
- Maneja documento inexistente con mensaje claro.
- Maneja serie vacía sin romper el render del gráfico.
- El error del listener se captura y se expone al usuario, no se traga.

## Uso de IA

Usé Claude (Anthropic) para acelerar partes específicas del trabajo:

- **Scaffolding**: estructura del proyecto, boilerplate de Vite/React/Firebase.
- **Hook de suscripción**: primer borrador del `useInvestmentEvolution`, que después endurecí agregando la normalización defensiva y el manejo de Timestamp/epoch.
- **Iteración de estilos**: variaciones del paleta oscura y de los detalles del tooltip y del estado "live".
- **Revisión**: revisé con la IA edge cases del normalizador (qué pasa si `values` viene vacío, si `date` es un Timestamp de Firestore, si `value` es string, etc.).

Las decisiones de arquitectura (separar el hook de los componentes, qué KPIs mostrar, cómo manejar shape desconocido, qué exponer en el inspector, qué priorizar para la demo) las definí yo y las usé como guía para acotar lo que pedía a la IA. La IA acelera la ejecución; el criterio de producto y de UX no se delega.

## Notas para la demo

- Si Firestore tiene reglas que requieren autenticación y la lectura falla con `permission-denied`, agregar `signInAnonymously` en `firebase.js` resuelve sin tocar el resto.
- El inspector de payload (al final del dashboard) sirve para mostrar en vivo cómo cambia el documento en Firestore mientras corre la app.
