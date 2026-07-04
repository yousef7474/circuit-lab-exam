/* ============================================================
   CIRCUIT.LAB — Question Bank
   ------------------------------------------------------------
   لتعديل الأسئلة:
   - غيّر النصوص/الخيارات بحرية
   - أنواع الأسئلة المدعومة:
       mcq            : اختيار من متعدد
       image_mcq      : اختيار من متعدد مع صورة
       true_false     : صح / خطأ
       short_text     : إجابة قصيرة
       long_text      : إجابة مطولة
       code_reading   : قراءة كود مع صندوق إجابة
       matching       : توصيل (كل عنصر من العمود الأيمن مع رقم من العمود الأيسر)
   - لإضافة صورة:
       image: 'url-here'
       أو
       image: { svg: '<svg>...</svg>' }
============================================================ */

/* ---------- SVG assets (inline illustrations) ---------- */

const SVG = {
  // Circuit: 9V battery -> resistor -> LED
  ledCircuit: `
    <svg viewBox="0 0 500 260" xmlns="http://www.w3.org/2000/svg" style="max-width:520px">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#22d3ee"/>
        </marker>
      </defs>
      <!-- wires -->
      <rect x="20" y="20" width="460" height="220" fill="none" stroke="#22d3ee" stroke-width="2.5"/>
      <!-- battery (left side) -->
      <g transform="translate(20 130)">
        <line x1="0" y1="-20" x2="0" y2="20" stroke="#0a0e1a" stroke-width="6"/>
        <line x1="-6" y1="-40" x2="-6" y2="40" stroke="#ffb020" stroke-width="4"/>
        <line x1="6" y1="-20" x2="6" y2="20" stroke="#ffb020" stroke-width="4"/>
        <line x1="12" y1="-40" x2="12" y2="40" stroke="#ffb020" stroke-width="4"/>
        <text x="-40" y="-50" fill="#ffb020" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700">9V</text>
        <text x="-30" y="60" fill="#6d7899" font-family="JetBrains Mono, monospace" font-size="11">BATTERY</text>
      </g>
      <!-- resistor (top) -->
      <g transform="translate(180 20)">
        <polyline points="0,0 10,-10 30,10 50,-10 70,10 90,-10 110,10 120,0" fill="none" stroke="#ffb020" stroke-width="3" transform="translate(20,0)"/>
        <text x="55" y="-20" fill="#ffb020" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700" text-anchor="middle">R = ?</text>
      </g>
      <!-- LED (right side) -->
      <g transform="translate(480 130)">
        <circle cx="0" cy="0" r="20" fill="#4ade80" opacity="0.25"/>
        <circle cx="0" cy="0" r="14" fill="none" stroke="#4ade80" stroke-width="2.5"/>
        <polygon points="-6,-8 -6,8 6,0" fill="#4ade80"/>
        <line x1="6" y1="-8" x2="6" y2="8" stroke="#4ade80" stroke-width="2"/>
        <line x1="16" y1="-6" x2="24" y2="-14" stroke="#4ade80" stroke-width="2"/>
        <line x1="18" y1="0" x2="26" y2="-8" stroke="#4ade80" stroke-width="2"/>
        <text x="0" y="-32" fill="#4ade80" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700" text-anchor="middle">LED</text>
        <text x="0" y="42" fill="#6d7899" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">2V / 20mA</text>
      </g>
      <!-- current arrow -->
      <line x1="100" y1="100" x2="160" y2="100" stroke="#22d3ee" stroke-width="0" marker-end="url(#arrow)"/>
      <text x="130" y="90" fill="#22d3ee" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">I</text>
    </svg>`,

  // Simplified Arduino Uno board
  arduinoUno: `
    <svg viewBox="0 0 520 320" xmlns="http://www.w3.org/2000/svg" style="max-width:600px">
      <!-- board background -->
      <rect x="10" y="20" width="500" height="280" rx="8" fill="#008073" stroke="#004e46" stroke-width="2"/>
      <!-- silk screen title -->
      <text x="260" y="50" fill="#e2e8f0" font-family="Reem Kufi, sans-serif" font-size="20" font-weight="700" text-anchor="middle">ARDUINO UNO</text>
      <text x="260" y="66" fill="#a3aecc" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">MADE IN ITALY</text>
      <!-- USB port (top-left) -->
      <rect x="20" y="80" width="60" height="50" fill="#94a3b8" stroke="#1e293b" stroke-width="1"/>
      <text x="50" y="145" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">USB</text>
      <!-- Power jack -->
      <rect x="20" y="180" width="50" height="40" rx="4" fill="#0f172a" stroke="#1e293b"/>
      <text x="45" y="235" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">DC IN</text>
      <!-- ATmega chip -->
      <rect x="200" y="180" width="120" height="60" fill="#1e293b" stroke="#0f172a"/>
      <text x="260" y="215" fill="#94a3b8" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" text-anchor="middle">ATmega328P</text>
      <!-- Digital pins header (top row) -->
      <g transform="translate(140 82)">
        <rect width="320" height="20" fill="#0f172a"/>
        <text x="160" y="-4" fill="#ffb020" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle" font-weight="700">DIGITAL (PWM ~)</text>
        <g fill="#ffb020">
          <!-- 14 pins labeled 13..0 -->
        </g>
        <text x="10" y="14" fill="#ffb020" font-family="JetBrains Mono, monospace" font-size="9">13</text>
        <text x="32" y="14" fill="#ffb020" font-family="JetBrains Mono, monospace" font-size="9">12</text>
        <text x="54" y="14" fill="#ffb020" font-family="JetBrains Mono, monospace" font-size="9">~11</text>
        <text x="78" y="14" fill="#ffb020" font-family="JetBrains Mono, monospace" font-size="9">~10</text>
        <text x="102" y="14" fill="#ffb020" font-family="JetBrains Mono, monospace" font-size="9">~9</text>
        <text x="124" y="14" fill="#ffb020" font-family="JetBrains Mono, monospace" font-size="9">8</text>
        <text x="146" y="14" fill="#ffb020" font-family="JetBrains Mono, monospace" font-size="9">7</text>
        <text x="168" y="14" fill="#ffb020" font-family="JetBrains Mono, monospace" font-size="9">~6</text>
        <text x="190" y="14" fill="#ffb020" font-family="JetBrains Mono, monospace" font-size="9">~5</text>
        <text x="212" y="14" fill="#ffb020" font-family="JetBrains Mono, monospace" font-size="9">4</text>
        <text x="234" y="14" fill="#ffb020" font-family="JetBrains Mono, monospace" font-size="9">~3</text>
        <text x="256" y="14" fill="#ffb020" font-family="JetBrains Mono, monospace" font-size="9">2</text>
        <text x="278" y="14" fill="#ffb020" font-family="JetBrains Mono, monospace" font-size="9">1</text>
        <text x="300" y="14" fill="#ffb020" font-family="JetBrains Mono, monospace" font-size="9">0</text>
      </g>
      <!-- Analog pins (bottom right) -->
      <g transform="translate(320 260)">
        <rect width="160" height="18" fill="#0f172a"/>
        <text x="80" y="32" fill="#22d3ee" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle" font-weight="700">ANALOG IN</text>
        <text x="10" y="12" fill="#22d3ee" font-family="JetBrains Mono, monospace" font-size="9">A0</text>
        <text x="34" y="12" fill="#22d3ee" font-family="JetBrains Mono, monospace" font-size="9">A1</text>
        <text x="58" y="12" fill="#22d3ee" font-family="JetBrains Mono, monospace" font-size="9">A2</text>
        <text x="82" y="12" fill="#22d3ee" font-family="JetBrains Mono, monospace" font-size="9">A3</text>
        <text x="106" y="12" fill="#22d3ee" font-family="JetBrains Mono, monospace" font-size="9">A4</text>
        <text x="130" y="12" fill="#22d3ee" font-family="JetBrains Mono, monospace" font-size="9">A5</text>
      </g>
      <!-- Power pins (bottom left) -->
      <g transform="translate(140 260)">
        <rect width="160" height="18" fill="#0f172a"/>
        <text x="80" y="32" fill="#f87171" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle" font-weight="700">POWER</text>
        <text x="6" y="12" fill="#f87171" font-family="JetBrains Mono, monospace" font-size="8">3V3</text>
        <text x="32" y="12" fill="#f87171" font-family="JetBrains Mono, monospace" font-size="8">5V</text>
        <text x="52" y="12" fill="#f87171" font-family="JetBrains Mono, monospace" font-size="8">GND</text>
        <text x="80" y="12" fill="#f87171" font-family="JetBrains Mono, monospace" font-size="8">GND</text>
        <text x="108" y="12" fill="#f87171" font-family="JetBrains Mono, monospace" font-size="8">Vin</text>
      </g>
      <!-- LED indicators -->
      <circle cx="380" cy="130" r="4" fill="#4ade80"/>
      <circle cx="395" cy="130" r="4" fill="#f87171"/>
      <text x="410" y="134" fill="#94a3b8" font-family="JetBrains Mono, monospace" font-size="9">PWR/L</text>
      <!-- Reset button -->
      <rect x="100" y="90" width="20" height="20" rx="3" fill="#f87171"/>
      <text x="110" y="122" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="8" text-anchor="middle">RESET</text>
    </svg>`,

  // Grid of 4 basic components
  components: `
    <svg viewBox="0 0 640 200" xmlns="http://www.w3.org/2000/svg" style="max-width:640px">
      <!-- A: Resistor -->
      <g transform="translate(80 100)">
        <text x="0" y="-60" fill="#ffb020" font-family="Reem Kufi" font-size="22" font-weight="700" text-anchor="middle">A</text>
        <line x1="-70" y1="0" x2="-30" y2="0" stroke="#e2e8f0" stroke-width="2"/>
        <polyline points="-30,0 -20,-14 0,14 20,-14 30,0" fill="none" stroke="#ffb020" stroke-width="2.5"/>
        <line x1="30" y1="0" x2="70" y2="0" stroke="#e2e8f0" stroke-width="2"/>
        <text x="0" y="50" fill="#a3aecc" font-family="Tajawal" font-size="14" text-anchor="middle">؟</text>
      </g>
      <!-- B: Capacitor -->
      <g transform="translate(240 100)">
        <text x="0" y="-60" fill="#ffb020" font-family="Reem Kufi" font-size="22" font-weight="700" text-anchor="middle">B</text>
        <line x1="-70" y1="0" x2="-6" y2="0" stroke="#e2e8f0" stroke-width="2"/>
        <line x1="-6" y1="-20" x2="-6" y2="20" stroke="#22d3ee" stroke-width="3"/>
        <line x1="6" y1="-20" x2="6" y2="20" stroke="#22d3ee" stroke-width="3"/>
        <line x1="6" y1="0" x2="70" y2="0" stroke="#e2e8f0" stroke-width="2"/>
        <text x="0" y="50" fill="#a3aecc" font-family="Tajawal" font-size="14" text-anchor="middle">؟</text>
      </g>
      <!-- C: LED -->
      <g transform="translate(400 100)">
        <text x="0" y="-60" fill="#ffb020" font-family="Reem Kufi" font-size="22" font-weight="700" text-anchor="middle">C</text>
        <line x1="-70" y1="0" x2="-14" y2="0" stroke="#e2e8f0" stroke-width="2"/>
        <polygon points="-14,-14 -14,14 8,0" fill="#4ade80" opacity="0.9"/>
        <line x1="8" y1="-14" x2="8" y2="14" stroke="#4ade80" stroke-width="2.5"/>
        <line x1="8" y1="0" x2="70" y2="0" stroke="#e2e8f0" stroke-width="2"/>
        <line x1="16" y1="-14" x2="26" y2="-24" stroke="#4ade80" stroke-width="2"/>
        <line x1="20" y1="-8" x2="30" y2="-18" stroke="#4ade80" stroke-width="2"/>
        <text x="0" y="50" fill="#a3aecc" font-family="Tajawal" font-size="14" text-anchor="middle">؟</text>
      </g>
      <!-- D: Transistor NPN -->
      <g transform="translate(560 100)">
        <text x="0" y="-60" fill="#ffb020" font-family="Reem Kufi" font-size="22" font-weight="700" text-anchor="middle">D</text>
        <circle cx="0" cy="0" r="28" fill="none" stroke="#f87171" stroke-width="2"/>
        <line x1="-20" y1="0" x2="-6" y2="0" stroke="#f87171" stroke-width="2.5"/>
        <line x1="-6" y1="-18" x2="-6" y2="18" stroke="#f87171" stroke-width="3"/>
        <line x1="-6" y1="-8" x2="14" y2="-22" stroke="#f87171" stroke-width="2.5"/>
        <line x1="-6" y1="8" x2="14" y2="22" stroke="#f87171" stroke-width="2.5"/>
        <polygon points="10,18 14,22 6,22" fill="#f87171"/>
        <line x1="14" y1="22" x2="14" y2="34" stroke="#f87171" stroke-width="2"/>
        <line x1="14" y1="-22" x2="14" y2="-34" stroke="#f87171" stroke-width="2"/>
        <text x="0" y="60" fill="#a3aecc" font-family="Tajawal" font-size="14" text-anchor="middle">؟</text>
      </g>
    </svg>`,

  // Sensor icons for matching question
  sensors: `
    <svg viewBox="0 0 640 180" xmlns="http://www.w3.org/2000/svg" style="max-width:640px">
      <!-- DHT11 -->
      <g transform="translate(80 90)">
        <rect x="-30" y="-40" width="60" height="70" rx="3" fill="#3b82f6" stroke="#1e40af" stroke-width="1.5"/>
        <circle cx="0" cy="-10" r="14" fill="none" stroke="#e2e8f0" stroke-width="1.5"/>
        <path d="M-8,0 h16 M-8,-6 h16 M-8,-14 h16" stroke="#e2e8f0" stroke-width="1"/>
        <line x1="-16" y1="30" x2="-16" y2="46" stroke="#94a3b8" stroke-width="2"/>
        <line x1="-6" y1="30" x2="-6" y2="46" stroke="#94a3b8" stroke-width="2"/>
        <line x1="6" y1="30" x2="6" y2="46" stroke="#94a3b8" stroke-width="2"/>
        <line x1="16" y1="30" x2="16" y2="46" stroke="#94a3b8" stroke-width="2"/>
        <text x="0" y="24" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">DHT11</text>
        <text x="0" y="66" fill="#ffb020" font-family="Reem Kufi" font-size="18" font-weight="700" text-anchor="middle">1</text>
      </g>
      <!-- HC-SR04 -->
      <g transform="translate(240 90)">
        <rect x="-45" y="-30" width="90" height="55" rx="3" fill="#16a34a" stroke="#166534" stroke-width="1.5"/>
        <circle cx="-20" cy="-4" r="15" fill="#0a0e1a" stroke="#e2e8f0" stroke-width="1.5"/>
        <circle cx="20" cy="-4" r="15" fill="#0a0e1a" stroke="#e2e8f0" stroke-width="1.5"/>
        <text x="-20" y="-1" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="7" text-anchor="middle">T</text>
        <text x="20" y="-1" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="7" text-anchor="middle">R</text>
        <text x="0" y="18" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="8" text-anchor="middle">HC-SR04</text>
        <line x1="-24" y1="25" x2="-24" y2="40" stroke="#94a3b8" stroke-width="2"/>
        <line x1="-8" y1="25" x2="-8" y2="40" stroke="#94a3b8" stroke-width="2"/>
        <line x1="8" y1="25" x2="8" y2="40" stroke="#94a3b8" stroke-width="2"/>
        <line x1="24" y1="25" x2="24" y2="40" stroke="#94a3b8" stroke-width="2"/>
        <text x="0" y="66" fill="#ffb020" font-family="Reem Kufi" font-size="18" font-weight="700" text-anchor="middle">2</text>
      </g>
      <!-- LDR -->
      <g transform="translate(400 90)">
        <circle cx="0" cy="0" r="30" fill="none" stroke="#e2e8f0" stroke-width="2"/>
        <path d="M-20,-5 Q-10,-20 0,-5 T20,-5 M-20,5 Q-10,20 0,5 T20,5" fill="none" stroke="#ffb020" stroke-width="2"/>
        <line x1="-30" y1="0" x2="-44" y2="0" stroke="#94a3b8" stroke-width="2"/>
        <line x1="30" y1="0" x2="44" y2="0" stroke="#94a3b8" stroke-width="2"/>
        <text x="0" y="46" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">LDR</text>
        <text x="0" y="66" fill="#ffb020" font-family="Reem Kufi" font-size="18" font-weight="700" text-anchor="middle">3</text>
      </g>
      <!-- PIR -->
      <g transform="translate(560 90)">
        <rect x="-32" y="-32" width="64" height="64" rx="4" fill="#7c3aed" stroke="#5b21b6" stroke-width="1.5"/>
        <circle cx="0" cy="-4" r="20" fill="#e2e8f0" opacity="0.85"/>
        <circle cx="0" cy="-4" r="14" fill="none" stroke="#5b21b6" stroke-width="1.5"/>
        <circle cx="0" cy="-4" r="8" fill="none" stroke="#5b21b6" stroke-width="1"/>
        <text x="0" y="24" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">PIR</text>
        <line x1="-12" y1="32" x2="-12" y2="46" stroke="#94a3b8" stroke-width="2"/>
        <line x1="0" y1="32" x2="0" y2="46" stroke="#94a3b8" stroke-width="2"/>
        <line x1="12" y1="32" x2="12" y2="46" stroke="#94a3b8" stroke-width="2"/>
        <text x="0" y="66" fill="#ffb020" font-family="Reem Kufi" font-size="18" font-weight="700" text-anchor="middle">4</text>
      </g>
    </svg>`,

  // Motors comparison
  motors: `
    <svg viewBox="0 0 640 220" xmlns="http://www.w3.org/2000/svg" style="max-width:640px">
      <!-- A: DC Motor -->
      <g transform="translate(120 110)">
        <text x="0" y="-70" fill="#ffb020" font-family="Reem Kufi" font-size="22" font-weight="700" text-anchor="middle">A</text>
        <circle cx="0" cy="0" r="46" fill="#1e293b" stroke="#94a3b8" stroke-width="2"/>
        <circle cx="0" cy="0" r="30" fill="none" stroke="#94a3b8" stroke-width="1"/>
        <text x="0" y="4" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700" text-anchor="middle">M</text>
        <rect x="-56" y="-6" width="10" height="12" fill="#94a3b8"/>
        <rect x="46" y="-6" width="10" height="12" fill="#94a3b8"/>
        <line x1="-56" y1="-15" x2="-56" y2="-30" stroke="#f87171" stroke-width="3"/>
        <line x1="56" y1="-15" x2="56" y2="-30" stroke="#0f172a" stroke-width="3"/>
        <text x="0" y="70" fill="#e2e8f0" font-family="Tajawal" font-size="14" text-anchor="middle">محرك DC</text>
      </g>
      <!-- B: Servo -->
      <g transform="translate(320 110)">
        <text x="0" y="-70" fill="#ffb020" font-family="Reem Kufi" font-size="22" font-weight="700" text-anchor="middle">B</text>
        <rect x="-45" y="-30" width="60" height="55" rx="3" fill="#1e40af" stroke="#93c5fd" stroke-width="1.5"/>
        <rect x="15" y="-14" width="10" height="24" fill="#1e40af" stroke="#93c5fd" stroke-width="1.5"/>
        <circle cx="20" cy="-2" r="5" fill="#93c5fd"/>
        <line x1="20" y1="-2" x2="42" y2="-16" stroke="#93c5fd" stroke-width="4" stroke-linecap="round"/>
        <line x1="20" y1="-2" x2="42" y2="12" stroke="#93c5fd" stroke-width="4" stroke-linecap="round"/>
        <text x="-15" y="4" fill="#93c5fd" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">SG90</text>
        <path d="M-30,30 h6 M-18,30 h6 M-6,30 h6" stroke="#94a3b8" stroke-width="2"/>
        <text x="0" y="70" fill="#e2e8f0" font-family="Tajawal" font-size="14" text-anchor="middle">محرك Servo</text>
      </g>
      <!-- C: Stepper -->
      <g transform="translate(520 110)">
        <text x="0" y="-70" fill="#ffb020" font-family="Reem Kufi" font-size="22" font-weight="700" text-anchor="middle">C</text>
        <circle cx="0" cy="0" r="46" fill="#4a5573" stroke="#94a3b8" stroke-width="2"/>
        <circle cx="0" cy="0" r="14" fill="#1e293b"/>
        <g stroke="#94a3b8" stroke-width="1.5" fill="none">
          <line x1="-40" y1="0" x2="-32" y2="0"/>
          <line x1="40" y1="0" x2="32" y2="0"/>
          <line x1="0" y1="-40" x2="0" y2="-32"/>
          <line x1="0" y1="40" x2="0" y2="32"/>
          <line x1="-28" y1="-28" x2="-22" y2="-22"/>
          <line x1="28" y1="-28" x2="22" y2="-22"/>
          <line x1="-28" y1="28" x2="-22" y2="22"/>
          <line x1="28" y1="28" x2="22" y2="22"/>
        </g>
        <text x="0" y="4" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle" font-weight="700">28BYJ</text>
        <text x="0" y="70" fill="#e2e8f0" font-family="Tajawal" font-size="14" text-anchor="middle">محرك Stepper</text>
      </g>
    </svg>`,

  // Two boards: ESP8266 vs ESP32
  espBoards: `
    <svg viewBox="0 0 640 240" xmlns="http://www.w3.org/2000/svg" style="max-width:640px">
      <!-- ESP8266 (NodeMCU) -->
      <g transform="translate(160 130)">
        <text x="0" y="-90" fill="#ffb020" font-family="Reem Kufi" font-size="20" font-weight="700" text-anchor="middle">A</text>
        <rect x="-80" y="-50" width="160" height="90" rx="4" fill="#0f172a" stroke="#22d3ee" stroke-width="1.5"/>
        <rect x="-30" y="-40" width="60" height="40" rx="2" fill="#1e293b" stroke="#64748b" stroke-width="1"/>
        <rect x="-24" y="-34" width="30" height="14" fill="#94a3b8"/>
        <text x="-8" y="-24" fill="#0f172a" font-family="JetBrains Mono, monospace" font-size="7" text-anchor="middle" font-weight="700">ESP-12</text>
        <rect x="18" y="-38" width="10" height="30" fill="#94a3b8"/>
        <rect x="20" y="-36" width="6" height="6" fill="#0a0e1a"/>
        <text x="0" y="30" fill="#22d3ee" font-family="JetBrains Mono, monospace" font-size="12" text-anchor="middle" font-weight="700">ESP8266</text>
        <text x="0" y="55" fill="#94a3b8" font-family="Tajawal" font-size="12" text-anchor="middle">WiFi فقط</text>
      </g>
      <!-- ESP32 -->
      <g transform="translate(480 130)">
        <text x="0" y="-90" fill="#ffb020" font-family="Reem Kufi" font-size="20" font-weight="700" text-anchor="middle">B</text>
        <rect x="-90" y="-50" width="180" height="90" rx="4" fill="#0f172a" stroke="#4ade80" stroke-width="1.5"/>
        <rect x="-40" y="-40" width="80" height="42" rx="2" fill="#1e293b" stroke="#64748b" stroke-width="1"/>
        <rect x="-32" y="-34" width="46" height="18" fill="#94a3b8"/>
        <text x="-9" y="-22" fill="#0f172a" font-family="JetBrains Mono, monospace" font-size="8" text-anchor="middle" font-weight="700">ESP-WROOM-32</text>
        <rect x="26" y="-38" width="12" height="34" fill="#94a3b8"/>
        <rect x="28" y="-36" width="8" height="8" fill="#0a0e1a"/>
        <text x="0" y="30" fill="#4ade80" font-family="JetBrains Mono, monospace" font-size="12" text-anchor="middle" font-weight="700">ESP32</text>
        <text x="0" y="55" fill="#94a3b8" font-family="Tajawal" font-size="12" text-anchor="middle">WiFi + Bluetooth</text>
      </g>
    </svg>`,

  // Breadboard mystery — Ohm's law visualization
  ohmLaw: `
    <svg viewBox="0 0 500 220" xmlns="http://www.w3.org/2000/svg" style="max-width:500px">
      <text x="250" y="30" fill="#ffb020" font-family="Reem Kufi" font-size="18" font-weight="700" text-anchor="middle">V = I × R</text>
      <g transform="translate(250 130)">
        <circle cx="0" cy="0" r="70" fill="none" stroke="#22d3ee" stroke-width="2" stroke-dasharray="4 4"/>
        <text x="0" y="-32" fill="#ffb020" font-family="Reem Kufi" font-size="30" font-weight="700" text-anchor="middle">V</text>
        <line x1="-58" y1="-4" x2="58" y2="-4" stroke="#22d3ee" stroke-width="2"/>
        <text x="-30" y="30" fill="#e2e8f0" font-family="Reem Kufi" font-size="24" font-weight="700" text-anchor="middle">I</text>
        <text x="0" y="30" fill="#a3aecc" font-family="Reem Kufi" font-size="20" text-anchor="middle">×</text>
        <text x="30" y="30" fill="#e2e8f0" font-family="Reem Kufi" font-size="24" font-weight="700" text-anchor="middle">R</text>
      </g>
      <text x="250" y="200" fill="#a3aecc" font-family="Tajawal" font-size="13" text-anchor="middle">قانون أوم — العلاقة بين الجهد والتيار والمقاومة</text>
    </svg>`
};

