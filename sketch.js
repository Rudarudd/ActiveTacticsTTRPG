// Global resource variables – starting with 25 HP and 10 MP
let max_hp = 25,
  current_hp = 25;
let max_mp = 10,
  current_mp = 10;
let max_stamina = 100,
  current_stamina = 100;
let max_atb = 100,
  current_atb = 0;

// Global stat variables – all start at 1
let stat_str = 1,
  stat_vit = 1,
  stat_dex = 1,
  stat_mag = 1,
  stat_wil = 1,
  stat_spr = 1,
  stat_lck = 1;
let level = 1,
  exp = 1,
  movement = 65; // Base movement starts at 65 ft
let statBonusElements = {};

// Global inventory array
let inventory = [];

// Equipment-related globals
let equippedItems = {
  "On-Hand": null,
  "Off-Hand": null,
  Chest: null,
  Helm: null,
  Gloves: null,
  Greaves: null,
  "Accessory 1": null,
  "Accessory 2": null,
};

let availableEquipment = {
  "On-Hand": [],
  "Off-Hand": [],
  Chest: [],
  Helm: [],
  Gloves: [],
  Greaves: [],
  "Accessory 1": [],
  "Accessory 2": [],
};

let slotSelects = {};

// UI elements for resource tracker (created in createResourceUI)
let maxHpInput, setMaxHpButton, maxMpInput, setMaxMpButton;
let maxStaminaInput, setMaxStaminaButton, maxAtbInput, setMaxAtbButton;
let hpPlus,
  hpMinus,
  mpPlus,
  mpMinus,
  staminaPlus,
  staminaMinus,
  atbPlus,
  atbMinus;
let resetButton;
let staminaAtbLink = false,
  staminaAtbLinkButton;
let cnv;
let modalDiv = null; // For modals

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

// For traits
let traits = [];
let maxTraits = 3;

// Stat descriptions
const statDescriptions = {
  STR: "Affects melee and ranged physical rolls (1d12 + STR vs DEF).",
  VIT: "Increases HP (+5 HP per point).",
  DEX: "Determines dodge rolls (1d12 + DEX to evade).",
  MAG: "Affects magical attack rolls (1d12 + MAG vs MDEF).",
  WIL: "Increases MP (+5 MP per point).",
  SPR: "Determines magic evasion (1d12 + SPR to evade magic attacks).",
  LCK: "Modifies loot rolls, critical hits, and grants rerolls (1 per 5 LCK).",
  Level: "Character Level.",
  EXP: "Experience Points (EXP) accumulated; formula for next level is TBD.",
  Movement: "Determines movement range per turn.",
};

// Additional attributes
const additionalAttributes = [
  {
    name: "Athletics",
    desc:
      "Your ability to exert physical strength and endurance to overcome obstacles. Used for climbing, swimming, jumping, grappling, and feats of raw power.",
    color: "#C0392B",
  },
  {
    name: "Endurance",
    desc:
      "Your capacity to withstand physical strain, pain, and adverse conditions. Used for resisting poisons, disease, exhaustion, and enduring extreme conditions.",
    color: "#27AE60",
  },
  {
    name: "Agility",
    desc:
      "Your speed, reflexes, and balance in movement and precision. Used for dodging, acrobatics, stealth, and precise motor control.",
    color: "#2980B9",
  },
  {
    name: "Willpower",
    desc:
      "Your mental resilience and determination to resist external influences. Used for resisting mind control, fear effects, psychic attacks, and maintaining focus under pressure.",
    color: "#FF69B4",
  },
  {
    name: "Awareness",
    desc:
      "Your ability to observe, sense, and interpret your surroundings. Used for noticing hidden details, tracking, detecting lies, and reacting to environmental threats.",
    color: "#F39C12",
  },
  {
    name: "Influence",
    desc:
      "Your ability to manipulate, persuade, or command others through words and body language. Friendly Influence is used for persuasion, bartering, and diplomacy; Hostile Influence is used for intimidation and coercion.",
    color: "#8E44AD",
  },
  {
    name: "Ingenuity",
    desc:
      "Your problem-solving ability and technical expertise in mechanical, electronic, and creative fields. Used for hacking, crafting, repairing technology, and improvising solutions.",
    color: "#2C3E50",
  },
];

// Default talents (shortened for brevity; full list can be added back)
const defaultTalents = [
  // Physical Combat
  {
    name: "Relentless Fighter - Level I",
    level: "I",
    category: "Physical Combat",
    description: "Recover 5 Stamina per turn.",
    maxLevel: "II",
  },
  {
    name: "Relentless Fighter - Level II",
    level: "II",
    category: "Physical Combat",
    description: "Recover 10 Stamina per turn.",
    maxLevel: "II",
  },
  {
    name: "Heavy Hitter - Level I",
    level: "I",
    category: "Physical Combat",
    description: "Gain +2 melee damage on critical hits.",
    maxLevel: "III",
  },
  {
    name: "Heavy Hitter - Level II",
    level: "II",
    category: "Physical Combat",
    description: "Gain +4 melee damage on critical hits.",
    maxLevel: "III",
  },
  {
    name: "Heavy Hitter - Level III",
    level: "III",
    category: "Physical Combat",
    description: "Gain +6 melee damage on critical hits.",
    maxLevel: "III",
  },
  {
    name: "Quick Reflexes - Level I",
    level: "I",
    category: "Physical Combat",
    description: "Dodging costs 20 Stamina instead of 25.",
    maxLevel: "III",
  },
  {
    name: "Quick Reflexes - Level II",
    level: "II",
    category: "Physical Combat",
    description: "Dodging costs 15 Stamina instead of 25.",
    maxLevel: "III",
  },
  {
    name: "Quick Reflexes - Level III",
    level: "III",
    category: "Physical Combat",
    description: "Dodging costs 10 Stamina instead of 25.",
    maxLevel: "III",
  },
  {
    name: "Enduring Block - Level I",
    level: "I",
    category: "Physical Combat",
    description: "If you fully block an attack, you recover 10 Stamina.",
    maxLevel: "III",
  },
  {
    name: "Enduring Block - Level II",
    level: "II",
    category: "Physical Combat",
    description: "If you fully block an attack, you recover 15 Stamina.",
    maxLevel: "III",
  },
  {
    name: "Enduring Block - Level III",
    level: "III",
    category: "Physical Combat",
    description: "If you fully block an attack, you recover 20 Stamina.",
    maxLevel: "III",
  },
  {
    name: "Battlefield Awareness - Level I",
    level: "I",
    category: "Physical Combat",
    description: "When an enemy misses you, gain 5 ATB.",
    maxLevel: "III",
  },
  {
    name: "Battlefield Awareness - Level II",
    level: "II",
    category: "Physical Combat",
    description: "When an enemy misses you, gain 10 ATB.",
    maxLevel: "III",
  },
  {
    name: "Battlefield Awareness - Level III",
    level: "III",
    category: "Physical Combat",
    description: "When an enemy misses you, gain 15 ATB.",
    maxLevel: "III",
  },
  {
    name: "Tactical Step - Level I",
    level: "I",
    category: "Physical Combat",
    description: "Moving an extra 10 ft per turn is free.",
    maxLevel: "II",
  },
  {
    name: "Tactical Step - Level II",
    level: "II",
    category: "Physical Combat",
    description: "Moving an extra 20 ft per turn is free.",
    maxLevel: "II",
  },
  {
    name: "Momentum Strike - Level I",
    level: "I",
    category: "Physical Combat",
    description:
      "If you move at least 15 ft before attacking, your attack deals +2 damage.",
    maxLevel: "I",
  },
  {
    name: "Shatter Guard - Level I",
    level: "I",
    category: "Physical Combat",
    description: "If an enemy is blocking, your attack ignores 2 DEF.",
    maxLevel: "I",
  },
  {
    name: "Grappling Mastery - Level I",
    level: "I",
    category: "Physical Combat",
    description: "Gain Advantage on all Grapple attempts.",
    maxLevel: "I",
  },

  // Magical
  {
    name: "Efficient Spellcasting - Level I",
    level: "I",
    category: "Magical",
    description: "Materia spells cost -5 MP (minimum 1MP cost per spell).",
    maxLevel: "III",
  },
  {
    name: "Efficient Spellcasting - Level II",
    level: "II",
    category: "Magical",
    description: "Materia spells cost -10 MP (minimum 1MP cost per spell).",
    maxLevel: "III",
  },
  {
    name: "Efficient Spellcasting - Level III",
    level: "III",
    category: "Magical",
    description: "Materia spells cost -15 MP (minimum 1MP cost per spell).",
    maxLevel: "III",
  },
  {
    name: "Arcane Conductor - Level I",
    level: "I",
    category: "Magical",
    description: "If you evade a magic attack, regain 5 MP.",
    maxLevel: "II",
  },
  {
    name: "Arcane Conductor - Level II",
    level: "II",
    category: "Magical",
    description: "If you evade a magic attack, regain 10 MP.",
    maxLevel: "II",
  },
  {
    name: "Elemental Mastery - Level I",
    level: "I",
    category: "Magical",
    description: "Choose one element; spells of that type deal +2 damage.",
    maxLevel: "II",
  },
  {
    name: "Elemental Mastery - Level II",
    level: "II",
    category: "Magical",
    description: "Choose one element; spells of that type deal +4 damage.",
    maxLevel: "II",
  },
  {
    name: "Mana Reservoir - Level I",
    level: "I",
    category: "Magical",
    description: "Max MP is increased by 5.",
    maxLevel: "II",
  },
  {
    name: "Mana Reservoir - Level II",
    level: "II",
    category: "Magical",
    description: "Max MP is increased by 10.",
    maxLevel: "II",
  },
  {
    name: "Overcharged Spellcasting - Level I",
    level: "I",
    category: "Magical",
    description:
      "If you spend double MP on a spell, its damage increases by +50%.",
    maxLevel: "I",
  },
  {
    name: "Dual Weave - Level I",
    level: "I",
    category: "Magical",
    description:
      "If you cast a spell, you may spend 25 ATB to cast a second spell as a bonus effect (must be a different spell).",
    maxLevel: "II",
  },
  {
    name: "Dual Weave - Level II",
    level: "II",
    category: "Magical",
    description:
      "If you cast a spell, you may spend 50 ATB to cast a second spell as a bonus effect (must be a different spell).",
    maxLevel: "II",
  },
  {
    name: "Weave Momentum - Level I",
    level: "I",
    category: "Magical",
    description: "If you cast a spell, your next attack deals +2 damage.",
    maxLevel: "I",
  },

  // Ranged Combat
  {
    name: "Sharpshooter - Level I",
    level: "I",
    category: "Ranged Combat",
    description: "Gain +1 damage on ranged attacks.",
    maxLevel: "III",
  },
  {
    name: "Sharpshooter - Level II",
    level: "II",
    category: "Ranged Combat",
    description: "Gain +2 damage on ranged attacks.",
    maxLevel: "III",
  },
  {
    name: "Sharpshooter - Level III",
    level: "III",
    category: "Ranged Combat",
    description: "Gain +3 damage on ranged attacks.",
    maxLevel: "III",
  },
  {
    name: "Cover Fire - Level I",
    level: "I",
    category: "Ranged Combat",
    description:
      "If an ally within 30 ft is attacked, you may spend 25 ATB to make a reaction shot at the attacker.",
    maxLevel: "I",
  },
  {
    name: "Eagle Eye - Level I",
    level: "I",
    category: "Ranged Combat",
    description: "Ignore half cover when making ranged attacks.",
    maxLevel: "I",
  },
  {
    name: "Deadly Precision - Level I",
    level: "I",
    category: "Ranged Combat",
    description:
      "When making a ranged attack, you may spend 10 ATB to increase your crit range by 1.",
    maxLevel: "III",
  },
  {
    name: "Deadly Precision - Level II",
    level: "II",
    category: "Ranged Combat",
    description:
      "When making a ranged attack, you may spend 20 ATB to increase your crit range by 2.",
    maxLevel: "III",
  },
  {
    name: "Deadly Precision - Level III",
    level: "III",
    category: "Ranged Combat",
    description:
      "When making a ranged attack, you may spend 30 ATB to increase your crit range by 3.",
    maxLevel: "III",
  },

  // Defensive
  {
    name: "Guardian’s Oath - Level I",
    level: "I",
    category: "Defensive",
    description: "When you block for an ally, gain +2 to your Block Roll.",
    maxLevel: "III",
  },
  {
    name: "Guardian’s Oath - Level II",
    level: "II",
    category: "Defensive",
    description: "When you block for an ally, gain +4 to your Block Roll.",
    maxLevel: "III",
  },
  {
    name: "Guardian’s Oath - Level III",
    level: "III",
    category: "Defensive",
    description: "When you block for an ally, gain +6 to your Block Roll.",
    maxLevel: "III",
  },
  {
    name: "Armor Mastery - Level I",
    level: "I",
    category: "Defensive",
    description: "Wearing Heavy Armor increases movement speed by 5 ft.",
    maxLevel: "III",
  },
  {
    name: "Armor Mastery - Level II",
    level: "II",
    category: "Defensive",
    description: "Wearing Heavy Armor increases movement speed by 10 ft.",
    maxLevel: "III",
  },
  {
    name: "Armor Mastery - Level III",
    level: "III",
    category: "Defensive",
    description: "Wearing Heavy Armor increases movement speed by 15 ft.",
    maxLevel: "III",
  },
  {
    name: "Defensive Momentum - Level I",
    level: "I",
    category: "Defensive",
    description:
      "After blocking an attack, your next dodge roll gains Advantage.",
    maxLevel: "I",
  },
  {
    name: "Reactive Parry - Level I",
    level: "I",
    category: "Defensive",
    description:
      "If an enemy attacks you in melee, you may spend 25 ATB to counterattack.",
    maxLevel: "I",
  },
  {
    name: "Iron Will - Level I",
    level: "I",
    category: "Defensive",
    description: "Start encounters with an additional 25 stamina.",
    maxLevel: "I",
  },
  {
    name: "Stalwart Wall - Level I",
    level: "I",
    category: "Defensive",
    description: "If you don’t move on your turn, you gain +2 DEF for 1 round.",
    maxLevel: "I",
  },

  // Utility & Tactical
  {
    name: "Tactician’s Instinct - Level I",
    level: "I",
    category: "Utility & Tactical",
    description:
      "Gain Advantage on Awareness rolls, and once per combat, you may reroll Initiative.",
    maxLevel: "II",
  },
  {
    name: "Tactician’s Instinct - Level II",
    level: "II",
    category: "Utility & Tactical",
    description:
      "Gain Advantage on Awareness rolls, and once per combat, you may reroll Initiative.",
    maxLevel: "II",
  },
  {
    name: "Quick Hands - Level I",
    level: "I",
    category: "Utility & Tactical",
    description: "Using items costs half Stamina.",
    maxLevel: "I",
  },
  {
    name: "Battle Medic - Level I",
    level: "I",
    category: "Utility & Tactical",
    description: "Healing grants an additional 2d4 HP.",
    maxLevel: "III",
  },
  {
    name: "Battle Medic - Level II",
    level: "II",
    category: "Utility & Tactical",
    description: "Healing grants an additional 2d6 HP.",
    maxLevel: "III",
  },
  {
    name: "Battle Medic - Level III",
    level: "III",
    category: "Utility & Tactical",
    description: "Healing grants an additional 2d8 HP.",
    maxLevel: "III",
  },
  {
    name: "Adrenaline Boost - Level I",
    level: "I",
    category: "Utility & Tactical",
    description: "When below half HP, immediately gain 25 Stamina.",
    maxLevel: "I",
  },
  {
    name: "Improvised Combatant - Level I",
    level: "I",
    category: "Utility & Tactical",
    description:
      "Gain Advantage when using the environment for attacks (throwing objects, knocking down obstacles).",
    maxLevel: "I",
  },
  {
    name: "Rushdown - Level I",
    level: "I",
    category: "Utility & Tactical",
    description: "Gain +5 ATB if you move at least 20 ft before attacking.",
    maxLevel: "II",
  },
  {
    name: "Rushdown - Level II",
    level: "II",
    category: "Utility & Tactical",
    description: "Gain +10 ATB if you move at least 20 ft before attacking.",
    maxLevel: "II",
  },
  {
    name: "Support Specialist - Level I",
    level: "I",
    category: "Utility & Tactical",
    description: "When assisting an ally, they gain +5 ATB.",
    maxLevel: "II",
  },
  {
    name: "Support Specialist - Level II",
    level: "II",
    category: "Utility & Tactical",
    description: "When assisting an ally, they gain +10 ATB.",
    maxLevel: "II",
  },
  {
    name: "Unbreakable Focus - Level I",
    level: "I",
    category: "Utility & Tactical",
    description:
      "Once per encounter, you may reroll a status effect affecting you.",
    maxLevel: "I",
  },
];

