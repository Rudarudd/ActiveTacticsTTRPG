// Clear localStorage at startup (remove after testing)
localStorage.removeItem('inventory');
localStorage.removeItem('equippedItems');
// Global resource variables – starting with 25 HP and 10 MP
let max_hp = 25,
  current_hp = 25;
let max_mp = 10,
  current_mp = 10;
let max_stamina = 100,
  current_stamina = 100;
let max_ATG = 100,
  current_ATG = 0;

// Global stat variables – all start at 1
let lockToLevel = false;
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
let stATGonusElements = {};

// Player's starting inventory (populated initially)
let inventory = [];

// Add this near the top of your script with other constants
let inventoryCategories = ["Equipment", "Consumables", "Materials", "Crystals", "Miscellaneous"];

let categoryStates = {
};

// Master list of available items with quantity and quality
let availableItems = {
"Equipment": [
    { name: "Cleaver Sword", description: "A massive sword.", category: "Equipment", type: "On-Hand", weaponCategory: "Melee - Heavy", crystalSlots: 2, quantity: 1, quality: "Rare" },
    { name: "Leather Armor", description: "Basic protection.", category: "Equipment", type: "Chest", quantity: 1, quality: "Common" }
  ],
  "Consumables": [
    { name: "Healing Potion", description: "Restores 20 HP.", category: "Consumables", quantity: 1, quality: "Common" }
  ],
   
  "Materials": [
    { name: "Rope", description: "100ft of rope.", category: "Materials", quantity: 1, quality: "Uncommon" },
  ],
  "Crystals": [
    { name: "Green Crystal", description: "Casts Cure.", category: "Crystals", quantity: 1, quality: "Uncommon" },
    { name: "Fire Crystal", description: "Grants the ability to cast Fire.", category: "Crystals", stATGonuses: { MAG: 2 }, abilities: ["Fire"], statRequirements: { MAG: 5 }, quantity: 1, quality: "Rare" },
    { name: "Heal Crystal", description: "Grants the ability to cast Cure.", category: "Crystals", stATGonuses: { WIL: 1 }, abilities: ["Cure"], statRequirements: { WIL: 3 }, quantity: 1, quality: "Rare" }
  ],
  "Miscellaneous": [
    { name: "Old Key", description: "Rusty but functional.", category: "Miscellaneous", quantity: 1, quality: "Poor" }
  ]
};

// Initialize inventory with all items from availableItems
function initializeInventory() {
  console.log("Initializing inventory");
  const savedInventory = localStorage.getItem('inventory');
  if (savedInventory) {
    inventory = JSON.parse(savedInventory);
    // One-time migration: Reclassify Accessory 1 and Accessory 2 to Accessory
    let reclassified = false;
    inventory.forEach(item => {
      if (item.type === "Accessory 1" || item.type === "Accessory 2") {
        item.type = "Accessory";
        reclassified = true;
      }
    });
    if (reclassified) {
      localStorage.setItem('inventory', JSON.stringify(inventory));
      console.log("Reclassified Accessory types in inventory:", inventory);
    }
  } else {
    inventory = [];
    localStorage.setItem('inventory', JSON.stringify(inventory)); // Start with empty inventory
  }

  // Reclassify equipped items
  const savedEquipped = localStorage.getItem('equippedItems');
  if (savedEquipped) {
    equippedItems = JSON.parse(savedEquipped);
    let reclassifiedEquipped = false;
    for (let slot in equippedItems) {
      if (equippedItems[slot] && (equippedItems[slot].type === "Accessory 1" || equippedItems[slot].type === "Accessory 2")) {
        equippedItems[slot].type = "Accessory";
        reclassifiedEquipped = true;
      }
    }
    if (reclassifiedEquipped) {
      localStorage.setItem('equippedItems', JSON.stringify(equippedItems));
      console.log("Reclassified Accessory types in equippedItems:", equippedItems);
    }
  }
}

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

let characterAbilities = [];
let abilityPoints = 1; // Starting with 1 point at Level 1
let learnedAbilities = {}; // Object to track learned abilities by category, e.g., { "Melee - Heavy": ["Cleave"] }

// Define available abilities with placeholders
let availableAbilities = {
  "Melee - Heavy": [
    { name: "Cleave", ATGCost: 50, statReq: { STR: 10 }, pointCost: 1, effect: "Hits all enemies for 1.5x damage" },
    { name: "Smash", ATGCost: 75, statReq: { STR: 15 }, pointCost: 2, effect: "Single target, 2x damage" }
  ],
  "Melee - Balanced": [
    { name: "Balanced Strike", ATGCost: 40, statReq: { STR: 8, DEX: 8 }, pointCost: 1, effect: "Balanced attack with 1d8 damage" }
  ],
  "Melee - Light": [
    { name: "Quick Slash", ATGCost: 30, statReq: { DEX: 10 }, pointCost: 1, effect: "Fast attack, 1d6+DEX damage" }
  ],
  "Ranged - Short": [
    { name: "Rapid Shot", ATGCost: 35, statReq: { DEX: 10 }, pointCost: 1, effect: "Quick ranged attack, 20-30 ft" }
  ],
  "Ranged - Long": [
    { name: "Sniper Shot", ATGCost: 60, statReq: { DEX: 12 }, pointCost: 2, effect: "Long-range precision shot, 60-100 ft" }
  ],
  "Magical - Offensive": [
    { name: "Fireball", ATGCost: 80, statReq: { MAG: 10 }, pointCost: 2, effect: "Elemental damage, 3d6 fire" }
  ],
  "Magical - Support": [
    { name: "Healing Aura", ATGCost: 70, statReq: { SPR: 10 }, pointCost: 2, effect: "Heals allies for 2d8 HP" }
  ],
  "Shields": [
    { name: "Shield Bash", ATGCost: 40, statReq: { STR: 8 }, pointCost: 1, effect: "Stuns enemy for 1 turn" }
  ],
  "Hybrid": [
    { name: "Gunblade Slash", ATGCost: 50, statReq: { STR: 8, DEX: 8 }, pointCost: 1, effect: "Melee attack in Melee mode" },
    { name: "Gunblade Shot", ATGCost: 50, statReq: { DEX: 10 }, pointCost: 1, effect: "Ranged attack in Ranged mode" }
  ]
};

const weaponCategories = [
  "Melee - Heavy",
  "Melee - Balanced",
  "Melee - Light",
  "Ranged - Short",
  "Ranged - Long",
  "Magical - Offensive",
  "Magical - Support",
  "Shields",
  "Hybrid"
];

// Global variables (keep these from both versions as needed)
let cnv;
let currentTab = 'resources';
let modalDiv = null;
let resourceUIContainer;
let skillsContainer;
let maxHpInput, setMaxHpButton, maxMpInput, setMaxMpButton;
let maxStaminaInput, setMaxStaminaButton, maxATGInput, setMaxATGButton;
let hpPlus, hpMinus, mpPlus, mpMinus, staminaPlus, staminaMinus, ATGPlus, ATGMinus;
let resetButton, staminaATGLink = false, staminaATGLinkButton;

// Setup Function
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
  let canvasHeight = 200;
  cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent(resourceBarsContainer);
  textFont("Arial");
  textSize(16);
  textAlign(LEFT, TOP);

  resourceUIContainer = createDiv()
    .parent(resourceControlsContainer)
    .id("resourceUIContainer");
  skillsContainer = createDiv().id("skillsContainer");

  // Initialize all UI components
  initializeInventory();
  createResourceUI();
  createStatsUI();
  createTalentsUI();
  createTraitsUI();
  updateAvailableEquipment();
  createEquipmentUI();
  createInventoryUI();

  // Tab functionality
  const tablinks = document.querySelectorAll(".tablink");
  const tabcontents = document.querySelectorAll(".tabcontent");
  tablinks.forEach((btn) => {
    btn.addEventListener("click", () => {
      tablinks.forEach((b) => b.classList.remove("active"));
      tabcontents.forEach((tc) => {
        tc.classList.remove("active");
        tc.style.display = "none";
      });
      btn.classList.add("active");
      const tabId = btn.getAttribute("data-tab");
      const activeTab = document.getElementById(tabId);
      activeTab.classList.add("active");
      activeTab.style.display = "block";
      currentTab = tabId;

      console.log(`Switching to tab: ${tabId}`);
      if (tabId === "resources") {
        cnv.show();
        createResourceUI();
        let containerWidth = select("#resource-bars").elt.clientWidth;
        let canvasWidth = min(containerWidth, 600);
        resizeCanvas(canvasWidth, 200); // Resize on tab switch
        loop(); // Start draw loop
        redraw(); // Force immediate redraw
      } else {
        cnv.hide();
        noLoop(); // Stop draw loop
        if (tabId === "inventory") createInventoryUI();
        else if (tabId === "equipment") createEquipmentUI();
        else if (tabId === "abilities") createAbilitiesUI();
        else if (tabId === "traits") createTraitsUI();
        else if (tabId === "stats") createStatsUI();
        else if (tabId === "talents") createTalentsUI();
      }
    });
  });

  // Simulate click on default tab
  document.querySelector(".tablink.active").click();

// Scroll listener to force redraw when #resource-bars is in view
window.addEventListener('scroll', () => {
  if (currentTab === 'resources') {
    let barsDiv = select('#resource-bars');
    let barBounds = barsDiv.elt.getBoundingClientRect(); // Changed 'rect' to 'barBounds'
    if (barBounds.top >= 0 && barBounds.bottom <= window.innerHeight) {
      redraw();
    }
  }
});
  // Simplified fullscreen button functionality using p5.js fullscreen()
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const appWrapper = document.getElementById("app-wrapper");
  fullscreenBtn.addEventListener("click", () => {
    let fs = fullscreen(); // Check current fullscreen state
    fullscreen(!fs); // Toggle fullscreen mode
    fullscreenBtn.textContent = fs ? "Full Screen" : "Exit Full Screen"; // Update button text
    resizeCanvasForFullscreen(); // Resize canvas after toggling
  });

  // Handle fullscreen change events (e.g., Esc key or browser exit)
  document.addEventListener("fullscreenchange", () => {
    let fs = fullscreen();
    fullscreenBtn.textContent = fs ? "Exit Full Screen" : "Full Screen";
    resizeCanvasForFullscreen();
  });
}

// Resize canvas when entering/exiting fullscreen
function resizeCanvasForFullscreen() {
  let resourceBarsContainer = select("#resource-bars");
  let containerWidth = resourceBarsContainer.elt.clientWidth;
  let canvasWidth = min(containerWidth, windowWidth > 800 ? 600 : windowWidth - 40); // Adjust for padding
  resizeCanvas(canvasWidth, 200);
  redraw(); // Force redraw to update bars
}

// Update windowResized to handle general resizing
function windowResized() {
  resizeCanvasForFullscreen();
}
function updateTypeVisibility() {
  if (typeof updating === 'undefined' || updating) return; // Prevent recursion
  let selectedType = (modalDiv && select("#equipment-type-select").value()) || "";
  if (!selectedType) return;
  let penaltyDiv = modalDiv.elt.querySelector('div[style*="display: none"] ~ div');
  let linkedStatDiv = modalDiv.elt.querySelector('div[style*="display: block"]:nth-of-type(2)');
  let damageDiceDiv = modalDiv.elt.querySelector('div[style*="display: block"]:nth-of-type(3)');
  let defenseDiv = modalDiv.elt.querySelector('div[style*="display: none"]:nth-of-type(2)');
  let weaponCategoryDiv = modalDiv.elt.querySelector('div[style*="display: none"]:nth-of-type(1)');

  if (!penaltyDiv || !linkedStatDiv || !damageDiceDiv || !defenseDiv || !weaponCategoryDiv) {
    console.error("One or more visibility elements not found:", {
      penaltyDiv, linkedStatDiv, damageDiceDiv, defenseDiv, weaponCategoryDiv
    });
    return;
  }

  if (["Chest", "Helm", "Gloves", "Greaves"].includes(selectedType)) {
    penaltyDiv.style.display = "block";
    linkedStatDiv.style.display = "none";
    damageDiceDiv.style.display = "none";
    defenseDiv.style.display = "block";
    weaponCategoryDiv.style.display = "none";
  } else if (["On-Hand", "Off-Hand"].includes(selectedType)) {
    penaltyDiv.style.display = "none";
    linkedStatDiv.style.display = "block";
    damageDiceDiv.style.display = "block";
    defenseDiv.style.display = "none";
    weaponCategoryDiv.style.display = "block";
  } else if (selectedType === "Accessory") {
    penaltyDiv.style.display = "none";
    linkedStatDiv.style.display = "none";
    damageDiceDiv.style.display = "none";
    defenseDiv.style.display = "none";
    weaponCategoryDiv.style.display = "none";
  }
}

function updateEquipmentOptions() {
  // Enhanced check for modalDiv validity
  if (!modalDiv || !modalDiv.elt || !document.body.contains(modalDiv.elt)) {
    console.log("Modal is not open or has been removed, skipping updateEquipmentOptions.");
    return;
  }

  let typeSelectElement = select("#equipment-type-select");
  if (!typeSelectElement) {
    console.log("Equipment type select element not found, skipping updateEquipmentOptions.");
    return;
  }

  let selectedType = typeSelectElement.value() || "";
  if (!selectedType) {
    console.log("No selected type, skipping updateEquipmentOptions.");
    return;
  }

  let equipmentSelect = modalDiv.elt.querySelector('#equipment-select');
  if (!equipmentSelect) {
    console.log("Equipment select element not found, skipping updateEquipmentOptions.");
    return;
  }

  let allEquipment = inventory.filter(item => 
    item.category === "Equipment" && 
    item.type === selectedType
  );
  let availableEquipment = availableItems["Equipment"].filter(item => 
    item.type === selectedType && 
    !inventory.some(i => i.name === item.name && i.category === "Equipment")
  );

  console.log("updateEquipmentOptions - Selected Type:", selectedType);
  console.log("Inventory (allEquipment):", allEquipment);
  console.log("Available Equipment:", availableEquipment);

  equipmentSelect.innerHTML = "";
  let option = document.createElement("option");
  option.value = "-1";
  option.text = "None";
  equipmentSelect.appendChild(option);
  allEquipment.forEach((item, idx) => {
    let option = document.createElement("option");
    option.value = idx.toString();
    option.text = `[Inventory] ${item.name}`;
    equipmentSelect.appendChild(option);
  });
  availableEquipment.forEach((item, idx) => {
    let option = document.createElement("option");
    option.value = (allEquipment.length + idx).toString();
    option.text = `[Available] ${item.name}`;
    equipmentSelect.appendChild(option);
  });

  loadEquipmentData();
}
function windowResized() {
  let resourceBarsContainer = select("#resource-bars");
  let containerWidth = resourceBarsContainer.elt.clientWidth;
  let canvasWidth = min(containerWidth, 600);
  resizeCanvas(canvasWidth, 200); // Match setup height
}

function draw() {
  if (currentTab === 'resources') {
    background(255);
    displayBars();
  }
}