/* ---------- Highlighted code snippet ---------- */
const CODE_BLINK = `<span class="kw">void</span> <span class="fn">setup</span>() {
  <span class="fn">pinMode</span>(<span class="num">13</span>, OUTPUT);
}

<span class="kw">void</span> <span class="fn">loop</span>() {
  <span class="fn">digitalWrite</span>(<span class="num">13</span>, HIGH);
  <span class="fn">delay</span>(<span class="num">1000</span>);
  <span class="fn">digitalWrite</span>(<span class="num">13</span>, LOW);
  <span class="fn">delay</span>(<span class="num">1000</span>);
}`;

/* ============================================================
   QUIZ DATA
============================================================ */
const QUIZ_DATA = {
  meta: {
    title: 'الاختبار القبلي',
    subtitle: 'مسار الإلكترونيات وبرمجة المتحكمات',
    version: '1.0',
    durationSeconds: 45 * 60, // 45 minutes

    /* ============================================================
       ⚙️ إعدادات الخادم (Google Apps Script)
       - اترك url فارغاً لتعطيل الحفظ التلقائي
       - كلمة مرور المعلم مخزّنة داخل backend.gs فقط (على خادم Google)
         ولا يجب وضعها هنا لأن هذا الملف يصبح عاماً بعد النشر.
    ============================================================ */
    backend: {
      url: 'https://script.google.com/macros/s/AKfycbynw7I1u9q2M3ZpT2bIFaxHGnTEh5W-H0eVqiEDJBhQn4SG1gKA8rndwzo4qz-nO71A/exec'   // الصق هنا رابط Web app بعد نشر backend.gs
    },

    // بريد المعلم — يستخدم كمستقبل افتراضي عند الضغط على "إرسال بالبريد"
    teacherEmail: ''
  },

  sections: [
    /* ============================================================
       SECTION 1 — Electricity basics (5 questions)
    ============================================================ */
    {
      id: 's1',
      code: 'PWR',
      title: 'أساسيات الكهرباء والإلكترونيات',
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          title: 'ما وحدة قياس المقاومة الكهربائية؟',
          image: { svg: SVG.ohmLaw },
          options: [
            { key: 'أ', text: 'الفولت (V)' },
            { key: 'ب', text: 'الأمبير (A)' },
            { key: 'ج', text: 'الأوم (Ω)' },
            { key: 'د', text: 'الواط (W)' }
          ],
          answer: 'ج',
          points: 4
        },
        {
          id: 'q2',
          type: 'mcq',
          title: 'ماذا تعني الحروف LED؟',
          options: [
            { key: 'أ', text: 'Light Emitting Diode (ديود باعث للضوء)' },
            { key: 'ب', text: 'Long Electric Detector' },
            { key: 'ج', text: 'Low Energy Device' },
            { key: 'د', text: 'Light Energy Display' }
          ],
          answer: 'أ',
          points: 3
        },
        {
          id: 'q3',
          type: 'mcq',
          title: 'ما اللون الشائع للسلك الموجب (+) في الدوائر الكهربائية؟',
          options: [
            { key: 'أ', text: 'الأحمر' },
            { key: 'ب', text: 'الأسود' },
            { key: 'ج', text: 'الأزرق' },
            { key: 'د', text: 'الأبيض' }
          ],
          answer: 'أ',
          points: 3
        },
        {
          id: 'q4',
          type: 'true_false',
          title: 'يمكن توصيل مصباح LED مباشرة ببطارية 9V دون الحاجة إلى مقاومة.',
          answer: 'خطأ',
          points: 3
        },
        {
          id: 'q5',
          type: 'mcq',
          title: 'أيهما أكبر: مقاومة قيمتها 1 كيلو أوم (1 kΩ) أم مقاومة قيمتها 500 أوم (500 Ω)؟',
          options: [
            { key: 'أ', text: '1 kΩ أكبر' },
            { key: 'ب', text: '500 Ω أكبر' },
            { key: 'ج', text: 'متساويتان' },
            { key: 'د', text: 'لا يمكن المقارنة بينهما' }
          ],
          answer: 'أ',
          points: 3
        }
      ]
    },

    /* ============================================================
       SECTION 2 — Arduino & microcontrollers (8 questions)
    ============================================================ */
    {
      id: 's2',
      code: 'MCU',
      title: 'الأردوينو وأنواع المتحكمات',
      questions: [
        {
          id: 'q6',
          type: 'mcq',
          title: 'أي من الآتي يُعتبر لوحة أردوينو (Arduino Board)؟',
          options: [
            { key: 'أ', text: 'Arduino Uno' },
            { key: 'ب', text: 'Raspberry Pi 4' },
            { key: 'ج', text: 'BeagleBone Black' },
            { key: 'د', text: 'Jetson Nano' }
          ],
          answer: 'أ',
          points: 4
        },
        {
          id: 'q7',
          type: 'image_mcq',
          title: 'انظر إلى لوحة Arduino Uno الموضحة. كم عدد المنافذ الرقمية (Digital Pins) عليها؟',
          image: { svg: SVG.arduinoUno, caption: 'ARDUINO.UNO / R3' },
          options: [
            { key: 'أ', text: '6 منافذ' },
            { key: 'ب', text: '10 منافذ' },
            { key: 'ج', text: '14 منفذاً' },
            { key: 'د', text: '20 منفذاً' }
          ],
          answer: 'ج',
          points: 4
        },
        {
          id: 'q8',
          type: 'mcq',
          title: 'ما الأداة المستخدمة لرفع (تحميل) الكود من الحاسوب إلى لوحة الأردوينو؟',
          options: [
            { key: 'أ', text: 'كابل USB' },
            { key: 'ب', text: 'كابل HDMI' },
            { key: 'ج', text: 'كابل VGA' },
            { key: 'د', text: 'لا يمكن رفع الكود إلا لاسلكياً' }
          ],
          answer: 'أ',
          points: 3
        },
        {
          id: 'q9',
          type: 'mcq',
          title: 'ما لغة البرمجة التي تُستخدم عادةً لبرمجة الأردوينو؟',
          options: [
            { key: 'أ', text: 'HTML' },
            { key: 'ب', text: 'C / C++' },
            { key: 'ج', text: 'Photoshop' },
            { key: 'د', text: 'Word' }
          ],
          answer: 'ب',
          points: 3
        },
        {
          id: 'q10',
          type: 'image_mcq',
          title: 'قارن بين اللوحتين (A) و (B). أي جملة صحيحة تماماً؟',
          image: { svg: SVG.espBoards, caption: 'A = ESP8266 / B = ESP32' },
          options: [
            { key: 'أ', text: 'اللوحتان متطابقتان في المواصفات' },
            { key: 'ب', text: 'اللوحة B (ESP32) تحتوي على WiFi و Bluetooth، اللوحة A تحتوي على WiFi فقط' },
            { key: 'ج', text: 'اللوحة A (ESP8266) هي الأقوى في المعالجة' },
            { key: 'د', text: 'كلتا اللوحتين لا تحتويان على WiFi' }
          ],
          answer: 'ب',
          points: 4
        },
        {
          id: 'q11',
          type: 'mcq',
          title: 'ما وظيفة الدالة setup() في برنامج الأردوينو؟',
          options: [
            { key: 'أ', text: 'تُنفَّذ مرة واحدة فقط عند تشغيل اللوحة (لتهيئة المنافذ والإعدادات)' },
            { key: 'ب', text: 'تُنفَّذ باستمرار في حلقة متكررة' },
            { key: 'ج', text: 'تُستخدم لطباعة النصوص على الشاشة' },
            { key: 'د', text: 'تُستخدم لتأخير تنفيذ البرنامج' }
          ],
          answer: 'أ',
          points: 4
        },
        {
          id: 'q12',
          type: 'mcq',
          title: 'يمكن اعتبار المتحكم الدقيق (Microcontroller) في الروبوت بمثابة...',
          options: [
            { key: 'أ', text: 'العضلات (يُحرِّك الأجزاء)' },
            { key: 'ب', text: 'العينين (يرى المحيط)' },
            { key: 'ج', text: 'الدماغ (يتحكم بكل شيء)' },
            { key: 'د', text: 'الأذنين (يستمع للأصوات)' }
          ],
          answer: 'ج',
          points: 3
        },
        {
          id: 'q13',
          type: 'image_mcq',
          title: 'بالنظر إلى لوحة Arduino Uno، أي المنافذ التالية يستطيع قراءة إشارة تناظرية (Analog)؟',
          image: { svg: SVG.arduinoUno, caption: 'ARDUINO.UNO / R3' },
          options: [
            { key: 'أ', text: 'المنفذ D2' },
            { key: 'ب', text: 'المنفذ D13' },
            { key: 'ج', text: 'المنفذ A0' },
            { key: 'د', text: 'المنفذ GND' }
          ],
          answer: 'ج',
          points: 4
        }
      ]
    },

    /* ============================================================
       SECTION 3 — Sensors (7 questions)
    ============================================================ */
    {
      id: 's3',
      code: 'SNS',
      title: 'الحساسات والمستشعرات',
      questions: [
        {
          id: 'q14',
          type: 'matching',
          title: 'صل بين كل حساس ووظيفته الصحيحة. اختر من القائمة أمام كل حساس.',
          image: { svg: SVG.sensors, caption: '1: DHT11 · 2: HC-SR04 · 3: LDR · 4: PIR' },
          items: [
            { id: 'a', label: 'DHT11', letter: '1' },
            { id: 'b', label: 'HC-SR04', letter: '2' },
            { id: 'c', label: 'LDR', letter: '3' },
            { id: 'd', label: 'PIR', letter: '4' }
          ],
          choices: [
            { value: 'temp_hum', label: 'قياس الحرارة والرطوبة' },
            { value: 'distance', label: 'قياس المسافة بالموجات فوق الصوتية' },
            { value: 'light', label: 'قياس شدة الإضاءة' },
            { value: 'motion', label: 'الكشف عن الحركة' }
          ],
          answer: { a: 'temp_hum', b: 'distance', c: 'light', d: 'motion' },
          points: 8
        },
        {
          id: 'q15',
          type: 'mcq',
          title: 'ما نوع الإشارة الخارجة من حساس الضوء LDR (المقاومة الضوئية)؟',
          options: [
            { key: 'أ', text: 'إشارة تناظرية (Analog)' },
            { key: 'ب', text: 'إشارة رقمية فقط (Digital)' },
            { key: 'ج', text: 'بروتوكول I2C' },
            { key: 'د', text: 'إشارة لاسلكية (WiFi)' }
          ],
          answer: 'أ',
          points: 4
        },
        {
          id: 'q16',
          type: 'true_false',
          title: 'يستخدم حساس HC-SR04 الموجات فوق الصوتية (Ultrasonic) لقياس المسافة.',
          answer: 'صح',
          points: 3
        },
        {
          id: 'q17',
          type: 'short_text',
          title: 'اذكر اسم حساس واحد على الأقل سمعت به أو استخدمته من قبل (بالعربي أو الإنجليزي).',
          placeholder: 'مثال: حساس الحرارة...',
          points: 3
        },
        {
          id: 'q18',
          type: 'short_text',
          title: 'اذكر تطبيقاً عملياً واحداً يمكن استخدام حساس الحركة PIR فيه.',
          placeholder: 'مثال: إنارة تلقائية عند...',
          points: 3
        },
        {
          id: 'q19',
          type: 'long_text',
          title: 'صمّم فكرة مشروع بسيط يستخدم حساس حرارة. اذكر: (1) متى يعمل المشروع؟ (2) ما القطع التي ستحتاجها؟ (3) ما الإشارة التي يرسلها للمستخدم؟',
          placeholder: 'مثال: عند وصول الحرارة إلى...',
          points: 6
        },
        {
          id: 'q20',
          type: 'matching',
          title: 'صل بين كل قطعة إلكترونية ووظيفتها الرئيسية.',
          items: [
            { id: 'a', label: 'LED', letter: 'أ' },
            { id: 'b', label: 'Buzzer', letter: 'ب' },
            { id: 'c', label: 'Motor', letter: 'ج' },
            { id: 'd', label: 'Sensor', letter: 'د' }
          ],
          choices: [
            { value: 'light', label: 'يعطي ضوءاً' },
            { value: 'sound', label: 'يعطي صوتاً' },
            { value: 'movement', label: 'يعطي حركة' },
            { value: 'data', label: 'يقرأ بيانات من البيئة' }
          ],
          answer: { a: 'light', b: 'sound', c: 'movement', d: 'data' },
          points: 6
        }
      ]
    },

    /* ============================================================
       SECTION 4 — Motors & outputs (4 questions)
    ============================================================ */
    {
      id: 's4',
      code: 'ACT',
      title: 'المحركات والمخرجات',
      questions: [
        {
          id: 'q21',
          type: 'image_mcq',
          title: 'انظر إلى المحركات الثلاثة (A, B, C). أيّ محرك يُستخدم عادةً للتحكم بزاوية دقيقة (مثل 0° أو 90° أو 180°)، ويُستخدم غالباً في الروبوتات وأذرع التحكم؟',
          image: { svg: SVG.motors, caption: 'A: DC · B: SERVO · C: STEPPER' },
          options: [
            { key: 'أ', text: 'المحرك A (DC)' },
            { key: 'ب', text: 'المحرك B (Servo)' },
            { key: 'ج', text: 'المحرك C (Stepper)' },
            { key: 'د', text: 'كل المحركات صالحة بنفس الدقة' }
          ],
          answer: 'ب',
          points: 4
        },
        {
          id: 'q22',
          type: 'mcq',
          title: 'ماذا يفعل الطنّان (Buzzer) عند تشغيله؟',
          options: [
            { key: 'أ', text: 'يعطي ضوءاً' },
            { key: 'ب', text: 'يعطي صوتاً' },
            { key: 'ج', text: 'يعطي حرارة' },
            { key: 'د', text: 'يعطي حركة' }
          ],
          answer: 'ب',
          points: 3
        },
        {
          id: 'q23',
          type: 'mcq',
          title: 'أي من الآتي يُعتبر مُخرَجاً (Output) في الدائرة؟',
          options: [
            { key: 'أ', text: 'LED' },
            { key: 'ب', text: 'LDR (حساس الضوء)' },
            { key: 'ج', text: 'DHT11 (حساس الحرارة)' },
            { key: 'د', text: 'HC-SR04 (حساس المسافة)' }
          ],
          answer: 'أ',
          points: 3
        },
        {
          id: 'q24',
          type: 'matching',
          title: 'صنّف كل قطعة إلى مُدخَل (Input) أو مُخرَج (Output).',
          items: [
            { id: 'a', label: 'LED', letter: 'أ' },
            { id: 'b', label: 'Servo Motor', letter: 'ب' },
            { id: 'c', label: 'زر ضغط (Button)', letter: 'ج' },
            { id: 'd', label: 'حساس حرارة', letter: 'د' }
          ],
          choices: [
            { value: 'input',  label: 'مُدخَل (Input)' },
            { value: 'output', label: 'مُخرَج (Output)' }
          ],
          answer: { a: 'output', b: 'output', c: 'input', d: 'input' },
          points: 6
        }
      ]
    },

    /* ============================================================
       SECTION 5 — Communication & Projects (6 questions)
    ============================================================ */
    {
      id: 's5',
      code: 'NET',
      title: 'الاتصالات والمشاريع',
      questions: [
        {
          id: 'q25',
          type: 'mcq',
          title: 'ماذا يعني اختصار IoT؟',
          options: [
            { key: 'أ', text: 'Internet of Things (إنترنت الأشياء)' },
            { key: 'ب', text: 'Input of Technology' },
            { key: 'ج', text: 'Integrated Object Tools' },
            { key: 'د', text: 'Information on Tables' }
          ],
          answer: 'أ',
          points: 3
        },
        {
          id: 'q26',
          type: 'true_false',
          title: 'لوحة ESP32 تحتوي على WiFi و Bluetooth مدمجَين بداخلها.',
          answer: 'صح',
          points: 3
        },
        {
          id: 'q27',
          type: 'matching',
          title: 'صل بين كل تقنية اتصال ومداها/طبيعتها.',
          items: [
            { id: 'a', label: 'WiFi', letter: 'أ' },
            { id: 'b', label: 'Bluetooth', letter: 'ب' },
            { id: 'c', label: 'USB', letter: 'ج' }
          ],
          choices: [
            { value: 'wifi',  label: 'اتصال لاسلكي بمدى متوسط (داخل المبنى)' },
            { value: 'bt',    label: 'اتصال لاسلكي بمدى قصير جداً' },
            { value: 'wired', label: 'اتصال سلكي مباشر' }
          ],
          answer: { a: 'wifi', b: 'bt', c: 'wired' },
          points: 5
        },
        {
          id: 'q28',
          type: 'true_false',
          title: 'البلوتوث يحتاج إلى اتصال بالإنترنت ليعمل بين جهازين.',
          answer: 'خطأ',
          points: 3
        },
        {
          id: 'q29',
          type: 'long_text',
          title: 'اذكر فكرة مشروع بسيط يمكن تنفيذه باستخدام إنترنت الأشياء (IoT). حدد: القطع/الحساسات المستخدمة، وكيف تستفيد من الاتصال بالإنترنت في المشروع.',
          placeholder: 'مثال: نظام ري ذكي...',
          points: 6
        },
        {
          id: 'q30',
          type: 'long_text',
          title: 'لو أعطيتك حرية اختيار أي مشروع من عالم الإلكترونيات لتبنيه — ما هو ذلك المشروع؟ ولماذا؟',
          placeholder: 'اكتب فكرتك بحرية...',
          points: 4
        }
      ]
    }
  ]
};

/* Flat list utility */
QUIZ_DATA.getAllQuestions = function() {
  const flat = [];
  this.sections.forEach((sec, si) => {
    sec.questions.forEach((q, qi) => {
      flat.push({ ...q, sectionIndex: si, sectionId: sec.id, sectionTitle: sec.title, sectionCode: sec.code, indexInSection: qi });
    });
  });
  return flat;
};
