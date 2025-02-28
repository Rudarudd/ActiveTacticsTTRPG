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
let amountInput, positiveButton, negativeButton;
let stmnPlus25Button, stmnMinus25Button, atbMinus50Button, resetButton;
let staminaAtbLink = false, staminaAtbLinkButton;
let modalDiv, cnv;

// Variables for dragging resource UI container
let resourceUIDragging = false;
let resourceUIStartX = 0, resourceUIStartY = 0, resourceUIMouseStartX = 0, resourceUIMouseStartY = 0;
let resourceUILocked = false;

// Variables for dragging Skills container
let skillsDragging = false;
let skillsStartX = 0, skillsStartY = 0, skillsMouseStartX = 0, skillsMouseStartY = 0;
let skillsLocked = false;

// Global container variables (set in setup)
let resourceUIContainer;
let skillsContainer;

// For description modals
let descriptionModal = null;

// For linking stats to attributes:
let statCheckboxes = {};
let statLabelElements = {};
let attributeCheckboxes = {};
let statLinkMapping = {};
let attributeLinkMapping = {};

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
  { name: "Athletics", desc: "Your ability to exert physical strength and endurance to overcome obstacles. Used for climbing, swimming, jumping, grappling, and feats of raw power.", color: "#C0392B" },
  { name: "Endurance", desc: "Your capacity to withstand physical strain, pain, and adverse conditions. Used for resisting poisons, disease, exhaustion, and enduring extreme conditions.", color: "#27AE60" },
  { name: "Agility", desc: "Your speed, reflexes, and balance in movement and precision. Used for dodging, acrobatics, stealth, and precise motor control.", color: "#2980B9" },
  { name: "Willpower", desc: "Your mental resilience and determination to resist external influences. Used for resisting mind control, fear effects, psychic attacks, and maintaining focus under pressure.", color: "#FF69B4" },
  { name: "Awareness", desc: "Your ability to observe, sense, and interpret your surroundings. Used for noticing hidden details, tracking, detecting lies, and reacting to environmental threats.", color: "#F39C12" },
  { name: "Influence", desc: "Your ability to manipulate, persuade, or command others through words and body language. Friendly Influence is used for persuasion, bartering, and diplomacy; Hostile Influence is used for intimidation and coercion.", color: "#8E44AD" },
  { name: "Ingenuity", desc: "Your problem-solving ability and technical expertise in mechanical, electronic, and creative fields. Used for hacking, crafting, repairing technology, and improvising solutions.", color: "#2C3E50" }
];

function getDragX() {
  return touches.length > 0 ? touches[0].x : mouseX;
}

function getDragY() {
  return touches.length > 0 ? touches[0].y : mouseY;
}

function setup() {
  let container = select("#p5-container");
  container.html("");
  
  let canvasContainer = createDiv();
  canvasContainer.parent(container);
  canvasContainer.id("canvasContainer");
  canvasContainer.style("position", "relative");
  
  resourceUIContainer = createDiv();
  resourceUIContainer.parent(canvasContainer);
  resourceUIContainer.id("resourceUIContainer");
  resourceUIContainer.mousePressed(startDragResourceUI);
  resourceUIContainer.mouseReleased(stopDragResourceUI);
  resourceUIContainer.touchStarted(startDragResourceUI);
  resourceUIContainer.touchEnded(stopDragResourceUI);
  
  let contentDiv = select(".content");
  let contentWidth = contentDiv.elt.offsetWidth - 20;
  let contentHeight = contentDiv.elt.offsetHeight - 20;
  let canvasWidth = min(contentWidth, 600);
  let canvasHeight = min(contentHeight, windowHeight * 0.4, canvasWidth * 0.75);
  cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent(canvasContainer);
  textSize(16);
  textAlign(LEFT, TOP);
  
  createResourceUI();
  
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
  
  createStatsUI();
}

