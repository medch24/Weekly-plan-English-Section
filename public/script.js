// public/script.js - English Section Version

console.log("Main script started.");

// Global variables
let loggedInUser = null;
let currentUserLanguage = 'en';
let planData = [];
let filteredAndSortedData = [];
let uploadedPlanData = null;
let headers = [];
let currentWeek = null;
let weekStartDate = null;
let weeklyClassNotes = {};
let alertTimeoutId = null;
let incompleteTeachersInfo = {};

const AUTH_VERSION = 3;

const arabicTeachers = ['Majed', 'Jaber', 'Imad', 'Saeed'];
const englishTeachers = ['Tamer', 'Mohamed Ali', 'Sami', 'Tonga', 'Francis', 'Muhammed Ali', 'Khidr', 'Hamed', 'Kamel', 'Abdulrahman', 'Wassim', 'Anwar'];
const isArabicUser = () => currentUserLanguage === 'ar';

const classOrder = ["G7", "G8", "G9", "G10", "G11", "G12", "PEI1", "PEI2", "PEI3", "PEI4", "PEI5", "DP1", "DP2"];
const classTranslations = {
    'PEI1':'السادس', 'PEI2':'الاول متوسط', 'PEI3':'الثاني متوسط', 'PEI4':'الثالث متوسط', 'PEI5':'الأول ثانوي', 'DP1':'الثاني ثانوي', 'DP2':'الثالث ثانوي'
};

function compareClasses(a, b) {
    const indexA = classOrder.indexOf(a);
    const indexB = classOrder.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return String(a).localeCompare(String(b));
}

const specificWeekDateRanges = {
  1:{start:'2025-08-31',end:'2025-09-04'}, 2:{start:'2025-09-07',end:'2025-09-11'},
  3:{start:'2025-09-14',end:'2025-09-18'}, 4:{start:'2025-09-21',end:'2025-09-25'},
  5:{start:'2025-09-28',end:'2025-10-02'}, 6:{start:'2025-10-05',end:'2025-10-09'},
  7:{start:'2025-10-12',end:'2025-10-16'}, 8:{start:'2025-10-19',end:'2025-10-23'},
  9:{start:'2025-10-26',end:'2025-10-30'},10:{start:'2025-11-02',end:'2025-11-06'},
 11:{start:'2025-11-09',end:'2025-11-13'},12:{start:'2025-11-16',end:'2025-11-20'},
 13:{start:'2025-11-23',end:'2025-11-27'},14:{start:'2025-11-30',end:'2025-12-04'},
 15:{start:'2025-12-07',end:'2025-12-11'},16:{start:'2025-12-14',end:'2025-12-18'},
 17:{start:'2025-12-21',end:'2025-12-25'},18:{start:'2025-12-28',end:'2026-01-01'},
 19:{start:'2026-01-04',end:'2026-01-08'},20:{start:'2026-01-11',end:'2026-01-15'},
 21:{start:'2026-01-18',end:'2026-01-22'},22:{start:'2026-01-25',end:'2026-01-29'},
 23:{start:'2026-02-01',end:'2026-02-05'},24:{start:'2026-02-08',end:'2026-02-12'},
 25:{start:'2026-02-15',end:'2026-02-19'},26:{start:'2026-02-22',end:'2026-02-26'},
 27:{start:'2026-03-01',end:'2026-03-05'},28:{start:'2026-03-08',end:'2026-03-12'},
 29:{start:'2026-03-15',end:'2026-03-19'},30:{start:'2026-03-22',end:'2026-03-26'},
 31:{start:'2026-03-29',end:'2026-04-02'},32:{start:'2026-04-05',end:'2026-04-09'},
 33:{start:'2026-04-12',end:'2026-04-16'},34:{start:'2026-04-19',end:'2026-04-23'},
 35:{start:'2026-04-26',end:'2026-04-30'},36:{start:'2026-05-03',end:'2026-05-07'},
 37:{start:'2026-05-10',end:'2026-05-14'},38:{start:'2026-05-17',end:'2026-05-21'},
 39:{start:'2026-05-24',end:'2026-05-28'},40:{start:'2026-05-31',end:'2026-06-04'},
 41:{start:'2026-06-07',end:'2026-06-11'},42:{start:'2026-06-14',end:'2026-06-18'},
 43:{start:'2026-06-21',end:'2026-06-25'},44:{start:'2026-06-28',end:'2026-07-02'},
 45:{start:'2026-07-05',end:'2026-07-09'},46:{start:'2026-07-12',end:'2026-07-16'},
 47:{start:'2026-07-19',end:'2026-07-23'},48:{start:'2026-07-26',end:'2026-07-30'}
};

