import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const outDir = path.join(process.cwd(), "public", "placeholders");
mkdirSync(outDir, { recursive: true });

const W = 1200;
const H = 750;

function grid() {
  let lines = "";
  for (let x = 0; x <= W; x += 60) {
    lines += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#1c1c20" stroke-width="1"/>`;
  }
  for (let y = 0; y <= H; y += 60) {
    lines += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#1c1c20" stroke-width="1"/>`;
  }
  return lines;
}

function scene(variant, title, subtitle) {
  const art = {
    runner: `
      <g opacity="0.9">
        <polygon points="120,620 320,180 520,620" fill="none" stroke="#3b82f6" stroke-width="3"/>
        <polygon points="420,640 640,240 860,640" fill="none" stroke="#52525b" stroke-width="2"/>
        <polygon points="700,660 920,300 1140,660" fill="none" stroke="#3f3f46" stroke-width="2"/>
        <circle cx="320" cy="180" r="14" fill="#3b82f6"/>
        <circle cx="920" cy="300" r="10" fill="#a1a1aa"/>
        <rect x="0" y="620" width="${W}" height="130" fill="#101014"/>
        <rect x="0" y="618" width="${W}" height="2" fill="#3b82f6" opacity="0.8"/>
      </g>`,
    gameplay: `
      <g>
        <rect x="90" y="150" width="480" height="330" rx="10" fill="#101014" stroke="#27272a"/>
        <rect x="120" y="190" width="300" height="14" rx="7" fill="#3b82f6"/>
        <rect x="120" y="220" width="220" height="10" rx="5" fill="#3f3f46"/>
        <rect x="120" y="244" width="260" height="10" rx="5" fill="#27272a"/>
        <rect x="120" y="300" width="120" height="120" rx="8" fill="#18181b" stroke="#3b82f6" stroke-width="2"/>
        <rect x="270" y="300" width="120" height="120" rx="8" fill="#18181b" stroke="#27272a"/>
        <rect x="420" y="300" width="120" height="120" rx="8" fill="#18181b" stroke="#27272a"/>
        <rect x="650" y="150" width="460" height="330" rx="10" fill="#101014" stroke="#27272a"/>
        <polyline points="700,420 780,330 850,380 930,250 1010,300 1080,190" fill="none" stroke="#3b82f6" stroke-width="4"/>
        <circle cx="1080" cy="190" r="8" fill="#60a5fa"/>
      </g>`,
    stealth: `
      <g>
        <circle cx="600" cy="360" r="200" fill="none" stroke="#27272a" stroke-width="2"/>
        <circle cx="600" cy="360" r="130" fill="none" stroke="#3f3f46" stroke-width="2"/>
        <path d="M600 360 L900 180 A360 360 0 0 1 900 540 Z" fill="#3b82f6" opacity="0.14"/>
        <path d="M600 360 L900 180" stroke="#3b82f6" stroke-width="2"/>
        <path d="M600 360 L900 540" stroke="#3b82f6" stroke-width="2"/>
        <rect x="150" y="300" width="90" height="120" rx="6" fill="#18181b" stroke="#52525b"/>
        <rect x="980" y="420" width="70" height="70" rx="6" fill="#18181b" stroke="#3b82f6"/>
        <rect x="300" y="560" width="60" height="60" rx="6" fill="#18181b" stroke="#27272a"/>
      </g>`,
    browser: `
      <g>
        <rect x="90" y="120" width="1020" height="520" rx="14" fill="#101014" stroke="#27272a"/>
        <rect x="90" y="120" width="1020" height="46" rx="14" fill="#18181b"/>
        <circle cx="126" cy="143" r="6" fill="#3f3f46"/>
        <circle cx="148" cy="143" r="6" fill="#3f3f46"/>
        <circle cx="170" cy="143" r="6" fill="#3b82f6"/>
        <rect x="210" y="133" width="420" height="20" rx="10" fill="#0b0b0e" stroke="#27272a"/>
        <rect x="130" y="200" width="300" height="18" rx="9" fill="#3b82f6"/>
        <rect x="130" y="232" width="500" height="10" rx="5" fill="#3f3f46"/>
        <rect x="130" y="252" width="380" height="10" rx="5" fill="#27272a"/>
        <rect x="130" y="300" width="290" height="180" rx="10" fill="#18181b" stroke="#27272a"/>
        <rect x="445" y="300" width="290" height="180" rx="10" fill="#18181b" stroke="#27272a"/>
        <rect x="760" y="300" width="290" height="180" rx="10" fill="#18181b" stroke="#3b82f6" stroke-opacity="0.6"/>
        <rect x="130" y="510" width="180" height="100" rx="10" fill="#0b0b0e" stroke="#27272a"/>
        <rect x="330" y="510" width="180" height="100" rx="10" fill="#0b0b0e" stroke="#27272a"/>
      </g>`,
    dashboard: `
      <g>
        <rect x="90" y="120" width="240" height="520" rx="12" fill="#101014" stroke="#27272a"/>
        <rect x="120" y="160" width="150" height="12" rx="6" fill="#3b82f6"/>
        <rect x="120" y="200" width="180" height="9" rx="4" fill="#3f3f46"/>
        <rect x="120" y="228" width="140" height="9" rx="4" fill="#27272a"/>
        <rect x="120" y="256" width="170" height="9" rx="4" fill="#27272a"/>
        <rect x="360" y="120" width="750" height="150" rx="12" fill="#101014" stroke="#27272a"/>
        <polyline points="400,230 490,180 570,205 660,150 760,190 860,140 1060,175" fill="none" stroke="#3b82f6" stroke-width="4"/>
        <rect x="360" y="300" width="360" height="340" rx="12" fill="#101014" stroke="#27272a"/>
        <rect x="400" y="470" width="46" height="130" fill="#27272a"/>
        <rect x="466" y="410" width="46" height="190" fill="#3b82f6"/>
        <rect x="532" y="500" width="46" height="100" fill="#27272a"/>
        <rect x="598" y="440" width="46" height="160" fill="#3f3f46"/>
        <rect x="750" y="300" width="360" height="340" rx="12" fill="#101014" stroke="#27272a"/>
        <circle cx="930" cy="470" r="110" fill="none" stroke="#27272a" stroke-width="26"/>
        <path d="M930 360 A110 110 0 0 1 1020 520" fill="none" stroke="#3b82f6" stroke-width="26" stroke-linecap="butt"/>
      </g>`,
    ledger: `
      <g>
        <rect x="110" y="140" width="980" height="110" rx="12" fill="#101014" stroke="#27272a"/>
        <rect x="150" y="178" width="160" height="14" rx="7" fill="#3b82f6"/>
        <rect x="150" y="206" width="260" height="10" rx="5" fill="#3f3f46"/>
        <rect x="700" y="172" width="150" height="40" rx="8" fill="#18181b" stroke="#3b82f6" stroke-opacity="0.5"/>
        <rect x="880" y="172" width="170" height="40" rx="8" fill="#18181b" stroke="#27272a"/>
        <rect x="110" y="280" width="980" height="360" rx="12" fill="#101014" stroke="#27272a"/>
        ${Array.from({ length: 7 })
          .map((_, i) => {
            const y = 320 + i * 44;
            return `
            <rect x="150" y="${y}" width="${240 + ((i * 37) % 200)}" height="10" rx="5" fill="${i === 2 ? "#3b82f6" : "#27272a"}"/>
            <rect x="640" y="${y}" width="120" height="10" rx="5" fill="#3f3f46"/>
            <rect x="840" y="${y}" width="80" height="10" rx="5" fill="${i % 3 === 0 ? "#10b981" : "#52525b"}"/>
            <rect x="980" y="${y}" width="70" height="10" rx="5" fill="#3f3f46"/>`;
          })
          .join("")}
      </g>`,
    tokens: `
      <g>
        <rect x="120" y="160" width="200" height="200" rx="16" fill="#09090b" stroke="#27272a"/>
        <text x="220" y="270" font-family="monospace" font-size="26" fill="#3f3f46" text-anchor="middle">01</text>
        <rect x="345" y="160" width="200" height="200" rx="16" fill="#27272a" stroke="#3f3f46"/>
        <text x="445" y="270" font-family="monospace" font-size="26" fill="#a1a1aa" text-anchor="middle">02</text>
        <rect x="570" y="160" width="200" height="200" rx="16" fill="#3b82f6" stroke="#60a5fa"/>
        <text x="670" y="270" font-family="monospace" font-size="26" fill="#ffffff" text-anchor="middle">accent</text>
        <rect x="795" y="160" width="200" height="200" rx="16" fill="#60a5fa" stroke="#93c5fd"/>
        <text x="895" y="270" font-family="monospace" font-size="26" fill="#09090b" text-anchor="middle">soft</text>
        <rect x="120" y="410" width="875" height="24" rx="12" fill="#18181b" stroke="#27272a"/>
        <rect x="120" y="410" width="300" height="24" rx="12" fill="#3b82f6"/>
        <rect x="120" y="470" width="875" height="24" rx="12" fill="#18181b" stroke="#27272a"/>
        <rect x="120" y="470" width="620" height="24" rx="12" fill="#52525b"/>
        <rect x="120" y="530" width="875" height="24" rx="12" fill="#18181b" stroke="#27272a"/>
        <rect x="120" y="530" width="180" height="24" rx="12" fill="#3f3f46"/>
      </g>`,
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${title}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fade" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#09090b" stop-opacity="0.95"/>
      <stop offset="60%" stop-color="#09090b" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#09090b"/>
  <g opacity="0.5">${grid()}</g>
  ${art[variant] ?? ""}
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#fade)"/>
  <text x="60" y="${H - 92}" font-family="ui-monospace, monospace" font-size="26" fill="#3b82f6" letter-spacing="4">${subtitle}</text>
  <text x="60" y="${H - 48}" font-family="system-ui, sans-serif" font-size="46" font-weight="600" fill="#fafafa">${title}</text>
</svg>
`;
}

const files = [
  ["neon-runner.svg", "runner", "Neon Runner", "// GAME DEV"],
  ["void-protocol.svg", "stealth", "Void Protocol", "// GAME DEV"],
  ["gameplay.svg", "gameplay", "Gameplay Systems", "// GAME DEV"],
  ["portototo-cms.svg", "browser", "Portototo CMS", "// WEB & APP"],
  ["koperasi.svg", "ledger", "Koperasi Digital", "// WEB & APP"],
  ["dashboard.svg", "dashboard", "Admin Dashboard", "// WEB & APP"],
  ["design-system.svg", "tokens", "Ardmst Design System", "// UI/UX DESIGN"],
  ["fintech-ui.svg", "dashboard", "Fintech Dashboard UI", "// UI/UX DESIGN"],
  ["tokens.svg", "tokens", "Token Architecture", "// UI/UX DESIGN"],
];

for (const [file, variant, title, subtitle] of files) {
  writeFileSync(path.join(outDir, file), scene(variant, title, subtitle), "utf8");
}

console.log(`wrote ${files.length} placeholder images to ${outDir}`);
