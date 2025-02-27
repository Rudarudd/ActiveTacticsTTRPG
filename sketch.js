// Global resource variables – starting with 25 HP and 10 MP
let max_hp = 25, current_hp = 25;
let max_mp = 10, current_mp = 10;
let max_stamina = 100, current_stamina = 100;
let max_atb = 100, current_atb = 0;

// Global stat variables – all start at 1
let stat_str = 1, stat_vit = 1, stat_dex = 1, stat_mag = 1, stat_wil = 1, stat_spr = 1, stat_lck = 1;
let level = 1, exp = 1, movement = 1;

// UI elements for Resources will be created in createResourceUI()
let maxHpInput, setMaxHpButton, maxMpInput, setMaxMpButton;
let maxStaminaInput, setMaxStaminaButton, maxAtbInput, setMaxAtbButton;
let amountInput, positiveButton, negativeButton;
let stmnPlus25Button, stmnMinus25Button, atbMinus50Button, resetButton;
let staminaAtbLink = false, staminaAtbLinkButton;
let modalDiv, cnv;

// For description modals
let descriptionModal = null;

// For linking stats to attributes:
let statCheckboxes = {};       // Maps stat abbreviation => checkbox element
let statLabelElements = {};    // Maps stat abbreviation => label element (for color change)
let attributeCheckboxes = {};  // Maps attribute name => checkbox element
let statLinkMapping = {};      // Maps stat abbrev => attribute object (linked)
let attributeLinkMapping = {}; // Maps attribute name => stat abbrev (linked)

const statDescriptions = {
  "STR": "Affects physical attack rolls (melee & ranged).",
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
  { name: "Athletics", desc: "Your ability to exert physical strength and endurance to overcome obstacles. Used for climbing, swimming, jumping, grappling, and feats of raw power.", color: "#e74c3c" },
  { name: "Endurance", desc: "Your capacity to withstand physical strain, pain, and adverse conditions. Used for resisting poisons, disease, exhaustion, and enduring extreme conditions.", color: "#27ae60" },
  { name: "Agility", desc: "Your speed, reflexes, and balance in movement and precision. Used for dodging, acrobatics, stealth, and precise motor control.", color: "#2980b9" },
  { name: "Willpower", desc: "Your mental resilience and determination to resist external influences. Used for resisting mind control, fear effects, psychic attacks, and maintaining focus under pressure.", color: "#8e44ad" },
  { name: "Awareness", desc: "Your ability to observe, sense, and interpret your surroundings. Used for noticing hidden details, tracking, detecting lies, and reacting to environmental threats.", color: "#f39c12" },
  { name: "Influence", desc: "Your ability to manipulate, persuade, or command others through words and body language. Friendly Influence is used for persuasion, bartering, and diplomacy; Hostile Influence is used for intimidation and coercion.", color: "#d35400" },
  { name: "Ingenuity", desc: "Your problem-solving ability and technical expertise in mechanical, electronic, and creative fields. Used for hacking, crafting, repairing technology, and improvising solutions.", color: "#9b59b6" }
];

function setup() {
  // Create two sub-containers inside #p5-container: one for the canvas, one for the resource UI.
  let container = select("#p5-container");
  container.html(""); // clear
  let canvasContainer = createDiv();
  canvasContainer.parent(container);
  canvasContainer.id("canvasContainer");
  let resourceUIContainer = createDiv();
  resourceUIContainer.parent(container);
  resourceUIContainer.id("resourceUIContainer");
  
  // Create canvas responsive to window size and attach to canvasContainer.
  cnv = createCanvas(min(600, windowWidth - 40), 400);
  cnv.parent(canvasContainer);
  textSize(16);
  textAlign(LEFT, TOP);
  
  // Build Resource Tracker UI using our dedicated function.
  createResourceUI();
  
  // --- Tab Navigation (unchanged) ---
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
  
  // Create Stats UI in the "stats" tab.
  createStatsUI();
}

function windowResized() {
  let newW = min(600, windowWidth - 40);
  resizeCanvas(newW, 400);
}

function draw() {
  background(255);
  displayBars();
}

function displayBars() {
  let bar_width = 300, bar_height = 20;
  let x = 50, y_hp = 35, y_mp = 75, y_stamina = 115, y_atb = 155;
  
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
  
  textAlign(LEFT, TOP);
  textStyle(NORMAL);
  fill(0);
  text("FF7 TTRPG Resource Tracker", 50, 10);
}