const translations = {
    fr: {
        login_title: "Connexion", login_username_label: "Nom d'utilisateur (Enseignant) :", login_password_label: "Mot de passe (idem Nom) :", login_button_text: "Se connecter", logout_button: "Déconnecter", main_page_title: "Plans Hebdomadaires", week_label: "Semaine:", select_week: "-- Sélectionnez une semaine --", please_select_week: "Veuillez sélectionner une semaine.", admin_actions_title: "Actions Administrateur", admin_excel_label: "Fichier Excel :", admin_save_button: "Charger et Enregistrer dans la DB", generate_word_button: "Générer Word par Classe", generate_excel_button: "Générer Excel (1 Fichier)", save_all_button: "Enregistrer Lignes Affichées", filter_teacher_label: "Enseignant:", filter_class_label: "Classe:", filter_material_label: "Matière:", filter_period_label: "Période:", filter_day_label: "Jour:", all: "Tous", all_f: "Toutes", day_sun: "Dimanche", day_mon: "Lundi", day_tue: "Mardi", day_wed: "Mercredi", day_thu: "Jeudi", days: ["Dim", "Lun", "Mar", "Mer", "Jeu"], fullDays: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi"], months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"], headers: { 'Teacher': 'Enseignant', 'Day': 'Jour', 'Period': 'Période', 'Class': 'Classe', 'Subject': 'Matière', 'Lesson': 'Leçon', 'Classwork': 'Travaux de classe', 'Material': 'Support', 'Homework': 'Devoirs' }, actions: "Actions", updated_at: "Mis à jour", notes_for_class: "Notes pour la classe :", select_class: "-- Sélectionnez une classe --", select_class_placeholder: "Sélectionnez une classe pour voir ou ajouter des notes...", notes_placeholder: "Notes pour {classText}...", save_notes_button: "Enregistrer Notes", saving: "Enregistrement...", saved: "Enregistré", saving_notes_for: "Enregistrement notes pour {class} S{week}", notes_saved_success: "Notes enregistrées pour {class}, S{week}.", error_saving_notes: "Erreur d'enregistrement des notes: {error}", display_incomplete: "Afficher Incomplets", hide_incomplete: "Masquer Incomplets", incomplete_teachers_title: "Enseignants Incomplets", loading: "Chargement...", no_data: "Aucune donnée.", all_complete: "Tout complet!", error_config_columns: "Erreur config colonnes.", welcome_user: "Bienvenue {user} ! Veuillez sélectionner une semaine.", connected_as: "Connecté: {user}", loading_data_week: "Chargement données S{week}...", data_loaded_week: "Données S{week} chargées.", no_data_found_week: "Aucune donnée trouvée pour S{week}.", error_loading_week: "Erreur chargement S{week}: {error}", select_week_to_display: "Veuillez sélectionner une semaine pour afficher les données.", error_structure: "Erreur: Structure de données non définie.", no_data_to_display_filters: "Aucune donnée à afficher avec les filtres actuels.", save_row_title: "Enregistrer cette ligne", invalid_row: "Ligne invalide.", error_saving_row: "Erreur enregistrement ligne: {error}", no_rows_to_save: "Aucune ligne affichée à enregistrer.", confirm_save_all: "Confirmer l'enregistrement des {count} lignes affichées pour la S{week}?", save_all_cancelled: "Enregistrement annulé.", saving_all_displayed: "Enregistrement des {count} lignes en cours...", save_all_success: "{count} lignes enregistrées avec succès.", save_all_partial: "Enregistrement terminé: {success} succès, {error} erreurs.", generating_word: "Génération de {count} document(s) Word...", generating_word_success: "{count} document(s) Word généré(s).", generating_word_partial: "Génération Word terminée: {ok} succès, {err} erreurs.", generating_word_failed: "Échec de la génération Word ({err} erreurs).", generating_excel: "Génération du fichier Excel S{week}...", generating_excel_success: "Fichier Excel '{filename}' généré.", error_generating_excel: "Erreur génération Excel: {error}", no_file_selected: "Aucun fichier sélectionné.", reading_file: "Lecture du fichier {fileName}...", file_read_success: "Fichier {fileName} lu ({count} lignes).", file_error: "Erreur lecture fichier: {error}", invalid_file_type: "Type de fichier invalide (.xlsx ou .xls requis).", saving_uploaded_data: "Enregistrement des données chargées pour S{week}...", uploaded_data_saved: "Données chargées enregistrées pour S{week}.", uploaded_data_error: "Erreur enregistrement données chargées: {error}", no_word_dates: "Génération Word: Dates manquantes côté serveur pour la semaine S{week}.",
        generate_ai_lesson_plan_button: "Plan de Leçon (IA)", generating_ai_lesson_plan: "Génération du plan de leçon IA...", error_generating_ai_lesson_plan: "Erreur génération plan IA: {error}", ai_lesson_plan_generated: "Plan de leçon IA généré.", quota_exceeded: "⚠️ Quota API épuisé ! La limite a été atteinte. Veuillez réessayer demain.",
        generate_weekly_lessons_button: "Générer Plans de Leçons (Semaine)", generating_weekly_lessons: "Génération des plans de leçons pour la semaine...", weekly_lessons_generated: "Plans de leçons hebdomadaires générés.",
        admin_report_class_label: "Choisir une Classe :", generate_full_report_button: "Générer Rapport Complet par Classe", loading_classes: "-- Chargement des classes --", select_report_class: "-- Sélectionnez une classe pour le rapport --", no_classes_found: "-- Aucune classe trouvée --", generating_full_report: "Génération du rapport complet pour la classe {classe}...", generating_full_report_success: "Rapport complet pour {classe} généré.", generating_full_report_error: "Erreur génération du rapport pour {classe}: {error}", please_select_class_for_report: "Veuillez sélectionner une classe pour générer le rapport."
    },
    ar: {
        login_title: "تسجيل الدخول", login_username_label: "اسم المستخدم (المعلم):", login_password_label: "كلمة المرور (نفس الاسم):", login_button_text: "تسجيل الدخول", logout_button: "تسجيل الخروج", main_page_title: "الخطط الأسبوعية", week_label: "الأسبوع:", select_week: "-- اختر أسبوع --", please_select_week: "يرجى اختيار أسبوع.", admin_actions_title: "إجراءات المسؤول", admin_excel_label: "ملف اكسل:", admin_save_button: "تحميل وحفظ في قاعدة البيانات", generate_word_button: "إنشاء ملف وورد حسب الفصل", generate_excel_button: "إنشاء ملف اكسل (ملف واحد)", save_all_button: "حفظ الصفوف المعروضة", filter_teacher_label: "المعلم:", filter_class_label: "الفصل:", filter_material_label: "المادة:", filter_period_label: "الحصة:", filter_day_label: "اليوم:", all: "الكل", all_f: "الكل", day_sun: "الأحد", day_mon: "الاثنين", day_tue: "الثلاثاء", day_wed: "الأربعاء", day_thu: "الخميس", days: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"], fullDays: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"], months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"], headers: { 'Teacher': 'المعلم', 'Day': 'اليوم', 'Period': 'الحصة', 'Class': 'الفصل', 'Subject': 'المادة', 'Lesson': 'الدرس', 'Classwork': 'أعمال الفصل', 'Material': 'الدعم', 'Homework': 'الواجبات' }, actions: "إجراءات", updated_at: "آخر تحديث", notes_for_class: "ملاحظات للفصل:", select_class: "-- اختر فصل --", select_class_placeholder: "اختر فصلًا لعرض أو إضافة ملاحظات...", notes_placeholder: "ملاحظات ل {classText}...", save_notes_button: "حفظ الملاحظات", saving: "جاري الحفظ...", saved: "تم الحفظ", saving_notes_for: "جاري حفظ الملاحظات ل {class} أسبوع {week}", notes_saved_success: "تم حفظ الملاحظات ل {class}، أسبوع {week}.", error_saving_notes: "خطأ في حفظ الملاحظات: {error}", display_incomplete: "إظهار غير المكتمل", hide_incomplete: "إخفاء غير المكتمل", incomplete_teachers_title: "المعلمون غير المكتملين", loading: "جاري التحميل...", no_data: "لا توجد بيانات.", all_complete: "الكل مكتمل!", error_config_columns: "خطأ في إعداد الأعمدة.", welcome_user: "مرحباً {user}! يرجى اختيار أسبوع.", connected_as: "متصل: {user}", loading_data_week: "جاري تحميل بيانات الأسبوع {week}...", data_loaded_week: "تم تحميل بيانات الأسبوع {week}.", no_data_found_week: "لم يتم العثور على بيانات للأسبوع {week}.", error_loading_week: "خطأ في تحميل الأسبوع {week}: {error}", select_week_to_display: "يرجى اختيار أسبوع لعرض البيانات.", error_structure: "خطأ: هيكل البيانات غير محدد.", no_data_to_display_filters: "لا توجد بيانات لعرضها مع الفلاتر الحالية.", save_row_title: "حفظ هذا السطر", invalid_row: "سطر غير صالح.", error_saving_row: "خطأ في حفظ السطر: {error}", no_rows_to_save: "لا توجد أسطر معروضة للحفظ.", confirm_save_all: "تأكيد حفظ {count} أسطر معروضة للأسبوع {week}؟", save_all_cancelled: "تم إلغاء الحفظ.", saving_all_displayed: "جاري حفظ {count} أسطر...", save_all_success: "تم حفظ {count} أسطر بنجاح.", save_all_partial: "اكتمل الحفظ: {success} نجاح، {error} أخطاء.", generating_word: "جاري إنشاء {count} مستند (مستندات) وورد...", generating_word_success: "تم إنشاء {count} مستند (مستندات) وورد.", generating_word_partial: "اكتمل إنشاء الوورد: {ok} نجاح، {err} أخطاء.", generating_word_failed: "فشل إنشاء الوورد ({err} أخطاء).", generating_excel: "جاري إنشاء ملف اكسل للأسبوع {week}...", generating_excel_success: "تم إنشاء ملف اكسل '{filename}'.", error_generating_excel: "خطأ في إنشاء اكسل: {error}", no_file_selected: "لم يتم اختيار ملف.", reading_file: "قراءة الملف {fileName}...", file_read_success: "تمت قراءة الملف {fileName} ({count} أسطر).", file_error: "خطأ في قراءة الملف: {error}", invalid_file_type: "نوع الملف غير صالح (مطلوب .xlsx أو .xls).", saving_uploaded_data: "جاري حفظ البيانات المحملة للأسبوع {week}...", uploaded_data_saved: "تم حفظ البيانات المحملة للأسبوع {week}.", uploaded_data_error: "خطأ في حفظ البيانات المحملة: {error}", no_word_dates: "توليد وورد: التواريخ مفقودة على الخادم للأسبوع {week}.",
        generate_ai_lesson_plan_button: "خطة الدرس (AI)", generating_ai_lesson_plan: "جاري إنشاء خطة الدرس بالذكاء الاصطناعي...", error_generating_ai_lesson_plan: "خطأ في إنشاء خطة الدرس بالذكاء الاصطناعي: {error}", ai_lesson_plan_generated: "تم إنشاء خطة الدرس بالذكاء الاصطناعي.",
        generate_weekly_lessons_button: "إنشاء خطط دروس الأسبوع", generating_weekly_lessons: "جاري إنشاء خطط دروس الأسبوع...", weekly_lessons_generated: "تم إنشاء خطط دروس الأسبوع.",
        admin_report_class_label: "اختر فصل:", generate_full_report_button: "إنشاء تقرير كامل حسب الفصل", loading_classes: "-- جاري تحميل الفصول --", select_report_class: "-- اختر فصل للتقرير --", no_classes_found: "-- لم يتم العثور على فصول --", generating_full_report: "جاري إنشاء التقرير الكامل للفصل {classe}...", generating_full_report_success: "تم إنشاء التقرير الكامل للفصل {classe}.", generating_full_report_error: "خطأ في إنشاء التقرير للفصل {classe}: {error}", please_select_class_for_report: "يرجى اختيار فصل لإنشاء التقرير."
    },
    en: {
        login_title: "Login", login_username_label: "Username (Teacher):", login_password_label: "Password (same as Name):", login_button_text: "Login", logout_button: "Logout", main_page_title: "Weekly Plans", week_label: "Week:", select_week: "-- Select a week --", please_select_week: "Please select a week.", admin_actions_title: "Administrator Actions", admin_excel_label: "Excel File:", admin_save_button: "Load and Save to DB", generate_word_button: "Generate Word by Class", generate_excel_button: "Generate Excel (1 File)", save_all_button: "Save Displayed Rows", filter_teacher_label: "Teacher:", filter_class_label: "Class:", filter_material_label: "Subject:", filter_period_label: "Period:", filter_day_label: "Day:", all: "All", all_f: "All", day_sun: "Sunday", day_mon: "Monday", day_tue: "Tuesday", day_wed: "Wednesday", day_thu: "Thursday", days: ["Sun", "Mon", "Tue", "Wed", "Thu"], fullDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"], months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], headers: { 'Teacher': 'Teacher', 'Day': 'Day', 'Period': 'Period', 'Class': 'Class', 'Subject': 'Subject', 'Lesson': 'Lesson', 'Classwork': 'Classwork', 'Material': 'Material', 'Homework': 'Homework' }, actions: "Actions", updated_at: "Updated At", notes_for_class: "Notes for class:", select_class: "-- Select a class --", select_class_placeholder: "Select a class to view or add notes...", notes_placeholder: "Notes for {classText}...", save_notes_button: "Save Notes", saving: "Saving...", saved: "Saved", saving_notes_for: "Saving notes for {class} W{week}", notes_saved_success: "Notes saved for {class}, W{week}.", error_saving_notes: "Error saving notes: {error}", display_incomplete: "Show Incomplete", hide_incomplete: "Hide Incomplete", incomplete_teachers_title: "Incomplete Teachers", loading: "Loading...", no_data: "No data.", all_complete: "All complete!", error_config_columns: "Column config error.", welcome_user: "Welcome {user}! Please select a week.", connected_as: "Connected: {user}", loading_data_week: "Loading data W{week}...", data_loaded_week: "Data W{week} loaded.", no_data_found_week: "No data found for W{week}.", error_loading_week: "Error loading W{week}: {error}", select_week_to_display: "Please select a week to display data.", error_structure: "Error: Data structure undefined.", no_data_to_display_filters: "No data to display with current filters.", save_row_title: "Save this row", invalid_row: "Invalid row.", error_saving_row: "Error saving row: {error}", no_rows_to_save: "No displayed rows to save.", confirm_save_all: "Confirm saving the {count} displayed rows for W{week}?", save_all_cancelled: "Save cancelled.", saving_all_displayed: "Saving {count} rows...", save_all_success: "{count} rows saved successfully.", save_all_partial: "Save complete: {success} success, {error} errors.", generating_word: "Generating {count} Word document(s)...", generating_word_success: "{count} Word document(s) generated.", generating_word_partial: "Word generation complete: {ok} success, {err} errors.", generating_word_failed: "Word generation failed ({err} errors).", generating_excel: "Generating Excel file W{week}...", generating_excel_success: "Excel file '{filename}' generated.", error_generating_excel: "Error generating Excel: {error}", no_file_selected: "No file selected.", reading_file: "Reading file {fileName}...", file_read_success: "File {fileName} read ({count} rows).", file_error: "Error reading file: {error}", invalid_file_type: "Invalid file type (requires .xlsx or .xls).", saving_uploaded_data: "Saving uploaded data for W{week}...", uploaded_data_saved: "Uploaded data saved for W{week}.", uploaded_data_error: "Error saving uploaded data: {error}", no_word_dates: "Word generation: Server-side dates missing for week W{week}.",
        generate_ai_lesson_plan_button: "Lesson Plan (AI)", generating_ai_lesson_plan: "Generating AI lesson plan...", error_generating_ai_lesson_plan: "Error generating AI lesson plan: {error}", ai_lesson_plan_generated: "AI lesson plan generated.", quota_exceeded: "⚠️ API Quota Exceeded! Please try again tomorrow.",
        generate_weekly_lessons_button: "Generate Weekly Lesson Plans", generating_weekly_lessons: "Generating weekly lesson plans...", weekly_lessons_generated: "Weekly lesson plans generated.",
        admin_report_class_label: "Choose a Class:", generate_full_report_button: "Generate Full Report by Class", loading_classes: "-- Loading classes --", select_report_class: "-- Select a class for the report --", no_classes_found: "-- No classes found --", generating_full_report: "Generating full report for class {classe}...", generating_full_report_success: "Full report for {classe} generated.", generating_full_report_error: "Error generating report for {classe}: {error}", please_select_class_for_report: "Please select a class to generate the report."
    }
};

