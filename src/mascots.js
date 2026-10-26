// Inline SVG mascots, flat geometric style. Each function(color) returns an SVG string, viewBox 0 0 100 100.

function darken(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) - amt, g = ((n >> 8) & 0xff) - amt, b = (n & 0xff) - amt;
  r = Math.max(0, r); g = Math.max(0, g); b = Math.max(0, b);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function lighten(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 0xff) + amt, b = (n & 0xff) + amt;
  r = Math.min(255, r); g = Math.min(255, g); b = Math.min(255, b);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

const MASCOTS = {
  anger: (c) => `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="${darken(c,30)}" stroke-width="3" stroke-linecap="round">
      <line x1="20" y1="15" x2="30" y2="26"/><line x1="35" y1="8" x2="40" y2="22"/>
      <line x1="80" y1="15" x2="70" y2="26"/><line x1="65" y1="8" x2="60" y2="22"/>
      <line x1="8" y1="45" x2="22" y2="45"/><line x1="92" y1="45" x2="78" y2="45"/>
      <line x1="14" y1="65" x2="26" y2="60"/><line x1="86" y1="65" x2="74" y2="60"/>
    </g>
    <circle cx="50" cy="52" r="30" fill="${c}"/>
    <path d="M25 40 Q50 20 75 40" stroke="${darken(c,20)}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="39" cy="50" r="4.5" fill="${darken(c,60)}"/>
    <circle cx="61" cy="50" r="4.5" fill="${darken(c,60)}"/>
    <path d="M40 65 Q50 60 60 65" stroke="${darken(c,60)}" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`,

  perfect: (c) => `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 25 L20 8 L38 18 Z" fill="${c}"/>
    <path d="M70 25 L80 8 L62 18 Z" fill="${c}"/>
    <ellipse cx="50" cy="55" rx="32" ry="30" fill="${c}"/>
    <circle cx="37" cy="52" r="14" fill="#FBFAF6"/>
    <circle cx="63" cy="52" r="14" fill="#FBFAF6"/>
    <circle cx="37" cy="52" r="6.5" fill="${darken(c,40)}"/>
    <circle cx="63" cy="52" r="6.5" fill="${darken(c,40)}"/>
    <path d="M46 62 L50 68 L54 62 Z" fill="${darken(c,20)}"/>
    <path d="M15 60 Q5 55 12 42" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M85 60 Q95 55 88 42" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/>
  </svg>`,

  anxvig: (c) => `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 30 L14 6 L38 22 Z" fill="${c}"/>
    <path d="M75 30 L86 6 L62 22 Z" fill="${c}"/>
    <path d="M25 30 L20 12 L34 23 Z" fill="${lighten(c,40)}"/>
    <path d="M75 30 L80 12 L66 23 Z" fill="${lighten(c,40)}"/>
    <circle cx="50" cy="56" r="29" fill="${c}"/>
    <path d="M30 44 Q38 40 46 44" stroke="${darken(c,25)}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M54 44 Q62 40 70 44" stroke="${darken(c,25)}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="40" cy="55" r="7" fill="#FBFAF6"/>
    <circle cx="60" cy="55" r="7" fill="#FBFAF6"/>
    <circle cx="40" cy="55" r="3.2" fill="#20221B"/>
    <circle cx="60" cy="55" r="3.2" fill="#20221B"/>
    <path d="M47 66 L50 69 L53 66" stroke="${darken(c,30)}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <g stroke="${darken(c,15)}" stroke-width="1.6" stroke-linecap="round">
      <line x1="16" y1="58" x2="32" y2="60"/><line x1="16" y1="65" x2="32" y2="64"/>
      <line x1="84" y1="58" x2="68" y2="60"/><line x1="84" y1="65" x2="68" y2="64"/>
    </g>
  </svg>`,

  please: (c) => `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="26" cy="26" rx="11" ry="16" fill="${c}" transform="rotate(-15 26 26)"/>
    <ellipse cx="74" cy="26" rx="11" ry="16" fill="${c}" transform="rotate(15 74 26)"/>
    <ellipse cx="50" cy="58" rx="33" ry="29" fill="${c}"/>
    <path d="M36 52 Q40 47 44 52" stroke="${darken(c,45)}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M56 52 Q60 47 64 52" stroke="${darken(c,45)}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="50" cy="66" rx="7" ry="5" fill="${lighten(c,10)}" stroke="${darken(c,45)}" stroke-width="2"/>
    <path d="M50 71 Q50 78 44 80" stroke="#E0637A" stroke-width="5" fill="none" stroke-linecap="round"/>
  </svg>`,

  avoid: (c) => `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="60" rx="38" ry="27" fill="${c}"/>
    <ellipse cx="22" cy="46" rx="7" ry="8" fill="${c}"/>
    <ellipse cx="78" cy="46" rx="7" ry="8" fill="${c}"/>
    <ellipse cx="50" cy="66" rx="20" ry="10" fill="${lighten(c,25)}"/>
    <path d="M36 52 L44 52" stroke="${darken(c,40)}" stroke-width="3" stroke-linecap="round"/>
    <path d="M56 52 L64 52" stroke="${darken(c,40)}" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="42" cy="66" rx="3" ry="2.4" fill="${darken(c,50)}"/>
    <ellipse cx="58" cy="66" rx="3" ry="2.4" fill="${darken(c,50)}"/>
  </svg>`,

  numb: (c) => `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="24" cy="30" rx="9" ry="10" fill="${c}"/>
    <ellipse cx="76" cy="30" rx="9" ry="10" fill="${c}"/>
    <circle cx="50" cy="58" r="32" fill="${c}"/>
    <ellipse cx="27" cy="64" rx="12" ry="10" fill="${lighten(c,22)}"/>
    <ellipse cx="73" cy="64" rx="12" ry="10" fill="${lighten(c,22)}"/>
    <circle cx="40" cy="50" r="3.4" fill="${darken(c,55)}"/>
    <circle cx="60" cy="50" r="3.4" fill="${darken(c,55)}"/>
    <ellipse cx="50" cy="58" rx="3.5" ry="2.6" fill="${darken(c,45)}"/>
  </svg>`,

  self: (c) => `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="${c}" stroke-width="4" stroke-linecap="round">
      <line x1="50" y1="6" x2="50" y2="18"/>
      <line x1="50" y1="82" x2="50" y2="94"/>
      <line x1="6" y1="50" x2="18" y2="50"/>
      <line x1="82" y1="50" x2="94" y2="50"/>
      <line x1="18" y1="18" x2="26" y2="26"/>
      <line x1="74" y1="74" x2="82" y2="82"/>
      <line x1="82" y1="18" x2="74" y2="26"/>
      <line x1="26" y1="74" x2="18" y2="82"/>
    </g>
    <circle cx="50" cy="50" r="22" fill="${c}"/>
    <circle cx="50" cy="50" r="22" fill="none" stroke="${lighten(c,35)}" stroke-width="2"/>
  </svg>`,
};

module.exports = { MASCOTS, darken, lighten };
