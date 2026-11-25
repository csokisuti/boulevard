# Boulevard – gyorsítás és olvasásszám-csökkentés

## Mit kell feltölteni
Az egész mappát, ugyanúgy, mint eddig. Új fájl: `shift-utils.js` (ezt is fel kell tölteni).
Adatbázis-, szabály- vagy index-módosítás nem kell.

## Firebase olvasások / írások
- **Stand oldal betöltése:** már nem olvas be minden alkalommal 80 lezárt standot csak a duplikátum-ellenőrzéshez.
  Az ellenőrzés eszközönként és nyitott standonként egyszer fut (20 olvasás), vagy ha egyszerre több nyitott stand van.
  Ugyanez a dashboardon és a tartozások oldalon is.
- **Helyi gyorsítótár (IndexedDB) bekapcsolva** (`firebase.js`). A stand tételsorai, a terméklista, a nyitott stand
  és a dashboard listája egyszeri listenerrel töltődik. A Firebase leírása szerint így a 30 percen belüli
  újratöltés csak a megváltozott dokumentumokat számolja. Az adat ugyanúgy friss szerveradat.
- **Mentés:** csak a megváltozott sorokat írja ki (eddig mindig mind a 100-200 sort).
  Mérve 180 terméknél: 40 sor kitöltése után 182 helyett 42 írás, módosítás nélküli mentésnél 182 helyett 2.
  A stand lezárása továbbra is minden sort kiír (biztonsági okból).
- **Saját ármódosítás után** a helyi terméklista nem dobódik el, csak frissül benne az ár (különben 100-200 olvasás).
- **PDF/nyomtatási kép:** eddig az összes valaha volt stand összes pénzmozgását sorban egyesével olvasta
  (minden nappal lassabb és drágább lett). Most célzott lekérdezéssel csak a tartozásokhoz tartozó tételeket olvassa
  (ugyanazt az indexet használja, mint a Tartozások oldal), ha ez nem megy, a régi módon, de párhuzamosan.
- **Riport:** a lottó tételekhez csak azoknak a standoknak a pénzmozgásait kéri le, ahol volt lottó forgalom.

## Sebesség
- A betöltés két körben fut (előtte 5-6 egymás utáni lépés volt).
- `app-ui.js`: a „Betöltés…” overlay figyelője már nem pásztázza végig az egész oldalt minden leütésnél;
  az overlay homályosítása (blur) kivéve, mert gyengébb tableten/telefonon drága.
- Gépelés közben az összesítők (kategória, végösszeg, leadó) képkockánként egyszer számolódnak újra,
  egyetlen menetben. Mérve: kb. feleannyi JavaScript-futásidő.
- A keresőmező 180 ms-ot vár gépelés után, nem minden betűnél rajzol újra; a táblázat egyben kerül a képernyőre.

## Hibakezelés
- Minden gomb (mentés, lezárás, pénzmozgás, kártya, lottó, repi, tartozás stb.) hibánál azonnal érthető üzenetet ír
  (nincs internet / nincs jogosultság / elfogyott a napi Firebase-kvóta), nem marad 20 mp-ig „Mentés folyamatban…”.
- Ha a betöltés megszakad, nem marad örökre a „Betöltés folyamatban…” takarás, hanem hibaüzenet jelenik meg.

## Megjelenés
- **Hiba javítva:** telefonon betöltéskor üres volt a terméklista, amíg nem forgattad el / méretezted át a képernyőt.
- **Tablet (1024 px-ig):** kártyás nézet, 640 px felett két oszlopban (eddig oldalra kellett görgetni a táblázatot,
  és a Maradvány oszlop kilógott).
- **PC:** a táblázat kifér (eddig 1440 px-en is lelógott az Eladási érték), oldalra görgetéskor a terméknév látszik.
