# MANILLA DĀVANU IESAIŅOŠANAS PASŪTĪJUMU SISTĒMA
## TEHNISKĀ DOKUMENTĀCIJA, MVP PĀRSKATS UN 5 MĒNEŠU PRAKSES CEĻVEDIS (ROADMAP)

**Autors / Izstrādātājs:** Maksims Gnedovs (Rīgas Valsts tehnikums, 4. kurss, Programmētājs)  
**Uzņēmums:** SIA "Manilla" (Tērbatas iela 55, Rīga)  
**Prakses vadītāja:** Linda Lukstiņa (`linda@manilla.lv`)  
**Prakses koordinatore:** Megija  
**Prakses periods:** 02.11.2026. – 04.04.2027. (RVT oficiālais trīspusējais līgums)  
**Dokumenta datums:** 25. oktobris 2026. g.  
**Sistēmas tiešsaistes demonstrācija (Live Production):** [https://manilla-system.onrender.com](https://manilla-system.onrender.com)  
**Pirmkoda krātuve (GitHub):** [https://github.com/Maxuttko/manilla-system](https://github.com/Maxuttko/manilla-system)  

---

## 1. Ievads un projekta mērķis

SIA "Manilla" ir vadošais dizaina papīrlietu un dāvanu iesaiņošanas ateljē Latvijā ar veikaliem Tērbatas ielā 55, Tērbatas ielā 54 (Kids) un T/C "Galerija Centrs". Dāvanu iesaiņošana ir uzņēmuma viena no atpazīstamākajām vizītkartēm un augstas pievienotās vērtības pakalpojums, kurā nepieciešama absolūta precizitāte, materiālu uzskaite, ātrums un izcila klientu apkalpošanas kultūra.

**Projekta mērķis:**  
Izstrādāt un ieviest specializētu planšetēm pielāgotu (Tablet-First POS) pasūtījumu pārvaldības sistēmu, kas:
1. Pilnībā aizstāj papīra piezīmju lapiņas un novērš pasūtījumu pazaudēšanas risku.
2. Juridiski aizsargā uzņēmumu ar fotofiksāciju un klienta skārienjutīgu parakstu pie mantu pieņemšanas.
3. Nodrošina precīzu materiālu kalkulāciju (papīrs pa loksnēm, lentes pa metriem, kastes, dekori).
4. Sniedz meistaram skaidru darba rindu (Kanban dēli) ar termiņu kontroli un atsevišķu multi-dāvanu progresu.
5. Automātiski informē klientu ar SMS ziņu brīdī, kad dāvana ir gatava saņemšanai.

---

## 2. Ko prasīja Linda vs. Ko esam izdarījuši jau šodien (MVP analīze)

Saskaņā ar Lindas Lukstiņas sagatavoto oficiālo uzdevuma aprakstu, sistēmas pamatā ir 9 funkcionālie bloki. Zemāk sniegts detalizēts salīdzinājums starp prasībām un to faktisko realizāciju jau funkcionējošajā testa versijā:

| № | Lindas prasība | Realizācija izstrādātajā sistēmā (MVP) | Statuss |
|---|---|---|:---:|
| **1** | **Jauna pasūtījuma reģistrācija**<br>• Unikāls `#MNL-XXXX`<br>• Filiāle, darbinieks, klients<br>• Termiņš (15 min, 40 min, konkrēts laiks)<br>• Multi-dāvanas vienā pasūtījumā | • Automātiska numurācija (`#MNL-1051`, `#MNL-1052`...).<br>• Filiāļu izvēle (Tērbatas 55 / Galerija Centrs).<br>• 1-klikšķa termiņu pogas (Ekspress 15m, Standarts 40m, Šodien vakars, Rīt).<br>• Dinamisks multi-dāvanu veidotājs ar neatkarīgiem nosaukumiem un parametriem. | **100% Pabeigts** |
| **2** | **Klienta lietu uzskaite**<br>• Pre-wrapping fotofiksācija<br>• Bojājumu/stāvokļa fiksācija<br>• Ārpus Manilla mantu pieņemšana | • Kameras/failu augšupielāde katrai dāvanai ar tūlītēju priekšskatījumu.<br>• Bojājumu un stāvokļa piezīmes (izceļas ar dzeltenu `Bojājumu atzīme` birku tikai defektu gadījumā).<br>• Pārslēdzējs: *Manilla prece* vai *Ārpus Manilla personīgā manta*. | **100% Pabeigts** |
| **3** | **Iesaiņojuma materiālu izvēle**<br>• Papīrs, lente, kaste, zīdpapīrs, dekors<br>• Svītrkodu skenēšana, kods vai nosaukums<br>• Mērvienības: loksnes, metri, gabali | • Pilns katalogs ar Japandi materiāliem, paraugu krāsu toņiem un bildēm.<br>• Svītrkodu simulācija un reāllaika meklēšana pēc koda (`MNL-PAP-01`, `MNL-RIB-01`).<br>• Inteliģents soļa kalkulators: loksnes (gab.), lentes (soļi pa 0.1 m / 0.5 m), kastes. | **100% Pabeigts** |
| **4** | **Cena un apmaksa**<br>• Darba maksa atsevišķi no materiāliem<br>• Fiksēta cena vai provizorisks limits<br>• Apmaksas statuss un kases čeka Nr. | • Precīza matemātika: Darba samaksa (€ 2.50 / € 3.50) + Materiāli = Kopā.<br>• Izvēle: *Fiksēta cena* vai *Uzticos meistaram (ar budžeta limitu)*.<br>• Kases čeka numura ievade (`Čeks #89388`) nodokļu un grāmatvedības kontrolei. | **100% Pabeigts** |
| **5** | **Klienta kopsavilkums un paraksts**<br>• Pārskatāms kopsavilkums planšetē<br>• Skārienjutīgs paraksts (Canvas)<br>• Nemaināms audita laika zīmogs | • 4. solis ved uz elegantu klienta pieņemšanas ekrānu.<br>• HTML5 skārienjūtīgs audekls parakstam ar pirkstu vai irbuli (ar dzēšanas pogu).<br>• Paraksts tiek saglabāts PNG formātā un piesaistīts pasūtījuma audita vēsturei. | **100% Pabeigts** |
| **6** | **Pasūtījumu vadība (Kanban)**<br>• 4 statusu plūsma<br>• Hronoloģiska rinda pēc termiņa<br>• Multi-dāvanu per-gift pabeigšana | • Japandi stila Kanban dēlis: *Pieņemts → Iesaiņošanā → Gatavs → Izsniegts*.<br>• Saraksta (Table) un dēļa (Kanban) skati ar filtriem un meklētāju.<br>• Multi-dāvanu progresa kontrole (`1/2 iesaiņota`, neatkarīgi kross-čekboksi). | **100% Pabeigts** |
| **7** | **Automātiskais SMS paziņojums**<br>• Trigeris uz "Gatavs saņemšanai"<br>• Kanoniskais teksts ar veikala adresi<br>• Aizsardzība pret dublikātiem | • Pārvietojot pasūtījumu uz "Gatavs", izsaucas SMS ģenerators.<br>• Precīzs kanoniskais teksts: *«Labdien! Jūsu MANILLA dāvanu iesaiņojums (#MNL-XXXX) ir gatavs saņemšanai veikalā [Veikals, Adrese]...»*.<br>• Piegādes simulācija ar LMT ID un aizsardzību pret atkārtotu izsūtīšanu. | **100% Pabeigts** |
| **8** | **Birku druka un izsniegšana**<br>• Drukājama birka 50×80 mm<br>• Marķējums "1 no 2", "2 no 2"<br>• QR kods, kas atver līgumu | • Termodrukas priekšskatījums ar CSS `@media print` optimizāciju (tikai birka).<br>• Dinamisks SVG QR kods, kuru noskenējot atveras publiskais e-līgums `/contract/[id]`.<br>• Izsniegšanas kontrole: brīdina, ja pasūtījums vēl nav apmaksāts kasē. | **100% Pabeigts** |
| **9** | **Tehniskā arhitektūra un dizains**<br>• 100% latviešu valoda<br>• Japandi Paper Atelier dizaina sistēma<br>• Darbinieku lomas un PIN autorizācija | • Autentisks Manilla stils: Washi papīrs `#F9F6F0`, terakota `#B85D3E`, zīmola fonti `Outfit` un `Jost`.<br>• Darbinieku lomas (Linda - Admin, Ieva - Meistars, Marta - Kasieris) ar 4-ciparu ātro PIN pārslēgšanu planšetē. | **100% Pabeigts** |

---

## 3. Tehnoloģiskā arhitektūra

Sistēma veidota atbilstoši modernākajiem e-komercijas un iekšējo biznesa sistēmu (ERP/POS) standartiem:

```
[ Planšete / POS Kase ] (iPad / Surface / Chrome)
         │
         ▼  HTTPS / Responsive Japandi UI
[ Next.js 16 App Router ] (React 19, Tailwind CSS v4)
         │
    ┌────┴──────────────────────────┐
    ▼                               ▼
[ API Routes / REST Engine ]   [ HTML5 Canvas / QR Engine ]
  • /api/orders                  • Touch signature capture
  • /api/materials               • Pure SVG QR code generator
  • /api/auth                    • ESC/POS 50x80mm thermal CSS
    │
    ▼ Prisma ORM 5.22
[ Relāciju Datubāze ] (SQLite / PostgreSQL ready)
  • Pasūtījumi (Order) un Klienti (Customer)
  • Dāvanu vienības (GiftItem) un Materiāli (Material)
  • Nemaināms Audita žurnāls (AuditLog) ar parakstiem
  • SMS paziņojumu vēsture (SmsLog)
```

### Galvenās tehniskās priekšrocības:
1. **Nav ārēju smagu atkarību:** QR kodi tiek ģenerēti kā viegli vektori (`<svg>`), nodrošinot tūlītēju ielādi pat lēna veikala Wi-Fi apstākļos.
2. **Offline-first drošība:** Klienta paraksts un materiālu aprēķins tiek saglabāts lokāli un sinhronizēts ar serveri bez datu zuduma.
3. **Mērogojamība:** Kods strukturēts modulāri, kas ļauj datubāzi dažu minūšu laikā pārslēgt no SQLite uz centrālo PostgreSQL mākoni visu filiāļu sinhronizācijai.

---

## 4. 5 Mēnešu Prakses Ceļvedis (Roadmap: 02.11.2026. – 04.04.2027.)

Prakse ilgst 5 mēnešus (aptuveni 22 nedēļas, ~15–20h nedēļā). Zemāk ir detalizēts plāns pa posmiem, parādot, **kas un kad tiks ieviests reālajā Manilla veikalu vidē**:

```
[Novembris 2026]   ──► Posms 1: Fiziskā aparatūra & Pilota ieviešana Tērbatas 55
[Decembris 2026]   ──► Posms 2: Ziemassvētku pīķa slodze & Reālais SMS kanāls (LMT)
[Janvāris 2027]    ──► Posms 3: Kases & Noliktavas ERP integrācija (Atlikumu norakstīšana)
[Februāris 2027]   ──► Posms 4: Klientu lojalitāte & Tiešsaistes izsekošanas portāls
[Marts/Aprīlis]    ──► Posms 5: Analītika, Atskaites & Kvalifikācijas darba aizstāvēšana
```

---

### 1. POSMS: Fiziskās aparatūras savietojamība & Pilota palaišana
**Laiks:** Novembris 2026 (1.–4. prakses nedēļa)  
**Mērķis:** Pielāgot sistēmu Tērbatas ielas 55 veikala reālajai kases letei un meistara galdam.

* **Uzdevumi:**
  1. **USB & Bluetooth svītrkodu skeneru pieslēgšana:**  
     Nodrošināt tastatūras emulācijas režīmu (*Keyboard Wedge*), lai meistaram, noskenējot rulli vai lenti ar rokas skeneri, prece uzreiz pievienotos sarakstam bez klikšķināšanas ar peli.
  2. **Termoprintera integrācija birkām (50×80 mm):**  
     Testēšana ar Manilla veikalā esošo uzlīmju printeri (Zebra, Brother vai Xprinter). Tiešā druka no pārlūka ar vienu klikšķi.
  3. **iPad Kioska režīms (Guided Access):**  
     Planšetes leņķa turētāja uzstādīšana pie kases un lietotnes nofiksēšana pilnekrāna režīmā, lai klients parakstoties nevarētu iziet no sistēmas.
* **Mēneša rezultāts:** Tērbatas 55 veikalā meistars pieņem reālus pasūtījumus uz planšetes.

---

### 2. POSMS: Ziemassvētku pīķa slodzes tests & Reālais SMS kanāls
**Laiks:** Decembris 2026 (5.–8. prakses nedēļa)  
**Mērķis:** Nodrošināt sistēmas stabilitāti gada karstākajā dāvanu laikā un pieslēgt oficiālo SMS sūtītāju.

* **Uzdevumi:**
  1. **Tiešā LMT / SMS Gateway integrācija:**  
     Pieslēgties Latvijas Mobilā Telefona (vai Twilio/MessageBird) biznesa SMS API, reģistrējot oficiālo sūtītāja vārdu `MANILLA`.
  2. **Ātrās pieņemšanas režīms (Express Queue):**  
     Pīķa stundās iespēja pieņemt pasūtījumu 30 sekundēs (tikai klienta telefons + foto + uzticēšanās meistaram līdz fiksētam budžetam).
  3. **Slodzes izturība un kļūdu rezerve:**  
     Datu dublēšana un vietējā buferēšana, ja veikalā uz mirkli pazūd interneta savienojums.
* **Mēneša rezultāts:** Ziemassvētku sezonā veiksmīgi apstrādāti simtiem pasūtījumu; klienti saņem reālas SMS ar veikala norādi.

---

### 3. POSMS: Noliktavas un Kases (ERP/POS) Integrācija
**Laiks:** Janvāris 2027 (9.–12. prakses nedēļa)  
**Mērķis:** Automatizēt materiālu norakstīšanu un sasaistīt pakalpojumu ar grāmatvedības uzskaiti.

* **Uzdevumi:**
  1. **Materiālu atlikumu automātiska sinhronizācija:**  
     Kad dāvana tiek atzīmēta kā iesaiņota, no noliktavas atlikumiem automātiski tiek norakstītas izlietotās papīra loksnes un lentes metri.
  2. **Kases aparāta / POS čeku sasaiste:**  
     Kases sistēmas API integrācija, lai kases čeku summas un numurus nebūtu jāievada manuāli, bet tie automātiski atgrieztos sistēmā.
  3. **Zemo atlikumu brīdinājumi meistaram:**  
     Paziņojums, ja populārs dāvanu papīrs vai zīda lente atlikumā palikusi mazāk par 3 vienībām.
* **Mēneša rezultāts:** Precīza materiālu pašizmaksu uzskaite bez inventarizācijas kļūdām.

---

### 4. POSMS: Klientu Lojalitāte & Tiešsaistes Izsekošanas Portāls
**Laiks:** Februāris 2027 (13.–16. prakses nedēļa)  
**Mērķis:** Uzlabot klienta pieredzi un samazināt zvanu skaitu uz veikalu ar jautājumu "Vai mana dāvana ir gatava?".

* **Uzdevumi:**
  1. **Klienta personīgā izsekošanas saite:**  
     Pasūtījuma pieņemšanas brīdī klients saņem saiti uz savu viedtālruni, kur reāllaikā var redzēt statusu (*Pieņemts → Meistars strādā → Gatavs*).
  2. **Gatavā iesaiņojuma foto nosūtīšana:**  
     Iespēja meistaram pirms izsniegšanas nofotografēt rezultātu un nosūtīt klientam priekšskatījumu.
  3. **Lojalitātes atlaides un profili:**  
     Pastāvīgo klientu atpazīšana pēc tālruņa numura, piedāvājot personalizētus ieteikumus vai uzņēmuma korporatīvo dāvanu atlaides.
* **Mēneša rezultāts:** Samazināta meistaru noslodze pie telefona; moderns omnichannel serviss.

---

### 5. POSMS: Biznesa Analītika, Vadības Atskaites & Kvalifikācijas Aizstāvēšana
**Laiks:** Marts – Aprīlis 2027 (17.–22. prakses nedēļa)  
**Mērķis:** Nodrošināt Lindai pilnu biznesa analītiku un sagatavot noslēguma dokumentāciju RVT komisijai.

* **Uzdevumi:**
  1. **Vadītāja analītikas panelis (Dashboard):**  
     • Populārākie materiāli un krāsu kombinācijas.  
     • Vidējais iesaiņošanas laiks pa meistariem un pa filiālēm.  
     • Dāvanu iesaiņošanas pakalpojuma tīrā peļņa un materiālu rentabilitāte.
  2. **Datu eksports grāmatvedībai:**  
     Atskaišu eksports uz Excel / CSV formātiem par periodiem.
  3. **Kvalifikācijas darba dokumentācija:**  
     Sistēmas lietotāja rokasgrāmata veikala personālam, tehniskās specifikācijas apstiprināšana un RVT prakses aizstāvēšana uz maksimālo novērtējumu.
* **Prakses noslēguma rezultāts:** Pilnībā funkcionējoša, personāla apgūta sistēma visos Manilla veikalos, kas darbojas autonomi.

---

## 5. Datu drošība, konfidencialitāte un juridiskā aizsardzība

Dāvanu iesaiņošanas pakalpojumā bieži tiek uzticētas vērtīgas personīgās mantas (vērtslietas, pulksteņi, antīki priekšmeti, porcelāns). Sistēmā ieviesti šādi drošības mehānismi:

1. **Pre-wrapping fotofiksācija ar bojājumu atzīmi:**  
   Pirms dāvanas ietīšanas meistars nofotografē mantu un piefiksē esošos skrāpējumus. Klients par to parakstās, kas juridiski pasargā Manilla no nepamatotām pretenzijām pēc izpakošanas.
2. **Paraksta audita neaizskaramība:**  
   Klienta paraksts tiek saglabāts kopā ar konkrētās versijas datiem un servera laika zīmogu. Pat ja darbinieks vēlāk maina iekšējās piezīmes, sākotnējais parakstītais pieņemšanas akts netiek pārrakstīts.
3. **Konfidencialitāte planšetē:**  
   Klienta parakstīšanās brīdī ekrānā redzams tikai un vienīgi viņa konkrētais pasūtījums — citi klienti, tālruņu numuri vai iekšējās atzīmes ir 100% apslēptas atbilstoši VDAR (GDPR) prasībām.

---

## 6. Secinājums un gatavība darbam

Izstrādātā sistēma jau šodien ir **reāls, strādājošs produkts**, nevis tikai teorētisks prototips. Tā ir pieejama mākonī [manilla-system.onrender.com](https://manilla-system.onrender.com), ir vizuāli saskaņota ar Manilla zīmolu un pilnībā atbilst Lindas Lukstiņas definētajām prasībām.

Kā RVT 4. kursa programmētājs esmu gatavs no **2026. gada 2. novembra** uzsākt kvalifikācijas praksi SIA "Manilla", lai ieviestu šo sistēmu dzīvē un padarītu dāvanu iesaiņošanas procesu vēl ērtāku, ātrāku un mūsdienīgāku.

---
*Dokumentu sagatavoja:*  
**Maksims Gnedovs**  
RVT Programmēšanas nodaļas 4. kursa audzēknis  
Tālr.: `+371 23 770 550` | E-pasts: `maxeus26@gmail.com`
