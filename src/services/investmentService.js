import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export function subscribeToEvolution(userId, onData, onError) {
  const ref = doc(db, "investmentEvolutions", userId);
  return onSnapshot(ref, onData, onError);
}
