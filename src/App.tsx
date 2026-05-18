import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Plus, 
  Trash2, 
  Clock, 
  Volume2, 
  VolumeX, 
  Heart, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Thermometer, 
  Sparkles, 
  User, 
  Gauge, 
  Wind, 
  Activity as HeartIcon,
  Database,
  Layers,
  FileText
} from 'lucide-react';

// Patient Interface
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  bpSys: number;
  bpDia: number;
  hr: number;
  spo2: number;
  temp: number;
  score?: number;
  priority?: 'CRITICAL' | 'SERIOUS' | 'STABLE';
  reasoning?: string;
  waitTime?: string;
  timestamp?: string;
}

export default function App() {
  // Application State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [triagedPatients, setTriagedPatients] = useState<Patient[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [activeFormIndex, setActiveFormIndex] = useState<number | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    chiefComplaint: '',
    bpSys: '120',
    bpDia: '80',
    hr: '75',
    spo2: '98',
    temp: '98.6'
  });

  // System Stats State
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());
  const [triageCount, setTriageCount] = useState(0);

  // Sound Synthesizer Utility
  const playSound = (type: 'beep' | 'success' | 'alert' | 'click' | 'delete') => {
    if (!audioEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'beep') {
        // High pitch diagnostic double beep
        osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
        
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.frequency.setValueAtTime(987.77, ctx.currentTime);
          gain2.gain.setValueAtTime(0.04, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.08);
        }, 120);
      } else if (type === 'success') {
        // Futuristic success chime
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'alert') {
        // Critical diagnostic alarm sweep
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'click') {
        // Subtle cybernetic click
        osc.frequency.setValueAtTime(1500, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.start();
        osc.stop(ctx.currentTime + 0.03);
      } else if (type === 'delete') {
        // Bass sweep for deletion
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      console.warn("AudioContext block: ", e);
    }
  };

  // Clock Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Loading Steps Sequence
  const analysisLogs = [
    "PARSING NATURAL LANGUAGE CLINICAL COMPLAINT...",
    "CROSS-REFERENCING PATIENT DEMOGRAPHICS...",
    "EXTRACTING VITAL ANOMALIES & CARDIAC RATIOS...",
    "EVALUATING RESPIRATORY FUNCTION & SpO2 METRICS...",
    "COMPUTING PATHOLOGICAL SCORE RATINGS...",
    "DETERMINING CLINICAL QUEUE WAITING THRESHOLDS...",
    "COMPILE COMPLETED. SYSTOLIC DEVIATIONS SECURED."
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnalyzing) {
      setAnalysisStep(0);
      const stepDuration = 350; // Total 7 steps * 350ms ≈ 2.45s
      const runStep = (idx: number) => {
        if (idx < analysisLogs.length) {
          setAnalysisStep(idx);
          playSound('beep');
          timer = setTimeout(() => runStep(idx + 1), stepDuration);
        } else {
          // Finish Analysis
          setIsAnalyzing(false);
          // Run actual triage calculations
          const results = patients.map(p => {
            const tr = analyzePatient(p);
            return { ...p, ...tr };
          });
          // Sort results by score descending
          results.sort((a, b) => (b.score || 0) - (a.score || 0));
          setTriagedPatients(results);
          setTriageCount(prev => prev + 1);
          
          // Play final notification depending on if there are critical patients
          const hasCritical = results.some(p => p.priority === 'CRITICAL');
          if (hasCritical) {
            playSound('alert');
          } else {
            playSound('success');
          }
        }
      };
      timer = setTimeout(() => runStep(0), 100);
    }
    return () => clearTimeout(timer);
  }, [isAnalyzing, patients]);

  // Demo Patients Array
  const demoPatients: Patient[] = [
    {
      id: 'demo-1',
      name: 'Arthur Vance',
      age: 64,
      gender: 'Male',
      chiefComplaint: 'Crushing chest pain radiating down left arm. Shortness of breath, diaphoresis. Symptoms started 45 minutes ago and are getting progressively worse.',
      bpSys: 90,
      bpDia: 55,
      hr: 115,
      spo2: 89,
      temp: 97.8
    },
    {
      id: 'demo-2',
      name: 'Sarah Jenkins',
      age: 22,
      gender: 'Female',
      chiefComplaint: 'Altered mental status, deep rapid ventilation (suspected Kussmaul respirations), fruity breath odor. Found semi-conscious by roommate, diabetic history.',
      bpSys: 105,
      bpDia: 70,
      hr: 122,
      spo2: 95,
      temp: 99.1
    },
    {
      id: 'demo-3',
      name: 'Marcus Brody',
      age: 8,
      gender: 'Male',
      chiefComplaint: 'High fever of 103.8 F for 2 days. Presenting with stiff neck, photophobia, and a purple petechial rash on the stomach and legs. Lethargic.',
      bpSys: 100,
      bpDia: 60,
      hr: 130,
      spo2: 97,
      temp: 103.8
    },
    {
      id: 'demo-4',
      name: 'Chloe Miller',
      age: 31,
      gender: 'Female',
      chiefComplaint: 'Severe inversion injury to left ankle after slipping on ice. Swelling, visible ecchymosis, unable to bear weight. Sensation intact.',
      bpSys: 118,
      bpDia: 74,
      hr: 78,
      spo2: 99,
      temp: 98.4
    }
  ];

  // Load Demo Data
  const handleLoadDemo = () => {
    playSound('success');
    setPatients(demoPatients);
    // Clear triage results initially
    setTriagedPatients([]);
    
    // Auto-trigger Triage Scan
    setIsAnalyzing(true);
  };

  // Diagnostic Triage Logic
  const analyzePatient = (patient: Patient): Partial<Patient> => {
    const complaint = patient.chiefComplaint.toLowerCase();
    let score = 50;
    let reasoning = "";
    
    // Core Clinical Indicators
    const hasChestPain = complaint.includes("chest pain") || complaint.includes("heart attack") || complaint.includes("stemi") || complaint.includes("cardiac") || complaint.includes("pressure");
    const hasDyspnea = complaint.includes("breath") || complaint.includes("shortness of breath") || complaint.includes("suffocating") || complaint.includes("dyspnea") || complaint.includes("asthma");
    const hasUnconscious = complaint.includes("unconscious") || complaint.includes("passed out") || complaint.includes("coma") || complaint.includes("semi-conscious") || complaint.includes("unresponsive") || complaint.includes("mental status");
    const hasStroke = complaint.includes("stroke") || complaint.includes("paralysis") || complaint.includes("speech") || complaint.includes("droop") || complaint.includes("face");
    const hasBleeding = complaint.includes("bleeding") || complaint.includes("blood") || complaint.includes("hemorrhage") || complaint.includes("wound");
    const hasFever = complaint.includes("fever") || complaint.includes("temp") || complaint.includes("hot") || complaint.includes("infection");
    const hasRash = complaint.includes("rash") || complaint.includes("petechiae") || complaint.includes("purple") || complaint.includes("spots");
    const hasSprain = complaint.includes("sprain") || complaint.includes("twist") || complaint.includes("ankle") || complaint.includes("wrist") || complaint.includes("foot") || complaint.includes("swelling");
    const hasDiabetic = complaint.includes("diabetic") || complaint.includes("sugar") || complaint.includes("insulin") || complaint.includes("dka") || complaint.includes("ketone");
    
    // Vital Sign Deviations
    const bpSys = patient.bpSys;
    const bpDia = patient.bpDia;
    const hr = patient.hr;
    const spo2 = patient.spo2;
    const temp = patient.temp;
    
    const isHypoxic = spo2 < 92;
    const isSeverelyHypoxic = spo2 < 88;
    const isHypertensiveEmergency = bpSys > 180 || bpDia > 110;

    // Clinical Triage Scoring Grid (1-100)
    if (hasChestPain || hasUnconscious || isSeverelyHypoxic || (hasDyspnea && isHypoxic) || isHypertensiveEmergency || (hasDiabetic && hasUnconscious)) {
      score = 90 + Math.floor(Math.random() * 9);
      if (hasChestPain) {
        reasoning = "Suspected acute coronary syndrome (ACS). High probability of active STEMI. Immediate ECG required.";
      } else if (hasUnconscious) {
        reasoning = "Comatose or severely depressed Glasgow Coma Scale (GCS). Requires immediate airway protection.";
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
    
    // Sort Priority Badge & Wait Time
    let priority: 'CRITICAL' | 'SERIOUS' | 'STABLE' = 'STABLE';
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

  // Submit Patient Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('click');

    // Validation
    if (!formData.name || !formData.age || !formData.chiefComplaint) {
      alert("Please fill in Name, Age, and Chief Complaint fields.");
      return;
    }

    const newPatient: Patient = {
      id: activeFormIndex !== null ? patients[activeFormIndex].id : Date.now().toString(),
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      chiefComplaint: formData.chiefComplaint,
      bpSys: parseInt(formData.bpSys) || 120,
      bpDia: parseInt(formData.bpDia) || 80,
      hr: parseInt(formData.hr) || 75,
      spo2: parseInt(formData.spo2) || 98,
      temp: parseFloat(formData.temp) || 98.6
    };

    if (activeFormIndex !== null) {
      // Edit mode
      const updated = [...patients];
      updated[activeFormIndex] = newPatient;
      setPatients(updated);
      setActiveFormIndex(null);
    } else {
      // Add mode
      setPatients(prev => [...prev, newPatient]);
    }

    // Reset Form
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      chiefComplaint: '',
      bpSys: '120',
      bpDia: '80',
      hr: '75',
      spo2: '98',
      temp: '98.6'
    });

    // Clear previous triaged board to let them re-trigger
    setTriagedPatients([]);
  };

  // Edit Patient
  const handleEdit = (idx: number) => {
    playSound('click');
    const p = patients[idx];
    setFormData({
      name: p.name,
      age: p.age.toString(),
      gender: p.gender,
      chiefComplaint: p.chiefComplaint,
      bpSys: p.bpSys.toString(),
      bpDia: p.bpDia.toString(),
      hr: p.hr.toString(),
      spo2: p.spo2.toString(),
      temp: p.temp.toString()
    });
    setActiveFormIndex(idx);
  };

  // Delete Patient
  const handleDelete = (id: string) => {
    playSound('delete');
    
    // Find the element to apply slide-out animation before removal
    const el = document.getElementById(`patient-card-${id}`);
    if (el) {
      el.classList.add('patient-slide-out');
      setTimeout(() => {
        setPatients(prev => prev.filter(p => p.id !== id));
        setTriagedPatients(prev => prev.filter(p => p.id !== id));
      }, 300);
    } else {
      setPatients(prev => prev.filter(p => p.id !== id));
      setTriagedPatients(prev => prev.filter(p => p.id !== id));
    }
  };

  // Trigger Live Triage Calculation
  const handleRunTriage = () => {
    if (patients.length === 0) {
      playSound('alert');
      return;
    }
    playSound('click');
    setIsAnalyzing(true);
  };

  // Helper count badges
  const criticalCount = triagedPatients.filter(p => p.priority === 'CRITICAL').length;
  const seriousCount = triagedPatients.filter(p => p.priority === 'SERIOUS').length;
  const stableCount = triagedPatients.filter(p => p.priority === 'STABLE').length;

  return (
    <div className="relative h-screen w-screen bg-[#050814] overflow-hidden flex flex-col select-none font-sans border border-cyan-500/20 rounded shadow-inner">
      {/* CRT Grid & scanline overlays */}
      <div className="absolute inset-0 medical-grid opacity-[0.25] pointer-events-none z-0"></div>
      <div className="absolute inset-0 medical-grid-fine opacity-[0.4] pointer-events-none z-0"></div>
      <div className="absolute inset-0 scanline pointer-events-none z-10"></div>
      <div className="absolute inset-0 crt-overlay pointer-events-none z-40"></div>

      {/* ================= HEADER SECTION ================= */}
      <header className="h-[64px] border-b border-cyan-500/20 bg-[#090f23]/80 backdrop-blur flex items-center justify-between px-6 z-20 relative select-none">
        {/* Logo and ECG line */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded border border-red-500/30 flex items-center justify-center glow-text-critical">
            <Activity className="w-6 h-6 text-[#ff2d55] animate-pulse-heart" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-display font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-400 to-[#00d2ff] glow-text-cyan">
              AI TRIAGE SYSTEM
            </h1>
            <span className="font-mono text-[9px] text-cyan-400/60 tracking-widest font-semibold uppercase -mt-0.5">
              SECURE CLINICAL DECISION COMMAND v4.2
            </span>
          </div>
        </div>

        {/* ECG Line Vector Animation */}
        <div className="flex-1 max-w-xl mx-8 hidden lg:flex items-center relative h-full">
          <svg className="w-full h-12 stroke-cyan-500/30" viewBox="0 0 1000 100" preserveAspectRatio="none">
            <path
              d="M0,50 L250,50 L260,35 L270,65 L280,50 L400,50 L410,15 L420,85 L430,45 L440,55 L450,50 L600,50 L610,35 L620,65 L630,50 L750,50 L760,10 L770,90 L780,45 L790,55 L800,50 L1000,50"
              fill="none"
              strokeWidth="2.5"
              className="stroke-[#00d2ff]"
            />
            <path
              d="M0,50 L250,50 L260,35 L270,65 L280,50 L400,50 L410,15 L420,85 L430,45 L440,55 L450,50 L600,50 L610,35 L620,65 L630,50 L750,50 L760,10 L770,90 L780,45 L790,55 L800,50 L1000,50"
              fill="none"
              strokeWidth="2.5"
              className="stroke-[#00f5a0] animate-ecg"
            />
          </svg>
        </div>

        {/* Control Buttons (Load Demo & Audio toggle) */}
        <div className="flex items-center gap-4">
          {/* Audio toggle button */}
          <button
            onClick={() => {
              setAudioEnabled(prev => !prev);
              setTimeout(() => playSound('click'), 50);
            }}
            className={`p-2 rounded border transition-all duration-300 flex items-center justify-center cursor-pointer ${
              audioEnabled 
                ? 'bg-cyan-500/10 border-cyan-500/50 text-[#00d2ff] glow-text-cyan' 
                : 'bg-transparent border-cyan-500/20 text-cyan-500/40 hover:text-cyan-500/70 hover:border-cyan-500/40'
            }`}
            title={audioEnabled ? "Disable Sonic HUD" : "Enable Sonic HUD"}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Load Demo Patients Button */}
          <button
            onClick={handleLoadDemo}
            className="px-4 py-1.5 font-display text-xs font-bold tracking-wider rounded border border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00d2ff] hover:text-white flex items-center gap-2 cursor-pointer transition-all duration-200 glass-panel-hover"
          >
            <Database className="w-3.5 h-3.5" />
            LOAD DEMO PATIENTS
          </button>
        </div>
      </header>

      {/* ================= MAIN APPLICATION FRAME ================= */}
      <main className="flex-1 flex overflow-hidden z-20 relative">
        
        {/* ----------------- LEFT PANEL (40%): INPUT & ADDED LIST ----------------- */}
        <section className="w-[40%] border-r border-cyan-500/15 bg-[#070b19]/60 backdrop-blur-md flex flex-col overflow-hidden">
          
          {/* Patient Form Container */}
          <div className="p-5 border-b border-cyan-500/10 shrink-0 select-none">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <h2 className="font-display font-bold tracking-widest text-sm text-cyan-400 uppercase">
                  {activeFormIndex !== null ? 'EDIT PATIENT PROFILE' : 'ADD NEW PATIENT'}
                </h2>
              </div>
              {activeFormIndex !== null && (
                <button 
                  onClick={() => {
                    setActiveFormIndex(null);
                    setFormData({
                      name: '', age: '', gender: 'Male', chiefComplaint: '',
                      bpSys: '120', bpDia: '80', hr: '75', spo2: '98', temp: '98.6'
                    });
                  }}
                  className="font-mono text-[10px] text-red-400 hover:text-red-300 font-bold border border-red-500/30 px-2 py-0.5 rounded bg-red-500/5 cursor-pointer"
                >
                  CANCEL EDIT
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Name, Age, Gender */}
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-6">
                  <label className="block font-display text-[9px] font-bold tracking-wider text-cyan-500/60 uppercase mb-1">
                    PATIENT NAME
                  </label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2 w-3.5 h-3.5 text-cyan-500/40" />
                    <input
                      type="text"
                      placeholder="e.g. Arthur Vance"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#080d21] border border-cyan-500/20 rounded pl-8 pr-3 py-1.5 font-sans text-sm text-white placeholder-cyan-500/30 input-focus-glow"
                    />
                  </div>
                </div>

                <div className="col-span-3">
                  <label className="block font-display text-[9px] font-bold tracking-wider text-cyan-500/60 uppercase mb-1">
                    AGE
                  </label>
                  <input
                    type="number"
                    placeholder="Yrs"
                    min="1"
                    max="125"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-[#080d21] border border-cyan-500/20 rounded px-3 py-1.5 font-sans text-sm text-white placeholder-cyan-500/30 input-focus-glow"
                  />
                </div>

                <div className="col-span-3">
                  <label className="block font-display text-[9px] font-bold tracking-wider text-cyan-500/60 uppercase mb-1">
                    GENDER
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-[#080d21] border border-cyan-500/20 rounded px-2 py-1.5 font-sans text-sm text-white input-focus-glow"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Chief Complaint */}
              <div>
                <label className="block font-display text-[9px] font-bold tracking-wider text-cyan-500/60 uppercase mb-1">
                  CHIEF COMPLAINT & SYMPTOM PROFILE
                </label>
                <div className="relative">
                  <FileText className="absolute left-2.5 top-2.5 w-4 h-4 text-cyan-500/40" />
                  <textarea
                    placeholder="Enter detailed presentation (e.g. crushing substernal chest pain radiating to left shoulder, labored breathing...)"
                    rows={2}
                    value={formData.chiefComplaint}
                    onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                    className="w-full bg-[#080d21] border border-cyan-500/20 rounded pl-9 pr-3 py-2 font-sans text-sm text-white placeholder-cyan-500/30 input-focus-glow resize-none"
                  />
                </div>
              </div>

              {/* Row 3: Vital Signs Section */}
              <div className="border border-cyan-500/10 rounded p-3 bg-[#090f23]/40">
                <div className="flex items-center gap-1.5 mb-2.5 pb-1.5 border-b border-cyan-500/5">
                  <HeartIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-display text-[10px] font-bold tracking-wider text-cyan-400 uppercase">
                    BIOMETRIC TELEMETRY (VITALS)
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-2.5">
                  <div>
                    <label className="block font-display text-[8px] font-bold tracking-wider text-cyan-500/60 uppercase mb-1 flex items-center gap-0.5">
                      <Gauge className="w-2.5 h-2.5" /> BP (SYS/DIA)
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Sys"
                        value={formData.bpSys}
                        onChange={(e) => setFormData({ ...formData, bpSys: e.target.value })}
                        className="w-1/2 bg-[#080d21] border border-cyan-500/20 rounded text-center py-1 font-mono text-xs text-white placeholder-cyan-500/20 input-focus-glow"
                      />
                      <span className="text-cyan-500/40 font-mono text-xs">/</span>
                      <input
                        type="text"
                        placeholder="Dia"
                        value={formData.bpDia}
                        onChange={(e) => setFormData({ ...formData, bpDia: e.target.value })}
                        className="w-1/2 bg-[#080d21] border border-cyan-500/20 rounded text-center py-1 font-mono text-xs text-white placeholder-cyan-500/20 input-focus-glow"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-display text-[8px] font-bold tracking-wider text-cyan-500/60 uppercase mb-1 flex items-center gap-0.5">
                      <Heart className="w-2.5 h-2.5 text-red-400" /> HR (BPM)
                    </label>
                    <input
                      type="number"
                      placeholder="BPM"
                      value={formData.hr}
                      onChange={(e) => setFormData({ ...formData, hr: e.target.value })}
                      className="w-full bg-[#080d21] border border-cyan-500/20 rounded text-center py-1 font-mono text-xs text-white placeholder-cyan-500/20 input-focus-glow"
                    />
                  </div>

                  <div>
                    <label className="block font-display text-[8px] font-bold tracking-wider text-cyan-500/60 uppercase mb-1 flex items-center gap-0.5">
                      <Wind className="w-2.5 h-2.5 text-blue-400" /> SpO2 (%)
                    </label>
                    <input
                      type="number"
                      placeholder="%"
                      value={formData.spo2}
                      onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
                      className="w-full bg-[#080d21] border border-cyan-500/20 rounded text-center py-1 font-mono text-xs text-white placeholder-cyan-500/20 input-focus-glow"
                    />
                  </div>

                  <div>
                    <label className="block font-display text-[8px] font-bold tracking-wider text-cyan-500/60 uppercase mb-1 flex items-center gap-0.5">
                      <Thermometer className="w-2.5 h-2.5 text-amber-400" /> TEMP (°F)
                    </label>
                    <input
                      type="text"
                      placeholder="°F"
                      value={formData.temp}
                      onChange={(e) => setFormData({ ...formData, temp: e.target.value })}
                      className="w-full bg-[#080d21] border border-cyan-500/20 rounded text-center py-1 font-mono text-xs text-white placeholder-cyan-500/20 input-focus-glow"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Triage Buttons */}
              <div className="grid grid-cols-12 gap-3">
                <button
                  type="submit"
                  className="col-span-5 py-2 px-3 bg-cyan-600/10 border border-cyan-500/40 text-cyan-400 rounded hover:bg-cyan-500/20 font-display font-bold tracking-widest text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {activeFormIndex !== null ? 'UPDATE PROFILE' : 'BUFFER PATIENT'}
                </button>

                <button
                  type="button"
                  onClick={handleRunTriage}
                  disabled={patients.length === 0 || isAnalyzing}
                  className={`col-span-7 py-2 px-4 rounded text-white font-display font-black tracking-widest text-xs uppercase cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 ${
                    patients.length === 0 || isAnalyzing
                      ? 'bg-red-950/20 border border-red-900/30 text-red-500/40 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-[#ff2d55] text-white triage-button-pulse border border-[#ff2d55]/60 hover:from-[#ff2d55] hover:to-red-600'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  TRIAGE DIAGNOSTIC NOW
                </button>
              </div>
            </form>
          </div>

          {/* Added Patients List */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#050811]/40">
            <div className="px-5 py-2.5 border-b border-cyan-500/5 bg-[#090f23]/30 flex items-center justify-between shrink-0">
              <span className="font-display font-bold tracking-wider text-[10px] text-cyan-500/80 uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                BUFFERED CLINICAL LOGS ({patients.length})
              </span>
              {patients.length > 0 && (
                <button
                  onClick={() => {
                    playSound('delete');
                    setPatients([]);
                    setTriagedPatients([]);
                  }}
                  className="font-mono text-[9px] text-red-400/60 hover:text-red-400 tracking-wider flex items-center gap-1 uppercase transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> CLEAR BUFFER
                </button>
              )}
            </div>

            {/* Scrollable Patient Cards Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 pr-2.5 relative">
              {patients.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-10 select-none">
                  <div className="relative mb-2">
                    <Heart className="w-8 h-8 text-cyan-400/40" />
                    <div className="absolute inset-0 w-8 h-8 rounded-full border border-cyan-500/10 animate-ping"></div>
                  </div>
                  <p className="font-display text-[10px] tracking-widest text-cyan-400 uppercase">NO ACTIVE PATIENTS BUFFERED</p>
                  <p className="font-sans text-[11px] text-slate-400/80 mt-1 max-w-[220px]">
                    Use the form above to add a patient profile or click 'LOAD DEMO PATIENTS' to view high-priority cardiac/diabetic emergencies.
                  </p>
                </div>
              ) : (
                patients.map((p, idx) => (
                  <div
                    key={p.id}
                    id={`patient-card-${p.id}`}
                    className="glass-panel rounded p-3 relative layered-stack-card overflow-hidden patient-slide-in border-l-2 border-l-[#00d2ff]/40"
                    style={{ animationDelay: `${idx * 0.08}s` }}
                  >
                    {/* Tiny background glow */}
                    <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-cyan-500/5 blur-xl pointer-events-none"></div>
                    
                    {/* Header info */}
                    <div className="flex items-start justify-between select-none">
                      <div>
                        <h3 className="font-display text-sm font-bold text-white tracking-wide">{p.name}</h3>
                        <span className="font-mono text-[10px] text-cyan-400/70 uppercase">
                          AGE: {p.age} • GENDER: {p.gender}
                        </span>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(idx)}
                          className="p-1 rounded text-cyan-400 hover:text-white hover:bg-cyan-500/10 transition-colors cursor-pointer border border-cyan-500/10"
                          title="Edit Patient"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1 rounded text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border border-red-500/10"
                          title="Delete Patient"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Chief Complaint snippet */}
                    <p className="font-sans text-xs text-slate-300 line-clamp-2 mt-2 bg-[#090f23]/40 p-1.5 rounded border border-cyan-500/5 select-text">
                      <span className="font-display font-bold text-[9px] tracking-wider text-cyan-400 uppercase mr-1 select-none">SYMPTOMS:</span>
                      {p.chiefComplaint}
                    </p>

                    {/* Vitals Telemetry Row */}
                    <div className="grid grid-cols-4 gap-1.5 mt-2.5 border-t border-cyan-500/5 pt-2">
                      <div className="bg-[#040813] border border-cyan-500/10 p-1 rounded text-center">
                        <span className="block font-display text-[7px] text-cyan-500/60 font-semibold tracking-widest uppercase">SYS/DIA</span>
                        <span className="font-mono text-[10px] text-white font-bold">{p.bpSys}/{p.bpDia}</span>
                      </div>
                      <div className="bg-[#040813] border border-cyan-500/10 p-1 rounded text-center">
                        <span className="block font-display text-[7px] text-cyan-500/60 font-semibold tracking-widest uppercase">HR (BPM)</span>
                        <span className={`font-mono text-[10px] font-bold ${(p.hr > 100 || p.hr < 55) ? 'text-[#ff2d55] font-black' : 'text-[#00f5a0]'}`}>{p.hr}</span>
                      </div>
                      <div className="bg-[#040813] border border-cyan-500/10 p-1 rounded text-center">
                        <span className="block font-display text-[7px] text-cyan-500/60 font-semibold tracking-widest uppercase">SpO2 (%)</span>
                        <span className={`font-mono text-[10px] font-bold ${p.spo2 < 93 ? 'text-[#ff2d55] font-black' : 'text-[#00d2ff]'}`}>{p.spo2}%</span>
                      </div>
                      <div className="bg-[#040813] border border-cyan-500/10 p-1 rounded text-center">
                        <span className="block font-display text-[7px] text-cyan-500/60 font-semibold tracking-widest uppercase">TEMP (°F)</span>
                        <span className={`font-mono text-[10px] font-bold ${(p.temp >= 101 || p.temp < 97) ? 'text-[#ffb700]' : 'text-white'}`}>{p.temp}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ----------------- RIGHT PANEL (60%): LIVE TRIAGE RESULTS ----------------- */}
        <section className="w-[60%] bg-[#050812]/90 backdrop-blur flex flex-col overflow-hidden relative">
          
          {/* Header Panel */}
          <div className="px-6 py-4 border-b border-cyan-500/15 shrink-0 bg-[#090f23]/40 flex items-center justify-between z-10 relative select-none">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff2d55]"></span>
              </span>
              <h2 className="font-display font-black tracking-widest text-sm text-white uppercase">
                EMERGENCY PRIORITY QUEUEBOARD
              </h2>
            </div>
            
            {/* Live Telemetry Summary */}
            {triagedPatients.length > 0 && !isAnalyzing && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2 py-0.5 border border-red-500/20 bg-red-500/5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff2d55] animate-pulse"></span>
                  <span className="font-mono text-[10px] text-[#ff2d55] font-black">CRITICAL: {criticalCount}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 border border-amber-500/20 bg-amber-500/5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffb700] animate-pulse"></span>
                  <span className="font-mono text-[10px] text-[#ffb700] font-black">SERIOUS: {seriousCount}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 border border-green-500/20 bg-green-500/5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse"></span>
                  <span className="font-mono text-[10px] text-[#00f5a0] font-black">STABLE: {stableCount}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Area Body Content */}
          <div className="flex-1 overflow-y-auto p-6 pr-4 relative">
            
            {/* State A: Analyzing Spinner */}
            {isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center py-20 select-none">
                {/* Rotating Cross SVG Icon */}
                <div className="relative mb-6 select-none">
                  <div className="w-20 h-20 rounded-full border-2 border-cyan-500/10 flex items-center justify-center">
                    <svg className="w-12 h-12 text-[#ff2d55] rotate-cross" viewBox="0 0 100 100">
                      {/* Medical Cross Path */}
                      <path 
                        d="M38,15 L62,15 L62,38 L85,38 L85,62 L62,62 L62,85 L38,85 L38,62 L15,62 L15,38 L38,38 Z" 
                        fill="currentColor"
                        className="filter drop-shadow-[0_0_10px_rgba(255,45,85,0.7)]" 
                      />
                    </svg>
                  </div>
                  {/* Outer spinning diagnostic rings */}
                  <div className="absolute inset-n2 border border-cyan-500/30 border-t-transparent border-b-transparent rounded-full animate-spin duration-[3000ms]"></div>
                  <div className="absolute -inset-4 border border-cyan-400/15 border-l-transparent border-r-transparent rounded-full animate-spin duration-[6000ms] reverse"></div>
                </div>

                <h3 className="font-display font-black text-lg tracking-widest text-[#00d2ff] glow-text-cyan uppercase">
                  AI CLINICAL ANALYSIS IN PROGRESS
                </h3>
                <span className="font-mono text-[10px] text-cyan-400/40 tracking-widest uppercase mt-1">
                  PARSING PARAMETERS IN REALTIME
                </span>
                
                {/* Console scanlog display */}
                <div className="mt-8 w-full max-w-lg bg-[#070c1e] border border-cyan-500/20 rounded p-4 font-mono text-[11px] text-cyan-400/80 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-500/30 animate-pulse"></div>
                  <div className="space-y-1 select-none">
                    {analysisLogs.slice(0, analysisStep + 1).map((log, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[#00f5a0] font-bold">✓</span>
                        <span className={i === analysisStep ? 'text-white font-bold glow-text-cyan' : 'text-cyan-400/50'}>
                          {log}
                        </span>
                      </div>
                    ))}
                    {analysisStep < analysisLogs.length - 1 && (
                      <div className="flex items-center gap-1.5 animate-pulse text-[#ff2d55]">
                        <span className="inline-block w-1.5 h-3.5 bg-[#ff2d55]"></span>
                        <span>ANALYZING CLINICAL NODES...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : triagedPatients.length === 0 ? (
              
              /* State B: Empty State (Heartbeat Flatline) */
              <div className="h-full flex flex-col items-center justify-center select-none py-20">
                <div className="w-full max-w-md flex flex-col items-center relative mb-6">
                  {/* Flatline SVG vector animation */}
                  <svg className="w-80 h-24 text-cyan-500/20 flatline-glow" viewBox="0 0 300 100">
                    <line x1="0" y1="50" x2="300" y2="50" stroke="currentColor" strokeWidth="2.5" />
                    <circle cx="150" cy="50" r="3" fill="#ff2d55" className="animate-ping" />
                  </svg>
                  
                  <div className="absolute bottom-0 text-center flex flex-col items-center">
                    <h3 className="font-display font-black text-sm tracking-widest text-[#00d2ff] glow-text-cyan uppercase">
                      SYSTEM STANDBY MODE
                    </h3>
                    <p className="font-sans text-xs text-slate-400 max-w-[280px] mt-1.5 text-center">
                      Emergency waiting deck is empty. Add patient vitals on the left panel and initiate triage calculation.
                    </p>
                  </div>
                </div>
                
                {/* Visual command prompt callout */}
                <div className="mt-4 px-4 py-2 rounded bg-cyan-500/5 border border-cyan-500/10 text-center max-w-sm">
                  <span className="font-mono text-[10px] text-cyan-400/70 tracking-wider">
                    COMMAND INPUT ACTIVE | MOCK CHANNELS DISPATCHED
                  </span>
                </div>
              </div>
            ) : (
              
              /* State C: Triage Results Display */
              <div className="space-y-4 pb-12 select-none">
                {triagedPatients.map((p, idx) => {
                  const isCritical = p.priority === 'CRITICAL';
                  const isSerious = p.priority === 'SERIOUS';
                  
                  // Setup clean variables for vital rendering, avoiding compiler constraints
                  const bpSys = p.bpSys;
                  const bpDia = p.bpDia;
                  const hr = p.hr;
                  const spo2 = p.spo2;
                  const temp = p.temp;

                  // Card Theme Styling
                  let borderClass = "border-cyan-500/20";
                  let bgGlow = "bg-cyan-500/5";
                  let badgeColor = "bg-[#00f5a0]/10 border-[#00f5a0]/30 text-[#00f5a0]";
                  let badgePulse = "badge-pulse-stable";
                  let scoreBarColor = "bg-gradient-to-r from-emerald-500 to-[#00f5a0]";
                  let glowTextClass = "glow-text-stable";
                  let PriorityIcon = CheckCircle2;

                  if (isCritical) {
                    borderClass = "pulse-critical border-red-500/40";
                    bgGlow = "bg-red-500/5";
                    badgeColor = "bg-red-500/15 border-[#ff2d55]/40 text-[#ff2d55]";
                    badgePulse = "badge-pulse-critical";
                    scoreBarColor = "bg-gradient-to-r from-red-600 to-[#ff2d55]";
                    glowTextClass = "glow-text-critical";
                    PriorityIcon = AlertTriangle;
                  } else if (isSerious) {
                    borderClass = "border-amber-500/35 pulse-border-serious";
                    bgGlow = "bg-amber-500/5";
                    badgeColor = "bg-amber-500/15 border-[#ffb700]/30 text-[#ffb700]";
                    badgePulse = "badge-pulse-serious";
                    scoreBarColor = "bg-gradient-to-r from-amber-600 to-[#ffb700]";
                    glowTextClass = "glow-text-serious";
                    PriorityIcon = AlertCircle;
                  }

                  return (
                    <div
                      key={p.id}
                      className={`glass-panel glass-panel-hover rounded-lg p-5 flex gap-5 relative overflow-hidden result-card-fly-in scan-sweep-effect border-2 ${borderClass}`}
                      style={{ animationDelay: `${idx * 0.15}s` }}
                    >
                      {/* Backlighting effect */}
                      <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full ${bgGlow} blur-3xl pointer-events-none`}></div>
                      
                      {/* Left: Giant Rank Number */}
                      <div className="flex flex-col items-center justify-center shrink-0 w-24 border-r border-cyan-500/10 pr-5">
                        <span className="font-mono text-[10px] text-cyan-500/50 font-bold tracking-widest uppercase">RANK</span>
                        <span className="font-mono font-black text-6xl tracking-tighter text-white/90 leading-none select-none tabular-nums glow-text-cyan mt-1">
                          {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>
                      </div>

                      {/* Right: Detailed Patient Clinical Diagnosis */}
                      <div className="flex-1 flex flex-col justify-between">
                        
                        {/* Upper row: Name & Badge */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-display font-black text-lg text-white leading-tight flex items-center gap-2">
                              {p.name}
                              <span className="font-mono text-xs font-normal text-slate-400/80">({p.age} y/o {p.gender})</span>
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="font-mono text-[9px] text-cyan-500/60 uppercase">TELEMETRY SECURED</span>
                              <span className="w-1 h-1 rounded-full bg-cyan-500/40"></span>
                              <span className="font-mono text-[9px] text-[#00d2ff] uppercase">{bpSys}/{bpDia} mmHg • {hr} BPM • {spo2}% SpO2 • {temp}°F</span>
                            </div>
                          </div>

                          {/* Dynamic Badge */}
                          <div className={`px-2.5 py-1 rounded border font-display text-[9px] font-black tracking-widest uppercase flex items-center gap-1.5 ${badgeColor} ${badgePulse}`}>
                            <PriorityIcon className="w-3.5 h-3.5 shrink-0" />
                            {p.priority}
                          </div>
                        </div>

                        {/* AI Reasoning Text */}
                        <div className="mt-3 bg-[#050811]/70 border border-cyan-500/5 p-2.5 rounded font-sans text-[12px] leading-relaxed text-slate-300 select-text">
                          <span className="font-display font-bold text-[9px] tracking-wider text-[#00d2ff] uppercase block mb-0.5 select-none">AI CLINICAL REASONING DIAGNOSIS:</span>
                          {p.reasoning}
                        </div>

                        {/* Bottom Row: Score bar & Wait time */}
                        <div className="flex items-center justify-between gap-6 mt-4 pt-3 border-t border-cyan-500/5">
                          {/* Score Bar with counter */}
                          <div className="flex-1 flex items-center gap-3">
                            <span className="font-display text-[9px] font-bold text-cyan-500/70 uppercase select-none">URGENCY SCORE:</span>
                            <div className="flex-1 h-2 bg-[#090f23] rounded-full overflow-hidden border border-cyan-500/10 relative">
                              <div 
                                className="h-full rounded-full transition-all duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)]"
                                style={{ width: `${p.score}%` }}
                              >
                                <div className={`w-full h-full ${scoreBarColor}`}></div>
                              </div>
                            </div>
                            <span className={`font-mono text-sm font-black w-6 text-right tabular-nums ${glowTextClass}`}>
                              {p.score}%
                            </span>
                          </div>

                          {/* Estimated Wait Time */}
                          <div className="flex items-center gap-1.5 shrink-0 select-none bg-[#090f23]/60 px-3 py-1 rounded border border-cyan-500/5">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <div className="flex flex-col">
                              <span className="font-display text-[7px] text-cyan-500/50 font-bold uppercase leading-none">WAIT TIME</span>
                              <span className="font-mono text-[10px] text-white font-bold leading-none mt-0.5">{p.waitTime}</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ================= BOTTOM STATUS BAR ================= */}
      <footer className="h-[36px] bg-[#070b1a] border-t border-cyan-500/20 px-6 flex items-center justify-between z-20 shrink-0 text-cyan-500/50 font-mono text-[10px] relative select-none">
        
        {/* Status indicator */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00f5a0]"></span>
            </span>
            <span className="text-[#00f5a0] tracking-widest font-black uppercase">CORE STATUS: OPERATIONAL</span>
          </div>

          <span className="text-cyan-500/20">|</span>

          <span className="tracking-wide">BUFFER LIMIT: 64 ACTIVE CLINICAL CHANNELS</span>
        </div>

        {/* Diagnostic parameters telemetry */}
        <div className="hidden md:flex items-center gap-6">
          <span>TRIAGE INVOCATIONS: 00{triageCount}</span>
          <span className="text-cyan-500/20">|</span>
          <span>LATENCY: 2.45s</span>
          <span className="text-cyan-500/20">|</span>
          <span className="text-cyan-400 font-bold uppercase">DATABASE: SIMULATED (DEMO MODE)</span>
        </div>

        {/* Right side live clock */}
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-cyan-500/40" />
          <span className="text-white font-bold tracking-wider font-mono">{systemTime}</span>
        </div>
      </footer>
    </div>
  );
}