function displayBars() {
  let bar_width = width * 0.6;
  let bar_height = 20;
  let x = width * 0.1;
  let y_hp = 25, y_mp = 55, y_stamina = 85, y_ATG = 115;

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
  text(`STA: ${current_stamina}/${max_stamina}`, x + bar_width / 2, y_stamina + bar_height / 2);

  stroke(0);
  fill(128);
  rect(x, y_ATG, bar_width, bar_height);
  noStroke();
  fill(0, 0, 255);
  let ATG_width = (current_ATG / max_ATG) * bar_width;
  rect(x, y_ATG, ATG_width, bar_height);
  fill(255);
  text(`ATG: ${current_ATG}/${max_ATG}`, x + bar_width / 2, y_ATG + bar_height / 2);
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
  createSpan("STA:").parent(staminaRow);
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
      if (staminaATGLink) {
        current_ATG = min(current_ATG + 25, max_ATG);
      }
    });

  let ATGRow = createDiv().parent(rUI).class("resource-row");
  createSpan("ATG:").parent(ATGRow);
  maxATGInput = createInput(max_ATG.toString(), "number")
    .parent(ATGRow)
    .class("resource-input");
  setMaxATGButton = createButton("Set Max")
    .parent(ATGRow)
    .class("resource-button")
    .mousePressed(setMaxATG);
  ATGPlus = createButton("+25")
    .parent(ATGRow)
    .class("resource-button small-button")
    .mousePressed(() => {
      current_ATG = min(current_ATG + 25, max_ATG);
    });
  ATGMinus = createButton("-50")
    .parent(ATGRow)
    .class("resource-button small-button")
    .mousePressed(() => {
      current_ATG = max(current_ATG - 50, 0);
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
  resourceSelect.option("STA");
  resourceSelect.option("ATG");
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
  staminaATGLinkButton = createButton(staminaATGLink ? "Link: ON" : "Link: OFF")
    .parent(linkRow)
    .class("resource-button")
    .mousePressed(toggleStaminaATGLink)
    .style("background-color", staminaATGLink ? "green" : "red");
  createSpan("When ON, using STA adds to ATG").parent(linkRow);

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
    case "STA":
      current_stamina = constrain(current_stamina + adjustment, 0, max_stamina);
      if (!isAddition && staminaATGLink) {
        current_ATG = min(current_ATG + value, max_ATG);
      }
      break;
    case "ATG":
      current_ATG = constrain(current_ATG + adjustment, 0, max_ATG);
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

function setMaxATG() {
  let value = parseInt(maxATGInput.value());
  if (!isNaN(value) && value > 0) {
    max_ATG = value;
    current_ATG = min(current_ATG, value);
  }
}

function resetResources() {
  current_hp = max_hp;
  current_mp = max_mp;
  current_stamina = max_stamina;
  current_ATG = 0;
}

function toggleStaminaATGLink() {
  staminaATGLink = !staminaATGLink;
  staminaATGLinkButton.html(staminaATGLink ? "Link: ON" : "Link: OFF");
  staminaATGLinkButton.style(
    "background-color",
    staminaATGLink ? "green" : "red"
  );
}

// Function to redraw the resource bars
function redrawResourceBars() {
  // Replace this with your actual code to draw the bars
  displayBars(); // Assuming this is your function to render the bars
}
// ### Stats UI ###

// Update modal closure (e.g., showConfirmationModal)
function showConfirmationModal(message, onConfirm, isError = false) {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv()
    .style("position", "fixed")
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
      .mousePressed(() => {
        modalDiv.remove();
        if (currentTab === "resources") {
          loop(); // Restart draw loop
          redraw(); // Force redraw
        }
      });
  } else {
    createButton("Confirm")
      .parent(modalDiv)
      .style("margin", "5px")
      .mousePressed(() => {
        onConfirm();
        modalDiv.remove();
        if (currentTab === "resources") {
          loop(); // Restart draw loop
          redraw(); // Force redraw
        }
      });
    createButton("Cancel")
      .parent(modalDiv)
      .style("margin", "5px")
      .mousePressed(() => {
        modalDiv.remove();
        if (currentTab === "resources") {
          loop(); // Restart draw loop
          redraw(); // Force redraw
        }
      });
  }
}
// Remove redundant switchTab function
// Delete: function switchTab(tabId) { ... }
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
    name: "Determination",
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
    description: "When an enemy misses you, gain 5 ATG.",
    maxLevel: "III",
  },
  {
    name: "Battlefield Awareness - Level II",
    level: "II",
    category: "Physical Combat",
    description: "When an enemy misses you, gain 10 ATG.",
    maxLevel: "III",
  },
  {
    name: "Battlefield Awareness - Level III",
    level: "III",
    category: "Physical Combat",
    description: "When an enemy misses you, gain 15 ATG.",
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
    description: "Crystal spells cost -5 MP (minimum 1MP cost per spell).",
    maxLevel: "III",
  },
  {
    name: "Efficient Spellcasting - Level II",
    level: "II",
    category: "Magical",
    description: "Crystal spells cost -10 MP (minimum 1MP cost per spell).",
    maxLevel: "III",
  },
  {
    name: "Efficient Spellcasting - Level III",
    level: "III",
    category: "Magical",
    description: "Crystal spells cost -15 MP (minimum 1MP cost per spell).",
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
      "If you cast a spell, you may spend 25 ATG to cast a second spell as a bonus effect (must be a different spell).",
    maxLevel: "II",
  },
  {
    name: "Dual Weave - Level II",
    level: "II",
    category: "Magical",
    description:
      "If you cast a spell, you may spend 50 ATG to cast a second spell as a bonus effect (must be a different spell).",
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
      "If an ally within 30 ft is attacked, you may spend 25 ATG to make a reaction shot at the attacker.",
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
      "When making a ranged attack, you may spend 10 ATG to increase your crit range by 1.",
    maxLevel: "III",
  },
  {
    name: "Deadly Precision - Level II",
    level: "II",
    category: "Ranged Combat",
    description:
      "When making a ranged attack, you may spend 20 ATG to increase your crit range by 2.",
    maxLevel: "III",
  },
  {
    name: "Deadly Precision - Level III",
    level: "III",
    category: "Ranged Combat",
    description:
      "When making a ranged attack, you may spend 30 ATG to increase your crit range by 3.",
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
      "If an enemy attacks you in melee, you may spend 25 ATG to counterattack.",
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
    description: "Gain +5 ATG if you move at least 20 ft before attacking.",
    maxLevel: "II",
  },
  {
    name: "Rushdown - Level II",
    level: "II",
    category: "Utility & Tactical",
    description: "Gain +10 ATG if you move at least 20 ft before attacking.",
    maxLevel: "II",
  },
  {
    name: "Support Specialist - Level I",
    level: "I",
    category: "Utility & Tactical",
    description: "When assisting an ally, they gain +5 ATG.",
    maxLevel: "II",
  },
  {
    name: "Support Specialist - Level II",
    level: "II",
    category: "Utility & Tactical",
    description: "When assisting an ally, they gain +10 ATG.",
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
    name: "Veteran Soldier",
    category: "Combat",
    positive: "Advantage on Athletics checks.",
    negative: "Disadvantage on Ingenuity checks.",
  },
  {
    name: "Ancient Echoes",
    category: "Magical",
    positive:
      "You can sense the presence of raw Crytal energy within 60 feet, even through barriers (you do not sense refined Crystal equipped to others).",
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
    positive: "Start each battle with +25 ATG.",
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
    name: "Corrupted Blood",
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
function canWieldItem(item) {
  if (!item || !item.statRequirements || Object.keys(item.statRequirements).length === 0) {
    return true; // No requirements, can wield
  }

  let totalStats = {
    STR: getTotalStat("STR"),
    VIT: getTotalStat("VIT"),
    DEX: getTotalStat("DEX"),
    MAG: getTotalStat("MAG"),
    WIL: getTotalStat("WIL"),
    SPR: getTotalStat("SPR"),
    LCK: getTotalStat("LCK")
  };

  for (let [stat, required] of Object.entries(item.statRequirements)) {
    if (totalStats[stat] < required) {
      return false; // Stat requirement not met
    }
  }
  return true; // All requirements met
}
function showConfirmationModal(message, onConfirm, isError = false) {
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv()
    .style("position", "fixed")
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
      .mousePressed(() => {
        modalDiv.remove();
        if (currentTab === "resources") redraw();
      });
  } else {
    createButton("Confirm")
      .parent(modalDiv)
      .style("margin", "5px")
      .mousePressed(() => {
        onConfirm();
        modalDiv.remove();
        if (currentTab === "resources") redraw();
      });
    createButton("Cancel")
      .parent(modalDiv)
      .style("margin", "5px")
      .mousePressed(() => {
        modalDiv.remove();
        if (currentTab === "resources") redraw();
      });
  }
}

