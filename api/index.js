// api/index.js — English Section Version

// Protection against multiple module loads
if (global.appInstance) {
  console.log('⚠️ Module api/index.js already loaded, reusing existing instance');
  module.exports = global.appInstance;
  return;
}

const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fetch = require('node-fetch');
const { MongoClient } = require('mongodb');
const archiver = require('archiver');
const webpush = require('web-push');
const path = require('path');

// ========================================================================
// ====================== HELPERS FOR WORD GENERATION =====================
// ========================================================================

const xmlEscape = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
};

const containsArabic = (text) => {
  if (typeof text !== 'string') return false;
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
};

const formatTextForWord = (text, options = {}) => {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return '<w:p/>';
  }

  const cleanedText = text.trim();
  const { color, italic } = options;
  const runPropertiesParts = [];
  runPropertiesParts.push('<w:sz w:val="22"/><w:szCs w:val="22"/>');
  if (color) runPropertiesParts.push(`<w:color w:val="${color}"/>`);
  if (italic) runPropertiesParts.push('<w:i/><w:iCs w:val="true"/>');

  let paragraphProperties = '';
  if (containsArabic(cleanedText)) {
    paragraphProperties = '<w:pPr><w:jc w:val="right"/><w:bidi w:val="1"/><w:textDirection w:val="rl"/></w:pPr>';
    runPropertiesParts.push('<w:rtl w:val="1"/>');
    runPropertiesParts.push('<w:cs/>');
    runPropertiesParts.push('<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Arabic Typesetting"/>');
  }

  const runProperties = `<w:rPr>${runPropertiesParts.join('')}</w:rPr>`;
  const lines = cleanedText.split(/\r\n|\n|\r/);
  const content = lines
    .map(line => `<w:t xml:space="preserve">${xmlEscape(line)}</w:t>`)
    .join('<w:br/>');
  return `<w:p>${paragraphProperties}<w:r>${runProperties}${content}</w:r></w:p>`;
};

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(fileUpload());

const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

const MONGO_URL = process.env.MONGO_URL;
const WORD_TEMPLATE_URL = process.env.WORD_TEMPLATE_URL;
const WORD_TEMPLATE2_URL = process.env.WORD_TEMPLATE2_URL;
const LESSON_TEMPLATE_URL = process.env.LESSON_TEMPLATE_URL;

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@weeklyplan.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('✅ Web Push VAPID configured');
}

const arabicTeachers = ['Majed', 'Jaber', 'Imad', 'Saeed'];
const englishTeachers = ['Tamer', 'Mohamed Ali', 'Sami', 'Tonga', 'Francis', 'Muhammed Ali', 'Khidr', 'Hamed', 'Kamel', 'Abdulrahman', 'Wassim', 'Anwar'];

