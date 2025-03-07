// Global resource variables – starting with 25 HP and 10 MP
let max_hp = 25, current_hp = 25;
let max_mp = 10, current_mp = 10;
let max_stamina = 100, current_stamina = 100;
let max_atb = 100, current_atb = 0;

// Global stat variables – all start at 1
let stat_str = 1, stat_vit = 1, stat_dex = 1, stat_mag = 1, stat_wil = 1, stat_spr = 1, stat_lck = 1;
let level = 1, exp = 1, movement = 1;

// UI elements for resource tracker (created in createResourceUI)
let maxHpInput, setMaxHpButton, maxMpInput, setMaxMpButton;
let maxStaminaInput, setMaxStaminaButton, maxAtbInput, setMaxAtbButton;
let hpPlus, hpMinus, mpPlus, mpMinus, staminaPlus, staminaMinus, atbPlus, atbMinus;
let resetButton;
let staminaAtbLink = false, staminaAtbLinkButton;
let cnv;
let modalDiv = null; // For talents and traits modals

// Global container variables (set in setup)
let resourceUIContainer;
let skillsContainer;

// For description modals
let descriptionModal = null;

// For linking stats to skills
let statLabelElements = {};
let attributeCheckboxes = {};
let statLinkMapping = {};
let attributeLinkMapping = {};

// For talents
let talents = []; // Array to store talent objects

const statDescriptions = {
  "STR": "Affects melee and ranged physical rolls (1d12 + STR vs DEF).",
  "VIT": "Increases HP (+5 HP per point).",
  "DEX": "Determines dodge rolls (1d12 + DEX to evade).",
  "MAG": "Affects magical attack rolls (1d12 + MAG vs MDEF).",
  "WIL": "Increases MP (+5 MP per point).",
  "SPR": "Determines magic evasion (1d12 + SPR to evade magic attacks).",
  "LCK": "Modifies loot rolls, critical hits, and grants rerolls (1 per 5 LCK).",
  "Level": "Character Level.",
  "EXP": "Experience Points (EXP) accumulated; formula for next level is TBD.",
  "Movement": "Determines movement range per turn."
};

const additionalAttributes = [
  { name: "Athletics", desc: "Your ability to exert physical strength and endurance to overcome obstacles. Used for climbing, swimming, jumping, grappling, and feats of raw power.", color: "#C0392B" },
  { name: "Endurance", desc: "Your capacity to withstand physical strain, pain, and adverse conditions. Used for resisting poisons, disease, exhaustion, and enduring extreme conditions.", color: "#27AE60" },
  { name: "Agility", desc: "Your speed, reflexes, and balance in movement and precision. Used for dodging, acrobatics, stealth, and precise motor control.", color: "#2980B9" },
  { name: "Willpower", desc: "Your mental resilience and determination to resist external influences. Used for resisting mind control, fear effects, psychic attacks, and maintaining focus under pressure.", color: "#FF69B4" },
  { name: "Awareness", desc: "Your ability to observe, sense, and interpret your surroundings. Used for noticing hidden details, tracking, detecting lies, and reacting to environmental threats.", color: "#F39C12" },
  { name: "Influence", desc: "Your ability to manipulate, persuade, or command others through words and body language. Friendly Influence is used for persuasion, bartering, and diplomacy; Hostile Influence is used for intimidation and coercion.", color: "#8E44AD" },
  { name: "Ingenuity", desc: "Your problem-solving ability and technical expertise in mechanical, electronic, and creative fields. Used for hacking, crafting, repairing technology, and improvising solutions.", color: "#2C3E50" }
];

