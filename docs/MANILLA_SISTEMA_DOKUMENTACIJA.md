# MANILLA · Dāvanu Iesaiņošanas Sistēma
### Iekšējā darba termināļa apskats un ieviešanas soļi

**Izstrādātājs:** Maksims Gnedovs  
**Tiešsaistes sistēma (100% funkcionējoša):** [https://manilla-system.onrender.com](https://manilla-system.onrender.com)  
**Pirmkoda krātuve:** [https://github.com/Maxuttko/manilla-system](https://github.com/Maxuttko/manilla-system)  

---

## 1. Ievads un sistēmas koncepts

Labdien, Linda! Balstoties uz Jūsu aprakstīto uzdevumu, esmu izstrādājis specializētu **iekšējās darba vides sistēmu veikala komandai** (kases POS terminālim un meistara iesaiņošanas darba galdam).

### 100% strādājoša sistēma un demonstrācijas dati:
Šī nav vienkārši vizuāla skice vai "bilde", bet **pilnībā funkcionējoša, reāllaika mākoņa sistēma ar pieslēgtu PostgreSQL datubāzi**. Viss, kas šeit aprakstīts, jau ir reāli ieprogrammēts, darboties spējīgs un izmēģināms dzīvē.  
Lai demonstrācija būtu maksimāli uzskatāma un atspoguļotu veikala ikdienu, **sistēmas datubāze ir iepriekš piepildīta ar reālistiskiem testa pasūtījumiem** (faktiskajām Manilla filiālēm Tērbatas ielā un Galerijā Centrs, reāliem materiāliem, klientu mantām un plānotajiem termiņiem). Jūs varat droši brīvi spiest visas pogas, mainīt statusus, veikt jaunus pasūtījumus un reālajā laikā pārbaudīt sistēmas darbību.

*Šī ir pirmā versija pamatfunkcionalitātes un darba loģikas demonstrēšanai — visas Jūsu vēlmes un ieteikumi attiecībā uz vizuālo dizainu, krāsu toņiem, izvietojumu vai papildu iespējām tiks elastīgi un precīzi ieviesti atbilstoši Manilla stilam un komandas ērtībām.*

### Kāpēc tieši šāds formāts un "Pagriezt klientam" princips:
Šis nav publisks mārketinga e-veikals, bet **ergonomisks darba rīks planšetei pie kases un meistara galdā**, kas radīts apkalpošanas ātrumam, materiālu uzskaitei un juridiskajai drošībai:
1. **Materiālu izvēle:** Klients ekrānā vizuāli redz papīru, lenšu un dekoru paraugus ar cenām, kas palīdz ātri pieņemt lēmumu.
2. **Klienta apstiprinājums un paraksts (4. solis):** Planšete tiek pagriezta pret klientu, kurš pārskata kopsavilkumu un uz skārienekrāna ar pirkstu vai irbuli veic parakstu.

---

## 2. Kas jau ir pilnībā izstrādāts un pieejams pārbaudei

Katra zemāk minētā funkcija jau ir reāli uzbūvēta, notestēta un darbojas tiešsaistē — varat personīgi atvērt un pārliecināties:

### 2.1. Jauna pasūtījuma reģistrācijas vednis (4 soļos)
* **Automātiska numerācija:** Katram pasūtījumam tiek ģenerēts unikāls numurs (piemēram, `#MNL-1051`).
* **Veikala filiāle un atbildīgais darbinieks:** Iespēja izvēlēties konkrēto veikalu (Tērbatas iela 55 vai T/C Galerija Centrs) un meistaru.
* **Klienta kontakti:** Vārds, uzvārds, tālruņa numurs (+371 formātā SMS paziņojumiem) un e-pasts.
* **1-klikšķa termiņu izvēle:** Balstoties uz reālo Manilla darba ritmu:
  * *Ekspress (10–15 min)* — kamēr klients bauda kafiju;
  * *Standarts (30–40 min)*;
  * *Šodien līdz veikala slēgšanai*;
  * *Rīt vai konkrētā datumā/laikā*.

### 2.2. Klienta mantu uzskaite un fotofiksācija (Pre-wrapping)
* **Kameras integrācija:** Planšetē iespējams nofotografēt nododamo priekšmetu pirms iesaiņošanas (ar tūlītēju priekšskatījumu).
* **Bojājumu atzīme (Juridiskā aizsardzība):** Ja nodotajam priekšmetam (piemēram, antīkam porcelānam, pulkstenim vai vāzei) jau ir skrāpējums vai defekts, darbinieks to piefiksē. Kartītē parādās dzeltena brīdinājuma birka `Bojājumu atzīme`. Ja bojājumu nav, lauks paliek tīrs un sistēma fiksē teicamu stāvokli.
* **Preces izcelsme:** Pārslēdzējs starp *Manilla veikala preci* un *Ārpus Manilla personīgo mantu*.
* **Multi-dāvanu atbalsts:** Vienā pasūtījumā iespējams pievienot vairākas dāvanas, norādot, kuras iesaiņojamas kopā un kuras atsevišķi.

### 2.3. Materiālu piemeklēšana un inteliģentais cenu kalkulators
* **Japandi materiālu katalogs:** Dāvanu papīrs (Chiyogami, Botānika, Krafts, Terakota), zīda un samta lentes, amatnieku kastes, zīdpapīrs un dekori (vaska zīmogi, zariņi).
* **Mērvienību aprēķins:** Papīrs un kastes tiek skaitīti pa loksnēm/gabaliem, savukārt lentes — metros ar soli pa 0.1 m vai 0.5 m.
* **Svītrkodu un kodu meklēšana:** Materiālus var atrast pēc nosaukuma, artikula (`MNL-PAP-01`) vai skenējot svītrkodu.
* **Cenas struktūra:** Sistēma atsevišķi uzskaita meistara darba maksu (€ 2.50 par standarta vai € 3.50 par ārpus veikala dāvanu) un materiālu pašizmaksu.
* **Cenas veids:**
  * *Saskaņota gala cena* — precīzs aprēķins pie kases;
  * *Uzticos meistaram (Provizoriska cena)* — klients uzticas meistara gaumei, nosakot budžeta limitu (piemēram, "Līdz € 25.00").

### 2.4. Klienta paraksts uz skārienekrāna (HTML5 Canvas)
* Planšete tiek pagriezta pret klientu, kurš redz caurspīdīgu kopsavilkumu bez iekšējām piezīmēm.
* Klients ar pirkstu vai irbuli parakstās uz ekrāna. Paraksts tiek fiksēts kā PNG attēls un neatgriezeniski piesaistīts audita vēsturei kopā ar servera laika zīmogu.
* Kases čeka numura piesaiste (`Čeks #89388`) nodrošina grāmatvedības un nodokļu uzskaiti.

### 2.5. Meistara Kanban darba galds un saraksta skats
* **4 pamatstatusi:** `Pieņemts` → `Iesaiņošanā` → `Gatavs saņemšanai` → `Izsniegts`.
* **Hronoloģiskā rinda:** Pasūtījumi sakārtoti pēc izpildes termiņa.
* **Termiņu kontrole:** Sistēma automātiski izceļ šodien izpildāmos un steidzamos pasūtījumus, neradot viltus trauksmes.
* **Multi-dāvanu neatkarīgs progress (Per-gift tracking):** Ja pasūtījumā ir vairākas dāvanas, meistars darba procesā var atzīmēt katru iesaiņoto dāvanu atsevišķi (`1 no 2 iesaiņota`). Viss pasūtījums kļūst gatavs tikai tad, kad pabeigtas visas vienības.
* **Meistara materiālu lapa:** Atverot pasūtījumu, meistars redz precīzu "savākšanas lapu" ar nepieciešamajiem metriem, loksnēm, artikuliem un atlikumiem plauktā.

### 2.6. Automātiskais SMS paziņojums klientam
* Tiklīdz pasūtījums tiek pārvietots uz statusu **"Gatavs saņemšanai"**, nostrādā SMS paziņojuma loģika.
* Ziņas teksts precīzi atbilst Manilla prasībām:  
  *«Labdien! Jūsu MANILLA dāvanu iesaiņojums (#MNL-XXXX) ir gatavs saņemšanai veikalā [Filiāle, Adrese]. Gaidīsim Jūs!»*
* Iebūvēta stingra aizsardzība pret nejaušiem dublikātiem un kļūdu fiksēšana.

### 2.7. Drukājamās 50×80 mm birkas ar skenējamu QR kodu
* Pielāgotas uzlīmju termoprinterim (drukājas tikai pati birka 50×80 mm formātā).
* Vairāku dāvanu gadījumā birka norāda: **"Dāvana 1 no 2"**, **"Dāvana 2 no 2"**.
* Uz birkas ir tīrs vektora SVG QR kods — to noskenējot ar telefonu, atveras oficiālais elektroniskais pieņemšanas līgums ar klienta parakstu un fotogrāfiju (`/contract/[id]`).

### 2.8. Darbinieku autorizācija ar ātro PIN kodu
* Planšetei optimizēta darbinieku pārslēgšana: katram darbiniekam (Linda, Ieva, Marta) ir savs 4-ciparu PIN kods, kas ļauj sekundes laikā pārslēgt aktīvo meistaru pie kases.

---

## 3. Kas vēl jārealizē pilnai ieviešanai

Zemāk ir apkopotas lietas, kuras nepieciešams realizēt, lai sistēmu no izstrādātā prototipa pilnībā ieviestu ikdienas veikala apritē:

### 1. Fiziskās kases aparatūras savietojamība (Perifērija)
* **Uzdevums:** Pārbaudīt un pieslēgt veikalā esošo rokas svītrkodu skeneri (USB vai Bluetooth) un uzlīmju printeri pie planšetes.
* **Statuss un risinājums:** Modernie svītrkodu skeneri darbojas tastatūras emulācijas režīmā (*Keyboard Wedge*) — sistēma jau tagad uztver skenera signālu bez papildu draiveru programmēšanas.

### 2. Reālā SMS vārteja (LMT / Twilio API)
* **Uzdevums:** Pieslēgt LMT biznesa SMS pakalpojumu vai Twilio ar oficiālo sūtītāja vārdu `MANILLA`.
* **Statuss un risinājums:** Sistēmā jau ir pilnībā gatava datubāzes tabula `SmsLog`, kanoniskā teksta ģenerators un dublikātu filtrs. Atliek tikai funkcijā ievadīt API atslēgas.

### 3. Paplašināts vadītāja Administrators (Admin Panel)
* **Uzdevums:** Iespēja vadītājai (Lindai) tieši no saskarnes pievienot jaunus materiālus, mainīt cenas un ievadīt piegādātos atlikumus bez programmētāja palīdzības, kā arī pārvaldīt darbinieku kontus.
* **Statuss un risinājums:** Standarta vadības panelis, kas balstās uz jau izstrādātajiem datubāzes modeļiem un loģiku.

### 4. Noliktavas un kases aparāta (ERP/POS) integrācija
* **Uzdevums:** Automātiska materiālu norakstīšana no esošās veikala uzskaites sistēmas (kad dāvana pabeigta, no noliktavas "pazūd" izlietotie lentes metri un papīrs) un kases čeku numuru automātiska saņemšana.
* **Statuss un risinājums:** Realizācija ir atkarīga no tā, kādu kases/noliktavas programmu Manilla šobrīd izmanto (piem., Erply, Directo, 1C vai Shopify POS) un kādas API iespējas tā piedāvā.

---

## 4. Kā personīgi izmēģināt sistēmu darbībā

Sistēma ir izvietota publiskajā mākonī, pieslēgta reālai datubāzei un 100% gatava brīvam "testa braucienam":

* **Tiešsaistes adrese:** [https://manilla-system.onrender.com](https://manilla-system.onrender.com)
* **Ātrā 1-klikšķa autorizācija pieteikšanās ekrānā:**
  * **Linda Lukstiņa** (*Vadītāja / Admin*) — 1 klikšķis (PIN: `1111`, parole: `manilla2026`).
  * **Ieva Kalniņa** (*Galvenais Meistars*) — 1 klikšķis (PIN: `2222`, parole: `ieva2026`).
  * **Marta Liepiņa** (*Kasieris*) — 1 klikšķis (PIN: `3333`, parole: `marta2026`).

### Ieteicamie soļi pārbaudei:
1. **Pārlūkot Kanban dēli:** Apskatīt iepriekš sagatavotos demonstrācijas pasūtījumus ar reālistiskiem termiņiem, filtru birkām un statusu sadalījumu.
2. **Atvērt pasūtījumu `#MNL-1051`:** Pārliecināties, kā strādā bojājuma atzīme (tējkannai fiksēts defekts, kamēr tasītēm — nevainojams stāvoklis).
3. **Pārbaudīt birkas druku (QR ikona):** Apskatīt termodrukas birku "Dāvana 1 no 2" un noskenēt QR kodu ar telefonu, atverot elektronisko pieņemšanas līgumu.
4. **Izveidot jaunu pasūtījumu (`+ Jauns pasūtījums`):** Iziet cauri visiem 4 soļiem, pievienot materiālus un veikt reālu parakstu uz skārienjutīgā laukuma.

---
**Maksims Gnedovs** · Tālr.: `+371 23 770 550` · E-pasts: `maxeus26@gmail.com`
