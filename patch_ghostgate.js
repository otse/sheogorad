const fs = require('fs');
const t = '\t';
const t2 = '\t\t';
const t3 = '\t\t\t';
const t4 = '\t\t\t\t';
const t5 = '\t\t\t\t\t';
const t6 = '\t\t\t\t\t\t';

// Helper to build a building block
function building(typeKey, instanceName, condition, modifier, forced, pool, itemPool) {
  const forcedStr = forced.map(x => `"${x}"`).join(', ');
  const poolLines = pool.map(x => `${t6}"${x}"`).join(',\n');
  const itemPoolLines = itemPool.map(x => `"${x}"`).join(', ');
  return (
    `${t4}"${typeKey}": [\n` +
    `${t4}{\n` +
    `${t5}"instance": {\n` +
    `${t5}"name": "${instanceName}",\n` +
    `${t5}"condition": "${condition}",\n` +
    `${t5}"modifier": "${modifier}"\n` +
    `${t5}},\n` +
    `${t5}"content": {\n` +
    `${t5}"npcs": {\n` +
    `${t6}"forced": [${forcedStr}],\n` +
    `${t6}"pool": [\n` +
    `${poolLines}\n` +
    `${t6}]\n` +
    `${t5}},\n` +
    `${t5}"items": {\n` +
    `${t6}"pool": [${itemPoolLines}]\n` +
    `${t5}}\n` +
    `${t5}}\n` +
    `${t4}}\n` +
    `${t4}]`
  );
}

const buildings = [
  building(
    'ghostgate_tower_of_dusk',
    'Tower of Dusk', 'fortified',
    'Redoran volunteers and Buoyant Armigers hold the western tower against the Blight',
    ['galore_salvi', 'fonas_retheran', 'drelyne_llenim', 'galdal_omayn', 'wulf'],
    ['redoran_guard', 'buoyant_armiger'],
    ['"glass_armor"', '"redoran_token"']
  ),
  building(
    'ghostgate_tower_of_dusk_lower',
    'Tower of Dusk Lower Level', 'spartan',
    'an armory and training hall where Redoran soldiers sharpen their skills for the war with Dagoth Ur',
    ['dronos_llervu', 'mertis_falandas', 'berela_andrano', 'mandran_indrano', 'taluro_athren', 'salyn_sarethi', 'enar_dralor', 'elvasea_thalas'],
    ['redoran_guard', 'fighter_recruit'],
    ['"glass_armor"', '"spear"', '"smith_tools"']
  ),
  building(
    'ghostgate_tower_of_dawn',
    'Tower of Dawn', 'sacred',
    'Tribunal Temple fighters and healers occupy the eastern tower',
    ['faras_thirano', 'rilvase_avani', 'teril_savani', 'ferone_veran', 'selmen_relas', 'ralyn_othravel'],
    ['ordinator', 'temple_priest'],
    ['"enchanted_item"', '"healing_potion"']
  ),
  building(
    'ghostgate_tower_of_dawn_lower',
    'Tower of Dawn Lower Level', 'sacred',
    'healers tend to soldiers and pilgrims wounded by the Blight',
    ['ulmiso_maloren'],
    ['temple_priest', 'acolyte'],
    ['"healing_potion"', '"restore_attribute_potion"']
  ),
  building(
    'ghostgate_temple',
    'Ghostgate Temple', 'solemn',
    'shrines line the tunnel passage through the Ghostfence itself',
    ['nilvyn_drothan', 'uvoo_llaren'],
    ['temple_priest', 'pilgrim'],
    ['"shrine_offering"', '"pilgrim_token"']
  )
].join(',\n\n');

const buildingsBlock =
  `,\n\n${t3}"buildings": {\n` +
  buildings + '\n' +
  `${t3}}`;

// --- PATCH CANON LIST ---
const canonPath = 'c:/Users/otseg/Desktop/ghostgate/json/canon list.json';
let text = fs.readFileSync(canonPath, 'utf8');
if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

// Unique anchor: end of Ghostgate's transport block followed by closing brace + Kogoruhn
const oldTransportEnd = `${t4}"almsivi_intervention": ["Ald'ruhn"]\n${t3}}\n${t2}},\n${t2}{\n${t3}"name": "Kogoruhn"`;
const newTransportEnd = `${t4}"almsivi_intervention": ["Ald'ruhn"]\n${t3}}${buildingsBlock}\n${t2}},\n${t2}{\n${t3}"name": "Kogoruhn"`;