const t = (key, params = {}) => { let text = translations[currentUserLanguage]?.[key] || translations.fr[key] || key; for (const p in params) { text = text.replace(`{${p}}`, params[p]); } return text; };

function showProgressBar() { document.getElementById('progress-bar-container').style.display='block'; document.getElementById('progress-bar').style.width='0%'; }
function updateProgressBar(p) { document.getElementById('progress-bar').style.width=Math.min(100, Math.max(0, p))+'%'; }
function hideProgressBar() { setTimeout(() => { document.getElementById('progress-bar-container').style.display='none'; }, 500); }
function displayAlert(msgKey, isErr = false, params = {}) { if (!msgKey) { document.getElementById('message-alerte').style.display='none'; return; } const msg = t(msgKey, params); const div=document.getElementById('message-alerte'); div.textContent=msg; div.className = (isErr ? 'alert-error' : 'alert-success') + ' message-alert-base'; div.style.display='block'; if(alertTimeoutId) clearTimeout(alertTimeoutId); alertTimeoutId=setTimeout(()=> { if(div.textContent===msg) div.style.display='none'; }, 5000); }
function setButtonLoading(btnId, isLoading, iconClass) { if(!btnId) return; const btn=document.getElementById(btnId); if(!btn) return; btn.disabled=isLoading; const icon=btn.querySelector('i'); if(icon) icon.className=isLoading ? 'fas fa-spinner fa-spin' : iconClass; }
function containsArabic(text) { return /[\u0600-\u06FF]/.test(text); }
function applyRTLToElement(element, content) { if (containsArabic(content)) element.classList.add('arabic-content'); else element.classList.remove('arabic-content'); }

