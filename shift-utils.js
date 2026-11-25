import { collection, getDocs, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Friss (szerver által megerősített) lekérdezés egyszeri listenerrel.
// A helyi (IndexedDB) cache-sel együtt a Firestore így 30 percen belüli
// újratöltésnél csak a megváltozott dokumentumokat számolja olvasásnak,
// a getDocs viszont mindig a teljes eredményt. A visszakapott adat ugyanúgy
// friss szerveradat, mint getDocs-nál – a gyorsítótárazott (fromCache) állapotot kihagyjuk.
export function getDocsFresh(q, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    let done = false;
    let unsubscribe = null;
    const finish = (callback, value) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (unsubscribe) unsubscribe();
      callback(value);
    };
    const timer = setTimeout(() => {
      finish(reject, Object.assign(new Error("A szerver nem válaszolt időben."), { code: "unavailable" }));
    }, timeoutMs);

    try {
      unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, snapshot => {
        if (snapshot.metadata.fromCache) return;
        finish(resolve, snapshot);
      }, error => finish(reject, error));
      if (done) unsubscribe();
    } catch (error) {
      // Ha a listener valamiért nem indul, marad a hagyományos lekérdezés.
      clearTimeout(timer);
      done = true;
      getDocs(q).then(resolve, reject);
    }
  });
}

// A duplikált nyitott stand ellenőrzéséhez korábban minden oldalbetöltés 80 lezárt
// stand dokumentumot olvasott be. Az ellenőrzés most eszközönként és nyitott
// standonként csak egyszer fut le (20 olvasás), illetve mindig lefut, ha egynél több
// nyitott stand van – ez az a ritka eset, amikor tényleg duplikátum lehet.
const CHECK_PREFIX = "boulevardOpenShiftChecked:";
const RECENT_CLOSED_LIMIT = 20;

function storageGet(key) {
  try { return localStorage.getItem(key); } catch (error) { return null; }
}

function storageSet(key, value) {
  try { localStorage.setItem(key, value); } catch (error) { /* privát mód / tele tárhely */ }
}

function pruneOldChecks(keepIds) {
  try {
    const keep = new Set(keepIds.map(id => CHECK_PREFIX + id));
    for (let index = localStorage.length - 1; index >= 0; index--) {
      const key = localStorage.key(index);
      if (key && key.startsWith(CHECK_PREFIX) && !keep.has(key)) localStorage.removeItem(key);
    }
  } catch (error) { /* nem kritikus */ }
}

export async function recentClosedShiftsForDuplicateCheck(db, openShifts) {
  if (!openShifts.length) return [];

  const needsCheck = openShifts.length > 1 || openShifts.some(shift => !storageGet(CHECK_PREFIX + shift.id));
  if (!needsCheck) return [];

  const snap = await getDocs(query(collection(db, "shifts"), orderBy("closedAt", "desc"), limit(RECENT_CLOSED_LIMIT)));
  const closed = snap.docs
    .map(item => ({ id: item.id, ...item.data() }))
    .filter(item => item.status === "closed");

  if (openShifts.length === 1) {
    pruneOldChecks([openShifts[0].id]);
    storageSet(CHECK_PREFIX + openShifts[0].id, "1");
  }

  return closed;
}