if (!text.includes(oldTransportEnd)) {
  console.error('ERROR: anchor not found!');
  const gi = text.indexOf('"name": "Ghostgate"');
  console.error('Raw context:', JSON.stringify(text.slice(gi + 200, gi + 400)));
  process.exit(1);
}

text = text.replace(oldTransportEnd, newTransportEnd);
fs.writeFileSync(canonPath, text, 'utf8');
console.log('Patched canon list.json - Ghostgate buildings added.');

// --- PATCH ICON LIST ---
const iconPath = 'c:/Users/otseg/Desktop/ghostgate/json/icon list.json';
const icons = JSON.parse(fs.readFileSync(iconPath, 'utf8'));

const newNpcs = {
  assantus_hansar:       '\uD83E\uDDD9',    // 🧙 ashlander barbarian
  berela_andrano:        '\uD83E\uDDD9',    // 🧙 savant/trainer
  buoyant_armiger:       '\uD83E\uDD3A',    // 🤺 fighter
  drelyne_llenim:        '\uD83E\uDD3A',    // 🤺 buoyant armiger female
  dronos_llervu:         '\uD83D\uDC77',    // 👷 smith
  elvasea_thalas:        '\uD83E\uDDDD\u200D\u2640\uFE0F', // 🧝‍♀️ scout female
  enar_dralor:           '\uD83E\uDD3A',    // 🤺 buoyant armiger
  faras_thirano:         '\uD83E\uDDD9\u200D\u2640\uFE0F', // 🧙‍♀️ enchanter
  ferone_veran:          '\uD83D\uDC82',    // 💂 ordinator female
  fonas_retheran:        '\uD83E\uDDDD\u200D\u2640\uFE0F', // 🧝‍♀️ trader female
  galdal_omayn:          '\uD83E\uDD3A',    // 🤺 buoyant armiger female
  galore_salvi:          '\uD83E\uDDDD\u200D\u2640\uFE0F', // 🧝‍♀️ publican
  mandran_indrano:       '\uD83C\uDFCB\uFE0F', // 🏋️ drillmaster
  mertis_falandas:       '\uD83E\uDD3A',    // 🤺 master trainer / crusader
  nilvyn_drothan:        '\uD83E\uDDD9\u200D\u2640\uFE0F', // 🧙‍♀️ priest
  pilgrim:               '\uD83E\uDDDD',    // 🧝 pilgrim
  ralyn_othravel:        '\uD83E\uDD3A',    // 🤺 crusader
  rilvase_avani:         '\uD83E\uDDD9\u200D\u2640\uFE0F', // 🧙‍♀️ healer
  salyn_sarethi:         '\uD83E\uDD3A',    // 🤺 buoyant armiger
  selmen_relas:          '\uD83D\uDC82',    // 💂 ordinator
  taluro_athren:         '\uD83C\uDFCB\uFE0F', // 🏋️ master-at-arms
  teril_savani:          '\uD83E\uDDD9\u200D\u2640\uFE0F', // 🧙‍♀️ apothecary
  tunipy_shamirbasour:   '\uD83E\uDDD9\u200D\u2640\uFE0F', // 🧙‍♀️ wise woman
  ulmiso_maloren:        '\uD83E\uDDD9\u200D\u2640\uFE0F', // 🧙‍♀️ healer
  uvoo_llaren:           '\uD83E\uDDD9\u200D\u2640\uFE0F', // 🧙‍♀️ monk
  wulf:                  '\uD83E\uDDD9',    // 🧙 (avatar of Talos)
  zallit_assattadaishah: '\uD83E\uDDDD'     // 🧝 ashlander scout
};

Object.assign(icons.npcIcons, newNpcs);
// Re-sort alphabetically
const sorted = {};
for (const k of Object.keys(icons.npcIcons).sort()) sorted[k] = icons.npcIcons[k];
icons.npcIcons = sorted;

fs.writeFileSync(iconPath, JSON.stringify(icons, null, 2) + '\n', 'utf8');
console.log('Patched icon list.json - added ' + Object.keys(newNpcs).length + ' new NPC icons.');
console.log('Total icons:', Object.keys(icons.npcIcons).length);