// Working copy of talents
let existingTalents = [...defaultTalents];

// Default traits (shortened for brevity; full list can be added back)
const defaultTraits = [
  {
    name: "Grafted Weapon",
    category: "Combat",
    positive: "Cannot be unwillingly disarmed.",
    negative: "Disadvantage on Agility checks.",
  },
  {
    name: "EX-SOLDIER",
    category: "Combat",
    positive: "Advantage on Athletics checks.",
    negative: "Disadvantage on Ingenuity checks.",
  },
  {
    name: "Ancient Echoes",
    category: "Magical",
    positive:
      "You can sense the presence of raw Materia and Lifestream energy within 60 feet, even through barriers (you do not sense refined Materia equipped to others).",
    negative: "Disadvantage on Awareness checks.",
  },
  {
    name: "Imposing Posture",
    category: "Utility",
    positive: "Advantage on all hostile Influence checks.",
    negative: "Disadvantage on all friendly Influence checks.",
  },
  {
    name: "Cybernetic Enhancements",
    category: "Utility",
    positive: "Start each battle with +25 ATB.",
    negative: "Start each battle with -25 Movement.",
  },
  {
    name: "Fractured Mind",
    category: "Utility",
    positive: "Advantage on Awareness checks.",
    negative: "Disadvantage on Willpower checks.",
  },
  {
    name: "Silver Tongue",
    category: "Utility",
    positive: "Advantage on Influence checks.",
    negative: "Disadvantage on Athletics checks.",
  },
  {
    name: "Wandering Spirit",
    category: "Physical",
    positive: "Advantage on Endurance checks.",
    negative: "Resting requires double the time for full benefits.",
  },
  {
    name: "Jenova’s Taint",
    category: "Combat",
    positive: "Once per turn, you can reroll an attack roll.",
    negative:
      "When using the reroll, make a Willpower check (DC 10); if failed, waste stamina without attacking.",
  },
  {
    name: "Glowing Eyes",
    category: "Physical",
    positive:
      "Your vision is enhanced beyond normal limits. You can see clearly in dim light and ignore visual obscurities such as smoke or fog.",
    negative: "Disadvantage on Stealth checks in darkness or shadowed areas.",
  },
  {
    name: "Reactive Reflexes",
    category: "Combat",
    positive: "Advantage on Dodge Rolls.",
    negative:
      "After Dodging, disadvantage on your next Attack (physical or magical).",
  },
  {
    name: "Weakened Flesh",
    category: "Magical",
    positive: "+10 Maximum MP.",
    negative: "-10 Maximum HP.",
  },
];

// Working copy of traits
let existingTraits = [...defaultTraits];

// ### Utility Functions ###

function showConfirmationModal(message, onConfirm, isError = false) {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv()
    .style("position", "absolute")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)")
    .style("background", "#fff")
    .style("padding", "20px")
    .style("border", "2px solid #000")
    .style("z-index", "1000")
    .style("width", "300px");
  createElement("p", message).parent(modalDiv);
  if (isError) {
    createButton("Close")
      .parent(modalDiv)
      .style("margin", "5px")
      .mousePressed(() => modalDiv.remove());
  } else {
    createButton("Confirm")
      .parent(modalDiv)
      .style("margin", "5px")
      .mousePressed(() => {
        onConfirm();
        modalDiv.remove();
      });
    createButton("Cancel")
      .parent(modalDiv)
      .style("margin", "5px")
      .mousePressed(() => modalDiv.remove());
  }
}
function showEquipmentDescription(slot, item) {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv()
    .style("position", "absolute")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)")
    .style("background", "#fff")
    .style("padding", "20px")
    .style("border", "2px solid #000")
    .style("z-index", "1000")
    .style("max-width", "400px")
    .style("word-wrap", "break-word");

  createElement("h3", `${slot}: ${item ? item.name : "None"}`).parent(modalDiv);
  if (item) {
    let details = item.description
      ? `${item.description}<br>`
      : "No description provided.<br>";
    if (
      item.statRequirements &&
      Object.keys(item.statRequirements).length > 0
    ) {
      let reqs = Object.entries(item.statRequirements)
        .map(([stat, value]) => `${value} ${stat}`)
        .join(" & ");
      details += `Requirements: ${reqs}<br>`;
    }
    if (item.damageDice) {
      let modifierText =
        item.modifier && item.modifier !== 0
          ? item.modifier > 0
            ? `+${item.modifier}`
            : item.modifier
          : "";
      details += `Damage: ${item.damageDice}${modifierText}<br>`;
    } else if (item.defense) {
      details += `Defense: ${item.defense}${
        item.modifier && item.modifier !== 0
          ? item.modifier > 0
            ? ` +${item.modifier}`
            : ` ${item.modifier}`
          : ""
      }<br>`;
    } else if (item.modifier && item.modifier !== 0) {
      details += `Modifier: ${
        item.modifier > 0 ? `+${item.modifier}` : item.modifier
      }<br>`;
    }
    createP(details).parent(modalDiv);
  } else {
    createP("No description available.").parent(modalDiv);
  }
  createButton("Close")
    .parent(modalDiv)
    .style("margin-top", "10px")
    .mousePressed(() => modalDiv.remove());
}

function canWieldItem(item) {
  if (!item || !item.statRequirements) return true; // No requirements, can wield
  let totalStats = {
    STR: getTotalStat("STR"),
    VIT: getTotalStat("VIT"),
    DEX: getTotalStat("DEX"),
    MAG: getTotalStat("MAG"),
    WIL: getTotalStat("WIL"),
    SPR: getTotalStat("SPR"),
    LCK: getTotalStat("LCK"),
  };
  for (let [stat, requiredValue] of Object.entries(item.statRequirements)) {
    if (totalStats[stat] < requiredValue) {
      return false; // Stat too low
    }
  }
  return true; // All requirements met
}
function showTalentDescription(title, description) {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv()
    .style("position", "absolute")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)")
    .style("background", "#fff")
    .style("padding", "20px")
    .style("border", "2px solid #000")
    .style("z-index", "1000")
    .style("max-width", "400px")
    .style("word-wrap", "break-word");
  createElement("h3", title).parent(modalDiv);
  createP(description).parent(modalDiv);
  createButton("Close")
    .parent(modalDiv)
    .style("margin-top", "10px")
    .mousePressed(() => modalDiv.remove());
}

