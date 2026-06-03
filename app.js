const storeKey = "dk-work-time-v1";
const languageKey = "dk-work-time-language-v1";
const migratedKey = "dk-work-time-migrated-v1";
const locale = "ru-RU";
const languageLocales = { ka: "ka-GE", ru: "ru-RU", en: "en-GB", da: "da-DK" };

const defaults = {
  settings: {
    language: "ru",
    currency: "DKK",
    payMode: "hourly",
    defaultRate: 160,
    dailyRate: 0,
    sickRate: 160,
    sickDailyRate: 0,
    holidayPercent: 12.5,
    taxFreeAllowance: 0,
    amPercent: 8,
    taxPercent: 37,
    fixedDeduction: 0,
    atpContribution: 0,
    employeePensionPercent: 0,
    employerPensionPercent: 0,
    personnelFee: 0,
    eveningRate: 0,
    nightRate: 0,
    weekendRate: 0,
    overtimePercent: 50,
    localRate: 0,
    meetingAddonRate: 0,
    qualificationAddonRate: 0,
    stabilityAddonRate: 0,
    soundEnabled: true,
    vibrationEnabled: true,
    theme: "light"
  },
  customAddons: [],
  customDeductions: [],
  paySlips: [],
  shifts: {}
};

const state = loadState();
let currentDate = new Date();
let selectedDate = toISODate(new Date());
let deferredInstallPrompt = null;
let feedbackAudioContext = null;

const els = {
  installButton: document.querySelector("#installButton"),
  androidInstallButton: document.querySelector("#androidInstallButton"),
  installStatus: document.querySelector("#installStatus"),
  totalHours: document.querySelector("#totalHours"),
  grossPay: document.querySelector("#grossPay"),
  holidayPay: document.querySelector("#holidayPay"),
  netPay: document.querySelector("#netPay"),
  monthTitle: document.querySelector("#monthTitle"),
  calendarGrid: document.querySelector("#calendarGrid"),
  prevMonth: document.querySelector("#prevMonth"),
  nextMonth: document.querySelector("#nextMonth"),
  shiftForm: document.querySelector("#shiftForm"),
  selectedDateTitle: document.querySelector("#selectedDateTitle"),
  deleteShift: document.querySelector("#deleteShift"),
  shiftDate: document.querySelector("#shiftDate"),
  startTime: document.querySelector("#startTime"),
  endTime: document.querySelector("#endTime"),
  breakMinutes: document.querySelector("#breakMinutes"),
  hourlyRate: document.querySelector("#hourlyRate"),
  eveningAddon: document.querySelector("#eveningAddon"),
  nightAddon: document.querySelector("#nightAddon"),
  weekendAddon: document.querySelector("#weekendAddon"),
  overtimeAddon: document.querySelector("#overtimeAddon"),
  localAddon: document.querySelector("#localAddon"),
  note: document.querySelector("#note"),
  shiftHours: document.querySelector("#shiftHours"),
  shiftPay: document.querySelector("#shiftPay"),
  shiftNetPay: document.querySelector("#shiftNetPay"),
  saveStatus: document.querySelector("#saveStatus"),
  savedShiftCount: document.querySelector("#savedShiftCount"),
  savedGrossText: document.querySelector("#savedGrossText"),
  savedNetText: document.querySelector("#savedNetText"),
  savedShiftList: document.querySelector("#savedShiftList"),
  refreshTotalsButton: document.querySelector("#refreshTotalsButton"),
  debugLine: document.querySelector("#debugLine"),
  payFromDate: document.querySelector("#payFromDate"),
  payToDate: document.querySelector("#payToDate"),
  createPaySlipButton: document.querySelector("#createPaySlipButton"),
  importPaySlipButton: document.querySelector("#importPaySlipButton"),
  paySlipFileInput: document.querySelector("#paySlipFileInput"),
  payrollStatus: document.querySelector("#payrollStatus"),
  paySlipList: document.querySelector("#paySlipList"),
  languageSelect: document.querySelector("#languageSelect"),
  settingsToggle: document.querySelector("#settingsToggle"),
  settingsPanel: document.querySelector("#settingsPanel"),
  settingsClose: document.querySelector("#settingsClose"),
  currencySelect: document.querySelector("#currencySelect"),
  soundEnabled: document.querySelector("#soundEnabled"),
  vibrationEnabled: document.querySelector("#vibrationEnabled"),
  testSoundButton: document.querySelector("#testSoundButton"),
  testVibrationButton: document.querySelector("#testVibrationButton"),
  themeToggle: document.querySelector("#themeToggle"),
  adminPanel: document.querySelector("#adminPanel"),
  adminClose: document.querySelector("#adminClose"),
  dayType: document.querySelector("#dayType"),
  customAddonsContainer: document.querySelector("#customAddonsContainer"),
  customAddonsList: document.querySelector("#customAddonsList"),
  customDeductionsList: document.querySelector("#customDeductionsList"),
  newAddonName: document.querySelector("#newAddonName"),
  newAddonValue: document.querySelector("#newAddonValue"),
  newAddonType: document.querySelector("#newAddonType"),
  addAddonButton: document.querySelector("#addAddonButton"),
  newDeductionName: document.querySelector("#newDeductionName"),
  newDeductionValue: document.querySelector("#newDeductionValue"),
  newDeductionType: document.querySelector("#newDeductionType"),
  addDeductionButton: document.querySelector("#addDeductionButton"),
  defaultRate: document.querySelector("#defaultRate"),
  sickRate: document.querySelector("#sickRate"),
  holidayPercent: document.querySelector("#holidayPercent"),
  amPercent: document.querySelector("#amPercent"),
  taxPercent: document.querySelector("#taxPercent"),
  fixedDeduction: document.querySelector("#fixedDeduction"),
  payMode: document.querySelector("#payMode"),
  dailyRate: document.querySelector("#dailyRate"),
  sickDailyRate: document.querySelector("#sickDailyRate"),
  taxFreeAllowance: document.querySelector("#taxFreeAllowance"),
  atpContribution: document.querySelector("#atpContribution"),
  employeePensionPercent: document.querySelector("#employeePensionPercent"),
  employerPensionPercent: document.querySelector("#employerPensionPercent"),
  personnelFee: document.querySelector("#personnelFee"),
  eveningRate: document.querySelector("#eveningRate"),
  nightRate: document.querySelector("#nightRate"),
  weekendRate: document.querySelector("#weekendRate"),
  overtimePercent: document.querySelector("#overtimePercent"),
  localRate: document.querySelector("#localRate"),
  meetingAddonRate: document.querySelector("#meetingAddonRate"),
  qualificationAddonRate: document.querySelector("#qualificationAddonRate"),
  stabilityAddonRate: document.querySelector("#stabilityAddonRate"),
  payPdfImportButton: document.querySelector("#payPdfImportButton"),
  payPdfFileInput: document.querySelector("#payPdfFileInput"),
  payPdfStatus: document.querySelector("#payPdfStatus")
};