const specificWeekDateRangesNode = {
  1:{start:'2025-08-31',end:'2025-09-04'}, 2:{start:'2025-09-07',end:'2025-09-11'}, 3:{start:'2025-09-14',end:'2025-09-18'}, 4:{start:'2025-09-21',end:'2025-09-25'}, 5:{start:'2025-09-28',end:'2025-10-02'}, 6:{start:'2025-10-05',end:'2025-10-09'}, 7:{start:'2025-10-12',end:'2025-10-16'}, 8:{start:'2025-10-19',end:'2025-10-23'}, 9:{start:'2025-10-26',end:'2025-10-30'},10:{start:'2025-11-02',end:'2025-11-06'},
  11:{start:'2025-11-09',end:'2025-11-13'},12:{start:'2025-11-16',end:'2025-11-20'}, 13:{start:'2025-11-23',end:'2025-11-27'},14:{start:'2025-11-30',end:'2025-12-04'}, 15:{start:'2025-12-07',end:'2025-12-11'},16:{start:'2025-12-14',end:'2025-12-18'}, 17:{start:'2025-12-21',end:'2025-12-25'},18:{start:'2025-12-28',end:'2026-01-01'}, 19:{start:'2026-01-04',end:'2026-01-08'},20:{start:'2026-01-11',end:'2026-01-15'},
  21:{start:'2026-01-18',end:'2026-01-22'},22:{start:'2026-01-25',end:'2026-01-29'}, 23:{start:'2026-02-01',end:'2026-02-05'},24:{start:'2026-02-08',end:'2026-02-12'}, 25:{start:'2026-02-15',end:'2026-02-19'},26:{start:'2026-02-22',end:'2026-02-26'}, 27:{start:'2026-03-01',end:'2026-03-05'},28:{start:'2026-03-08',end:'2026-03-12'}, 29:{start:'2026-03-15',end:'2026-03-19'},30:{start:'2026-03-22',end:'2026-03-26'},
  31:{start:'2026-03-29',end:'2026-04-02'},32:{start:'2026-04-05',end:'2026-04-09'}, 33:{start:'2026-04-12',end:'2026-04-16'},34:{start:'2026-04-19',end:'2026-04-23'}, 35:{start:'2026-04-26',end:'2026-04-30'},36:{start:'2026-05-03',end:'2026-05-07'}, 37:{start:'2026-05-10',end:'2026-05-14'},38:{start:'2026-05-17',end:'2026-05-21'}, 39:{start:'2026-05-24',end:'2026-05-28'},40:{start:'2026-05-31',end:'2026-06-04'},
  41:{start:'2026-06-07',end:'2026-06-11'},42:{start:'2026-06-14',end:'2026-06-18'}, 43:{start:'2026-06-21',end:'2026-06-25'},44:{start:'2026-06-28',end:'2026-07-02'}, 45:{start:'2026-07-05',end:'2026-07-09'},46:{start:'2026-07-12',end:'2026-07-16'}, 47:{start:'2026-07-19',end:'2026-07-23'},48:{start:'2026-07-26',end:'2026-07-30'}
};

const validUsers = {
  "Tamer": "Tamer", "Mohamed Ali": "Mohamed Ali", "Sami": "Sami", "Tonga": "Tonga", "Francis": "Francis",
  "Muhammed Ali": "Muhammed Ali", "Khidr": "Khidr", "Hamed": "Hamed", "Kamel": "Kamel",
  "Abdulrahman": "Abdulrahman", "Wassim": "Wassim", "Anwar": "Anwar",
  "Majed": "Majed", "Jaber": "Jaber", "Imad": "Imad", "Saeed": "Saeed"
};

let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db();
  cachedDb = db;
  return db;
}