function windowResized() {
  let contentDiv = select(".content");
  let contentWidth = contentDiv.elt.offsetWidth - 20;
  let contentHeight = contentDiv.elt.offsetHeight - 20;
  let canvasWidth = min(contentWidth, 600);
  let canvasHeight = min(contentHeight, windowHeight * 0.4, canvasWidth * 0.75);
  resizeCanvas(canvasWidth, canvasHeight);
}

function draw() {
  background(255);
  displayBars();
}

function displayBars() {
  let bar_width = width * 0.6;
  let bar_height = 20;
  let x = width * 0.1;
  let y_hp = 25, y_mp = 55, y_stamina = 85, y_atb = 115;
  
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
  text(`HP: ${current_hp}/${max_hp}`, x + bar_width / 2, y_hp + bar_height / 2);
  
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
  text(`MP: ${current_mp}/${max_mp}`, x + bar_width / 2, y_mp + bar_height / 2);
  
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
  text(`STMN: ${current_stamina}/${max_stamina}`, x + bar_width / 2, y_stamina + bar_height / 2);
  
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
  text(`ATB: ${current_atb}/${max_atb}`, x + bar_width / 2, y_atb + bar_height / 2);
  
  textAlign(LEFT, TOP);
  textStyle(NORMAL);
  fill(0);
  text("FF7 TTRPG Resource Tracker", width * 0.1, 10);
}