const translations = {
  ru: {
    appKicker: "Учёт смен и зарплатных листов",
    appTitle: "Mit Arbejde",
    language: "Язык",
    currency: "Валюта",
    close: "Закрыть",
    installSection: "Установка и доступ",
    installAndroid: "Установить на Android",
    androidInstallHint: "На Android кнопка откроет установку, если браузер поддерживает PWA.",
    androidInstallUnavailable: "Если окно установки не открылось, откройте меню браузера и выберите «Установить приложение» или «Добавить на главный экран».",
    iphoneInstallTitle: "Инструкция для iPhone",
    iphoneStep1: "Откройте сайт в Safari.",
    iphoneStep2: "Нажмите кнопку «Поделиться».",
    iphoneStep3: "Выберите «На экран Домой».",
    iphoneStep4: "Нажмите «Добавить».",
    soundVibration: "Звук и вибрация",
    sound: "Звук",
    vibration: "Вибрация",
    testSound: "Проверить звук",
    testVibration: "Проверить вибрацию",
    appearance: "Внешний вид",
    salaryTax: "Зарплата и налог",
    payMode: "Løntype",
    hourlyPayMode: "Timeløn",
    dailyPayMode: "Dagløn",
    dailyRate: "Dagløn",
    sickDailyRate: "Sygeløn pr. dag",
    taxFreeAllowance: "Anvendt skattefradrag",
    atpContribution: "ATP-bidrag, A-ordning",
    employeePensionPercent: "AM Pension, medarb., Pension DK",
    employerPensionPercent: "AM Pension, firma, Pension DK",
    personnelFee: "Personaleforening KPK",
    meetingAddonRate: "Mødetillæg",
    qualificationAddonRate: "Kvalifikationstillæg",
    stabilityAddonRate: "Stabilitetstillæg",
    importPayrollPdf: "Загрузить lønseddel PDF",
    payPdfHint: "PDF не сохраняется в приложении. Приложение попробует взять ставки и налоги из файла и записать их в эти поля.",
    payPdfReading: "Читаю PDF...",
    payPdfNoText: "Не удалось прочитать текст из PDF. Если это скан или фото, нужен OCR.",
    payPdfNoValues: "Текст прочитан, но нужные ставки и налоги не найдены. Проверьте PDF или заполните поля вручную.",
    payPdfReadDebug: "Прочитано: {chars} символов. Пример текста: {sample}",
    payPdfApplied: "Из PDF применено полей: {count}. {fields}",
    payPdfError: "Не удалось разобрать PDF. Попробуйте другой файл или заполните поля вручную.",
    theme: "Тема",
    lightTheme: "Светлая",
    darkTheme: "Тёмная",
    monthSummary: "Итоги всех сохранённых смен",
    hours: "Часы",
    gross: "Брутто",
    afterDeductions: "После удержаний",
    prevMonth: "Предыдущий месяц",
    nextMonth: "Следующий месяц",
    shift: "Смена",
    date: "Дата",
    dayType: "Тип дня",
    worked: "Работал",
    sick: "Болен",
    start: "Начало",
    end: "Конец",
    breakMinutes: "Перерыв, мин",
    hourlyRate: "Ставка, в час",
    ratePlaceholder: "например 160",
    addons: "Доплаты",
    evening: "Вечерняя",
    night: "Ночная",
    weekend: "Выходной",
    localAddon: "Lokal-/особая надбавка",
    overtime: "Сверхурочные",
    note: "Заметка",
    notePlaceholder: "место, отель, отдел, комментарий",
    saveShift: "Сохранить смену",
    savedTotals: "Сумма по сохранённым сменам",
    savedMonth: "Все сохранённые смены",
    savedCount: "Сохранено смен",
    beforeTax: "До налога",
    takeHome: "На руку",
    weekShort: "Нед.",
    settings: "Настройки",
    defaultRate: "Timeløn",
    sickRate: "Sygeløn",
    fixedDeduction: "Øvrige faste fradrag",
    eveningRate: "Aftentillæg",
    nightRate: "Nattillæg",
    weekendRate: "Weekend-/helligdagstillæg",
    localRate: "Lokaltillæg",
    overtimeRate: "Overtid 100%",
    taxHint: "Датские налоги зависят от налоговой карты, fradrag, коммуны, пенсии и договора. Здесь расчёт примерный: брутто -> AM-bidrag -> A-skat.",
    noShift: "Нет смены",
    deleteShift: "Удалить смену",
    saved: "Смена сохранена",
    draft: "Черновик, ещё не сохранено",
    changed: "Есть изменения, нажмите сохранить",
    weekdays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    hourShort: "ч",
    workShort: "Работа",
    sickShort: "Болен",
    admin: "Админка",
    exitAdmin: "Выйти",
    adminKicker: "Админка",
    adminTitle: "Админка расчёта",
    customAddonsTitle: "Свои доплаты",
    customDeductionsTitle: "Свои удержания",
    name: "Название",
    value: "Значение",
    type: "Тип",
    namePlaceholder: "например Hotel bonus",
    deductionPlaceholder: "например Pension",
    hourlyAddon: "за час",
    percentAddon: "% от ставки",
    fixedDeductionType: "за месяц",
    percentDeductionType: "% от брутто",
    addAddon: "Добавить доплату",
    addDeduction: "Добавить удержание",
    remove: "Удалить",
    noCustomAddons: "Доплат пока нет",
    noCustomDeductions: "Удержаний пока нет",
    install: "Установить",
    feriepenge: "Feriepenge",
    feriepengeRate: "Feriepenge, %",
    payrollKicker: "Lønseddel",
    payrollTitle: "Зарплатный лист",
    fromDate: "С даты",
    toDate: "По дату",
    createPaySlip: "Создать зарплатный лист",
    payrollHint: "Выберите период, когда получили зарплату. Смены из периода перейдут в историю.",
    noPaySlips: "История зарплатных листов пока пустая",
    paySlipCreated: "Зарплатный лист создан, смены перенесены в историю",
    noShiftsInRange: "В этом периоде нет сохранённых смен",
    paidOn: "Создан",
    shiftsCount: "Смен",
    history: "История"
    ,
    noSavedShifts: "Сохранённых смен пока нет",
    period: "Период",
    project: "Проект",
    refreshTotals: "Обновить итоги",
    debugInfo: "Память",
    savedPersistenceHint: "Смены сохраняются после закрытия и остаются здесь, пока вы не удалите их или не создадите зарплатный лист.",
    saveAs: "Сохранить как",
    loadPaySlip: "Загрузить",
    paySlipLoaded: "Зарплатный лист загружен в историю",
    paySlipLoadError: "Не удалось загрузить файл",
    aboutApp: "О приложении",
    appNameLabel: "Название",
    versionLabel: "Версия",
    developerLabel: "Разработчик"
  },
  en: {
    appKicker: "Work and payslip tracker",
    appTitle: "Mit Arbejde",
    language: "Language",
    currency: "Currency",
    close: "Close",
    installSection: "Install and access",
    installAndroid: "Install on Android",
    androidInstallHint: "On Android the button opens installation when the browser supports PWA.",
    androidInstallUnavailable: "If the install window does not open, use the browser menu and choose Install app or Add to Home screen.",
    iphoneInstallTitle: "iPhone instructions",
    iphoneStep1: "Open the site in Safari.",
    iphoneStep2: "Tap the Share button.",
    iphoneStep3: "Choose Add to Home Screen.",
    iphoneStep4: "Tap Add.",
    soundVibration: "Sound and vibration",
    sound: "Sound",
    vibration: "Vibration",
    testSound: "Test sound",
    testVibration: "Test vibration",
    appearance: "Appearance",
    salaryTax: "Pay and tax",
    payMode: "Løntype",
    hourlyPayMode: "Timeløn",
    dailyPayMode: "Dagløn",
    dailyRate: "Dagløn",
    sickDailyRate: "Sygeløn pr. dag",
    taxFreeAllowance: "Anvendt skattefradrag",
    atpContribution: "ATP-bidrag, A-ordning",
    employeePensionPercent: "AM Pension, medarb., Pension DK",
    employerPensionPercent: "AM Pension, firma, Pension DK",
    personnelFee: "Personaleforening KPK",
    meetingAddonRate: "Mødetillæg",
    qualificationAddonRate: "Qualification add-on",
    stabilityAddonRate: "Stability add-on",
    importPayrollPdf: "Load lønseddel PDF",
    payPdfHint: "The PDF is not stored in the app. The app will try to read rates and tax values and write them into these fields.",
    payPdfReading: "Reading PDF...",
    payPdfNoText: "Could not read text from the PDF. If it is a scan or photo, OCR is needed.",
    payPdfNoValues: "Text was read, but no useful rates or tax values were found. Check the PDF or fill the fields manually.",
    payPdfReadDebug: "Read: {chars} characters. Text sample: {sample}",
    payPdfApplied: "Applied fields from PDF: {count}. {fields}",
    payPdfError: "Could not parse the PDF. Try another file or fill the fields manually.",
    theme: "Theme",
    lightTheme: "Light",
    darkTheme: "Dark",
    monthSummary: "Summary for all saved shifts",
    hours: "Hours",
    gross: "Gross",
    afterDeductions: "After deductions",
    prevMonth: "Previous month",
    nextMonth: "Next month",
    shift: "Shift",
    date: "Date",
    dayType: "Day type",
    worked: "Worked",
    sick: "Sick",
    start: "Start",
    end: "End",
    breakMinutes: "Break, min",
    hourlyRate: "Rate per hour",
    ratePlaceholder: "for example 160",
    addons: "Add-ons",
    evening: "Evening",
    night: "Night",
    weekend: "Weekend",
    localAddon: "Local/special add-on",
    overtime: "Overtime",
    note: "Note",
    notePlaceholder: "place, hotel, department, comment",
    saveShift: "Save shift",
    savedTotals: "Total for saved shifts",
    savedMonth: "All saved shifts",
    savedCount: "Saved shifts",
    beforeTax: "Before tax",
    takeHome: "Take-home",
    weekShort: "Week",
    settings: "Settings",
    defaultRate: "Timeløn",
    sickRate: "Sygeløn",
    fixedDeduction: "Øvrige faste fradrag",
    eveningRate: "Aftentillæg",
    nightRate: "Nattillæg",
    weekendRate: "Weekend-/helligdagstillæg",
    localRate: "Lokaltillæg",
    overtimeRate: "Overtid 100%",
    taxHint: "Danish tax depends on your tax card, fradrag, municipality, pension and agreement. This is an estimate: gross -> AM-bidrag -> A-skat.",
    noShift: "No shift",
    deleteShift: "Delete shift",
    saved: "Shift saved",
    draft: "Draft, not saved yet",
    changed: "Changed, press save",
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    hourShort: "h",
    workShort: "Work",
    sickShort: "Sick",
    admin: "Admin",
    exitAdmin: "Exit",
    adminKicker: "Admin",
    adminTitle: "Calculation admin",
    customAddonsTitle: "Custom add-ons",
    customDeductionsTitle: "Custom deductions",
    name: "Name",
    value: "Value",
    type: "Type",
    namePlaceholder: "for example Hotel bonus",
    deductionPlaceholder: "for example Pension",
    hourlyAddon: "per hour",
    percentAddon: "% of rate",
    fixedDeductionType: "per month",
    percentDeductionType: "% of gross",
    addAddon: "Add add-on",
    addDeduction: "Add deduction",
    remove: "Remove",
    noCustomAddons: "No add-ons yet",
    noCustomDeductions: "No deductions yet",
    install: "Install",
    feriepenge: "Holiday pay",
    feriepengeRate: "Holiday pay, %",
    payrollKicker: "Payslip",
    payrollTitle: "Payslip",
    fromDate: "From",
    toDate: "To",
    createPaySlip: "Create payslip",
    payrollHint: "Choose the period you were paid for. Shifts in the period move to history.",
    noPaySlips: "Payslip history is empty",
    paySlipCreated: "Payslip created, shifts moved to history",
    noShiftsInRange: "No saved shifts in this period",
    paidOn: "Created",
    shiftsCount: "Shifts",
    history: "History"
    ,
    noSavedShifts: "No saved shifts yet",
    period: "Period",
    project: "Project",
    refreshTotals: "Refresh totals",
    debugInfo: "Storage",
    savedPersistenceHint: "Shifts stay saved after closing and remain here until you delete them or create a payslip.",
    saveAs: "Save as",
    loadPaySlip: "Load",
    paySlipLoaded: "Payslip loaded into history",
    paySlipLoadError: "Could not load file",
    aboutApp: "About app",
    appNameLabel: "Name",
    versionLabel: "Version",
    developerLabel: "Developer"
  },
  da: {
    appKicker: "Arbejdstid og lønseddel",
    appTitle: "Mit Arbejde",
    language: "Sprog",
    currency: "Valuta",
    close: "Luk",
    installSection: "Installation og adgang",
    installAndroid: "Installer på Android",
    androidInstallHint: "På Android åbner knappen installationen, hvis browseren understøtter PWA.",
    androidInstallUnavailable: "Hvis installationsvinduet ikke åbner, brug browsermenuen og vælg Installer app eller Føj til startskærm.",
    iphoneInstallTitle: "iPhone-vejledning",
    iphoneStep1: "Åbn siden i Safari.",
    iphoneStep2: "Tryk på Del-knappen.",
    iphoneStep3: "Vælg Føj til hjemmeskærm.",
    iphoneStep4: "Tryk på Tilføj.",
    soundVibration: "Lyd og vibration",
    sound: "Lyd",
    vibration: "Vibration",
    testSound: "Test lyd",
    testVibration: "Test vibration",
    appearance: "Udseende",
    salaryTax: "Løn og skat",
    payMode: "Løntype",
    hourlyPayMode: "Timeløn",
    dailyPayMode: "Dagløn",
    dailyRate: "Dagløn",
    sickDailyRate: "Sygeløn pr. dag",
    taxFreeAllowance: "Anvendt skattefradrag",
    atpContribution: "ATP-bidrag, A-ordning",
    employeePensionPercent: "AM Pension, medarb., Pension DK",
    employerPensionPercent: "AM Pension, firma, Pension DK",
    personnelFee: "Personaleforening KPK",
    meetingAddonRate: "Mødetillæg",
    qualificationAddonRate: "Kvalifikationstillæg",
    stabilityAddonRate: "Stabilitetstillæg",
    importPayrollPdf: "Indlæs lønseddel PDF",
    payPdfHint: "PDF'en gemmes ikke i appen. Appen forsøger at hente satser og skatteværdier og skrive dem i disse felter.",
    payPdfReading: "Læser PDF...",
    payPdfNoText: "Kunne ikke læse tekst fra PDF'en. Hvis den er en scanning eller et foto, kræves OCR.",
    payPdfNoValues: "Teksten blev læst, men der blev ikke fundet brugbare satser eller skatteværdier. Tjek PDF'en eller udfyld felterne manuelt.",
    payPdfReadDebug: "Læst: {chars} tegn. Teksteksempel: {sample}",
    payPdfApplied: "Anvendte felter fra PDF: {count}. {fields}",
    payPdfError: "Kunne ikke analysere PDF'en. Prøv en anden fil eller udfyld felterne manuelt.",
    theme: "Tema",
    lightTheme: "Lys",
    darkTheme: "Mørk",
    monthSummary: "Oversigt for alle gemte vagter",
    hours: "Timer",
    gross: "Brutto",
    afterDeductions: "Efter fradrag",
    prevMonth: "Forrige måned",
    nextMonth: "Næste måned",
    shift: "Vagt",
    date: "Dato",
    dayType: "Dagstype",
    worked: "Arbejde",
    sick: "Syg",
    start: "Start",
    end: "Slut",
    breakMinutes: "Pause, min",
    hourlyRate: "Sats pr. time",
    ratePlaceholder: "for eksempel 160",
    addons: "Tillæg",
    evening: "Aften",
    night: "Nat",
    weekend: "Weekend",
    localAddon: "Lokalt/særligt tillæg",
    overtime: "Overarbejde",
    note: "Note",
    notePlaceholder: "sted, hotel, afdeling, kommentar",
    saveShift: "Gem vagt",
    savedTotals: "Total for gemte vagter",
    savedMonth: "Alle gemte vagter",
    savedCount: "Gemte vagter",
    beforeTax: "Før skat",
    takeHome: "Udbetalt",
    weekShort: "Uge",
    settings: "Indstillinger",
    defaultRate: "Timeløn",
    sickRate: "Sygeløn",
    fixedDeduction: "Øvrige faste fradrag",
    eveningRate: "Aftentillæg",
    nightRate: "Nattillæg",
    weekendRate: "Weekend-/helligdagstillæg",
    localRate: "Lokaltillæg",
    overtimeRate: "Overtid 100%",
    taxHint: "Dansk skat afhænger af skattekort, fradrag, kommune, pension og aftale. Dette er et estimat: brutto -> AM-bidrag -> A-skat.",
    noShift: "Ingen vagt",
    deleteShift: "Slet vagt",
    saved: "Vagt gemt",
    draft: "Kladde, ikke gemt endnu",
    changed: "Ændret, tryk gem",
    weekdays: ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"],
    hourShort: "t",
    workShort: "Arbejde",
    sickShort: "Syg",
    admin: "Admin",
    exitAdmin: "Luk",
    adminKicker: "Admin",
    adminTitle: "Beregningsadmin",
    customAddonsTitle: "Egne tillæg",
    customDeductionsTitle: "Egne fradrag",
    name: "Navn",
    value: "Værdi",
    type: "Type",
    namePlaceholder: "fx Hotel bonus",
    deductionPlaceholder: "fx Pension",
    hourlyAddon: "pr. time",
    percentAddon: "% af sats",
    fixedDeductionType: "pr. måned",
    percentDeductionType: "% af brutto",
    addAddon: "Tilføj tillæg",
    addDeduction: "Tilføj fradrag",
    remove: "Slet",
    noCustomAddons: "Ingen tillæg endnu",
    noCustomDeductions: "Ingen fradrag endnu",
    install: "Installer",
    feriepenge: "Feriepenge",
    feriepengeRate: "Feriepenge, %",
    payrollKicker: "Lønseddel",
    payrollTitle: "Lønseddel",
    fromDate: "Fra dato",
    toDate: "Til dato",
    createPaySlip: "Opret lønseddel",
    payrollHint: "Vælg perioden du har fået løn for. Vagterne flyttes til historik.",
    noPaySlips: "Lønseddel-historikken er tom",
    paySlipCreated: "Lønseddel oprettet, vagter flyttet til historik",
    noShiftsInRange: "Ingen gemte vagter i perioden",
    paidOn: "Oprettet",
    shiftsCount: "Vagter",
    history: "Historik"
    ,
    noSavedShifts: "Ingen gemte vagter endnu",
    period: "Periode",
    project: "Projekt",
    refreshTotals: "Opdater totaler",
    debugInfo: "Lager",
    savedPersistenceHint: "Vagter gemmes efter lukning og bliver her, indtil du sletter dem eller opretter en lønseddel.",
    saveAs: "Gem som",
    loadPaySlip: "Indlæs",
    paySlipLoaded: "Lønseddel indlæst i historik",
    paySlipLoadError: "Kunne ikke indlæse fil",
    aboutApp: "Om appen",
    appNameLabel: "Navn",
    versionLabel: "Version",
    developerLabel: "Udvikler"
  }
};