function formatDateForDisplay(d) {
    if (!d || isNaN(d.getTime())) return "Invalid Date";
    const days = translations[currentUserLanguage].fullDays;
    const months = translations[currentUserLanguage].months;
    return `${days[d.getUTCDay()]}, ${months[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, '0')}, ${d.getUTCFullYear()}`;
}

const findHKey = (targetHeader) => {
    if (!headers || headers.length === 0 || !targetHeader) return null;
    const targetLower = targetHeader.trim().toLowerCase();
    const aliasMap = {
        "teacher": ["teacher", "enseignant"],
        "day": ["day", "jour"],
        "period": ["period", "période", "periode"],
        "class": ["class", "classe"],
        "subject": ["subject", "matière", "matiere"],
        "lesson": ["lesson", "leçon", "lecon"],
        "classwork": ["classwork", "travaux de classe"],
        "material": ["material", "support"],
        "homework": ["homework", "devoirs"]
    };
    const aliases = aliasMap[targetLower] || [targetLower];
    return headers.find(h => aliases.includes(h.trim().toLowerCase()));
};

function getDateForDayName(dayName) {
    if(!weekStartDate) return null;
    const dayMap = {"Sunday":0,"Monday":1,"Tuesday":2,"Wednesday":3,"Thursday":4, "Dimanche":0, "Lundi":1, "Mardi":2, "Mercredi":3, "Jeudi":4};
    const offset = dayMap[dayName];
    if(offset === undefined) return null;
    const dt = new Date(Date.UTC(weekStartDate.getUTCFullYear(), weekStartDate.getUTCMonth(), weekStartDate.getUTCDate()));
    dt.setUTCDate(dt.getUTCDate() + offset);
    return dt;
}