function createResourceUI() {
  let rUI = select("#resourceUIContainer");
  rUI.html("");
  
  let row = createDiv();
  row.parent(rUI);
  row.class("resource-row");
  let lockCheckbox = createCheckbox("Lock", false);
  lockCheckbox.parent(row);
  lockCheckbox.style("margin-left", "auto");
  lockCheckbox.changed(() => { 
    resourceUILocked = lockCheckbox.checked(); 
    if (resourceUILocked) {
      resourceUIDragging = false;
    }
  });
  
  row = createDiv();
  row.parent(rUI);
  row.class("resource-row");
  let maxLabel = createSpan("Max:");
  maxLabel.parent(row);
  maxLabel.class("resource-label");
  
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
  
  row = createDiv();
  row.parent(rUI);
  row.class("resource-row");
  let quickLabel = createSpan("Quick Adjustments:");
  quickLabel.parent(row);
  quickLabel.class("resource-label");
  
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
  resetButton.mousePressed(resetResources);
  
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

function resetResources() {
  current_hp = max_hp;
  current_mp = max_mp;
  current_stamina = max_stamina;
  current_atb = 0;
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

function createStatsUI() {
  let statsContainer = select("#stats");
  statsContainer.html("");
  createElement("h2", "Stats").parent(statsContainer);
  
  createStatInput("Level", "Level", level, statsContainer, (val) => { level = val; }, false);
  createStatInput("EXP", "EXP", exp, statsContainer, (val) => { exp = val; }, false);
  createStatInput("Movement", "Movement", movement, statsContainer, (val) => { movement = val; }, false);
  
  createStatInput("STR", "Strength", stat_str, statsContainer, (val) => { stat_str = val; }, true);
  createStatInput("VIT", "Vitality", stat_vit, statsContainer, (val) => { stat_vit = val; updateResourcesBasedOnStats(); }, true);
  createStatInput("DEX", "Dexterity", stat_dex, statsContainer, (val) => { stat_dex = val; }, true);
  createStatInput("MAG", "Magic", stat_mag, statsContainer, (val) => { stat_mag = val; }, true);
  createStatInput("WIL", "Willpower", stat_wil, statsContainer, (val) => { stat_wil = val; updateResourcesBasedOnStats(); }, true);
  createStatInput("SPR", "Spirit", stat_spr, statsContainer, (val) => { stat_spr = val; }, true);
  createStatInput("LCK", "Luck", stat_lck, statsContainer, (val) => { stat_lck = val; }, true);
  
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
      if (!descriptionModal) 
        showStatDescription(name + " (" + abbrev + ")", statDescriptions[abbrev] || "No description available.");
    } else if (!linkable) {
      if (!descriptionModal) 
        showStatDescription(name + " (" + abbrev + ")", statDescriptions[abbrev] || "No description available.");
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
  addContainer.id("skillsContainer");
  addContainer.mousePressed(startDragSkills);
  addContainer.mouseReleased(stopDragSkills);
  addContainer.touchStarted(startDragSkills);
  addContainer.touchEnded(stopDragSkills);
  
  addContainer.style("border", "1px solid #ccc");
  addContainer.style("padding", "5px");
  addContainer.style("margin-top", "20px");
  addContainer.style("width", "180px");
  createElement("h3", "Skills").parent(addContainer);
  
  let lockRow = createDiv();
  lockRow.parent(addContainer);
  lockRow.style("text-align", "right");
  let skillsLockCheckbox = createCheckbox("Lock", false);
  skillsLockCheckbox.parent(lockRow);
  skillsLockCheckbox.changed(() => { skillsLocked = skillsLockCheckbox.checked(); });
  
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

function startDragResourceUI() {
  if (resourceUILocked) return;
  if (touches.length > 0 && touches.length < 2) return;
  resourceUIDragging = true;
  let leftStr = resourceUIContainer.style("left");
  let topStr = resourceUIContainer.style("top");
  resourceUIStartX = leftStr ? parseInt(leftStr) : 10;
  resourceUIStartY = topStr ? parseInt(topStr) : 10;
  resourceUIMouseStartX = getDragX();
  resourceUIMouseStartY = getDragY();
}

function stopDragResourceUI() {
  resourceUIDragging = false;
}

function startDragSkills() {
  if (skillsLocked) return;
  if (touches.length > 0 && touches.length < 2) return;
  skillsDragging = true;
  skillsContainer = select("#skillsContainer");
  let leftStr = skillsContainer.style("left");
  let topStr = skillsContainer.style("top");
  skillsStartX = leftStr ? parseInt(leftStr) : 10;
  skillsStartY = topStr ? parseInt(topStr) : 10;
  skillsMouseStartX = getDragX();
  skillsMouseStartY = getDragY();
}

function stopDragSkills() {
  skillsDragging = false;
}

function mouseDragged() {
  let currentX = getDragX();
  let currentY = getDragY();
  let contentDiv = select(".content");
  let contentRect = contentDiv.elt.getBoundingClientRect();
  
  if (resourceUIDragging && !resourceUILocked) {
    let newX = resourceUIStartX + (currentX - resourceUIMouseStartX);
    let newY = resourceUIStartY + (currentY - resourceUIMouseStartY);
    let boxWidth = resourceUIContainer.elt.offsetWidth;
    let boxHeight = resourceUIContainer.elt.offsetHeight;
    newX = constrain(newX, contentRect.left, contentRect.right - boxWidth);
    newY = constrain(newY, contentRect.top, contentRect.bottom - boxHeight);
    resourceUIContainer.style("left", newX + "px");
    resourceUIContainer.style("top", newY + "px");
  }
  
  if (skillsDragging && !skillsLocked) {
    let newX = skillsStartX + (currentX - skillsMouseStartX);
    let newY = skillsStartY + (currentY - skillsMouseStartY);
    let boxWidth = skillsContainer.elt.offsetWidth;
    let boxHeight = skillsContainer.elt.offsetHeight;
    newX = constrain(newX, contentRect.left, contentRect.right - boxWidth);
    newY = constrain(newY, contentRect.top, contentRect.bottom - boxHeight);
    skillsContainer.style("left", newX + "px");
    skillsContainer.style("top", newY + "px");
  }
}

function touchMoved() {
  if (resourceUIDragging || skillsDragging) {
    mouseDragged();
    return false;
  }
  return true;
}