translations.ka = {
  ...translations.en,
  appKicker: "სამუშაო დრო და ხელფასის ფურცელი",
  appTitle: "Mit Arbejde",
  language: "ენა",
  currency: "ვალუტა",
  close: "დახურვა",
  installSection: "დაყენება და წვდომა",
  installAndroid: "Android-ზე დაყენება",
  androidInstallHint: "Android-ზე ღილაკი გახსნის დაყენებას, თუ ბრაუზერი PWA-ს მხარდაჭერას იძლევა.",
  androidInstallUnavailable: "თუ დაყენების ფანჯარა არ გაიხსნა, გახსენით ბრაუზერის მენიუ და აირჩიეთ Install app ან Add to Home screen.",
  iphoneInstallTitle: "ინსტრუქცია iPhone-ისთვის",
  iphoneStep1: "გახსენით საიტი Safari-ში.",
  iphoneStep2: "დააჭირეთ Share ღილაკს.",
  iphoneStep3: "აირჩიეთ Add to Home Screen.",
  iphoneStep4: "დააჭირეთ Add-ს.",
  soundVibration: "ხმა და ვიბრაცია",
  sound: "ხმა",
  vibration: "ვიბრაცია",
  testSound: "ხმის შემოწმება",
  testVibration: "ვიბრაციის შემოწმება",
  appearance: "გარეგნობა",
  salaryTax: "ხელფასი და გადასახადი",
  payMode: "Løntype",
  hourlyPayMode: "Timeløn",
  dailyPayMode: "Dagløn",
  dailyRate: "Dagløn",
  sickDailyRate: "Sygeløn pr. dag",
  taxFreeAllowance: "Anvendt skattefradrag",
  atpContribution: "ATP-bidrag, A-ordning",
  employeePensionPercent: "AM Pension, medarb., Pension DK",
  employerPensionPercent: "AM Pension, firma, Pension DK",
  personnelFee: "Personaleforening KPK",
  meetingAddonRate: "Mødetillæg",
  qualificationAddonRate: "კვალიფიკაციის დანამატი",
  stabilityAddonRate: "სტაბილურობის დანამატი",
  importPayrollPdf: "lønseddel PDF-ის ჩატვირთვა",
  payPdfHint: "PDF აპში არ ინახება. აპი სცდის ტარიფებისა და გადასახადების წაკითხვას და ამ ველებში ჩაწერას.",
  payPdfReading: "PDF იკითხება...",
  payPdfNoText: "PDF-დან ტექსტის წაკითხვა ვერ მოხერხდა. თუ ეს სკანი ან ფოტოა, საჭიროა OCR.",
  payPdfNoValues: "ტექსტი წაკითხულია, მაგრამ საჭირო ტარიფები და გადასახადები ვერ მოიძებნა. შეამოწმეთ PDF ან შეავსეთ ველები ხელით.",
  payPdfReadDebug: "წაკითხულია: {chars} სიმბოლო. ტექსტის მაგალითი: {sample}",
  payPdfApplied: "PDF-დან გამოყენებული ველები: {count}. {fields}",
  payPdfError: "PDF-ის დამუშავება ვერ მოხერხდა. სცადეთ სხვა ფაილი ან შეავსეთ ველები ხელით.",
  theme: "თემა",
  lightTheme: "ღია",
  darkTheme: "მუქი",
  monthSummary: "ყველა შენახული ცვლის შეჯამება",
  hours: "საათები",
  gross: "ბრუტო",
  afterDeductions: "დაქვითვების შემდეგ",
  prevMonth: "წინა თვე",
  nextMonth: "შემდეგი თვე",
  shift: "ცვლა",
  date: "თარიღი",
  dayType: "დღის ტიპი",
  worked: "ვიმუშავე",
  sick: "ავად",
  start: "დაწყება",
  end: "დასრულება",
  breakMinutes: "შესვენება, წთ",
  hourlyRate: "ტარიფი, საათში",
  ratePlaceholder: "მაგალითად 160",
  addons: "დანამატები",
  evening: "საღამო",
  night: "ღამე",
  weekend: "შაბათ-კვირა",
  localAddon: "ადგილობრივი/სპეციალური დანამატი",
  overtime: "ზეგანაკვეთური",
  note: "შენიშვნა",
  notePlaceholder: "ადგილი, სასტუმრო, განყოფილება, კომენტარი",
  saveShift: "ცვლის შენახვა",
  savedTotals: "შენახული ცვლების ჯამი",
  savedMonth: "ყველა შენახული ცვლა",
  savedCount: "შენახული ცვლები",
  beforeTax: "გადასახადამდე",
  takeHome: "ხელზე",
  weekShort: "კვირა",
  settings: "პარამეტრები",
  defaultRate: "Timeløn",
  sickRate: "Sygeløn",
  fixedDeduction: "Øvrige faste fradrag",
  eveningRate: "Aftentillæg",
  nightRate: "Nattillæg",
  weekendRate: "Weekend-/helligdagstillæg",
  localRate: "Lokaltillæg",
  overtimeRate: "Overtid 100%",
  taxHint: "დანიის გადასახადი დამოკიდებულია საგადასახადო ბარათზე, fradrag-ზე, კომუნაზე, პენსიაზე და ხელშეკრულებაზე. ეს არის სავარაუდო გამოთვლა: ბრუტო -> AM-bidrag -> A-skat.",
  noShift: "ცვლა არ არის",
  deleteShift: "ცვლის წაშლა",
  saved: "ცვლა შენახულია",
  draft: "შავი ვარიანტი, ჯერ არ არის შენახული",
  changed: "შეცვლილია, დააჭირეთ შენახვას",
  weekdays: ["ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ", "კვი"],
  hourShort: "სთ",
  workShort: "სამუშაო",
  sickShort: "ავად",
  admin: "ადმინი",
  exitAdmin: "გასვლა",
  adminKicker: "ადმინი",
  adminTitle: "გამოთვლის ადმინი",
  customAddonsTitle: "ჩემი დანამატები",
  customDeductionsTitle: "ჩემი დაქვითვები",
  name: "სახელი",
  value: "მნიშვნელობა",
  type: "ტიპი",
  namePlaceholder: "მაგალითად Hotel bonus",
  deductionPlaceholder: "მაგალითად Pension",
  hourlyAddon: "საათში",
  percentAddon: "% ტარიფიდან",
  fixedDeductionType: "თვეში",
  percentDeductionType: "% ბრუტოდან",
  addAddon: "დანამატის დამატება",
  addDeduction: "დაქვითვის დამატება",
  remove: "წაშლა",
  noCustomAddons: "დანამატები ჯერ არ არის",
  noCustomDeductions: "დაქვითვები ჯერ არ არის",
  install: "დაყენება",
  feriepenge: "შვებულების ფული",
  feriepengeRate: "შვებულების ფული, %",
  payrollKicker: "ხელფასის ფურცელი",
  payrollTitle: "ხელფასის ფურცელი",
  fromDate: "დან",
  toDate: "მდე",
  createPaySlip: "ხელფასის ფურცლის შექმნა",
  payrollHint: "აირჩიეთ პერიოდი, რომლისთვისაც ხელფასი მიიღეთ. ამ პერიოდის ცვლები ისტორიაში გადავა.",
  noPaySlips: "ხელფასის ფურცლების ისტორია ცარიელია",
  paySlipCreated: "ხელფასის ფურცელი შეიქმნა, ცვლები ისტორიაში გადავიდა",
  noShiftsInRange: "ამ პერიოდში შენახული ცვლები არ არის",
  paidOn: "შექმნილია",
  shiftsCount: "ცვლები",
  history: "ისტორია",
  noSavedShifts: "შენახული ცვლები ჯერ არ არის",
  period: "პერიოდი",
  project: "პროექტი",
  refreshTotals: "ჯამების განახლება",
  debugInfo: "მეხსიერება",
  savedPersistenceHint: "ცვლები დახურვის შემდეგაც ინახება და აქ დარჩება, სანამ არ წაშლით ან ხელფასის ფურცელს არ შექმნით.",
  saveAs: "შენახვა როგორც",
  loadPaySlip: "ჩატვირთვა",
  paySlipLoaded: "ხელფასის ფურცელი ისტორიაში ჩაიტვირთა",
  paySlipLoadError: "ფაილის ჩატვირთვა ვერ მოხერხდა",
  aboutApp: "აპის შესახებ",
  appNameLabel: "სახელი",
  versionLabel: "ვერსია",
  developerLabel: "დეველოპერი"
};

