import type { Metadata } from "next";
import Link from "next/link";
import { DetektifPlayer } from "@/components/site/DetektifPlayer";
import { Pic } from "@/components/site/Pic";
import { PICTURES } from "@/content/pictures";

export const metadata: Metadata = {
  title: "Detektif Ekosistem — Game Edukasi Forensik Lingkungan",
  description:
    "Game RPG detektif top-down investigasi kebakaran hutan dan lahan gambut Kalimantan berbasis Model Siklus Belajar Kolb. Dikembangkan oleh Rifkhi Ardi Mustaqim & Eka Putra Noandheli.",
  alternates: { canonical: "/detektif-ekosistem" },
  openGraph: {
    url: "/detektif-ekosistem",
    title: "Detektif Ekosistem — Game Edukasi Forensik Lingkungan",
    description:
      "Game detektif RPG investigasi kebakaran hutan Kalimantan berbasis Siklus Belajar Kolb. Karya kelompok Rifkhi Ardi Mustaqim & Eka Putra Noandheli.",
    images: ["/work/detektif-ekosistem/stage-poster.webp"],
  },
};

const CONTROLS = [
  { keys: "W A S D atau Tombol Panah", does: "Bergerak menelusuri peta" },
  { keys: "E", does: "Bicara ke saksi, periksa bukti fisik" },
  { keys: "Spasi", does: "Lanjutkan percakapan / dialog" },
  { keys: "Esc", does: "Jeda permainan / Pause menu" },
  { keys: "Mouse", does: "Pilihan jawaban & navigasi menu" },
];

const KOLB_PILLARS = [
  {
    code: "CE",
    title: "Concrete Experience",
    subtitle: "Pengalaman Konkret • Merasakan",
    desc: "Merasakan situasi nyata di lapangan dan berempati langsung dengan mendengarkan kesaksian warga desa terdampak bencana asap kebakaran gambut.",
    color: "#e65100",
  },
  {
    code: "RO",
    title: "Reflective Observation",
    subtitle: "Observasi Reflektif • Mengamati",
    desc: "Mengamati kondisi lingkungan secara cermat, menganalisis pola sebaran abu, arah angin, serta merefleksikan bukti fisik di lokasi kejadian.",
    color: "#0288d1",
  },
  {
    code: "AC",
    title: "Abstract Conceptualization",
    subtitle: "Konseptualisasi Abstrak • Menganalisis",
    desc: "Menganalisis data ilmiah & logika sebab-akibat, memadukan grafik cuaca, sensor kelembaban gambut, citra termal drone, dan siklus karbon.",
    color: "#7b1fa2",
  },
  {
    code: "AE",
    title: "Active Experimentation",
    subtitle: "Eksperimen Aktif • Bertindak",
    desc: "Menguji hipotesis melalui tindakan nyata: kalibrasi alat penyelidikan, pemadaman bara tersembunyi, hingga aksi restorasi dan reforestasi.",
    color: "#2e7d32",
  },
];

const STAGES = [
  {
    stage: "Stage 1",
    name: "Desa & Hutan Gambut",
    focus: "Investigasi Awal & Empati Warga (CE / Accommodator)",
    picture: PICTURES.detektifStages.one,
    caption:
      "Detektif Tedy tiba di pemukiman tepi hutan, mewawancarai Pak RT, warga terdampak, dan saksi mata untuk mengumpulkan kesaksian awal.",
  },
  {
    stage: "Stage 2",
    name: "Lahan Terbakar & Api Aktif",
    focus: "Verifikasi Forensik & Citra Drone (Converger)",
    picture: PICTURES.detektifStages.two,
    caption:
      "Menyusuri area bekas terbakar dengan api bawah tanah yang masih aktif. Mengoperasikan drone termal dan mengukur ketebalan gambut yang hangus.",
  },
  {
    stage: "Stage 3",
    name: "Hutan Barat & Hujan",
    focus: "Analisis Mendalam & Restorasi (Assimilator)",
    picture: PICTURES.detektifStages.three,
    caption:
      "Penyelidikan tahap akhir di tengah hujan lebat. Membuka gerbang bendung kanal (canal blocking) dan menyimpulkan profil gaya belajar pada Raport Evaluasi.",
  },
];