const defaultTalents = [
  // Physical Combat
  { name: "Relentless Fighter - Level I", level: "I", category: "Physical Combat", description: "Recover 5 Stamina per turn.", maxLevel: "II" },
  { name: "Relentless Fighter - Level II", level: "II", category: "Physical Combat", description: "Recover 10 Stamina per turn.", maxLevel: "II" },
  { name: "Heavy Hitter - Level I", level: "I", category: "Physical Combat", description: "Gain +2 melee damage on critical hits.", maxLevel: "III" },
  { name: "Heavy Hitter - Level II", level: "II", category: "Physical Combat", description: "Gain +4 melee damage on critical hits.", maxLevel: "III" },
  { name: "Heavy Hitter - Level III", level: "III", category: "Physical Combat", description: "Gain +6 melee damage on critical hits.", maxLevel: "III" },
  { name: "Quick Reflexes - Level I", level: "I", category: "Physical Combat", description: "Dodging costs 20 Stamina instead of 25.", maxLevel: "III" },
  { name: "Quick Reflexes - Level II", level: "II", category: "Physical Combat", description: "Dodging costs 15 Stamina instead of 25.", maxLevel: "III" },
  { name: "Quick Reflexes - Level III", level: "III", category: "Physical Combat", description: "Dodging costs 10 Stamina instead of 25.", maxLevel: "III" },
  { name: "Enduring Block - Level I", level: "I", category: "Physical Combat", description: "If you fully block an attack, you recover 10 Stamina.", maxLevel: "III" },
  { name: "Enduring Block - Level II", level: "II", category: "Physical Combat", description: "If you fully block an attack, you recover 15 Stamina.", maxLevel: "III" },
  { name: "Enduring Block - Level III", level: "III", category: "Physical Combat", description: "If you fully block an attack, you recover 20 Stamina.", maxLevel: "III" },
  { name: "Battlefield Awareness - Level I", level: "I", category: "Physical Combat", description: "When an enemy misses you, gain 5 ATB.", maxLevel: "III" },
  { name: "Battlefield Awareness - Level II", level: "II", category: "Physical Combat", description: "When an enemy misses you, gain 10 ATB.", maxLevel: "III" },
  { name: "Battlefield Awareness - Level III", level: "III", category: "Physical Combat", description: "When an enemy misses you, gain 15 ATB.", maxLevel: "III" },
  { name: "Tactical Step - Level I", level: "I", category: "Physical Combat", description: "Moving an extra 10 ft per turn is free.", maxLevel: "II" },
  { name: "Tactical Step - Level II", level: "II", category: "Physical Combat", description: "Moving an extra 20 ft per turn is free.", maxLevel: "II" },
  { name: "Momentum Strike - Level I", level: "I", category: "Physical Combat", description: "If you move at least 15 ft before attacking, your attack deals +2 damage.", maxLevel: "I" },
  { name: "Shatter Guard - Level I", level: "I", category: "Physical Combat", description: "If an enemy is blocking, your attack ignores 2 DEF.", maxLevel: "I" },
  { name: "Grappling Mastery - Level I", level: "I", category: "Physical Combat", description: "Gain Advantage on all Grapple attempts.", maxLevel: "I" },

  // Magical
  { name: "Efficient Spellcasting - Level I", level: "I", category: "Magical", description: "Materia spells cost -5 MP (minimum 1MP cost per spell).", maxLevel: "III" },
  { name: "Efficient Spellcasting - Level II", level: "II", category: "Magical", description: "Materia spells cost -10 MP (minimum 1MP cost per spell).", maxLevel: "III" },
  { name: "Efficient Spellcasting - Level III", level: "III", category: "Magical", description: "Materia spells cost -15 MP (minimum 1MP cost per spell).", maxLevel: "III" },
  { name: "Arcane Conductor - Level I", level: "I", category: "Magical", description: "If you evade a magic attack, regain 5 MP.", maxLevel: "II" },
  { name: "Arcane Conductor - Level II", level: "II", category: "Magical", description: "If you evade a magic attack, regain 10 MP.", maxLevel: "II" },
  { name: "Elemental Mastery - Level I", level: "I", category: "Magical", description: "Choose one element; spells of that type deal +2 damage.", maxLevel: "II" },
  { name: "Elemental Mastery - Level II", level: "II", category: "Magical", description: "Choose one element; spells of that type deal +4 damage.", maxLevel: "II" },
  { name: "Mana Reservoir - Level I", level: "I", category: "Magical", description: "Max MP is increased by 5.", maxLevel: "II" },
  { name: "Mana Reservoir - Level II", level: "II", category: "Magical", description: "Max MP is increased by 10.", maxLevel: "II" },
  { name: "Overcharged Spellcasting - Level I", level: "I", category: "Magical", description: "If you spend double MP on a spell, its damage increases by +50%.", maxLevel: "I" },
  { name: "Dual Weave - Level I", level: "I", category: "Magical", description: "If you cast a spell, you may spend 25 ATB to cast a second spell as a bonus effect (must be a different spell).", maxLevel: "II" },
  { name: "Dual Weave - Level II", level: "II", category: "Magical", description: "If you cast a spell, you may spend 50 ATB to cast a second spell as a bonus effect (must be a different spell).", maxLevel: "II" },
  { name: "Weave Momentum - Level I", level: "I", category: "Magical", description: "If you cast a spell, your next attack deals +2 damage.", maxLevel: "I" },

  // Ranged Combat
  { name: "Sharpshooter - Level I", level: "I", category: "Ranged Combat", description: "Gain +1 damage on ranged attacks.", maxLevel: "III" },
  { name: "Sharpshooter - Level II", level: "II", category: "Ranged Combat", description: "Gain +2 damage on ranged attacks.", maxLevel: "III" },
  { name: "Sharpshooter - Level III", level: "III", category: "Ranged Combat", description: "Gain +3 damage on ranged attacks.", maxLevel: "III" },
  { name: "Cover Fire - Level I", level: "I", category: "Ranged Combat", description: "If an ally within 30 ft is attacked, you may spend 25 ATB to make a reaction shot at the attacker.", maxLevel: "I" },
  { name: "Eagle Eye - Level I", level: "I", category: "Ranged Combat", description: "Ignore half cover when making ranged attacks.", maxLevel: "I" },
  { name: "Deadly Precision - Level I", level: "I", category: "Ranged Combat", description: "When making a ranged attack, you may spend 10 ATB to increase your crit range by 1.", maxLevel: "III" },
  { name: "Deadly Precision - Level II", level: "II", category: "Ranged Combat", description: "When making a ranged attack, you may spend 20 ATB to increase your crit range by 2.", maxLevel: "III" },
  { name: "Deadly Precision - Level III", level: "III", category: "Ranged Combat", description: "When making a ranged attack, you may spend 30 ATB to increase your crit range by 3.", maxLevel: "III" },

  // Defensive
  { name: "Guardian’s Oath - Level I", level: "I", category: "Defensive", description: "When you block for an ally, gain +2 to your Block Roll.", maxLevel: "III" },
  { name: "Guardian’s Oath - Level II", level: "II", category: "Defensive", description: "When you block for an ally, gain +4 to your Block Roll.", maxLevel: "III" },
  { name: "Guardian’s Oath - Level III", level: "III", category: "Defensive", description: "When you block for an ally, gain +6 to your Block Roll.", maxLevel: "III" },
  { name: "Armor Mastery - Level I", level: "I", category: "Defensive", description: "Wearing Heavy Armor increases movement speed by 5 ft.", maxLevel: "III" },
  { name: "Armor Mastery - Level II", level: "II", category: "Defensive", description: "Wearing Heavy Armor increases movement speed by 10 ft.", maxLevel: "III" },
  { name: "Armor Mastery - Level III", level: "III", category: "Defensive", description: "Wearing Heavy Armor increases movement speed by 15 ft.", maxLevel: "III" },
  { name: "Defensive Momentum - Level I", level: "I", category: "Defensive", description: "After blocking an attack, your next dodge roll gains Advantage.", maxLevel: "I" },
  { name: "Reactive Parry - Level I", level: "I", category: "Defensive", description: "If an enemy attacks you in melee, you may spend 25 ATB to counterattack.", maxLevel: "I" },
  { name: "Iron Will - Level I", level: "I", category: "Defensive", description: "Start encounters with an additional 25 stamina.", maxLevel: "I" },
  { name: "Stalwart Wall - Level I", level: "I", category: "Defensive", description: "If you don’t move on your turn, you gain +2 DEF for 1 round.", maxLevel: "I" },

  // Utility & Tactical
  { name: "Tactician’s Instinct - Level I", level: "I", category: "Utility & Tactical", description: "Gain Advantage on Awareness rolls, and once per combat, you may reroll Initiative.", maxLevel: "II" },
  { name: "Tactician’s Instinct - Level II", level: "II", category: "Utility & Tactical", description: "Gain Advantage on Awareness rolls, and once per combat, you may reroll Initiative.", maxLevel: "II" },
  { name: "Quick Hands - Level I", level: "I", category: "Utility & Tactical", description: "Using items costs half Stamina.", maxLevel: "I" },
  { name: "Battle Medic - Level I", level: "I", category: "Utility & Tactical", description: "Healing grants an additional 2d4 HP.", maxLevel: "III" },
  { name: "Battle Medic - Level II", level: "II", category: "Utility & Tactical", description: "Healing grants an additional 2d6 HP.", maxLevel: "III" },
  { name: "Battle Medic - Level III", level: "III", category: "Utility & Tactical", description: "Healing grants an additional 2d8 HP.", maxLevel: "III" },
  { name: "Adrenaline Boost - Level I", level: "I", category: "Utility & Tactical", description: "When below half HP, immediately gain 25 Stamina.", maxLevel: "I" },
  { name: "Improvised Combatant - Level I", level: "I", category: "Utility & Tactical", description: "Gain Advantage when using the environment for attacks (throwing objects, knocking down obstacles).", maxLevel: "I" },
  { name: "Rushdown - Level I", level: "I", category: "Utility & Tactical", description: "Gain +5 ATB if you move at least 20 ft before attacking.", maxLevel: "II" },
  { name: "Rushdown - Level II", level: "II", category: "Utility & Tactical", description: "Gain +10 ATB if you move at least 20 ft before attacking.", maxLevel: "II" },
  { name: "Support Specialist - Level I", level: "I", category: "Utility & Tactical", description: "When assisting an ally, they gain +5 ATB.", maxLevel: "II" },
  { name: "Support Specialist - Level II", level: "II", category: "Utility & Tactical", description: "When assisting an ally, they gain +10 ATB.", maxLevel: "II" },
  { name: "Unbreakable Focus - Level I", level: "I", category: "Utility & Tactical", description: "Once per encounter, you may reroll a status effect affecting you.", maxLevel: "I" }
];

// Working copy of talents
let existingTalents = [...defaultTalents];

// Array to store selected traits
let traits = [];
// Default maximum number of traits
let maxTraits = 3;

const defaultTraits = [
  { name: "Grafted Weapon", category: "Combat", positive: "Cannot be unwillingly disarmed.", negative: "Disadvantage on Agility checks." },
  { name: "EX-SOLDIER", category: "Combat", positive: "Advantage on Athletics checks.", negative: "Disadvantage on Ingenuity checks." },
  { name: "Ancient Echoes", category: "Magical", positive: "You can sense the presence of raw Materia and Lifestream energy within 60 feet, even through barriers (you do not sense refined Materia equipped to others).", negative: "Disadvantage on Awareness checks." },
  { name: "Imposing Posture", category: "Utility", positive: "Advantage on all hostile Influence checks.", negative: "Disadvantage on all friendly Influence checks." },
  { name: "Cybernetic Enhancements", category: "Utility", positive: "Start each battle with +25 ATB.", negative: "Start each battle with -25 Movement." },
  { name: "Fractured Mind", category: "Utility", positive: "Advantage on Awareness checks.", negative: "Disadvantage on Willpower checks." },
  { name: "Silver Tongue", category: "Utility", positive: "Advantage on Influence checks.", negative: "Disadvantage on Athletics checks." },
  { name: "Wandering Spirit", category: "Physical", positive: "Advantage on Endurance checks.", negative: "Resting requires double the time for full benefits." },
  { name: "Jenova’s Taint", category: "Combat", positive: "Once per turn, you can reroll an attack roll.", negative: "When using the reroll, make a Willpower check (DC 10); if failed, waste stamina without attacking." },
  { name: "Glowing Eyes", category: "Physical", positive: "Your vision is enhanced beyond normal limits. You can see clearly in dim light and ignore visual obscurities such as smoke or fog.", negative: "Disadvantage on Stealth checks in darkness or shadowed areas." },
  { name: "Reactive Reflexes", category: "Combat", positive: "Advantage on Dodge Rolls.", negative: "After Dodging, disadvantage on your next Attack (physical or magical)." },
  { name: "Weakened Flesh", category: "Magical", positive: "+10 Maximum MP.", negative: "-10 Maximum HP." }
];

// Working copy of traits
let existingTraits = [...defaultTraits];

// **Utility Functions**

// Show a confirmation or error modal
function showConfirmationModal(message, onConfirm, isError = false) {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv();
  modalDiv.style("position", "absolute");
  modalDiv.style("top", "50%");
  modalDiv.style("left", "50%");
  modalDiv.style("transform", "translate(-50%, -50%)");
  modalDiv.style("background", "#fff");
  modalDiv.style("padding", "20px");
  modalDiv.style("border", "2px solid #000");
  modalDiv.style("z-index", "1000");
  modalDiv.style("width", "300px");

  createElement("p", message).parent(modalDiv);

  if (isError) {
    let closeBtn = createButton("Close");
    closeBtn.parent(modalDiv);
    closeBtn.style("margin", "5px");
    closeBtn.mousePressed(() => modalDiv.remove());
  } else {
    let confirmBtn = createButton("Confirm");
    confirmBtn.parent(modalDiv);
    confirmBtn.style("margin", "5px");
    confirmBtn.mousePressed(() => {
      onConfirm();
      modalDiv.remove();
    });
    let cancelBtn = createButton("Cancel");
    cancelBtn.parent(modalDiv);
    cancelBtn.style("margin", "5px");
    cancelBtn.mousePressed(() => modalDiv.remove());
  }
}