function tr(key) {
  const language = state.settings.language || "ru";
  return translations[language]?.[key] || translations.ru[key] || key;
}

function activeLocale() {
  return languageLocales[state.settings.language || "ru"] || locale;
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storeKey));
    const savedLanguage = localStorage.getItem(languageKey);
    return {
      settings: { ...defaults.settings, ...(saved?.settings || {}), ...(savedLanguage ? { language: savedLanguage } : {}) },
      customAddons: Array.isArray(saved?.customAddons) ? saved.customAddons : [],
      customDeductions: Array.isArray(saved?.customDeductions) ? saved.customDeductions : [],
      paySlips: Array.isArray(saved?.paySlips) ? saved.paySlips : [],
      shifts: normalizeShiftMap(saved?.shifts)
    };
  } catch {
    return structuredClone(defaults);
  }
}

function saveState() {
  localStorage.setItem(storeKey, JSON.stringify(state));
  localStorage.setItem(languageKey, state.settings.language || "ru");
}

function applyTheme() {
  const isDark = state.settings.theme === "dark";
  document.body.classList.toggle("theme-dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  document.querySelector("meta[name='theme-color']")?.setAttribute("content", isDark ? "#151c17" : "#243c2f");
}

function giveFeedback(type = "success", options = {}) {
  const shouldVibrate = options.forceVibration || (!options.soundOnly && state.settings.vibrationEnabled);
  const shouldSound = options.forceSound || (!options.vibrationOnly && state.settings.soundEnabled);

  if (shouldVibrate && navigator.vibrate) {
    navigator.vibrate(type === "delete" ? [28, 24, 28] : 32);
  }

  if (!shouldSound) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    feedbackAudioContext ||= new AudioContextClass();
    const play = () => {
      const context = feedbackAudioContext;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = type === "delete" ? 220 : 520;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.11, context.currentTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.16);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.18);
    };

    if (feedbackAudioContext.state === "suspended") {
      feedbackAudioContext.resume().then(play).catch(() => {});
    } else {
      play();
    }
  } catch {
    // Some browsers block audio until a stronger user gesture.
  }
}

function normalizeShiftMap(shifts) {
  if (Array.isArray(shifts)) {
    return shifts.reduce((map, item) => {
      if (item?.date) map[item.date] = item.shift || item;
      return map;
    }, {});
  }
  return shifts && typeof shifts === "object" ? shifts : {};
}

function syncStateFromStorage() {
  const fresh = loadState();
  Object.assign(state.settings, fresh.settings);
  state.customAddons = fresh.customAddons;
  state.customDeductions = fresh.customDeductions;
  state.paySlips = fresh.paySlips;
  state.shifts = fresh.shifts;
  if (!localStorage.getItem(migratedKey)) {
    importShiftMapsFromStorage();
    localStorage.setItem(migratedKey, "1");
    saveState();
  }
}

function importShiftMapsFromStorage() {
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      const parsed = JSON.parse(localStorage.getItem(key));
      const shifts = normalizeShiftMap(parsed?.shifts);
      Object.entries(shifts).forEach(([date, shift]) => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(date) && !state.shifts[date]) {
          state.shifts[date] = shift;
        }
      });
    }
  } catch {
    // Ignore unrelated localStorage entries.
  }
}

function toISODate(date) {
  const fixed = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return fixed.toISOString().slice(0, 10);
}

function isoWeekNumber(date) {
  const fixed = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = fixed.getUTCDay() || 7;
  fixed.setUTCDate(fixed.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(fixed.getUTCFullYear(), 0, 1));
  return Math.ceil(((fixed - yearStart) / 86400000 + 1) / 7);
}

function money(value) {
  const amount = Number.isFinite(Number(value)) ? Number(value) : 0;
  return new Intl.NumberFormat(activeLocale(), {
    style: "currency",
    currency: state.settings.currency || "DKK",
    maximumFractionDigits: 0
  }).format(amount);
}

function hoursText(hours) {
  return `${new Intl.NumberFormat(activeLocale(), { maximumFractionDigits: 2 }).format(hours || 0)} ${tr("hourShort")}`;
}

function calendarHoursText(hours) {
  return `${new Intl.NumberFormat(activeLocale(), { maximumFractionDigits: 1 }).format(hours || 0)}${tr("hourShort")}`;
}

function calendarCurrencyText() {
  return {
    DKK: "kr",
    GEL: "₾",
    USD: "$",
    EUR: "€",
    RUB: "₽"
  }[state.settings.currency || "DKK"] || state.settings.currency || "";
}

function calendarMoney(value) {
  const amount = Math.round(Number(value) || 0);
  const currency = calendarCurrencyText();
  if (Math.abs(amount) >= 1000) {
    const compact = Math.round((amount / 1000) * 10) / 10;
    return `${new Intl.NumberFormat(activeLocale(), { maximumFractionDigits: 1 }).format(compact)}k${currency}`;
  }
  return `${new Intl.NumberFormat(activeLocale(), { maximumFractionDigits: 0 }).format(amount)}${currency}`;
}

function calendarDayTypeText(shift) {
  const label = shift?.dayType === "sick" ? tr("sickShort") : tr("workShort");
  return [...label.trim()][0] || "";
}

function numberValue(id) {
  return Number.parseFloat(els[id].value) || 0;
}