// Resource UI builder: creates rows of elements to mimic original layout.
function createResourceUI() {
  let rUI = select("#resourceUIContainer");
  rUI.html(""); // clear container
  
  // Row 1: "Max:" label
  let row = createDiv();
  row.parent(rUI);
  row.class("resource-row");
  let maxLabel = createSpan("Max:");
  maxLabel.parent(row);
  maxLabel.class("resource-label");
  
  // Row 2: HP controls
  row = createDiv();
  row.parent(rUI);
  row.class("resource-row");
  let hpLabel = createSpan("HP:");
  hpLabel.parent(row);
  hpLabel.class("resource-label");
  maxHpInput = createInput("25", "number");
  maxHpInput.parent(row);
  maxHpInput.class("resource-input");
  setMaxHpButton = createButton("Set");
  setMaxHpButton.parent(row);
  setMaxHpButton.class("resource-button");
  setMaxHpButton.mousePressed(setMaxHp);
  
  // Row 3: MP controls
  row = createDiv();
  row.parent(rUI);
  row.class("resource-row");
  let mpLabel = createSpan("MP:");
  mpLabel.parent(row);
  mpLabel.class("resource-label");
  maxMpInput = createInput("10", "number");
  maxMpInput.parent(row);
  maxMpInput.class("resource-input");
  setMaxMpButton = createButton("Set");
  setMaxMpButton.parent(row);
  setMaxMpButton.class("resource-button");
  setMaxMpButton.mousePressed(setMaxMp);
  
  // Row 4: Stamina controls
  row = createDiv();
  row.parent(rUI);
  row.class("resource-row");
  let stLabel = createSpan("Stamina:");
  stLabel.parent(row);
  stLabel.class("resource-label");
  maxStaminaInput = createInput("100", "number");
  maxStaminaInput.parent(row);
  maxStaminaInput.class("resource-input");
  setMaxStaminaButton = createButton("Set");
  setMaxStaminaButton.parent(row);
  setMaxStaminaButton.class("resource-button");
  setMaxStaminaButton.mousePressed(setMaxStamina);
  
  // Row 5: ATB controls
  row = createDiv();
  row.parent(rUI);
  row.class("resource-row");
  let atbLabel = createSpan("ATB:");
  atbLabel.parent(row);
  atbLabel.class("resource-label");
  maxAtbInput = createInput("100", "number");
  maxAtbInput.parent(row);
  maxAtbInput.class("resource-input");
  setMaxAtbButton = createButton("Set");
  setMaxAtbButton.parent(row);
  setMaxAtbButton.class("resource-button");
  setMaxAtbButton.mousePressed(setMaxAtb);
  
  // Row 6: Action row – negative button, amount, positive button
  row = createDiv();
  row.parent(rUI);
  row.class("resource-row");
  negativeButton = createButton("–");
  negativeButton.parent(row);
  negativeButton.class("resource-button");
  negativeButton.mousePressed(() => showModal("negative"));
  amountInput = createInput();
  amountInput.parent(row);
  amountInput.class("resource-input");
  positiveButton = createButton("+");
  positiveButton.parent(row);
  positiveButton.class("resource-button");
  positiveButton.mousePressed(() => showModal("positive"));
  
  // Row 7: Quick Adjustments label
  row = createDiv();
  row.parent(rUI);
  row.class("resource-row");
  let quickAdjLabel = createSpan("Quick Adjustments:");
  quickAdjLabel.parent(row);
  quickAdjLabel.class("resource-label");
  
  // Row 8: Quick adjust buttons
  row = createDiv();
  row.parent(rUI);
  row.class("resource-row");
  stmnPlus25Button = createButton("STMN +25");
  stmnPlus25Button.parent(row);
  stmnPlus25Button.class("resource-button");
  stmnPlus25Button.mousePressed(() => { current_stamina = min(current_stamina + 25, max_stamina); });
  stmnMinus25Button = createButton("STMN -25");
  stmnMinus25Button.parent(row);
  stmnMinus25Button.class("resource-button");
  stmnMinus25Button.mousePressed(() => {
    current_stamina = max(current_stamina - 25, 0);
    if (staminaAtbLink) { current_atb = min(current_atb + 25, max_atb); }
  });
  atbMinus50Button = createButton("ATB -50");
  atbMinus50Button.parent(row);
  atbMinus50Button.class("resource-button");
  atbMinus50Button.mousePressed(() => { current_atb = max(current_atb - 50, 0); });
  resetButton = createButton("Reset");
  resetButton.parent(row);
  resetButton.class("resource-button");
  resetButton.mousePressed(reset);
  
  // Row 9: Link toggle and description
  row = createDiv();
  row.parent(rUI);
  row.class("resource-row");
  staminaAtbLinkButton = createButton("Link: OFF");
  staminaAtbLinkButton.parent(row);
  staminaAtbLinkButton.class("resource-button");
  staminaAtbLinkButton.mousePressed(toggleStaminaAtbLink);
  staminaAtbLinkButton.style("background-color", "red");
  let linkDesc = createSpan("When ON, negative STMN adjustments add to ATB.");
  linkDesc.parent(row);
  linkDesc.class("resource-label");
}