function showTraitDescription(name, positive, negative) {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv()
    .style("position", "absolute")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)")
    .style("background", "#fff")
    .style("padding", "20px")
    .style("border", "2px solid #000")
    .style("z-index", "1000")
    .style("width", "300px");
  createElement("h3", name).parent(modalDiv);
  createP(`(+) ${positive}<br>(-) ${negative}`).parent(modalDiv);
  createButton("Close")
    .parent(modalDiv)
    .style("margin", "5px")
    .mousePressed(() => modalDiv.remove());
}

function showStatDescription(title, description) {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv()
    .style("position", "absolute")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)")
    .style("background", "#fff")
    .style("padding", "20px")
    .style("border", "2px solid #000")
    .style("z-index", "1000")
    .style("max-width", "400px")
    .style("word-wrap", "break-word");
  createElement("h3", title).parent(modalDiv);
  createP(description).parent(modalDiv);
  createButton("Close")
    .parent(modalDiv)
    .style("margin-top", "10px")
    .mousePressed(() => modalDiv.remove());
}

// ### p5.js Setup and Draw ###

function setup() {
  let resourceBarsContainer = select("#resource-bars");
  if (!resourceBarsContainer) {
    console.error("No #resource-bars div found in HTML!");
    return;
  }
  let resourceControlsContainer = select("#resource-controls");
  if (!resourceControlsContainer) {
    console.error("No #resource-controls div found in HTML!");
    return;
  }
  let containerWidth = resourceBarsContainer.elt.clientWidth;
  let canvasWidth = min(containerWidth, 600);
  let canvasHeight = 150;
  cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent(resourceBarsContainer);
  textFont("Arial");
  textSize(16);
  textAlign(LEFT, TOP);

  resourceUIContainer = createDiv()
    .parent(resourceControlsContainer)
    .id("resourceUIContainer");
  skillsContainer = createDiv().id("skillsContainer");

  createResourceUI();
  createStatsUI();
  createTalentsUI();
  createTraitsUI();
  createEquipmentUI();

  // Tab functionality (requires tablink and tabcontent classes in HTML)
  const tablinks = document.querySelectorAll(".tablink");
  const tabcontents = document.querySelectorAll(".tabcontent");
  tablinks.forEach((btn) => {
    btn.addEventListener("click", () => {
      tablinks.forEach((b) => b.classList.remove("active"));
      tabcontents.forEach((tc) => tc.classList.remove("active"));
      btn.classList.add("active");
      document
        .getElementById(btn.getAttribute("data-tab"))
        .classList.add("active");
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
  let bar_width = width * 0.6;
  let bar_height = 20;
  let x = width * 0.1;
  let y_hp = 25,
    y_mp = 55,
    y_stamina = 85,
    y_atb = 115;

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

  stroke(0);
  fill(128);
  rect(x, y_mp, bar_width, bar_height);
  noStroke();
  fill(128, 0, 128);
  let mp_width = (current_mp / max_mp) * bar_width;
  rect(x, y_mp, mp_width, bar_height);
  fill(255);
  text(`MP: ${current_mp}/${max_mp}`, x + bar_width / 2, y_mp + bar_height / 2);

  stroke(0);
  fill(128);
  rect(x, y_stamina, bar_width, bar_height);
  noStroke();
  fill(0, 150, 0);
  let stamina_width = (current_stamina / max_stamina) * bar_width;
  rect(x, y_stamina, stamina_width, bar_height);
  fill(255);
  text(
    `STMN: ${current_stamina}/${max_stamina}`,
    x + bar_width / 2,
    y_stamina + bar_height / 2
  );

  stroke(0);
  fill(128);
  rect(x, y_atb, bar_width, bar_height);
  noStroke();
  fill(0, 0, 255);
  let atb_width = (current_atb / max_atb) * bar_width;
  rect(x, y_atb, atb_width, bar_height);
  fill(255);
  text(
    `ATB: ${current_atb}/${max_atb}`,
    x + bar_width / 2,
    y_atb + bar_height / 2
  );
}

// ### Resource UI ###

function createResourceUI() {
  let rUI = resourceUIContainer;
  rUI.html("");

  let hpRow = createDiv().parent(rUI).class("resource-row");
  createSpan("HP:").parent(hpRow);
  maxHpInput = createInput(max_hp.toString(), "number")
    .parent(hpRow)
    .class("resource-input");
  setMaxHpButton = createButton("Set Max")
    .parent(hpRow)
    .class("resource-button")
    .mousePressed(setMaxHp);
  hpPlus = createButton("+10")
    .parent(hpRow)
    .class("resource-button small-button")
    .mousePressed(() => {
      current_hp = min(current_hp + 10, max_hp);
    });
  hpMinus = createButton("-10")
    .parent(hpRow)
    .class("resource-button small-button")
    .mousePressed(() => {
      current_hp = max(current_hp - 10, 0);
    });

  let mpRow = createDiv().parent(rUI).class("resource-row");
  createSpan("MP:").parent(mpRow);
  maxMpInput = createInput(max_mp.toString(), "number")
    .parent(mpRow)
    .class("resource-input");
  setMaxMpButton = createButton("Set Max")
    .parent(mpRow)
    .class("resource-button")
    .mousePressed(setMaxMp);
  mpPlus = createButton("+5")
    .parent(mpRow)
    .class("resource-button small-button")
    .mousePressed(() => {
      current_mp = min(current_mp + 5, max_mp);
    });
  mpMinus = createButton("-5")
    .parent(mpRow)
    .class("resource-button small-button")
    .mousePressed(() => {
      current_mp = max(current_mp - 5, 0);
    });

  let staminaRow = createDiv().parent(rUI).class("resource-row");
  createSpan("STMN:").parent(staminaRow);
  maxStaminaInput = createInput(max_stamina.toString(), "number")
    .parent(staminaRow)
    .class("resource-input");
  setMaxStaminaButton = createButton("Set Max")
    .parent(staminaRow)
    .class("resource-button")
    .mousePressed(setMaxStamina);
  staminaPlus = createButton("+25")
    .parent(staminaRow)
    .class("resource-button small-button")
    .mousePressed(() => {
      current_stamina = min(current_stamina + 25, max_stamina);
    });
  staminaMinus = createButton("-25")
    .parent(staminaRow)
    .class("resource-button small-button")
    .mousePressed(() => {
      current_stamina = max(current_stamina - 25, 0);
      if (staminaAtbLink) {
        current_atb = min(current_atb + 25, max_atb);
      }
    });

  let atbRow = createDiv().parent(rUI).class("resource-row");
  createSpan("ATB:").parent(atbRow);
  maxAtbInput = createInput(max_atb.toString(), "number")
    .parent(atbRow)
    .class("resource-input");
  setMaxAtbButton = createButton("Set Max")
    .parent(atbRow)
    .class("resource-button")
    .mousePressed(setMaxAtb);
  atbPlus = createButton("+25")
    .parent(atbRow)
    .class("resource-button small-button")
    .mousePressed(() => {
      current_atb = min(current_atb + 25, max_atb);
    });
  atbMinus = createButton("-50")
    .parent(atbRow)
    .class("resource-button small-button")
    .mousePressed(() => {
      current_atb = max(current_atb - 50, 0);
    });

  let adjustmentRow = createDiv().parent(rUI).class("resource-row");
  createSpan("Adjust: ").parent(adjustmentRow);
  let adjustmentInput = createInput("", "number")
    .parent(adjustmentRow)
    .class("resource-input")
    .style("width", "50px");
  let resourceSelect = createSelect()
    .parent(adjustmentRow)
    .style("margin-left", "5px");
  resourceSelect.option("HP");
  resourceSelect.option("MP");
  resourceSelect.option("STMN");
  resourceSelect.option("ATB");
  createButton("+")
    .parent(adjustmentRow)
    .class("resource-button small-button")
    .style("margin-left", "5px")
    .mousePressed(() =>
      adjustResource(
        resourceSelect.value(),
        parseInt(adjustmentInput.value()),
        true
      )
    );
  createButton("-")
    .parent(adjustmentRow)
    .class("resource-button small-button")
    .style("margin-left", "5px")
    .mousePressed(() =>
      adjustResource(
        resourceSelect.value(),
        parseInt(adjustmentInput.value()),
        false
      )
    );

  let linkRow = createDiv().parent(rUI).class("resource-row");
  staminaAtbLinkButton = createButton(staminaAtbLink ? "Link: ON" : "Link: OFF")
    .parent(linkRow)
    .class("resource-button")
    .mousePressed(toggleStaminaAtbLink)
    .style("background-color", staminaAtbLink ? "green" : "red");
  createSpan("When ON, using STMN adds to ATB").parent(linkRow);

  let resetRow = createDiv().parent(rUI).class("resource-row");
  resetButton = createButton("Reset All")
    .parent(resetRow)
    .class("resource-button")
    .mousePressed(resetResources);
}

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

function setMaxHp() {
  let value = parseInt(maxHpInput.value());
  if (!isNaN(value) && value > 0) {
    max_hp = value;
    current_hp = min(current_hp, value);
  }
}

function setMaxMp() {
  let value = parseInt(maxMpInput.value());
  if (!isNaN(value) && value > 0) {
    max_mp = value;
    current_mp = min(current_mp, value);
  }
}

function setMaxStamina() {
  let value = parseInt(maxStaminaInput.value());
  if (!isNaN(value) && value > 0) {
    max_stamina = value;
    current_stamina = min(current_stamina, value);
  }
}

function setMaxAtb() {
  let value = parseInt(maxAtbInput.value());
  if (!isNaN(value) && value > 0) {
    max_atb = value;
    current_atb = min(current_atb, value);
  }
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
  staminaAtbLinkButton.style(
    "background-color",
    staminaAtbLink ? "green" : "red"
  );
}

// ### Stats UI ###

function createStatsUI() {
  let statsContainer = select("#stats");
  if (!statsContainer) {
    console.error("No #stats div found in HTML!");
    return;
  }
  statsContainer.html("");

  createElement("h2", "Stats").parent(statsContainer);
  let statsDesc = createP("Stats determine your character’s core abilities. Click a stat name for details.").parent(statsContainer);
  statsDesc.style("font-size", "12px").style("color", "#666").style("margin-top", "5px").style("margin-bottom", "10px");

  createStatInput("Level", "Level", level, statsContainer, "Level", false);
  createStatInput("EXP", "EXP", exp, statsContainer, "EXP", false);

  let movementDiv = createDiv().parent(statsContainer).style("margin", "5px");
  let movementLabel = createSpan("Movement: ").parent(movementDiv).style("cursor", "pointer");
  movementLabel.mouseClicked(() => showStatDescription("Movement", statDescriptions["Movement"] || "No description available."));
  statLabelElements["Movement"] = movementLabel;
  let movementInput = createInput(movement + " ft", "text").parent(movementDiv).style("width", "50px").attribute("readonly", "true").style("background-color", "#e0e0e0").id("movementInput");

  createStatInput("STR", "Strength", stat_str, statsContainer, "STR", true);
  createStatInput("VIT", "Vitality", stat_vit, statsContainer, "VIT", true);
  createStatInput("DEX", "Dexterity", stat_dex, statsContainer, "DEX", true);
  createStatInput("MAG", "Magic", stat_mag, statsContainer, "MAG", true);
  createStatInput("WIL", "Willpower", stat_wil, statsContainer, "WIL", true);
  createStatInput("SPR", "Spirit", stat_spr, statsContainer, "SPR", true);
  createStatInput("LCK", "Luck", stat_lck, statsContainer, "LCK", true, true);

  createAdditionalAttributesUI();
}

function createStatInput(abbrev, name, initialValue, container, statName, linkable, greyOutAtMax = false) {
  let div = createDiv().parent(container).style("margin", "5px");
  let label = createSpan(name + " (" + abbrev + "): ").parent(div).style("cursor", "pointer");
  label.mouseClicked(() => showStatDescription(name + " (" + abbrev + ")", statDescriptions[abbrev] || "No description available."));
  statLabelElements[abbrev] = label;

  let input = createInput(initialValue.toString(), "number").parent(div).style("width", "50px");
  input.changed(() => {
    let val = int(input.value());
    val = constrain(val, 1, 99);
    tryChangeStat(statName, val);
    // Update input to reflect current stat value
    let currentStatValue;
    switch (statName) {
      case "Level": currentStatValue = level; break;
      case "EXP": currentStatValue = exp; break;
      case "STR": currentStatValue = stat_str; break;
      case "VIT": currentStatValue = stat_vit; break;
      case "DEX": currentStatValue = stat_dex; break;
      case "MAG": currentStatValue = stat_mag; break;
      case "WIL": currentStatValue = stat_wil; break;
      case "SPR": currentStatValue = stat_spr; break;
      case "LCK": currentStatValue = stat_lck; break;
    }
    input.value(currentStatValue);
    if (greyOutAtMax && currentStatValue === 99) {
      input.attribute("disabled", "true").style("background-color", "#ccc");
    } else if (greyOutAtMax) {
      input.removeAttribute("disabled").style("background-color", "white");
    }
  });

  let bonusSpan = createSpan().parent(div).style("color", "green").style("margin-left", "5px");
  statBonusElements[abbrev] = bonusSpan;
}
function tryChangeStat(statName, newValue) {
  // Convert and constrain the new value
  let newValueInt = constrain(int(newValue), 1, 99);

  // Handle Level and EXP separately (no equipment checks needed)
  if (statName === "Level" || statName === "EXP") {
    if (statName === "Level") level = newValueInt;
    else if (statName === "EXP") exp = newValueInt;
    return true;
  }

  // Calculate the new total stat value (base + bonuses)
  let bonuses = getStatBonuses();
  let newTotal = newValueInt + (bonuses[statName] || 0);

  // Check all equipped items for stat requirements
  for (let slot in equippedItems) {
    let item = equippedItems[slot];
    if (item && item.statRequirements && item.statRequirements[statName]) {
      if (newTotal < item.statRequirements[statName]) {
        showConfirmationModal(
          `Cannot lower ${statName}: equipped item "${item.name}" requires ${item.statRequirements[statName]} ${statName}. Unequip the item first.`,
          () => {},
          true
        );
        return false;
      }
    }
  }

  // If all checks pass, update the stat
  switch (statName) {
    case "STR": stat_str = newValueInt; break;
    case "VIT": stat_vit = newValueInt; updateResourcesBasedOnStats(); break;
    case "DEX": stat_dex = newValueInt; break;
    case "MAG": stat_mag = newValueInt; break;
    case "WIL": stat_wil = newValueInt; updateResourcesBasedOnStats(); break;
    case "SPR": stat_spr = newValueInt; break;
    case "LCK": stat_lck = newValueInt; break;
  }
  return true;
}
function createAdditionalAttributesUI() {
  let statsContainer = select("#stats");
  if (!statsContainer) return;
  skillsContainer
    .parent(statsContainer)
    .style("padding", "5px")
    .style("margin-top", "20px")
    .style("width", "100%")
    .style("max-width", "600px");

  createElement("h3", "Skills").parent(skillsContainer);
  let skillsDesc = createP(
    "Skills enhance specific abilities. Link a Skill to a Stat (e.g., Athletics to STR) to tie its effectiveness to that Stat’s value. Click a skill name for details. Only one Skill can link to a Stat at a time."
  ).parent(skillsContainer);
  skillsDesc
    .style("font-size", "12px")
    .style("color", "#666")
    .style("margin-top", "5px")
    .style("margin-bottom", "10px");

  additionalAttributes.forEach((attr) => {
    let attrDiv = createDiv().parent(skillsContainer).class("resource-row");
    let btn = createButton(attr.name)
      .parent(attrDiv)
      .style("background-color", attr.color)
      .style("color", "#fff")
      .class("resource-button")
      .mousePressed(() => showStatDescription(attr.name, attr.desc));
    let statSelect = createSelect().parent(attrDiv);
    statSelect.option("None");
    ["STR", "VIT", "DEX", "MAG", "WIL", "SPR", "LCK"].forEach((stat) =>
      statSelect.option(stat)
    );
    statSelect.changed(() => linkStatToSkill(attr.name, statSelect.value()));
    attributeCheckboxes[attr.name] = statSelect;
  });

  updateSkillDropdowns();
}

function updateSkillDropdowns() {
  const allStats = ["STR", "VIT", "DEX", "MAG", "WIL", "SPR", "LCK"];
  let assignedStats = Object.values(attributeLinkMapping);

  additionalAttributes.forEach((attr) => {
    let dropdown = attributeCheckboxes[attr.name];
    let currentStat = attributeLinkMapping[attr.name] || "None";
    dropdown.elt.innerHTML = "";
    let noneOption = document.createElement("option");
    noneOption.value = "None";
    noneOption.text = "None";
    dropdown.elt.add(noneOption);

    allStats.forEach((stat) => {
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
    let skillColor = additionalAttributes.find((a) => a.name === skillName)
      .color;
    statLabelElements[selectedStat].style("color", skillColor);
  }

  updateSkillDropdowns();
}

// ### Equipment System ###

function calculateMovement() {
  let totalPenalty = 0;
  const armorSlots = ["Chest", "Helm", "Gloves", "Greaves"];
  armorSlots.forEach((slot) => {
    const item = equippedItems[slot];
    if (item && item.movementPenalty) {
      totalPenalty += item.movementPenalty; // Sum penalties (negative numbers)
    }
  });
  movement = Math.max(25, 65 + totalPenalty); // Base 65 ft, minimum 25 ft
  let movementInput = select("#movementInput");
  if (movementInput) movementInput.value(movement + " ft");
}

function createEquipmentUI() {
  let equipmentContainerDiv = select("#equipment");
  if (!equipmentContainerDiv) {
    console.error("No #equipment div found in HTML!");
    return;
  }
  equipmentContainerDiv.html("");

  createElement("h2", "Equipment").parent(equipmentContainerDiv);
  let equipDesc = createP(
    "View, add, edit, or remove equipment items. Select an item to equip it in a slot (some require stats). Click a slot name to view details. Weapons deal damage (dice + modifier); armor provides defense."
  ).parent(equipmentContainerDiv);
  equipDesc
    .style("font-size", "12px")
    .style("color", "#666")
    .style("margin-top", "5px")
    .style("margin-bottom", "10px");

  createButton("Add Equipment")
    .parent(equipmentContainerDiv)
    .style("margin", "5px")
    .mousePressed(showAddEquipmentModal);
  createButton("Remove / Edit Equipment")
    .parent(equipmentContainerDiv)
    .style("margin", "5px")
    .mousePressed(showRemoveEditEquipmentModal);

  let equipmentTable = createElement("table")
    .parent(equipmentContainerDiv)
    .id("equipmentTable")
    .style("width", "100%")
    .style("border-collapse", "collapse")
    .style("margin-top", "10px");
  let headerRow = createElement("tr").parent(equipmentTable);
  [
    "Slot",
    "Name",
    "Requirements",
    "Damage/Defense",
    "Mov. Penalty",
    "Crystal Slots",
    "Stat Bonus",
    "Linked Stat",
  ].forEach((header) => {
    createElement("th", header)
      .parent(headerRow)
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("background", "#f2f2f2");
  });

  Object.keys(equippedItems).forEach((slot) => {
    let row = createElement("tr").parent(equipmentTable);
    let slotCell = createElement("td", slot)
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("cursor", "pointer");
    slotCell.mousePressed(() =>
      showEquipmentDescription(slot, equippedItems[slot])
    );

    let nameCell = createElement("td")
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");
    let select = slotSelects[slot] || createSelect();
    select.parent(nameCell).style("width", "150px");
    slotSelects[slot] = select;
    select.html("");
    select.option("None", "None");
    if (availableEquipment[slot]) {
      availableEquipment[slot].forEach((item) =>
        select.option(item.name, item.name)
      );
    }
    let currentItem = equippedItems[slot];
    select.value(currentItem ? currentItem.name : "None");
    select.changed(() => equipItem(slot, select.value()));

    let item = equippedItems[slot];
    let reqText = "-";
    if (item && item.statRequirements) {
      reqText = Object.entries(item.statRequirements)
        .map(([stat, value]) => `${value} ${stat}`)
        .join(" & ");
    }
    createElement("td", reqText)
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");

    let damageDefenseText = "-";
    if (item && item.damageDice) {
      let modifierText =
        item.modifier && item.modifier !== 0
          ? item.modifier > 0
            ? `+${item.modifier}`
            : item.modifier
          : "";
      damageDefenseText = `${item.damageDice}${modifierText}`;
    } else if (item && item.defense) {
      damageDefenseText = `${item.defense}${
        item.modifier && item.modifier !== 0
          ? item.modifier > 0
            ? ` +${item.modifier}`
            : ` ${item.modifier}`
          : ""
      }`;
    } else if (item && item.modifier && item.modifier !== 0) {
      damageDefenseText =
        item.modifier > 0 ? `+${item.modifier}` : String(item.modifier);
    }
    createElement("td", damageDefenseText)
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");

    createElement(
      "td",
      item && item.movementPenalty !== undefined
        ? String(item.movementPenalty) + " ft"
        : "-"
    )
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");
    let slotsCell = createElement("td", item ? String(item.crystalSlots) : "-")
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");
    if (item && item.crystalSlots > 0) {
      slotsCell
        .style("cursor", "pointer")
        .style("color", "blue")
        .mousePressed(() => showCrystalSlotModal(item));
    }
    createElement(
      "td",
      item && item.statBonus
        ? `${item.statBonus.amount} ${item.statBonus.stat}`
        : "-"
    )
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");
    createElement("td", item && item.linkedStat ? item.linkedStat : "-")
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");
  });
}
function showCrystalSlotModal(item) {
  // Placeholder for crystal slot management (not implemented in this version)
  alert(`Crystal slot management for ${item.name} is not yet implemented.`);
}
function createEquipmentFromModal(
  typeSelect,
  nameInput,
  penaltySelect,
  slotsSelect,
  linkedStatSelect,
  statBonusAmountInput,
  statBonusStatSelect,
  descriptionInput,
  statReq1Select,
  statReq1Input,
  statReq2Select,
  statReq2Input,
  damageDiceInput,
  defenseInput,
  modifierInput
) {
  let type = typeSelect.value();
  let name = nameInput.value().trim();
  if (!name) {
    alert("Please provide a name for the equipment.");
    return null;
  }
  let movementPenalty = ["Chest", "Helm", "Gloves", "Greaves"].includes(type)
    ? parseInt(penaltySelect.value())
    : 0;
  let crystalSlots = parseInt(slotsSelect.value());
  let linkedStat = ["On-Hand", "Off-Hand"].includes(type)
    ? linkedStatSelect.value()
    : null;
  let statBonusAmount = parseInt(statBonusAmountInput.value()) || 0;
  let statBonusStat =
    statBonusStatSelect.value() === "None" ? null : statBonusStatSelect.value();
  let description =
    descriptionInput.value().trim() || "No description provided.";
  // Stat Requirements
  let statRequirements = {};
  if (statReq1Select.value() !== "None" && statReq1Input.value()) {
    statRequirements[statReq1Select.value()] = parseInt(statReq1Input.value());
  }
  if (
    statReq2Select.value() !== "None" &&
    statReq2Input.value() &&
    statReq2Select.value() !== statReq1Select.value()
  ) {
    statRequirements[statReq2Select.value()] = parseInt(statReq2Input.value());
  }

  // Damage Dice or Defense with Modifier
  let damageDice = ["On-Hand", "Off-Hand"].includes(type)
    ? damageDiceInput.value().trim()
    : null;
  let defense = ["Chest", "Helm", "Gloves", "Greaves"].includes(type)
    ? parseInt(defenseInput.value()) || 0
    : null;
  let modifier = parseInt(modifierInput.value()) || 0;

  return {
    type: type,
    name: name,
    movementPenalty: movementPenalty,
    crystalSlots: crystalSlots,
    statBonus:
      statBonusAmount !== 0 && statBonusStat
        ? { amount: statBonusAmount, stat: statBonusStat }
        : null,
    modifier: modifier !== 0 ? modifier : null,
    linkedStat: linkedStat,
    description: description,
    statRequirements:
      Object.keys(statRequirements).length > 0 ? statRequirements : null,
    damageDice: damageDice || null,
    defense: defense,
    slottedCrystals: [],
  };
}
function equipItem(slot, itemName) {
  let previousItem = equippedItems[slot] ? equippedItems[slot].name : "None";
  if (itemName === "None") {
    equippedItems[slot] = null;
  } else {
    let selectedItem = availableEquipment[slot].find(
      (item) => item.name === itemName
    );
    if (selectedItem) {
      if (canWieldItem(selectedItem)) {
        equippedItems[slot] = selectedItem;
      } else {
        let totalStats = {
          STR: getTotalStat("STR"),
          VIT: getTotalStat("VIT"),
          DEX: getTotalStat("DEX"),
          MAG: getTotalStat("MAG"),
          WIL: getTotalStat("WIL"),
          SPR: getTotalStat("SPR"),
          LCK: getTotalStat("LCK"),
        };
        let missingStats = [];
        for (let [stat, requiredValue] of Object.entries(
          selectedItem.statRequirements || {}
        )) {
          let currentValue = totalStats[stat];
          if (currentValue < requiredValue) {
            missingStats.push(`${stat}: ${currentValue}/${requiredValue}`);
          }
        }
        let errorMessage = `Cannot equip ${
          selectedItem.name
        }. Missing requirements: ${missingStats.join(", ")}.`;
        showConfirmationModal(errorMessage, () => {}, true);
        slotSelects[slot].value(previousItem);
        return;
      }
    }
  }
  calculateMovement();
  updateResourcesBasedOnStats();
  createEquipmentUI();
  updateStatBonusesDisplay();
}
function showAddEquipmentModal() {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv()
    .style("position", "absolute")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)")
    .style("background", "#fff")
    .style("padding", "20px")
    .style("border", "2px solid #000")
    .style("z-index", "1000")
    .style("width", "300px");

  createElement("h3", "Add Equipment").parent(modalDiv);
  let typeLabel = createSpan("Equipment Type:")
    .parent(modalDiv)
    .style("display", "block");
  let typeSelect = createSelect()
    .parent(modalDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px");
  [
    "On-Hand",
    "Off-Hand",
    "Chest",
    "Helm",
    "Gloves",
    "Greaves",
    "Accessory 1",
    "Accessory 2",
  ].forEach((type) => typeSelect.option(type));
  typeSelect.value("On-Hand");

  let nameLabel = createSpan("Name:")
    .parent(modalDiv)
    .style("display", "block");
  let nameInput = createInput("")
    .parent(modalDiv)
    .attribute("placeholder", "e.g., Buster Sword")
    .style("width", "100%")
    .style("margin-bottom", "10px");

  let penaltyDiv = createDiv().parent(modalDiv).style("display", "none");
  let penaltyLabel = createSpan("Movement Penalty (ft):")
    .parent(penaltyDiv)
    .style("display", "block");
  let penaltySelect = createSelect()
    .parent(penaltyDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px");
  ["0", "-5", "-10", "-15"].forEach((penalty) => penaltySelect.option(penalty));

  let slotsLabel = createSpan("Essence Crystal Slots:")
    .parent(modalDiv)
    .style("display", "block");
  let slotsSelect = createSelect()
    .parent(modalDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px");
  [0, 1, 2].forEach((slot) => slotsSelect.option(slot));

  let linkedStatDiv = createDiv().parent(modalDiv).style("display", "block");
  let linkedStatLabel = createSpan("Linked Stat (Weapons):")
    .parent(linkedStatDiv)
    .style("display", "block");
  let linkedStatSelect = createSelect()
    .parent(linkedStatDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px");
  linkedStatSelect.option("STR");
  linkedStatSelect.option("MAG");

  let statBonusDiv = createDiv().parent(modalDiv);
  let statBonusLabel = createSpan("Stat Bonus:")
    .parent(statBonusDiv)
    .style("display", "block");
  let statBonusAmountInput = createInput("0", "number")
    .parent(statBonusDiv)
    .style("width", "50px")
    .style("margin-right", "5px");
  let statBonusStatSelect = createSelect()
    .parent(statBonusDiv)
    .style("width", "100px")
    .style("margin-bottom", "10px");
  ["None", "STR", "DEX", "VIT", "MAG", "WIL", "SPR", "LCK"].forEach((stat) =>
    statBonusStatSelect.option(stat)
  );

  let descriptionLabel = createSpan("Description:")
    .parent(modalDiv)
    .style("display", "block");
  let descriptionInput = createElement("textarea")
    .parent(modalDiv)
    .style("width", "100%")
    .style("height", "60px")
    .style("margin-bottom", "10px")
    .attribute("placeholder", "Describe the equipment...");

  let statReqDiv = createDiv().parent(modalDiv).style("display", "block");
  let statReqLabel = createSpan("Stat Requirements (Optional):")
    .parent(statReqDiv)
    .style("display", "block");
  let statReq1Div = createDiv()
    .parent(statReqDiv)
    .style("margin-bottom", "5px");
  let statReq1Select = createSelect()
    .parent(statReq1Div)
    .style("width", "80px")
    .style("margin-right", "5px");
  ["None", "STR", "DEX", "VIT", "MAG", "WIL", "SPR", "LCK"].forEach((stat) =>
    statReq1Select.option(stat)
  );
  let statReq1Input = createInput("", "number")
    .parent(statReq1Div)
    .style("width", "50px")
    .attribute("placeholder", "Value");

  let statReq2Div = createDiv()
    .parent(statReqDiv)
    .style("margin-bottom", "10px");
  let statReq2Select = createSelect()
    .parent(statReq2Div)
    .style("width", "80px")
    .style("margin-right", "5px");
  ["None", "STR", "DEX", "VIT", "MAG", "WIL", "SPR", "LCK"].forEach((stat) =>
    statReq2Select.option(stat)
  );
  let statReq2Input = createInput("", "number")
    .parent(statReq2Div)
    .style("width", "50px")
    .attribute("placeholder", "Value");

  let damageDiceDiv = createDiv().parent(modalDiv).style("display", "block");
  let damageDiceLabel = createSpan("Damage Dice + Modifier (Weapons):")
    .parent(damageDiceDiv)
    .style("display", "block");
  let damageDiceInput = createInput("", "text")
    .parent(damageDiceDiv)
    .style("width", "80px")
    .style("margin-right", "5px")
    .attribute("placeholder", "e.g., 2d6");
  let weaponModifierInput = createInput("0", "number")
    .parent(damageDiceDiv)
    .style("width", "50px")
    .style("margin-bottom", "10px")
    .attribute("placeholder", "Mod");

  let defenseDiv = createDiv().parent(modalDiv).style("display", "none");
  let defenseLabel = createSpan("Defense + Modifier (Armor):")
    .parent(defenseDiv)
    .style("display", "block");
  let defenseInput = createInput("0", "number")
    .parent(defenseDiv)
    .style("width", "50px")
    .style("margin-right", "5px");
  let armorModifierInput = createInput("0", "number")
    .parent(defenseDiv)
    .style("width", "50px")
    .style("margin-bottom", "10px")
    .attribute("placeholder", "Mod");
  function updateTypeVisibility() {
    let selectedType = typeSelect.value();
    if (["Chest", "Helm", "Gloves", "Greaves"].includes(selectedType)) {
      penaltyDiv.style("display", "block");
      linkedStatDiv.style("display", "none");
      damageDiceDiv.style("display", "none");
      defenseDiv.style("display", "block");
    } else if (["On-Hand", "Off-Hand"].includes(selectedType)) {
      penaltyDiv.style("display", "none");
      linkedStatDiv.style("display", "block");
      damageDiceDiv.style("display", "block");
      defenseDiv.style("display", "none");
    } else {
      penaltyDiv.style("display", "none");
      linkedStatDiv.style("display", "none");
      damageDiceDiv.style("display", "none");
      defenseDiv.style("display", "none");
    }
  }

  typeSelect.changed(updateTypeVisibility);
  updateTypeVisibility();

  let addButton = createButton("Add to Inventory")
    .parent(modalDiv)
    .style("margin", "5px");
  addButton.mousePressed(() => {
    let modifierInput = ["On-Hand", "Off-Hand"].includes(typeSelect.value())
      ? weaponModifierInput
      : armorModifierInput;
    let equipment = createEquipmentFromModal(
      typeSelect,
      nameInput,
      penaltySelect,
      slotsSelect,
      linkedStatSelect,
      statBonusAmountInput,
      statBonusStatSelect,
      descriptionInput,
      statReq1Select,
      statReq1Input,
      statReq2Select,
      statReq2Input,
      damageDiceInput,
      defenseInput,
      modifierInput
    );
    if (equipment) {
      equipment.category = "Equipment";
      if (!Array.isArray(inventory)) {
        inventory = []; // Initialize if undefined or not an array
      }
      inventory.push(equipment);
      updateAvailableEquipment();
      createEquipmentUI();
      // createInventoryUI(); // Comment out until implemented
      modalDiv.remove();
    }
  });

  createButton("Cancel")
    .parent(modalDiv)
    .style("margin", "5px")
    .mousePressed(() => modalDiv.remove());
}
function showRemoveEditEquipmentModal() {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv()
    .style("position", "absolute")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)")
    .style("background", "#fff")
    .style("padding", "20px")
    .style("border", "2px solid #000")
    .style("z-index", "1000")
    .style("width", "300px");

  createElement("h3", "Remove / Edit Equipment").parent(modalDiv);
  let allEquipment = inventory.filter((item) => item.category === "Equipment");
  if (allEquipment.length === 0) {
    createP("No equipment available to remove or edit.").parent(modalDiv);
    createButton("Close")
      .parent(modalDiv)
      .style("margin", "5px")
      .mousePressed(() => modalDiv.remove());
    return;
  }

  let typeLabel = createSpan("Equipment Type:")
    .parent(modalDiv)
    .style("display", "block");
  let typeSelect = createSelect()
    .parent(modalDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px");
  Object.keys(availableEquipment).forEach((slot) => {
    if (availableEquipment[slot].length > 0) typeSelect.option(slot);
  });

  let equipmentLabel = createSpan("Select Equipment:")
    .parent(modalDiv)
    .style("display", "block");
  let equipmentSelect = createSelect()
    .parent(modalDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px");

  function updateEquipmentOptions() {
    let selectedType = typeSelect.value();
    equipmentSelect.html("");
    let typeItems = inventory.filter(
      (item) => item.type === selectedType && item.category === "Equipment"
    );
    if (typeItems.length > 0) {
      typeItems.forEach((item) => equipmentSelect.option(item.name));
    } else {
      equipmentSelect.option("No items available");
    }
  }

  typeSelect.changed(updateEquipmentOptions);
  updateEquipmentOptions();

  let nameDiv = createDiv().parent(modalDiv);
  let nameInput = createInput("")
    .parent(nameDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px")
    .attribute("placeholder", "Name");

  let descDiv = createDiv().parent(modalDiv);
  let descriptionInput = createElement("textarea")
    .parent(descDiv)
    .style("width", "100%")
    .style("height", "60px")
    .style("margin-bottom", "10px")
    .attribute("placeholder", "Description");

  let penaltyDiv = createDiv().parent(modalDiv);
  let penaltySelect = createSelect()
    .parent(penaltyDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px");
  ["0", "-5", "-10", "-15"].forEach((penalty) => penaltySelect.option(penalty));

  let slotsDiv = createDiv().parent(modalDiv);
  let slotsSelect = createSelect()
    .parent(slotsDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px");
  [0, 1, 2].forEach((slot) => slotsSelect.option(slot));

  let linkedStatDiv = createDiv().parent(modalDiv);
  let linkedStatSelect = createSelect()
    .parent(linkedStatDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px");
  linkedStatSelect.option("STR");
  linkedStatSelect.option("MAG");

  let statBonusDiv = createDiv().parent(modalDiv);
  let statBonusAmountInput = createInput("0", "number")
    .parent(statBonusDiv)
    .style("width", "50px")
    .style("margin-right", "5px");
  let statBonusStatSelect = createSelect()
    .parent(statBonusDiv)
    .style("width", "100px")
    .style("margin-bottom", "10px");
  ["None", "STR", "DEX", "VIT", "MAG", "WIL", "SPR", "LCK"].forEach((stat) =>
    statBonusStatSelect.option(stat)
  );

  let statReq1Div = createDiv().parent(modalDiv); // Always visible now
  let statReq1Select = createSelect()
    .parent(statReq1Div)
    .style("width", "80px")
    .style("margin-right", "5px");
  ["None", "STR", "DEX", "VIT", "MAG", "WIL", "SPR", "LCK"].forEach((stat) =>
    statReq1Select.option(stat)
  );
  let statReq1Input = createInput("", "number")
    .parent(statReq1Div)
    .style("width", "50px")
    .style("margin-bottom", "10px");

  let statReq2Div = createDiv().parent(modalDiv); // Always visible now
  let statReq2Select = createSelect()
    .parent(statReq2Div)
    .style("width", "80px")
    .style("margin-right", "5px");
  ["None", "STR", "DEX", "VIT", "MAG", "WIL", "SPR", "LCK"].forEach((stat) =>
    statReq2Select.option(stat)
  );
  let statReq2Input = createInput("", "number")
    .parent(statReq2Div)
    .style("width", "50px")
    .style("margin-bottom", "10px");

  let damageDiceDiv = createDiv().parent(modalDiv);
  let damageDiceInput = createInput("", "text")
    .parent(damageDiceDiv)
    .style("width", "80px")
    .style("margin-right", "5px");
  let weaponModifierInput = createInput("0", "number")
    .parent(damageDiceDiv)
    .style("width", "50px")
    .style("margin-bottom", "10px");

  let defenseDiv = createDiv().parent(modalDiv);
  let defenseInput = createInput("0", "number")
    .parent(defenseDiv)
    .style("width", "50px")
    .style("margin-right", "5px");
  let armorModifierInput = createInput("0", "number")
    .parent(defenseDiv)
    .style("width", "50px")
    .style("margin-bottom", "10px");

  function loadEquipmentData() {
    let selectedType = typeSelect.value();
    let selectedName = equipmentSelect.value();
    let item = inventory.find(
      (i) =>
        i.name === selectedName &&
        i.type === selectedType &&
        i.category === "Equipment"
    );
    if (item) {
      nameInput.value(item.name);
      descriptionInput.value(item.description || "");
      penaltySelect.value(
        item.movementPenalty !== undefined ? String(item.movementPenalty) : "0"
      );
      slotsSelect.value(item.crystalSlots || 0);
      linkedStatSelect.value(item.linkedStat || "STR");
      statBonusAmountInput.value(item.statBonus?.amount || 0);
      statBonusStatSelect.value(item.statBonus?.stat || "None");
      statReq1Select.value(
        item.statRequirements
          ? Object.keys(item.statRequirements)[0] || "None"
          : "None"
      );
      statReq1Input.value(
        item.statRequirements
          ? Object.values(item.statRequirements)[0] || ""
          : ""
      );
      statReq2Select.value(
        item.statRequirements && Object.keys(item.statRequirements)[1]
          ? Object.keys(item.statRequirements)[1]
          : "None"
      );
      statReq2Input.value(
        item.statRequirements && Object.values(item.statRequirements)[1]
          ? Object.values(item.statRequirements)[1]
          : ""
      );
      damageDiceInput.value(item.damageDice || "");
      weaponModifierInput.value(item.modifier || 0);
      defenseInput.value(item.defense || 0);
      armorModifierInput.value(item.modifier || 0);

      let isWeapon = ["On-Hand", "Off-Hand"].includes(selectedType);
      let isArmor = ["Chest", "Helm", "Gloves", "Greaves"].includes(
        selectedType
      );
      penaltyDiv.style("display", isArmor ? "block" : "none");
      linkedStatDiv.style("display", isWeapon ? "block" : "none");
      damageDiceDiv.style("display", isWeapon ? "block" : "none");
      defenseDiv.style("display", isArmor ? "block" : "none");
    }
  }

  equipmentSelect.changed(loadEquipmentData);
  loadEquipmentData();

  createButton("Edit")
    .parent(modalDiv)
    .style("margin", "5px")
    .mousePressed(() => {
      let selectedType = typeSelect.value();
      let selectedName = equipmentSelect.value();
      if (selectedName === "No items available") {
        showConfirmationModal("No equipment selected to edit.", () => {}, true);
        return;
      }
      let index = inventory.findIndex(
        (item) =>
          item.name === selectedName &&
          item.type === selectedType &&
          item.category === "Equipment"
      );
      if (index !== -1) {
        let modifierInput = ["On-Hand", "Off-Hand"].includes(selectedType)
          ? weaponModifierInput
          : armorModifierInput;
        let newEquipment = createEquipmentFromModal(
          typeSelect,
          nameInput,
          penaltySelect,
          slotsSelect,
          linkedStatSelect,
          statBonusAmountInput,
          statBonusStatSelect,
          descriptionInput,
          statReq1Select,
          statReq1Input,
          statReq2Select,
          statReq2Input,
          damageDiceInput,
          defenseInput,
          modifierInput
        );
        if (newEquipment) {
          newEquipment.category = "Equipment";
          if (
            equippedItems[selectedType] &&
            equippedItems[selectedType].name === selectedName
          ) {
            if (canWieldItem(newEquipment)) {
              equippedItems[selectedType] = newEquipment;
            } else {
              let totalStats = {
                STR: getTotalStat("STR"),
                VIT: getTotalStat("VIT"),
                DEX: getTotalStat("DEX"),
                MAG: getTotalStat("MAG"),
                WIL: getTotalStat("WIL"),
                SPR: getTotalStat("SPR"),
                LCK: getTotalStat("LCK"),
              };
              let missingStats = [];
              for (let [stat, requiredValue] of Object.entries(
                newEquipment.statRequirements || {}
              )) {
                if (totalStats[stat] < requiredValue) {
                  missingStats.push(
                    `${stat}: ${totalStats[stat]}/${requiredValue}`
                  );
                }
              }
              showConfirmationModal(
                `Cannot edit ${selectedName} as equipped item. New requirements not met: ${missingStats.join(
                  ", "
                )}.`,
                () => {},
                true
              );
              return;
            }
          }
          inventory[index] = newEquipment;
          updateAvailableEquipment();
          createEquipmentUI();
          // createInventoryUI(); // Comment out until implemented
          modalDiv.remove();
        }
      }
    });

  createButton("Remove")
    .parent(modalDiv)
    .style("margin", "5px")
    .mousePressed(() => {
      let selectedType = typeSelect.value();
      let selectedName = equipmentSelect.value();
      if (selectedName === "No items available") {
        showConfirmationModal(
          "No equipment selected to remove.",
          () => {},
          true
        );
        return;
      }
      showConfirmationModal(
        `Remove ${selectedName} from ${selectedType}?`,
        () => {
          let index = inventory.findIndex(
            (item) =>
              item.name === selectedName &&
              item.type === selectedType &&
              item.category === "Equipment"
          );
          if (index !== -1) {
            if (
              equippedItems[selectedType] &&
              equippedItems[selectedType].name === selectedName
            ) {
              equippedItems[selectedType] = null;
              calculateMovement();
              updateResourcesBasedOnStats();
              updateStatBonusesDisplay();
            }
            inventory.splice(index, 1);
            updateAvailableEquipment();
            createEquipmentUI();
            // createInventoryUI(); // Comment out until implemented
            modalDiv.remove();
          }
        }
      );
    });

  createButton("Cancel")
    .parent(modalDiv)
    .style("margin", "5px")
    .mousePressed(() => modalDiv.remove());
}

// ### Talents UI ###

function createTalentsUI() {
  let talentsContainerDiv = select("#talents");
  if (!talentsContainerDiv) {
    console.error("No #talents div found in HTML!");
    return;
  }
  talentsContainerDiv.html("");

  createElement("h2", "Talents").parent(talentsContainerDiv);
  let talentsDesc = createP(
    "Use buttons to add, edit, or remove talents. Click a talent's name to view its details. Use arrows to reorder."
  ).parent(talentsContainerDiv);
  talentsDesc
    .style("font-size", "12px")
    .style("color", "#666")
    .style("margin-top", "5px")
    .style("margin-bottom", "10px");

  createButton("Add Custom Talent")
    .parent(talentsContainerDiv)
    .style("margin", "5px")
    .mousePressed(showAddCustomTalentModal);
  createButton("Add / Edit Existing Talents")
    .parent(talentsContainerDiv)
    .style("margin", "5px")
    .mousePressed(showAddEditTalentsModal);
  createButton("Remove Existing Talent")
    .parent(talentsContainerDiv)
    .style("margin", "5px")
    .mousePressed(showRemoveExistingTalentModal);
  createButton("Default Talent List")
    .parent(talentsContainerDiv)
    .style("margin", "5px")
    .mousePressed(() =>
      showConfirmationModal(
        "Reset to default talent list?",
        resetToDefaultTalents
      )
    );

  let talentsTable = createElement("table")
    .parent(talentsContainerDiv)
    .id("talentsTable")
    .style("width", "100%")
    .style("border-collapse", "collapse")
    .style("margin-top", "10px");
  let headerRow = createElement("tr").parent(talentsTable);
  ["", "Name", "Level", "Category", "Actions"].forEach((header) => {
    createElement("th", header)
      .parent(headerRow)
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("background", "#f2f2f2");
  });

  updateTalentsTable();
}
function updateAvailableEquipment() {
  for (let slot in availableEquipment) {
    availableEquipment[slot] = inventory.filter(
      (item) => item.type === slot && item.category === "Equipment"
    );
  }
}
function showAddCustomTalentModal() {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv()
    .style("position", "absolute")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)")
    .style("background", "#fff")
    .style("padding", "20px")
    .style("border", "2px solid #000")
    .style("z-index", "1000")
    .style("width", "300px");

  createElement("h3", "Add Custom Talent").parent(modalDiv);
  let nameLabel = createSpan("Talent Name:").parent(modalDiv);
  let nameInput = createInput("")
    .parent(modalDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px");

  let levelLabel = createSpan("Levels (select highest desired):").parent(
    modalDiv
  );
  let levelsDiv = createDiv().parent(modalDiv).style("margin-bottom", "10px");

  let levelCheckboxes = {};
  let levelDescriptions = {};
  ["I", "II", "III"].forEach((lvl) => {
    let chkDiv = createDiv().parent(levelsDiv);
    let chk = createCheckbox(`Level ${lvl}`, false).parent(chkDiv);
    levelCheckboxes[lvl] = chk;
    let descDiv = createDiv().parent(levelsDiv).style("display", "none");
    let descLabel = createSpan(`Description ${lvl}:`).parent(descDiv);
    let descInput = createElement("textarea")
      .parent(descDiv)
      .style("width", "100%")
      .style("height", "60px")
      .style("margin-bottom", "5px");
    levelDescriptions[lvl] = { div: descDiv, input: descInput };
    chk.changed(() =>
      manageLevelDependencies(levelCheckboxes, levelDescriptions, lvl)
    );
  });

  let categoryLabel = createSpan("Category:").parent(modalDiv);
  let categorySelect = createSelect()
    .parent(modalDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px");
  [
    "Physical Combat",
    "Magical",
    "Ranged Combat",
    "Defensive",
    "Utility & Tactical",
  ].forEach((cat) => categorySelect.option(cat));

  createButton("Save")
    .parent(modalDiv)
    .style("margin", "5px")
    .mousePressed(() => {
      let name = nameInput.value();
      let category = categorySelect.value();
      if (!name || !category) {
        alert("Please provide a talent name and category.");
        return;
      }

      let checkedLevels = Object.keys(levelCheckboxes).filter((lvl) =>
        levelCheckboxes[lvl].checked()
      );
      if (checkedLevels.length === 0) {
        alert("Please select at least one level.");
        return;
      }

      let maxLevelIndex = checkedLevels.reduce(
        (max, lvl) =>
          ["I", "II", "III"].indexOf(lvl) > ["I", "II", "III"].indexOf(max)
            ? lvl
            : max,
        "I"
      );
      let requiredLevels = ["I", "II", "III"].slice(
        0,
        ["I", "II", "III"].indexOf(maxLevelIndex) + 1
      );
      for (let lvl of requiredLevels) {
        if (!checkedLevels.includes(lvl)) {
          alert(
            `Please ensure Level ${
              ["I", "II", "III"].indexOf(lvl) + 1
            } is selected and described.`
          );
          return;
        }
        let desc = levelDescriptions[lvl].input.value();
        if (!desc) {
          alert(`Please provide a description for Level ${lvl}.`);
          return;
        }
      }

      let newTalents = [];
      requiredLevels.forEach((lvl) => {
        let fullName = `${name} - Level ${lvl}`;
        let talent = {
          name: fullName,
          level: lvl,
          category: category,
          description: levelDescriptions[lvl].input.value(),
          maxLevel: maxLevelIndex,
        };
        existingTalents.push(talent);
        newTalents.push(talent);
      });

      talents = talents.filter((t) => !t.name.startsWith(name));
      let levelOneTalent = newTalents.find((t) => t.level === "I");
      if (levelOneTalent) talents.push(levelOneTalent);
      updateTalentsTable();
      modalDiv.remove();
    });

  createButton("Cancel")
    .parent(modalDiv)
    .style("margin", "5px")
    .mousePressed(() => modalDiv.remove());
}

function showAddEditTalentsModal() {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv()
    .style("position", "absolute")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)")
    .style("background", "#fff")
    .style("padding", "20px")
    .style("border", "2px solid #000")
    .style("z-index", "1000")
    .style("width", "300px");

  createElement("h3", "Add / Edit Existing Talents").parent(modalDiv);
  let talentNames = [
    ...new Set(existingTalents.map((t) => t.name.split(" - Level")[0])),
  ];
  let talentSelect = createSelect()
    .parent(modalDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px");
  talentNames.forEach((name) => talentSelect.option(name));

  let categoryLabel = createSpan("Category:").parent(modalDiv);
  let categorySelect = createSelect()
    .parent(modalDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px");
  [
    "Physical Combat",
    "Magical",
    "Ranged Combat",
    "Defensive",
    "Utility & Tactical",
  ].forEach((cat) => categorySelect.option(cat));

  let levelsDiv = createDiv().parent(modalDiv).style("margin-bottom", "10px");
  let levelCheckboxes = {};
  let levelDescriptions = {};

  function updateModal() {
    let selectedName = talentSelect.value();
    let talentLevels = existingTalents.filter((t) =>
      t.name.startsWith(selectedName)
    );
    levelsDiv.html("");

    ["I", "II", "III"].forEach((lvl) => {
      let chkDiv = createDiv().parent(levelsDiv);
      let isChecked = talentLevels.some((t) => t.level === lvl);
      let chk = createCheckbox(`Level ${lvl}`, isChecked).parent(chkDiv);
      levelCheckboxes[lvl] = chk;
      let descDiv = createDiv()
        .parent(levelsDiv)
        .style("display", isChecked ? "block" : "none");
      let descLabel = createSpan(`Description ${lvl}:`).parent(descDiv);
      let descInput = createElement("textarea")
        .parent(descDiv)
        .style("width", "100%")
        .style("height", "60px")
        .style("margin-bottom", "5px");
      let existingDesc =
        talentLevels.find((t) => t.level === lvl)?.description || "";
      descInput.value(existingDesc);
      levelDescriptions[lvl] = { div: descDiv, input: descInput };
      chk.changed(() =>
        manageLevelDependencies(levelCheckboxes, levelDescriptions, lvl)
      );
    });

    if (talentLevels.length > 0) categorySelect.value(talentLevels[0].category);
  }

  talentSelect.changed(updateModal);
  if (talentNames.length > 0) updateModal();

  createButton("Add to Character")
    .parent(modalDiv)
    .style("margin", "5px")
    .mousePressed(() => {
      let selectedName = talentSelect.value();
      if (!selectedName) {
        alert("Please select a talent name.");
        return;
      }
      let checkedLevels = Object.keys(levelCheckboxes).filter((lvl) =>
        levelCheckboxes[lvl].checked()
      );
      if (checkedLevels.length === 0) {
        alert("Please select at least one level.");
        return;
      }
      talents = talents.filter((t) => !t.name.startsWith(selectedName));
      let initialLevel = "I";
      let desc = levelDescriptions[initialLevel].input.value();
      if (!desc) {
        alert(`Please provide a description for Level ${initialLevel}.`);
        return;
      }
      let fullName = `${selectedName} - Level ${initialLevel}`;
      talents.push({
        name: fullName,
        level: initialLevel,
        category: categorySelect.value(),
        description: desc,
      });
      updateTalentsTable();
    });

  createButton("Save")
    .parent(modalDiv)
    .style("margin", "5px")
    .mousePressed(() => {
      let selectedName = talentSelect.value();
      let category = categorySelect.value();
      if (!selectedName) {
        alert("Please select a talent name.");
        return;
      }
      let checkedLevels = Object.keys(levelCheckboxes).filter((lvl) =>
        levelCheckboxes[lvl].checked()
      );
      if (checkedLevels.length > 0) {
        let maxLevelIndex = checkedLevels.reduce(
          (max, lvl) =>
            ["I", "II", "III"].indexOf(lvl) > ["I", "II", "III"].indexOf(max)
              ? lvl
              : max,
          "I"
        );
        let requiredLevels = ["I", "II", "III"].slice(
          0,
          ["I", "II", "III"].indexOf(maxLevelIndex) + 1
        );
        for (let lvl of requiredLevels) {
          if (!checkedLevels.includes(lvl)) {
            alert(
              `Please ensure Level ${
                ["I", "II", "III"].indexOf(lvl) + 1
              } is selected and described.`
            );
            return;
          }
          let desc = levelDescriptions[lvl].input.value();
          if (!desc) {
            alert(`Please provide a description for Level ${lvl}.`);
            return;
          }
        }
        for (let lvl in levelCheckboxes) {
          let fullName = `${selectedName} - Level ${lvl}`;
          if (levelCheckboxes[lvl].checked()) {
            let existingIndex = existingTalents.findIndex(
              (t) => t.name === fullName
            );
            if (existingIndex >= 0) {
              existingTalents[existingIndex].description = levelDescriptions[
                lvl
              ].input.value();
              existingTalents[existingIndex].category = category;
            } else {
              existingTalents.push({
                name: fullName,
                level: lvl,
                category,
                description: levelDescriptions[lvl].input.value(),
                maxLevel: maxLevelIndex,
              });
            }
          } else {
            let existingIndex = existingTalents.findIndex(
              (t) => t.name === fullName
            );
            if (existingIndex >= 0) existingTalents.splice(existingIndex, 1);
          }
        }
        updateTalentsTable();
      }
    });

  createButton("Close")
    .parent(modalDiv)
    .style("margin", "5px")
    .mousePressed(() => modalDiv.remove());
}

function showRemoveExistingTalentModal() {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv()
    .style("position", "absolute")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)")
    .style("background", "#fff")
    .style("padding", "20px")
    .style("border", "2px solid #000")
    .style("z-index", "1000")
    .style("width", "300px");

  createElement("h3", "Remove Existing Talent").parent(modalDiv);
  let talentLabel = createSpan("Select Talent to Remove:").parent(modalDiv);
  let talentSelect = createSelect()
    .parent(modalDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px");
  let uniqueNames = [
    ...new Set(existingTalents.map((t) => t.name.split(" - Level")[0])),
  ];
  uniqueNames.forEach((name) => talentSelect.option(name));

  createButton("Remove")
    .parent(modalDiv)
    .style("margin", "5px")
    .mousePressed(() => {
      let selectedName = talentSelect.value();
      existingTalents = existingTalents.filter(
        (t) => !t.name.startsWith(selectedName + " - Level")
      );
      talents = talents.filter(
        (t) => !t.name.startsWith(selectedName + " - Level")
      );
      updateTalentsTable();
      modalDiv.remove();
    });

  createButton("Cancel")
    .parent(modalDiv)
    .style("margin", "5px")
    .mousePressed(() => modalDiv.remove());
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
      // Fixed syntax error
      levelCheckboxes["I"].checked(true);
      levelCheckboxes["II"].checked(true);
      levelDescriptions["I"].div.style("display", "block");
      levelDescriptions["II"].div.style("display", "block");
    }
  }
  levelDescriptions[lvl].div.style(
    "display",
    levelCheckboxes[lvl].checked() ? "block" : "none"
  );
}
function updateTalentsTable() {
  let talentsTable = select("#talentsTable");
  if (!talentsTable) return;
  let rows = talentsTable.elt.getElementsByTagName("tr");
  while (rows.length > 1) rows[1].remove();

  talents.forEach((talent, index) => {
    let row = createElement("tr").parent(talentsTable);
    let arrowCell = createElement("td")
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");
    createButton("↑")
      .parent(arrowCell)
      .style("margin-right", "5px")
      .mousePressed(() => moveTalentUp(index));
    createButton("↓")
      .parent(arrowCell)
      .mousePressed(() => moveTalentDown(index));

    let nameCell = createElement("td", talent.name.split(" - Level")[0])
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("cursor", "pointer")
      .mousePressed(() =>
        showTalentDescription(talent.name, talent.description)
      );

    let levelCell = createElement("td")
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");
    let levelSelect = createSelect().parent(levelCell);
    let baseName = talent.name.split(" - Level")[0];
    let talentLevels = existingTalents.filter((t) =>
      t.name.startsWith(baseName + " - Level")
    );
    let availableLevels = talentLevels.map((t) => t.level);
    availableLevels.forEach((lvl) => levelSelect.option(lvl));
    levelSelect.value(talent.level);
    levelSelect.changed(() => {
      let newLevel = levelSelect.value();
      let newTalentData = existingTalents.find(
        (t) => t.name === `${baseName} - Level ${newLevel}`
      );
      if (newTalentData) {
        talents[index] = { ...newTalentData };
        updateTalentsTable();
      }
    });

    createElement("td", talent.category)
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");
    let actionCell = createElement("td")
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");
    createButton("Remove")
      .parent(actionCell)
      .style("margin", "5px")
      .mousePressed(() => {
        showConfirmationModal(`Remove ${talent.name}?`, () => {
          talents.splice(index, 1);
          updateTalentsTable();
        });
      });
  });
}

// ### Traits UI ###

function createTraitsUI() {
  let traitsContainerDiv = select("#traits");
  if (!traitsContainerDiv) {
    console.error("No #traits div found in HTML!");
    return;
  }
  traitsContainerDiv.html("");

  createElement("h2", "Traits").parent(traitsContainerDiv);
  let traitsDesc = createP(
    "Traits provide static positive and negative effects. A player can have a maximum of 3 traits by default. Adjust the max traits below if needed."
  ).parent(traitsContainerDiv);
  traitsDesc
    .style("font-size", "12px")
    .style("color", "#666")
    .style("margin-top", "5px")
    .style("margin-bottom", "10px");

  let maxTraitsDiv = createDiv()
    .parent(traitsContainerDiv)
    .class("resource-row");
  createSpan("Max Traits: ").parent(maxTraitsDiv);
  let maxTraitsInput = createInput(maxTraits.toString(), "number")
    .parent(maxTraitsDiv)
    .class("resource-input")
    .style("width", "50px")
    .changed(() => {
      let newMax = parseInt(maxTraitsInput.value());
      if (newMax < traits.length) {
        showConfirmationModal(
          `You currently have ${traits.length} traits. Reduce to ${newMax} by removing excess traits first.`,
          () => {},
          true
        );
      } else {
        maxTraits = newMax;
      }
    });

  createButton("Add Custom Trait")
    .parent(traitsContainerDiv)
    .style("margin", "5px")
    .mousePressed(showAddCustomTraitModal);
  createButton("Add / Edit Existing Traits")
    .parent(traitsContainerDiv)
    .style("margin", "5px")
    .mousePressed(showAddEditTraitsModal);
  createButton("Remove Existing Trait")
    .parent(traitsContainerDiv)
    .style("margin", "5px")
    .mousePressed(showRemoveExistingTraitModal);
  createButton("Default Trait List")
    .parent(traitsContainerDiv)
    .style("margin", "5px")
    .mousePressed(() =>
      showConfirmationModal(
        "Reset to default trait list?",
        resetToDefaultTraits
      )
    );

  let traitsTable = createElement("table")
    .parent(traitsContainerDiv)
    .id("traitsTable")
    .style("width", "100%")
    .style("border-collapse", "collapse")
    .style("margin-top", "10px");

  let headerRow = createElement("tr").parent(traitsTable);
  ["Name", "Category", "Actions"].forEach((header) => {
    createElement("th", header)
      .parent(headerRow)
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("background", "#f2f2f2");
  });

  updateTraitsTable();
} // Added closing brace
function showAddCustomTraitModal() {
  if (traits.length >= maxTraits) {
    showConfirmationModal(
      `You have reached the maximum number of traits (${maxTraits}). Remove a trait to add a new one.`,
      () => {},
      true
    );
    return;
  }
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv()
    .style("position", "absolute")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)")
    .style("background", "#fff")
    .style("padding", "20px")
    .style("border", "2px solid #000")
    .style("z-index", "1000")
    .style("width", "300px");

  createElement("h3", "Add Custom Trait").parent(modalDiv);
  let nameInput = createInput("")
    .parent(modalDiv)
    .attribute("placeholder", "Trait Name")
    .style("width", "100%")
    .style("margin-bottom", "10px");

  let categorySelect = createSelect()
    .parent(modalDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px");
  categorySelect.option("Physical");
  categorySelect.option("Combat");
  categorySelect.option("Magical");
  categorySelect.option("Utility");

  let positiveLabel = createSpan("Positive Effect:")
    .parent(modalDiv)
    .style("display", "block");
  let positiveInput = createElement("textarea")
    .parent(modalDiv)
    .style("width", "100%")
    .style("height", "60px")
    .style("margin-bottom", "10px");

  let negativeLabel = createSpan("Negative Effect:")
    .parent(modalDiv)
    .style("display", "block");
  let negativeInput = createElement("textarea")
    .parent(modalDiv)
    .style("width", "100%")
    .style("height", "60px")
    .style("margin-bottom", "10px");

  let saveBtn = createButton("Save")
    .parent(modalDiv)
    .style("margin", "5px")
    .mousePressed(() => {
      let name = nameInput.value();
      let category = categorySelect.value();
      let positive = positiveInput.value();
      let negative = negativeInput.value();
      if (!name || !category || !positive || !negative) {
        alert("Please fill in all fields.");
        return;
      }

      if (traits.some((t) => t.name === name)) {
        alert("This trait is already added!");
        return;
      }

      let newTrait = { name, category, positive, negative };
      existingTraits.push(newTrait);
      traits.push(newTrait);
      updateTraitsTable();
      modalDiv.remove();
    });

  createButton("Cancel")
    .parent(modalDiv)
    .style("margin", "5px")
    .mousePressed(() => modalDiv.remove());
}

function showAddEditTraitsModal() {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv()
    .style("position", "absolute")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)")
    .style("background", "#fff")
    .style("padding", "20px")
    .style("border", "2px solid #000")
    .style("z-index", "1000")
    .style("width", "300px");

  createElement("h3", "Add / Edit Existing Traits").parent(modalDiv);
  let traitSelect = createSelect()
    .parent(modalDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px");
  existingTraits.forEach((trait, index) =>
    traitSelect.option(trait.name, index)
  );

  let nameLabel = createSpan("Trait Name:").parent(modalDiv);
  let nameInput = createInput("")
    .parent(modalDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px");

  let categoryLabel = createSpan("Category:").parent(modalDiv);
  let categorySelect = createSelect()
    .parent(modalDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px");
  categorySelect.option("Physical");
  categorySelect.option("Combat");
  categorySelect.option("Magical");
  categorySelect.option("Utility");

  let positiveLabel = createSpan("Positive Effect:")
    .parent(modalDiv)
    .style("display", "block");
  let positiveInput = createElement("textarea")
    .parent(modalDiv)
    .style("width", "100%")
    .style("height", "60px")
    .style("margin-bottom", "10px");

  let negativeLabel = createSpan("Negative Effect:")
    .parent(modalDiv)
    .style("display", "block");
  let negativeInput = createElement("textarea")
    .parent(modalDiv)
    .style("width", "100%")
    .style("height", "60px")
    .style("margin-bottom", "10px");

  let addToCharacterBtn = createButton("Add to Character")
    .parent(modalDiv)
    .style("margin", "5px");
  let saveBtn = createButton("Save").parent(modalDiv).style("margin", "5px");
  let closeBtn = createButton("Close").parent(modalDiv).style("margin", "5px");

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
      alert(
        `You have reached the maximum number of traits (${maxTraits}). Remove a trait to add a new one.`
      );
      return;
    }
    let index = parseInt(traitSelect.value());
    if (index >= 0) {
      let traitToAdd = { ...existingTraits[index] };
      if (traits.some((t) => t.name === traitToAdd.name)) {
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

      existingTraits[index] = {
        name: newName,
        category: newCategory,
        positive: newPositive,
        negative: newNegative,
      };
      let traitInTableIndex = traits.findIndex((t) => t.name === oldName);
      if (traitInTableIndex >= 0) {
        traits[traitInTableIndex] = { ...existingTraits[index] };
      }

      updateTraitsTable();
      traitSelect.html("");
      existingTraits.forEach((trait, idx) =>
        traitSelect.option(trait.name, idx)
      );
      traitSelect.value(index);
    }
  });

  closeBtn.mousePressed(() => modalDiv.remove());
}

function showRemoveExistingTraitModal() {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv()
    .style("position", "absolute")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)")
    .style("background", "#fff")
    .style("padding", "20px")
    .style("border", "2px solid #000")
    .style("z-index", "1000")
    .style("width", "300px");

  createElement("h3", "Remove Existing Trait").parent(modalDiv);
  let traitLabel = createSpan("Select Trait to Remove:").parent(modalDiv);
  let traitSelect = createSelect()
    .parent(modalDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px");
  let uniqueNames = [...new Set(existingTraits.map((t) => t.name))];
  uniqueNames.forEach((name) => traitSelect.option(name));

  createButton("Remove")
    .parent(modalDiv)
    .style("margin", "5px")
    .mousePressed(() => {
      let selectedName = traitSelect.value();
      showConfirmationModal(`Remove ${selectedName}?`, () => {
        existingTraits = existingTraits.filter((t) => t.name !== selectedName);
        traits = traits.filter((t) => t.name !== selectedName);
        updateTraitsTable();
        modalDiv.remove();
      });
    });

  createButton("Cancel")
    .parent(modalDiv)
    .style("margin", "5px")
    .mousePressed(() => modalDiv.remove());
}

function resetToDefaultTraits() {
  existingTraits = [...defaultTraits];
  traits = [];
  updateTraitsTable();
}

function updateTraitsTable() {
  let traitsTable = select("#traitsTable");
  if (!traitsTable) return;
  let rows = traitsTable.elt.getElementsByTagName("tr");
  while (rows.length > 1) rows[1].remove();

  traits.forEach((trait, index) => {
    let row = createElement("tr").parent(traitsTable);
    let nameCell = createElement("td", trait.name)
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("cursor", "pointer")
      .mousePressed(() =>
        showTraitDescription(trait.name, trait.positive, trait.negative)
      );
    createElement("td", trait.category)
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");
    let actionCell = createElement("td")
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");
    createButton("Remove")
      .parent(actionCell)
      .style("margin", "5px")
      .mousePressed(() => {
        showConfirmationModal(`Remove ${trait.name}?`, () => {
          traits.splice(index, 1);
          updateTraitsTable();
        });
      });
  });
}

// ### Stat and Resource Management ###

function getStatBonuses() {
  let bonuses = {};
  for (let slot in equippedItems) {
    let item = equippedItems[slot];
    if (item && item.statBonus) {
      let stat = item.statBonus.stat;
      let amount = item.statBonus.amount;
      bonuses[stat] = (bonuses[stat] || 0) + amount;
    }
  }
  return bonuses;
}

function getTotalStat(statName) {
  let baseStat;
  switch (statName) {
    case "STR":
      baseStat = stat_str;
      break;
    case "VIT":
      baseStat = stat_vit;
      break;
    case "DEX":
      baseStat = stat_dex;
      break;
    case "MAG":
      baseStat = stat_mag;
      break;
    case "WIL":
      baseStat = stat_wil;
      break;
    case "SPR":
      baseStat = stat_spr;
      break;
    case "LCK":
      baseStat = stat_lck;
      break;
    default:
      return 0;
  }
  let bonuses = getStatBonuses();
  return baseStat + (bonuses[statName] || 0);
}

function updateResourcesBasedOnStats() {
  let totalVIT = getTotalStat("VIT");
  max_hp = 25 + (totalVIT - 1) * 5;
  current_hp = min(current_hp, max_hp);
  maxHpInput.value(max_hp);

  let totalWIL = getTotalStat("WIL");
  max_mp = 10 + (totalWIL - 1) * 5;
  current_mp = min(current_mp, max_mp);
  maxMpInput.value(max_mp);
}

function updateStatBonusesDisplay() {
  let bonuses = getStatBonuses();
  for (let stat in statBonusElements) {
    let bonus = bonuses[stat] || 0;
    if (bonus > 0) {
      statBonusElements[stat].html(` (+${bonus})`);
    } else {
      statBonusElements[stat].html("");
    }
  }
}