async function fetchPlanData(week) {
    currentWeek = week;
    const dates = specificWeekDateRanges[week];
    if (dates) weekStartDate = new Date(dates.start + 'T00:00:00Z');

    displayAlert('loading_data_week', false, { week });
    showProgressBar();
    updateProgressBar(20);
    try {
        const r = await fetch(`/api/plans/${week}`);
        const fetched = await r.json();
        planData = fetched.planData || [];
        weeklyClassNotes = fetched.classNotes || {};
        window.availableWeeklyPlans = fetched.availableWeeklyPlans || [];
        headers = planData.length > 0 ? Object.keys(planData[0]).filter(h => h !== '_id' && h !== 'id') : [];
        updateProgressBar(100);
        createTableHeader();
        populateFilterOptions();
        sortAndDisplay();
    } catch (e) { displayAlert('error_loading_week', true, { week, error: e.message }); }
    finally { hideProgressBar(); }
}

function createTableHeader() {
    const tHead = document.querySelector('#planTable thead tr');
    tHead.innerHTML = '';
    headers.filter(h => h.toLowerCase() !== 'updatedat').forEach(h => {
        const th = document.createElement('th');
        th.textContent = translations[currentUserLanguage].headers[h] || h;
        tHead.appendChild(th);
    });
    const actTh = document.createElement('th');
    actTh.textContent = t('actions');
    tHead.appendChild(actTh);
}

