import { useEffect, useState } from "react";
import { subscribeToEvolution } from "../services/investmentService";
import { normalize } from "../utils/normalize";

export function useInvestmentEvolution(userId = "user1") {
  const [series, setSeries] = useState([]);
  const [raw, setRaw] = useState(null);
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const unsub = subscribeToEvolution(
      userId,
      (snap) => {
        if (!snap.exists()) {
          setStatus("error");
          setError(`Documento investmentEvolutions/${userId} no existe`);
          return;
        }
        const data = snap.data();
        setRaw(data);
        setSeries(normalize(data));
        setStatus("live");
        setLastUpdate(new Date());
        setError(null);
      },
      (err) => {
        console.error("Firestore listener error:", err);
        setStatus("error");
        setError(err.message);
      }
    );

    return () => unsub();
  }, [userId]);

  return { series, raw, status, error, lastUpdate };
}