export default function DetektifEkosistemPage() {
  return (
    <main className="detektif-page" id="main">
      {/* Top Header / Breadcrumb */}
      <header className="detektif-head">
        <div className="detektif-head-meta">
          <span className="detektif-tag">PROYEK PRAKTIKUM MULTIMEDIA · 2026</span>
          <h1 className="head detektif-main-title">DETEKTIF EKOSISTEM</h1>
          <p className="lead detektif-subhead">
            Game RPG Forensik Kebakaran Hutan & Lahan Gambut Kalimantan
          </p>
          <div className="detektif-authors-badge">
            <span className="detektif-authors-label">Dikembangkan oleh Kelompok:</span>
            <strong className="detektif-authors-names">
              Rifkhi Ardi Mustaqim &amp; Eka Putra Noandheli
            </strong>
          </div>
        </div>

        <div className="detektif-head-nav">
          <Link className="button detektif-back-btn" href="/#work" prefetch={false}>
            &larr; Portofolio Utama
          </Link>
        </div>
      </header>

      {/* Main Interactive Stage & Description Grid */}
      <section className="detektif-hero-grid">
        <div className="detektif-hero-player">
          <DetektifPlayer
            videoWebm="/work/detektif-ekosistem/menu-loop.webm"
            videoMp4="/work/detektif-ekosistem/menu-loop.mp4"
            poster="/work/detektif-ekosistem/stage-poster.webp"
            themeAudio="/work/detektif-ekosistem/theme.mp3"
            downloadUrl="/detektif-ekosistem/download"
            mirrorUrl="https://drive.google.com/file/d/1vG9aKz4sgGhr4X1aoxixbJWitFqMHBbx/view"
          />
        </div>

        <div className="detektif-hero-info">
          <div className="detektif-info-block">
            <h2 className="detektif-section-title">Tentang Permainan</h2>
            <p className="detektif-info-text">
              <strong>Detektif Ekosistem</strong> adalah game detektif edukatif bertema investigasi forensik kebakaran hutan dan lahan gambut di Kalimantan. Pemain berperan sebagai <strong>Detektif Tedy</strong> yang ditugaskan mengungkap pemicu kebakaran, memetakan kerusakan ekologis, dan menentukan langkah restorasi lingkungan.
            </p>
            <p className="detektif-info-text">
              Di sepanjang penyelidikan, pemain berinteraksi dengan berbagai saksi (seperti Pak RT, tim Pemadam Kebakaran, dan saksi kunci Windah Basudara), memeriksa serpihan bukti lapangan, mengoperasikan sensor kelembaban, serta memadukan data citra termal drone.
            </p>
          </div>

          <div className="detektif-info-block detektif-kolb-callout">
            <h3 className="detektif-callout-title">Model Pembelajaran Kolb</h3>
            <p className="detektif-callout-text">
              Setiap keputusan penyelidikan mengukur kecenderungan belajar pengguna menurut <strong>Experiential Learning Theory (David Kolb)</strong>. Di akhir stage ke-3, pemain memperoleh <strong>Raport Hasil Evaluasi</strong> lengkap yang memetakan gaya belajar dominan mereka: <em>Accommodator, Diverger, Converger,</em> atau <em>Assimilator</em>.
            </p>
          </div>

          <div className="detektif-facts-box">
            <h3 className="detektif-facts-title">Spesifikasi &amp; Teknologi</h3>
            <ul className="detektif-facts-list">
              <li><strong>Engine:</strong> Godot Engine 4.7.2 (GDScript)</li>
              <li><strong>Grafis:</strong> Pixel Art 16-bit Hand-laid Tilemaps</li>
              <li><strong>Fitur Khusus:</strong> Sistem Raport Kolb, Minimap Dinamis, Footprint Trail Tracker, Dynamic Weather FX</li>
              <li><strong>Platform:</strong> Web (HTML5/WASM Single-threaded) &amp; Windows Desktop (.exe)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Controls & Before You Start */}
      <section className="detektif-guides-grid">
        <div className="detektif-guide-card">
          <h2 className="lead">Panduan Kontrol</h2>
          <dl className="play__keys">
            {CONTROLS.map((row) => (
              <div key={row.keys}>
                <dt>{row.does}</dt>
                <dd>{row.keys}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="detektif-guide-card">
          <h2 className="lead">Catatan Sebelum Memulai</h2>
          <ul className="play__list">
            <li>Game ini dirancang untuk komputer/laptop menggunakan <strong>Keyboard &amp; Mouse</strong>.</li>
            <li>Saat pertama kali bermain di web, browser mengunduh engine Godot (~48 MB).</li>
            <li><strong>Audio Game:</strong> Begitu tombol Play diklik atau layar game ditekan, musik latar dan efek suara otomatis aktif.</li>
            <li>Jika ingin layar penuh, gunakan tombol <strong>Maximize</strong> di pojok kanan atas frame permainan.</li>
            <li>Tersedia file executable standalone untuk Windows yang dapat langsung dijalankan tanpa browser.</li>
          </ul>
        </div>
      </section>

      {/* 4 Pilar Siklus Belajar Kolb */}
      <section className="detektif-kolb-section">
        <h2 className="lead detektif-sublead">4 Pilar Siklus Belajar Kolb dalam Game</h2>
        <div className="detektif-kolb-cards">
          {KOLB_PILLARS.map((p) => (
            <div key={p.code} className="detektif-pillar-card" style={{ borderColor: `${p.color}40` }}>
              <div className="detektif-pillar-header">
                <span className="detektif-pillar-badge" style={{ backgroundColor: p.color }}>
                  {p.code}
                </span>
                <div>
                  <h3 className="detektif-pillar-name">{p.title}</h3>
                  <p className="detektif-pillar-mode">{p.subtitle}</p>
                </div>
              </div>
              <p className="detektif-pillar-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery of 3 Maps to Walk */}
      <section className="detektif-stages-section">
        <h2 className="lead detektif-sublead">Tiga Stage Penyelidikan</h2>
        <div className="detektif-stages-grid">
          {STAGES.map((st) => (
            <figure key={st.stage} className="detektif-stage-item">
              <div className="detektif-stage-pic-wrap">
                <Pic picture={st.picture} className="play__still" decorative />
              </div>
              <figcaption>
                <strong>{st.stage}: {st.name}</strong>
                <span className="detektif-stage-focus">{st.focus}</span>
                <p className="small muted">{st.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Footer Return Navigation */}
      <footer className="detektif-footer">
        <div className="detektif-footer-content">
          <p className="detektif-footer-credit">
            Detektif Ekosistem © 2026 • Media Pembelajaran Interaktif Praktikum Multimedia
            <br />
            Karya: <strong>Rifkhi Ardi Mustaqim</strong> &amp; <strong>Eka Putra Noandheli</strong>
          </p>
          <div className="detektif-footer-actions">
            <Link className="link" href="/#work" prefetch={false}>
              &larr; Kembali ke Portofolio Utama
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