function sortAndDisplay() {
    const ensF = document.getElementById('filterEnseignant').value;
    const clsF = document.getElementById('filterClasse').value;
    const ensK = findHKey('Teacher');
    const clsK = findHKey('Class');
    filteredAndSortedData = planData.filter(row => (!ensF || row[ensK] === ensF) && (!clsF || row[clsK] === clsF));
    displayPlanTable(filteredAndSortedData);
}

function displayPlanTable(data) {
    const tBody = document.querySelector('#planTable tbody');
    tBody.innerHTML = '';
    const jK = findHKey('Day');
    const editKeys = ['Lesson', 'Classwork', 'Material', 'Homework'].map(k => findHKey(k)).filter(Boolean);

    data.forEach((row, idx) => {
        const tr = document.createElement('tr');
        headers.filter(h => h.toLowerCase() !== 'updatedat').forEach(h => {
            const td = document.createElement('td');
            let content = row[h] || '';
            if (h === jK) {
                const dt = getDateForDayName(content);
                td.textContent = dt ? formatDateForDisplay(dt) : content;
            } else if (editKeys.includes(h)) {
                td.contentEditable = true;
                td.classList.add('editable');
                td.innerText = content;
                td.addEventListener('input', (e) => { row[h] = e.target.innerText; tr.classList.add('modified'); });
            } else {
                td.textContent = content;
            }
            tr.appendChild(td);
        });
        const actTd = document.createElement('td');
        actTd.classList.add('actions-column');

        const saveBtn = document.createElement('button');
        saveBtn.innerHTML = '<i class="fas fa-check"></i>';
        saveBtn.onclick = () => saveRow(row, tr);
        saveBtn.className = 'save-row-button';
        actTd.appendChild(saveBtn);

        const aiBtn = document.createElement('button');
        aiBtn.innerHTML = '<i class="fas fa-robot"></i>';
        if (row.lessonPlanId) aiBtn.classList.add('lesson-plan-exists');
        aiBtn.onclick = () => generateAILessonPlan(row, tr);
        aiBtn.className = 'ai-lesson-plan-button';
        actTd.appendChild(aiBtn);

        tr.appendChild(actTd);
        tBody.appendChild(tr);
    });
    updateActionButtonsState(data.length > 0);
}

