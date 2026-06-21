"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF8F5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-sans, sans-serif)",
        textAlign: "center",
        direction: "rtl",
        padding: "2rem",
      }}
    >
      <p style={{ fontSize: 80, fontWeight: 300, color: "#2E2A26", lineHeight: 1, marginBottom: 4, letterSpacing: -3 }}>
        404
      </p>
      <p style={{ fontSize: 15, color: "#6B6763", marginBottom: 36 }}>
        העמוד שחיפשת לא נמצא
      </p>

      <GiftBox />

      <p id="gift-hint" style={{ fontSize: 13, color: "#B08D57", marginTop: 8, marginBottom: 32, transition: "opacity .4s" }}>
        משוך את החוט כדי לפתוח 🎁
      </p>

      <button
        onClick={() => router.back()}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "11px 28px",
          border: "1.5px solid #B08D57",
          borderRadius: 4,
          fontSize: 14,
          color: "#B08D57",
          background: "transparent",
          cursor: "pointer",
          letterSpacing: "0.08em",
          transition: "all .2s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#B08D57"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#B08D57"; }}
      >
        ← חזור לעמוד הקודם
      </button>
    </div>
  );
}

function GiftBox() {
  return (
    <div style={{ position: "relative", width: 180, height: 210, cursor: "pointer" }}>
      <style>{`
        #gift-scene { overflow: visible }
        #ribbon-handle { cursor: grab; transition: transform .2s }
        #ribbon-handle:active { cursor: grabbing }
        #lid { transform-origin: 90px 58px; transition: transform .65s cubic-bezier(.34,1.56,.64,1) }
        #sp1,#sp2,#sp3,#sp4,#st1,#st2,#st3 { opacity: 0; transition: opacity .3s }
        #confetti-text { position: absolute; top: 15px; left: 50%; transform: translateX(-50%) translateY(10px); font-size: 17px; font-weight: 500; color: #B08D57; white-space: nowrap; opacity: 0; pointer-events: none; z-index: 10 }

        @keyframes wiggle { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-4deg)} 75%{transform:rotate(4deg)} }
        .idle { animation: wiggle 2.2s ease-in-out infinite }

        @keyframes floatUp { 0%{opacity:0;transform:translateX(-50%) translateY(10px)} 50%{opacity:1;transform:translateX(-50%) translateY(-28px)} 100%{opacity:1;transform:translateX(-50%) translateY(-42px)} }

        .opened #lid { transform: rotate(-38deg) translateY(-20px) }
        .opened #ribbon-handle { transform: translateY(-100px); opacity: 0; transition: transform .5s, opacity .3s }
        .opened #sp1 { opacity:1 }
        .opened #sp2 { opacity:1; transition-delay:.1s }
        .opened #sp3 { opacity:1; transition-delay:.2s }
        .opened #sp4 { opacity:1; transition-delay:.3s }
        .opened #st1 { opacity:1; transition-delay:.35s }
        .opened #st2 { opacity:1; transition-delay:.45s }
        .opened #st3 { opacity:1; transition-delay:.55s }
        .opened #confetti-text { animation: floatUp .7s ease-out .3s forwards }
        .opened #gift-hint { opacity: 0 }
        .pulling #ribbon-handle { transform: translateY(-22px) }
      `}</style>

      <div id="confetti-text">מתנה עם ערך</div>

      <svg id="gift-scene" viewBox="0 0 180 200" width="180" height="200">
        {/* Box body */}
        <rect x="15" y="90" width="150" height="100" rx="6" fill="#FAF8F5" stroke="#B08D57" strokeWidth="1.5"/>
        <rect x="82" y="90" width="16" height="100" fill="#B08D57" fillOpacity=".25"/>
        <rect x="15" y="128" width="150" height="14" fill="#B08D57" fillOpacity=".25"/>

        {/* Lid */}
        <g id="lid">
          <rect x="10" y="58" width="160" height="38" rx="5" fill="#FAF8F5" stroke="#B08D57" strokeWidth="1.5"/>
          <rect x="82" y="58" width="16" height="38" fill="#B08D57" fillOpacity=".25"/>
          {/* Bow */}
          <ellipse cx="68" cy="53" rx="22" ry="13" fill="#B08D57" fillOpacity=".85" transform="rotate(-20 68 53)"/>
          <ellipse cx="68" cy="53" rx="13" ry="7.5" fill="#9a7a48" transform="rotate(-20 68 53)"/>
          <ellipse cx="112" cy="53" rx="22" ry="13" fill="#B08D57" fillOpacity=".85" transform="rotate(20 112 53)"/>
          <ellipse cx="112" cy="53" rx="13" ry="7.5" fill="#9a7a48" transform="rotate(20 112 53)"/>
          <ellipse cx="90" cy="55" rx="11" ry="9" fill="#B08D57"/>
          <ellipse cx="90" cy="55" rx="6.5" ry="5.5" fill="#9a7a48"/>
        </g>

        {/* Pull handle */}
        <g id="ribbon-handle" className="idle">
          <line x1="90" y1="52" x2="90" y2="28" stroke="#B08D57" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="90" cy="19" r="10" fill="none" stroke="#B08D57" strokeWidth="2"/>
          <line x1="90" y1="11" x2="90" y2="6" stroke="#B08D57" strokeWidth="2" strokeLinecap="round"/>
          <path d="M85 2 L90 6 L95 2" fill="none" stroke="#B08D57" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </g>

        {/* Sparkles */}
        <g id="sp1"><text x="28" y="86" fontSize="18" textAnchor="middle" fill="#B08D57">✦</text></g>
        <g id="sp2"><text x="152" y="82" fontSize="13" textAnchor="middle" fill="#B08D57">✦</text></g>
        <g id="sp3"><text x="48" y="72" fontSize="11" textAnchor="middle" fill="#B08D57">✦</text></g>
        <g id="sp4"><text x="140" y="68" fontSize="15" textAnchor="middle" fill="#B08D57">✦</text></g>
        <g id="st1"><text x="18" y="58" fontSize="10" textAnchor="middle" fill="#B08D57">★</text></g>
        <g id="st2"><text x="163" y="62" fontSize="9" textAnchor="middle" fill="#B08D57">★</text></g>
        <g id="st3"><text x="90" y="20" fontSize="8" textAnchor="middle" fill="#B08D57">✦</text></g>
      </svg>

      <GiftScript />
    </div>
  );
}

function GiftScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
(function() {
  var scene = document.querySelector('[id="gift-scene"]').parentElement;
  var handle = document.getElementById('ribbon-handle');
  var hint = document.getElementById('gift-hint');
  if (!handle || !scene) return;
  var opened = false, pulling = false, startY = 0;

  function open() {
    if (opened) return;
    opened = true;
    scene.classList.add('opened');
    handle.classList.remove('idle');
    if (hint) hint.style.opacity = '0';
  }

  handle.addEventListener('mousedown', function(e) { if (opened) return; pulling = true; startY = e.clientY; handle.classList.remove('idle'); e.preventDefault(); });
  document.addEventListener('mousemove', function(e) { if (!pulling || opened) return; var d = startY - e.clientY; if (d > 5) scene.classList.add('pulling'); if (d > 45) { pulling = false; open(); } });
  document.addEventListener('mouseup', function() { if (!opened) scene.classList.remove('pulling'); pulling = false; });
  handle.addEventListener('touchstart', function(e) { if (opened) return; pulling = true; startY = e.touches[0].clientY; handle.classList.remove('idle'); e.preventDefault(); }, {passive:false});
  document.addEventListener('touchmove', function(e) { if (!pulling || opened) return; var d = startY - e.touches[0].clientY; if (d > 5) scene.classList.add('pulling'); if (d > 45) { pulling = false; open(); } }, {passive:true});
  document.addEventListener('touchend', function() { if (!opened) scene.classList.remove('pulling'); pulling = false; });
  handle.addEventListener('click', function() { if (!opened) open(); });
})();
        `,
      }}
    />
  );
}
