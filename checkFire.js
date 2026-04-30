import { doc, getDoc } from "firebase/firestore";
import { db } from "./scripts/firebaseClient.js";

const ref = doc(db, "investmentEvolutions", "user1");
const snap = await getDoc(ref);

if (!snap.exists()) {
  console.log("NO_EXISTE");
} else {
  console.log("EXISTE");
  console.log(JSON.stringify(snap.data(), null, 2));
}
