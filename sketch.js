// Global resource variables
let max_hp = 25, current_hp = 25;
let max_mp = 10, current_mp = 10;
let max_stamina = 100, current_stamina = 100;
let max_atb = 100, current_atb = 0;

// Global stat variables – all start at 1
let stat_str = 1, stat_vit = 1, stat_dex = 1, stat_mag = 1, stat_wil = 1, stat_spr = 1, stat_lck = 1;
let level = 1, exp = 1, movement = 1;

// UI elements for Resources tab (existing)
let maxHpInput, setMaxHpButton, maxMpInput, setMaxMpButton;
let maxStaminaInput, setMaxStaminaButton, maxAtbInput, setMaxAtbButton;
let amountInput, positiveButton, negativeButton;
let stmnPlus25Button, stmnMinus25Button, atbMinus50Button, resetButton;
let staminaAtbLink = false, staminaAtbLinkButton;
let modalDiv, cnv;

// Global variable to prevent multiple description modals
let descriptionModal = null;

// For linking stats to attributes:
let statCheckboxes = {};       // Maps stat abbreviation => checkbox element (for linking)
let statLabelElements = {};    // Maps stat abbreviation => label element (to change color)
let attributeCheckboxes = {};  // Maps attribute name => checkbox element (for linking)
let statLinkMapping = {};      // Maps stat abbrev => attribute object (currently linked)
let attributeLinkMapping = {}; // Maps attribute name => stat abbrev (currently linked)

