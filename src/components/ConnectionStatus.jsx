export default function ConnectionStatus({ status, lastUpdate }) {
  const map = {
    connecting: { text: "Conectando...", cls: "connecting" },
    live: { text: "En vivo", cls: "live" },
    error: { text: "Sin conexión", cls: "error" },
  };
  const { text, cls } = map[status] ?? map.connecting;

  return (
    <div className={`status status--${cls}`}>
      <span className="status__dot" />
      <span className="status__text">{text}</span>
      {lastUpdate && status === "live" && (
        <span className="status__time">
          · {lastUpdate.toLocaleTimeString("es-CL")}
        </span>
      )}
    </div>
  );
}