function parseDanishNumber(value) {
  if (!value) return null;
  const cleaned = String(value)
    .replace(/\s/g, "")
    .replace(/[^\d,.-]/g, "");
  if (!cleaned || !/\d/.test(cleaned)) return null;
  const negative = cleaned.includes("-");
  const normalized = cleaned
    .replace(/-/g, "")
    .replace(/\.(?=\d{3}(?:[,.]|$))/g, "")
    .replace(",", ".");
  const number = Number.parseFloat(normalized);
  if (!Number.isFinite(number)) return null;
  return negative ? -number : number;
}

function formatInputNumber(value) {
  return String(Math.round(Number(value) * 100) / 100);
}

function numbersFromText(text) {
  return [...String(text).matchAll(/-?\d{1,3}(?:[.\s]\d{3})*(?:,\d+)?|-?\d+(?:[.,]\d+)?/g)]
    .map((match) => parseDanishNumber(match[0]))
    .filter((value) => Number.isFinite(value));
}

function pickHourlyRate(numbers) {
  const preferred = numbers.filter((value) => value >= 90 && value <= 260);
  if (preferred.length) return preferred[0];
  const rates = numbers.filter((value) => value >= 50 && value <= 500);
  if (rates.length >= 2) return rates[rates.length - 1];
  if (rates.length === 1) return rates[0];
  return null;
}

function pickAddonRate(numbers) {
  const rates = numbers.filter((value) => value > 0 && value <= 100);
  if (rates.length >= 2) return rates[rates.length - 1];
  return null;
}

function pickLineAmount(numbers) {
  if (!numbers.length) return null;
  const values = numbers.map((value) => Math.abs(value)).filter((value) => value > 0);
  return values.length ? values[values.length - 1] : null;
}

function pickPercent(line) {
  const percentMatch = String(line).match(/(-?\d+(?:[.,]\d+)?)\s*%/);
  if (percentMatch) return parseDanishNumber(percentMatch[1]);
  const numbers = numbersFromText(line).map((value) => Math.abs(value));
  const likely = numbers.find((value) => value > 0 && value <= 100);
  return likely ?? null;
}

function normalizePayrollLabel(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function payrollPatternMatches(line, patterns) {
  const lower = String(line || "").toLowerCase();
  const normalized = normalizePayrollLabel(line);
  return patterns.some((pattern) => pattern.test(lower) || pattern.test(normalized));
}

function findPayrollLine(lines, patterns, rejectPatterns = []) {
  return lines.find((line) => {
    return payrollPatternMatches(line, patterns) && !payrollPatternMatches(line, rejectPatterns);
  }) || "";
}

function findPayrollContext(lines, patterns, rejectPatterns = []) {
  const index = lines.findIndex((line) => payrollPatternMatches(line, patterns) && !payrollPatternMatches(line, rejectPatterns));
  if (index < 0) return "";
  return lines.slice(Math.max(0, index - 1), Math.min(lines.length, index + 4)).join(" ");
}

function setDetectedValue(target, key, value) {
  if (!Number.isFinite(value) || value < 0) return;
  target[key] = Math.round(value * 100) / 100;
}

function detectPayrollSettings(text) {
  const normalized = String(text || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\r/g, "\n");
  const lines = normalized
    .split(/\n| {3,}/)
    .map((line) => line.trim())
    .filter(Boolean);
  const detected = {};

  const hourlyLine = findPayrollContext(lines, [/timeløn/, /time.*løn/, /grundløn/, /timelon/, /timeloen/, /time.*lon/, /grundlon/, /grundloen/, /normal.*lon/], [/uden løn/, /uden.*lon/, /nettoløn/, /nettolon/]);
  setDetectedValue(detected, "defaultRate", pickHourlyRate(numbersFromText(hourlyLine)));

  const sickLine = findPayrollContext(lines, [/syg.*løn/, /syg.*lon/, /sygedagpenge/, /sick.*pay/], [/uden løn/, /uden.*lon/]);
  setDetectedValue(detected, "sickRate", pickHourlyRate(numbersFromText(sickLine)));

  const holidayLine = findPayrollLine(lines, [/feriepengeopsparing/, /feriepenge/, /holiday.*pay/], [/nettoferiepenge/, /netto.*ferie/]);
  setDetectedValue(detected, "holidayPercent", pickPercent(holidayLine));

  const amLine = findPayrollLine(lines, [/am-bidrag/, /am bidrag/, /arbejdsmarkedsbidrag/, /arbejdsmarkeds.*bidrag/]);
  setDetectedValue(detected, "amPercent", pickPercent(amLine));

  const taxLine = findPayrollLine(lines, [/a-skat/, /a skat/, /trækprocent/, /traekprocent/, /traekprocent/, /træk%/, /traek%/, /skattekort.*procent/]);
  const rawTax = pickPercent(taxLine);
  setDetectedValue(detected, "taxPercent", rawTax && rawTax <= 1 ? rawTax * 100 : rawTax);

  const allowanceLine = findPayrollLine(lines, [/skattefradrag/, /anvendt.*fradrag/, /fradrag/, /tax.*allowance/], [/feriefradrag/, /ferie.*fradrag/]);
  const allowanceNumbers = numbersFromText(allowanceLine).map((value) => Math.abs(value));
  const allowance = allowanceNumbers.filter((value) => value >= 100).sort((a, b) => b - a)[0];
  setDetectedValue(detected, "taxFreeAllowance", allowance);

  const atpLine = findPayrollLine(lines, [/atp-bidrag/, /\batp\b/]);
  setDetectedValue(detected, "atpContribution", pickLineAmount(numbersFromText(atpLine)));

  const employeePensionLine = findPayrollLine(lines, [/medarb.*pension/, /egen andel/, /medarbejder.*pension/, /employee.*pension/]);
  setDetectedValue(detected, "employeePensionPercent", pickPercent(employeePensionLine));

  const employerPensionLine = findPayrollLine(lines, [/firma.*pension/, /arbejdsgiver.*pension/, /firmapension/, /employer.*pension/]);
  setDetectedValue(detected, "employerPensionPercent", pickPercent(employerPensionLine));

  const personnelLine = findPayrollLine(lines, [/personaleforening/, /personale.*fradrag/, /personale.*udlæg/, /personale.*udlaeg/, /staff.*deduction/]);
  setDetectedValue(detected, "personnelFee", pickLineAmount(numbersFromText(personnelLine)));

  const localLine = findPayrollLine(lines, [/lokaltillæg/, /lokaltillaeg/, /lokal.*tillæg/, /lokal.*tillaeg/, /local.*add/]);
  setDetectedValue(detected, "localRate", pickAddonRate(numbersFromText(localLine)));

  const meetingLine = findPayrollLine(lines, [/mødetillæg/, /moedetillæg/, /mødetillaeg/, /moedetillaeg/, /møde.*tillæg/, /moede.*tillaeg/, /modetillaeg/, /mode.*tillaeg/, /fremmode.*tillaeg/, /attendance.*add/]);
  setDetectedValue(detected, "meetingAddonRate", pickAddonRate(numbersFromText(meetingLine)));

  const qualificationLine = findPayrollLine(lines, [/kvalifikationstillæg/, /kvalifikationstillaeg/, /kval.*tillæg/, /kval.*tillaeg/, /qualification.*add/]);
  setDetectedValue(detected, "qualificationAddonRate", pickAddonRate(numbersFromText(qualificationLine)));

  const stabilityLine = findPayrollLine(lines, [/stabilitetstillæg/, /stabilitetstillaeg/, /stabil.*tillæg/, /stabil.*tillaeg/, /stability.*add/]);
  setDetectedValue(detected, "stabilityAddonRate", pickAddonRate(numbersFromText(stabilityLine)));

  return detected;
}

function settingLabel(key) {
  const labels = {
    defaultRate: "defaultRate",
    sickRate: "sickRate",
    holidayPercent: "feriepengeRate",
    taxFreeAllowance: "taxFreeAllowance",
    amPercent: "AM-bidrag",
    taxPercent: "A-skat",
    atpContribution: "atpContribution",
    employeePensionPercent: "employeePensionPercent",
    employerPensionPercent: "employerPensionPercent",
    personnelFee: "personnelFee",
    localRate: "localRate",
    meetingAddonRate: "meetingAddonRate",
    qualificationAddonRate: "qualificationAddonRate",
    stabilityAddonRate: "stabilityAddonRate"
  };
  return translations[state.settings.language || "ru"]?.[labels[key]] || labels[key] || key;
}

function applyPayrollSettings(detected) {
  const applied = [];
  const oldDefaultRate = Number(state.settings.defaultRate) || 0;
  const oldSickRate = Number(state.settings.sickRate) || 0;
  Object.entries(detected).forEach(([key, value]) => {
    if (!els[key] || !Number.isFinite(value)) return;
    els[key].value = formatInputNumber(value);
    state.settings[key] = value;
    applied.push(settingLabel(key));
  });
  if (!applied.length) return applied;
  saveState();
  renderSettings();
  if (Number.isFinite(detected.defaultRate)) {
    const currentRate = numberValue("hourlyRate");
    if (!state.shifts[selectedDate] || !currentRate || currentRate === oldDefaultRate) {
      els.hourlyRate.value = formatInputNumber(detected.defaultRate);
    }
  }
  if (Number.isFinite(detected.sickRate)) {
    const currentRate = numberValue("hourlyRate");
    if (els.dayType.value === "sick" && (!currentRate || currentRate === oldSickRate)) {
      els.hourlyRate.value = formatInputNumber(detected.sickRate);
    }
  }
  renderSummary();
  renderCalendar();
  renderShiftPreview();
  return applied;
}

function payrollTextPreview(text) {
  const lines = String(text || "")
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 2);
  return (lines.slice(0, 6).join(" | ") || "-").slice(0, 260);
}

function groupPdfTextItems(items) {
  return items.reduce((groups, item) => {
    const y = item.transform?.[5] || 0;
    const x = item.transform?.[4] || 0;
    let group = groups.find((entry) => Math.abs(entry.y - y) <= 3);
    if (!group) {
      group = { y, parts: [] };
      groups.push(group);
    }
    group.parts.push({ x, text: item.str });
    group.y = (group.y * (group.parts.length - 1) + y) / group.parts.length;
    return groups;
  }, []);
}