// Description mapping for stats & additional attributes
const statDescriptions = {
  "STR": "Affects melee and ranged phyiscal attacks (1d12 + STR).",
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

// Define additional attributes (now a total of 7) with assigned colors.
const additionalAttributes = [
  { name: "Athletics", desc: "Your ability to exert physical strength and endurance to overcome obstacles. Used for climbing, swimming, jumping, grappling, and feats of raw power.", color: "#e74c3c" },
  { name: "Endurance", desc: "Your capacity to withstand physical strain, pain, and adverse conditions. Used for resisting poisons, disease, exhaustion, and enduring extreme conditions.", color: "#27ae60" },
  { name: "Agility", desc: "Your speed, reflexes, and balance in movement and precision. Used for dodging, acrobatics, stealth, and precise motor control.", color: "#2980b9" },
  { name: "Willpower", desc: "Your mental resilience and determination to resist external influences. Used for resisting mind control, fear effects, psychic attacks, and maintaining focus under pressure.", color: "#8e44ad" },
  { name: "Awareness", desc: "Your ability to observe, sense, and interpret your surroundings. Used for noticing hidden details, tracking, detecting lies, and reacting to environmental threats.", color: "#f39c12" },
  { name: "Influence", desc: "Your ability to manipulate, persuade, or command others through words and body language. This skill is divided into two approaches:\nFriendly Influence - Used for persuasion, bartering, negotiation, and diplomacy to build trust or secure favorable outcomes.\nHostile Influence - Used for intimidation, deception, coercion, and threats to instill fear or manipulate others.", color: "#d35400" },
  { name: "Ingenuity", desc: "Your problem-solving ability and technical expertise in mechanical, electronic, and creative fields. Used for hacking, crafting, repairing technology, analyzing mechanisms and improvising solutions.", color: "#9b59b6" }
];

function setup() {
  // Attach canvas to the Resources tab container
  cnv = createCanvas(600, 400);
  cnv.parent('p5-container');
  textSize(16);
  textAlign(LEFT, TOP);

  // --- Resource Tracker UI (unchanged) ---
  let maxLabel = createP("Max:");
  maxLabel.parent('p5-container');
  maxLabel.position(610, 0);

  // HP control
  maxHpInput = createInput("100", "number");
  maxHpInput.parent('p5-container');
  maxHpInput.position(610, 30);
  maxHpInput.size(50, 20);
  setMaxHpButton = createButton("Set");
  setMaxHpButton.parent('p5-container');
  setMaxHpButton.position(670, 30);
  setMaxHpButton.size(50, 20);
  setMaxHpButton.mousePressed(setMaxHp);

  // MP control
  maxMpInput = createInput("50", "number");
  maxMpInput.parent('p5-container');
  maxMpInput.position(610, 70);
  maxMpInput.size(50, 20);
  setMaxMpButton = createButton("Set");
  setMaxMpButton.parent('p5-container');
  setMaxMpButton.position(670, 70);
  setMaxMpButton.size(50, 20);
  setMaxMpButton.mousePressed(setMaxMp);

  // Stamina control
  maxStaminaInput = createInput("100", "number");
  maxStaminaInput.parent('p5-container');
  maxStaminaInput.position(610, 110);
  maxStaminaInput.size(50, 20);
  setMaxStaminaButton = createButton("Set");
  setMaxStaminaButton.parent('p5-container');
  setMaxStaminaButton.position(670, 110);
  setMaxStaminaButton.size(50, 20);
  setMaxStaminaButton.mousePressed(setMaxStamina);

  // ATB control
  maxAtbInput = createInput("100", "number");
  maxAtbInput.parent('p5-container');
  maxAtbInput.position(610, 150);
  maxAtbInput.size(50, 20);
  setMaxAtbButton = createButton("Set");
  setMaxAtbButton.parent('p5-container');
  setMaxAtbButton.position(670, 150);
  setMaxAtbButton.size(50, 20);
  setMaxAtbButton.mousePressed(setMaxAtb);

  // --- Action UI ---
  negativeButton = createButton("–");
  negativeButton.parent('p5-container');
  negativeButton.position(50, 220);
  negativeButton.size(50, 20);
  negativeButton.mousePressed(() => showModal("negative"));

  amountInput = createInput();
  amountInput.parent('p5-container');
  amountInput.position(106, 220);
  amountInput.size(50, 20);

  positiveButton = createButton("+");
  positiveButton.parent('p5-container');
  positiveButton.position(170, 220);
  positiveButton.size(50, 20);
  positiveButton.mousePressed(() => showModal("positive"));

  // Quick Adjustments
  let quickLabel = createP("Quick Adjustments:");
  quickLabel.parent('p5-container');
  quickLabel.position(50, 260);

  stmnPlus25Button = createButton("STMN +25");
  stmnPlus25Button.parent('p5-container');
  stmnPlus25Button.position(50, 320);
  stmnPlus25Button.size(90, 30);
  stmnPlus25Button.mousePressed(() => { current_stamina = min(current_stamina + 25, max_stamina); });

  stmnMinus25Button = createButton("STMN -25");
  stmnMinus25Button.parent('p5-container');
  stmnMinus25Button.position(150, 320);
  stmnMinus25Button.size(90, 30);
  stmnMinus25Button.mousePressed(() => {
    current_stamina = max(current_stamina - 25, 0);
    if (staminaAtbLink) { current_atb = min(current_atb + 25, max_atb); }
  });

  atbMinus50Button = createButton("ATB -50");
  atbMinus50Button.parent('p5-container');
  atbMinus50Button.position(250, 320);
  atbMinus50Button.size(90, 30);
  atbMinus50Button.mousePressed(() => { current_atb = max(current_atb - 50, 0); });

  resetButton = createButton("Reset");
  resetButton.parent('p5-container');
  resetButton.position(350, 320);
  resetButton.size(90, 30);
  resetButton.mousePressed(reset);

  staminaAtbLinkButton = createButton("Link: OFF");
  staminaAtbLinkButton.parent('p5-container');
  staminaAtbLinkButton.position(450, 320);
  staminaAtbLinkButton.size(90, 30);
  staminaAtbLinkButton.mousePressed(toggleStaminaAtbLink);
  staminaAtbLinkButton.style("background-color", "red");

  let linkDesc = createP("When ON, negative STMN adjustments add to ATB.");
  linkDesc.parent('p5-container');
  linkDesc.position(450, 350);

  cnv.mousePressed(toggleFullscreen);
  cnv.touchStarted(toggleFullscreen);

  // --- Tab Navigation ---
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
  
  // --- Create Stats UI in the Stats tab ---
  createStatsUI();
}

function draw() {
  background(255);
  displayBars();
}

function displayBars() {
  let bar_width = 300, bar_height = 20;
  let x = 50, y_hp = 35, y_mp = 75, y_stamina = 115, y_atb = 155;
  
  // HP bar
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
  text(`HP: ${current_hp}/${max_hp}`, x + bar_width/2, y_hp + bar_height/2);
  
  // MP bar
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
  text(`MP: ${current_mp}/${max_mp}`, x + bar_width/2, y_mp + bar_height/2);
  
  // Stamina bar
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
  text(`STMN: ${current_stamina}/${max_stamina}`, x + bar_width/2, y_stamina + bar_height/2);
  
  // ATB bar
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
  text(`ATB: ${current_atb}/${max_atb}`, x + bar_width/2, y_atb + bar_height/2);
  
  // Title for the resource tracker
  textAlign(LEFT, TOP);
  textStyle(NORMAL);
  fill(0);
  text("FF7 TTRPG Resource Tracker", 50, 10);
}

// --- Update Functions for Resource UI ---
function setMaxHp() {
  let value = parseInt(maxHpInput.value());
  if (!isNaN(value) && value > 0) { max_hp = value; current_hp = value; }
}
function setMaxMp() {
  let value = parseInt(maxMpInput.value());
  if (!isNaN(value) && value > 0) { max_mp = value; current_mp = value; }
}
function setMaxStamina() {
  let value = parseInt(maxStaminaInput.value());
  if (!isNaN(value) && value > 0) { max_stamina = value; current_stamina = value; }
}
function setMaxAtb() {
  let value = parseInt(maxAtbInput.value());
  if (!isNaN(value) && value > 0) { max_atb = value; current_atb = value; }
}

// --- Modal Pop-Up for Resource Selection (unchanged) ---
function showModal(action) {
  let amount = parseInt(amountInput.value());
  if (isNaN(amount) || amount <= 0) return;
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
  let title = createP("Select resource to update:");
  title.parent(modalDiv);
  ["HP", "MP", "Stamina", "ATB"].forEach(res => {
    let btn = createButton(res);
    btn.parent(modalDiv);
    btn.style("margin", "5px");
    btn.mousePressed(() => {
      applyResourceChange(action, res.toLowerCase(), amount);
      modalDiv.remove();
      modalDiv = null;
    });
  });
  let cancelBtn = createButton("Cancel");
  cancelBtn.parent(modalDiv);
  cancelBtn.style("margin", "5px");
  cancelBtn.mousePressed(() => { modalDiv.remove(); modalDiv = null; });
}

function applyResourceChange(action, resource, amount) {
  if (action === "positive") {
    if (resource === "hp") current_hp = min(current_hp + amount, max_hp);
    else if (resource === "mp") current_mp = min(current_mp + amount, max_mp);
    else if (resource === "stamina") current_stamina = min(current_stamina + amount, max_stamina);
    else if (resource === "atb") current_atb = min(current_atb + amount, max_atb);
  } else if (action === "negative") {
    if (resource === "hp") current_hp = max(current_hp - amount, 0);
    else if (resource === "mp") current_mp = max(current_mp - amount, 0);
    else if (resource === "stamina") {
      current_stamina = max(current_stamina - amount, 0);
      if (staminaAtbLink) current_atb = min(current_atb + amount, max_atb);
    }
    else if (resource === "atb") current_atb = max(current_atb - amount, 0);
  }
}

// --- Toggle Stamina X ATB Link ---
function toggleStaminaAtbLink() {
  staminaAtbLink = !staminaAtbLink;
  if (staminaAtbLink) {
    staminaAtbLinkButton.html("Link: ON");
    staminaAtbLinkButton.style("background-color", "green");
  } else {
    staminaAtbLinkButton.html("Link: OFF");
    staminaAtbLinkButton.style("background-color", "red");
  }
}

// --- Reset Function ---
function reset() {
  current_hp = max_hp;
  current_mp = max_mp;
  current_stamina = max_stamina;
  current_atb = 0;
}

// --- Fullscreen Toggle ---
function toggleFullscreen() {
  fullscreen(!fullscreen());
}

// --- Stats UI Creation ---
function createStatsUI() {
  let statsContainer = select("#stats");
  statsContainer.html(""); // Clear default content
  createElement("h2", "Stats").parent(statsContainer);
  
  // Extra fields: Level, EXP, Movement (NOT linkable)
  createStatInput("Level", "Level", level, statsContainer, (val) => { level = val; }, false);
  createStatInput("EXP", "EXP", exp, statsContainer, (val) => { exp = val; }, false);
  createStatInput("Movement", "Movement", movement, statsContainer, (val) => { movement = val; }, false);
  
  // Seven main stats (constrained between 1 and 99, linkable)
  createStatInput("STR", "Strength", stat_str, statsContainer, (val) => { stat_str = val; }, true);
  createStatInput("VIT", "Vitality", stat_vit, statsContainer, (val) => { stat_vit = val; updateResourcesBasedOnStats(); }, true);
  createStatInput("DEX", "Dexterity", stat_dex, statsContainer, (val) => { stat_dex = val; }, true);
  createStatInput("MAG", "Magic", stat_mag, statsContainer, (val) => { stat_mag = val; }, true);
  createStatInput("WIL", "Willpower", stat_wil, statsContainer, (val) => { stat_wil = val; updateResourcesBasedOnStats(); }, true);
  createStatInput("SPR", "Spirit", stat_spr, statsContainer, (val) => { stat_spr = val; }, true);
  createStatInput("LCK", "Luck", stat_lck, statsContainer, (val) => { stat_lck = val; }, true);
  
  // Create Additional Attributes UI on the right side, with block title "Skills"
  createAdditionalAttributesUI();
}

// Creates a stat input with a clickable label and, if linkable, a "Link" checkbox.
function createStatInput(abbrev, name, initialValue, container, callback, linkable) {
  let div = createDiv();
  div.parent(container);
  div.style("margin", "5px");
  
  let label = createSpan(name + " (" + abbrev + "): ");
  label.parent(div);
  label.style("cursor", "pointer");
  label.mouseClicked(() => {
    if (linkable && statCheckboxes[abbrev] && !statCheckboxes[abbrev].checked()) {
      if (!descriptionModal) showStatDescription(name + " (" + abbrev + ")", statDescriptions[abbrev] || "No description available.");
    } else if (!linkable) {
      if (!descriptionModal) showStatDescription(name + " (" + abbrev + ")", statDescriptions[abbrev] || "No description available.");
    }
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
  });
  
  // Only add a linking checkbox if linkable.
  if (linkable) {
    let chk = createCheckbox("Link", false);
    chk.parent(div);
    chk.changed(tryLinking);
    statCheckboxes[abbrev] = chk;
  }
}

// Creates the Additional Attributes UI on the right side.
function createAdditionalAttributesUI() {
  let statsContainer = select("#stats");
  let addContainer = createDiv();
  addContainer.parent(statsContainer);
  addContainer.style("border", "1px solid #ccc");
  addContainer.style("padding", "10px");
  addContainer.style("margin-top", "20px");
  addContainer.style("display", "inline-block");
  addContainer.style("vertical-align", "top");
  addContainer.style("margin-left", "20px");
  createElement("h3", "Skills").parent(addContainer);
  
  additionalAttributes.forEach(attr => {
    let attrDiv = createDiv();
    attrDiv.parent(addContainer);
    
    let btn = createButton(attr.name);
    btn.parent(attrDiv);
    btn.style("background-color", attr.color);
    btn.style("color", "#fff");
    btn.mousePressed(() => { showStatDescription(attr.name, attr.desc); });
    
    let attrChk = createCheckbox("Link", false);
    attrChk.parent(attrDiv);
    attrChk.changed(tryLinking);
    attributeCheckboxes[attr.name] = attrChk;
  });
}

// Checks if exactly one stat and one attribute are selected; if so, links them.
function tryLinking() {
  let selectedStat = null;
  for (let abbrev in statCheckboxes) {
    if (statCheckboxes[abbrev].checked()) {
      selectedStat = abbrev;
      break;
    }
  }
  let selectedAttr = null;
  for (let attrName in attributeCheckboxes) {
    if (attributeCheckboxes[attrName].checked()) {
      selectedAttr = attrName;
      break;
    }
  }
  if (!selectedStat || !selectedAttr) return;
  
  // If the stat already has a linked attribute, remove that link.
  if (statLinkMapping[selectedStat]) {
    let oldAttr = statLinkMapping[selectedStat];
    statLabelElements[selectedStat].style("color", "black");
    if (attributeLinkMapping[oldAttr.name] === selectedStat) {
      attributeCheckboxes[oldAttr.name].checked(false);
    }
    delete statLinkMapping[selectedStat];
    delete attributeLinkMapping[oldAttr.name];
  }
  // If the attribute is already linked to a different stat, remove that link.
  if (attributeLinkMapping[selectedAttr] && attributeLinkMapping[selectedAttr] !== selectedStat) {
    let oldStat = attributeLinkMapping[selectedAttr];
    statLabelElements[oldStat].style("color", "black");
    statCheckboxes[oldStat].checked(false);
    delete statLinkMapping[oldStat];
    delete attributeLinkMapping[selectedAttr];
  }
  // Find the attribute object.
  let attrObj = additionalAttributes.find(a => a.name === selectedAttr);
  if (!attrObj) return;
  
  // Link: set stat label color to attribute's color.
  statLabelElements[selectedStat].style("color", attrObj.color);
  statLinkMapping[selectedStat] = attrObj;
  attributeLinkMapping[selectedAttr] = selectedStat;
  
  // Clear the checkboxes.
  statCheckboxes[selectedStat].checked(false);
  attributeCheckboxes[selectedAttr].checked(false);
}

// Creates a modal for stat/attribute description; only one allowed at a time.
function showStatDescription(statName, description) {
  if (descriptionModal) return;
  descriptionModal = createDiv();
  descriptionModal.style("position", "absolute");
  descriptionModal.style("top", "50%");
  descriptionModal.style("left", "50%");
  descriptionModal.style("transform", "translate(-50%, -50%)");
  descriptionModal.style("background", "#fff");
  descriptionModal.style("padding", "20px");
  descriptionModal.style("border", "2px solid #000");
  descriptionModal.style("z-index", "1000");
  let title = createElement("h3", statName);
  title.parent(descriptionModal);
  let descText = createP(description);
  descText.parent(descriptionModal);
  let closeBtn = createButton("Close");
  closeBtn.parent(descriptionModal);
  closeBtn.mousePressed(() => { descriptionModal.remove(); descriptionModal = null; });
}

// Update Resources (HP and MP) based on Vitality and Willpower.
// Starting values: 25 HP and 10 MP at 1 point; each additional point adds +5.
function updateResourcesBasedOnStats() {
  let newMaxHp = 25 + (stat_vit - 1) * 5;
  max_hp = newMaxHp;
  if (current_hp > max_hp) current_hp = max_hp;
  let newMaxMp = 10 + (stat_wil - 1) * 5;
  max_mp = newMaxMp;
  if (current_mp > max_mp) current_mp = max_mp;
}

