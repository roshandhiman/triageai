# 🏥 AI TRIAGE CONSOLE: Tactical EMR Clinical Command (2035 Resus Edition)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-blue.svg?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.1-38bdf8.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646cff.svg?style=flat-square&logo=vite)](https://vite.dev/)
[![Build Status](https://img.shields.io/badge/Vite_Single_File-Bundled_289KB-emerald.svg?style=flat-square)](https://github.com/richardtop/vite-plugin-singlefile)

> **State-of-the-art Level-1 Trauma Emergency Room clinical decision dashboard. Designed under a high-density, cyberpunk-medical HUD aesthetic, utilizing natural language diagnostic engines, real-time animated biometrics, and a synthesized acoustic telemetry HUD.**

---

## ⚡ The Architectural "Wow" Factor (Zero-Dependency Offline Bundle)
In emergency medicine, network latency or server outages equal loss of life. This system is engineered for **absolute offline resilience**:
* **Standalone Compilation**: Using a custom Vite toolchain (`vite-plugin-singlefile`), the entire React 19 app, Tailwind CSS v4 stylesheets, responsive SVG nodes, canvas render loops, and synthesizer wave structures compile into **a single 289KB HTML file** (`dist/index.html`).
* **Zero External Calls**: It is immune to spotty hackathon Wi-Fi or local firewalls. Double-clicking the file in any browser starts a fully functional, zero-latency clinical console with active biometrics and live synthesis.

---

## 🎨 Premium Medical-Grade HUD Aesthetics

This dashboard moves strictly away from standard, boring "SaaS forms," adopting a high-density, multi-threaded Electronic Medical Record (EMR) telemetry deck:

```
+--------------------------------------------------------------------------------------------------+
|                                    AI TRIAGE CONSOLE [SECURE GATEWAY]                    [13:54] |
+---------------------------------+---------------------------------+------------------------------+
| 📥 CLINICAL INTAKE CONSOLE      | ⚡ BIOMETRIC WAVE TELEMETRY      | 📋 RANKED CLINICAL CHART DECK|
|                                 |                                 |                              |
| * Patient Identity, Age & ESI   | * Animated ECG Cardiac Lead     | * ESI Priority Sorting       |
| * Chief Symptom Presentation    | * Animated SpO2 Plethysmogram   | * Clinical Patient Barcodes  |
| * Telemetry Biometrics Inputs   | * Dynamic Physiological Alarms  | * Active Physician Dropdowns |
| * Buffer & Compile Controls     | * Active Telemetry Dispatch Feed| * Dynamic Urgency Scores     |
+---------------------------------+---------------------------------+------------------------------+
| CORE STATUS: SECURE             | EM LOG: 99.8% SYNCED            | LATENCY: 2.45s               |
+--------------------------------------------------------------------------------------------------+
```

### 🔴 High-Fidelity Design Implementations
* **Live Animated Canvas Waveforms**: Two separate HTML5 `<canvas>` elements rendering real-time ECG and Plethysmogram waves at 60fps with a professional CRT green/cyan fading trail effect.
* **Flashing Clinical Alerts**: Based on entered biometric parameters, the system dynamically flashes warning tags:
  * 💔 `TACHYCARDIA` / `BRADYCARDIAC` based on Heart Rate.
  * 🫁 `HYPOXEMIA` based on SpO2 (Oxygen Saturation).
  * 🩸 `HYPOTENSION` based on Blood Pressure.
  * 🔥 `HYPERTHERMIA` / `HI TEMP` based on Core Temperature.
* **EMR Charts & Barcodes**: Ranked triage cards feature mock clinical patient bracelet barcodes, custom physician assignment selectors, ESI priority badges, and active countdown latency bars.
* **Acoustic Telemetry HUD**: Utilizes the browser's `AudioContext` and hardware oscillators to generate real-time sonic feedback (cybernetic clicks on focus, high-pitched bedside double-beeps on scans, ascending success chimes, bass sweeps on deletion, and a diagnostic sawtooth siren for critical admissions).
* **3D Layered Perspective**: Intake buffers stack dynamically in a 3D overlay shadow, hovering lifts them forward in 3D viewport space.

---

## 🔬 Clinical Triage Rule-Based AI Engine

The system acts like a real-world medical expert, utilizing weighted clinical variables (vitals anomalies and chief complaint keyword associations) to dynamically classify patients:

| ESI Priority | Urgency Score | wait Time Threshold | Vitals Trigger Profile | Typical Clinical Reasoning |
| :--- | :---: | :---: | :--- | :--- |
| **CRITICAL** | `90 - 99` | **IMMEDIATE** | SpO2 < 88%, BP > 180/110, chest pain, coma | *Suspected acute coronary syndrome (ACS). High probability of active STEMI. Fast-track cardiac catheterization indicated.* |
| **SERIOUS** | `65 - 89` | **15 - 30 MINS** | Temp > 102°F, HR > 110, active bleeding, stroke deficit | *Pediatric high fever with petechial rash. Suspected meningococcal sepsis. Strict droplet isolation required.* |
| **STABLE** | `15 - 64` | **1 - 2 HOURS** | Vitals stable, mechanical joint sprains, minor infection | *Isolated musculoskeletal joint strain. Neurovascular status intact. Ottawa criteria met for diagnostic X-ray.* |

---

## 🛠️ Installation & Compilation

### 1. Requirements
Ensure you have Node.js (v18+) and NPM installed.

### 2. Install Project Dependencies
Initialize and copy the clean React environment:
```bash
npm install
```

### 3. Start Local Development Server
Launch the Vite development server explicitly bound to IPv4 local loopback:
```bash
npm run dev -- --host 127.0.0.1
```

### 4. Build Offline Production Single-File
Compile the entire project into a single self-contained HTML file:
```bash
npm run build
```
Once completed, simply open the bundled file directly in any browser:
```bash
open dist/index.html
```

---

## 💻 Tech Stack
* **Framework**: React 19 (hooks, useState, useEffect, useRef)
* **Styling**: Tailwind CSS v4.0 (Vite integration, custom theme declarations)
* **Build Tool**: Vite 7.0 + Vite Single File Plugin (inline CSS, JS, SVGs)
* **Icons**: Lucide React
* **Graphics**: HTML5 Canvas Rendering Context 2D
* **Acoustics**: Web Audio API (Synthesized oscillators)