// Show talent description
function showTalentDescription(title, description) {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv();
  modalDiv.style("position", "absolute");
  modalDiv.style("top", "50%");
  modalDiv.style("left", "50%");
  modalDiv.style("transform", "translate(-50%, -50%)");
  modalDiv.style("background", "#fff");
  modalDiv.style("padding", "20px");
  modalDiv.style("border", "2px solid #000");
  modalDiv.style("z-index", "1000");
  modalDiv.style("max-width", "400px");
  modalDiv.style("word-wrap", "break-word");

  createElement("h3", title).parent(modalDiv);
  createP(description).parent(modalDiv);
  let closeBtn = createButton("Close");
  closeBtn.parent(modalDiv);
  closeBtn.style("margin-top", "10px");
  closeBtn.mousePressed(() => modalDiv.remove());
}

// Show trait description
function showTraitDescription(name, positive, negative) {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv();
  modalDiv.style("position", "absolute");
  modalDiv.style("top", "50%");
  modalDiv.style("left", "50%");
  modalDiv.style("transform", "translate(-50%, -50%)");
  modalDiv.style("background", "#fff");
  modalDiv.style("padding", "20px");
  modalDiv.style("border", "2px solid #000");
  modalDiv.style("z-index", "1000");
  modalDiv.style("width", "300px");

  createElement("h3", name).parent(modalDiv);
  createP(`(+) ${positive}<br>(-) ${negative}`).parent(modalDiv);
  let closeBtn = createButton("Close").parent(modalDiv);
  closeBtn.style("margin", "5px");
  closeBtn.mousePressed(() => modalDiv.remove());
}

// Show stat description
function showStatDescription(title, description) {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv();
  modalDiv.style("position", "absolute");
  modalDiv.style("top", "50%");
  modalDiv.style("left", "50%");
  modalDiv.style("transform", "translate(-50%, -50%)");
  modalDiv.style("background", "#fff");
  modalDiv.style("padding", "20px");
  modalDiv.style("border", "2px solid #000");
  modalDiv.style("z-index", "1000");
  modalDiv.style("max-width", "400px");
  modalDiv.style("word-wrap", "break-word");

  createElement("h3", title).parent(modalDiv);
  createP(description).parent(modalDiv);
  let closeBtn = createButton("Close");
  closeBtn.parent(modalDiv);
  closeBtn.style("margin-top", "10px");
  closeBtn.mousePressed(() => modalDiv.remove());
}

// **p5.js Setup and Draw**

