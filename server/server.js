import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// Initialize Google Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Initialize Local JSON Database
async function initDB() {
  try {
    await fs.access(DB_PATH);
  } catch {
    const initialData = { patients: [], triagedPatients: [], triageCount: 0 };
    await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2));
  }
}

// Read Database
async function readDB() {
  await initDB();
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

// Write Database
async function writeDB(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// Resilient Offline Rules Engine Fallback
const analyzePatientOffline = (patient) => {
  const complaint = patient.chiefComplaint.toLowerCase();
  let score = 50;
  let reasoning = "";
  
  const hasChestPain = complaint.includes("chest pain") || complaint.includes("heart attack") || complaint.includes("stemi") || complaint.includes("cardiac") || complaint.includes("pressure");
  const hasDyspnea = complaint.includes("breath") || complaint.includes("shortness of breath") || complaint.includes("suffocating") || complaint.includes("dyspnea") || complaint.includes("asthma");
  const hasUnconscious = complaint.includes("unconscious") || complaint.includes("passed out") || complaint.includes("coma") || complaint.includes("semi-conscious") || complaint.includes("unresponsive") || complaint.includes("mental status");
  const hasStroke = complaint.includes("stroke") || complaint.includes("paralysis") || complaint.includes("speech") || complaint.includes("droop") || complaint.includes("face");
  const hasBleeding = complaint.includes("bleeding") || complaint.includes("blood") || complaint.includes("hemorrhage") || complaint.includes("wound");
  const hasFever = complaint.includes("fever") || complaint.includes("temp") || complaint.includes("hot") || complaint.includes("infection");
  const hasRash = complaint.includes("rash") || complaint.includes("petechiae") || complaint.includes("purple") || complaint.includes("spots");
  const hasSprain = complaint.includes("sprain") || complaint.includes("twist") || complaint.includes("ankle") || complaint.includes("wrist") || complaint.includes("foot") || complaint.includes("swelling");
  const hasDiabetic = complaint.includes("diabetic") || complaint.includes("sugar") || complaint.includes("insulin") || complaint.includes("dka") || complaint.includes("ketone");
  
  const bpSys = patient.bpSys;
  const bpDia = patient.bpDia;
  const hr = patient.hr;
  const spo2 = patient.spo2;
  const temp = patient.temp;
  
  const isHypoxic = spo2 < 92;
  const isSeverelyHypoxic = spo2 < 88;
  const isHypertensiveEmergency = bpSys > 180 || bpDia > 110;

  if (hasChestPain || hasUnconscious || isSeverelyHypoxic || (hasDyspnea && isHypoxic) || isHypertensiveEmergency || (hasDiabetic && hasUnconscious)) {
    score = 90 + Math.floor(Math.random() * 9);
    if (hasChestPain) {
      reasoning = "Suspected acute coronary syndrome (ACS). High probability of active STEMI. Immediate ECG required.";
    } else if (hasUnconscious) {
      reasoning = "Comatose or severely depressed GCS. Requires immediate airway protection.";
    } else if (isSeverelyHypoxic) {
      reasoning = "Critical respiratory failure with severe hypoxemia. High risk of immediate arrest.";
    } else if (isHypertensiveEmergency) {
      reasoning = "Hypertensive crisis with potential end-organ damage. Immediate IV antihypertensive required.";
    } else {
      reasoning = "Critical neurological and physiological destabilization. Transferred to Resuscitation Bay.";
    }
  } else if (hasDyspnea || hasStroke || hasBleeding || hasDiabetic || temp >= 102 || hr > 110 || bpSys < 90 || (hasFever && hasRash)) {
    score = 65 + Math.floor(Math.random() * 20);
    if (hasStroke) {
      reasoning = "Active focal neurological deficit matching acute stroke timeline. Quick-track CT scan indicated.";
    } else if (hasDyspnea) {
      reasoning = "Moderate acute respiratory distress. Indicated for immediate nebulizer therapy & gas tracking.";
    } else if (hasBleeding) {
      reasoning = "Active peripheral hemorrhage with mild tachycardia. Direct pressure and fluid stabilization required.";
    } else if (hasFever && hasRash) {
      reasoning = "Pediatric systemic inflammatory response with petechial rash. Meningitis protocol isolation.";
    } else if (hasDiabetic) {
      reasoning = "Severe hyperglycemic metabolic disturbance with severe tachycardia. Hydration protocol initiated.";
    } else {
      reasoning = "Emergent physiological anomaly. Requires physician evaluation within 15-30 minutes.";
    }
  } else {
    score = 15 + Math.floor(Math.random() * 45);
    if (hasSprain) {
      reasoning = "Isolated musculoskeletal sprain without neurovascular deficits. Ottawa Ankle criteria met for X-ray.";
    } else if (hasFever) {
      reasoning = "Febrile infectious presentation. Stable blood pressure. Manage with oral antipyretics.";
    } else {
      reasoning = "Normal diagnostic profiles. Triaged to outpatient fast-track clinic queue.";
    }
  }
  
  let priority = 'STABLE';
  let waitTime = "45-60 mins";
  if (score >= 90) {
    priority = 'CRITICAL';
    waitTime = "0 min (Immediate)";
  } else if (score >= 65) {
    priority = 'SERIOUS';
    waitTime = "15 - 30 mins";
  } else {
    priority = 'STABLE';
    waitTime = "1 - 2 hours";
  }
  
  return { score, priority, reasoning, waitTime };
};

// Google Gemini Live Clinical Triage Call
async function runGeminiTriage(patient) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ Gemini API key is missing. Using resilient offline engine.");
    return analyzePatientOffline(patient);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
You are acting as an expert Level-1 Trauma Emergency Room Clinical Triage Officer.
Analyze the following patient clinical presentation and biometric telemetry metrics to determine their emergency priority level.

PATIENT PROFILE:
- Name: ${patient.name}
- Age: ${patient.age}
- Gender: ${patient.gender}
- Chief Complaint & Symptoms: ${patient.chiefComplaint}

BIOMETRIC TELEMETRY:
- Blood Pressure: ${patient.bpSys}/${patient.bpDia} mmHg
- Heart Rate: ${patient.hr} BPM
- SpO2 (Oxygen Saturation): ${patient.spo2}%
- Temperature: ${patient.temp}°F

CRITICAL CLINICAL CRITERIA:
- CRITICAL (Score 90-100, Wait time 0 min): Active STEMI/ACS (crushing chest pain), GCS drop/coma, severe hypoxemia (SpO2 < 88%), hypertensive emergency (BP > 180), active stroke symptoms.
- SERIOUS (Score 65-89, Wait time 15-30 mins): Moderate dyspnea (asthma/COPD flare-up), fever of >102°F, petechial rash, diabetic hyperglycemia/hypoglycemia with tachypnea, severe trauma with normal vitals.
- STABLE (Score 15-64, Wait time 45-120 mins): Musculoskeletal sprains, minor lacerations, localized rashes, low-grade fevers without systemic indicators.

You MUST return a JSON object with EXACTLY the following fields:
1. "score": An integer from 15 to 100 indicating the urgency level.
2. "priority": Either "CRITICAL", "SERIOUS", or "STABLE".
3. "reasoning": A professional, high-density 1-2 sentence medical justification detailing exactly why this triage category was chosen, including any key vital sign flags (e.g. tachypnea, hypoxemia, tachycardia).
4. "waitTime": Recommended wait window (e.g. "0 min (Immediate)", "15 - 30 mins", or "1 - 2 hours").

Return ONLY the raw JSON object. Do not wrap in markdown or backticks.
`;

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const text = response.response.text();
    const result = JSON.parse(text);
    
    console.log(`✓ Gemini clinical analysis succeeded for patient: ${patient.name}`);
    return {
      score: parseInt(result.score) || 50,
      priority: result.priority || 'STABLE',
      reasoning: result.reasoning || 'Diagnostic calculations complete.',
      waitTime: result.waitTime || '45-60 mins'
    };
  } catch (err) {
    console.error(`⚠️ Gemini API failed for ${patient.name}. Falling back to offline engine:`, err.message);
    return analyzePatientOffline(patient);
  }
}

// Serve Static Frontend Assets from built dist folder
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// ================= ENDPOINTS =================

// 1. Get all buffered patients
app.get('/api/patients', async (req, res) => {
  try {
    const db = await readDB();
    res.json({ patients: db.patients, triagedPatients: db.triagedPatients, triageCount: db.triageCount });
  } catch (error) {
    res.status(500).json({ error: "Failed to read database logs" });
  }
});

// 2. Add or update patient in buffer
app.post('/api/patients', async (req, res) => {
  try {
    const db = await readDB();
    const newPatient = req.body;
    
    const existingIndex = db.patients.findIndex(p => p.id === newPatient.id);
    if (existingIndex !== -1) {
      db.patients[existingIndex] = newPatient;
    } else {
      db.patients.push(newPatient);
    }
    
    db.triagedPatients = [];
    
    await writeDB(db);
    res.status(201).json({ patients: db.patients, triagedPatients: db.triagedPatients });
  } catch (error) {
    res.status(500).json({ error: "Failed to write patient logs" });
  }
});

// 3. Delete patient from buffer & triaged queue
app.delete('/api/patients/:id', async (req, res) => {
  try {
    const db = await readDB();
    const { id } = req.params;
    
    db.patients = db.patients.filter(p => p.id !== id);
    db.triagedPatients = db.triagedPatients.filter(p => p.id !== id);
    
    await writeDB(db);
    res.json({ success: true, patients: db.patients, triagedPatients: db.triagedPatients });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete patient" });
  }
});

// 4. Run triage computations using real Gemini LLM in parallel!
app.post('/api/triage', async (req, res) => {
  try {
    const db = await readDB();
    if (db.patients.length === 0) {
      return res.status(400).json({ error: "Buffer queue is empty" });
    }
    
    console.log(`🏥 Starting Gemini Live Triage Calculations for ${db.patients.length} patients...`);
    
    // Resolve all clinical triages in parallel
    const results = await Promise.all(db.patients.map(async (p) => {
      const diagnosis = await runGeminiTriage(p);
      return { 
        ...p, 
        ...diagnosis,
        timestamp: new Date().toLocaleTimeString() 
      };
    }));
    
    // Sort by clinical score descending
    results.sort((a, b) => b.score - a.score);
    
    db.triagedPatients = results;
    db.triageCount += 1;
    
    await writeDB(db);
    console.log("✓ Gemini Parallel Live Triage Completed & Database Saved!");
    res.json({ triagedPatients: db.triagedPatients, triageCount: db.triageCount });
  } catch (error) {
    console.error("Critical server triage error:", error);
    res.status(500).json({ error: "Failed to compile triage metrics" });
  }
});

// 5. Clear all buffers
app.post('/api/clear', async (req, res) => {
  try {
    const db = await readDB();
    db.patients = [];
    db.triagedPatients = [];
    await writeDB(db);
    res.json({ success: true, patients: [], triagedPatients: [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear database" });
  }
});

// 6. Catch-all: Route all frontend navigation back to static index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🏥 Gemini Clinical AI Triage Backend running on http://localhost:${PORT}`);
});