function formatDateEnglishNode(date) {
  if (!date || isNaN(date.getTime())) return "Invalid date";
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${days[date.getUTCDay()]}, ${months[date.getUTCMonth()]} ${String(date.getUTCDate()).padStart(2, '0')}, ${date.getUTCFullYear()}`;
}

function extractDayNameFromString(dayString) {
  if (!dayString || typeof dayString !== 'string') return null;
  const trimmed = dayString.trim();
  const dayNamesEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  const dayNamesFr = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi"];
  if (dayNamesEn.includes(trimmed)) return trimmed;
  if (dayNamesFr.includes(trimmed)) return dayNamesEn[dayNamesFr.indexOf(trimmed)];
  for (let i = 0; i < dayNamesEn.length; i++) {
    if (trimmed.startsWith(dayNamesEn[i]) || trimmed.startsWith(dayNamesFr[i])) return dayNamesEn[i];
  }
  return null;
}

function getDateForDayNameNode(weekStartDate, dayName) {
  if (!weekStartDate || isNaN(weekStartDate.getTime())) return null;
  const dayOrder = { "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Dimanche": 0, "Lundi": 1, "Mardi": 2, "Mercredi": 3, "Jeudi": 4 };
  const offset = dayOrder[dayName];
  if (offset === undefined) return null;
  const specificDate = new Date(Date.UTC(weekStartDate.getUTCFullYear(), weekStartDate.getUTCMonth(), weekStartDate.getUTCDate()));
  specificDate.setUTCDate(specificDate.getUTCDate() + offset);
  return specificDate;
}

const findKey = (obj, target) => {
    if (!obj) return undefined;
    const keys = Object.keys(obj);
    const targetLower = target.toLowerCase();
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
    return keys.find(k => aliases.includes(k.trim().toLowerCase()));
};

const sanitizeForFilename = (str) => {
  if (typeof str !== 'string') str = String(str);
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '_').replace(/__+/g, '_');
};

async function resolveGeminiModel(apiKey) {
  try {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    if (!resp.ok) return "gemini-1.5-flash";
    const json = await resp.json();
    const models = json.models || [];
    const preferredNames = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];
    for (const short of preferredNames) { if (models.some(m => m.name === `models/${short}`)) return short; }
    return models[0]?.name.replace(/^models\//, "") || "gemini-1.5-flash";
  } catch (e) { return "gemini-1.5-flash"; }
}

// ------------------------- API Routes -------------------------

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (validUsers[username] && validUsers[username] === password) res.status(200).json({ success: true, username });
  else res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.get('/api/plans/:week', async (req, res) => {
  const weekNumber = parseInt(req.params.week, 10);
  if (isNaN(weekNumber)) return res.status(400).json({ message: 'Invalid week.' });
  try {
    const db = await connectToDatabase();
    const planDocument = await db.collection('plans').findOne({ week: weekNumber });
    const lessonPlans = await db.collection('lessonPlans').find({ week: weekNumber }, { projection: { _id: 1 } }).toArray();
    const availableLessonPlanIds = new Set(lessonPlans.map(lp => lp._id));
    const weeklyPlans = await db.collection('weeklyLessonPlans').find({ week: weekNumber }, { projection: { classe: 1 } }).toArray();
    const availableWeeklyPlans = weeklyPlans.map(p => p.classe);

    if (planDocument) {
      const enrichedData = (planDocument.data || []).map(row => {
        const potentialId = `${weekNumber}_${row[findKey(row, 'Teacher')]}_${row[findKey(row, 'Class')]}_${row[findKey(row, 'Subject')]}_${row[findKey(row, 'Period')]}_${row[findKey(row, 'Day')]}`.replace(/\s+/g, '_');
        if (availableLessonPlanIds.has(potentialId)) return { ...row, lessonPlanId: potentialId };
        return row;
      });
      res.status(200).json({ planData: enrichedData, classNotes: planDocument.classNotes || {}, availableWeeklyPlans });
    } else res.status(200).json({ planData: [], classNotes: {}, availableWeeklyPlans: [] });
  } catch (error) { res.status(500).json({ message: 'Server error.' }); }
});

app.post('/api/save-plan', async (req, res) => {
  const weekNumber = parseInt(req.body.week, 10);
  if (isNaN(weekNumber) || !Array.isArray(req.body.data)) return res.status(400).json({ message: 'Invalid data.' });
  try {
    const db = await connectToDatabase();
    await db.collection('plans').updateOne({ week: weekNumber }, { $set: { data: req.body.data } }, { upsert: true });
    res.status(200).json({ message: `Plan W${weekNumber} saved.` });
  } catch (error) { res.status(500).json({ message: 'Server error.' }); }
});

app.post('/api/save-row', async (req, res) => {
  const weekNumber = parseInt(req.body.week, 10);
  const rowData = req.body.data;
  if (isNaN(weekNumber) || typeof rowData !== 'object') return res.status(400).json({ message: 'Invalid data.' });
  try {
    const db = await connectToDatabase();
    const updateFields = { 'data.$[elem].updatedAt': new Date() };
    for (const key in rowData) { if (key !== '_id' && key !== 'lessonPlanId') updateFields[`data.$[elem].${key}`] = rowData[key]; }
    const filters = [{ "elem.Teacher": rowData[findKey(rowData, 'Teacher')], "elem.Class": rowData[findKey(rowData, 'Class')], "elem.Day": rowData[findKey(rowData, 'Day')], "elem.Period": rowData[findKey(rowData, 'Period')], "elem.Subject": rowData[findKey(rowData, 'Subject')] }];
    await db.collection('plans').updateOne({ week: weekNumber }, { $set: updateFields }, { arrayFilters: filters });
    res.status(200).json({ message: 'Row saved.' });
  } catch (error) { res.status(500).json({ message: 'Server error.' }); }
});

app.post('/api/generate-word', async (req, res) => {
  try {
    const { week, classe, data, notes } = req.body;
    const weekNumber = Number(week);
    const templateUrl = (classe === 'G7' || classe === 'G8') ? WORD_TEMPLATE_URL : (WORD_TEMPLATE2_URL || WORD_TEMPLATE_URL);
    const resp = await fetch(templateUrl);
    const templateBuffer = Buffer.from(await resp.arrayBuffer());
    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, nullGetter: () => "" });

    const datesNode = specificWeekDateRangesNode[weekNumber];
    const weekStart = datesNode?.start ? new Date(datesNode.start + 'T00:00:00Z') : null;
    if (!weekStart) return res.status(500).json({ message: `Dates missing for W${weekNumber}.` });

    const grouped = {};
    data.forEach(item => {
        const dName = extractDayNameFromString(item[findKey(item, 'Day')]);
        if (dName) { if (!grouped[dName]) grouped[dName] = []; grouped[dName].push(item); }
    });

    const joursData = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"].map(dayName => {
      if (!grouped[dayName]) return null;
      const sorted = grouped[dayName].sort((a, b) => (parseInt(a[findKey(a, 'Period')], 10) || 0) - (parseInt(b[findKey(b, 'Period')], 10) || 0));
      return {
        jourDateComplete: formatDateEnglishNode(getDateForDayNameNode(weekStart, dayName) || new Date()),
        matieres: sorted.map(item => ({
          matiere: item[findKey(item, 'Subject')] ?? "",
          Lecon: formatTextForWord(item[findKey(item, 'Lesson')], { color: 'FF0000' }),
          travailDeClasse: formatTextForWord(item[findKey(item, 'Classwork')]),
          Support: formatTextForWord(item[findKey(item, 'Material')], { color: 'FF0000', italic: true }),
          devoirs: formatTextForWord(item[findKey(item, 'Homework')], { color: '0000FF' })
        }))
      };
    }).filter(Boolean);

    doc.render({ semaine: weekNumber, classe, jours: joursData, notes: formatTextForWord(notes || ""), plageSemaine: `Week ${weekNumber}` });
    const buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
    res.setHeader('Content-Disposition', `attachment; filename="plan_w${weekNumber}_${classe}.docx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buf);
  } catch (error) { res.status(500).json({ message: 'Internal error.' }); }
});

