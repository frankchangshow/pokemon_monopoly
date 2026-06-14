/**
 * assets.js - Data structures for Paldea Monopoly
 * Contains: Pokemon DB, Board Spaces config, Chance/Community Chest cards, and SVG sprite templates.
 * Custom styled with bold manga/comic outlines, speed lines, and action backgrounds.
 */

// Custom SVGs for Pokémon to display them beautifully on the board and in battles.
// Features: Bold black contours, cell shading, speed lines, and elemental action effects.
export const PokemonSVGs = {
  Sprigatito: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <!-- Comic Panel Background -->
      <rect width="100" height="100" fill="#E8F8F5" rx="12" stroke="#000" stroke-width="4.5"/>
      <path d="M-10,30 L110,80 M20,-10 L70,110" stroke="#2ECC71" stroke-width="1.5" opacity="0.3"/>
      <!-- Green Leaf Aura / Swirls -->
      <path d="M 15 70 Q 10 50 30 30 Q 55 45 40 75 Z" fill="#58D68D" stroke="#000" stroke-width="3"/>
      <path d="M 75 25 Q 90 45 70 65 Q 55 50 65 30 Z" fill="#2ECC71" stroke="#000" stroke-width="3"/>
      <!-- Head Base -->
      <circle cx="50" cy="55" r="28" fill="#A9DFBF" stroke="#000" stroke-width="4.5"/>
      <!-- Action Ears -->
      <polygon points="22,34 5,8 40,24" fill="#2ECC71" stroke="#000" stroke-width="4.5" stroke-linejoin="round"/>
      <polygon points="22,34 10,15 32,26" fill="#F5B7B1" stroke="#000" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="78,34 95,8 60,24" fill="#2ECC71" stroke="#000" stroke-width="4.5" stroke-linejoin="round"/>
      <polygon points="78,34 90,15 68,26" fill="#F5B7B1" stroke="#000" stroke-width="3" stroke-linejoin="round"/>
      <!-- Determined Anime Eyes -->
      <path d="M 28 42 L 44 46" stroke="#000" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="36" cy="52" rx="7" ry="10" fill="#F39C12" stroke="#000" stroke-width="3"/>
      <ellipse cx="35" cy="50" rx="5" ry="7" fill="#E67E22"/>
      <circle cx="34" cy="48" r="2.5" fill="#FFF"/>
      
      <path d="M 72 42 L 56 46" stroke="#000" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="64" cy="52" rx="7" ry="10" fill="#F39C12" stroke="#000" stroke-width="3"/>
      <ellipse cx="65" cy="50" rx="5" ry="7" fill="#E67E22"/>
      <circle cx="63" cy="48" r="2.5" fill="#FFF"/>
      <!-- Leaf Collar / Face Pattern -->
      <path d="M 50 64 L 40 50 L 50 42 L 60 50 Z" fill="#27AE60" stroke="#000" stroke-width="3"/>
      <!-- Tiny Nose & Mouth -->
      <polygon points="48,58 52,58 50,61" fill="#196F3D"/>
      <path d="M 45 66 Q 50 71 55 66" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round"/>
      <!-- Action Sparks -->
      <path d="M 12 25 L 18 28 M 85 75 L 90 80 M 82 25 L 87 22" stroke="#27AE60" stroke-width="3.5" stroke-linecap="round"/>
    </svg>
  `,
  Fuecoco: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <!-- Comic Panel Background -->
      <rect width="100" height="100" fill="#FDEDEC" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Flame FX Background -->
      <path d="M 20 85 C 10 55 40 40 35 25 C 50 45 45 60 65 50 C 70 70 50 85 50 85 Z" fill="#F39C12" opacity="0.6"/>
      <path d="M 55 85 C 65 60 85 55 75 35 C 80 55 65 68 55 85 Z" fill="#E67E22" opacity="0.6"/>
      <!-- Head Base -->
      <circle cx="50" cy="58" r="28" fill="#EC7063" stroke="#000" stroke-width="4.5"/>
      <!-- White Face Overlay (Manga Mask) -->
      <path d="M 26 56 C 26 38 74 38 74 56 C 74 72 26 72 26 56 Z" fill="#FFFDF9" stroke="#000" stroke-width="4"/>
      <!-- Yellow Hair Tuft (Sprouting Flame) -->
      <path d="M 50 30 Q 38 12 44 8 Q 50 18 50 30" fill="#F4D03F" stroke="#000" stroke-width="3"/>
      <path d="M 50 30 Q 62 12 56 8 Q 50 18 50 30" fill="#F4D03F" stroke="#000" stroke-width="3"/>
      <!-- Angry/Happy Eyes -->
      <path d="M 32 42 L 44 45 M 68 42 L 56 45" stroke="#000" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="38" cy="51" r="5.5" fill="#2C3E50" stroke="#000" stroke-width="2.5"/>
      <circle cx="36" cy="49" r="2" fill="#FFF"/>
      <circle cx="62" cy="51" r="5.5" fill="#2C3E50" stroke="#000" stroke-width="2.5"/>
      <circle cx="60" cy="49" r="2" fill="#FFF"/>
      <!-- Snout & Nostrils -->
      <ellipse cx="50" cy="59" rx="8" ry="4.5" fill="#EC7063" stroke="#000" stroke-width="2.5"/>
      <circle cx="47" cy="59" r="1.5" fill="#7B241C"/>
      <circle cx="53" cy="59" r="1.5" fill="#7B241C"/>
      <!-- Sharp Teeth -->
      <polygon points="40,63 44,63 42,68" fill="#FFF" stroke="#000" stroke-width="2.5"/>
      <polygon points="56,63 60,63 58,68" fill="#FFF" stroke="#000" stroke-width="2.5"/>
      <!-- Action lines -->
      <line x1="10" y1="15" x2="22" y2="25" stroke="#E74C3C" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `,
  Quaxly: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <!-- Comic Panel Background -->
      <rect width="100" height="100" fill="#EBF5FB" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Swirling Water Swirl -->
      <path d="M 10 30 Q 30 10 50 30 T 90 30" fill="none" stroke="#5DADE2" stroke-width="6" stroke-linecap="round" opacity="0.4"/>
      <path d="M 15 45 Q 40 65 75 45" fill="none" stroke="#2980B9" stroke-width="4" stroke-linecap="round" opacity="0.3"/>
      <!-- Head Base -->
      <circle cx="50" cy="58" r="27" fill="#AED6F1" stroke="#000" stroke-width="4.5"/>
      <!-- Wave Hat (Manga styled blue hair/crest) -->
      <path d="M 22 42 Q 50 12 78 42 Q 74 24 50 28 Q 26 24 22 42 Z" fill="#2980B9" stroke="#000" stroke-width="4.5"/>
      <path d="M 32 32 Q 50 10 68 32 Q 50 20 32 32" fill="#3498DB" stroke="#000" stroke-width="3"/>
      <!-- Anime Determined Eyes -->
      <path d="M 30 45 L 42 48 M 70 45 L 58 48" stroke="#000" stroke-width="3.5" stroke-linecap="round"/>
      <ellipse cx="37" cy="54" rx="6" ry="9" fill="#1B4F72" stroke="#000" stroke-width="3"/>
      <circle cx="35" cy="51" r="2.5" fill="#FFF"/>
      <ellipse cx="63" cy="54" rx="6" ry="9" fill="#1B4F72" stroke="#000" stroke-width="3"/>
      <circle cx="61" cy="51" r="2.5" fill="#FFF"/>
      <!-- Beak -->
      <path d="M 40 60 Q 50 52 60 60 Q 50 68 40 60 Z" fill="#F4D03F" stroke="#000" stroke-width="3"/>
    </svg>
  `,
  Pawmi: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#FEF9E7" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Electric shock sparks in background -->
      <path d="M 15 15 L 25 25 L 20 35 M 85 15 L 75 25 L 80 35" fill="none" stroke="#F1C40F" stroke-width="4" stroke-linecap="round"/>
      <!-- Body -->
      <circle cx="50" cy="58" r="28" fill="#E67E22" stroke="#000" stroke-width="4.5"/>
      <!-- Ears -->
      <ellipse cx="25" cy="30" rx="11" ry="15" fill="#CA6F1E" stroke="#000" stroke-width="4.5" transform="rotate(-15, 25, 30)"/>
      <ellipse cx="25" cy="30" rx="7" ry="10" fill="#FADBD8" transform="rotate(-15, 25, 30)"/>
      <ellipse cx="75" cy="30" rx="11" ry="15" fill="#CA6F1E" stroke="#000" stroke-width="4.5" transform="rotate(15, 75, 30)"/>
      <ellipse cx="75" cy="30" rx="7" ry="10" fill="#FADBD8" transform="rotate(15, 75, 30)"/>
      <!-- Tuft of hair -->
      <path d="M 40 28 Q 50 10 60 28" fill="#E67E22" stroke="#000" stroke-width="4"/>
      <path d="M 44 29 Q 50 16 56 29" fill="#F39C12" stroke="#000" stroke-width="2.5"/>
      <!-- Electric Cheek Pads (Saturated red) -->
      <circle cx="28" cy="62" r="8" fill="#E74C3C" stroke="#000" stroke-width="3"/>
      <circle cx="72" cy="62" r="8" fill="#E74C3C" stroke="#000" stroke-width="3"/>
      <!-- Action Eyes -->
      <path d="M 32 43 L 42 45 M 68 43 L 58 45" stroke="#000" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="38" cy="50" r="5" fill="#2C3E50" stroke="#000" stroke-width="2.5"/>
      <circle cx="62" cy="50" r="5" fill="#2C3E50" stroke="#000" stroke-width="2.5"/>
      <circle cx="36" cy="48" r="1.5" fill="#FFF"/>
      <circle cx="60" cy="48" r="1.5" fill="#FFF"/>
      <!-- Nose & Mouth -->
      <circle cx="50" cy="55" r="2" fill="#000"/>
      <path d="M 46 58 Q 50 61 54 58" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `,
  Lechonk: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#EAECEE" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Dust clouds / action marks -->
      <path d="M 10 75 Q 25 70 30 85 M 90 75 Q 75 70 70 85" stroke="#BDC3C7" stroke-width="4" stroke-linecap="round" fill="none"/>
      <circle cx="50" cy="54" r="28" fill="#5D6D7E" stroke="#000" stroke-width="4.5"/>
      <!-- Mask -->
      <path d="M 23 48 C 23 35 77 35 77 48 C 77 62 23 62 23 48 Z" fill="#5F4B32" stroke="#000" stroke-width="3.5"/>
      <!-- Snout -->
      <ellipse cx="50" cy="58" rx="12" ry="8.5" fill="#F5B7B1" stroke="#000" stroke-width="3.5"/>
      <circle cx="45" cy="58" r="2" fill="#78281F"/>
      <circle cx="55" cy="58" r="2" fill="#78281F"/>
      <!-- Ears -->
      <path d="M 23 36 Q 10 40 18 60 Q 25 58 26 44 Z" fill="#34495E" stroke="#000" stroke-width="3.5"/>
      <path d="M 77 36 Q 90 40 82 60 Q 75 58 74 44 Z" fill="#34495E" stroke="#000" stroke-width="3.5"/>
      <!-- Glowing Yellow Eyes -->
      <ellipse cx="36" cy="46" rx="4" ry="6" fill="#F1C40F" stroke="#000" stroke-width="2"/>
      <ellipse cx="64" cy="46" rx="4" ry="6" fill="#F1C40F" stroke="#000" stroke-width="2"/>
      <circle cx="36" cy="46" r="1.5" fill="#000"/>
      <circle cx="64" cy="46" r="1.5" fill="#000"/>
    </svg>
  `,
  Tarountula: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#F9EBEA" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Web lines -->
      <path d="M 0 0 L 100 100 M 100 0 L 0 100 M 0 50 L 100 50 M 50 0 L 50 100" stroke="#FFF" stroke-width="2" opacity="0.8"/>
      <!-- Legs -->
      <path d="M 25 50 Q 5 30 15 65 M 20 55 Q -2 40 10 70 M 75 50 Q 95 30 85 65 M 80 55 Q 102 40 90 70" fill="none" stroke="#F4D03F" stroke-width="5" stroke-linecap="round"/>
      <path d="M 25 50 Q 5 30 15 65 M 20 55 Q -2 40 10 70 M 75 50 Q 95 30 85 65 M 80 55 Q 102 40 90 70" fill="none" stroke="#000" stroke-width="9" stroke-linecap="round" style="z-index:-1;"/>
      <!-- Wool Ball Body -->
      <circle cx="50" cy="50" r="28" fill="#F4F6F7" stroke="#000" stroke-width="4.5"/>
      <path d="M 26 42 Q 50 65 74 42 M 30 58 Q 50 35 70 58" fill="none" stroke="#D5D8DC" stroke-width="3" stroke-linecap="round"/>
      <!-- Mask/Face -->
      <circle cx="50" cy="46" r="13" fill="#F4D03F" stroke="#000" stroke-width="3"/>
      <!-- Red determined eyes -->
      <circle cx="45" cy="44" r="3" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
      <circle cx="55" cy="44" r="3" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    </svg>
  `,
  Fidough: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#FEF9E7" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Starburst action splash -->
      <polygon points="50,10 55,25 70,20 63,33 78,35 65,45 72,58 58,58 55,72 45,58 31,58 38,45 25,35 40,33 33,20 48,25" fill="#FADBD8" opacity="0.6"/>
      <!-- Ears -->
      <circle cx="22" cy="48" r="14.5" fill="#F5CBA7" stroke="#000" stroke-width="4"/>
      <circle cx="20" cy="48" r="9" fill="#F9E79F" stroke="#000" stroke-width="2.5"/>
      <circle cx="78" cy="48" r="14.5" fill="#F5CBA7" stroke="#000" stroke-width="4"/>
      <circle cx="80" cy="48" r="9" fill="#F9E79F" stroke="#000" stroke-width="2.5"/>
      <!-- Head -->
      <circle cx="50" cy="52" r="24" fill="#FFF2CC" stroke="#000" stroke-width="4.5"/>
      <!-- Top Puff -->
      <circle cx="50" cy="28" r="11" fill="#F5CBA7" stroke="#000" stroke-width="4"/>
      <!-- Eyes -->
      <circle cx="41" cy="48" r="4.5" fill="#7E5109" stroke="#000" stroke-width="1.5"/>
      <circle cx="59" cy="48" r="4.5" fill="#7E5109" stroke="#000" stroke-width="1.5"/>
      <circle cx="39" cy="46" r="1.5" fill="#FFF"/>
      <circle cx="57" cy="46" r="1.5" fill="#FFF"/>
      <polygon points="48,53 52,53 50,56" fill="#D35400" stroke="#000" stroke-width="1.5"/>
      <path d="M 45 59 Q 50 63 55 59" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `,
  Smoliv: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#E8F8F5" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Oil splatters -->
      <ellipse cx="20" cy="30" rx="8" ry="4" fill="#F1C40F" opacity="0.6"/>
      <ellipse cx="80" cy="70" rx="6" ry="3" fill="#F1C40F" opacity="0.6"/>
      <!-- Olive Body -->
      <ellipse cx="50" cy="54" rx="23" ry="31" fill="#7D9C33" stroke="#000" stroke-width="4.5"/>
      <!-- Giant Oil Drop on Head -->
      <circle cx="50" cy="22" r="12" fill="#F1C40F" stroke="#000" stroke-width="3.5"/>
      <circle cx="47" cy="19" r="3.5" fill="#FFF" opacity="0.8"/>
      <!-- Face Overlay -->
      <ellipse cx="50" cy="58" rx="15" ry="17" fill="#C5E1A5" stroke="#000" stroke-width="3"/>
      <!-- Worried Eyes -->
      <path d="M 40 48 Q 45 44 47 48 M 60 48 Q 55 44 53 48" fill="none" stroke="#000" stroke-width="3"/>
      <ellipse cx="43" cy="54" rx="3.5" ry="5" fill="#1B4F72"/>
      <ellipse cx="57" cy="54" rx="3.5" ry="5" fill="#1B4F72"/>
      <circle cx="42" cy="52" r="1" fill="#FFF"/>
      <circle cx="56" cy="52" r="1" fill="#FFF"/>
      <!-- Tiny wobbly mouth -->
      <path d="M 47 64 Q 50 61 53 64" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `,
  Tandemaus: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#F2F4F4" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Left Mouse -->
      <circle cx="34" cy="56" r="17" fill="#BDC3C7" stroke="#000" stroke-width="3.5"/>
      <circle cx="21" cy="38" r="8" fill="#BDC3C7" stroke="#000" stroke-width="3"/>
      <circle cx="21" cy="38" r="4" fill="#EAEDED"/>
      <circle cx="45" cy="38" r="8" fill="#BDC3C7" stroke="#000" stroke-width="3"/>
      <circle cx="45" cy="38" r="4" fill="#EAEDED"/>
      <circle cx="30" cy="53" r="2.5" fill="#000"/>
      <circle cx="38" cy="53" r="2.5" fill="#000"/>
      <path d="M 32 59 Q 34 61 36 59" stroke="#000" stroke-width="2" fill="none"/>

      <!-- Right Mouse -->
      <circle cx="66" cy="56" r="17" fill="#BDC3C7" stroke="#000" stroke-width="3.5"/>
      <circle cx="55" cy="38" r="8" fill="#BDC3C7" stroke="#000" stroke-width="3"/>
      <circle cx="55" cy="38" r="4" fill="#EAEDED"/>
      <circle cx="77" cy="38" r="8" fill="#BDC3C7" stroke="#000" stroke-width="3"/>
      <circle cx="77" cy="38" r="4" fill="#EAEDED"/>
      <circle cx="62" cy="53" r="2.5" fill="#000"/>
      <circle cx="70" cy="53" r="2.5" fill="#000"/>
      <path d="M 64 59 Q 66 61 68 59" stroke="#000" stroke-width="2" fill="none"/>
    </svg>
  `,
  Nacli: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#FEF5E7" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Salt Cube Body -->
      <rect x="23" y="44" width="54" height="36" fill="#D35400" stroke="#000" stroke-width="4.5" rx="3"/>
      <!-- Salt Stack Head -->
      <rect x="34" y="24" width="32" height="26" fill="#F6DDCC" stroke="#000" stroke-width="4" rx="2"/>
      <rect x="38" y="18" width="24" height="8" fill="#FFF" stroke="#000" stroke-width="2" rx="1"/>
      <!-- Glowing Yellow Laser Eyes (Anime-Style) -->
      <rect x="39" y="32" width="8" height="5" fill="#F1C40F" stroke="#000" stroke-width="1.5"/>
      <rect x="53" y="32" width="8" height="5" fill="#F1C40F" stroke="#000" stroke-width="1.5"/>
    </svg>
  `,
  Charcadet: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#FDEDEC" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Fire explosion backdrop -->
      <path d="M 10 50 L 30 40 L 20 20 L 40 30 L 50 10 L 60 30 L 80 20 L 70 40 L 90 50 L 70 60 L 80 80 L 60 70 L 50 90 L 40 70 L 20 80 L 30 60 Z" fill="#F39C12" opacity="0.6"/>
      <!-- Head Helmet -->
      <circle cx="50" cy="50" r="27" fill="#2C3E50" stroke="#000" stroke-width="4.5"/>
      <!-- Opening Face Mask -->
      <path d="M 30 48 Q 50 24 70 48 Q 50 72 30 48 Z" fill="#E74C3C" stroke="#000" stroke-width="3"/>
      <!-- Flaming Crest -->
      <path d="M 50 24 Q 35 2 50 -1 Q 65 2 50 24" fill="#F1C40F" stroke="#000" stroke-width="3.5"/>
      <!-- Laser Flame Eyes -->
      <polygon points="38,46 46,42 43,50" fill="#F1C40F" stroke="#000" stroke-width="1.5"/>
      <polygon points="62,46 54,42 57,50" fill="#F1C40F" stroke="#000" stroke-width="1.5"/>
    </svg>
  `,
  Orthworm: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#EAEDED" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Coiled worm background -->
      <path d="M 15 70 Q 50 85 85 70" fill="none" stroke="#922B21" stroke-width="12" stroke-linecap="round"/>
      <path d="M 15 70 Q 50 85 85 70" fill="none" stroke="#000" stroke-width="18" stroke-linecap="round" style="z-index:-1;"/>
      <!-- Giant head -->
      <ellipse cx="50" cy="42" rx="27" ry="23" fill="#E74C3C" stroke="#000" stroke-width="4.5"/>
      <ellipse cx="50" cy="49" rx="18" ry="12" fill="#FADBD8" stroke="#000" stroke-width="3"/>
      <!-- Angry comic eyes -->
      <path d="M 30 25 L 42 29 M 70 25 L 58 29" stroke="#000" stroke-width="4" stroke-linecap="round"/>
      <circle cx="36" cy="33" r="7.5" fill="#FFF" stroke="#000" stroke-width="3"/>
      <circle cx="36" cy="33" r="3" fill="#000"/>
      <circle cx="64" cy="33" r="7.5" fill="#FFF" stroke="#000" stroke-width="3"/>
      <circle cx="64" cy="33" r="3" fill="#000"/>
      <!-- Blue neck gill collars -->
      <path d="M 28 54 Q 50 66 72 54" fill="none" stroke="#3498DB" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M 28 54 Q 50 66 72 54" fill="none" stroke="#000" stroke-width="8.5" stroke-linecap="round" style="z-index:-1;"/>
    </svg>
  `,
  Toedscool: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#FCF3CF" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Running legs with action dust trails -->
      <path d="M 20 85 Q 35 78 40 68 M 80 85 Q 65 78 60 68" stroke="#BDC3C7" stroke-width="3" fill="none"/>
      <path d="M 40 66 Q 30 85 24 93 M 60 66 Q 70 85 76 93" fill="none" stroke="#000" stroke-width="8.5" stroke-linecap="round"/>
      <path d="M 40 66 Q 30 85 24 93 M 60 66 Q 70 85 76 93" fill="none" stroke="#F5B041" stroke-width="4.5" stroke-linecap="round"/>
      <!-- Mushroom wood cap -->
      <ellipse cx="50" cy="40" rx="31" ry="21" fill="#935116" stroke="#000" stroke-width="4.5"/>
      <ellipse cx="50" cy="35" rx="26" ry="14" fill="#D35400" stroke="#000" stroke-width="3"/>
      <!-- Yellow collar flaps -->
      <ellipse cx="50" cy="48" rx="23" ry="8" fill="#F5B041" stroke="#000" stroke-width="3"/>
      <!-- Eyes on body -->
      <circle cx="38" cy="46" r="4.5" fill="#FFF" stroke="#000" stroke-width="2.5"/>
      <circle cx="38" cy="46" r="1.5" fill="#000"/>
      <circle cx="62" cy="46" r="4.5" fill="#FFF" stroke="#000" stroke-width="2.5"/>
      <circle cx="62" cy="46" r="1.5" fill="#000"/>
    </svg>
  `,
  Capsakid: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#E8F8F5" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Green Pepper Head -->
      <circle cx="50" cy="52" r="28" fill="#2ECC71" stroke="#000" stroke-width="4.5"/>
      <!-- Stem -->
      <path d="M 50 24 C 45 10 60 10 50 24" fill="none" stroke="#27AE60" stroke-width="5" stroke-linecap="round"/>
      <path d="M 50 24 C 45 10 60 10 50 24" fill="none" stroke="#000" stroke-width="9" stroke-linecap="round" style="z-index:-1;"/>
      <!-- Wide Eyes -->
      <circle cx="37" cy="46" r="8" fill="#FFF" stroke="#000" stroke-width="3.5"/>
      <circle cx="37" cy="46" r="4.5" fill="#F1C40F" stroke="#000" stroke-width="1.5"/>
      <circle cx="63" cy="46" r="8" fill="#FFF" stroke="#000" stroke-width="3.5"/>
      <circle cx="63" cy="46" r="4.5" fill="#F1C40F" stroke="#000" stroke-width="1.5"/>
      <!-- Open toothy mouth -->
      <path d="M 40 59 Q 50 67 60 59 Z" fill="#F1C40F" stroke="#000" stroke-width="3"/>
      <!-- Red Collar spikes -->
      <path d="M 28 68 Q 50 82 72 68" fill="none" stroke="#E74C3C" stroke-width="6" stroke-linecap="round"/>
      <path d="M 28 68 Q 50 82 72 68" fill="none" stroke="#000" stroke-width="10" stroke-linecap="round" style="z-index:-1;"/>
    </svg>
  `,
  Grafaiai: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#FBEEE6" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Neon spray paint splatters -->
      <circle cx="20" cy="20" r="10" fill="#8E44AD" opacity="0.6"/>
      <circle cx="85" cy="75" r="8" fill="#F1C40F" opacity="0.6"/>
      <!-- Ears -->
      <polygon points="20,40 2,12 34,26" fill="#2C3E50" stroke="#000" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="20,40 8,20 28,28" fill="#E74C3C" stroke="#000" stroke-width="2"/>
      <polygon points="80,40 98,12 66,26" fill="#2C3E50" stroke="#000" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="80,40 92,20 72,28" fill="#E74C3C" stroke="#000" stroke-width="2"/>
      <!-- Head -->
      <circle cx="50" cy="54" r="23" fill="#34495E" stroke="#000" stroke-width="4.5"/>
      <!-- Large neon toxic eyes -->
      <circle cx="37" cy="48" r="11" fill="#8E44AD" stroke="#000" stroke-width="3"/>
      <circle cx="37" cy="48" r="7.5" fill="#F1C40F" stroke="#000" stroke-width="1.5"/>
      <circle cx="35" cy="46" r="3" fill="#000"/>
      <circle cx="63" cy="48" r="11" fill="#8E44AD" stroke="#000" stroke-width="3"/>
      <circle cx="63" cy="48" r="7.5" fill="#F1C40F" stroke="#000" stroke-width="1.5"/>
      <circle cx="61" cy="46" r="3" fill="#000"/>
      <!-- Hair fluff -->
      <path d="M 48 30 L 52 14" stroke="#FFF" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="50" cy="60" rx="8" ry="5.5" fill="#EAEDED" stroke="#000" stroke-width="2.5"/>
    </svg>
  `,
  Shroodle: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#F2F3F4" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Poison gas bubbles in background -->
      <circle cx="20" cy="30" r="5" fill="#9B59B6" opacity="0.5"/>
      <circle cx="75" cy="25" r="7" fill="#9B59B6" opacity="0.5"/>
      <!-- Head and black hood -->
      <circle cx="50" cy="54" r="22" fill="#5D6D7E" stroke="#000" stroke-width="4.5"/>
      <!-- Mask opening -->
      <path d="M 37 60 Q 50 38 63 60 Z" fill="#FFF" stroke="#000" stroke-width="3.5"/>
      <!-- Small black eyes -->
      <circle cx="44" cy="53" r="2.5" fill="#2C3E50"/>
      <circle cx="56" cy="53" r="2.5" fill="#2C3E50"/>
      <!-- Red beak/snout -->
      <polygon points="48,56 52,56 50,61" fill="#E74C3C" stroke="#000" stroke-width="1.5"/>
    </svg>
  `,
  Tinkatink: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#FDEDEC" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Pink body -->
      <circle cx="50" cy="62" r="19" fill="#F5B7B1" stroke="#000" stroke-width="4.5"/>
      <circle cx="50" cy="42" r="21" fill="#F5B7B1" stroke="#000" stroke-width="4.5"/>
      <!-- Ponytail -->
      <path d="M 50 20 Q 55 -2 68 8 Q 55 13 50 20" fill="#F5B7B1" stroke="#000" stroke-width="3.5"/>
      <!-- Pink eyes -->
      <ellipse cx="42" cy="42" rx="4.5" ry="6.5" fill="#FFF" stroke="#E91E63" stroke-width="2.5"/>
      <circle cx="42" cy="40" r="2" fill="#000"/>
      <ellipse cx="58" cy="42" rx="4.5" ry="6.5" fill="#FFF" stroke="#E91E63" stroke-width="2.5"/>
      <circle cx="58" cy="40" r="2" fill="#000"/>
      <!-- Iron Hammer -->
      <rect x="18" y="48" width="8" height="28" fill="#7F8C8D" stroke="#000" stroke-width="3" transform="rotate(25, 18, 48)"/>
      <rect x="8" y="44" width="22" height="11" fill="#BDC3C7" stroke="#000" stroke-width="3.5" transform="rotate(25, 18, 48)" rx="2"/>
    </svg>
  `,
  Tinkaton: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#FDEDEC" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Smash marks / rocks breaking in background -->
      <polygon points="10,80 18,70 25,82" fill="#7F8C8D" stroke="#000" stroke-width="2.5"/>
      <polygon points="50,90 44,78 38,92" fill="#95A5A6" stroke="#000" stroke-width="2"/>
      
      <!-- Pink character -->
      <circle cx="65" cy="65" r="16" fill="#FF80AB" stroke="#000" stroke-width="4"/>
      <circle cx="65" cy="45" r="18" fill="#FF80AB" stroke="#000" stroke-width="4"/>
      
      <!-- GIGANTIC METAL HAMMER (Manga scale) -->
      <rect x="18" y="6" width="13" height="84" fill="#37474F" stroke="#000" stroke-width="4.5" transform="rotate(-15, 18, 6)"/>
      <rect x="0" y="22" width="48" height="30" fill="#78909C" stroke="#000" stroke-width="4.5" transform="rotate(-15, 18, 6)" rx="4"/>
      <line x1="8" y1="33" x2="38" y2="33" stroke="#CFD8DC" stroke-width="3" transform="rotate(-15, 18, 6)"/>
      
      <!-- Big anime eyes peeking -->
      <ellipse cx="60" cy="44" rx="4" ry="6" fill="#FFF" stroke="#E91E63" stroke-width="2"/>
      <circle cx="60" cy="42" r="1.5" fill="#000"/>
      <ellipse cx="72" cy="44" rx="4" ry="6" fill="#FFF" stroke="#E91E63" stroke-width="2"/>
      <circle cx="72" cy="42" r="1.5" fill="#000"/>
      
      <!-- SMASH text splash bubble inside the panel! -->
      <path d="M 5 15 L 12 8 L 25 15 L 35 5 L 45 15 L 40 28 Z" fill="#E74C3C" stroke="#000" stroke-width="2"/>
      <text x="8" y="15" font-family="Luckiest Guy" font-size="8" fill="#FFF" transform="rotate(-10)">SMASH!</text>
    </svg>
  `,
  Wattrel: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#EBF5FB" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Lightning bolts background -->
      <path d="M 10 20 L 25 10 L 20 35 M 90 60 L 80 75 L 92 80" stroke="#F1C40F" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <!-- Bird Body -->
      <path d="M 23 55 Q 50 22 76 44 Q 65 66 45 61 Z" fill="#2C3E50" stroke="#000" stroke-width="4.5"/>
      <path d="M 23 55 Q 38 75 60 70 Q 55 60 45 61 Z" fill="#F1C40F" stroke="#000" stroke-width="3.5"/>
      <circle cx="50" cy="42" r="5" fill="#FFF" stroke="#000" stroke-width="2"/>
      <circle cx="51" cy="42" r="2.5" fill="#000"/>
      <polygon points="74,42 86,45 72,50" fill="#F39C12" stroke="#000" stroke-width="3"/>
    </svg>
  `,
  Bellibolt: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#E8F8F5" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Electric sparks radiating -->
      <path d="M 15 50 H 5 M 85 50 H 95 M 50 15 V 5" stroke="#F1C40F" stroke-width="4" stroke-linecap="round"/>
      <!-- Chubby Green body -->
      <ellipse cx="50" cy="58" rx="31" ry="27" fill="#2ECC71" stroke="#000" stroke-width="4.5"/>
      <!-- Giant lightning nodes on sides -->
      <circle cx="20" cy="48" r="9.5" fill="#FFF" stroke="#000" stroke-width="3.5"/>
      <circle cx="20" cy="48" r="5" fill="#000"/>
      <circle cx="80" cy="48" r="9.5" fill="#FFF" stroke="#000" stroke-width="3.5"/>
      <circle cx="80" cy="48" r="5" fill="#000"/>
      <!-- Tiny cute face -->
      <circle cx="45" cy="52" r="2.5" fill="#196F3D"/>
      <circle cx="55" cy="52" r="2.5" fill="#196F3D"/>
      <path d="M 47 57 Q 50 54 53 57" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Orange pad -->
      <ellipse cx="50" cy="70" rx="18" ry="11" fill="#E67E22" stroke="#000" stroke-width="3"/>
    </svg>
  `,
  Pawmot: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#FEF9E7" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Huge lightning shockwaves -->
      <path d="M 10 30 Q 30 50 20 70 M 90 30 Q 70 50 80 70" stroke="#F1C40F" stroke-width="6" fill="none" stroke-linecap="round"/>
      <circle cx="50" cy="56" r="32" fill="#E67E22" stroke="#000" stroke-width="4.5"/>
      <!-- Spiked hair -->
      <path d="M 28 26 Q 50 -2 72 26 Z" fill="#D35400" stroke="#000" stroke-width="4"/>
      <path d="M 34 28 Q 50 8 66 28 Z" fill="#E67E22" stroke="#000" stroke-width="3"/>
      <!-- Electrical charged paws -->
      <circle cx="18" cy="62" r="8.5" fill="#F1C40F" stroke="#000" stroke-width="3.5"/>
      <circle cx="82" cy="62" r="8.5" fill="#F1C40F" stroke="#000" stroke-width="3.5"/>
      <circle cx="28" cy="62" r="7.5" fill="#E74C3C" stroke="#000" stroke-width="3"/>
      <circle cx="72" cy="62" r="7.5" fill="#E74C3C" stroke="#000" stroke-width="3"/>
      <!-- Determined eyes -->
      <path d="M 32 42 L 42 45 M 68 42 L 58 45" stroke="#000" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="38" cy="49" r="5.5" fill="#2C3E50" stroke="#000" stroke-width="2.5"/>
      <circle cx="62" cy="49" r="5.5" fill="#2C3E50" stroke="#000" stroke-width="2.5"/>
    </svg>
  `,
  Dondozo: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#EBF5FB" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Splashing tidal wave -->
      <path d="M 0 60 Q 30 30 50 60 T 100 60" fill="none" stroke="#2980B9" stroke-width="6" stroke-linecap="round"/>
      <path d="M 10 52 Q 50 20 88 49 Q 75 78 50 80 Q 25 78 10 52 Z" fill="#1F618D" stroke="#000" stroke-width="4.5"/>
      <!-- Whiskers -->
      <path d="M 35 59 Q 15 60 5 46 M 65 59 Q 85 60 95 46" fill="none" stroke="#F1C40F" stroke-width="4" stroke-linecap="round"/>
      <path d="M 35 59 Q 15 60 5 46 M 65 59 Q 85 60 95 46" fill="none" stroke="#000" stroke-width="8" stroke-linecap="round" style="z-index:-1;"/>
      <path d="M 26 64 Q 50 80 74 64" fill="none" stroke="#FFF" stroke-width="6"/>
      <!-- Tiny eyes -->
      <circle cx="40" cy="42" r="3.5" fill="#FFF" stroke="#000" stroke-width="2"/>
      <circle cx="40" cy="42" r="1.5" fill="#000"/>
      <circle cx="60" cy="42" r="3.5" fill="#FFF" stroke="#000" stroke-width="2"/>
      <circle cx="60" cy="42" r="1.5" fill="#000"/>
    </svg>
  `,
  Tatsugiri: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#FCF3CF" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Dragon fire spark aura -->
      <path d="M 20 40 L 10 20 L 30 30 L 40 10 L 50 25" fill="none" stroke="#E67E22" stroke-width="3" stroke-linecap="round"/>
      <!-- Sushi fish curl -->
      <path d="M 28 68 Q 18 38 44 40 Q 68 42 63 23 Q 83 43 63 63 Q 48 70 28 68 Z" fill="#E74C3C" stroke="#000" stroke-width="4.5"/>
      <ellipse cx="48" cy="61" rx="18" ry="9.5" fill="#FFF" stroke="#000" stroke-width="3.5"/>
      <!-- Large derp anime eyes -->
      <circle cx="37" cy="44" r="5.5" fill="#FFF" stroke="#000" stroke-width="2.5"/>
      <circle cx="37" cy="44" r="2" fill="#000"/>
      <circle cx="51" cy="44" r="5.5" fill="#FFF" stroke="#000" stroke-width="2.5"/>
      <circle cx="51" cy="44" r="2" fill="#000"/>
    </svg>
  `,
  Veluza: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#EAECEE" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Speed slash marks -->
      <path d="M 10 25 L 90 75 M 10 75 L 90 25" stroke="#C0392B" stroke-width="1.5" opacity="0.4"/>
      <!-- Fish body -->
      <path d="M 8 50 Q 50 28 83 48 L 90 40 L 88 60 L 83 52 Q 50 72 8 50 Z" fill="#7F8C8D" stroke="#000" stroke-width="4.5"/>
      <path d="M 38 38 L 54 22 L 48 40 Z" fill="#C0392B" stroke="#000" stroke-width="3"/>
      <path d="M 38 62 L 54 78 L 48 60 Z" fill="#C0392B" stroke="#000" stroke-width="3"/>
      <!-- Angry sharp eye -->
      <polygon points="26,48 35,43 31,53" fill="#F1C40F" stroke="#000" stroke-width="2"/>
      <circle cx="30" cy="48" r="1.5" fill="#000"/>
    </svg>
  `,
  Ceruledge: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#2C3E50" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Swirling Purple/Violet fire spikes -->
      <path d="M 15 85 L 20 55 L 5 70 M 85 85 L 80 55 L 95 70" stroke="#8E44AD" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="50" cy="52" r="24" fill="#1F2A38" stroke="#000" stroke-width="4.5"/>
      <!-- Purple flame fire head -->
      <path d="M 50 28 Q 36 -2 50 -8 Q 64 -2 50 28" fill="#8E44AD" stroke="#000" stroke-width="4.5"/>
      <path d="M 50 23 Q 44 4 50 2 Q 56 4 50 23" fill="#9B59B6" stroke="#000" stroke-width="2.5"/>
      <!-- Visor opening -->
      <path d="M 31 50 L 50 58 L 69 50 L 50 44 Z" fill="#000" stroke="#000" stroke-width="3"/>
      <!-- Golden fire eyes -->
      <polygon points="39,50 45,48 43,53" fill="#F1C40F" stroke="#000" stroke-width="1"/>
      <polygon points="61,50 55,48 57,53" fill="#F1C40F" stroke="#000" stroke-width="1"/>
      <!-- Blades -->
      <path d="M 23 66 L 5 92 L 28 86 Z" fill="#8E44AD" stroke="#000" stroke-width="3"/>
      <path d="M 77 66 L 95 92 L 72 86 Z" fill="#8E44AD" stroke="#000" stroke-width="3"/>
    </svg>
  `,
  Koraidon: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#FDEDEC" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Red fighting shockwaves background -->
      <path d="M 10 10 L 30 30 M 90 10 L 70 30 M 50 90 V 70" stroke="#C0392B" stroke-width="5" opacity="0.5" stroke-linecap="round"/>
      <!-- Head -->
      <path d="M 18 58 Q 50 16 82 48 Q 76 74 50 77 Q 26 70 18 58 Z" fill="#C0392B" stroke="#000" stroke-width="4.5"/>
      <!-- Scaly plates overlay -->
      <path d="M 20 56 Q 50 32 80 46 Q 50 50 20 56" fill="#FFF" stroke="#000" stroke-width="3.5" opacity="0.9"/>
      <!-- Blue antennae crown feathers -->
      <path d="M 38 28 Q 28 2 16 10" fill="none" stroke="#2980B9" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M 38 28 Q 28 2 16 10" fill="none" stroke="#000" stroke-width="8.5" stroke-linecap="round" style="z-index:-1;"/>
      <path d="M 62 28 Q 72 2 84 10" fill="none" stroke="#2980B9" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M 62 28 Q 72 2 84 10" fill="none" stroke="#000" stroke-width="8.5" stroke-linecap="round" style="z-index:-1;"/>
      <!-- Lightning crest -->
      <path d="M 44 26 Q 50 12 56 26 Z" fill="#F1C40F" stroke="#000" stroke-width="3"/>
      <!-- Angry golden eye -->
      <polygon points="40,46 51,41 46,52" fill="#F1C40F" stroke="#000" stroke-width="2"/>
      <circle cx="46" cy="46" r="2" fill="#000"/>
    </svg>
  `,
  Miraidon: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#EBF5FB" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Digital grids backdrop -->
      <line x1="10" y1="0" x2="10" y2="100" stroke="#5DADE2" stroke-width="1.5" opacity="0.3"/>
      <line x1="30" y1="0" x2="30" y2="100" stroke="#5DADE2" stroke-width="1.5" opacity="0.3"/>
      <line x1="50" y1="0" x2="50" y2="100" stroke="#5DADE2" stroke-width="1.5" opacity="0.3"/>
      <line x1="70" y1="0" x2="70" y2="100" stroke="#5DADE2" stroke-width="1.5" opacity="0.3"/>
      <line x1="90" y1="0" x2="90" y2="100" stroke="#5DADE2" stroke-width="1.5" opacity="0.3"/>
      <!-- Head -->
      <path d="M 18 56 Q 50 22 82 53 Q 70 77 50 74 Q 28 70 18 56 Z" fill="#5B2C6F" stroke="#000" stroke-width="4.5"/>
      <path d="M 28 50 Q 50 32 72 48" fill="none" stroke="#5DADE2" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 28 50 Q 50 32 72 48" fill="none" stroke="#000" stroke-width="7.5" stroke-linecap="round" style="z-index:-1;"/>
      <!-- Digital Eyes -->
      <rect x="40" y="42" width="9" height="7" fill="#F1C40F" stroke="#000" stroke-width="2" rx="1"/>
      <rect x="60" y="42" width="9" height="7" fill="#F1C40F" stroke="#000" stroke-width="2" rx="1"/>
      <!-- Cybernetic Ear Spikes -->
      <path d="M 33 30 L 16 5 L 36 20" fill="#5DADE2" stroke="#000" stroke-width="3" stroke-linejoin="round"/>
      <path d="M 67 30 L 84 5 L 64 20" fill="#5DADE2" stroke="#000" stroke-width="3" stroke-linejoin="round"/>
    </svg>
  `,
  Corviknight: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#EAECEE" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Wind slash lines -->
      <path d="M 5 25 Q 35 15 50 5 M 5 45 Q 40 30 75 10" fill="none" stroke="#95A5A6" stroke-width="3.5" stroke-linecap="round" opacity="0.4"/>
      <circle cx="50" cy="52" r="28" fill="#2C3E50" stroke="#000" stroke-width="4.5"/>
      <!-- Metal scale crown -->
      <polygon points="38,26 50,4 62,26" fill="#1A252F" stroke="#000" stroke-width="4.5" stroke-linejoin="round"/>
      <circle cx="44" cy="46" r="4.5" fill="#E74C3C" stroke="#000" stroke-width="2"/>
      <circle cx="44" cy="46" r="1.5" fill="#FFF"/>
      <!-- Sharp Beak -->
      <polygon points="60,40 86,56 56,63" fill="#1A252F" stroke="#000" stroke-width="4.5" stroke-linejoin="round"/>
    </svg>
  `,
  Rotom: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" fill="#FCF3CF" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Electric spark outlines -->
      <circle cx="50" cy="50" r="28" fill="none" stroke="#5DADE2" stroke-width="4" stroke-dasharray="8, 4"/>
      <!-- Plasma Orange bulb -->
      <circle cx="50" cy="50" r="21" fill="#E67E22" stroke="#000" stroke-width="4.5"/>
      <line x1="50" y1="28" x2="50" y2="8" stroke="#E67E22" stroke-width="5" stroke-linecap="round"/>
      <line x1="50" y1="28" x2="50" y2="8" stroke="#000" stroke-width="9" stroke-linecap="round" style="z-index:-1;"/>
      <!-- Big white oval eyes with blue circular pupils -->
      <ellipse cx="42" cy="48" rx="5.5" ry="8.5" fill="#FFF" stroke="#000" stroke-width="2"/>
      <circle cx="42" cy="48" r="2.5" fill="#2980B9"/>
      <ellipse cx="58" cy="48" rx="5.5" ry="8.5" fill="#FFF" stroke="#000" stroke-width="2"/>
      <circle cx="58" cy="48" r="2.5" fill="#2980B9"/>
    </svg>
  `
};

export const PokemonDB = {
  Sprigatito: { name: "Sprigatito", type: "Grass", hp: 100, moves: [{ name: "Leafage", type: "Grass", power: 15, text: "Leaf attack!" }, { name: "Seed Bomb", type: "Grass", power: 30, text: "BOOM! Seeds fly!" }, { name: "Tackle", type: "Normal", power: 10, text: "Chubby slam!" }], speed: 65 },
  Floragato: { name: "Floragato", type: "Grass", hp: 130, moves: [{ name: "Leafage", type: "Grass", power: 18, text: "Leaf attack!" }, { name: "Seed Bomb", type: "Grass", power: 32, text: "BOOM!" }, { name: "Slash", type: "Normal", power: 20, text: "Sharp claws!" }], speed: 75 },
  Meowscarada: { name: "Meowscarada", type: "Grass", hp: 160, moves: [{ name: "Flower Trick", type: "Grass", power: 42, text: "CRITICAL HIT Magic flower!" }, { name: "Seed Bomb", type: "Grass", power: 32, text: "Seed bomb explosion!" }, { name: "Play Rough", type: "Fairy", power: 35, text: "Playful roughhouse!" }], speed: 95 },
  
  Fuecoco: { name: "Fuecoco", type: "Fire", hp: 120, moves: [{ name: "Ember", type: "Fire", power: 12, text: "Tiny sparks!" }, { name: "Torch Song", type: "Fire", power: 35, text: "FLAMING MUSIC!" }, { name: "Tackle", type: "Normal", power: 10, text: "Snout slam!" }], speed: 35 },
  Crocalor: { name: "Crocalor", type: "Fire", hp: 150, moves: [{ name: "Ember", type: "Fire", power: 16, text: "Tiny sparks!" }, { name: "Torch Song", type: "Fire", power: 38, text: "LOUDER FLAME MUSIC!" }, { name: "Bite", type: "Dark", power: 20, text: "Dark fang bite!" }], speed: 45 },
  Skeledirge: { name: "Skeledirge", type: "Fire", hp: 180, moves: [{ name: "Torch Song", type: "Fire", power: 45, text: "SOLO CONCERT BURST!" }, { name: "Overheat", type: "Fire", power: 50, text: "APOCALYPSE BURN!" }, { name: "Shadow Ball", type: "Ghost", power: 38, text: "Vengeful spirit blast!" }], speed: 55 },
  
  Quaxly: { name: "Quaxly", type: "Water", hp: 110, moves: [{ name: "Water Gun", type: "Water", power: 15, text: "Splash gun!" }, { name: "Liquidation", type: "Water", power: 28, text: "HYDRO SHOT!" }, { name: "Pound", type: "Normal", power: 10, text: "Flipper slap!" }], speed: 50 },
  Quaxwell: { name: "Quaxwell", type: "Water", hp: 140, moves: [{ name: "Water Gun", type: "Water", power: 18, text: "Water blast!" }, { name: "Liquidation", type: "Water", power: 32, text: "VORTEX DIVE!" }, { name: "Double Hit", type: "Normal", power: 22, text: "2-shot kick!" }], speed: 65 },
  Quaquaval: { name: "Quaquaval", type: "Water", hp: 170, moves: [{ name: "Aqua Step", type: "Water", power: 42, text: "DANCING AQUA DASH!" }, { name: "Liquidation", type: "Water", power: 32, text: "VORTEX SHIELD DIVE!" }, { name: "Close Combat", type: "Fighting", power: 45, text: "FEATHER FIST BURST!" }], speed: 85 },
  
  Pawmi: { name: "Pawmi", type: "Electric", hp: 95, moves: [{ name: "Thunder Shock", type: "Electric", power: 15, text: "ZAP ZAP!" }, { name: "Wild Charge", type: "Electric", power: 32, text: "VOLTAGE SHIFT!" }, { name: "Scratch", type: "Normal", power: 10, text: "Cute scratch!" }], speed: 60 },
  Pawmo: { name: "Pawmo", type: "Electric", hp: 115, moves: [{ name: "Spark", type: "Electric", power: 18, text: "Volt punch!" }, { name: "Dig", type: "Ground", power: 22, text: "Dig under!" }, { name: "Tackle", type: "Normal", power: 12, text: "Body slam!" }], speed: 70 },
  Pawmot: { name: "Pawmot", type: "Electric", hp: 140, moves: [{ name: "Spark", type: "Electric", power: 22, text: "Volt punch blast!" }, { name: "Double Shock", type: "Electric", power: 45, text: "MAX VOLTAGE SHOCK!" }, { name: "Close Combat", type: "Fighting", power: 40, text: "FIST BARRAGE SMASH!" }], speed: 85 },
  
  Lechonk: { name: "Lechonk", type: "Normal", hp: 105, moves: [{ name: "Tackle", type: "Normal", power: 10, text: "Chubby slam!" }, { name: "Double Kick", type: "Fighting", power: 20, text: "2-SHOT!" }], speed: 30 },
  Tarountula: { name: "Tarountula", type: "Bug", hp: 90, moves: [{ name: "Bug Bite", type: "Bug", power: 12, text: "Nibble nibble!" }, { name: "String Shot", type: "Bug", power: 22, text: "WEB WRAP!" }], speed: 20 },
  Fidough: { name: "Fidough", type: "Fairy", hp: 100, moves: [{ name: "Play Rough", type: "Fairy", power: 16, text: "Bunny bounce!" }, { name: "Dazzling Gleam", type: "Fairy", power: 25, text: "SPARKLY GLOW!" }], speed: 45 },
  Smoliv: { name: "Smoliv", type: "Grass", hp: 85, moves: [{ name: "Absorb", type: "Grass", power: 10, text: "Suck HP!" }, { name: "Razor Leaf", type: "Grass", power: 24, text: "SHARP LEAF SLICE!" }], speed: 30 },
  Tandemaus: { name: "Tandemaus", type: "Normal", hp: 95, moves: [{ name: "Double Hit", type: "Normal", power: 14, text: "Double slap!" }, { name: "Super Fang", type: "Normal", power: 25, text: "GNASHING BITE!" }], speed: 75 },
  Nacli: { name: "Nacli", type: "Rock", hp: 115, moves: [{ name: "Rock Throw", type: "Rock", power: 15, text: "Salty block toss!" }, { name: "Stone Edge", type: "Rock", power: 28, text: "SHARP ROCK SPIRES!" }], speed: 25 },
  Charcadet: { name: "Charcadet", type: "Fire", hp: 100, moves: [{ name: "Ember", type: "Fire", power: 14, text: "Spitfire!" }, { name: "Flame Wheel", type: "Fire", power: 26, text: "FIRE WHEEL SPIN!" }], speed: 50 },
  Orthworm: { name: "Orthworm", type: "Steel", hp: 130, moves: [{ name: "Iron Tail", type: "Steel", power: 18, text: "Steel tail slam!" }, { name: "Earthquake", type: "Ground", power: 30, text: "GROUND SHAKE!" }], speed: 35 },
  Toedscool: { name: "Toedscool", type: "Ground", hp: 90, moves: [{ name: "Mud-Slap", type: "Ground", power: 12, text: "Sling mud!" }, { name: "Earth Power", type: "Ground", power: 28, text: "TERRA BURST!" }], speed: 70 },
  Capsakid: { name: "Capsakid", type: "Grass", hp: 95, moves: [{ name: "Bullet Seed", type: "Grass", power: 15, text: "Spit seeds!" }, { name: "Fire Fang", type: "Fire", power: 28, text: "SPICY BITE!" }], speed: 50 },
  Grafaiai: { name: "Grafaiai", type: "Poison", hp: 110, moves: [{ name: "Poison Jab", type: "Poison", power: 16, text: "Acid scratch!" }, { name: "Gunk Shot", type: "Poison", power: 32, text: "TOXIC TRASH SLING!" }], speed: 85 },
  Shroodle: { name: "Shroodle", type: "Poison", hp: 80, moves: [{ name: "Acid Spray", type: "Poison", power: 12, text: "Acid spray!" }, { name: "Gunk Shot", type: "Poison", power: 25, text: "TOXIC SLING!" }], speed: 65 },
  Tinkatink: { name: "Tinkatink", type: "Fairy", hp: 95, moves: [{ name: "Fairy Wind", type: "Fairy", power: 12, text: "Cute gust!" }, { name: "Metal Claw", type: "Steel", power: 24, text: "Hammer swing!" }], speed: 45 },
  Tinkaton: { name: "Tinkaton", type: "Fairy", hp: 125, moves: [{ name: "Play Rough", type: "Fairy", power: 18, text: "Bouncy smash!" }, { name: "Gigaton Hammer", type: "Steel", power: 40, text: "CRUSHING HAMMER SMASH!" }], speed: 60 },
  Wattrel: { name: "Wattrel", type: "Electric", hp: 90, moves: [{ name: "Spark", type: "Electric", power: 14, text: "Fly spark!" }, { name: "Hurricane", type: "Flying", power: 28, text: "WIND BLAST!" }], speed: 80 },
  Bellibolt: { name: "Bellibolt", type: "Electric", hp: 140, moves: [{ name: "Thunder Shock", type: "Electric", power: 15, text: "Belly spark!" }, { name: "Discharge", type: "Electric", power: 32, text: "LIGHTNING STORM!" }], speed: 40 },
  Dondozo: { name: "Dondozo", type: "Water", hp: 160, moves: [{ name: "Water Pulse", type: "Water", power: 16, text: "Bubble wave!" }, { name: "Wave Crash", type: "Water", power: 36, text: "TSUNAMI CRASH!" }], speed: 35 },
  Tatsugiri: { name: "Tatsugiri", type: "Water", hp: 100, moves: [{ name: "Water Gun", type: "Water", power: 14, text: "Sushi squirt!" }, { name: "Dragon Pulse", type: "Dragon", power: 32, text: "DRAGON BLAST!" }], speed: 75 },
  Veluza: { name: "Veluza", type: "Water", hp: 110, moves: [{ name: "Slash", type: "Normal", power: 16, text: "Quick slice!" }, { name: "Aqua Jet", type: "Water", power: 28, text: "SONIC WATER DASH!" }], speed: 70 },
  Ceruledge: { name: "Ceruledge", type: "Fire", hp: 120, moves: [{ name: "Shadow Claw", type: "Ghost", power: 18, text: "Ghost slash!" }, { name: "Bitter Blade", type: "Fire", power: 38, text: "FLAMING SOUL SWORD!" }], speed: 80 },
  Koraidon: { name: "Koraidon", type: "Fighting", hp: 170, moves: [{ name: "Drain Punch", type: "Fighting", power: 22, text: "PUNCH CHORD!" }, { name: "Collision Course", type: "Fighting", power: 45, text: "APOCALYPSE IMPACT!" }], speed: 95 },
  Miraidon: { name: "Miraidon", type: "Electric", hp: 170, moves: [{ name: "Parabolic Charge", type: "Electric", power: 22, text: "ELECTRON BEAM!" }, { name: "Electro Drift", type: "Electric", power: 45, text: "LIGHTNING SONIC DRIFT!" }], speed: 95 },
  Corviknight: { name: "Corviknight", type: "Steel", hp: 145, moves: [{ name: "Steel Wing", type: "Steel", power: 22, text: "Metallic wing slice!" }, { name: "Drill Peck", type: "Flying", power: 30, text: "Spinning beak strike!" }], speed: 67 },
  Rotom: { name: "Rotom", type: "Electric", hp: 110, moves: [{ name: "Discharge", type: "Electric", power: 25, text: "Electric spark blast!" }, { name: "Shadow Ball", type: "Ghost", power: 25, text: "Spooky shadow sphere!" }], speed: 91 },
  Palafin: { name: "Palafin", type: "Water", hp: 155, moves: [{ name: "Jet Punch", type: "Water", power: 36, text: "HERO WAVE PUNCH!" }, { name: "Flip Turn", type: "Water", power: 28, text: "Splash-and-dash!" }], speed: 100 },
  Baxcalibur: { name: "Baxcalibur", type: "Dragon", hp: 170, moves: [{ name: "Glaive Rush", type: "Dragon", power: 48, text: "CRYSTAL DRAGON CHARGE!" }, { name: "Icicle Crash", type: "Ice", power: 38, text: "ICE SPIKE SLAM!" }], speed: 87 },
  Gholdengo: { name: "Gholdengo", type: "Steel", hp: 145, moves: [{ name: "Make It Rain", type: "Steel", power: 46, text: "COINS EVERYWHERE!" }, { name: "Shadow Ball", type: "Ghost", power: 34, text: "Golden ghost blast!" }], speed: 84 },
  Kingambit: { name: "Kingambit", type: "Dark", hp: 165, moves: [{ name: "Kowtow Cleave", type: "Dark", power: 42, text: "BLADE COMMAND!" }, { name: "Iron Head", type: "Steel", power: 35, text: "Steel crown crash!" }], speed: 50 },
  Annihilape: { name: "Annihilape", type: "Fighting", hp: 155, moves: [{ name: "Rage Fist", type: "Ghost", power: 44, text: "FURY GHOST PUNCH!" }, { name: "Close Combat", type: "Fighting", power: 40, text: "NO MERCY COMBO!" }], speed: 90 },
  Clodsire: { name: "Clodsire", type: "Poison", hp: 175, moves: [{ name: "Poison Jab", type: "Poison", power: 30, text: "TOXIC SPIKE!" }, { name: "Earthquake", type: "Ground", power: 36, text: "MUDDY GROUND SHAKE!" }], speed: 25 },
  Cyclizar: { name: "Cyclizar", type: "Dragon", hp: 125, moves: [{ name: "Dragon Claw", type: "Dragon", power: 32, text: "Wheel-speed slash!" }, { name: "Quick Attack", type: "Normal", power: 28, text: "Roadrunner rush!" }], speed: 121 },
  Flamigo: { name: "Flamigo", type: "Flying", hp: 130, moves: [{ name: "Wing Attack", type: "Flying", power: 32, text: "Flock strike!" }, { name: "Double Kick", type: "Fighting", power: 30, text: "KICK-KICK!" }], speed: 90 },
  Glimmora: { name: "Glimmora", type: "Rock", hp: 140, moves: [{ name: "Power Gem", type: "Rock", power: 38, text: "CRYSTAL LASER!" }, { name: "Sludge Wave", type: "Poison", power: 34, text: "TOXIC BLOOM!" }], speed: 86 },
  Farigiraf: { name: "Farigiraf", type: "Psychic", hp: 150, moves: [{ name: "Twin Beam", type: "Psychic", power: 36, text: "DOUBLE MIND RAY!" }, { name: "Stomp", type: "Normal", power: 28, text: "Hoof stomp!" }], speed: 60 },
  Dudunsparce: { name: "Dudunsparce", type: "Normal", hp: 160, moves: [{ name: "Hyper Drill", type: "Normal", power: 40, text: "GOOFY DRILL BURST!" }, { name: "Glare", type: "Normal", power: 24, text: "Awkward stare!" }], speed: 55 },
  Maushold: { name: "Maushold", type: "Normal", hp: 120, moves: [{ name: "Population Bomb", type: "Normal", power: 42, text: "FAMILY COMBO!" }, { name: "Play Rough", type: "Fairy", power: 30, text: "Tiny chaos!" }], speed: 111 }
};

export const SpecialSVGs = {
  GO: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <!-- Comic Panel Background -->
      <rect width="100" height="100" fill="#FFF9E7" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Comic rays -->
      <path d="M-10,30 L110,60 M-10,50 L110,80 M20,-10 L70,110" stroke="#F4D03F" stroke-width="1.5" opacity="0.3"/>
      
      <!-- Spinning PokeBall Sprite -->
      <image href="images/go_sprite.png" x="40" y="16" width="50" height="50" />
      
      <!-- Speed Lines M 33,28 L 41,32 ... -->
      <path d="M 33,28 L 41,32 M 28,45 L 37,45 M 32,62 L 40,58" stroke="#F1C40F" stroke-width="3.5" stroke-linecap="round"/>
      
      <!-- Bold "GO!" Text -->
      <text x="21" y="47" font-family="'Luckiest Guy', Impact, sans-serif" font-size="28" font-weight="900" fill="#E74C3C" stroke="#000" stroke-width="2.5" stroke-linejoin="round">GO!</text>
      
      <!-- Action Bubble Subtext -->
      <rect x="10" y="52" width="56" height="15" rx="5" fill="#F1C40F" stroke="#000" stroke-width="2"/>
      <text x="14" y="62" font-family="sans-serif" font-size="7.5" font-weight="900" fill="#000">COLLECT ₽200</text>
      
      <!-- Red Movement Arrow -->
      <path d="M 90,82 C 60,82 40,82 15,82" fill="none" stroke="#000" stroke-width="7" stroke-linecap="round"/>
      <path d="M 90,82 C 60,82 40,82 15,82" fill="none" stroke="#E74C3C" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M 28,74 L 15,82 L 28,90" fill="none" stroke="#000" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 28,74 L 15,82 L 28,90" fill="none" stroke="#E74C3C" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
  Jail: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <!-- Comic Panel Background -->
      <rect width="100" height="100" fill="#EAEDED" rx="12" stroke="#000" stroke-width="4.5"/>
      
      <!-- Diagonal Divider Line -->
      <line x1="0" y1="75" x2="75" y2="0" stroke="#000" stroke-width="4.5"/>
      
      <!-- Inner Detention Area (Top-Left) -->
      <polygon points="0,0 75,0 0,75" fill="#FDEDEC"/>
      
      <!-- PokeBall Behind Bars in Detention Sprite -->
      <image href="images/jail_sprite.png" x="12" y="12" width="34" height="34" />
      
      <!-- Prison Bars -->
      <line x1="10" y1="8" x2="10" y2="65" stroke="#2C3E50" stroke-width="3" stroke-linecap="round"/>
      <line x1="22" y1="8" x2="22" y2="53" stroke="#2C3E50" stroke-width="3" stroke-linecap="round"/>
      <line x1="34" y1="8" x2="34" y2="41" stroke="#2C3E50" stroke-width="3" stroke-linecap="round"/>
      <line x1="46" y1="8" x2="46" y2="29" stroke="#2C3E50" stroke-width="3" stroke-linecap="round"/>
      
      <!-- "DETENTION" Text (Angled) -->
      <text x="6" y="15" font-family="'Luckiest Guy', Impact, sans-serif" font-size="7" font-weight="900" fill="#C0392B" transform="rotate(-45, 6, 15)">DETENTION</text>
      
      <!-- Just Visiting Region (Bottom/Right) -->
      <text x="25" y="90" font-family="'Luckiest Guy', Impact, sans-serif" font-size="11" font-weight="900" fill="#2C3E50">JUST</text>
      <text x="91" y="60" font-family="'Luckiest Guy', Impact, sans-serif" font-size="11" font-weight="900" fill="#2C3E50" transform="rotate(-90, 91, 60)">VISITING</text>
      
      <!-- Footprint Paths -->
      <ellipse cx="8" cy="85" rx="1.5" ry="3" fill="#7F8C8D" transform="rotate(45, 8, 85)"/>
      <ellipse cx="11" cy="88" rx="1.5" ry="3" fill="#7F8C8D" transform="rotate(45, 11, 88)"/>
      <ellipse cx="80" cy="88" rx="3" ry="1.5" fill="#7F8C8D"/>
      <ellipse cx="83" cy="85" rx="3" ry="1.5" fill="#7F8C8D"/>
      <ellipse cx="90" cy="20" rx="1.5" ry="3" fill="#7F8C8D"/>
      <ellipse cx="93" cy="23" rx="1.5" ry="3" fill="#7F8C8D"/>
    </svg>
  `,
  FreeParking: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <!-- Comic Panel Background -->
      <rect width="100" height="100" fill="#E8F8F5" rx="12" stroke="#000" stroke-width="4.5"/>
      <path d="M-10,40 L110,60 M20,-10 L50,110" stroke="#AED6F1" stroke-width="2" opacity="0.3"/>
      
      <!-- Sleeping Chansey Sprite -->
      <image href="images/free_parking_sprite.png" x="25" y="38" width="50" height="50" />
      
      <!-- Zzz Speeches -->
      <text x="74" y="42" font-family="'Luckiest Guy', sans-serif" font-size="8" fill="#3498DB" font-weight="900">Z</text>
      <text x="80" y="36" font-family="'Luckiest Guy', sans-serif" font-size="10" fill="#3498DB" font-weight="900">z</text>
      <text x="86" y="30" font-family="'Luckiest Guy', sans-serif" font-size="12" fill="#3498DB" font-weight="900">z</text>

      <!-- Comic Action Speech Bubble -->
      <path d="M 16,24 Q 16,10 50,10 Q 84,10 84,24 Q 84,34 50,34 Q 16,34 16,24 Z" fill="#F1C40F" stroke="#000" stroke-width="3"/>
      <path d="M 42,34 L 40,40 L 48,34 Z" fill="#F1C40F" stroke="#000" stroke-width="3"/>
      <text x="23" y="27" font-family="'Luckiest Guy', Impact, sans-serif" font-size="8.5" font-weight="900" fill="#000">REST STOP</text>
    </svg>
  `,
  GoToJail: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <!-- Comic Panel Background -->
      <rect width="100" height="100" fill="#FDEDEC" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- Comic rays -->
      <path d="M-10,10 L110,80 M20,-10 L70,110" stroke="#FADBD8" stroke-width="2.5" opacity="0.6"/>
      
      <!-- Angry Officer Pointing Sprite -->
      <image href="images/go_to_jail_sprite.png" x="12" y="35" width="76" height="57" />
      
      <!-- Spark lines -->
      <path d="M 78,12 L 68,18 M 88,28 L 78,32 M 90,15 L 82,18" stroke="#C0392B" stroke-width="3" stroke-linecap="round"/>

      <!-- Jagged Action Speech Bubble "DETENTION!" -->
      <path d="M 12,32 L 24,28 L 38,32 L 48,25 L 56,32 L 72,25 L 84,32 L 80,45 L 88,52 L 72,55 L 64,62 L 48,55 L 38,62 L 28,55 Z" fill="#E74C3C" stroke="#000" stroke-width="3" stroke-linejoin="round" transform="translate(2, -10) scale(0.95)"/>
      <text x="21" y="27" font-family="'Luckiest Guy', Impact, sans-serif" font-size="8.5" font-weight="900" fill="#FFF" transform="translate(2, -10) scale(0.95)">DETENTION!</text>
    </svg>
  `,
  TeraRaidChest: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <!-- Comic Panel Background -->
      <rect width="100" height="100" fill="#EBDEF0" rx="12" stroke="#000" stroke-width="4.5"/>
      
      <!-- Crystalline Starburst Backdrop -->
      <polygon points="50,15 55,35 75,30 62,45 78,55 60,60 65,80 50,68 35,80 40,60 22,55 38,45 25,30 45,35" fill="#C39BD3" stroke="#8E44AD" stroke-width="1.5" opacity="0.6"/>
      
      <!-- Glowing Tera Crystal -->
      <polygon points="50,18 59,32 50,46 41,32" fill="#D7BDE2" stroke="#8E44AD" stroke-width="2"/>
      <polygon points="50,18 46,32 50,46 54,32" fill="#FFF" opacity="0.8"/>
      
      <!-- Crystalline Chest -->
      <g>
        <rect x="25" y="48" width="50" height="34" fill="#873600" stroke="#000" stroke-width="3.5" rx="4"/>
        <path d="M 25,48 C 25,35 75,35 75,48 Z" fill="#A04000" stroke="#000" stroke-width="3.5"/>
        <!-- Golden Bands -->
        <rect x="33" y="38" width="6" height="44" fill="#F1C40F" stroke="#000" stroke-width="1.5" rx="1"/>
        <rect x="61" y="38" width="6" height="44" fill="#F1C40F" stroke="#000" stroke-width="1.5" rx="1"/>
        <!-- Chest Lock -->
        <circle cx="50" cy="50" r="4.5" fill="#F1C40F" stroke="#000" stroke-width="1.5"/>
      </g>
      
      <!-- Action Text Bubble "RAID" -->
      <path d="M 15,22 L 25,18 L 38,22 L 50,16 L 62,22 L 75,18 L 82,26 L 75,34 L 80,42 L 68,38 L 50,44 L 32,38 L 20,42 Z" fill="#8E44AD" stroke="#000" stroke-width="2.5" stroke-linejoin="round" transform="translate(0, -6) scale(0.95)"/>
      <text x="25" y="27" font-family="'Luckiest Guy', Impact, sans-serif" font-size="10" font-weight="900" fill="#FFF" transform="translate(0, -6) scale(0.95)">TERA RAID</text>
    </svg>
  `,
  AcademyClass: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <!-- Comic Panel Background -->
      <rect width="100" height="100" fill="#FCF3CF" rx="12" stroke="#000" stroke-width="4.5"/>
      <!-- School stripes -->
      <path d="M -10,30 L 110,60 M -10,60 L 110,90" stroke="#EDBB99" stroke-width="8" opacity="0.4"/>
      
      <!-- School Book -->
      <g>
        <rect x="30" y="38" width="44" height="48" fill="#1F618D" stroke="#000" stroke-width="3.5" rx="3"/>
        <rect x="25" y="38" width="8" height="48" fill="#154360" stroke="#000" stroke-width="3.5" rx="2"/>
        <rect x="35" y="41" width="36" height="42" fill="#FFF" opacity="0.9"/>
        <!-- Crest on Book -->
        <circle cx="53" cy="62" r="8" fill="#F1C40F" stroke="#000" stroke-width="1.5"/>
        <polygon points="53,58 56,62 53,66 50,62" fill="#D35400"/>
      </g>
      
      <!-- Graduation Cap -->
      <g>
        <polygon points="48,22 68,26 48,30 28,26" fill="#2C3E50" stroke="#000" stroke-width="2.5"/>
        <rect x="38" y="28" width="20" height="6" fill="#2C3E50" stroke="#000" stroke-width="1.5"/>
        <path d="M 48,26 L 62,32 L 64,38" fill="none" stroke="#F1C40F" stroke-width="1.5"/>
      </g>
      
      <!-- School Action Bubble -->
      <path d="M 12,24 Q 25,12 50,12 Q 75,12 75,24 Q 75,32 50,32 Q 25,32 12,24 Z" fill="#F5B041" stroke="#000" stroke-width="2.5"/>
      <path d="M 46,32 L 44,36 L 50,32 Z" fill="#F5B041" stroke="#000" stroke-width="2.5"/>
      <text x="21" y="26" font-family="'Luckiest Guy', Impact, sans-serif" font-size="9" font-weight="900" fill="#000">ACADEMY</text>
    </svg>
  `,
  PokeMartTax: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <!-- Comic Panel Background -->
      <rect width="100" height="100" fill="#E8F8F5" rx="12" stroke="#000" stroke-width="4.5"/>
      <path d="M-10,35 L110,65 M20,-10 L50,110" stroke="#A3E4D7" stroke-width="2" opacity="0.4"/>
      
      <!-- Poke Mart Bag Overflowing -->
      <g>
        <!-- Items first (behind bag) -->
        <!-- PokeBall -->
        <circle cx="40" cy="40" r="10" fill="#E74C3C" stroke="#000" stroke-width="2.5"/>
        <line x1="30" y1="40" x2="50" y2="40" stroke="#000" stroke-width="2.5"/>
        <circle cx="40" cy="40" r="3.5" fill="#FFF" stroke="#000" stroke-width="2"/>
        
        <!-- Potion -->
        <rect x="52" y="32" width="10" height="15" fill="#2ECC71" stroke="#000" stroke-width="2" rx="1"/>
        <rect x="50" y="26" width="14" height="6" fill="#F1C40F" stroke="#000" stroke-width="2"/>
        
        <!-- Bag itself -->
        <polygon points="28,45 72,45 68,82 32,82" fill="#F4F6F7" stroke="#000" stroke-width="3.5"/>
        <!-- Blue stripe -->
        <rect x="30" y="58" width="40" height="8" fill="#3498DB"/>
      </g>
      
      <!-- Gold Coin -->
      <g>
        <circle cx="70" cy="66" r="17" fill="#F1C40F" stroke="#000" stroke-width="3.5"/>
        <text x="64" y="73" font-family="'Luckiest Guy', Impact, sans-serif" font-size="20" font-weight="900" fill="#FFF" stroke="#000" stroke-width="1.5">₽</text>
      </g>
      
      <!-- Bold TAX starburst -->
      <polygon points="12,12 28,18 35,8 48,18 62,10 65,22 80,18 72,32 82,42 68,42 65,55 52,48 40,55 38,42 22,45 28,32" fill="#E74C3C" stroke="#000" stroke-width="2.5" stroke-linejoin="round" transform="scale(0.8) translate(10, 0)"/>
      <text x="24" y="28" font-family="'Luckiest Guy', Impact, sans-serif" font-size="12" font-weight="900" fill="#FFF" transform="scale(0.8) translate(10, 0)">TAX ₽200</text>
    </svg>
  `,
  LeagueAssessmentTax: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <!-- Comic Panel Background -->
      <rect width="100" height="100" fill="#EBF5FB" rx="12" stroke="#000" stroke-width="4.5"/>
      <path d="M-10,35 L110,65 M20,-10 L50,110" stroke="#AED6F1" stroke-width="2" opacity="0.4"/>
      
      <!-- League Assessment Badge -->
      <g>
        <path d="M 32,38 C 32,38 32,28 50,28 C 68,28 68,38 68,38 C 68,62 50,78 50,78 C 50,78 32,62 32,38 Z" fill="#F1C40F" stroke="#000" stroke-width="3.5"/>
        <path d="M 38,40 C 38,40 38,34 50,34 C 62,34 62,40 62,40 C 62,58 50,70 50,70 C 50,70 38,58 38,40 Z" fill="#1B4F72" opacity="0.9"/>
        <!-- Star -->
        <polygon points="50,42 53,48 60,48 55,52 57,58 50,54 43,58 45,52 40,48 47,48" fill="#F1C40F" stroke="#000" stroke-width="1.5"/>
      </g>
      
      <!-- Sparkles -->
      <path d="M 22,30 L 26,34 M 78,30 L 74,34 M 50,18 L 50,23" stroke="#F1C40F" stroke-width="2.5" stroke-linecap="round"/>
      
      <!-- Bold TAX starburst -->
      <polygon points="12,12 28,18 35,8 48,18 62,10 65,22 80,18 72,32 82,42 68,42 65,55 52,48 40,55 38,42 22,45 28,32" fill="#2E4053" stroke="#000" stroke-width="2.5" stroke-linejoin="round" transform="scale(0.8) translate(10, 0)"/>
      <text x="24" y="28" font-family="'Luckiest Guy', Impact, sans-serif" font-size="12" font-weight="900" fill="#FFF" transform="scale(0.8) translate(10, 0)">TAX ₽100</text>
    </svg>
  `
};