function bytesToBinary(bytes) {
  let result = "";
  for (let index = 0; index < bytes.length; index += 8192) {
    result += String.fromCharCode(...bytes.slice(index, index + 8192));
  }
  return result;
}

function decodePdfLiteral(value) {
  return value
    .slice(1, -1)
    .replace(/\\([nrtbf()\\])/g, (_, char) => ({ n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", "(": "(", ")": ")", "\\": "\\" }[char] || char))
    .replace(/\\(\d{1,3})/g, (_, octal) => String.fromCharCode(Number.parseInt(octal, 8)));
}

function extractPdfTextFromContent(content) {
  const parts = [];
  const literalMatches = content.match(/\((?:\\.|[^\\()])*\)/g) || [];
  literalMatches.forEach((value) => parts.push(decodePdfLiteral(value)));
  const hexMatches = content.match(/<([0-9A-Fa-f\s]{4,})>/g) || [];
  hexMatches.forEach((value) => {
    const hex = value.slice(1, -1).replace(/\s/g, "");
    let decoded = "";
    for (let index = 0; index < hex.length - 1; index += 2) {
      const code = Number.parseInt(hex.slice(index, index + 2), 16);
      if (code >= 32 && code <= 255) decoded += String.fromCharCode(code);
    }
    if (decoded.trim()) parts.push(decoded);
  });
  return parts.join(" ");
}

async function inflatePdfStream(binary) {
  if (!("DecompressionStream" in window)) return "";
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0) & 255);
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate"));
  const buffer = await new Response(stream).arrayBuffer();
  return bytesToBinary(new Uint8Array(buffer));
}

async function extractPdfTextFallback(arrayBuffer) {
  const raw = bytesToBinary(new Uint8Array(arrayBuffer));
  const parts = [extractPdfTextFromContent(raw)];
  const streamRegex = /<<(?:.|\n|\r){0,2500}?>>\s*stream\r?\n?([\s\S]*?)\r?\n?endstream/g;
  const streams = [...raw.matchAll(streamRegex)];
  for (const match of streams) {
    const full = match[0];
    const stream = match[1];
    if (/\/FlateDecode/.test(full)) {
      try {
        parts.push(extractPdfTextFromContent(await inflatePdfStream(stream)));
      } catch {
        // Some PDFs use filters this lightweight fallback cannot decompress.
      }
    } else {
      parts.push(extractPdfTextFromContent(stream));
    }
  }
  return parts.join("\n").replace(/\s{2,}/g, " ");
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}

async function extractPdfTextWithPdfJs(arrayBuffer) {
  if (!window.pdfjsLib) {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
  }
  const pdfjsLib = window.pdfjsLib;
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(
      groupPdfTextItems(content.items)
        .sort((a, b) => b.y - a.y)
        .map((line) => line.parts.sort((a, b) => a.x - b.x).map((part) => part.text).join(" "))
        .join("\n")
    );
  }
  return pages.join("\n");
}

async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  try {
    const text = await extractPdfTextWithPdfJs(arrayBuffer.slice(0));
    if (text.trim()) return text;
  } catch {
    // Fall back to a local lightweight reader when PDF.js cannot load.
  }
  return extractPdfTextFallback(arrayBuffer);
}

function toId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSettingsFromInputs() {
  return {
    language: state.settings.language || "ru",
    currency: els.currencySelect.value || "DKK",
    payMode: els.payMode.value || "hourly",
    defaultRate: numberValue("defaultRate"),
    dailyRate: numberValue("dailyRate"),
    sickRate: numberValue("sickRate"),
    sickDailyRate: numberValue("sickDailyRate"),
    holidayPercent: numberValue("holidayPercent"),
    taxFreeAllowance: numberValue("taxFreeAllowance"),
    amPercent: numberValue("amPercent"),
    taxPercent: numberValue("taxPercent"),
    fixedDeduction: numberValue("fixedDeduction"),
    atpContribution: numberValue("atpContribution"),
    employeePensionPercent: numberValue("employeePensionPercent"),
    employerPensionPercent: numberValue("employerPensionPercent"),
    personnelFee: numberValue("personnelFee"),
    eveningRate: numberValue("eveningRate"),
    nightRate: numberValue("nightRate"),
    weekendRate: numberValue("weekendRate"),
    overtimePercent: numberValue("overtimePercent"),
    localRate: numberValue("localRate"),
    meetingAddonRate: numberValue("meetingAddonRate"),
    qualificationAddonRate: numberValue("qualificationAddonRate"),
    stabilityAddonRate: numberValue("stabilityAddonRate"),
    soundEnabled: els.soundEnabled.checked,
    vibrationEnabled: els.vibrationEnabled.checked,
    theme: els.themeToggle.checked ? "dark" : "light"
  };
}

function minutesFromTime(value) {
  const [hours, minutes] = String(value || "00:00").split(":").map(Number);
  return hours * 60 + minutes;
}

function calculateShift(shift, settings = state.settings) {
  if (!shift) return { hours: 0, gross: 0 };
  const startTime = shift.startTime || shift.start || shift.fromTime || "06:00";
  const endTime = shift.endTime || shift.end || shift.toTime || "14:00";
  const start = minutesFromTime(startTime);
  let end = minutesFromTime(endTime);
  if (end <= start) end += 24 * 60;
  const breakMinutes = Number(shift.breakMinutes ?? shift.break ?? shift.pauseMinutes) || 0;
  const minutes = Math.max(0, end - start - breakMinutes);
  const hours = minutes / 60;
  const isDaily = settings.payMode === "daily";
  if (shift.dayType === "sick") {
    const sickRate = Number(shift.sickRate) || settings.sickRate || settings.defaultRate;
    const sickDaily = Number(settings.sickDailyRate) || Number(settings.dailyRate) || hours * sickRate;
    return { hours, gross: isDaily ? sickDaily : hours * sickRate };
  }
  const rate = Number(shift.hourlyRate ?? shift.rate ?? shift.wage) || settings.defaultRate;
  const baseGross = isDaily ? Number(settings.dailyRate) || hours * rate : hours * rate;
  const addonRate =
    (shift.eveningAddon ? settings.eveningRate : 0) +
    (shift.nightAddon ? settings.nightRate : 0) +
    (shift.weekendAddon ? settings.weekendRate : 0) +
    (shift.localAddon ? settings.localRate : 0) +
    Number(settings.meetingAddonRate || 0) +
    Number(settings.qualificationAddonRate || 0) +
    Number(settings.stabilityAddonRate || 0);
  const customAddonTotal = state.customAddons.reduce((sum, addon) => {
    if (!shift.customAddons?.[addon.id]) return sum;
    const value = Number(addon.value) || 0;
    return sum + (addon.type === "percent" ? rate * (value / 100) : value);
  }, 0);
  const overtime = shift.overtimeAddon ? rate * (settings.overtimePercent / 100) : 0;
  return { hours, gross: baseGross + hours * (addonRate + customAddonTotal + overtime) };
}

function calculateAllSavedShifts() {
  return calculateShiftEntries(Object.entries(state.shifts));
}

function calculateShiftEntries(entries) {
  return entries.reduce(
    (total, [date, shift]) => {
      const calc = calculateShift(shift);
      total.hours += calc.hours;
      total.gross += calc.gross;
      return total;
    },
    { hours: 0, gross: 0 }
  );
}

function calculateNet(gross, settings = state.settings) {
  const customDeductions = state.customDeductions.reduce((sum, deduction) => {
    const value = Number(deduction.value) || 0;
    return sum + (deduction.type === "percent" ? gross * (value / 100) : value);
  }, 0);
  const employeePension = gross * ((Number(settings.employeePensionPercent) || 0) / 100);
  const atp = Number(settings.atpContribution) || 0;
  const personnelFee = Number(settings.personnelFee) || 0;
  const fixedDeduction = Number(settings.fixedDeduction) || 0;
  const afterFixed = Math.max(0, gross - employeePension - atp - personnelFee - fixedDeduction - customDeductions);
  const am = afterFixed * ((Number(settings.amPercent) || 0) / 100);
  const taxable = Math.max(0, afterFixed - am);
  const taxableAfterAllowance = Math.max(0, taxable - (Number(settings.taxFreeAllowance) || 0));
  const tax = taxableAfterAllowance * ((Number(settings.taxPercent) || 0) / 100);
  return Math.max(0, taxable - tax);
}

function calculatePay(gross, settings = state.settings) {
  return {
    gross,
    holiday: gross * ((Number(settings.holidayPercent) || 0) / 100),
    net: calculateNet(gross, settings)
  };
}

function renderSummary() {
  syncStateFromStorage();
  const total = calculateAllSavedShifts();
  const pay = calculatePay(total.gross);
  const count = Object.keys(state.shifts).length;
  els.totalHours.textContent = hoursText(total.hours);
  els.grossPay.textContent = money(total.gross);
  els.holidayPay.textContent = money(pay.holiday);
  els.netPay.textContent = money(pay.net);
  els.savedShiftCount.textContent = String(count);
  els.savedGrossText.textContent = money(total.gross);
  els.savedNetText.textContent = money(pay.net);
  els.debugLine.textContent = `v36 · ${tr("debugInfo")}: ${count} shifts · ${state.paySlips.length} payslips · ${money(total.gross)}`;
  renderSavedShiftList();
}

function shiftLabel(shift) {
  return shift?.dayType === "sick" ? tr("sickShort") : tr("workShort");
}

function renderSavedShiftList() {
  els.savedShiftList.replaceChildren();
  const entries = Object.entries(state.shifts).sort(([a], [b]) => a.localeCompare(b));
  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = tr("noSavedShifts");
    els.savedShiftList.append(empty);
    return;
  }

  entries.forEach(([date, shift]) => {
    const calc = calculateShift(shift);
    const note = shift?.note ? ` · ${shift.note}` : "";
    const row = document.createElement("article");
    row.className = "saved-shift-item";
    row.innerHTML = `
      <div>
        <strong>${date}</strong>
        <span>${shiftLabel(shift)} · ${(shift?.startTime || "06:00")} - ${(shift?.endTime || "14:00")}${note}</span>
      </div>
      <div>
        <span>${hoursText(calc.hours)}</span>
        <strong>${money(calc.gross)}</strong>
      </div>
    `;
    els.savedShiftList.append(row);
  });
}

