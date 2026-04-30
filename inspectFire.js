import { doc, getDoc } from "firebase/firestore";
import { db } from "./scripts/firebaseClient.js";

const ref = doc(db, "investmentEvolutions", "user1");
const snap = await getDoc(ref);

if (!snap.exists()) {
  console.log("NO_EXISTE");
  process.exit(0);
}

const data = snap.data();
console.log("keys:", Object.keys(data));
const firstField = Object.keys(data)[0];
console.log("firstField:", firstField);
console.log("firstFieldType:", typeof data[firstField]);
if (Array.isArray(data[firstField])) {
  console.log("firstField length:", data[firstField].length);
  console.log("first 2 entries:", JSON.stringify(data[firstField].slice(0, 2), null, 2));
}
console.log(
  "full data snippet:",
  JSON.stringify(data, (k, v) => (k === "date" ? v : v), 2).slice(0, 3000)
);