export const BoardSpaces = [
  { id: 0, name: "GO", type: "GO", cost: 0, rent: 0, group: "corner" },
  { id: 1, name: "Poco Path", type: "property", pokemon: "Lechonk", cost: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50, group: "brown" },
  { id: 2, name: "Tera Raid Chest", type: "raid", cost: 0, rent: 0, group: "card" },
  { id: 3, name: "Poco Path Lighthouse", type: "property", pokemon: "Tarountula", cost: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50, group: "brown" },
  { id: 4, name: "Poke Mart Tax", type: "tax", cost: 200, rent: 0, group: "tax" },
  { id: 5, name: "Flying Taxi - South", type: "station", pokemon: "Corviknight", cost: 200, rent: [25, 50, 100, 200], group: "station" },
  { id: 6, name: "South Province Area One", type: "property", pokemon: "Pawmi", cost: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, group: "light-blue" },
  { id: 7, name: "Academy Class", type: "academy", cost: 0, rent: 0, group: "card" },
  { id: 8, name: "South Province Area Two", type: "property", pokemon: "Fidough", cost: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, group: "light-blue" },
  { id: 9, name: "South Province Area Three", type: "property", pokemon: "Smoliv", cost: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50, group: "light-blue" },
  { id: 10, name: "Clavell's Detention Office", type: "jail", cost: 0, rent: 0, group: "corner" },
  { id: 11, name: "Mesagoza Gate", type: "property", pokemon: "Tandemaus", cost: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, group: "pink" },
  { id: 12, name: "Rotom Phone Tower", type: "utility", pokemon: "Rotom", cost: 150, rent: [4, 10], group: "utility" },
  { id: 13, name: "Mesagoza South", type: "property", pokemon: "Nacli", cost: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, group: "pink" },
  { id: 14, name: "Mesagoza North", type: "property", pokemon: "Charcadet", cost: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100, group: "pink" },
  { id: 15, name: "Flying Taxi - East", type: "station", pokemon: "Corviknight", cost: 200, rent: [25, 50, 100, 200], group: "station" },
  { id: 16, name: "Asado Desert", type: "property", pokemon: "Orthworm", cost: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, group: "orange" },
  { id: 17, name: "Tera Raid Chest", type: "raid", cost: 0, rent: 0, group: "card" },
  { id: 18, name: "Asado Desert Ruins", type: "property", pokemon: "Toedscool", cost: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, group: "orange" },
  { id: 19, name: "Cascarrafa Outskirts", type: "property", pokemon: "Capsakid", cost: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, group: "orange" },
  { id: 20, name: "Pokemon Center Rest Stop", type: "parking", cost: 0, rent: 0, group: "corner" },
  { id: 21, name: "Tagtree Thicket", type: "property", pokemon: "Grafaiai", cost: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, group: "red" },
  { id: 22, name: "Academy Class", type: "academy", cost: 0, rent: 0, group: "card" },
  { id: 23, name: "Tagtree Thicket Woods", type: "property", pokemon: "Shroodle", cost: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, group: "red" },
  { id: 24, name: "West Province Area Three", type: "property", pokemon: "Tinkatink", cost: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150, group: "red" },
  { id: 25, name: "Flying Taxi - West", type: "station", pokemon: "Corviknight", cost: 200, rent: [25, 50, 100, 200], group: "station" },
  { id: 26, name: "Levincia Outskirts", type: "property", pokemon: "Wattrel", cost: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, group: "yellow" },
  { id: 27, name: "Levincia Port", type: "property", pokemon: "Bellibolt", cost: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, group: "yellow" },
  { id: 28, name: "LP Charging Station", type: "utility", pokemon: "Rotom", cost: 150, rent: [4, 10], group: "utility" },
  { id: 29, name: "Levincia Gym", type: "property", pokemon: "Pawmot", cost: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150, group: "yellow" },
  { id: 30, name: "Sent to Clavell's Office", type: "gotojail", cost: 0, rent: 0, group: "corner" },
  { id: 31, name: "Casseroya Lake Beach", type: "property", pokemon: "Dondozo", cost: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, group: "green" },
  { id: 32, name: "Casseroya Lake Isles", type: "property", pokemon: "Tatsugiri", cost: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, group: "green" },
  { id: 33, name: "Tera Raid Chest", type: "raid", cost: 0, rent: 0, group: "card" },
  { id: 34, name: "Casseroya Lake Mountain", type: "property", pokemon: "Veluza", cost: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200, group: "green" },
  { id: 35, name: "Flying Taxi - North", type: "station", pokemon: "Corviknight", cost: 200, rent: [25, 50, 100, 200], group: "station" },
  { id: 36, name: "Academy Class", type: "academy", cost: 0, rent: 0, group: "card" },
  { id: 37, name: "Area Zero Gate", type: "property", pokemon: "Ceruledge", cost: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200, group: "dark-blue" },
  { id: 38, name: "League Assessment Tax", type: "tax", cost: 100, rent: 0, group: "tax" },
  { id: 39, name: "Area Zero Crater", type: "property", pokemon: "Miraidon", cost: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200, group: "dark-blue" }
];