function getPaySlipRange() {
  return {
    from: els.payFromDate.value || "0000-01-01",
    to: els.payToDate.value || "9999-12-31"
  };
}

function getShiftEntriesInRange(from, to) {
  return Object.entries(state.shifts).filter(([date]) => date >= from && date <= to);
}

function makePaySlip(from, to, entries) {
  const total = calculateShiftEntries(entries);
  const pay = calculatePay(total.gross);
  return {
    id: toId("payslip"),
    from,
    to,
    createdAt: new Date().toISOString(),
    count: entries.length,
    hours: total.hours,
    gross: total.gross,
    holiday: pay.holiday,
    net: pay.net,
    shifts: entries.map(([date, shift]) => ({ date, shift }))
  };
}

function normalizePaySlip(payload) {
  const slip = payload?.type === "dk-work-pay-slip" ? payload.paySlip : payload?.paySlip || payload;
  if (!slip || !slip.from || !slip.to) return null;
  return {
    id: slip.id || toId("payslip"),
    from: slip.from,
    to: slip.to,
    createdAt: slip.createdAt || new Date().toISOString(),
    count: Number(slip.count) || slip.shifts?.length || 0,
    hours: Number(slip.hours) || 0,
    gross: Number(slip.gross) || 0,
    holiday: Number(slip.holiday) || 0,
    net: Number(slip.net) || 0,
    shifts: Array.isArray(slip.shifts) ? slip.shifts : []
  };
}