function showStatDescription(title, description) {
  // Remove any existing modal to avoid overlap
  if (modalDiv) modalDiv.remove();

  // Create a new div for the modal
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

  // Add title and description
  createElement("h3", title).parent(modalDiv);
  createP(description).parent(modalDiv);

  // Add a close button
  let closeBtn = createButton("Close")
    .parent(modalDiv)
    .style("margin-top", "10px")
    .mousePressed(() => modalDiv.remove());
}
function showTraitDescription(name, positive, negative) {
  // Remove any existing modal to avoid overlap
  if (modalDiv) modalDiv.remove();

  // Create a new div for the modal
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

  // Add title and description
  createElement("h3", name).parent(modalDiv);
  createP(`(+) ${positive}<br>(-) ${negative}`).parent(modalDiv);

  // Add a close button
  let closeBtn = createButton("Close")
    .parent(modalDiv)
    .style("margin", "5px")
    .mousePressed(() => modalDiv.remove());
}
function showTalentDescription(title, description) {
  // Remove any existing modal to avoid overlap
  if (modalDiv) modalDiv.remove();

  // Create a new div for the modal
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

  // Add title and description
  createElement("h3", title).parent(modalDiv);
  createP(description).parent(modalDiv);

  // Add a close button
  let closeBtn = createButton("Close")
    .parent(modalDiv)
    .style("margin-top", "10px")
    .mousePressed(() => modalDiv.remove());
}
function showEquipmentDescription(slot, item, allowCrystalEquip = false) {
  if (!item && !allowCrystalEquip) {
    showConfirmationModal("No item equipped in this slot.", () => {}, true);
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
    .style("max-width", "400px")
    .style("word-wrap", "break-word");

  if (!allowCrystalEquip) {
    // Parse the slot to remove the index suffix (e.g., "Crystals-0" -> "Crystals")
    let slotTitle = slot.includes("-") ? slot.split("-")[0] : slot;
    createElement("h3", `${slotTitle}: ${item ? item.name : "None"}`).parent(modalDiv);

    if (item) {
      let detailsDiv = createDiv().parent(modalDiv).style("margin-bottom", "10px");
      let addDetail = (label, value, isBoolean = false) => {
        if (value === undefined || value === null || value === "") {
          return;
        }
        if (typeof value === "object") {
          if (Object.keys(value).length === 0) {
            return;
          }
          value = Object.entries(value).map(([key, val]) => `${key}: ${val}`).join(", ");
        }
        if (isBoolean) {
          if (!value) {
            return;
          }
          value = "Yes";
        }
        createSpan(`${label}: ${value}`).parent(detailsDiv).style("display", "block");
      };

      addDetail("Name", item.name);
      addDetail("Description", item.description || "No description provided.");
      addDetail("Type", item.type);
      addDetail("Category", item.category);
      addDetail("Quality", item.quality);
      addDetail("Crystal Slots", item.crystalSlots);
      addDetail("Quantity", item.quantity);
      addDetail("Stat Requirements", item.statRequirements && Object.keys(item.statRequirements).length > 0 ? item.statRequirements : undefined);
      addDetail("Dual Wield", item.dualWield, true);
      addDetail("Two-Handed", item.twoHanded, true);
      addDetail("Linked Stat", item.linkedStat);
      if (item.damageDice) {
        let modifierText = item.modifier && item.modifier !== 0 ? (item.modifier > 0 ? `+${item.modifier}` : item.modifier) : "";
        addDetail("Damage", `${item.damageDice}${modifierText}`);
      } else if (item.defense) {
        let modifierText = item.modifier && item.modifier !== 0 ? (item.modifier > 0 ? ` +${item.modifier}` : ` ${item.modifier}`) : "";
        addDetail("Defense", `${item.defense}${modifierText}`);
      } else if (item.modifier && item.modifier !== 0) {
        addDetail("Modifier", item.modifier > 0 ? `+${item.modifier}` : item.modifier);
      }
      addDetail("Weapon Category", item.weaponCategory);
      addDetail("Movement Penalty", item.movementPenalty !== undefined ? `${item.movementPenalty} ft` : undefined);
      addDetail("Stat Bonus", item.stATGonuses ? `${item.stATGonuses.stat} ${item.stATGonuses.amount > 0 ? "+" : ""}${item.stATGonuses.amount}` : undefined);
    } else {
      createP("No description available.").parent(modalDiv);
    }
  } else {
    // Display crystal management (unchanged behavior)
    createElement("h3", `${slot}: Essence Crystal Slots`).parent(modalDiv);

    let errorMessage = createP("")
      .parent(modalDiv)
      .style("color", "red")
      .style("display", "none")
      .style("margin-bottom", "10px");

    let crystalDescriptions = createDiv().parent(modalDiv).style("margin-bottom", "10px");

    function updateCrystalDescriptions() {
      crystalDescriptions.html("");
      let hasCrystals = item.equippedCrystals.some(crystal => crystal !== null);
      if (!hasCrystals) {
        createSpan("No crystals equipped.").parent(crystalDescriptions);
      } else {
        item.equippedCrystals.forEach((crystal, idx) => {
          if (crystal) {
            let desc = `Slot ${idx + 1}: ${crystal.name}<br>`;
            desc += `${crystal.description || "No description provided."}<br>`;
            if (crystal.stATGonuses && Object.keys(crystal.stATGonuses).length > 0) {
              let bonuses = Object.entries(crystal.stATGonuses)
                .map(([stat, value]) => `${value > 0 ? "+" : ""}${value} ${stat}`)
                .join(", ");
              desc += `Bonuses: ${bonuses}<br>`;
            }
            if (crystal.statRequirements && Object.keys(crystal.statRequirements).length > 0) {
              let reqs = Object.entries(crystal.statRequirements)
                .map(([stat, value]) => `${value} ${stat}`)
                .join(" & ");
              desc += `Requirements: ${reqs}<br>`;
            }
            if (crystal.abilities && crystal.abilities.length > 0) {
              desc += `Abilities: ${crystal.abilities.join(", ")}<br>`;
            }
            createP(desc)
              .parent(crystalDescriptions)
              .style("font-weight", "bold")
              .style("margin-bottom", "5px");
          }
        });
      }
    }

    if (item.crystalSlots > 0) {
      if (!item.equippedCrystals || item.equippedCrystals.length !== item.crystalSlots) {
        item.equippedCrystals = Array(item.crystalSlots).fill(null);
      }

      updateCrystalDescriptions();

      function updateCrystalUsageCount() {
        let count = {};
        for (let otherSlot in equippedItems) {
          let otherItem = equippedItems[otherSlot];
          if (otherItem && otherItem.equippedCrystals) {
            otherItem.equippedCrystals.forEach(crystal => {
              if (crystal) {
                count[crystal.name] = (count[crystal.name] || 0) + 1;
              }
            });
          }
        }
        return count;
      }

      let crystalSelects = [];
      for (let i = 0; i < item.crystalSlots; i++) {
        let slotDiv = createDiv().parent(modalDiv).style("margin", "5px");
        createSpan(`Slot ${i + 1}: `).parent(slotDiv);
        let crystalSelect = createSelect().parent(slotDiv).style("width", "150px");
        crystalSelects.push(crystalSelect);
        crystalSelect.option("None");

        let allCrystals = inventory.filter(item => item.category === "Crystals");
        let crystalUsageCount = updateCrystalUsageCount();
        allCrystals.forEach(crystal => {
          let equippedCount = crystalUsageCount[crystal.name] || 0;
          let totalQuantity = crystal.quantity || 1;
          let availableQuantity = totalQuantity - equippedCount;
          if (availableQuantity > 0 || (item.equippedCrystals[i] && item.equippedCrystals[i].name === crystal.name)) {
            let optionText = equippedCount > 0 ? `${crystal.name} (Equipped ${equippedCount}/${totalQuantity})` : crystal.name;
            crystalSelect.option(optionText, crystal.name);
          }
        });

        let currentCrystal = item.equippedCrystals[i];
        crystalSelect.value(currentCrystal ? currentCrystal.name : "None");
        crystalSelect.changed(function() {
          let selectedName = this.value();
          if (selectedName === "None") {
            item.equippedCrystals[i] = null;
          } else {
            let crystal = inventory.find(item => item.name === selectedName && item.category === "Crystals");
            if (crystal) {
              let crystalUsageCount = updateCrystalUsageCount();
              let equippedCount = crystalUsageCount[crystal.name] || 0;
              let totalQuantity = crystal.quantity || 1;
              let availableQuantity = totalQuantity - equippedCount;
              if (availableQuantity <= 0 && !(currentCrystal && currentCrystal.name === crystal.name)) {
                errorMessage.html(`Cannot equip ${crystal.name}: no more available (already equipped ${equippedCount}/${totalQuantity}).`);
                errorMessage.style("display", "block");
                crystalSelect.value(currentCrystal ? currentCrystal.name : "None");
                return;
              }
              if (!canWieldItem(crystal)) {
                let totalStats = {
                  STR: getTotalStat("STR"), VIT: getTotalStat("VIT"), DEX: getTotalStat("DEX"),
                  MAG: getTotalStat("MAG"), WIL: getTotalStat("WIL"), SPR: getTotalStat("SPR"),
                  LCK: getTotalStat("LCK")
                };
                let missing = Object.entries(crystal.statRequirements || {})
                  .filter(([stat, req]) => totalStats[stat] < req)
                  .map(([stat, req]) => `${stat}: ${totalStats[stat]}/${req}`)
                  .join(", ");
                errorMessage.html(`Cannot equip ${selectedName}: ${missing}`);
                errorMessage.style("display", "block");
                crystalSelect.value(currentCrystal ? currentCrystal.name : "None");
                return;
              }
              item.equippedCrystals[i] = crystal;
            }
          }

          let crystalUsageCount = updateCrystalUsageCount();
          crystalSelects.forEach((select, index) => {
            let currentValue = select.value();
            select.html("");
            select.option("None");
            allCrystals.forEach(crystal => {
              let equippedCount = crystalUsageCount[crystal.name] || 0;
              let totalQuantity = crystal.quantity || 1;
              let availableQuantity = totalQuantity - equippedCount;
              if (availableQuantity > 0 || (item.equippedCrystals[index] && item.equippedCrystals[index].name === crystal.name)) {
                let optionText = equippedCount > 0 ? `${crystal.name} (Equipped ${equippedCount}/${totalQuantity})` : crystal.name;
                select.option(optionText, crystal.name);
              }
            });
            select.value(currentValue);
          });

          updateCrystalDescriptions();
          errorMessage.style("display", "none");
          updateStATGonusesDisplay();
          updateResourcesBasedOnStats();
          updateAbilities();
          createEquipmentUI();
        });
      }
    } else {
      createP("No crystal slots available.").parent(modalDiv);
    }
  }

  createButton("Close")
    .parent(modalDiv)
    .style("margin-top", "10px")
    .mousePressed(() => modalDiv.remove());
}
function loadEquipmentData() {
  // Guard against invalid modal state
  if (!modalDiv || !modalDiv.elt || !document.body.contains(modalDiv.elt)) {
    console.log("Modal is not open or has been removed, skipping loadEquipmentData.");
    return;
  }

  let idx = parseInt((modalDiv && select("#equipment-select").value()) || "-1");
  let selectedType = (modalDiv && select("#equipment-type-select").value()) || "";
  if (!selectedType) {
    console.log("No selected type, skipping loadEquipmentData.");
    return;
  }

  let allEquipment = inventory.filter(item => 
    item.category === "Equipment" && 
    item.type && item.type === selectedType
  );
  let availableEquipment = availableItems["Equipment"].filter(item => 
    item.type && item.type === selectedType && 
    !inventory.some(i => i.name === item.name && i.category === "Equipment")
  );

  // Use IDs to select elements
  let nameInput = modalDiv.elt.querySelector('#equipment-name-input');
  let qualitySelect = modalDiv.elt.querySelector('#equipment-quality-select');
  let descriptionInput = modalDiv.elt.querySelector('#equipment-description-input');
  let penaltySelect = modalDiv.elt.querySelector('#equipment-penalty-select');
  let slotsSelect = modalDiv.elt.querySelector('#equipment-slots-select');
  let linkedStatSelect = modalDiv.elt.querySelector('#equipment-linked-stat-select');
  let stATGonusStatSelect = modalDiv.elt.querySelector('#equipment-statonus-stat-select');
  let stATGonusAmountInput = modalDiv.elt.querySelector('#equipment-statonus-amount-input');
  let statReq1Select = modalDiv.elt.querySelector('#equipment-statreq1-select');
  let statReq1Input = modalDiv.elt.querySelector('#equipment-statreq1-input');
  let statReq2Select = modalDiv.elt.querySelector('#equipment-statreq2-select');
  let statReq2Input = modalDiv.elt.querySelector('#equipment-statreq2-input');
  let damageDiceInput = modalDiv.elt.querySelector('#equipment-damage-dice-input');
  let weaponModifierInput = modalDiv.elt.querySelector('#equipment-weapon-modifier-input');
  let defenseInput = modalDiv.elt.querySelector('#equipment-defense-input');
  let armorModifierInput = modalDiv.elt.querySelector('#equipment-armor-modifier-input');
  let weaponCategorySelect = modalDiv.elt.querySelector('#weapon-category-select');

  // Add null checks to prevent TypeError
  if (!nameInput || !qualitySelect || !descriptionInput || !penaltySelect || !slotsSelect ||
      !linkedStatSelect || !stATGonusStatSelect || !stATGonusAmountInput ||
      !statReq1Select || !statReq1Input || !statReq2Select || !statReq2Input ||
      !damageDiceInput || !weaponModifierInput || !defenseInput || !armorModifierInput ||
      !weaponCategorySelect) {
    console.error("One or more elements not found in loadEquipmentData:", {
      nameInput, qualitySelect, descriptionInput, penaltySelect, slotsSelect,
      linkedStatSelect, stATGonusStatSelect, stATGonusAmountInput,
      statReq1Select, statReq1Input, statReq2Select, statReq2Input,
      damageDiceInput, weaponModifierInput, defenseInput, armorModifierInput,
      weaponCategorySelect
    });
    return;
  }

  if (idx === -1) {
    nameInput.value = "";
    qualitySelect.value = "Common";
    descriptionInput.value = "";
    penaltySelect.value = "0";
    slotsSelect.value = "0";
    linkedStatSelect.value = "STR";
    stATGonusStatSelect.value = "None";
    stATGonusAmountInput.value = "0";
    statReq1Select.value = "None";
    statReq1Input.value = "";
    statReq2Select.value = "None";
    statReq2Input.value = "";
    damageDiceInput.value = "";
    weaponModifierInput.value = "0";
    defenseInput.value = "0";
    armorModifierInput.value = "0";
    weaponCategorySelect.value = "Melee - Heavy";
  } else if (idx < allEquipment.length) {
    // Existing inventory item
    let item = allEquipment[idx];
    nameInput.value = item.name || "";
    qualitySelect.value = item.quality || "Common";
    descriptionInput.value = item.description || "";
    penaltySelect.value = item.movementPenalty || "0";
    slotsSelect.value = item.crystalSlots || 0;
    linkedStatSelect.value = item.linkedStat || "STR";
    stATGonusStatSelect.value = item.stATGonuses ? Object.keys(item.stATGonuses)[0] : "None";
    stATGonusAmountInput.value = item.stATGonuses && Object.keys(item.stATGonuses).length > 0 ? item.stATGonuses[Object.keys(item.stATGonuses)[0]] : 0;
    let statReqs = item.statRequirements || {};
    let stats = Object.keys(statReqs);
    statReq1Select.value = stats[0] || "None";
    statReq1Input.value = stats[0] ? statReqs[stats[0]] : "";
    statReq2Select.value = stats[1] || "None";
    statReq2Input.value = stats[1] ? statReqs[stats[1]] : "";
    damageDiceInput.value = item.damageDice || "";
    weaponModifierInput.value = item.modifier || 0;
    defenseInput.value = item.defense || 0;
    armorModifierInput.value = item.modifier || 0;
    weaponCategorySelect.value = item.weaponCategory || "Melee - Heavy";
  } else {
    // Available item from availableItems
    let availableIdx = idx - allEquipment.length;
    if (availableIdx < 0 || availableIdx >= availableEquipment.length) {
      console.error("Invalid available equipment index:", availableIdx, availableEquipment);
      return;
    }
    let item = availableEquipment[availableIdx];
    nameInput.value = item.name || "";
    qualitySelect.value = item.quality || "Common";
    descriptionInput.value = item.description || "";
    penaltySelect.value = item.movementPenalty || "0";
    slotsSelect.value = item.crystalSlots || 0;
    linkedStatSelect.value = item.linkedStat || "STR";
    stATGonusStatSelect.value = item.stATGonuses ? Object.keys(item.stATGonuses)[0] : "None";
    stATGonusAmountInput.value = item.stATGonuses && Object.keys(item.stATGonuses).length > 0 ? item.stATGonuses[Object.keys(item.stATGonuses)[0]] : 0;
    let statReqs = item.statRequirements || {};
    let stats = Object.keys(statReqs);
    statReq1Select.value = stats[0] || "None";
    statReq1Input.value = stats[0] ? statReqs[stats[0]] : "";
    statReq2Select.value = stats[1] || "None";
    statReq2Input.value = stats[1] ? statReqs[stats[1]] : "";
    damageDiceInput.value = item.damageDice || "";
    weaponModifierInput.value = item.modifier || 0;
    defenseInput.value = item.defense || 0;
    armorModifierInput.value = item.modifier || 0;
    weaponCategorySelect.value = item.weaponCategory || "Melee - Heavy";
  }
}
function showAddEditEquipmentModal() {
  const appWrapper = select("#app-wrapper");
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv().parent(appWrapper);
  modalDiv.class("modal");

  const viewportHeight = window.innerHeight;
  const minTopOffset = 20;
  const maxHeightPercentage = 0.9;

  modalDiv
    .style("top", `${minTopOffset}px`)
    .style("left", "50%")
    .style("transform", "translateX(-50%)")
    .style("background", "#fff")
    .style("padding", "20px")
    .style("border", "2px solid #000")
    .style("z-index", "1000")
    .style("width", "300px")
    .style("box-sizing", "border-box")
    .style("font-size", "14px");

  let contentWrapper = createDiv()
    .parent(modalDiv)
    .class("modal-content")
    .style("flex", "1 1 auto")
    .style("overflow-y", "auto")
    .style("max-height", `calc(${viewportHeight * maxHeightPercentage}px - 80px)`);

  let buttonContainer = createDiv()
    .parent(modalDiv)
    .class("modal-buttons")
    .style("flex", "0 0 auto")
    .style("padding-top", "10px")
    .style("border-top", "1px solid #ccc")
    .style("display", "flex")
    .style("justify-content", "space-between")
    .style("gap", "5px");

  createElement("h3", "Modify Equipment").parent(contentWrapper);

  let successMessage = createP("")
    .parent(contentWrapper)
    .style("color", "green")
    .style("display", "none")
    .style("margin-bottom", "10px");

  let errorMessage = createP("")
    .parent(contentWrapper)
    .style("color", "red")
    .style("display", "none")
    .style("margin-bottom", "10px");

  // --- Fields ---

  let typeDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Equipment Type:").parent(typeDiv).style("display", "block");
  let typeSelect = createSelect()
    .parent(typeDiv)
    .style("width", "100%")
    .id("equipment-type-select");
  ["On-Hand", "Off-Hand", "Chest", "Helm", "Gloves", "Greaves", "Accessory"].forEach(type => typeSelect.option(type));
  createSpan("The slot where the equipment is equipped.")
    .parent(typeDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let weaponCategoryDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px").style("display", "none");
  createSpan("Weapon Category:").parent(weaponCategoryDiv).style("display", "block");
  let weaponCategorySelect = createSelect()
    .parent(weaponCategoryDiv)
    .style("width", "100%")
    .id("weapon-category-select");
  [
    "Melee - Heavy",
    "Melee - Balanced",
    "Melee - Light",
    "Ranged - Short",
    "Ranged - Long",
    "Magical - Offensive",
    "Magical - Support",
    "Shields",
    "Hybrid",
  ].forEach(category => weaponCategorySelect.option(category));
  createSpan("The category determining available abilities.")
    .parent(weaponCategoryDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let dualWieldDiv = createDiv().parent(contentWrapper).style("margin-bottom", "5px").style("display", "none");
  let dualWieldLabel = createSpan("Dual Wield: ").style("display", "inline-block").style("margin-right", "5px");
  let dualWieldCheckbox = createCheckbox("", false)
    .parent(dualWieldDiv)
    .style("display", "inline-block")
    .style("margin", "0 5px 0 0");
  dualWieldLabel.parent(dualWieldDiv);
  createSpan("Can be equipped in either slot.")
    .parent(dualWieldDiv)
    .style("font-size", "11px")
    .style("color", "#666")
    .style("display", "block")
    .style("margin-top", "2px");

  let twoHandedDiv = createDiv().parent(contentWrapper).style("margin-bottom", "5px").style("display", "none");
  let twoHandedLabel = createSpan("Two-Handed: ").style("display", "inline-block").style("margin-right", "5px");
  let twoHandedCheckbox = createCheckbox("", false)
    .parent(twoHandedDiv)
    .style("display", "inline-block")
    .style("margin", "0 5px 0 0");
  twoHandedLabel.parent(twoHandedDiv);
  createSpan("Requires both hands to wield.")
    .parent(twoHandedDiv)
    .style("font-size", "11px")
    .style("color", "#666")
    .style("display", "block")
    .style("margin-top", "2px");

  let equipmentSelectDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Equipment:").parent(equipmentSelectDiv).style("display", "block");
  let equipmentSelect = createSelect()
    .parent(equipmentSelectDiv)
    .style("width", "100%")
    .id("equipment-select");
  createSpan("Select an item to edit or choose 'Add New' to create one.")
    .parent(equipmentSelectDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let nameDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Name:").parent(nameDiv).style("display", "block");
  let nameInput = createInput("")
    .parent(nameDiv)
    .style("width", "100%")
    .attribute("placeholder", "e.g., Iron Blade")
    .id("equipment-name-input");
  createSpan("The equipment’s unique identifier.")
    .parent(nameDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let qualityDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Quality:").parent(qualityDiv).style("display", "block");
  let qualitySelect = createSelect()
    .parent(qualityDiv)
    .style("width", "100%")
    .id("equipment-quality-select");
  ["Common", "Uncommon", "Rare", "Epic", "Legendary"].forEach(q => qualitySelect.option(q));
  qualitySelect.value("Common");
  createSpan("The rarity or quality of the equipment.")
    .parent(qualityDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let descDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Description:").parent(descDiv).style("display", "block");
  let descriptionInput = createElement("textarea")
    .parent(descDiv)
    .style("width", "100%")
    .style("height", "60px")
    .attribute("placeholder", "Describe the equipment...")
    .id("equipment-description-input");
  createSpan("What the equipment does or its lore.")
    .parent(descDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let penaltyDiv = createDiv().parent(contentWrapper).style("display", "none");
  createSpan("Movement Penalty (ft):").parent(penaltyDiv).style("display", "block");
  let penaltySelect = createSelect()
    .parent(penaltyDiv)
    .style("width", "100%")
    .style("margin-bottom", "10px")
    .id("equipment-penalty-select");
  ["0", "-5", "-10", "-15"].forEach(p => penaltySelect.option(p));

  let slotsDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Essence Crystal Slots:").parent(slotsDiv).style("display", "block");
  let slotsSelect = createSelect()
    .parent(slotsDiv)
    .style("width", "100%")
    .id("equipment-slots-select");
  [0, 1, 2, 3, 4].forEach(s => slotsSelect.option(s));
  createSpan("Number of slots for Essence Crystals.")
    .parent(slotsDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let linkedStatDiv = createDiv().parent(contentWrapper).style("display", "block");
  createSpan("Linked Stat (Weapons):").parent(linkedStatDiv).style("display", "block");
  let linkedStatSelect = createSelect()
    .parent(linkedStatDiv)
    .style("width", "100%")
    .id("equipment-linked-stat-select");
  linkedStatSelect.option("STR");
  linkedStatSelect.option("MAG");
  createSpan("Stat for weapon damage (STR or MAG).")
    .parent(linkedStatDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let stATGonusDiv = createDiv().parent(contentWrapper);
  createSpan("Stat Bonus:").parent(stATGonusDiv).style("display", "block");
  let stATGonusAmountInput = createInput("0", "number")
    .parent(stATGonusDiv)
    .style("width", "50px")
    .style("margin-right", "5px")
    .id("equipment-statonus-amount-input");
  let stATGonusStatSelect = createSelect()
    .parent(stATGonusDiv)
    .style("width", "100px")
    .style("margin-bottom", "10px")
    .id("equipment-statonus-stat-select");
  ["None", "STR", "DEX", "VIT", "MAG", "WIL", "SPR", "LCK"].forEach(stat => stATGonusStatSelect.option(stat));
  createSpan("Stat to boost and amount.")
    .parent(stATGonusDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let statReqDiv = createDiv().parent(contentWrapper).style("display", "block");
  createSpan("Stat Requirements (Optional):").parent(statReqDiv).style("display", "block");
  let statReq1Div = createDiv().parent(statReqDiv).style("margin-bottom", "5px");
  let statReq1Select = createSelect()
    .parent(statReq1Div)
    .style("width", "80px")
    .style("margin-right", "5px")
    .id("equipment-statreq1-select");
  ["None", "STR", "DEX", "VIT", "MAG", "WIL", "SPR", "LCK"].forEach(stat => statReq1Select.option(stat));
  let statReq1Input = createInput("", "number")
    .parent(statReq1Div)
    .style("width", "50px")
    .attribute("placeholder", "Value")
    .id("equipment-statreq1-input");

  let statReq2Div = createDiv().parent(statReqDiv).style("margin-bottom", "10px");
  let statReq2Select = createSelect()
    .parent(statReq2Div)
    .style("width", "80px")
    .style("margin-right", "5px")
    .id("equipment-statreq2-select");
  ["None", "STR", "DEX", "VIT", "MAG", "WIL", "SPR", "LCK"].forEach(stat => statReq2Select.option(stat));
  let statReq2Input = createInput("", "number")
    .parent(statReq2Div)
    .style("width", "50px")
    .attribute("placeholder", "Value")
    .id("equipment-statreq2-input");
  createSpan("Minimum stats needed to equip (e.g., 5 STR).")
    .parent(statReqDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let damageDiceDiv = createDiv().parent(contentWrapper).style("display", "block");
  createSpan("Damage Dice + Modifier (Weapons):").parent(damageDiceDiv).style("display", "block");
  let damageDiceInput = createInput("", "text")
    .parent(damageDiceDiv)
    .style("width", "80px")
    .style("margin-right", "5px")
    .attribute("placeholder", "e.g., 2d6")
    .id("equipment-damage-dice-input");
  let weaponModifierInput = createInput("0", "number")
    .parent(damageDiceDiv)
    .style("width", "50px")
    .style("margin-bottom", "10px")
    .attribute("placeholder", "Mod")
    .id("equipment-weapon-modifier-input");

  let defenseDiv = createDiv().parent(contentWrapper).style("display", "none");
  createSpan("Defense + Modifier (Armor):").parent(defenseDiv).style("display", "block");
  let defenseInput = createInput("0", "number")
    .parent(defenseDiv)
    .style("width", "50px")
    .style("margin-right", "5px")
    .id("equipment-defense-input");
  let armorModifierInput = createInput("0", "number")
    .parent(defenseDiv)
    .style("width", "50px")
    .style("margin-bottom", "10px")
    .attribute("placeholder", "Mod")
    .id("equipment-armor-modifier-input");

  // --- Mutual Exclusivity for Checkboxes ---
  dualWieldCheckbox.changed(() => {
    if (dualWieldCheckbox.checked()) {
      twoHandedCheckbox.checked(false);
      twoHandedCheckbox.elt.disabled = true;
    } else {
      twoHandedCheckbox.elt.disabled = false;
    }
  });

  twoHandedCheckbox.changed(() => {
    if (twoHandedCheckbox.checked()) {
      dualWieldCheckbox.checked(false);
      dualWieldCheckbox.elt.disabled = true;
    } else {
      dualWieldCheckbox.elt.disabled = false;
    }
  });

  // --- Show/hide fields based on type ---
  function updateTypeVisibility() {
    let selectedType = typeSelect.value();
    if (["Chest", "Helm", "Gloves", "Greaves"].includes(selectedType)) {
      penaltyDiv.style("display", "block");
      defenseDiv.style("display", "block");
      damageDiceDiv.style("display", "none");
      linkedStatDiv.style("display", "none");
      weaponCategoryDiv.style("display", "none");
      dualWieldDiv.style("display", "none");
      twoHandedDiv.style("display", "none");
    } else if (["On-Hand", "Off-Hand"].includes(selectedType)) {
      penaltyDiv.style("display", "none");
      defenseDiv.style("display", "none");
      damageDiceDiv.style("display", "block");
      linkedStatDiv.style("display", "block");
      weaponCategoryDiv.style("display", "block");
      dualWieldDiv.style("display", "block");
      twoHandedDiv.style("display", "block");
    } else {
      penaltyDiv.style("display", "none");
      defenseDiv.style("display", "none");
      damageDiceDiv.style("display", "none");
      linkedStatDiv.style("display", "none");
      weaponCategoryDiv.style("display", "none");
      dualWieldDiv.style("display", "none");
      twoHandedDiv.style("display", "none");
    }
  }

  // Populate the dropdown – preserve the previous selection value
  function updateEquipmentOptions() {
    let selectedType = typeSelect.value();
    let selectedWeaponCategory = weaponCategorySelect.value();
    let isWeapon = ["On-Hand", "Off-Hand"].includes(selectedType);

    // Save the current selection value
    let prevValue = equipmentSelect.value();

    let filteredInventory = inventory.filter(item =>
      item.category === "Equipment" &&
      (selectedType === "Accessory" ? item.type === "Accessory" : item.type === selectedType) &&
      (!isWeapon || (item.weaponCategory === selectedWeaponCategory))
    );
    let filteredAvailable = (availableItems["Equipment"] || []).filter(item =>
      item.type === selectedType &&
      (!isWeapon || (item.weaponCategory === selectedWeaponCategory)) &&
      !inventory.some(i => i.name === item.name && i.category === "Equipment")
    );

    equipmentSelect.html("");
    equipmentSelect.option("Add New", -1);

    filteredInventory.forEach((item, idx) => {
      equipmentSelect.option(`[Inventory] ${item.name}`, idx);
    });
    filteredAvailable.forEach((item, idx) => {
      equipmentSelect.option(`[Available] ${item.name}`, filteredInventory.length + idx);
    });

    // Restore previous selection if it still exists, otherwise default to "Add New"
    if (prevValue !== null && equipmentSelect.elt.querySelector(`option[value="${prevValue}"]`)) {
      equipmentSelect.value(prevValue);
    } else {
      equipmentSelect.value(-1); // Default to "Add New" if previous selection is invalid
    }
  }

  // Load from selected – if "Add New" is selected, keep current field values
  function loadEquipmentData() {
    let idx = parseInt(equipmentSelect.value());
    let selectedType = typeSelect.value();
    let selectedWeaponCategory = weaponCategorySelect.value();
    let isWeapon = ["On-Hand", "Off-Hand"].includes(selectedType);

    let filteredInventory = inventory.filter(item =>
      item.category === "Equipment" &&
      (selectedType === "Accessory" ? item.type === "Accessory" : item.type === selectedType) &&
      (!isWeapon || (item.weaponCategory === selectedWeaponCategory))
    );
    let filteredAvailable = (availableItems["Equipment"] || []).filter(item =>
      item.type === selectedType &&
      (!isWeapon || (item.weaponCategory === selectedWeaponCategory)) &&
      !inventory.some(i => i.name === item.name && i.category === "Equipment")
    );

    if (idx === -1) {
      // "Add New" -- keep current field values
      return;
    }

    let item;
    if (idx < filteredInventory.length) {
      item = filteredInventory[idx];
    } else {
      let availableIdx = idx - filteredInventory.length;
      if (availableIdx >= 0 && availableIdx < filteredAvailable.length) {
        item = filteredAvailable[availableIdx];
      } else {
        console.log("Invalid index:", idx);
        return;
      }
    }

    // Populate form with selected item's data
    nameInput.value(item.name || "");
    descriptionInput.value(item.description || "");
    qualitySelect.value(item.quality || "Common");
    slotsSelect.value(item.crystalSlots || "0");

    if (["Chest", "Helm", "Gloves", "Greaves"].includes(selectedType)) {
      penaltySelect.value(item.movementPenalty || "0");
      defenseInput.value(item.defense || "0");
      armorModifierInput.value(item.modifier || "0");
    } else if (["On-Hand", "Off-Hand"].includes(selectedType)) {
      linkedStatSelect.value(item.linkedStat || "STR");
      damageDiceInput.value(item.damageDice || "");
      weaponModifierInput.value(item.modifier || "0");
      weaponCategorySelect.value(item.weaponCategory || "Melee - Heavy");
      dualWieldCheckbox.checked(item.dualWield || false);
      twoHandedCheckbox.checked(item.twoHanded || false);
      // Update mutual exclusivity
      if (dualWieldCheckbox.checked()) {
        twoHandedCheckbox.elt.disabled = true;
      } else {
        twoHandedCheckbox.elt.disabled = false;
      }
      if (twoHandedCheckbox.checked()) {
        dualWieldCheckbox.elt.disabled = true;
      } else {
        dualWieldCheckbox.elt.disabled = false;
      }
    }

    if (item.stATGonuses) {
      stATGonusStatSelect.value(item.stATGonuses.stat || "None");
      stATGonusAmountInput.value(item.stATGonuses.amount || "0");
    } else {
      stATGonusStatSelect.value("None");
      stATGonusAmountInput.value("0");
    }

    if (item.statRequirements) {
      let reqKeys = Object.keys(item.statRequirements);
      statReq1Select.value(reqKeys[0] || "None");
      statReq1Input.value(reqKeys[0] ? item.statRequirements[reqKeys[0]] : "");
      statReq2Select.value(reqKeys[1] || "None");
      statReq2Input.value(reqKeys[1] ? item.statRequirements[reqKeys[1]] : "");
    } else {
      statReq1Select.value("None");
      statReq1Input.value("");
      statReq2Select.value("None");
      statReq2Input.value("");
    }
  }

  // --- Event Listeners ---
  typeSelect.changed(() => {
    updateTypeVisibility();
    updateEquipmentOptions();
  });
  weaponCategorySelect.changed(() => {
    updateEquipmentOptions();
    loop();
    redraw();
    noLoop();
    setTimeout(loadEquipmentData, 0);
  });
  equipmentSelect.changed(loadEquipmentData);

  // Initial values
  typeSelect.value("On-Hand");
  weaponCategorySelect.value("Melee - Heavy");
  updateTypeVisibility();
  updateEquipmentOptions();

  // --- Button logic ---

  // Helper: Build item object from form
  function buildEquipmentObject() {
    let selectedType = typeSelect.value();
    let newName = nameInput.value().trim();

    let stATGonusStat = stATGonusStatSelect.value();
    let stATGonusAmount = parseInt(stATGonusAmountInput.value()) || 0;
    let stATGonuses = stATGonusStat !== "None" ? { stat: stATGonusStat, amount: stATGonusAmount } : null;

    let statReq1 = statReq1Select.value();
    let statReq1Value = parseInt(statReq1Input.value());
    let statReq2 = statReq2Select.value();
    let statReq2Value = parseInt(statReq2Input.value());
    let statRequirements = {};
    if (statReq1 !== "None" && statReq1Value) statRequirements[statReq1] = statReq1Value;
    if (statReq2 !== "None" && statReq2Value) statRequirements[statReq2] = statReq2Value;

    // Find the existing inventory item to preserve quantity
    let existingItem = inventory.find(i => i.name === nameInput.value() && i.category === "Equipment");
    let preservedQuantity = existingItem ? (existingItem.quantity || 1) : 1;

    let eq = {
      name: newName,
      description: descriptionInput.value(),
      type: typeSelect.value(),
      category: "Equipment",
      quality: qualitySelect.value(),
      crystalSlots: parseInt(slotsSelect.value()) || 0,
      quantity: preservedQuantity, // Preserve the existing quantity
      statRequirements: Object.keys(statRequirements).length > 0 ? statRequirements : {},
      dualWield: (["On-Hand", "Off-Hand"].includes(typeSelect.value())) ? dualWieldCheckbox.checked() : false,
      twoHanded: (["On-Hand", "Off-Hand"].includes(typeSelect.value())) ? twoHandedCheckbox.checked() : false,
    };

    if (["Chest", "Helm", "Gloves", "Greaves"].includes(selectedType)) {
      eq.movementPenalty = parseInt(penaltySelect.value()) || 0;
      eq.defense = parseInt(defenseInput.value()) || 0;
      eq.modifier = parseInt(armorModifierInput.value()) || 0;
    } else if (["On-Hand", "Off-Hand"].includes(selectedType)) {
      eq.linkedStat = linkedStatSelect.value();
      eq.damageDice = damageDiceInput.value().trim();
      eq.modifier = parseInt(weaponModifierInput.value()) || 0;
      eq.weaponCategory = weaponCategorySelect.value();
    }
    if (stATGonuses) eq.stATGonuses = stATGonuses;

    return eq;
  }

  // ADD => Add to inventory and update master list with form data
  createButton("Add")
    .parent(buttonContainer)
    .style("margin", "5px")
    .style("padding", "5px 10px")
    .style("background-color", "#4CAF50")
    .style("color", "white")
    .style("border", "none")
    .style("border-radius", "3px")
    .style("cursor", "pointer")
    .mousePressed(() => {
      successMessage.html("");
      successMessage.style("display", "none");
      errorMessage.html("");
      errorMessage.style("display", "none");

      let eqObj = buildEquipmentObject();
      if (!eqObj.name) {
        errorMessage.html("Please provide a name for the equipment.");
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        return;
      }

      let idx = parseInt(equipmentSelect.value());
      let selectedType = typeSelect.value();
      let isWeapon = ["On-Hand", "Off-Hand"].includes(selectedType);

      let allEquipment = inventory.filter(item =>
        item.category === "Equipment" &&
        (selectedType === "Accessory" ? item.type === "Accessory" : item.type === selectedType) &&
        (!isWeapon || (item.weaponCategory === weaponCategorySelect.value()))
      );
      let availEquipment = (availableItems["Equipment"] || []).filter(item =>
        item.type === selectedType &&
        (!isWeapon || (item.weaponCategory === weaponCategorySelect.value())) &&
        !inventory.some(i => i.name === item.name && i.category === "Equipment")
      );

      if (idx >= allEquipment.length && idx < allEquipment.length + availEquipment.length) {
        let availIdx = idx - allEquipment.length;
        if (availIdx >= 0 && availIdx < availEquipment.length) {
          let selectedItem = availEquipment[availIdx];
          if (inventory.some(i => i.name === eqObj.name && i.category === "Equipment")) {
            errorMessage.html(`This item is already in your inventory. Use 'Save' to update it.`);
            errorMessage.style("display", "block");
            contentWrapper.elt.scrollTop = 0;
            return;
          }
          let masterIdx = availableItems["Equipment"].findIndex(e => e.name === selectedItem.name);
          if (masterIdx !== -1) {
            availableItems["Equipment"][masterIdx] = eqObj;
          } else {
            availableItems["Equipment"].push(eqObj);
          }
          inventory.push(eqObj);
          console.log("Added to inventory and updated master list:", eqObj);
          localStorage.setItem('inventory', JSON.stringify(inventory));
          updateAvailableEquipment();
          updateEquipmentOptions();
          createInventoryUI();
          createEquipmentUI();
          successMessage.html("Equipment Added to Inventory");
          successMessage.style("display", "block");
          contentWrapper.elt.scrollTop = 0;
          // Try to select newly added item
          let newFilteredInventory = inventory.filter(item =>
            item.category === "Equipment" &&
            (selectedType === "Accessory" ? item.type === "Accessory" : item.type === selectedType) &&
            (!isWeapon || (item.weaponCategory === weaponCategorySelect.value()))
          );
          let newFilteredIdx = newFilteredInventory.findIndex(i => i.name === eqObj.name);
          if (newFilteredIdx !== -1) {
            equipmentSelect.value(newFilteredIdx.toString());
          }
        } else {
          errorMessage.html("Invalid item selection.");
          errorMessage.style("display", "block");
          contentWrapper.elt.scrollTop = 0;
        }
      } else if (idx === -1) {
        // Check for duplicates in both inventory and master list
        if (inventory.some(i => i.name === eqObj.name && i.category === "Equipment")) {
          errorMessage.html(`An equipment with the name "${eqObj.name}" already exists in your inventory.`);
          errorMessage.style("display", "block");
          contentWrapper.elt.scrollTop = 0;
          return;
        }
        let duplicateInMaster = availableItems["Equipment"].findIndex(e => e.name === eqObj.name);
        if (duplicateInMaster !== -1) {
          errorMessage.html(`An equipment with the name "${eqObj.name}" already exists in the master list.`);
          errorMessage.style("display", "block");
          contentWrapper.elt.scrollTop = 0;
          return;
        }
        inventory.push(eqObj);
        availableItems["Equipment"].push({ ...eqObj });
        console.log("Added new equipment to inventory and master list:", eqObj);
        localStorage.setItem('inventory', JSON.stringify(inventory));
        updateAvailableEquipment();
        updateEquipmentOptions();
        createInventoryUI();
        createEquipmentUI();
        successMessage.html("Equipment Added to Inventory");
        successMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        // Try to select newly added item
        let newFilteredInventory = inventory.filter(item =>
          item.category === "Equipment" &&
          (selectedType === "Accessory" ? item.type === "Accessory" : item.type === selectedType) &&
          (!isWeapon || (item.weaponCategory === weaponCategorySelect.value()))
        );
        let newFilteredIdx = newFilteredInventory.findIndex(i => i.name === eqObj.name);
        if (newFilteredIdx !== -1) {
          equipmentSelect.value(newFilteredIdx.toString());
        }
      } else {
        errorMessage.html("Please select an available item or 'Add New' to add.");
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
      }
    });

  // SAVE => Update master list, inventory, and conditionally unequip based on dualWield/twoHanded changes or canWieldItem
  createButton("Save")
    .parent(buttonContainer)
    .style("margin", "5px")
    .style("padding", "5px 10px")
    .style("background-color", "#2196F3")
    .style("color", "white")
    .style("border", "none")
    .style("border-radius", "3px")
    .style("cursor", "pointer")
    .mousePressed(() => {
      successMessage.html("");
      successMessage.style("display", "none");
      errorMessage.html("");
      errorMessage.style("display", "none");

      let eqObj = buildEquipmentObject();
      if (!eqObj.name) {
        errorMessage.html("Please provide a name for the equipment.");
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        return;
      }

      let idx = parseInt(equipmentSelect.value());
      let selectedType = typeSelect.value();
      let isWeapon = ["On-Hand", "Off-Hand"].includes(selectedType);

      let allEquipment = inventory.filter(item =>
        item.category === "Equipment" &&
        (selectedType === "Accessory" ? item.type === "Accessory" : item.type === selectedType) &&
        (!isWeapon || (item.weaponCategory === weaponCategorySelect.value()))
      );
      let availEquipment = (availableItems["Equipment"] || []).filter(item =>
        item.type === selectedType &&
        (!isWeapon || (item.weaponCategory === weaponCategorySelect.value())) &&
        !inventory.some(i => i.name === item.name && i.category === "Equipment")
      );

      let originalName = idx === -1 ? null : (idx < allEquipment.length ? allEquipment[idx].name : availEquipment[idx - allEquipment.length].name);

      let duplicateIdx = availableItems["Equipment"].findIndex(e => e.name === eqObj.name);
      if (duplicateIdx !== -1 && (originalName === null || originalName !== eqObj.name)) {
        errorMessage.html(`An equipment with the name "${eqObj.name}" already exists in the master list.`);
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        return;
      }

      // Update the master list
      if (idx === -1) {
        // "Add New" - Add to master list only
        availableItems["Equipment"].push(eqObj);
        console.log("Added new equipment to master list:", eqObj);
      } else {
        // Update existing item in master list
        let item;
        if (idx < allEquipment.length) {
          item = allEquipment[idx];
        } else {
          let availIdx = idx - allEquipment.length;
          if (availIdx >= 0 && availIdx < availEquipment.length) {
            item = availEquipment[availIdx];
          } else {
            errorMessage.html("Invalid item selection.");
            errorMessage.style("display", "block");
            contentWrapper.elt.scrollTop = 0;
            return;
          }
        }
        let masterIdx = availableItems["Equipment"].findIndex(e => e.name === item.name);
        if (masterIdx !== -1) {
          availableItems["Equipment"][masterIdx] = eqObj;
        } else {
          availableItems["Equipment"].push(eqObj);
        }
        console.log("Updated equipment in master list:", eqObj);

        // Update existing items in inventory with the same name
        inventory.forEach((invItem, invIdx) => {
          if (invItem.name === originalName && invItem.category === "Equipment") {
            let equippedCrystals = invItem.equippedCrystals || Array(eqObj.crystalSlots || 0).fill(null);
            inventory[invIdx] = { ...eqObj, equippedCrystals };
          }
        });

        // Check if dualWield or twoHanded has changed
        let originalDualWield = item.dualWield || false;
        let originalTwoHanded = item.twoHanded || false;
        let newDualWield = eqObj.dualWield;
        let newTwoHanded = eqObj.twoHanded;
        let wieldPropertiesChanged = originalDualWield !== newDualWield || originalTwoHanded !== newTwoHanded;

        // Update equipped items with the same name and check stat requirements
        let unequippedSlotsStat = [];
        let unequippedSlotsWield = [];
        for (let slot in equippedItems) {
          if (equippedItems[slot] && equippedItems[slot].name === originalName) {
            let equippedCrystals = equippedItems[slot].equippedCrystals || Array(eqObj.crystalSlots || 0).fill(null);
            equippedItems[slot] = { ...eqObj, equippedCrystals };

            // Check stat requirements with canWieldItem
            if (!canWieldItem(equippedItems[slot])) {
              unequippedSlotsStat.push(slot);
              equippedItems[slot] = null;
            }
            // If wield properties changed, unequip the item
            else if (wieldPropertiesChanged) {
              unequippedSlotsWield.push(slot);
              equippedItems[slot] = null;
            }
          }
        }

        // Combine reasons for unequipping and show pop-up
        let messageParts = [];
        if (unequippedSlotsStat.length > 0) {
          messageParts.push(`Equipment Updated: '${eqObj.name}' has been unequipped from slot(s) ${unequippedSlotsStat.join(", ")} due to unmet stat requirements.`);
        }
        if (unequippedSlotsWield.length > 0) {
          messageParts.push(`Equipment Updated: '${eqObj.name}' has been unequipped from slot(s) ${unequippedSlotsWield.join(", ")} due to changes in Dual Wield or Two-Handed properties.`);
        }
        if (messageParts.length > 0) {
          showConfirmationModal(
            messageParts.join(" "),
            () => {},
            true
          );
        }
      }

      localStorage.setItem('inventory', JSON.stringify(inventory));
      updateAvailableEquipment();
      updateEquipmentOptions();
      createInventoryUI();
      createEquipmentUI();
      updateStATGonusesDisplay();
      updateResourcesBasedOnStats();
      updateAbilities();
      successMessage.html("Equipment Updated in Master List and Inventory");
      successMessage.style("display", "block");
      contentWrapper.elt.scrollTop = 0;
    });

  // REMOVE => Remove item from master list and inventory
  createButton("Remove")
    .parent(buttonContainer)
    .style("margin", "5px")
    .style("padding", "5px 10px")
    .style("background-color", "#f44336")
    .style("color", "white")
    .style("border", "none")
    .style("border-radius", "3px")
    .style("cursor", "pointer")
    .mousePressed(() => {
      successMessage.html("");
      successMessage.style("display", "none");
      errorMessage.html("");
      errorMessage.style("display", "none");

      let idx = parseInt(equipmentSelect.value());
      if (idx === -1) {
        errorMessage.html("Please select an item to remove.");
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        return;
      }

      let selectedType = typeSelect.value();
      let isWeapon = ["On-Hand", "Off-Hand"].includes(selectedType);
      let filteredInventory = inventory.filter(i =>
        i.category === "Equipment" &&
        (selectedType === "Accessory" ? i.type === "Accessory" : i.type === selectedType) &&
        (!isWeapon || (i.weaponCategory === weaponCategorySelect.value()))
      );

      if (idx >= 0 && idx < filteredInventory.length) {
        let item = filteredInventory[idx];
        showConfirmationModal(
          `Remove the item from the master list? "${item.name}"`,
          () => {
            // If equipped, unequip
            if (equippedItems["Accessory 1"] && equippedItems["Accessory 1"].name === item.name) {
              equippedItems["Accessory 1"] = null;
            }
            if (equippedItems["Accessory 2"] && equippedItems["Accessory 2"].name === item.name) {
              equippedItems["Accessory 2"] = null;
            }
            // Remove from inventory
            inventory.splice(inventory.indexOf(item), 1);
            localStorage.setItem('inventory', JSON.stringify(inventory));
            updateStATGonusesDisplay();
            updateResourcesBasedOnStats();
            updateAvailableEquipment();
            updateAbilities();
            createInventoryUI();
            createEquipmentUI();
            modalDiv.remove();
          }
        );
      } else {
        errorMessage.html("Invalid item selected for removal.");
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
      }
    });

  // CLOSE => Close the modal
  createButton("Close")
    .parent(buttonContainer)
    .style("margin", "5px")
    .style("padding", "5px 10px")
    .style("background-color", "#ccc")
    .style("color", "black")
    .style("border", "none")
    .style("border-radius", "3px")
    .style("cursor", "pointer")
    .mousePressed(() => {
      modalDiv.remove();
    });
}
// ### Stats UI ###
function createStatsUI() {
  let statsContainer = select("#stats");
  if (!statsContainer) {
    console.error("No #stats div found in HTML!");
    return;
  }
  statsContainer.html(""); // Clear entire stats tab

  createElement("h2", "Stats").parent(statsContainer);
  let statsDesc = createP("Stats determine your character’s core abilities. The editable field shows your base stat value, the grayed-out field next to it displays your total stat value (including bonuses), and the green (positive) or red (negative) number indicates your stat bonus from equipment. Click a stat name for details.")
    .parent(statsContainer)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("margin-top", "5px")
    .style("margin-bottom", "10px");

  // Add "Lock to Level" checkbox
  let lockDiv = createDiv().parent(statsContainer).style("margin", "5px");
  let lockLabel = createSpan("Lock to Level: ").parent(lockDiv).style("margin-right", "5px");
  let lockCheckbox = createCheckbox("", lockToLevel)
    .parent(lockDiv)
    .style("display", "inline-block")
    .style("margin", "0 5px 0 0");
  createSpan("Limit stat points based on level (14 + 1 per level).")
    .parent(lockDiv)
    .style("font-size", "11px")
    .style("color", "#666")
    .style("display", "block")
    .style("margin-top", "2px");
  lockCheckbox.changed(() => {
    if (lockCheckbox.checked()) {
      // Calculate total points available and spent
      let distributablePoints = 14 + (level - 1);
      let startingPoints = 7; // 1 point per stat (7 stats)
      let pointsSpent = stat_str + stat_vit + stat_dex + stat_mag + stat_wil + stat_spr + stat_lck;
      let distributablePointsSpent = pointsSpent - startingPoints;
      if (distributablePointsSpent > distributablePoints) {
        showConfirmationModal(
          `Your current stats exceed the available points for your level (${distributablePoints} points). Please adjust your stats to within the limit before enabling Lock to Level.`,
          () => {},
          true
        );
        lockCheckbox.checked(false); // Prevent enabling
        return;
      }
    }
    lockToLevel = lockCheckbox.checked();
    updateStATGonusesDisplay();
  });

  // Display available points based on level
  let distributablePoints = 14 + (level - 1);
  let startingPoints = 7; // 1 point per stat (7 stats)
  let pointsSpent = stat_str + stat_vit + stat_dex + stat_mag + stat_wil + stat_spr + stat_lck;
  let distributablePointsSpent = pointsSpent - startingPoints;
  let pointsDiv = createDiv().parent(statsContainer).style("margin", "5px");
  createSpan(`Points Available: ${distributablePoints - distributablePointsSpent}/${distributablePoints}`).parent(pointsDiv);

  // Placeholder for Ability Points and Talent Points
  let abilityPoints = Math.floor((level - 1) / 2); // 1 point every 2 levels starting at level 3
  let talentPoints = Math.floor(level / 5); // 1 point every 5 levels starting at level 5
  let pointsInfoDiv = createDiv().parent(statsContainer).style("margin", "5px");
  createSpan(`Ability Points: ${abilityPoints} (future use)`).parent(pointsInfoDiv).style("margin-right", "10px");
  createSpan(`Talent Points: ${talentPoints} (future use)`).parent(pointsInfoDiv);

  // Stats without total or bonus display
  createStatInput("Level", "Level", level, statsContainer, "Level", false, false, false);
  createStatInput("EXP", "EXP", exp, statsContainer, "EXP", false, false, false);

  let movementDiv = createDiv().parent(statsContainer).style("margin", "5px");
  let movementLabel = createSpan("Movement: ").parent(movementDiv).style("cursor", "pointer");
  movementLabel.mouseClicked(() => showStatDescription("Movement", statDescriptions["Movement"] || "No description available."));
  statLabelElements["Movement"] = movementLabel;
  let movementInput = createInput(movement + " ft", "text")
    .parent(movementDiv)
    .style("width", "50px")
    .attribute("readonly", "true")
    .style("background-color", "#e0e0e0")
    .id("movementInput");

  // Stats with total and bonus display
  createStatInput("STR", "Strength", stat_str, statsContainer, "STR", true, false, true);
  createStatInput("VIT", "Vitality", stat_vit, statsContainer, "VIT", true, false, true);
  createStatInput("DEX", "Dexterity", stat_dex, statsContainer, "DEX", true, false, true);
  createStatInput("MAG", "Magic", stat_mag, statsContainer, "MAG", true, false, true);
  createStatInput("WIL", "Willpower", stat_wil, statsContainer, "WIL", true, false, true);
  createStatInput("SPR", "Spirit", stat_spr, statsContainer, "SPR", true, false, true);
  createStatInput("LCK", "Luck", stat_lck, statsContainer, "LCK", true, true, true);

  createAdditionalAttributesUI();

  // Reapply stat label colors from attributeLinkMapping
  for (let skillName in attributeLinkMapping) {
    let stat = attributeLinkMapping[skillName];
    if (statLabelElements[stat]) {
      let skillColor = additionalAttributes.find((a) => a.name === skillName).color;
      statLabelElements[stat].style("color", skillColor);
    }
  }

  // Update bonus display after creating the UI
  updateStATGonusesDisplay();
}
function createStatInput(abbrev, name, initialValue, container, statName, linkable, greyOutAtMax = false, showTotalAndBonus = false) {
  let div = createDiv().parent(container).style("margin", "5px");
  let label = createSpan(name + " (" + abbrev + "): ").parent(div).style("cursor", "pointer");
  label.mouseClicked(() => showStatDescription(name + " (" + abbrev + ")", statDescriptions[abbrev] || "No description available."));
  statLabelElements[abbrev] = label;

  let input = createInput(initialValue.toString(), "number").parent(div).style("width", "50px");
  input.changed(() => {
    let val = int(input.value());
    val = constrain(val, 1, 99); // Minimum is 1
    let success = tryChangeStat(statName, val);
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
    // Only update the UI if the change was successful
    if (success) {
      input.value(currentStatValue);
      if (greyOutAtMax && currentStatValue === 99) {
        input.attribute("disabled", "true").style("background-color", "#ccc");
      } else if (greyOutAtMax) {
        input.removeAttribute("disabled").style("background-color", "white");
      }
      // Update total stat display if applicable
      if (showTotalAndBonus) {
        let totalInput = select(`#total-${statName}`);
        if (totalInput) {
          totalInput.value(getTotalStat(statName));
        }
      }
      // Refresh the UI to update points display
      createStatsUI();
    } else {
      // Revert the input value if the change failed
      input.value(currentStatValue);
    }
  });

  // Add total stat field if applicable
  if (showTotalAndBonus) {
    let totalInput = createInput(getTotalStat(statName).toString(), "number")
      .parent(div)
      .style("width", "50px")
      .style("margin-left", "5px")
      .attribute("readonly", "true")
      .style("background-color", "#e0e0e0")
      .id(`total-${statName}`);
  }

  // Add bonus span if applicable
  if (showTotalAndBonus) {
    let bonusSpan = createSpan().parent(div).style("margin-left", "5px");
    stATGonusElements[abbrev] = bonusSpan;
  }
}
function tryChangeStat(statName, newValue) {
  let newValueInt = constrain(int(newValue), 1, 99); // Minimum is 1

  // Skip Level and EXP as they don't use points
  if (statName === "Level" || statName === "EXP") {
    if (statName === "Level") level = newValueInt;
    else if (statName === "EXP") exp = newValueInt;
    return true;
  }

  // Calculate total points available and spent
  let distributablePoints = 14 + (level - 1);
  let startingPoints = 7; // 1 point per stat (7 stats)
  let pointsSpent = stat_str + stat_vit + stat_dex + stat_mag + stat_wil + stat_spr + stat_lck;
  let distributablePointsSpent = pointsSpent - startingPoints;
  let currentStatValue;
  switch (statName) {
    case "STR": currentStatValue = stat_str; break;
    case "VIT": currentStatValue = stat_vit; break;
    case "DEX": currentStatValue = stat_dex; break;
    case "MAG": currentStatValue = stat_mag; break;
    case "WIL": currentStatValue = stat_wil; break;
    case "SPR": currentStatValue = stat_spr; break;
    case "LCK": currentStatValue = stat_lck; break;
    default: return false;
  }

  // Calculate new points spent if this stat changes
  let pointsDelta = newValueInt - currentStatValue;
  let newDistributablePointsSpent = distributablePointsSpent + pointsDelta;

  // Check if the change is allowed when "Lock to Level" is enabled
  if (lockToLevel && pointsDelta > 0 && newDistributablePointsSpent > distributablePoints) {
    showConfirmationModal(
      `Cannot increase ${statName}: you have no points remaining. Available points: ${distributablePoints - distributablePointsSpent}.`,
      () => {},
      true
    );
    return false;
  }

  // Check stat requirements for equipped items
  let bonuses = getStATGonuses();
  let newTotal = newValueInt + (bonuses[statName] || 0);
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

  // Apply the change
  switch (statName) {
    case "STR": stat_str = newValueInt; break;
    case "VIT": stat_vit = newValueInt; updateResourcesBasedOnStats(); break;
    case "DEX": stat_dex = newValueInt; break;
    case "MAG": stat_mag = newValueInt; break;
    case "WIL": stat_wil = newValueInt; updateResourcesBasedOnStats(); break;
    case "SPR": stat_spr = newValueInt; break;
    case "LCK": stat_lck = newValueInt; break;
  }
  updateStATGonusesDisplay();
  return true;
}
function createAdditionalAttributesUI() {
  let statsContainer = select("#stats");
  if (!statsContainer) return;

  skillsContainer.html(""); // Clear to prevent duplicates
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
    let skillColor = additionalAttributes.find((a) => a.name === skillName).color;
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
    console.error("No #equipment div found in HTML! Please ensure your HTML includes <div id=\"equipment\"></div>");
    return;
  }
  equipmentContainerDiv.html("");

  createElement("h2", "Equipment").parent(equipmentContainerDiv);
  createSpan("Click a Slot to view the equipped item’s details. Click Crystal Slots to equip crystals.")
    .parent(equipmentContainerDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("margin-top", "5px")
    .style("margin-bottom", "10px");

  let equipmentTable = createElement("table")
    .parent(equipmentContainerDiv)
    .id("equipmentTable")
    .style("width", "100%")
    .style("border-collapse", "collapse")
    .style("margin-top", "10px");
  let headerRow = createElement("tr").parent(equipmentTable);
  ["Slot", "Name", "Requirements", "Damage/Defense", "Mov. Penalty", "Crystal Slots", "Stat Bonus", "Linked Stat", "Weapon Category"].forEach((header) => {
    createElement("th", header)
      .parent(headerRow)
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("background", "#f2f2f2");
  });

  // Check if a two-handed weapon is equipped in either hand
  let twoHandedInOnHand = equippedItems["On-Hand"] && equippedItems["On-Hand"].twoHanded;
  let twoHandedInOffHand = equippedItems["Off-Hand"] && equippedItems["Off-Hand"].twoHanded;
  let disableOnHand = twoHandedInOffHand;
  let disableOffHand = twoHandedInOnHand;

  Object.keys(equippedItems).forEach((slot) => {
    let row = createElement("tr").parent(equipmentTable);
    let slotCell = createElement("td")
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("cursor", "pointer");
    createSpan(slot)
      .parent(slotCell)
      .style("color", equippedItems[slot] ? "blue" : "black")
      .style("text-decoration", equippedItems[slot] ? "underline" : "none")
      .mousePressed(() => showEquipmentDescription(slot, equippedItems[slot], false));

    let nameCell = createElement("td")
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");
    let itemSelect = createSelect()
      .parent(nameCell)
      .style("width", "100%");
    let item = equippedItems[slot];
    let itemName = item ? item.name : "None";
    itemSelect.option("None", "None");
    let availableItems = availableEquipment[slot];
    if (availableItems) {
      availableItems.forEach(item => {
        // Prevent the same accessory from being equipped in both slots
        let isAlreadyEquipped = false;
        if (slot === "Accessory 1" && equippedItems["Accessory 2"] && equippedItems["Accessory 2"].name === item.name) {
          isAlreadyEquipped = true;
        } else if (slot === "Accessory 2" && equippedItems["Accessory 1"] && equippedItems["Accessory 1"].name === item.name) {
          isAlreadyEquipped = true;
        }
        // For On-Hand and Off-Hand, also check if the item is already equipped in the other slot
        if (slot === "On-Hand" && equippedItems["Off-Hand"] && equippedItems["Off-Hand"].name === item.name) {
          isAlreadyEquipped = true;
        } else if (slot === "Off-Hand" && equippedItems["On-Hand"] && equippedItems["On-Hand"].name === item.name) {
          isAlreadyEquipped = true;
        }
        // Only add the item to the dropdown if there's enough quantity remaining
        let equippedCount = Object.values(equippedItems).filter(eq => eq && eq.name === item.name).length;
        let inventoryItem = inventory.find(i => i.name === item.name && i.category === "Equipment");
        let totalQuantity = inventoryItem ? (inventoryItem.quantity || 1) : 1;
        let remainingQuantity = totalQuantity - equippedCount;
        if (!isAlreadyEquipped || remainingQuantity > 0) {
          itemSelect.option(item.name, item.name);
        }
      });
    }
    itemSelect.value(itemName);

    // Disable the dropdown if the opposite hand has a two-handed weapon
    if ((slot === "On-Hand" && disableOnHand) || (slot === "Off-Hand" && disableOffHand)) {
      itemSelect.elt.disabled = true;
      itemSelect.style("background", "#e0e0e0"); // Gray out the dropdown
    } else {
      itemSelect.elt.disabled = false;
      itemSelect.style("background", "white"); // Re-enable the dropdown
    }

    itemSelect.changed(() => {
      let selectedName = itemSelect.value();
      console.log(`Selected item in ${slot}: ${selectedName}`);
      if (selectedName === "None") {
        equippedItems[slot] = null;
      } else {
        let selectedItem = availableItems.find(item => item.name === selectedName);
        console.log(`Found selectedItem:`, selectedItem);
        if (selectedItem && canWieldItem(selectedItem)) {
          equippedItems[slot] = { ...selectedItem, equippedCrystals: equippedItems[slot]?.equippedCrystals || Array(selectedItem.crystalSlots || 0).fill(null) };
          // Handle Two-Handed logic
          if (selectedItem.twoHanded) {
            let otherSlot = slot === "On-Hand" ? "Off-Hand" : slot === "Off-Hand" ? "On-Hand" : null;
            if (otherSlot && equippedItems[otherSlot]) {
              let unequippedItem = equippedItems[otherSlot].name;
              equippedItems[otherSlot] = null;
              showConfirmationModal(
                `Equipped ${selectedItem.name} in ${slot}, unequipped ${unequippedItem} from ${otherSlot} as ${selectedItem.name} is two-handed.`,
                () => {},
                true
              );
            }
          }
        } else {
          let errorMessage = selectedItem ? `Cannot equip ${selectedName}: stat requirements not met.` : `Cannot equip ${selectedName}: item not found.`;
          showConfirmationModal(errorMessage, () => {}, true);
          itemSelect.value(equippedItems[slot] ? equippedItems[slot].name : "None");
          return;
        }
      }
      calculateMovement();
      updateStATGonusesDisplay();
      updateResourcesBasedOnStats();
      updateAbilities();
      createEquipmentUI();
    });

    let itemData = equippedItems[slot];
    let reqText = itemData && itemData.statRequirements ? Object.entries(itemData.statRequirements).map(([stat, val]) => `${val} ${stat}`).join(", ") : "-";
    createElement("td", reqText)
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");

    let dmgDefText = "-";
    if (itemData) {
      if (itemData.damageDice) dmgDefText = `${itemData.damageDice}${itemData.modifier ? (itemData.modifier > 0 ? `+${itemData.modifier}` : itemData.modifier) : ""}`;
      else if (itemData.defense) dmgDefText = `${itemData.defense}${itemData.modifier ? (itemData.modifier > 0 ? `+${itemData.modifier}` : itemData.modifier) : ""}`;
    }
    createElement("td", dmgDefText)
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");

    createElement("td", itemData && itemData.movementPenalty !== undefined ? itemData.movementPenalty.toString() : "-")
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");

    let crystalCell = createElement("td", itemData && itemData.crystalSlots !== undefined ? itemData.crystalSlots.toString() : "0")
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("cursor", itemData ? "pointer" : "default")
      .style("color", itemData ? "blue" : "black");
    if (itemData) {
      crystalCell.mousePressed(() => showEquipmentDescription(slot, itemData, true));
    }

    let bonusText = itemData && itemData.stATGonuses ? `${itemData.stATGonuses.stat} ${itemData.stATGonuses.amount > 0 ? "+" : ""}${itemData.stATGonuses.amount}` : "-";
    createElement("td", bonusText)
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");

    createElement("td", itemData && itemData.linkedStat ? itemData.linkedStat : "-")
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");

    let weaponCategoryText = (itemData && (slot === "On-Hand" || slot === "Off-Hand")) ? (itemData.weaponCategory || "-") : "-";
    createElement("td", weaponCategoryText)
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");
  });
}
function showModifyCrystalsModal() {
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
    .style("width", "300px")
    .style("box-sizing", "border-box");

  let contentWrapper = createDiv()
    .parent(modalDiv)
    .style("max-height", "60vh")
    .style("overflow-y", "auto")
    .style("padding-bottom", "10px");

  createElement("h3", "Manage Crystals").parent(contentWrapper);

  let successMessage = createP("")
    .parent(contentWrapper)
    .style("color", "green")
    .style("display", "none")
    .style("margin-bottom", "10px");

  let errorMessage = createP("")
    .parent(contentWrapper)
    .style("color", "red")
    .style("display", "none")
    .style("margin-bottom", "10px");

  let crystalSelectDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Crystal:").parent(crystalSelectDiv).style("display", "block");
  let crystalSelect = createSelect().parent(crystalSelectDiv).style("width", "100%");
  createSpan("Select a crystal to edit or 'None' to add a new one.")
    .parent(crystalSelectDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let nameDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Name:").parent(nameDiv).style("display", "inline-block").style("width", "100px");
  let nameInput = createInput("")
    .parent(nameDiv)
    .style("width", "180px")
    .attribute("placeholder", "e.g., Fire Crystal");
  createSpan("The crystal’s unique identifier.").parent(nameDiv).style("font-size", "12px").style("color", "#666").style("display", "block");

  let descDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Description:").parent(descDiv).style("display", "inline-block").style("width", "100px");
  let descInput = createInput("")
    .parent(descDiv)
    .style("width", "180px")
    .attribute("placeholder", "Describe the crystal...");
  createSpan("What the crystal does or its lore.").parent(descDiv).style("font-size", "12px").style("color", "#666").style("display", "block");

  let stATGonusDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Stat Bonus:").parent(stATGonusDiv).style("display", "inline-block").style("width", "100px");
  let statSelect = createSelect().parent(stATGonusDiv).style("width", "80px").style("margin-right", "5px");
  ["None", "STR", "VIT", "DEX", "MAG", "WIL", "SPR", "LCK"].forEach(stat => statSelect.option(stat));
  let amountInput = createInput("0", "number")
    .parent(stATGonusDiv)
    .style("width", "50px")
    .attribute("placeholder", "e.g., 2");
  createSpan("Stat to boost (e.g., MAG) and amount.").parent(stATGonusDiv).style("font-size", "12px").style("color", "#666").style("display", "block");

  let statReqDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Stat Requirement:").parent(statReqDiv).style("display", "inline-block").style("width", "100px");
  let statReqSelect = createSelect().parent(statReqDiv).style("width", "80px").style("margin-right", "5px");
  ["None", "STR", "VIT", "DEX", "MAG", "WIL", "SPR", "LCK"].forEach(stat => statReqSelect.option(stat));
  let statReqInput = createInput("0", "number")
    .parent(statReqDiv)
    .style("width", "50px")
    .attribute("placeholder", "e.g., 5");
  createSpan("Minimum stat needed to equip (e.g., 5 MAG).").parent(statReqDiv).style("font-size", "12px").style("color", "#666").style("display", "block");

  let abilitiesDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Abilities:").parent(abilitiesDiv).style("display", "inline-block").style("width", "100px");
  let abilitiesInput = createInput("")
    .parent(abilitiesDiv)
    .style("width", "180px")
    .attribute("placeholder", "e.g., Fire, Cure");
  createSpan("Skills granted (comma-separated).").parent(abilitiesDiv).style("font-size", "12px").style("color", "#666").style("display", "block");

  let buttonContainer = createDiv()
    .parent(modalDiv)
    .style("padding", "10px 0")
    .style("border-top", "1px solid #ccc")
    .style("display", "flex")
    .style("justify-content", "space-between")
    .style("gap", "5px");

  function updateCrystalOptions() {
    let crystalsFromInventory = inventory.filter(item => item.category === "Crystals");
    let crystalsFromAvailable = (availableItems["Crystals"] || []).filter(item => 
      !crystalsFromInventory.some(invItem => invItem.name === item.name)
    );
    crystalSelect.html("");
    crystalSelect.option("None", -1);
    crystalsFromInventory.forEach((crystal, idx) => crystalSelect.option(`[Inventory] ${crystal.name}`, idx));
    crystalsFromAvailable.forEach((crystal, idx) => crystalSelect.option(`[Available] ${crystal.name}`, crystalsFromInventory.length + idx));
  }

  function loadCrystalData() {
    let idx = parseInt(crystalSelect.value());
    let crystalsFromInventory = inventory.filter(item => item.category === "Crystals");
    let crystalsFromAvailable = (availableItems["Crystals"] || []).filter(item => 
      !crystalsFromInventory.some(invItem => invItem.name === item.name)
    );

    if (idx === -1) {
      nameInput.value("");
      descInput.value("");
      statSelect.value("None");
      amountInput.value(0);
      statReqSelect.value("None");
      statReqInput.value(0);
      abilitiesInput.value("");
    } else if (idx < crystalsFromInventory.length) {
      let crystal = crystalsFromInventory[idx];
      nameInput.value(crystal.name || "");
      descInput.value(crystal.description || "");
      let stATGonuses = crystal.stATGonuses || {};
      let stat = Object.keys(stATGonuses).length > 0 ? Object.keys(stATGonuses)[0] : "None";
      statSelect.value(stat);
      amountInput.value(stat !== "None" && stATGonuses[stat] ? stATGonuses[stat] : 0);
      let statReqs = crystal.statRequirements || {};
      let reqStat = Object.keys(statReqs).length > 0 ? Object.keys(statReqs)[0] : "None";
      statReqSelect.value(reqStat);
      statReqInput.value(reqStat !== "None" && statReqs[reqStat] ? statReqs[reqStat] : 0);
      abilitiesInput.value(crystal.abilities && Array.isArray(crystal.abilities) ? crystal.abilities.join(", ") : "");
    } else {
      let availableIdx = idx - crystalsFromInventory.length;
      if (availableIdx >= 0 && availableIdx < crystalsFromAvailable.length) {
        let crystal = crystalsFromAvailable[availableIdx];
        nameInput.value(crystal.name || "");
        descInput.value(crystal.description || "");
        let stATGonuses = crystal.stATGonuses || {};
        let stat = Object.keys(stATGonuses).length > 0 ? Object.keys(stATGonuses)[0] : "None";
        statSelect.value(stat);
        amountInput.value(stat !== "None" && stATGonuses[stat] ? stATGonuses[stat] : 0);
        let statReqs = crystal.statRequirements || {};
        let reqStat = Object.keys(statReqs).length > 0 ? Object.keys(statReqs)[0] : "None";
        statReqSelect.value(reqStat);
        statReqInput.value(reqStat !== "None" && statReqs[reqStat] ? statReqs[reqStat] : 0);
        abilitiesInput.value(crystal.abilities && Array.isArray(crystal.abilities) ? crystal.abilities.join(", ") : "");
      }
    }
  }

  crystalSelect.changed(loadCrystalData);
  updateCrystalOptions();

  createButton("Add")
    .parent(buttonContainer)
    .style("margin", "5px")
    .style("padding", "5px 10px")
    .style("background-color", "#4CAF50")
    .style("color", "white")
    .style("border", "none")
    .style("border-radius", "3px")
    .style("cursor", "pointer")
    .mousePressed(() => {
      let idx = parseInt(crystalSelect.value());
      let crystalsFromInventory = inventory.filter(item => item.category === "Crystals");
      let crystalsFromAvailable = (availableItems["Crystals"] || []).filter(item => 
        !crystalsFromInventory.some(invItem => invItem.name === item.name)
      );

      if (idx === -1) {
        let name = nameInput.value().trim();
        let desc = descInput.value().trim();
        let stat = statSelect.value();
        let amount = parseInt(amountInput.value()) || 0;
        let reqStat = statReqSelect.value();
        let reqAmount = parseInt(statReqInput.value()) || 0;
        let abilities = abilitiesInput.value().split(",").map(a => a.trim()).filter(a => a);

        if (!name || !desc) {
          errorMessage.html("Please provide a name and description.");
          errorMessage.style("display", "block");
          successMessage.style("display", "none");
          return;
        }

        if (inventory.some(item => item.name === name && item.category === "Crystals")) {
          errorMessage.html(`A crystal with the name "${name}" already exists in inventory.`);
          errorMessage.style("display", "block");
          successMessage.style("display", "none");
          return;
        }

        if (availableItems["Crystals"] && availableItems["Crystals"].some(item => item.name === name)) {
          errorMessage.html(`A crystal with the name "${name}" already exists in available items.`);
          errorMessage.style("display", "block");
          successMessage.style("display", "none");
          return;
        }

        let crystal = {
          name,
          description: desc,
          category: "Crystals",
          stATGonuses: stat !== "None" ? { [stat]: amount } : {},
          statRequirements: reqStat !== "None" ? { [reqStat]: reqAmount } : {},
          abilities: abilities.length > 0 ? abilities : [],
          quantity: 1,
          quality: "Common"
        };

        inventory.push(crystal);
        // Add to availableItems to preserve it after deletion
        if (!availableItems["Crystals"]) {
          availableItems["Crystals"] = [];
        }
        availableItems["Crystals"].push({ ...crystal });
        console.log("Added crystal to availableItems['Crystals']:", availableItems["Crystals"]);
      } else if (idx >= crystalsFromInventory.length) {
        let availableIdx = idx - crystalsFromInventory.length;
        if (availableIdx < 0 || availableIdx >= crystalsFromAvailable.length) {
          errorMessage.html("Invalid available crystal selected.");
          errorMessage.style("display", "block");
          successMessage.style("display", "none");
          return;
        }
        let crystal = crystalsFromAvailable[availableIdx];
        if (inventory.some(item => item.name === crystal.name && item.category === "Crystals")) {
          errorMessage.html(`Crystal "${crystal.name}" already exists in inventory. Use Save to update it.`);
          errorMessage.style("display", "block");
          successMessage.style("display", "none");
          return;
        }
        inventory.push({ ...crystal, quantity: 1 });
      } else {
        errorMessage.html("Please select 'None' to add a new crystal or an available crystal.");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        return;
      }

      localStorage.setItem('inventory', JSON.stringify(inventory));
      updateAvailableEquipment();
      createEquipmentUI();
      if (typeof createInventoryUI === "function") createInventoryUI();
      // Show success message and reset form state without closing the modal
      successMessage.html("Crystal Added to Inventory");
      successMessage.style("display", "block");
      errorMessage.style("display", "none");
      // Reset the form to "None" state
      crystalSelect.value("-1");
      updateCrystalOptions();
      loadCrystalData();
      // Scroll to the top to show the success message
      contentWrapper.elt.scrollTop = 0;
    });

  createButton("Save")
    .parent(buttonContainer)
    .style("margin", "5px")
    .style("padding", "5px 10px")
    .style("background-color", "#2196F3")
    .style("color", "white")
    .style("border", "none")
    .style("border-radius", "3px")
    .style("cursor", "pointer")
    .mousePressed(() => {
      let idx = parseInt(crystalSelect.value());
      if (idx === -1) {
        errorMessage.html("Please select a crystal to edit.");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        return;
      }

      let crystalsFromInventory = inventory.filter(item => item.category === "Crystals");
      let crystalsFromAvailable = (availableItems["Crystals"] || []).filter(item => 
        !crystalsFromInventory.some(invItem => invItem.name === item.name)
      );

      let crystal, originalName, inventoryIdx, availableItemIdx = -1;
      let isFromAvailableItems = false;

      if (idx < crystalsFromInventory.length) {
        crystal = crystalsFromInventory[idx];
        originalName = crystal.name;
        inventoryIdx = inventory.indexOf(crystal);
      } else {
        let availableIdx = idx - crystalsFromInventory.length;
        if (availableIdx < 0 || availableIdx >= crystalsFromAvailable.length) {
          errorMessage.html("Invalid crystal selected.");
          errorMessage.style("display", "block");
          successMessage.style("display", "none");
          return;
        }
        crystal = crystalsFromAvailable[availableIdx];
        originalName = crystal.name;
        inventoryIdx = inventory.findIndex(i => i.name === crystal.name && i.category === "Crystals");
        isFromAvailableItems = true;
        availableItemIdx = availableItems["Crystals"].findIndex(i => i.name === originalName);
      }

      let newName = nameInput.value().trim();
      let newDesc = descInput.value().trim();
      let stat = statSelect.value();
      let amount = parseInt(amountInput.value()) || 0;
      let reqStat = statReqSelect.value();
      let reqAmount = parseInt(statReqInput.value()) || 0;
      let abilities = abilitiesInput.value().split(",").map(a => a.trim()).filter(a => a);

      if (!newName || !newDesc) {
        errorMessage.html("Please provide a name and description.");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        return;
      }

      if (newName !== crystal.name && inventory.some(item => item.name === newName && item.category === "Crystals" && item !== crystal)) {
        errorMessage.html(`A crystal with the name "${newName}" already exists in inventory.`);
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        return;
      }

      if (newName !== crystal.name && availableItems["Crystals"] && availableItems["Crystals"].some(item => item.name === newName && item !== crystal)) {
        errorMessage.html(`A crystal with the name "${newName}" already exists in available items.`);
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        return;
      }

      let updatedCrystal = {
        name: newName,
        description: newDesc,
        category: "Crystals",
        stATGonuses: stat !== "None" ? { [stat]: amount } : {},
        statRequirements: reqStat !== "None" ? { [reqStat]: reqAmount } : {},
        abilities: abilities.length > 0 ? abilities : [],
        quantity: crystal.quantity || 1,
        quality: crystal.quality || "Common"
      };

      if (isFromAvailableItems && availableItemIdx !== -1) {
        availableItems["Crystals"][availableItemIdx] = updatedCrystal;
        if (inventoryIdx !== -1) inventory.splice(inventoryIdx, 1); // Remove duplicate if it exists
      } else {
        inventory[inventoryIdx] = updatedCrystal;
        if (originalName && availableItems["Crystals"]) {
          let availableIdx = availableItems["Crystals"].findIndex(i => i.name === originalName);
          if (availableIdx !== -1) availableItems["Crystals"][availableIdx] = { ...updatedCrystal };
        }
        for (let slot in equippedItems) {
          let item = equippedItems[slot];
          if (item && item.equippedCrystals) {
            item.equippedCrystals = item.equippedCrystals.map(c => (c && c.name === crystal.name ? updatedCrystal : c));
          }
        }
      }

      localStorage.setItem('inventory', JSON.stringify(inventory));
      updateStATGonusesDisplay();
      updateResourcesBasedOnStats();
      updateAbilities();
      createEquipmentUI();
      if (typeof createInventoryUI === "function") createInventoryUI();

      successMessage.html("Crystal Updated");
      successMessage.style("display", "block");
      errorMessage.style("display", "none");
      crystalSelect.value("-1");
      updateCrystalOptions();
      loadCrystalData();
      contentWrapper.elt.scrollTop = 0;
    });

  createButton("Remove")
    .parent(buttonContainer)
    .style("margin", "5px")
    .style("padding", "5px 10px")
    .style("background-color", "#f44336")
    .style("color", "white")
    .style("border", "none")
    .style("border-radius", "3px")
    .style("cursor", "pointer")
    .mousePressed(() => {
      let idx = parseInt(crystalSelect.value());
      if (idx === -1) {
        errorMessage.html("Please select a crystal to remove.");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        return;
      }

      let crystalsFromInventory = inventory.filter(item => item.category === "Crystals");
      if (idx < 0 || idx >= crystalsFromInventory.length) {
        errorMessage.html("Invalid crystal selected.");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        return;
      }

      let crystal = crystalsFromInventory[idx];
      showConfirmationModal(
        `Are you sure you want to remove "${crystal.name}"?`,
        () => {
          for (let slot in equippedItems) {
            let item = equippedItems[slot];
            if (item && item.equippedCrystals) {
              item.equippedCrystals = item.equippedCrystals.map(c => (c && c.name === crystal.name ? null : c));
            }
          }
          inventory.splice(inventory.indexOf(crystal), 1);
          localStorage.setItem('inventory', JSON.stringify(inventory));
          updateStATGonusesDisplay();
          updateResourcesBasedOnStats();
          updateAbilities();
          createEquipmentUI();
          if (typeof createInventoryUI === "function") createInventoryUI();
          modalDiv.remove();
          errorMessage.style("display", "none");
          successMessage.style("display", "none");
        }
      );
    });

  createButton("Close")
    .parent(buttonContainer)
    .style("margin", "5px")
    .style("padding", "5px 10px")
    .style("background-color", "#ccc")
    .style("color", "black")
    .style("border", "none")
    .style("border-radius", "3px")
    .style("cursor", "pointer")
    .mousePressed(() => {
      modalDiv.remove();
      errorMessage.style("display", "none");
      successMessage.style("display", "none");
    });
}
function createEquipmentFromModal(
  typeSelect,
  nameInput,
  penaltySelect,
  slotsSelect,
  linkedStatSelect,
  stATGonusAmountInput,
  stATGonusStatSelect,
  descriptionInput,
  statReq1Select,
  statReq1Input,
  statReq2Select,
  statReq2Input,
  damageDiceInput,
  defenseInput,
  modifierInput
) {
    let newEquipment = {
    name: nameInput.value(),
    type: typeSelect.value(),
    description: descriptionInput.value(),
    crystalSlots: parseInt(slotsSelect.value()),
    equippedCrystals: Array(parseInt(slotsSelect.value())).fill(null) // Initialize slots
  };
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
  let stATGonusAmount = parseInt(stATGonusAmountInput.value()) || 0;
  let stATGonusStat =
    stATGonusStatSelect.value() === "None" ? null : stATGonusStatSelect.value();
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
    stATGonus:
      stATGonusAmount !== 0 && stATGonusStat
        ? { amount: stATGonusAmount, stat: stATGonusStat }
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
    return newEquipment;
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
  updateStATGonusesDisplay();
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
  availableEquipment = {
    "On-Hand": [],
    "Off-Hand": [],
    "Chest": [],
    "Helm": [],
    "Gloves": [],
    "Greaves": [],
    "Accessory 1": [],
    "Accessory 2": []
  };

  // Populate availableEquipment using only items from inventory
  inventory.forEach(item => {
    if (item.category === "Equipment") {
      let slot = item.type;
      if (slot === "Accessory") {
        // Accessories can go in either slot
        availableEquipment["Accessory 1"].push(item);
        availableEquipment["Accessory 2"].push(item);
      } else if (slot === "On-Hand" || slot === "Off-Hand") {
        // Handle Dual Wield: if dualWield is true, add to both On-Hand and Off-Hand
        if (item.dualWield) {
          availableEquipment["On-Hand"].push(item);
          availableEquipment["Off-Hand"].push(item);
        } else {
          // Only add to the slot matching the item's type if not dualWield
          availableEquipment[slot].push(item);
        }
      } else {
        availableEquipment[slot].push(item);
      }
    }
  });

  // Remove duplicates by converting to a Set and back to an array (based on item.name)
  for (let slot in availableEquipment) {
    let uniqueItems = [];
    let seenNames = new Set();
    availableEquipment[slot].forEach(item => {
      if (!seenNames.has(item.name)) {
        seenNames.add(item.name);
        uniqueItems.push(item);
      }
    });
    availableEquipment[slot] = uniqueItems;
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

function getStATGonuses() {
  let bonuses = {};
  for (let slot in equippedItems) {
    let item = equippedItems[slot];
    if (item) {
      // Equipment bonuses - Fixed to use stATGonuses
      if (item.stATGonuses) {
        let stat = item.stATGonuses.stat;
        let amount = item.stATGonuses.amount || 0;
        bonuses[stat] = (bonuses[stat] || 0) + amount;
      }
      // Crystal bonuses (already using stATGonuses)
      if (item.equippedCrystals) {
        item.equippedCrystals.forEach(crystal => {
          if (crystal && crystal.stATGonuses) {
            for (let stat in crystal.stATGonuses) {
              bonuses[stat] = (bonuses[stat] || 0) + crystal.stATGonuses[stat];
            }
          }
        });
      }
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
  let bonuses = getStATGonuses();
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

function updateStATGonusesDisplay() {
  let bonuses = getStATGonuses();
  for (let stat in stATGonusElements) {
    // Skip Level, EXP, and Movement
    if (stat === "Level" || stat === "EXP" || stat === "Movement") {
      continue;
    }
    let bonus = bonuses[stat] || 0;
    if (bonus !== 0) {
      stATGonusElements[stat].html(`${bonus > 0 ? '+' : ''}${bonus}`);
      stATGonusElements[stat].style("color", bonus > 0 ? "green" : "red");
    } else {
      stATGonusElements[stat].html("");
    }
  }
}
// Inventory UI Creation
// Inventory UI Creation
function createInventoryUI() {
  console.log("Creating Inventory UI, current inventory:", JSON.stringify(inventory, null, 2));
  let inventoryContainer = select("#inventory");
  if (!inventoryContainer) {
    console.error("No #inventory div found in HTML!");
    return;
  }
  inventoryContainer.html("");

  createElement("h2", "Inventory").parent(inventoryContainer);
  createSpan("Use buttons to add, edit, or remove items. Click an item’s name to view details. Adjust Quantity directly.")
    .parent(inventoryContainer)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block")
    .style("margin-bottom", "10px");

  let buttonRow = createDiv().parent(inventoryContainer).class("resource-row");
  createButton("Modify Items")
    .parent(buttonRow)
    .class("resource-button")
    .mousePressed(showModifyItemsModal);
  createButton("Modify Equipment")
    .parent(buttonRow)
    .class("resource-button")
    .mousePressed(showAddEditEquipmentModal);
  createButton("Modify Crystals")
    .parent(buttonRow)
    .class("resource-button")
    .mousePressed(showModifyCrystalsModal);
  createButton("Default Equipment List")
    .parent(buttonRow)
    .class("resource-button")
    .mousePressed(() => {
      showConfirmationModal("Are you sure you want to add the default equipment list to your inventory?", () => {
        console.log("Adding default equipment list to inventory");
        let defaultEquipment = availableItems["Equipment"] || [];
        defaultEquipment.forEach(item => {
          if (!inventory.some(i => i.name === item.name && i.category === "Equipment")) {
            inventory.push({ ...item, quantity: 1 });
          }
        });
        localStorage.setItem('inventory', JSON.stringify(inventory));
        updateAvailableEquipment();
        createInventoryUI();
        createEquipmentUI();
      });
    });
  createButton("Default Items List")
    .parent(buttonRow)
    .class("resource-button")
    .mousePressed(() => {
      showConfirmationModal("Are you sure you want to add the default items list to your inventory?", () => {
        console.log("Adding default items list to inventory");
        ["Consumables", "Materials", "Crystals", "Miscellaneous"].forEach(cat => {
          let defaultItems = availableItems[cat] || [];
          defaultItems.forEach(item => {
            if (!inventory.some(i => i.name === item.name && i.category === cat)) {
              inventory.push({ ...item, quantity: 1 });
            }
          });
        });
        localStorage.setItem('inventory', JSON.stringify(inventory));
        updateAvailableEquipment();
        createInventoryUI();
        createEquipmentUI();
      });
    });

  let categoryContainer = createDiv().parent(inventoryContainer).style("margin-top", "10px");

  let inventoryCategories = ["Equipment", "Crystals", "Consumables", "Materials", "Quest Items", "Miscellaneous"];
  let itemsByCategory = {};
  inventoryCategories.forEach(cat => itemsByCategory[cat] = []);
  inventory.forEach(item => {
    const category = item.category || "Miscellaneous";
    if (!itemsByCategory[category]) itemsByCategory[category] = [];
    itemsByCategory[category].push(item);
  });

  inventoryCategories.forEach(category => {
    let items = itemsByCategory[category];
    let categoryDiv = createDiv().parent(categoryContainer).style("margin-bottom", "10px");
    let categoryHeader = createElement("h3", `${category} (${items.length})`)
      .parent(categoryDiv)
      .style("cursor", "pointer")
      .style("margin", "0")
      .style("background", "#f2f2f2")
      .style("padding", "5px");

    let contentDiv = createDiv().parent(categoryDiv);
    contentDiv.style("display", categoryStates[category] ? "block" : "none");

    // Toggle visibility and class for arrow indicator
    categoryHeader.mousePressed(() => {
      const isVisible = contentDiv.style("display") === "block";
      categoryStates[category] = !isVisible;
      contentDiv.style("display", isVisible ? "none" : "block");
      if (isVisible) {
        categoryHeader.elt.classList.remove("expanded");
      } else {
        categoryHeader.elt.classList.add("expanded");
      }
    });

    if (category === "Equipment") {
      let equipmentByType = {};
      items.forEach(item => {
        const type = item.type || "Miscellaneous";
        if (!equipmentByType[type]) equipmentByType[type] = [];
        equipmentByType[type].push(item);
      });

      if (Object.keys(equipmentByType).length === 0) {
        createP("No equipment items in this category.").parent(contentDiv).style("color", "#666").style("padding", "5px");
      } else {
        Object.keys(equipmentByType).sort().forEach(type => {
          let typeItems = equipmentByType[type];
          let typeDiv = createDiv().parent(contentDiv).style("margin-left", "10px").style("margin-bottom", "5px");
          createElement("h4", `${type} (${typeItems.length})`)
            .parent(typeDiv)
            .style("margin", "5px 0");

          let table = createElement("table").parent(typeDiv).class("rules-table");
          let header = createElement("tr").parent(table);
          createElement("th", "Item Name").parent(header).style("width", "20%");
          createElement("th", "Description").parent(header).style("width", "30%");
          createElement("th", "Quantity").parent(header).style("width", "15%");
          createElement("th", "Quality").parent(header).style("width", "15%");
          createElement("th", "Actions").parent(header).style("width", "20%");

          typeItems.forEach((item, idx) => {
            let row = createElement("tr").parent(table);
            let nameCell = createElement("td").parent(row);
            let nameSpan = createSpan(item.name)
              .parent(nameCell)
              .style("cursor", "pointer")
              .style("color", "#0000EE")
              .style("text-decoration", "underline")
              .mousePressed(() => showEquipmentDescription(category + "-" + idx, item, false));
            createElement("td", item.description || "-").parent(row);
            let quantityCell = createElement("td").parent(row);
            let qtyInput = createInput((item.quantity || 1).toString(), "number")
              .parent(quantityCell)
              .attribute("min", "1")
              .style("width", "50px")
              .value((item.quantity || 1).toString());
            qtyInput.changed(function() {
              let newQuantity = parseInt(this.value()) || 1;
              console.log(`Updating ${item.name} quantity from ${item.quantity} to ${newQuantity}`);
              let inventoryIdx = inventory.findIndex(i => i.name === item.name && i.category === item.category);
              if (inventoryIdx !== -1) {
                inventory[inventoryIdx].quantity = newQuantity;
                console.log("Updated inventory at index", inventoryIdx, ":", JSON.stringify(inventory, null, 2));
                localStorage.setItem('inventory', JSON.stringify(inventory));
                nameSpan.html(`${item.name}`);
                this.value(newQuantity.toString());
                createInventoryUI();
                createEquipmentUI();
              } else {
                console.error(`Item ${item.name} not found in inventory!`);
              }
            });
            createElement("td", item.quality || "Common").parent(row);
            let actionCell = createElement("td").parent(row);
            createButton("Delete")
              .parent(actionCell)
              .class("resource-button small-button")
              .mousePressed(() => {
                let inventoryIdx = inventory.findIndex(i => i.name === item.name && i.category === item.category);
                if (inventoryIdx !== -1) {
                  // Check if the item is a Crystal and is equipped
                  if (item.category === "Crystals") {
                    let isEquipped = Object.values(equippedItems).some(equipped => 
                      equipped && equipped.equippedCrystals && equipped.equippedCrystals.some(c => c && c.name === item.name)
                    );
                    if (isEquipped) {
                      showConfirmationModal(`${item.name} is currently equipped as a crystal. Unequip it before deleting.`, () => {}, true);
                      return;
                    }
                  }

                  // Proceed with deletion confirmation
                  showConfirmationModal(
                    `Are you sure you want to delete ${item.name}?`,
                    () => {
                      inventory.splice(inventoryIdx, 1);
                      localStorage.setItem('inventory', JSON.stringify(inventory));
                      updateAvailableEquipment();
                      createInventoryUI();
                      createEquipmentUI();
                      // If the Modify Equipment modal is open, refresh its dropdown
                      if (modalDiv && modalDiv.elt && document.body.contains(modalDiv.elt)) {
                        updateEquipmentOptions();
                      }
                    }
                  );
                } else {
                  console.error(`Item ${item.name} not found in inventory for deletion!`);
                }
              });
          });
        });
      }
    } else {
      let table = createElement("table").parent(contentDiv).class("rules-table");
      let header = createElement("tr").parent(table);
      createElement("th", "Item Name").parent(header).style("width", "20%");
      createElement("th", "Description").parent(header).style("width", "30%");
      createElement("th", "Quantity").parent(header).style("width", "15%");
      createElement("th", "Quality").parent(header).style("width", "15%");
      createElement("th", "Actions").parent(header).style("width", "20%");

      if (items.length === 0) {
        let row = createElement("tr").parent(table);
        createElement("td", "No items in this category.")
          .parent(row)
          .attribute("colspan", "5")
          .style("color", "#666")
          .style("padding", "5px");
      } else {
        items.forEach((item, idx) => {
          let row = createElement("tr").parent(table);
          let nameCell = createElement("td").parent(row);
          let nameSpan = createSpan(item.name)
            .parent(nameCell)
            .style("cursor", "pointer")
            .style("color", "#0000EE")
            .style("text-decoration", "underline")
            .mousePressed(() => showEquipmentDescription(category + "-" + idx, item, false));
          createElement("td", item.description || "-").parent(row);
          let quantityCell = createElement("td").parent(row);
          let qtyInput = createInput((item.quantity || 1).toString(), "number")
            .parent(quantityCell)
            .attribute("min", "1")
            .style("width", "50px")
            .value((item.quantity || 1).toString());
          qtyInput.changed(function() {
            let newQuantity = parseInt(this.value()) || 1;
            console.log(`Updating ${item.name} quantity from ${item.quantity} to ${newQuantity}`);
            let inventoryIdx = inventory.findIndex(i => i.name === item.name && i.category === item.category);
            if (inventoryIdx !== -1) {
              inventory[inventoryIdx].quantity = newQuantity;
              console.log("Updated inventory at index", inventoryIdx, ":", JSON.stringify(inventory, null, 2));
              localStorage.setItem('inventory', JSON.stringify(inventory));
              nameSpan.html(`${item.name}`);
              this.value(newQuantity.toString());
              createInventoryUI();
              createEquipmentUI();
            } else {
              console.error(`Item ${item.name} not found in inventory!`);
            }
          });
          createElement("td", item.quality || "Common").parent(row);
          let actionCell = createElement("td").parent(row);
          createButton("Delete")
            .parent(actionCell)
            .class("resource-button small-button")
            .mousePressed(() => {
              let inventoryIdx = inventory.findIndex(i => i.name === item.name && i.category === item.category);
              if (inventoryIdx !== -1) {
                showConfirmationModal(`Are you sure you want to delete ${item.name}?`, () => {
                  if (item.category === "Crystals") {
                    let isEquipped = Object.values(equippedItems).some(equipped => 
                      equipped && equipped.equippedCrystals && equipped.equippedCrystals.some(c => c && c.name === item.name)
                    );
                    if (isEquipped) {
                      showConfirmationModal(`${item.name} is currently equipped as a crystal. Unequip it before deleting.`, () => {}, true);
                      return;
                    }
                  }
                  inventory.splice(inventoryIdx, 1);
                  localStorage.setItem('inventory', JSON.stringify(inventory));
                  updateAvailableEquipment();
                  createInventoryUI();
                  createEquipmentUI();
                  // If the Modify Equipment modal is open, refresh its dropdown
                  if (modalDiv && modalDiv.elt && document.body.contains(modalDiv.elt)) {
                    updateEquipmentOptions();
                  }
                });
              } else {
                console.error(`Item ${item.name} not found in inventory for deletion!`);
              }
            });
        });
      }
    }
  });
}
function showModifyItemsModal() {
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

  createElement("h3", "Modify Items").parent(modalDiv);

  let successMessage = createP("")
    .parent(modalDiv)
    .style("color", "green")
    .style("display", "none")
    .style("margin-bottom", "10px");

  let errorMessage = createP("")
    .parent(modalDiv)
    .style("color", "red")
    .style("display", "none")
    .style("margin-bottom", "10px");

  let categoryDiv = createDiv().parent(modalDiv).style("margin-bottom", "10px");
  createSpan("Category:").parent(categoryDiv).style("display", "block");
  let categorySelect = createSelect()
    .parent(categoryDiv)
    .style("width", "100%");
  ["Consumables", "Materials", "Quest Items", "Miscellaneous"].forEach(cat => categorySelect.option(cat));
  createSpan("Select the category of the item.")
    .parent(categoryDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let itemSelectDiv = createDiv().parent(modalDiv).style("margin-bottom", "10px");
  createSpan("Item:").parent(itemSelectDiv).style("display", "block");
  let itemSelect = createSelect().parent(itemSelectDiv).style("width", "100%");
  createSpan("Select an item to edit or 'None' to add a new one.")
    .parent(itemSelectDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let nameDiv = createDiv().parent(modalDiv).style("margin-bottom", "10px");
  createSpan("Name:").parent(nameDiv).style("display", "block");
  let nameInput = createInput("")
    .parent(nameDiv)
    .style("width", "100%")
    .attribute("placeholder", "e.g., Health Potion");

  let qualityDiv = createDiv().parent(modalDiv).style("margin-bottom", "10px");
  createSpan("Quality:").parent(qualityDiv).style("display", "block");
  let qualitySelect = createSelect()
    .parent(qualityDiv)
    .style("width", "100%");
  ["Common", "Uncommon", "Rare", "Epic", "Legendary"].forEach(quality => qualitySelect.option(quality));
  qualitySelect.value("Common");

  let descDiv = createDiv().parent(modalDiv).style("margin-bottom", "10px");
  createSpan("Description:").parent(descDiv).style("display", "block");
  let descriptionInput = createElement("textarea")
    .parent(descDiv)
    .style("width", "100%")
    .style("height", "60px")
    .attribute("placeholder", "Describe the item...");

  function updateItemOptions() {
    let selectedCategory = categorySelect.value();
    let allItems = inventory.filter(item => item.category === selectedCategory);
    let availableItemsForCategory = availableItems[selectedCategory] ? availableItems[selectedCategory].filter(item => 
      !inventory.some(i => i.name === item.name && i.category === selectedCategory)
    ) : [];

    itemSelect.html("");
    itemSelect.option("None", -1);
    allItems.forEach((item, idx) => itemSelect.option(`[Inventory] ${item.name}`, idx));
    availableItemsForCategory.forEach((item, idx) => itemSelect.option(`[Available] ${item.name}`, allItems.length + idx));

    console.log(`updateItemOptions - Selected Category: ${selectedCategory}`);
    console.log("Inventory (allItems):", allItems);
    console.log("Available Items:", availableItemsForCategory);
  }

  function loadItemData() {
    let idx = parseInt(itemSelect.value());
    let selectedCategory = categorySelect.value();
    let allItems = inventory.filter(item => item.category === selectedCategory);
    let availableItemsForCategory = availableItems[selectedCategory] ? availableItems[selectedCategory].filter(item => 
      !inventory.some(i => i.name === item.name && i.category === selectedCategory)
    ) : [];

    if (idx === -1) {
      nameInput.value("");
      qualitySelect.value("Common");
      descriptionInput.value("");
    } else if (idx < allItems.length) {
      let item = allItems[idx];
      nameInput.value(item.name || "");
      qualitySelect.value(item.quality || "Common");
      descriptionInput.value(item.description || "");
    } else {
      let availableIdx = idx - allItems.length;
      if (availableIdx >= 0 && availableIdx < availableItemsForCategory.length) {
        let item = availableItemsForCategory[availableIdx];
        nameInput.value(item.name || "");
        qualitySelect.value(item.quality || "Common");
        descriptionInput.value(item.description || "");
      }
    }
  }

  categorySelect.changed(updateItemOptions);
  itemSelect.changed(loadItemData);
  updateItemOptions();

  createButton("Add")
    .parent(modalDiv)
    .style("margin", "5px")
    .style("padding", "5px 10px")
    .style("background-color", "#4CAF50")
    .style("color", "white")
    .style("border", "none")
    .style("border-radius", "3px")
    .style("cursor", "pointer")
    .mousePressed(() => {
      let idx = parseInt(itemSelect.value());
      let selectedCategory = categorySelect.value();
      let allItems = inventory.filter(item => item.category === selectedCategory);
      let availableItemsForCategory = availableItems[selectedCategory] ? availableItems[selectedCategory].filter(item => 
        !inventory.some(i => i.name === item.name && i.category === selectedCategory)
      ) : [];

      if (idx === -1) {
        // Add a new custom item
        let category = categorySelect.value();
        let newName = nameInput.value().trim();

        if (!newName) {
          errorMessage.html("Please provide a name for the item.");
          errorMessage.style("display", "block");
          successMessage.style("display", "none");
          return;
        }

        if (inventory.some(item => item.name === newName && item.category === category)) {
          errorMessage.html(`An item with the name "${newName}" already exists in ${category}. Please choose a different name.`);
          errorMessage.style("display", "block");
          successMessage.style("display", "none");
          return;
        }

        if (availableItems[category] && availableItems[category].some(item => item.name === newName)) {
          errorMessage.html(`An item with the name "${newName}" already exists in available items for ${category}. Please choose a different name.`);
          errorMessage.style("display", "block");
          successMessage.style("display", "none");
          return;
        }

        let newItem = {
          name: newName,
          category: category,
          description: descriptionInput.value(),
          quality: qualitySelect.value(),
          quantity: 1
        };

        console.log("Adding new item:", newItem);
        inventory.push(newItem);
        // Add to availableItems to preserve it after deletion
        if (!availableItems[category]) {
          availableItems[category] = [];
        }
        availableItems[category].push({ ...newItem }); // Add to availableItems
      } else if (idx >= allItems.length) {
        // Add an available item to inventory
        let availableIdx = idx - allItems.length;
        if (availableIdx < 0 || availableIdx >= availableItemsForCategory.length) {
          errorMessage.html("Invalid available item selected.");
          errorMessage.style("display", "block");
          successMessage.style("display", "none");
          return;
        }
        let item = availableItemsForCategory[availableIdx];
        let newItem = { ...item, quantity: 1 };

        if (inventory.some(i => i.name === item.name && i.category === selectedCategory)) {
          errorMessage.html(`Item "${item.name}" already exists in inventory. Use Save to update it.`);
          errorMessage.style("display", "block");
          successMessage.style("display", "none");
          return;
        }

        console.log("Adding available item to inventory:", newItem);
        inventory.push(newItem);
      } else {
        errorMessage.html("Please select 'None' to add a new item or an available item.");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        return;
      }

      localStorage.setItem('inventory', JSON.stringify(inventory));
      console.log("Updated inventory:", inventory);
      updateAvailableEquipment();
      createInventoryUI();
      // Show success message and reset form state without closing the modal
      successMessage.html("Item Added to Inventory");
      successMessage.style("display", "block");
      errorMessage.style("display", "none");
      // Reset the form to "None" state
      itemSelect.value("-1");
      updateItemOptions();
      loadItemData();
      // Scroll to the top to show the success message
      modalDiv.elt.scrollTop = 0;
    });

  createButton("Save")
    .parent(modalDiv)
    .style("margin", "5px")
    .style("padding", "5px 10px")
    .style("background-color", "#2196F3") // Blue for Save
    .style("color", "white")
    .style("border", "none")
    .style("border-radius", "3px")
    .style("cursor", "pointer")
    .mousePressed(() => {
      let idx = parseInt(itemSelect.value());
      if (idx === -1) {
        errorMessage.html("Please select an item to edit.");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        return;
      }

      let selectedCategory = categorySelect.value();
      let allItems = inventory.filter(item => item.category === selectedCategory);
      let availableItemsForCategory = availableItems[selectedCategory] ? availableItems[selectedCategory].filter(item => 
        !inventory.some(i => i.name === item.name && i.category === selectedCategory)
      ) : [];

      let item;
      let originalName;
      let isFromAvailableItems = false;
      let availableItemIdx = -1;
      let inventoryIdx = -1;

      if (idx < allItems.length) {
        // Existing inventory item
        item = allItems[idx];
        originalName = item.name;
        inventoryIdx = inventory.indexOf(item);
      } else {
        // Available item
        let availableIdx = idx - allItems.length;
        if (availableIdx < 0 || availableIdx >= availableItemsForCategory.length) {
          errorMessage.html("Invalid item selected.");
          errorMessage.style("display", "block");
          successMessage.style("display", "none");
          return;
        }
        item = availableItemsForCategory[availableIdx];
        originalName = item.name;
        inventoryIdx = inventory.findIndex(i => i.name === item.name && i.category === selectedCategory);
        isFromAvailableItems = true;
        availableItemIdx = availableItems[selectedCategory].findIndex(i => i.name === originalName);
      }

      let newName = nameInput.value().trim();
      if (!newName) {
        errorMessage.html("Please provide a name for the item.");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        return;
      }

      if (newName !== item.name && inventory.some(i => i.name === newName && i.category === selectedCategory && i !== item)) {
        errorMessage.html(`An item with the name "${newName}" already exists in ${selectedCategory}. Please choose a different name.`);
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        return;
      }

      if (newName !== item.name && availableItems[selectedCategory] && availableItems[selectedCategory].some(i => i.name === newName && i !== item)) {
        errorMessage.html(`An item with the name "${newName}" already exists in available items for ${selectedCategory}. Please choose a different name.`);
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        return;
      }

      let updatedItem = {
        name: newName,
        category: selectedCategory,
        description: descriptionInput.value(),
        quality: qualitySelect.value(),
        quantity: item.quantity || 1
      };

      if (isFromAvailableItems && availableItemIdx !== -1) {
        // Update the original entry in availableItems
        console.log(`Updating availableItems["${selectedCategory}"] at index ${availableItemIdx} with:`, updatedItem);
        availableItems[selectedCategory][availableItemIdx] = updatedItem;

        // Remove from inventory if it was added there
        if (inventoryIdx !== -1) {
          inventory.splice(inventoryIdx, 1);
          console.log("Removed duplicate from inventory:", item.name);
        }
      } else {
        // Update the inventory entry
        inventory[inventoryIdx] = updatedItem;

        // If the item exists in availableItems with the original name, update its name there too
        if (originalName && availableItems[selectedCategory]) {
          let availableIdx = availableItems[selectedCategory].findIndex(i => i.name === originalName);
          if (availableIdx !== -1) {
            console.log(`Syncing name change in availableItems["${selectedCategory}"] from ${originalName} to ${newName}`);
            availableItems[selectedCategory][availableIdx] = { ...updatedItem };
          }
        }
      }

      localStorage.setItem('inventory', JSON.stringify(inventory));
      updateAvailableEquipment();
      createInventoryUI();

      // Show success message and reset form state without closing the modal
      successMessage.html("Item Updated");
      successMessage.style("display", "block");
      errorMessage.style("display", "none");

      // Reset the form
      itemSelect.value("-1");
      updateItemOptions();
      loadItemData();
      // Scroll to the top to show the success message
      modalDiv.elt.scrollTop = 0;
    });

  createButton("Remove")
    .parent(modalDiv)
    .style("margin", "5px")
    .style("padding", "5px 10px")
    .style("background-color", "#f44336") // Red for Remove
    .style("color", "white")
    .style("border", "none")
    .style("border-radius", "3px")
    .style("cursor", "pointer")
    .mousePressed(() => {
      let idx = parseInt(itemSelect.value());
      if (idx === -1) {
        errorMessage.html("Please select an item to remove.");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        return;
      }

      let selectedCategory = categorySelect.value();
      let allItems = inventory.filter(item => item.category === selectedCategory);
      if (idx < 0 || idx >= allItems.length) {
        errorMessage.html("Invalid item selected.");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        return;
      }

      let item = allItems[idx];
      showConfirmationModal(
        `Are you sure you want to remove "${item.name}"?`,
        () => {
          inventory.splice(inventory.indexOf(item), 1);
          localStorage.setItem('inventory', JSON.stringify(inventory));
          updateAvailableEquipment();
          createInventoryUI();
          modalDiv.remove();
          errorMessage.style("display", "none");
          successMessage.style("display", "none");
        }
      );
    });

  createButton("Close")
    .parent(modalDiv)
    .style("margin", "5px")
    .style("padding", "5px 10px")
    .style("background-color", "#ccc") // Gray for Close
    .style("color", "black")
    .style("border", "none")
    .style("border-radius", "3px")
    .style("cursor", "pointer")
    .mousePressed(() => {
      modalDiv.remove();
      errorMessage.style("display", "none");
      successMessage.style("display", "none");
    });
}
function getEquippedWeaponCategory() {
  let onHand = equippedItems["On-Hand"];
  let offHand = equippedItems["Off-Hand"];
  if (onHand && onHand.weaponCategory) {
    return onHand.weaponCategory;
  } else if (offHand && offHand.weaponCategory) {
    return offHand.weaponCategory;
  }
  return null; // No weapon equipped
}

// Check if an ability is learned
function isAbilityLearned(category, abilityName) {
  return learnedAbilities[category] && learnedAbilities[category].includes(abilityName);
}

// Check if stat requirements are met
function meetsStatRequirements(statReq) {
  if (!statReq) return true;
  for (let [stat, required] of Object.entries(statReq)) {
    if (getTotalStat(stat) < required) return false; // Assumes getTotalStat exists
  }
  return true;
}

// Learn a weapon-specific ability
function learnAbility(category, ability) {
  if (abilityPoints >= ability.pointCost && meetsStatRequirements(ability.statReq)) {
    if (!learnedAbilities[category]) learnedAbilities[category] = [];
    if (!learnedAbilities[category].includes(ability.name)) {
      learnedAbilities[category].push(ability.name);
      abilityPoints -= ability.pointCost;
      console.log(`Learned ${ability.name} for ${category}`);
      createAbilitiesUI(); // Refresh UI
    }
  } else {
    showConfirmationModal("Cannot learn ability: insufficient points or stats.", () => {}, true);
  }
}

// Use a Crystal ability
function useCrystalAbility(ability) {
  console.log(`Used Crystal ability: ${ability}`);
  // Add game logic here later
}

// Use a weapon-specific ability
function useAbility(ability, category) {
  let equippedCategory = getEquippedWeaponCategory();
  if (equippedCategory !== category) {
    showConfirmationModal("Cannot use this ability: Wrong weapon equipped.", () => {}, true);
    return;
  }
  if (current_ATG >= ability.ATGCost) {
    current_ATG -= ability.ATGCost;
    console.log(`Used weapon ability: ${ability.name}. Effect: ${ability.effect}`);
    // Add actual effect implementation here later
  } else {
    showConfirmationModal("Not enough ATG to use this ability.", () => {}, true);
  }
}
function createAbilitiesUI() {
  console.log("createAbilitiesUI called");
  let abilitiesContainer = select("#abilities");
  if (!abilitiesContainer) {
    console.error("No #abilities div found in HTML!");
    return;
  }
  abilitiesContainer.html(""); // Clear existing content

  // Header
  createElement("h2", "Abilities").parent(abilitiesContainer);
  createSpan("View and manage your abilities from Crystal and equipped weapons.")
    .parent(abilitiesContainer)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block")
    .style("margin-bottom", "10px");

  // Crystal Spells Section
  createElement("h3", "Crystal Spells").parent(abilitiesContainer);
  if (characterAbilities.length === 0) {
    createP("No Crystal Spells equipped.").parent(abilitiesContainer);
  } else {
    let crystalTable = createElement("table").parent(abilitiesContainer).class("rules-table");
    let header = createElement("tr").parent(crystalTable);
    createElement("th", "Ability").parent(header).style("width", "30%");
    createElement("th", "Effect").parent(header).style("width", "50%");
    createElement("th", "Actions").parent(header).style("width", "20%");

    characterAbilities.forEach(ability => {
      let row = createElement("tr").parent(crystalTable);
      createElement("td", ability).parent(row);
      createElement("td", "Effect description here").parent(row); // Placeholder
      let actionCell = createElement("td").parent(row);
      createButton("Use")
        .parent(actionCell)
        .class("resource-button small-button")
        .mousePressed(() => useCrystalAbility(ability));
    });
  }

  // Weapon-Specific Abilities Header
  createElement("h3", "Weapon-Specific Abilities").parent(abilitiesContainer);
  createP("Note: 'Use' requires the correct weapon category equipped; 'Learn' is always available if stats and points suffice.")
    .parent(abilitiesContainer)
    .style("color", "red")
    .style("margin-bottom", "10px");

  // Display all weapon categories
  weaponCategories.forEach(category => {
    let categoryDiv = createDiv().parent(abilitiesContainer).style("margin-bottom", "20px");
    createElement("h4", `${category}`).parent(categoryDiv);

    let abilities = availableAbilities[category] || [];
    if (abilities.length === 0) {
      createP(`No abilities defined for ${category}. Edit 'availableAbilities' in the code to add some.`)
        .parent(categoryDiv)
        .style("color", "#666");
    } else {
      let table = createElement("table").parent(categoryDiv).class("rules-table");
      let header = createElement("tr").parent(table);
      createElement("th", "Name").parent(header).style("width", "20%");
      createElement("th", "ATG Cost").parent(header).style("width", "10%");
      createElement("th", "Stat Req").parent(header).style("width", "15%");
      createElement("th", "Point Cost").parent(header).style("width", "10%");
      createElement("th", "Effect").parent(header).style("width", "25%");
      createElement("th", "Status").parent(header).style("width", "10%");
      createElement("th", "Actions").parent(header).style("width", "10%");

      abilities.forEach(ability => {
        let row = createElement("tr").parent(table);
        createElement("td", ability.name).parent(row);
        createElement("td", String(ability.ATGCost)).parent(row); // Convert number to string
        let statReqText = ability.statReq ? Object.entries(ability.statReq).map(([stat, val]) => `${val} ${stat}`).join(", ") : "-";
        createElement("td", statReqText).parent(row);
        createElement("td", String(ability.pointCost)).parent(row); // Convert number to string
        createElement("td", ability.effect).parent(row);
        let isLearned = isAbilityLearned(category, ability.name);
        createElement("td", isLearned ? "Learned" : "Not Learned").parent(row);

        let actionCell = createElement("td").parent(row);
        if (isLearned) {
          let equippedCategory = getEquippedWeaponCategory();
          let canUse = equippedCategory === category;
          createButton("Use")
            .parent(actionCell)
            .class("resource-button small-button")
            .attribute("disabled", canUse ? null : "true")
            .mousePressed(() => {
              if (canUse) {
                useAbility(ability, category);
              } else {
                showConfirmationModal("Cannot use this ability: Wrong weapon equipped.", () => {}, true);
              }
            });
        } else {
          let canLearn = meetsStatRequirements(ability.statReq) && abilityPoints >= ability.pointCost;
          createButton("Learn")
            .parent(actionCell)
            .class("resource-button small-button")
            .attribute("disabled", canLearn ? null : "true")
            .mousePressed(() => learnAbility(category, ability));
        }
      });
    }
  });

  // Available Ability Points
  createP(`Available Ability Points: ${abilityPoints}`)
    .parent(abilitiesContainer)
    .style("margin-top", "10px");
}
function updateAbilities() {
  console.log("Updating abilities...");
  characterAbilities = []; // Reset the abilities array

  // Collect abilities from equipped crystals
  for (let slot in equippedItems) {
    let item = equippedItems[slot];
    if (item && item.equippedCrystals) {
      item.equippedCrystals.forEach(crystal => {
        if (crystal && crystal.abilities) {
          crystal.abilities.forEach(ability => {
            if (!characterAbilities.includes(ability)) {
              characterAbilities.push(ability);
            }
          });
        }
      });
    }
  }

  // Optionally, refresh the Abilities UI if it’s the active tab
  if (currentTab === "abilities") {
    createAbilitiesUI();
  }

  console.log("Updated characterAbilities:", characterAbilities);
}