async function saveRow(rowData, tr) {
    try {
        const r = await fetch('/api/save-row', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ week: currentWeek, data: rowData }) });
        if (r.ok) { tr.classList.remove('modified'); displayAlert('saved', false); }
    } catch (e) { displayAlert('error_saving_row', true, { error: e.message }); }
}

async function generateAILessonPlan(rowData, tr) {
    displayAlert('generating_ai_lesson_plan', false);
    try {
        const r = await fetch('/api/generate-ai-lesson-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ week: currentWeek, rowData }) });
        if (r.ok) {
            const blob = await r.blob();
            saveAs(blob, `AI_Plan_${currentWeek}.docx`);
            displayAlert('ai_lesson_plan_generated', false);
        }
    } catch (e) { displayAlert('error_generating_ai_lesson_plan', true, { error: e.message }); }
}

async function loadPlanForWeek() {
    const wk = document.getElementById('weekSelector').value;
    if (wk) await fetchPlanData(wk);
}

function populateFilterOptions() {
    const ensK = findHKey('Teacher');
    const clsK = findHKey('Class');
    const ens = [...new Set(planData.map(r => r[ensK]).filter(Boolean))].sort();
    const cls = [...new Set(planData.map(r => r[clsK]).filter(Boolean))].sort(compareClasses);

    const ensSel = document.getElementById('filterEnseignant');
    ensSel.innerHTML = '<option value="">All</option>';
    ens.forEach(e => ensSel.innerHTML += `<option value="${e}">${e}</option>`);

    const clsSel = document.getElementById('filterClasse');
    clsSel.innerHTML = '<option value="">All</option>';
    cls.forEach(c => clsSel.innerHTML += `<option value="${c}">${c}</option>`);
}

function updateActionButtonsState(isEnabled) {
    document.getElementById('generateWordBtn').disabled = !isEnabled;
    document.getElementById('generateExcelBtn').disabled = !isEnabled;
    document.getElementById('generateAllDisplayedPlansBtn').disabled = !isEnabled;
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        uploadedPlanData = XLSX.utils.sheet_to_json(sheet);
        document.getElementById('saveUploadedDataBtn').disabled = false;
        displayAlert('file_read_success', false, { fileName: file.name, count: uploadedPlanData.length });
    };
    reader.readAsArrayBuffer(file);
}