function savePaySlipAsFile(slip) {
  const safeFrom = String(slip.from).replaceAll("-", "");
  const safeTo = String(slip.to).replaceAll("-", "");
  const payload = {
    type: "dk-work-pay-slip",
    version: 1,
    exportedAt: new Date().toISOString(),
    paySlip: slip
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `loenseddel-${safeFrom}-${safeTo}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderPaySlips() {
  els.paySlipList.replaceChildren();
  if (!state.paySlips.length) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = tr("noPaySlips");
    els.paySlipList.append(empty);
    return;
  }

  state.paySlips
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .forEach((slip) => {
      const created = new Date(slip.createdAt).toLocaleDateString(activeLocale());
      const row = document.createElement("article");
      row.className = "pay-slip";
      row.innerHTML = `
        <div class="pay-slip-title">
          <span>${tr("payrollKicker")} ${slip.from} - ${slip.to}</span>
          <small>${tr("paidOn")}: ${created}</small>
        </div>
        <div class="pay-slip-grid">
          <div><span>${tr("shiftsCount")}</span><strong>${slip.count}</strong></div>
          <div><span>${tr("hours")}</span><strong>${hoursText(slip.hours)}</strong></div>
          <div><span>${tr("beforeTax")}</span><strong>${money(slip.gross)}</strong></div>
          <div><span>${tr("takeHome")}</span><strong>${money(slip.net)}</strong></div>
          <div><span>${tr("feriepenge")}</span><strong>${money(slip.holiday || 0)}</strong></div>
        </div>
      `;
      const saveButton = document.createElement("button");
      saveButton.className = "text-button import-button";
      saveButton.type = "button";
      saveButton.textContent = tr("saveAs");
      saveButton.addEventListener("click", () => savePaySlipAsFile(slip));
      row.append(saveButton);
      els.paySlipList.append(row);
    });
}

function renderCustomAddons(selected = {}) {
  els.customAddonsContainer.replaceChildren();
  state.customAddons.forEach((addon) => {
    const label = document.createElement("label");
    label.className = "checkline";
    label.innerHTML = `<input type="checkbox" data-custom-addon="${addon.id}"> <span>${addon.name}</span>`;
    const input = label.querySelector("input");
    input.checked = Boolean(selected[addon.id]);
    input.addEventListener("change", () => {
      els.saveStatus.textContent = state.shifts[selectedDate] ? tr("changed") : tr("draft");
      renderShiftPreview();
    });
    els.customAddonsContainer.append(label);
  });
}

function describeType(item, kind) {
  if (kind === "addon") return item.type === "percent" ? tr("percentAddon") : tr("hourlyAddon");
  return item.type === "percent" ? tr("percentDeductionType") : tr("fixedDeductionType");
}

function renderAdminLists() {
  if (!els.customAddonsList || !els.customDeductionsList) return;
  els.customAddonsList.replaceChildren();
  if (!state.customAddons.length) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = tr("noCustomAddons");
    els.customAddonsList.append(empty);
  }
  state.customAddons.forEach((addon) => {
    const row = document.createElement("div");
    row.className = "admin-item";
    row.innerHTML = `<div><span>${addon.name}</span><br><small>${addon.value} ${describeType(addon, "addon")}</small></div>`;
    const remove = document.createElement("button");
    remove.className = "text-button danger";
    remove.type = "button";
    remove.textContent = tr("remove");
    remove.addEventListener("click", () => removeCustomAddon(addon.id));
    row.append(remove);
    els.customAddonsList.append(row);
  });

  els.customDeductionsList.replaceChildren();
  if (!state.customDeductions.length) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = tr("noCustomDeductions");
    els.customDeductionsList.append(empty);
  }
  state.customDeductions.forEach((deduction) => {
    const row = document.createElement("div");
    row.className = "admin-item";
    row.innerHTML = `<div><span>${deduction.name}</span><br><small>${deduction.value} ${describeType(deduction, "deduction")}</small></div>`;
    const remove = document.createElement("button");
    remove.className = "text-button danger";
    remove.type = "button";
    remove.textContent = tr("remove");
    remove.addEventListener("click", () => removeCustomDeduction(deduction.id));
    row.append(remove);
    els.customDeductionsList.append(row);
  });
}

function applyLanguage() {
  const language = state.settings.language || "ru";
  document.documentElement.lang = language;
  document.title = tr("appTitle");
  els.languageSelect.value = language;
  els.currencySelect.value = state.settings.currency || "DKK";
  els.installButton.title = tr("install");
  els.installButton.setAttribute("aria-label", tr("install"));
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = tr(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = tr(node.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.title = tr(node.dataset.i18nTitle);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", tr(node.dataset.i18nAriaLabel));
  });
  document.querySelectorAll("[data-weekday]").forEach((node) => {
    node.textContent = tr("weekdays")[Number(node.dataset.weekday)];
  });
  renderAdminLists();
  renderPaySlips();
}

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const title = currentDate.toLocaleDateString(activeLocale(), { month: "long", year: "numeric" });
  els.monthTitle.textContent = title.charAt(0).toUpperCase() + title.slice(1);
  els.calendarGrid.replaceChildren();

  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);

  for (let index = 0; index < 42; index += 1) {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    const iso = toISODate(day);
    const shift = state.shifts[iso];
    const calc = calculateShift(shift);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "day-button";
    if (day.getMonth() !== month) button.classList.add("is-muted");
    if (iso === selectedDate) button.classList.add("is-selected");
    if (shift) button.classList.add("has-shift");
    if (shift?.dayType === "sick") button.classList.add("is-sick");
    const weekBadge = day.getDay() === 1 ? `<span class="week-number">W${isoWeekNumber(day)}</span>` : "";
    const dayMeta = shift
      ? `<span class="day-meta">
          <span class="day-meta-part">${calendarDayTypeText(shift)}</span>
          <span class="day-meta-part">${calendarHoursText(calc.hours)}</span>
          <span class="day-meta-part day-meta-pay">${calendarMoney(calc.gross)}</span>
        </span>`
      : "";
    button.innerHTML = `
      ${weekBadge}
      <span class="day-number">${day.getDate()}</span>
      ${dayMeta}
    `;
    button.addEventListener("click", () => selectDate(iso));
    els.calendarGrid.append(button);
  }
}

function getFormShift() {
  const customAddons = {};
  els.customAddonsContainer.querySelectorAll("[data-custom-addon]").forEach((input) => {
    customAddons[input.dataset.customAddon] = input.checked;
  });
  return {
    dayType: els.dayType.value,
    startTime: els.startTime.value,
    endTime: els.endTime.value,
    breakMinutes: numberValue("breakMinutes"),
    hourlyRate: numberValue("hourlyRate") || state.settings.defaultRate,
    sickRate: numberValue("hourlyRate") || state.settings.sickRate || state.settings.defaultRate,
    eveningAddon: els.eveningAddon.checked,
    nightAddon: els.nightAddon.checked,
    weekendAddon: els.weekendAddon.checked,
    overtimeAddon: els.overtimeAddon.checked,
    localAddon: els.localAddon.checked,
    customAddons,
    note: els.note.value.trim()
  };
}

function renderShiftPreview() {
  const settings = getSettingsFromInputs();
  const calc = calculateShift(getFormShift(), settings);
  const pay = calculatePay(calc.gross, settings);
  els.shiftHours.textContent = hoursText(calc.hours);
  els.shiftPay.textContent = money(calc.gross);
  els.shiftNetPay.textContent = money(pay.net);
}

function selectDate(iso) {
  selectedDate = iso;
  const selected = new Date(`${iso}T12:00:00`);
  currentDate = new Date(selected.getFullYear(), selected.getMonth(), 1);
  const hasSavedShift = Boolean(state.shifts[iso]);
  const shift = state.shifts[iso] || {};
  els.shiftDate.value = iso;
  els.selectedDateTitle.textContent = selected.toLocaleDateString(activeLocale(), {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
  els.dayType.value = shift.dayType || "work";
  els.startTime.value = shift.startTime || "06:00";
  els.endTime.value = shift.endTime || "14:00";
  els.breakMinutes.value = shift.breakMinutes ?? 0;
  els.hourlyRate.value =
    shift.dayType === "sick"
      ? shift.sickRate || state.settings.sickRate || state.settings.defaultRate || ""
      : shift.hourlyRate || state.settings.defaultRate || "";
  els.eveningAddon.checked = Boolean(shift.eveningAddon);
  els.nightAddon.checked = Boolean(shift.nightAddon);
  els.weekendAddon.checked = Boolean(shift.weekendAddon);
  els.overtimeAddon.checked = Boolean(shift.overtimeAddon);
  els.localAddon.checked = Boolean(shift.localAddon);
  renderCustomAddons(shift.customAddons || {});
  els.note.value = shift.note || "";
  els.deleteShift.disabled = !hasSavedShift;
  els.deleteShift.textContent = hasSavedShift ? tr("deleteShift") : tr("noShift");
  els.saveStatus.textContent = hasSavedShift ? tr("saved") : tr("draft");
  renderShiftPreview();
  renderCalendar();
}

function renderSettings() {
  Object.entries(state.settings).forEach(([key, value]) => {
    if (!els[key]) return;
    if (els[key].type === "checkbox") {
      els[key].checked = Boolean(value);
    } else {
      els[key].value = value;
    }
  });
  els.themeToggle.checked = state.settings.theme === "dark";
  applyTheme();
}

function setDefaultPayRange() {
  const savedDates = Object.keys(state.shifts).sort();
  if (!els.payFromDate.value) els.payFromDate.value = savedDates[0] || toISODate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  if (!els.payToDate.value) els.payToDate.value = savedDates[savedDates.length - 1] || toISODate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
}

function renderAll() {
  if (els.adminPanel) els.adminPanel.hidden = true;
  applyLanguage();
  applyTheme();
  renderSettings();
  setDefaultPayRange();
  selectDate(selectedDate);
  renderSummary();
  renderAdminLists();
  renderPaySlips();
}

els.prevMonth.addEventListener("click", () => {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  renderCalendar();
  renderSummary();
});

els.nextMonth.addEventListener("click", () => {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  renderCalendar();
  renderSummary();
});

els.shiftDate.addEventListener("change", () => selectDate(els.shiftDate.value));

els.shiftForm.addEventListener("input", (event) => {
  if (event.target.closest(".settings-panel")) return;
  els.saveStatus.textContent = state.shifts[selectedDate] ? tr("changed") : tr("draft");
  renderShiftPreview();
});

els.shiftForm.addEventListener("submit", (event) => {
  event.preventDefault();
  selectedDate = els.shiftDate.value;
  state.shifts[selectedDate] = getFormShift();
  saveState();
  giveFeedback("success");
  if (!els.payFromDate.value || selectedDate < els.payFromDate.value) els.payFromDate.value = selectedDate;
  if (!els.payToDate.value || selectedDate > els.payToDate.value) els.payToDate.value = selectedDate;
  selectDate(selectedDate);
  renderSummary();
});

els.deleteShift.addEventListener("click", () => {
  if (!state.shifts[selectedDate]) return;
  delete state.shifts[selectedDate];
  saveState();
  giveFeedback("delete");
  selectDate(selectedDate);
  renderSummary();
});

document.querySelector(".settings-panel").addEventListener("input", () => {
  state.settings = getSettingsFromInputs();
  saveState();
  applyTheme();
  renderSummary();
  renderCalendar();
  renderShiftPreview();
});

els.languageSelect.addEventListener("change", () => {
  state.settings.language = els.languageSelect.value;
  localStorage.setItem(languageKey, state.settings.language);
  saveState();
  applyTheme();
  renderAll();
});

els.currencySelect.addEventListener("change", () => {
  state.settings.currency = els.currencySelect.value || "DKK";
  saveState();
  renderSummary();
  renderCalendar();
  renderPaySlips();
  renderShiftPreview();
});

els.createPaySlipButton.addEventListener("click", () => {
  syncStateFromStorage();
  const { from, to } = getPaySlipRange();
  const entries = getShiftEntriesInRange(from, to);
  if (!entries.length) {
    els.payrollStatus.textContent = tr("noShiftsInRange");
    return;
  }

  const slip = makePaySlip(from, to, entries);
  state.paySlips.push(slip);
  entries.forEach(([date]) => {
    delete state.shifts[date];
  });
  saveState();
  giveFeedback("success");
  els.payrollStatus.textContent = tr("paySlipCreated");
  els.payFromDate.value = "";
  els.payToDate.value = "";
  setDefaultPayRange();
  selectDate(selectedDate);
  renderSummary();
  renderPaySlips();
});

els.importPaySlipButton.addEventListener("click", () => {
  els.paySlipFileInput.click();
});

els.paySlipFileInput.addEventListener("change", async () => {
  const file = els.paySlipFileInput.files?.[0];
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    const slip = normalizePaySlip(payload);
    if (!slip) throw new Error("Invalid payslip");
    const existingIndex = state.paySlips.findIndex((item) => item.id === slip.id);
    if (existingIndex >= 0) {
      state.paySlips[existingIndex] = slip;
    } else {
      state.paySlips.push(slip);
    }
    saveState();
    giveFeedback("success");
    els.payrollStatus.textContent = tr("paySlipLoaded");
    renderPaySlips();
  } catch {
    els.payrollStatus.textContent = tr("paySlipLoadError");
  } finally {
    els.paySlipFileInput.value = "";
  }
});

els.payPdfImportButton?.addEventListener("click", () => {
  els.payPdfFileInput.click();
});

els.payPdfFileInput?.addEventListener("change", async () => {
  const file = els.payPdfFileInput.files?.[0];
  if (!file) return;
  els.payPdfStatus.textContent = tr("payPdfReading");
  try {
    const text = await extractPdfText(file);
    if (!text.trim()) {
      els.payPdfStatus.textContent = tr("payPdfNoText");
      return;
    }
    const detected = detectPayrollSettings(text);
    const applied = applyPayrollSettings(detected);
    giveFeedback(applied.length ? "success" : "delete");
    els.payPdfStatus.textContent = applied.length
      ? tr("payPdfApplied").replace("{count}", String(applied.length)).replace("{fields}", applied.join(", "))
      : `${tr("payPdfNoValues")} ${tr("payPdfReadDebug")
          .replace("{chars}", String(text.trim().length))
          .replace("{sample}", payrollTextPreview(text))}`;
  } catch {
    els.payPdfStatus.textContent = tr("payPdfError");
  } finally {
    els.payPdfFileInput.value = "";
  }
});

els.refreshTotalsButton.addEventListener("click", () => {
  syncStateFromStorage();
  setDefaultPayRange();
  renderSummary();
  renderCalendar();
  renderPaySlips();
});

els.settingsToggle.addEventListener("click", () => {
  openSettingsPage();
});

els.adminClose?.addEventListener("click", () => {
  closeSettingsPage();
});

els.settingsClose.addEventListener("click", () => {
  closeSettingsPage();
});

els.soundEnabled.addEventListener("change", () => {
  if (els.soundEnabled.checked) giveFeedback("success", { forceSound: true, soundOnly: true });
});

els.vibrationEnabled.addEventListener("change", () => {
  if (els.vibrationEnabled.checked) giveFeedback("success", { forceVibration: true, vibrationOnly: true });
});

els.testSoundButton.addEventListener("click", () => {
  giveFeedback("success", { forceSound: true, soundOnly: true });
});

els.testVibrationButton.addEventListener("click", () => {
  giveFeedback("success", { forceVibration: true, vibrationOnly: true });
});

function openSettingsPage() {
  els.settingsPanel.removeAttribute("hidden");
  if (els.adminPanel) els.adminPanel.hidden = true;
  els.settingsToggle.setAttribute("aria-expanded", "true");
  document.body.classList.add("settings-mode");
  window.scrollTo({ top: 0, behavior: "auto" });
}

function closeSettingsPage() {
  els.settingsPanel.hidden = true;
  if (els.adminPanel) els.adminPanel.hidden = true;
  els.settingsToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("settings-mode");
}

els.addAddonButton?.addEventListener("click", () => {
  const name = els.newAddonName.value.trim();
  const value = Number.parseFloat(els.newAddonValue.value) || 0;
  if (!name) return;
  state.customAddons.push({
    id: toId("addon"),
    name,
    value,
    type: els.newAddonType.value
  });
  els.newAddonName.value = "";
  els.newAddonValue.value = "0";
  saveState();
  renderCustomAddons(getFormShift().customAddons);
  renderAdminLists();
  renderShiftPreview();
});

els.addDeductionButton?.addEventListener("click", () => {
  const name = els.newDeductionName.value.trim();
  const value = Number.parseFloat(els.newDeductionValue.value) || 0;
  if (!name) return;
  state.customDeductions.push({
    id: toId("deduction"),
    name,
    value,
    type: els.newDeductionType.value
  });
  els.newDeductionName.value = "";
  els.newDeductionValue.value = "0";
  saveState();
  renderAdminLists();
  renderSummary();
});

function removeCustomAddon(id) {
  state.customAddons = state.customAddons.filter((addon) => addon.id !== id);
  Object.values(state.shifts).forEach((shift) => {
    if (shift.customAddons) delete shift.customAddons[id];
  });
  saveState();
  renderCustomAddons(getFormShift().customAddons);
  renderAdminLists();
  renderCalendar();
  renderShiftPreview();
}

function removeCustomDeduction(id) {
  state.customDeductions = state.customDeductions.filter((deduction) => deduction.id !== id);
  saveState();
  renderAdminLists();
  renderSummary();
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  els.installButton.hidden = false;
});

async function promptInstall() {
  if (!deferredInstallPrompt) {
    els.installStatus.textContent = tr("androidInstallUnavailable");
    return;
  }
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  els.installButton.hidden = true;
  els.installStatus.textContent = tr("androidInstallHint");
}

els.installButton.addEventListener("click", promptInstall);
els.androidInstallButton.addEventListener("click", promptInstall);

if ("serviceWorker" in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener("load", async () => {
    const registration = await navigator.serviceWorker.register("sw.js", { updateViaCache: "none" });
    registration.waiting?.postMessage({ type: "SKIP_WAITING" });
    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      worker?.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          worker.postMessage({ type: "SKIP_WAITING" });
        }
      });
    });
    registration.update();
  });
}

renderAll();