export const AcademyCards = [
  { text: "Passed home economics class with Jacq! Collect ₽50", action: "money", val: 50 },
  { text: "Got caught riding Koraidon in hallways. Go directly to Detention!", action: "gotojail" },
  { text: "Found a lost item on the playground. Collect ₽20", action: "money", val: 20 },
  { text: "Advanced to GO. Collect ₽200", action: "moveto", val: 0 },
  { text: "Gym Battle preparation. Pay ₽50 for potions", action: "money", val: -50 },
  { text: "Principal Clavell rewards you for clean record! Get Out of Detention Free", action: "jailfree" },
  { text: "Take a trip to Levincia Gym. If you pass GO, collect ₽200", action: "moveto", val: 29 },
  { text: "Your Pokemon leveled up! Pay ₽15 per Camp and ₽40 per Gym Station for battle treats", action: "repairs", houseVal: 15, hotelVal: 40 },
  { text: "Team Star blocked the path! Pay ₽100 toll", action: "money", val: -100 },
  { text: "Won the Academy Tournament! Collect ₽100", action: "money", val: 100 }
];

export const TeraRaidCards = [
  { text: "Successfully cleared a 5-Star Tera Raid! Collect ₽100", action: "money", val: 100 },
  { text: "Pokemon Center donation fund. Pay ₽50", action: "money", val: -50 },
  { text: "Tera shards collection refund. Collect ₽25", action: "money", val: 25 },
  { text: "LP Conversion! Collect ₽150", action: "money", val: 150 },
  { text: "Your Pokemon fainted in a Tera Raid. Pay ₽50 for revives", action: "money", val: -50 },
  { text: "Get Out of Detention Free card from Geeta", action: "jailfree" },
  { text: "Retreat to Pokemon Center Rest Stop (Free Parking)", action: "moveto", val: 20 },
  { text: "Raid den collapse! Pay ₽25 per Camp and ₽100 per Gym Station for rebuilding", action: "repairs", houseVal: 25, hotelVal: 100 },
  { text: "Scholarship reward from Uva/Naranja Academy. Collect ₽200", action: "money", val: 200 },
  { text: "Inherited Gimmighoul Coins! Collect ₽100", action: "money", val: 100 }
];