async function saveUploadedData() {
    const week = document.getElementById('weekSelector').value;
    if (!week || !uploadedPlanData) return;
    try {
        const r = await fetch('/api/save-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ week, data: uploadedPlanData }) });
        if (r.ok) { displayAlert('uploaded_data_saved', false); await loadPlanForWeek(); }
    } catch (e) { displayAlert('uploaded_data_error', true, { error: e.message }); }
}

async function generateWordByClasse() {
    const r = await fetch('/api/generate-word', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ week: currentWeek, classe: document.getElementById('filterClasse').value, data: filteredAndSortedData }) });
    if (r.ok) { const blob = await r.blob(); saveAs(blob, `Plan_W${currentWeek}.docx`); }
}

async function generateExcelWorkbook() {
    const r = await fetch('/api/generate-excel-workbook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ week: currentWeek }) });
    if (r.ok) { const blob = await r.blob(); saveAs(blob, `Workbook_W${currentWeek}.xlsx`); }
}

function initializeApp(user) {
    loggedInUser = user;
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('loggedInUserInfo').textContent = t('connected_as', { user });
    if (user === 'Tamer') document.getElementById('admin-actions').style.display = 'block';

    if (window.NotificationManager) window.NotificationManager.initialize(user);
}

document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('loggedInUser');
    if (savedUser) initializeApp(savedUser);

    document.getElementById('login-button').addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        try {
            const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
            const res = await r.json();
            if (res.success) { localStorage.setItem('loggedInUser', res.username); initializeApp(res.username); }
            else displayAlert(res.message, true);
        } catch(e) { displayAlert('Server error', true); }
    });

    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        location.reload();
    });
});

function populateNotesClassSelector() {} // Optional for now