function setup() {
  let resourceBarsContainer = select("#resource-bars");
  let resourceControlsContainer = select("#resource-controls");

  let containerWidth = resourceBarsContainer.elt.clientWidth;
  let canvasWidth = min(containerWidth, 600);
  let canvasHeight = 150;
  cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent(resourceBarsContainer);
  textFont("Arial");
  textSize(16);
  textAlign(LEFT, TOP);

  resourceUIContainer = createDiv();
  resourceUIContainer.parent(resourceControlsContainer);
  resourceUIContainer.id("resourceUIContainer");

  skillsContainer = createDiv();
  skillsContainer.id("skillsContainer");

  createResourceUI();
  createStatsUI();
  createTalentsUI();
  createTraitsUI();

  const tablinks = document.querySelectorAll('.tablink');
  const tabcontents = document.querySelectorAll('.tabcontent');
  tablinks.forEach(btn => {
    btn.addEventListener('click', () => {
      tablinks.forEach(b => b.classList.remove('active'));
      tabcontents.forEach(tc => tc.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
    });
  });
}

function windowResized() {
  let resourceBarsContainer = select("#resource-bars");
  let containerWidth = resourceBarsContainer.elt.clientWidth;
  let canvasWidth = min(containerWidth, 600);
  resizeCanvas(canvasWidth, 150);
}

function draw() {
  background(255);
  displayBars();
}

function displayBars() {
  background(255);
  
  let bar_width = width * 0.6;
  let bar_height = 20;
  let x = width * 0.1;
  let y_hp = 25, y_mp = 55, y_stamina = 85, y_atb = 115;
  
  // HP Bar
  stroke(0);
  fill(128);
  rect(x, y_hp, bar_width, bar_height);
  noStroke();
  fill(255, 0, 0);
  let hp_width = (current_hp / max_hp) * bar_width;
  rect(x, y_hp, hp_width, bar_height);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  fill(255);
  textSize(16);
  text(`HP: ${current_hp}/${max_hp}`, x + bar_width / 2, y_hp + bar_height / 2);
  
  // MP Bar
  stroke(0);
  fill(128);
  rect(x, y_mp, bar_width, bar_height);
  noStroke();
  fill(128, 0, 128);
  let mp_width = (current_mp / max_mp) * bar_width;
  rect(x, y_mp, mp_width, bar_height);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  fill(255);
  textSize(16);
  text(`MP: ${current_mp}/${max_mp}`, x + bar_width / 2, y_mp + bar_height / 2);
  
  // Stamina Bar
  stroke(0);
  fill(128);
  rect(x, y_stamina, bar_width, bar_height);
  noStroke();
  fill(0, 150, 0);
  let stamina_width = (current_stamina / max_stamina) * bar_width;
  rect(x, y_stamina, stamina_width, bar_height);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  fill(255);
  textSize(16);
  text(`STMN: ${current_stamina}/${max_stamina}`, x + bar_width / 2, y_stamina + bar_height / 2);
  
  // ATB Bar
  stroke(0);
  fill(128);
  rect(x, y_atb, bar_width, bar_height);
  noStroke();
  fill(0, 0, 255);
  let atb_width = (current_atb / max_atb) * bar_width;
  rect(x, y_atb, atb_width, bar_height);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  fill(255);
  textSize(16);
  text(`ATB: ${current_atb}/${max_atb}`, x + bar_width / 2, y_atb + bar_height / 2);
}

// **Resource UI**

function createResourceUI() {
  let rUI = resourceUIContainer;
  rUI.html("");

  // HP Row
  let hpRow = createDiv();
  hpRow.parent(rUI);
  hpRow.class("resource-row");
  let hpLabel = createSpan("HP:");
  hpLabel.parent(hpRow);
  maxHpInput = createInput(max_hp.toString(), "number");
  maxHpInput.parent(hpRow);
  maxHpInput.class("resource-input");
  setMaxHpButton = createButton("Set Max");
  setMaxHpButton.parent(hpRow);
  setMaxHpButton.class("resource-button");
  setMaxHpButton.mousePressed(setMaxHp);
  hpPlus = createButton("+10");
  hpPlus.parent(hpRow);
  hpPlus.class("resource-button small-button");
  hpPlus.mousePressed(() => { current_hp = min(current_hp + 10, max_hp); });
  hpMinus = createButton("-10");
  hpMinus.parent(hpRow);
  hpMinus.class("resource-button small-button");
  hpMinus.mousePressed(() => { current_hp = max(current_hp - 10, 0); });

  // MP Row
  let mpRow = createDiv();
  mpRow.parent(rUI);
  mpRow.class("resource-row");
  let mpLabel = createSpan("MP:");
  mpLabel.parent(mpRow);
  maxMpInput = createInput(max_mp.toString(), "number");
  maxMpInput.parent(mpRow);
  maxMpInput.class("resource-input");
  setMaxMpButton = createButton("Set Max");
  setMaxMpButton.parent(mpRow);
  setMaxMpButton.class("resource-button");
  setMaxMpButton.mousePressed(setMaxMp);
  mpPlus = createButton("+5");
  mpPlus.parent(mpRow);
  mpPlus.class("resource-button small-button");
  mpPlus.mousePressed(() => { current_mp = min(current_mp + 5, max_mp); });
  mpMinus = createButton("-5");
  mpMinus.parent(mpRow);
  mpMinus.class("resource-button small-button");
  mpMinus.mousePressed(() => { current_mp = max(current_mp - 5, 0); });

  // Stamina Row
  let staminaRow = createDiv();
  staminaRow.parent(rUI);
  staminaRow.class("resource-row");
  let staminaLabel = createSpan("STMN:");
  staminaLabel.parent(staminaRow);
  maxStaminaInput = createInput(max_stamina.toString(), "number");
  maxStaminaInput.parent(staminaRow);
  maxStaminaInput.class("resource-input");
  setMaxStaminaButton = createButton("Set Max");
  setMaxStaminaButton.parent(staminaRow);
  setMaxStaminaButton.class("resource-button");
  setMaxStaminaButton.mousePressed(setMaxStamina);
  staminaPlus = createButton("+25");
  staminaPlus.parent(staminaRow);
  staminaPlus.class("resource-button small-button");
  staminaPlus.mousePressed(() => { current_stamina = min(current_stamina + 25, max_stamina); });
  staminaMinus = createButton("-25");
  staminaMinus.parent(staminaRow);
  staminaMinus.class("resource-button small-button");
  staminaMinus.mousePressed(() => {
    current_stamina = max(current_stamina - 25, 0);
    if (staminaAtbLink) { current_atb = min(current_atb + 25, max_atb); }
  });

  // ATB Row
  let atbRow = createDiv();
  atbRow.parent(rUI);
  atbRow.class("resource-row");
  let atbLabel = createSpan("ATB:");
  atbLabel.parent(atbRow);
  maxAtbInput = createInput(max_atb.toString(), "number");
  maxAtbInput.parent(atbRow);
  maxAtbInput.class("resource-input");
  setMaxAtbButton = createButton("Set Max");
  setMaxAtbButton.parent(atbRow);
  setMaxAtbButton.class("resource-button");
  setMaxAtbButton.mousePressed(setMaxAtb);
  atbPlus = createButton("+25");
  atbPlus.parent(atbRow);
  atbPlus.class("resource-button small-button");
  atbPlus.mousePressed(() => { current_atb = min(current_atb + 25, max_atb); });
  atbMinus = createButton("-50");
  atbMinus.parent(atbRow);
  atbMinus.class("resource-button small-button");
  atbMinus.mousePressed(() => { current_atb = max(current_atb - 50, 0); });

  // Adjustment Row
  let adjustmentRow = createDiv();
  adjustmentRow.parent(rUI);
  adjustmentRow.class("resource-row");
  let adjustmentLabel = createSpan("Adjust: ");
  adjustmentLabel.parent(adjustmentRow);
  let adjustmentInput = createInput("", "number");
  adjustmentInput.parent(adjustmentRow);
  adjustmentInput.class("resource-input");
  adjustmentInput.style("width", "50px");
  let resourceSelect = createSelect();
  resourceSelect.parent(adjustmentRow);
  resourceSelect.option("HP");
  resourceSelect.option("MP");
  resourceSelect.option("STMN");
  resourceSelect.option("ATB");
  resourceSelect.style("margin-left", "5px");
  let addButton = createButton("+");
  addButton.parent(adjustmentRow);
  addButton.class("resource-button small-button");
  addButton.style("margin-left", "5px");
  addButton.mousePressed(() => adjustResource(resourceSelect.value(), parseInt(adjustmentInput.value()), true));
  let subtractButton = createButton("-");
  subtractButton.parent(adjustmentRow);
  subtractButton.class("resource-button small-button");
  subtractButton.style("margin-left", "5px");
  subtractButton.mousePressed(() => adjustResource(resourceSelect.value(), parseInt(adjustmentInput.value()), false));

  // Stamina-ATB Link Row
  let linkRow = createDiv();
  linkRow.parent(rUI);
  linkRow.class("resource-row");
  staminaAtbLinkButton = createButton(staminaAtbLink ? "Link: ON" : "Link: OFF");
  staminaAtbLinkButton.parent(linkRow);
  staminaAtbLinkButton.class("resource-button");
  staminaAtbLinkButton.mousePressed(toggleStaminaAtbLink);
  staminaAtbLinkButton.style("background-color", staminaAtbLink ? "green" : "red");
  let linkDesc = createSpan("When ON, using STMN adds to ATB");
  linkDesc.parent(linkRow);

  // Reset Row
  let resetRow = createDiv();
  resetRow.parent(rUI);
  resetRow.class("resource-row");
  resetButton = createButton("Reset All");
  resetButton.parent(resetRow);
  resetButton.class("resource-button");
  resetButton.mousePressed(resetResources);
}

// Helper function to adjust resources
function adjustResource(resource, value, isAddition) {
  if (isNaN(value)) {
    showConfirmationModal("Please enter a valid number.", () => {}, true);
    return;
  }
  let adjustment = isAddition ? value : -value;
  switch (resource) {
    case "HP":
      current_hp = constrain(current_hp + adjustment, 0, max_hp);
      break;
    case "MP":
      current_mp = constrain(current_mp + adjustment, 0, max_mp);
      break;
    case "STMN":
      current_stamina = constrain(current_stamina + adjustment, 0, max_stamina);
      if (!isAddition && staminaAtbLink) {
        current_atb = min(current_atb + value, max_atb);
      }
      break;
    case "ATB":
      current_atb = constrain(current_atb + adjustment, 0, max_atb);
      break;
  }
}

// Supporting functions
function setMaxHp() {
  let value = parseInt(maxHpInput.value());
  if (!isNaN(value) && value > 0) { max_hp = value; current_hp = min(current_hp, value); }
}

function setMaxMp() {
  let value = parseInt(maxMpInput.value());
  if (!isNaN(value) && value > 0) { max_mp = value; current_mp = min(current_mp, value); }
}

function setMaxStamina() {
  let value = parseInt(maxStaminaInput.value());
  if (!isNaN(value) && value > 0) { max_stamina = value; current_stamina = min(current_stamina, value); }
}

function setMaxAtb() {
  let value = parseInt(maxAtbInput.value());
  if (!isNaN(value) && value > 0) { max_atb = value; current_atb = min(current_atb, value); }
}

function resetResources() {
  current_hp = max_hp;
  current_mp = max_mp;
  current_stamina = max_stamina;
  current_atb = 0;
}

function toggleStaminaAtbLink() {
  staminaAtbLink = !staminaAtbLink;
  staminaAtbLinkButton.html(staminaAtbLink ? "Link: ON" : "Link: OFF");
  staminaAtbLinkButton.style("background-color", staminaAtbLink ? "green" : "red");
}

// **Stats UI**

function createStatsUI() {
  let statsContainer = select("#stats");
  statsContainer.html("");
  
  createElement("h2", "Stats").parent(statsContainer);
  
  let statsDesc = createP("Stats determine your character’s core abilities. Click a stat name for details.");
  statsDesc.parent(statsContainer);
  statsDesc.style("font-size", "12px");
  statsDesc.style("color", "#666");
  statsDesc.style("margin-top", "5px");
  statsDesc.style("margin-bottom", "10px");
  
  createStatInput("Level", "Level", level, statsContainer, (val) => { level = val; }, false);
  createStatInput("EXP", "EXP", exp, statsContainer, (val) => { exp = val; }, false);
  createStatInput("Movement", "Movement", movement, statsContainer, (val) => { movement = val; }, false);
  
  createStatInput("STR", "Strength", stat_str, statsContainer, (val) => { stat_str = val; }, true);
  createStatInput("VIT", "Vitality", stat_vit, statsContainer, (val) => { stat_vit = val; updateResourcesBasedOnStats(); }, true);
  createStatInput("DEX", "Dexterity", stat_dex, statsContainer, (val) => { stat_dex = val; }, true);
  createStatInput("MAG", "Magic", stat_mag, statsContainer, (val) => { stat_mag = val; }, true);
  createStatInput("WIL", "Willpower", stat_wil, statsContainer, (val) => { stat_wil = val; updateResourcesBasedOnStats(); }, true);
  createStatInput("SPR", "Spirit", stat_spr, statsContainer, (val) => { stat_spr = val; }, true);
  createStatInput("LCK", "Luck", stat_lck, statsContainer, (val) => { stat_lck = val; }, true, true);
  
  createAdditionalAttributesUI();
}

function updateResourcesBasedOnStats() {
  max_hp = 25 + (stat_vit - 1) * 5;
  current_hp = min(current_hp, max_hp);
  maxHpInput.value(max_hp);
  
  max_mp = 10 + (stat_wil - 1) * 5;
  current_mp = min(current_mp, max_mp);
  maxMpInput.value(max_mp);
}

function createStatInput(abbrev, name, initialValue, container, callback, linkable, greyOutAtMax = false) {
  let div = createDiv();
  div.parent(container);
  div.style("margin", "5px");
  
  let label = createSpan(name + " (" + abbrev + "): ");
  label.parent(div);
  label.style("cursor", "pointer");
  label.mouseClicked(() => {
    if (!descriptionModal) 
      showStatDescription(name + " (" + abbrev + ")", statDescriptions[abbrev] || "No description available.");
  });
  statLabelElements[abbrev] = label;
  
  let input = createInput(initialValue.toString(), "number");
  input.parent(div);
  input.style("width", "50px");
  input.changed(() => {
    let val = int(input.value());
    val = constrain(val, 1, 99);
    input.value(val);
    callback(val);
    if (greyOutAtMax && val === 99) {
      input.attribute("disabled", "true");
      input.style("background-color", "#ccc");
    } else if (greyOutAtMax) {
      input.removeAttribute("disabled");
      input.style("background-color", "white");
    }
  });
}

function createAdditionalAttributesUI() {
  let statsContainer = select("#stats");
  skillsContainer.parent(statsContainer);
  
  skillsContainer.style("padding", "5px");
  skillsContainer.style("margin-top", "20px");
  skillsContainer.style("width", "100%");
  skillsContainer.style("max-width", "600px");
  
  createElement("h3", "Skills").parent(skillsContainer);
  
  let skillsDesc = createP("Skills enhance specific abilities. Link a Skill to a Stat (e.g., Athletics to STR) to tie its effectiveness to that Stat’s value. Click a skill name for details. Only one Skill can link to a Stat at a time.");
  skillsDesc.parent(skillsContainer);
  skillsDesc.style("font-size", "12px");
  skillsDesc.style("color", "#666");
  skillsDesc.style("margin-top", "5px");
  skillsDesc.style("margin-bottom", "10px");
  
  additionalAttributes.forEach(attr => {
    let attrDiv = createDiv();
    attrDiv.parent(skillsContainer);
    attrDiv.class("resource-row");
    
    let btn = createButton(attr.name);
    btn.parent(attrDiv);
    btn.style("background-color", attr.color);
    btn.style("color", "#fff");
    btn.class("resource-button");
    btn.mousePressed(() => { showStatDescription(attr.name, attr.desc); });
    
    let statSelect = createSelect();
    statSelect.parent(attrDiv);
    statSelect.option("None");
    ["STR", "VIT", "DEX", "MAG", "WIL", "SPR", "LCK"].forEach(stat => {
      statSelect.option(stat);
    });
    statSelect.changed(() => linkStatToSkill(attr.name, statSelect.value()));
    attributeCheckboxes[attr.name] = statSelect;
  });
  
  updateSkillDropdowns();
}

function updateSkillDropdowns() {
  const allStats = ["STR", "VIT", "DEX", "MAG", "WIL", "SPR", "LCK"];
  let assignedStats = Object.values(attributeLinkMapping);
  
  additionalAttributes.forEach(attr => {
    let dropdown = attributeCheckboxes[attr.name];
    let currentStat = attributeLinkMapping[attr.name] || "None";
    
    dropdown.elt.innerHTML = "";
    let noneOption = document.createElement("option");
    noneOption.value = "None";
    noneOption.text = "None";
    dropdown.elt.add(noneOption);
    
    allStats.forEach(stat => {
      if (!assignedStats.includes(stat) || stat === currentStat) {
        let option = document.createElement("option");
        option.value = stat;
        option.text = stat;
        dropdown.elt.add(option);
      }
    });
    
    dropdown.elt.value = currentStat;
  });
}

function linkStatToSkill(skillName, selectedStat) {
  if (attributeLinkMapping[skillName]) {
    let oldStat = attributeLinkMapping[skillName];
    delete statLinkMapping[oldStat];
    statLabelElements[oldStat].style("color", "black");
  }

  if (selectedStat === "None") {
    delete attributeLinkMapping[skillName];
  } else {
    if (statLinkMapping[selectedStat]) {
      let oldSkill = statLinkMapping[selectedStat];
      delete attributeLinkMapping[oldSkill];
      attributeCheckboxes[oldSkill].value("None");
    }
    statLinkMapping[selectedStat] = skillName;
    attributeLinkMapping[skillName] = selectedStat;
    let skillColor = additionalAttributes.find(a => a.name === skillName).color;
    statLabelElements[selectedStat].style("color", skillColor);
  }
  
  updateSkillDropdowns();
}

// **Talents UI**

function createTalentsUI() {
  let talentsContainerDiv = select("#talents");
  talentsContainerDiv.html("");

  createElement("h2", "Talents").parent(talentsContainerDiv);

  let talentsDesc = createP("Use buttons to add, edit, or remove talents. Click a talent's name to view its details. Use arrows to reorder.");
  talentsDesc.parent(talentsContainerDiv);
  talentsDesc.style("font-size", "12px");
  talentsDesc.style("color", "#666");
  talentsDesc.style("margin-top", "5px");
  talentsDesc.style("margin-bottom", "10px");

  let customButton = createButton("Add Custom Talent");
  customButton.parent(talentsContainerDiv);
  customButton.style("margin", "5px");
  customButton.mousePressed(showAddCustomTalentModal);

  let addEditButton = createButton("Add / Edit Existing Talents");
  addEditButton.parent(talentsContainerDiv);
  addEditButton.style("margin", "5px");
  addEditButton.mousePressed(showAddEditTalentsModal);

  let removeButton = createButton("Remove Existing Talent");
  removeButton.parent(talentsContainerDiv);
  removeButton.style("margin", "5px");
  removeButton.mousePressed(showRemoveExistingTalentModal);

  let defaultButton = createButton("Default Talent List");
  defaultButton.parent(talentsContainerDiv);
  defaultButton.style("margin", "5px");
  defaultButton.mousePressed(() => showConfirmationModal("Reset to default talent list?", resetToDefaultTalents));

  let talentsTable = createElement("table");
  talentsTable.parent(talentsContainerDiv);
  talentsTable.id("talentsTable");
  talentsTable.style("width", "100%");
  talentsTable.style("border-collapse", "collapse");
  talentsTable.style("margin-top", "10px");

  let headerRow = createElement("tr");
  headerRow.parent(talentsTable);
  ["", "Name", "Level", "Category", "Actions"].forEach(header => {
    let th = createElement("th", header);
    th.parent(headerRow);
    th.style("border", "1px solid #ccc");
    th.style("padding", "5px");
    th.style("background", "#f2f2f2");
  });

  updateTalentsTable();
}

function manageLevelDependencies(levelCheckboxes, levelDescriptions, lvl) {
  if (lvl === "I") {
    if (!levelCheckboxes["I"].checked()) {
      levelCheckboxes["II"].checked(false);
      levelCheckboxes["III"].checked(false);
      levelDescriptions["II"].div.style("display", "none");
      levelDescriptions["III"].div.style("display", "none");
    }
  } else if (lvl === "II") {
    if (levelCheckboxes["II"].checked()) {
      levelCheckboxes["I"].checked(true);
      levelDescriptions["I"].div.style("display", "block");
    } else {
      levelCheckboxes["III"].checked(false);
      levelDescriptions["III"].div.style("display", "none");
    }
  } else if (lvl === "III") {
    if (levelCheckboxes["III"].checked()) {
      levelCheckboxes["I"].checked(true);
      levelCheckboxes["II"].checked(true);
      levelDescriptions["I"].div.style("display", "block");
      levelDescriptions["II"].div.style("display", "block");
    }
  }
  levelDescriptions[lvl].div.style("display", levelCheckboxes[lvl].checked() ? "block" : "none");
}

function showAddCustomTalentModal() {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv();
  modalDiv.style("position", "absolute");
  modalDiv.style("top", "50%");
  modalDiv.style("left", "50%");
  modalDiv.style("transform", "translate(-50%, -50%)");
  modalDiv.style("background", "#fff");
  modalDiv.style("padding", "20px");
  modalDiv.style("border", "2px solid #000");
  modalDiv.style("z-index", "1000");
  modalDiv.style("width", "300px");

  createElement("h3", "Add Custom Talent").parent(modalDiv);

  let nameLabel = createSpan("Talent Name:");
  nameLabel.parent(modalDiv);
  let nameInput = createInput("");
  nameInput.parent(modalDiv);
  nameInput.style("width", "100%");
  nameInput.style("margin-bottom", "10px");

  let levelLabel = createSpan("Levels (select highest desired):");
  levelLabel.parent(modalDiv);

  let levelsDiv = createDiv();
  levelsDiv.parent(modalDiv);
  levelsDiv.style("margin-bottom", "10px");

  let levelCheckboxes = {};
  let levelDescriptions = {};
  ["I", "II", "III"].forEach(lvl => {
    let chkDiv = createDiv();
    chkDiv.parent(levelsDiv);
    let chk = createCheckbox(`Level ${lvl}`, false);
    chk.parent(chkDiv);
    levelCheckboxes[lvl] = chk;

    let descDiv = createDiv();
    descDiv.parent(levelsDiv);
    descDiv.style("display", "none");
    let descLabel = createSpan(`Description ${lvl}:`);
    descLabel.parent(descDiv);
    let descInput = createElement("textarea");
    descInput.parent(descDiv);
    descInput.style("width", "100%");
    descInput.style("height", "60px");
    descInput.style("margin-bottom", "5px");
    levelDescriptions[lvl] = { div: descDiv, input: descInput };

    chk.changed(() => manageLevelDependencies(levelCheckboxes, levelDescriptions, lvl));
  });

  let categoryLabel = createSpan("Category:");
  categoryLabel.parent(modalDiv);
  let categorySelect = createSelect();
  categorySelect.parent(modalDiv);
  categorySelect.option("Physical Combat");
  categorySelect.option("Magical");
  categorySelect.option("Ranged Combat");
  categorySelect.option("Defensive");
  categorySelect.option("Utility & Tactical");
  categorySelect.style("width", "100%");
  categorySelect.style("margin-bottom", "10px");

  let saveBtn = createButton("Save");
  saveBtn.parent(modalDiv);
  saveBtn.style("margin", "5px");
  saveBtn.mousePressed(() => {
    let name = nameInput.value();
    let category = categorySelect.value();
    if (!name || !category) {
      alert("Please provide a talent name and category.");
      return;
    }

    let checkedLevels = Object.keys(levelCheckboxes).filter(lvl => levelCheckboxes[lvl].checked());
    if (checkedLevels.length === 0) {
      alert("Please select at least one level.");
      return;
    }

    let maxLevelIndex = checkedLevels.reduce((max, lvl) => 
      ["I", "II", "III"].indexOf(lvl) > ["I", "II", "III"].indexOf(max) ? lvl : max, "I");
    let requiredLevels = ["I", "II", "III"].slice(0, ["I", "II", "III"].indexOf(maxLevelIndex) + 1);
    for (let i = 0; i < requiredLevels.length; i++) {
      let lvl = requiredLevels[i];
      if (!checkedLevels.includes(lvl)) {
        alert(`Please ensure Level ${i + 1} is selected and described, as all prior levels are required.`);
        return;
      }
    }

    let newTalents = [];
    let levels = ["I", "II", "III"].slice(0, ["I", "II", "III"].indexOf(maxLevelIndex) + 1);
    for (let lvl of levels) {
      let desc = levelDescriptions[lvl].input.value();
      if (!desc) {
        alert(`Please provide a description for Level ${lvl}.`);
        return;
      }
      let fullName = `${name} - Level ${lvl}`;
      let talent = {
        name: fullName,
        level: lvl,
        category: category,
        description: desc,
        maxLevel: maxLevelIndex
      };
      existingTalents.push(talent);
      newTalents.push(talent);
    }

    if (newTalents.length > 0) {
      talents = talents.filter(t => !t.name.startsWith(name));
      let levelOneTalent = newTalents.find(t => t.level === "I");
      if (levelOneTalent) {
        talents.push(levelOneTalent);
      }
      updateTalentsTable();
      modalDiv.remove();
      modalDiv = null;
    }
  });

  let cancelBtn = createButton("Cancel");
  cancelBtn.parent(modalDiv);
  cancelBtn.style("margin", "5px");
  cancelBtn.mousePressed(() => { modalDiv.remove(); modalDiv = null; });
}

function showAddEditTalentsModal() {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv();
  modalDiv.style("position", "absolute");
  modalDiv.style("top", "50%");
  modalDiv.style("left", "50%");
  modalDiv.style("transform", "translate(-50%, -50%)");
  modalDiv.style("background", "#fff");
  modalDiv.style("padding", "20px");
  modalDiv.style("border", "2px solid #000");
  modalDiv.style("z-index", "1000");
  modalDiv.style("width", "300px");

  createElement("h3", "Add / Edit Existing Talents").parent(modalDiv);

  let talentNames = [...new Set(existingTalents.map(t => t.name.split(" - Level")[0]))];
  let talentSelect = createSelect().parent(modalDiv);
  talentNames.forEach(name => talentSelect.option(name));
  talentSelect.style("width", "100%");
  talentSelect.style("margin-bottom", "10px");

  let categoryLabel = createSpan("Category:").parent(modalDiv);
  let categorySelect = createSelect().parent(modalDiv);
  categorySelect.option("Physical Combat");
  categorySelect.option("Magical");
  categorySelect.option("Ranged Combat");
  categorySelect.option("Defensive");
  categorySelect.option("Utility & Tactical");
  categorySelect.style("width", "100%");
  categorySelect.style("margin-bottom", "10px");

  let levelsDiv = createDiv().parent(modalDiv);
  levelsDiv.style("margin-bottom", "10px");

  let levelCheckboxes = {};
  let levelDescriptions = {};

  function updateModal() {
    let selectedName = talentSelect.value();
    let talentLevels = existingTalents.filter(t => t.name.startsWith(selectedName));
    levelsDiv.html("");

    ["I", "II", "III"].forEach(lvl => {
      let chkDiv = createDiv().parent(levelsDiv);
      let isChecked = talentLevels.some(t => t.level === lvl);
      let chk = createCheckbox(`Level ${lvl}`, isChecked);
      chk.parent(chkDiv);
      levelCheckboxes[lvl] = chk;

      let descDiv = createDiv().parent(levelsDiv);
      descDiv.style("display", isChecked ? "block" : "none");
      let descLabel = createSpan(`Description ${lvl}:`).parent(descDiv);
      let descInput = createElement("textarea").parent(descDiv);
      descInput.style("width", "100%");
      descInput.style("height", "60px");
      descInput.style("margin-bottom", "5px");
      let existingDesc = talentLevels.find(t => t.level === lvl)?.description || "";
      descInput.value(existingDesc);
      levelDescriptions[lvl] = { div: descDiv, input: descInput };

      chk.changed(() => manageLevelDependencies(levelCheckboxes, levelDescriptions, lvl));
    });

    if (talentLevels.length > 0) categorySelect.value(talentLevels[0].category);
  }

  talentSelect.changed(updateModal);
  if (talentNames.length > 0) updateModal();

  let addToCharacterBtn = createButton("Add to Character").parent(modalDiv);
  addToCharacterBtn.style("margin", "5px");
  addToCharacterBtn.mousePressed(() => {
    let selectedName = talentSelect.value();
    if (!selectedName) {
      alert("Please select a talent name.");
      return;
    }

    let checkedLevels = Object.keys(levelCheckboxes).filter(lvl => levelCheckboxes[lvl].checked());
    if (checkedLevels.length > 0) {
      let maxLevelIndex = checkedLevels.reduce((max, lvl) => 
        ["I", "II", "III"].indexOf(lvl) > ["I", "II", "III"].indexOf(max) ? lvl : max, "I");
      let requiredLevels = ["I", "II", "III"].slice(0, ["I", "II", "III"].indexOf(maxLevelIndex) + 1);
      for (let i = 0; i < requiredLevels.length; i++) {
        let lvl = requiredLevels[i];
        if (!checkedLevels.includes(lvl)) {
          alert(`Please ensure Level ${i + 1} is selected and described, as all prior levels are required.`);
          return;
        }
      }

      talents = talents.filter(t => !t.name.startsWith(selectedName));
      let initialLevel = "I";
      let desc = levelDescriptions[initialLevel].input.value();
      if (!desc) {
        alert(`Please provide a description for Level ${initialLevel}.`);
        return;
      }
      let fullName = `${selectedName} - Level ${initialLevel}`;
      let talentToAdd = {
        name: fullName,
        level: initialLevel,
        category: categorySelect.value(),
        description: desc
      };
      talents.push(talentToAdd);
      updateTalentsTable();
    }
  });

  let saveBtn = createButton("Save").parent(modalDiv);
  saveBtn.style("margin", "5px");
  saveBtn.mousePressed(() => {
    let selectedName = talentSelect.value();
    let category = categorySelect.value();
    if (!selectedName) {
      alert("Please select a talent name.");
      return;
    }

    let checkedLevels = Object.keys(levelCheckboxes).filter(lvl => levelCheckboxes[lvl].checked());
    if (checkedLevels.length > 0) {
      let maxLevelIndex = checkedLevels.reduce((max, lvl) => 
        ["I", "II", "III"].indexOf(lvl) > ["I", "II", "III"].indexOf(max) ? lvl : max, "I");
      let requiredLevels = ["I", "II", "III"].slice(0, ["I", "II", "III"].indexOf(maxLevelIndex) + 1);
      for (let i = 0; i < requiredLevels.length; i++) {
        let lvl = requiredLevels[i];
        if (!checkedLevels.includes(lvl)) {
          alert(`Please ensure Level ${i + 1} is selected and described, as all prior levels are required.`);
          return;
        }
      }

      for (let lvl in levelCheckboxes) {
        let fullName = `${selectedName} - Level ${lvl}`;
        if (levelCheckboxes[lvl].checked()) {
          let desc = levelDescriptions[lvl].input.value();
          if (!desc) {
            alert(`Please provide a description for Level ${lvl}.`);
            return;
          }
          let existingIndex = existingTalents.findIndex(t => t.name === fullName);
          if (existingIndex >= 0) {
            existingTalents[existingIndex].description = desc;
            existingTalents[existingIndex].category = category;
          } else {
            existingTalents.push({
              name: fullName,
              level: lvl,
              category,
              description: desc,
              maxLevel: maxLevelIndex
            });
          }
        } else {
          let existingIndex = existingTalents.findIndex(t => t.name === fullName);
          if (existingIndex >= 0) {
            existingTalents.splice(existingIndex, 1);
          }
        }
      }
    }
    updateTalentsTable();
  });

  let closeBtn = createButton("Close").parent(modalDiv);
  closeBtn.style("margin", "5px");
  closeBtn.mousePressed(() => modalDiv.remove());
}

function showRemoveExistingTalentModal() {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv();
  modalDiv.style("position", "absolute");
  modalDiv.style("top", "50%");
  modalDiv.style("left", "50%");
  modalDiv.style("transform", "translate(-50%, -50%)");
  modalDiv.style("background", "#fff");
  modalDiv.style("padding", "20px");
  modalDiv.style("border", "2px solid #000");
  modalDiv.style("z-index", "1000");
  modalDiv.style("width", "300px");

  createElement("h3", "Remove Existing Talent").parent(modalDiv);

  let talentLabel = createSpan("Select Talent to Remove:").parent(modalDiv);
  let talentSelect = createSelect().parent(modalDiv);
  let uniqueNames = [...new Set(existingTalents.map(t => t.name.split(" - Level")[0]))];
  uniqueNames.forEach(name => talentSelect.option(name));
  talentSelect.style("width", "100%");
  talentSelect.style("margin-bottom", "10px");

  let removeBtn = createButton("Remove").parent(modalDiv);
  removeBtn.style("margin", "5px");
  removeBtn.mousePressed(() => {
    let selectedName = talentSelect.value();
    existingTalents = existingTalents.filter(t => !t.name.startsWith(selectedName + " - Level"));
    talents = talents.filter(t => !t.name.startsWith(selectedName + " - Level"));
    updateTalentsTable();
    modalDiv.remove();
    modalDiv = null;
  });

  let cancelBtn = createButton("Cancel").parent(modalDiv);
  cancelBtn.style("margin", "5px");
  cancelBtn.mousePressed(() => { modalDiv.remove(); modalDiv = null; });
}

function resetToDefaultTalents() {
  existingTalents = [...defaultTalents];
  talents = [];
  updateTalentsTable();
}

function moveTalentUp(index) {
  if (index > 0) {
    [talents[index - 1], talents[index]] = [talents[index], talents[index - 1]];
    updateTalentsTable();
  }
}

function moveTalentDown(index) {
  if (index < talents.length - 1) {
    [talents[index], talents[index + 1]] = [talents[index + 1], talents[index]];
    updateTalentsTable();
  }
}

function updateTalentsTable() {
  let talentsTable = select("#talentsTable");
  let rows = talentsTable.elt.getElementsByTagName("tr");
  while (rows.length > 1) rows[1].remove();

  talents.forEach((talent, index) => {
    let row = createElement("tr").parent(talentsTable);

    let arrowCell = createElement("td").parent(row);
    arrowCell.style("border", "1px solid #ccc");
    arrowCell.style("padding", "5px");
    let upArrow = createButton("↑").parent(arrowCell);
    upArrow.style("margin-right", "5px");
    upArrow.mousePressed(() => moveTalentUp(index));
    let downArrow = createButton("↓").parent(arrowCell);
    downArrow.mousePressed(() => moveTalentDown(index));

    let nameCell = createElement("td", talent.name.split(" - Level")[0]).parent(row);
    nameCell.style("border", "1px solid #ccc");
    nameCell.style("padding", "5px");
    nameCell.style("cursor", "pointer");
    nameCell.mousePressed(() => {
      showTalentDescription(talent.name, talent.description);
    });

    let levelCell = createElement("td").parent(row);
    levelCell.style("border", "1px solid #ccc");
    levelCell.style("padding", "5px");
    let levelSelect = createSelect().parent(levelCell);
    let baseName = talent.name.split(" - Level")[0];
    let talentLevels = existingTalents.filter(t => t.name.startsWith(baseName + " - Level"));
    let availableLevels = talentLevels.map(t => t.level);
    availableLevels.forEach(lvl => levelSelect.option(lvl));
    levelSelect.value(talent.level);
    levelSelect.changed(() => {
      let newLevel = levelSelect.value();
      let newTalentData = existingTalents.find(t => t.name === `${baseName} - Level ${newLevel}`);
      if (newTalentData) {
        talents[index] = { ...newTalentData };
        updateTalentsTable();
      }
    });

    let categoryCell = createElement("td", talent.category).parent(row);
    categoryCell.style("border", "1px solid #ccc");
    categoryCell.style("padding", "5px");

    let actionCell = createElement("td").parent(row);
    actionCell.style("border", "1px solid #ccc");
    actionCell.style("padding", "5px");
    let removeBtn = createButton("Remove").parent(actionCell);
    removeBtn.style("margin", "5px");
    removeBtn.mousePressed(() => {
      showConfirmationModal(`Remove ${talent.name}?`, () => {
        talents.splice(index, 1);
        updateTalentsTable();
      });
    });
  });
}

// **Traits UI**

function createTraitsUI() {
  let traitsContainerDiv = select("#traits");
  traitsContainerDiv.html("");

  createElement("h2", "Traits").parent(traitsContainerDiv);
  let traitsDesc = createP("Traits provide static positive and negative effects. A player can have a maximum of 3 traits by default. Adjust the max traits below if needed.");
  traitsDesc.parent(traitsContainerDiv);
  traitsDesc.style("font-size", "12px");
  traitsDesc.style("color", "#666");
  traitsDesc.style("margin-top", "5px");
  traitsDesc.style("margin-bottom", "10px");

  let maxTraitsDiv = createDiv().parent(traitsContainerDiv);
  maxTraitsDiv.class("resource-row");
  let maxTraitsLabel = createSpan("Max Traits: ").parent(maxTraitsDiv);
  let maxTraitsInput = createInput(maxTraits.toString(), "number").parent(maxTraitsDiv);
  maxTraitsInput.class("resource-input");
  maxTraitsInput.style("width", "50px");
  maxTraitsInput.changed(() => {
    let newMax = parseInt(maxTraitsInput.value());
    if (newMax < traits.length) {
      showConfirmationModal(`You currently have ${traits.length} traits. Reduce to ${newMax} by removing excess traits first.`, () => {}, true);
    } else {
      maxTraits = newMax;
    }
  });

  let customButton = createButton("Add Custom Trait").parent(traitsContainerDiv);
  customButton.style("margin", "5px");
  customButton.mousePressed(showAddCustomTraitModal);

  let addEditButton = createButton("Add / Edit Existing Traits").parent(traitsContainerDiv);
  addEditButton.style("margin", "5px");
  addEditButton.mousePressed(showAddEditTraitsModal);

  let removeButton = createButton("Remove Existing Trait").parent(traitsContainerDiv);
  removeButton.style("margin", "5px");
  removeButton.mousePressed(showRemoveExistingTraitModal);

  let defaultButton = createButton("Default Trait List").parent(traitsContainerDiv);
  defaultButton.style("margin", "5px");
  defaultButton.mousePressed(() => showConfirmationModal("Reset to default trait list?", resetToDefaultTraits));

  let traitsTable = createElement("table").parent(traitsContainerDiv);
  traitsTable.id("traitsTable");
  traitsTable.style("width", "100%");
  traitsTable.style("border-collapse", "collapse");
  traitsTable.style("margin-top", "10px");

  let headerRow = createElement("tr").parent(traitsTable);
  ["Name", "Category", "Actions"].forEach(header => {
    let th = createElement("th", header).parent(headerRow);
    th.style("border", "1px solid #ccc");
    th.style("padding", "5px");
    th.style("background", "#f2f2f2");
  });

  updateTraitsTable();
}

function showAddCustomTraitModal() {
  if (traits.length >= maxTraits) {
    showConfirmationModal(`You have reached the maximum number of traits (${maxTraits}). Remove a trait to add a new one.`, () => {}, true);
    return;
  }
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv();
  modalDiv.style("position", "absolute");
  modalDiv.style("top", "50%");
  modalDiv.style("left", "50%");
  modalDiv.style("transform", "translate(-50%, -50%)");
  modalDiv.style("background", "#fff");
  modalDiv.style("padding", "20px");
  modalDiv.style("border", "2px solid #000");
  modalDiv.style("z-index", "1000");
  modalDiv.style("width", "300px");

  createElement("h3", "Add Custom Trait").parent(modalDiv);

  let nameInput = createInput("").parent(modalDiv);
  nameInput.attribute("placeholder", "Trait Name");
  nameInput.style("width", "100%");
  nameInput.style("margin-bottom", "10px");

  let categorySelect = createSelect().parent(modalDiv);
  categorySelect.option("Physical");
  categorySelect.option("Combat");
  categorySelect.option("Magical");
  categorySelect.option("Utility");
  categorySelect.style("width", "100%");
  categorySelect.style("margin-bottom", "10px");

  let positiveLabel = createSpan("Positive Effect:").parent(modalDiv);
  positiveLabel.style("display", "block");
  let positiveInput = createElement("textarea").parent(modalDiv);
  positiveInput.style("width", "100%");
  positiveInput.style("height", "60px");
  positiveInput.style("margin-bottom", "10px");

  let negativeLabel = createSpan("Negative Effect:").parent(modalDiv);
  negativeLabel.style("display", "block");
  let negativeInput = createElement("textarea").parent(modalDiv);
  negativeInput.style("width", "100%");
  negativeInput.style("height", "60px");
  negativeInput.style("margin-bottom", "10px");

  let saveBtn = createButton("Save").parent(modalDiv);
  saveBtn.style("margin", "5px");
  saveBtn.mousePressed(() => {
    let name = nameInput.value();
    let category = categorySelect.value();
    let positive = positiveInput.value();
    let negative = negativeInput.value();
    if (!name || !category || !positive || !negative) return;

    if (traits.some(t => t.name === name)) {
      alert("This trait is already added!");
      return;
    }

    let newTrait = { name, category, positive, negative };
    existingTraits.push(newTrait);
    traits.push(newTrait);
    updateTraitsTable();
    modalDiv.remove();
  });

  let cancelBtn = createButton("Cancel").parent(modalDiv);
  cancelBtn.style("margin", "5px");
  cancelBtn.mousePressed(() => modalDiv.remove());
}

function showAddEditTraitsModal() {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv();
  modalDiv.style("position", "absolute");
  modalDiv.style("top", "50%");
  modalDiv.style("left", "50%");
  modalDiv.style("transform", "translate(-50%, -50%)");
  modalDiv.style("background", "#fff");
  modalDiv.style("padding", "20px");
  modalDiv.style("border", "2px solid #000");
  modalDiv.style("z-index", "1000");
  modalDiv.style("width", "300px");

  createElement("h3", "Add / Edit Existing Traits").parent(modalDiv);

  let traitSelect = createSelect().parent(modalDiv);
  existingTraits.forEach((trait, index) => {
    traitSelect.option(trait.name, index);
  });
  traitSelect.style("width", "100%");
  traitSelect.style("margin-bottom", "10px");

  let nameLabel = createSpan("Trait Name:").parent(modalDiv);
  let nameInput = createInput("").parent(modalDiv);
  nameInput.style("width", "100%");
  nameInput.style("margin-bottom", "10px");

  let categoryLabel = createSpan("Category:").parent(modalDiv);
  let categorySelect = createSelect().parent(modalDiv);
  categorySelect.option("Physical");
  categorySelect.option("Combat");
  categorySelect.option("Magical");
  categorySelect.option("Utility");
  categorySelect.style("width", "100%");
  categorySelect.style("margin-bottom", "10px");

  let positiveLabel = createSpan("Positive Effect:").parent(modalDiv);
  positiveLabel.style("display", "block");
  let positiveInput = createElement("textarea").parent(modalDiv);
  positiveInput.style("width", "100%");
  positiveInput.style("height", "60px");
  positiveInput.style("margin-bottom", "10px");

  let negativeLabel = createSpan("Negative Effect:").parent(modalDiv);
  negativeLabel.style("display", "block");
  let negativeInput = createElement("textarea").parent(modalDiv);
  negativeInput.style("width", "100%");
  negativeInput.style("height", "60px");
  negativeInput.style("margin-bottom", "10px");

  let addToCharacterBtn = createButton("Add to Character").parent(modalDiv);
  addToCharacterBtn.style("margin", "5px");
  let saveBtn = createButton("Save").parent(modalDiv);
  saveBtn.style("margin", "5px");
  let closeBtn = createButton("Close").parent(modalDiv);
  closeBtn.style("margin", "5px");

  function loadTraitData() {
    let index = parseInt(traitSelect.value());
    if (index >= 0) {
      let trait = existingTraits[index];
      nameInput.value(trait.name);
      categorySelect.value(trait.category);
      positiveInput.value(trait.positive);
      negativeInput.value(trait.negative);
    }
  }

  traitSelect.changed(loadTraitData);
  if (existingTraits.length > 0) loadTraitData();

  addToCharacterBtn.mousePressed(() => {
    if (traits.length >= maxTraits) {
      alert(`You have reached the maximum number of traits (${maxTraits}). Remove a trait to add a new one.`);
      return;
    }
    let index = parseInt(traitSelect.value());
    if (index >= 0) {
      let traitToAdd = { ...existingTraits[index] };
      if (traits.some(t => t.name === traitToAdd.name)) {
        alert("This trait is already added!");
        return;
      }
      traits.push(traitToAdd);
      updateTraitsTable();
    }
  });

  saveBtn.mousePressed(() => {
    let index = parseInt(traitSelect.value());
    if (index >= 0) {
      let oldName = existingTraits[index].name;
      let newName = nameInput.value();
      let newCategory = categorySelect.value();
      let newPositive = positiveInput.value();
      let newNegative = negativeInput.value();
      if (!newName || !newPositive || !newNegative) {
        alert("Please provide a name, positive effect, and negative effect.");
        return;
      }

      existingTraits[index] = { name: newName, category: newCategory, positive: newPositive, negative: newNegative };
      let traitInTableIndex = traits.findIndex(t => t.name === oldName);
      if (traitInTableIndex >= 0) {
        traits[traitInTableIndex] = { ...existingTraits[index] };
      }

      updateTraitsTable();
      traitSelect.html("");
      existingTraits.forEach((trait, idx) => {
        traitSelect.option(trait.name, idx);
      });
      traitSelect.value(index);
    }
  });

  closeBtn.mousePressed(() => modalDiv.remove());
}

function showRemoveExistingTraitModal() {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv();
  modalDiv.style("position", "absolute");
  modalDiv.style("top", "50%");
  modalDiv.style("left", "50%");
  modalDiv.style("transform", "translate(-50%, -50%)");
  modalDiv.style("background", "#fff");
  modalDiv.style("padding", "20px");
  modalDiv.style("border", "2px solid #000");
  modalDiv.style("z-index", "1000");
  modalDiv.style("width", "300px");

  createElement("h3", "Remove Existing Trait").parent(modalDiv);

  let traitLabel = createSpan("Select Trait to Remove:").parent(modalDiv);
  let traitSelect = createSelect().parent(modalDiv);
  let uniqueNames = [...new Set(existingTraits.map(t => t.name))];
  uniqueNames.forEach(name => traitSelect.option(name));
  traitSelect.style("width", "100%");
  traitSelect.style("margin-bottom", "10px");

  let removeBtn = createButton("Remove").parent(modalDiv);
  removeBtn.style("margin", "5px");
  removeBtn.mousePressed(() => {
    let selectedName = traitSelect.value();
    showConfirmationModal(`Remove ${selectedName}?`, () => {
      existingTraits = existingTraits.filter(t => t.name !== selectedName);
      traits = traits.filter(t => t.name !== selectedName);
      updateTraitsTable();
      modalDiv.remove();
      modalDiv = null;
    });
  });

  let cancelBtn = createButton("Cancel").parent(modalDiv);
  cancelBtn.style("margin", "5px");
  cancelBtn.mousePressed(() => { modalDiv.remove(); modalDiv = null; });
}

function resetToDefaultTraits() {
  existingTraits = [...defaultTraits];
  traits = [];
  updateTraitsTable();
}

function updateTraitsTable() {
  let traitsTable = select("#traitsTable");
  let rows = traitsTable.elt.getElementsByTagName("tr");
  while (rows.length > 1) rows[1].remove();

  traits.forEach((trait, index) => {
    let row = createElement("tr").parent(traitsTable);

    let nameCell = createElement("td", trait.name).parent(row);
    nameCell.style("border", "1px solid #ccc");
    nameCell.style("padding", "5px");
    nameCell.style("cursor", "pointer");
    nameCell.mousePressed(() => showTraitDescription(trait.name, trait.positive, trait.negative));

    let categoryCell = createElement("td", trait.category).parent(row);
    categoryCell.style("border", "1px solid #ccc");
    categoryCell.style("padding", "5px");

    let actionCell = createElement("td").parent(row);
    actionCell.style("border", "1px solid #ccc");
    actionCell.style("padding", "5px");
    let removeBtn = createButton("Remove").parent(actionCell);
    removeBtn.style("margin", "5px");
    removeBtn.mousePressed(() => {
      showConfirmationModal(`Remove ${trait.name}?`, () => {
        traits.splice(index, 1);
        updateTraitsTable();
      });
    });
  });
}