app.post('/api/generate-excel-workbook', async (req, res) => {
    try {
        const weekNumber = parseInt(req.body.week, 10);
        const db = await connectToDatabase();
        const plan = await db.collection('plans').findOne({ week: weekNumber });
        if (!plan || !plan.data) return res.status(404).send('No data');
        const ws = XLSX.utils.json_to_sheet(plan.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `W${weekNumber}`);
        const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Disposition', `attachment; filename="Weekly_Plan_W${weekNumber}.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buf);
    } catch (e) { res.status(500).send(e.message); }
});

async function generateSingleAIPlan(rowData, week, templateBuffer) {
    const AI_API_KEY = GROQ_API_KEY || GEMINI_API_KEY;
    if (!AI_API_KEY) throw new Error("No AI Key");
    const enseignant = rowData[findKey(rowData, 'Teacher')] || '';
    const classe = rowData[findKey(rowData, 'Class')] || '';
    const matiere = rowData[findKey(rowData, 'Subject')] || '';
    const lecon = rowData[findKey(rowData, 'Lesson')] || '';
    const prompt = `Create a detailed 45min lesson plan for: Subject: ${matiere}, Class: ${classe}, Topic: ${lecon}. Return ONLY JSON with fields: TitreUnite, Methodes, Outils, Objectifs, etapes (list with phase, duree, activite), Ressources, Devoirs, DiffLents, DiffTresPerf, DiffTous.`;
    let aiText = "";
    if (GROQ_API_KEY) {
        const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` }, body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], response_format: { type: "json_object" } }) });
        if (groqResp.ok) aiText = (await groqResp.json()).choices[0].message.content;
    }
    if (!aiText && GEMINI_API_KEY) {
        const model = await resolveGeminiModel(GEMINI_API_KEY);
        const geminiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } }) });
        if (geminiResp.ok) aiText = (await geminiResp.json()).candidates[0].content.parts[0].text;
    }
    const aiData = JSON.parse(aiText);
    const doc = new Docxtemplater(new PizZip(templateBuffer), { paragraphLoop: true, linebreaks: true });
    doc.render({ ...aiData, Semaine: week, Lecon: lecon, Matiere: matiere, Classe: classe, NomEnseignant: enseignant, Deroulement: (aiData.etapes || []).map(e => e.duree).join('\n'), Contenu: (aiData.etapes || []).map(e => `${e.phase}: ${e.activite}`).join('\n\n') });
    return doc.getZip().generate({ type: 'nodebuffer' });
}

app.post('/api/generate-ai-lesson-plan', async (req, res) => {
  try {
    const respTemplate = await fetch(LESSON_TEMPLATE_URL);
    const buf = await generateSingleAIPlan(req.body.rowData, req.body.week, Buffer.from(await respTemplate.arrayBuffer()));
    res.setHeader('Content-Disposition', `attachment; filename="AI_Plan.docx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buf);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/generate-multiple-ai-lesson-plans', async (req, res) => {
    try {
        const { week, rowsData } = req.body;
        const archive = archiver('zip');
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="AI_Plans_W${week}.zip"`);
        archive.pipe(res);
        const respTemplate = await fetch(LESSON_TEMPLATE_URL);
        const templateBuffer = Buffer.from(await respTemplate.arrayBuffer());
        for (const row of rowsData) {
            try {
                const buf = await generateSingleAIPlan(row, week, templateBuffer);
                archive.append(buf, { name: `AI_Plan_${sanitizeForFilename(row[findKey(row, 'Subject')] || 'Plan')}_${row[findKey(row, 'Class')]}.docx` });
            } catch (e) { console.error("Failed for row", e); }
        }
        archive.finalize();
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/vapid-public-key', (req, res) => res.json({ publicKey: VAPID_PUBLIC_KEY }));
app.post('/api/subscribe-push', async (req, res) => {
  try {
    const db = await connectToDatabase();
    await db.collection('pushSubscriptions').updateOne({ username: req.body.username }, { $set: { subscription: req.body.subscription, updatedAt: new Date() } }, { upsert: true });
    res.status(200).json({ message: 'Subscribed.' });
  } catch (e) { res.status(500).send(e.message); }
});

app.post('/api/notify-incomplete-teachers', async (req, res) => {
    try {
        const { week, incompleteTeachers } = req.body;
        const db = await connectToDatabase();
        const subs = await db.collection('pushSubscriptions').find({ username: { $in: Object.keys(incompleteTeachers) } }).toArray();
        for (const sub of subs) {
            webpush.sendNotification(sub.subscription, JSON.stringify({ title: 'Plan Incomplete', body: `W${week} is incomplete.`, data: { url: '/' } })).catch(err => {
                if (err.statusCode === 410) db.collection('pushSubscriptions').deleteOne({ username: sub.username });
            });
        }
        res.json({ success: true });
    } catch (e) { res.status(500).send(e.message); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => { console.log(`🚀 Server running on port ${PORT}`); });
global.appInstance = app;
module.exports = app;