// Resource update functions
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

function reset() {
  current_hp = max_hp;
  current_mp = max_mp;
  current_stamina = max_stamina;
  current_atb = 0;
}

// --- Stats UI Creation ---
function createStatsUI() {
  let statsContainer = select("#stats");
  statsContainer.html("");
  createElement("h2", "Stats").parent(statsContainer);
  
  // Extra fields: Level, EXP, Movement (not linkable)
  createStatInput("Level", "Level", level, statsContainer, (val) => { level = val; }, false);
  createStatInput("EXP", "EXP", exp, statsContainer, (val) => { exp = val; }, false);
  createStatInput("Movement", "Movement", movement, statsContainer, (val) => { movement = val; }, false);
  
  // Main stats (linkable)
  createStatInput("STR", "Strength", stat_str, statsContainer, (val) => { stat_str = val; }, true);
  createStatInput("VIT", "Vitality", stat_vit, statsContainer, (val) => { stat_vit = val; updateResourcesBasedOnStats(); }, true);
  createStatInput("DEX", "Dexterity", stat_dex, statsContainer, (val) => { stat_dex = val; }, true);
  createStatInput("MAG", "Magic", stat_mag, statsContainer, (val) => { stat_mag = val; }, true);
  createStatInput("WIL", "Willpower", stat_wil, statsContainer, (val) => { stat_wil = val; updateResourcesBasedOnStats(); }, true);
  createStatInput("SPR", "Spirit", stat_spr, statsContainer, (val) => { stat_spr = val; }, true);
  createStatInput("LCK", "Luck", stat_lck, statsContainer, (val) => { stat_lck = val; }, true);
  
  // Additional Attributes UI titled "Skills"
  createAdditionalAttributesUI();
}

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
  
  if (linkable) {
    let chk = createCheckbox("Link", false);
    chk.parent(div);
    chk.changed(tryLinking);
    statCheckboxes[abbrev] = chk;
  }
}

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
  
  if (statLinkMapping[selectedStat]) {
    let oldAttr = statLinkMapping[selectedStat];
    statLabelElements[selectedStat].style("color", "black");
    if (attributeLinkMapping[oldAttr.name] === selectedStat) {
      attributeCheckboxes[oldAttr.name].checked(false);
    }
    delete statLinkMapping[selectedStat];
    delete attributeLinkMapping[oldAttr.name];
  }
  if (attributeLinkMapping[selectedAttr] && attributeLinkMapping[selectedAttr] !== selectedStat) {
    let oldStat = attributeLinkMapping[selectedAttr];
    statLabelElements[oldStat].style("color", "black");
    statCheckboxes[oldStat].checked(false);
    delete statLinkMapping[oldStat];
    delete attributeLinkMapping[selectedAttr];
  }
  let attrObj = additionalAttributes.find(a => a.name === selectedAttr);
  if (!attrObj) return;
  
  statLabelElements[selectedStat].style("color", attrObj.color);
  statLinkMapping[selectedStat] = attrObj;
  attributeLinkMapping[selectedAttr] = selectedStat;
  
  statCheckboxes[selectedStat].checked(false);
  attributeCheckboxes[selectedAttr].checked(false);
}

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

function updateResourcesBasedOnStats() {
  let newMaxHp = 25 + (stat_vit - 1) * 5;
  max_hp = newMaxHp;
  if (current_hp > max_hp) current_hp = max_hp;
  let newMaxMp = 10 + (stat_wil - 1) * 5;
  max_mp = newMaxMp;
  if (current_mp > max_mp) current_mp = max_mp;
}
