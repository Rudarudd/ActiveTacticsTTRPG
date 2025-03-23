// Clear localStorage at startup (remove after testing)
localStorage.removeItem('inventory');
localStorage.removeItem('equippedItems');

// Global resource variables
let max_hp = 25,
  current_hp = 25;
let max_mp = 10,
  current_mp = 10;
let max_stamina = 100,
  current_stamina = 100;
let max_ATG = 100,
  current_ATG = 0;

// Global Stat Variables
let lockToLevel = true;
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
let statbonusElements = {};

// Helper function to enable/disable buttons
// Using elt.disabled instead of .attribute("disabled", ...) due to inconsistent behavior with p5.js attribute method
function setButtonDisabled(button, isDisabled) {
  button.elt.disabled = isDisabled;
}

//Talent Point Pool
let totalTalentPoints = 0; // Total Talent Points based on level
let spentTalentPoints = 0; // Talent Points spent on talents

// Inventory Startup & Categories
let inventory = [];
let inventoryCategories = ["Equipment", "Consumables", "Materials", "Crystals", "Miscellaneous"];
let categoryStates = {
};

// Master list of available items with quantity and quality
let availableItems = {
  "Equipment": [
    // Melee - Heavy (typically STR-based, higher damage, often two-handed)
    {
      name: "Greatsword",
      description: "A large, heavy sword designed for powerful strikes.",
      category: "Equipment",
      type: "On-Hand",
      weaponCategory: "Melee - Heavy",
      crystalSlots: 2,
      quantity: 1,
      quality: "Common",
      linkedStat: "STR",
      damageDice: "2d6",
      modifier: 0,
      dualWield: false,
      twoHanded: true,
      statRequirements: { STR: 5 },
      statbonuses: null
    },
    // Melee - Balanced (STR or DEX, moderate damage, versatile)
    {
      name: "Longsword",
      description: "A well-balanced sword suitable for most fighters.",
      category: "Equipment",
      type: "On-Hand",
      weaponCategory: "Melee - Balanced",
      crystalSlots: 1,
      quantity: 1,
      quality: "Common",
      linkedStat: "STR",
      damageDice: "1d8",
      modifier: 1,
      dualWield: true,
      twoHanded: false,
      statRequirements: { STR: 3, DEX: 2}, 
      statbonuses: null
    },
    // Melee - Light (DEX-based, lower damage, often dual-wieldable)
    {
      name: "Dagger",
      description: "A small, sharp blade for quick strikes.",
      category: "Equipment",
      type: "Off-Hand",
      weaponCategory: "Melee - Light",
      crystalSlots: 0,
      quantity: 1,
      quality: "Common",
      linkedStat: "DEX",
      damageDice: "1d4",
      modifier: 0,
      dualWield: true,
      twoHanded: false,
      statRequirements: { DEX: 2 },
      statbonuses: null
    },
    // Ranged - Short (DEX-based, short range, moderate damage)
    {
      name: "Shortbow",
      description: "A compact bow for short-range combat.",
      category: "Equipment",
      type: "On-Hand",
      weaponCategory: "Ranged - Short",
      crystalSlots: 1,
      quantity: 1,
      quality: "Common",
      linkedStat: "DEX",
      damageDice: "1d6",
      modifier: 0,
      dualWield: false,
      twoHanded: true,
      statRequirements: { DEX: 3 },
      statbonuses: null
    },
    // Magical - Offensive (MAG-based, magical damage)
    {
      name: "Fire Staff",
      description: "A staff imbued with fire magic.",
      category: "Equipment",
      type: "On-Hand",
      weaponCategory: "Magical - Offensive",
      crystalSlots: 2,
      quantity: 1,
      quality: "Uncommon",
      linkedStat: "MAG",
      damageDice: "1d6",
      modifier: 2,
      dualWield: false,
      twoHanded: true,
      statRequirements: { MAG: 4 },
      statbonuses: { stat: "MAG", amount: 1 }
    },
    // Chest Armor
    {
      name: "Leather Armor",
      description: "Light armor made of tanned leather.",
      category: "Equipment",
      type: "Chest",
      quantity: 1,
      quality: "Common",
      crystalSlots: 0,
      movementPenalty: 0,
      defense: 2,
      modifier: 0,
      statRequirements: {},
      statbonuses: null
    },
    {
      name: "Chainmail",
      description: "A shirt of interlocking metal rings.",
      category: "Equipment",
      type: "Chest",
      quantity: 1,
      quality: "Uncommon",
      crystalSlots: 1,
      movementPenalty: -5,
      defense: 4,
      modifier: 0,
      statRequirements: { STR: 3 },
      statbonuses: null
    },
    // Helm
    {
      name: "Leather Cap",
      description: "A simple cap made of leather.",
      category: "Equipment",
      type: "Helm",
      quantity: 1,
      quality: "Common",
      crystalSlots: 0,
      movementPenalty: 0,
      defense: 1,
      modifier: 0,
      statRequirements: {},
      statbonuses: null
    },
    // Gloves
    {
      name: "Leather Gloves",
      description: "Gloves made of soft leather.",
      category: "Equipment",
      type: "Gloves",
      quantity: 1,
      quality: "Common",
      crystalSlots: 0,
      movementPenalty: 0,
      defense: 1,
      modifier: 0,
      statRequirements: {},
      statbonuses: null
    },
    // Greaves
    {
      name: "Leather Boots",
      description: "Sturdy boots made of leather.",
      category: "Equipment",
      type: "Greaves",
      quantity: 1,
      quality: "Common",
      crystalSlots: 0,
      movementPenalty: 0,
      defense: 1,
      modifier: 0,
      statRequirements: {},
      statbonuses: null
    }
  ],
  "Consumables": [
    { name: "Healing Potion", description: "Restores 20 HP.", category: "Consumables", quantity: 1, quality: "Common" }
  ],
  "Materials": [
    { name: "Rope", description: "100ft of rope.", category: "Materials", quantity: 1, quality: "Uncommon" }
  ],
  "Crystals": [
    { name: "Fire Crystal", description: "Grants the ability to cast Fire.", category: "Crystals", statbonuses: { MAG: 2 }, abilities: ["Fire"], statReq: { MAG: 5 }, quantity: 1, quality: "Rare" },
    { name: "Heal Crystal", description: "Grants the ability to cast Cure.", category: "Crystals", statbonuses: { WIL: 1 }, abilities: ["Cure"], statReq: { WIL: 3 }, quantity: 1, quality: "Rare" }
  ],
  "Miscellaneous": [
    { name: "Old Key", description: "Rusty but functional.", category: "Miscellaneous", quantity: 1, quality: "Poor" }
  ]
};

// Create a pristine copy of the initial availableItems
let pristineAvailableItems = JSON.parse(JSON.stringify(availableItems));

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

//Ability Points
let characterAbilities = [];
let abilityPoints = 1; // Starting with 1 point at Level 1
let learnedAbilities = {}; // Object to track learned abilities by category, e.g., { "Melee - Heavy": ["Cleave"] }

// Define available abilities with placeholders
let availableAbilities = {
  "Melee - Heavy": [
    { name: "Cleave", ATGCost: 50, statReq: { STR: 1 }, pointCost: 1, effect: { dice: "1d8", description: "Hits all enemies" } },
    { name: "Smash", ATGCost: 75, statReq: { STR: 15 }, pointCost: 2, effect: { dice: "1d10", description: "Single target" } }
  ],
  "Melee - Balanced": [
    { name: "Balanced Strike", ATGCost: 40, statReq: { STR: 8, DEX: 8 }, pointCost: 1, effect: { dice: "1d8", description: "Balanced attack" } }
  ],
  "Melee - Light": [
    { name: "Quick Slash", ATGCost: 30, statReq: { DEX: 10 }, pointCost: 1, effect: { dice: "1d6", description: "Fast attack" } }
  ],
  "Ranged - Short": [
    { name: "Rapid Shot", ATGCost: 35, statReq: { DEX: 10 }, pointCost: 1, effect: { dice: "1d6", description: "Quick ranged attack, 20-30 ft" } }
  ],
  "Ranged - Long": [
    { name: "Sniper Shot", ATGCost: 60, statReq: { DEX: 12 }, pointCost: 2, effect: { dice: "1d10", description: "Long-range precision shot, 60-100 ft" } }
  ],
  "Magical - Offensive": [
    { name: "Fireball", ATGCost: 80, statReq: { MAG: 10 }, pointCost: 2, effect: { dice: "3d6", description: "Elemental fire damage to all enemies", mpCost: 10 } }
  ],
  "Magical - Support": [
    { name: "Healing Aura", ATGCost: 70, statReq: { SPR: 10 }, pointCost: 2, effect: { dice: "2d8", description: "Heals all allies", mpCost: 8 } }
  ],
  "Shields": [
    { name: "Shield Bash", ATGCost: 40, statReq: { STR: 8 }, pointCost: 1, effect: { dice: "1d4", description: "Stuns enemy for 1 turn" } }
  ],
  "Hybrid": [
    { name: "Gunblade Slash", ATGCost: 50, statReq: { STR: 8, DEX: 8 }, pointCost: 1, effect: { dice: "1d8", description: "Melee attack in Melee mode" } },
    { name: "Gunblade Shot", ATGCost: 50, statReq: { DEX: 10 }, pointCost: 1, effect: { dice: "1d6", description: "Ranged attack in Ranged mode" } }
  ],
  "Crystals": [
    { name: "Fire", ATGCost: 25, statReq: { MAG: 5 }, effect: { dice: "2d6", description: "Elemental fire damage", mpCost: 5 } },
    { name: "Cure", ATGCost: 25, statReq: { WIL: 3 }, effect: { dice: "1d8", description: "Heals the user", mpCost: 3 } }
  ]
};
// Create a pristine copy of the initial availableAbilities
let pristineAvailableAbilities = JSON.parse(JSON.stringify(availableAbilities));

// Working copy of abilities that can be modified
let existingAbilities = JSON.parse(JSON.stringify(availableAbilities));

const weaponCategories = [
  "Melee - Heavy",
  "Melee - Balanced",
  "Melee - Light",
  "Ranged - Short",
  "Ranged - Long",
  "Magical - Offensive",
  "Magical - Support",
  "Shields",
  "Hybrid",
  "Crystals"
];

// Resource Tab Setup
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
    .style("position", "fixed")
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
    .style("position", "fixed")
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
    .style("position", "fixed")
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
    .style("position", "fixed")
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
      addDetail("Stat Bonus", item.statbonuses ? `${item.statbonuses.stat} ${item.statbonuses.amount > 0 ? "+" : ""}${item.statbonuses.amount}` : undefined);
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
            if (crystal.statbonuses && Object.keys(crystal.statbonuses).length > 0) {
              let bonuses = Object.entries(crystal.statbonuses)
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
          updatestatbonusesDisplay();
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
  let statbonusStatSelect = modalDiv.elt.querySelector('#equipment-statbonus-stat-select');
  let statbonusAmountInput = modalDiv.elt.querySelector('#equipment-statbonus-amount-input');
  let statReq1Select = modalDiv.elt.querySelector('#equipment-statreq1-select');
  let statReq1Input = modalDiv.elt.querySelector('#equipment-statreq1-input');
  let statReq2Select = modalDiv.elt.querySelector('#equipment-statreq2-select');
  let statReq2Input = modalDiv.elt.querySelector('#equipment-statreq2-input');
  let numDiceInput = modalDiv.elt.querySelector('#equipment-num-dice-input');
  let diceSidesInput = modalDiv.elt.querySelector('#equipment-dice-sides-input');
  let weaponModifierInput = modalDiv.elt.querySelector('#equipment-weapon-modifier-input');
  let defenseInput = modalDiv.elt.querySelector('#equipment-defense-input');
  let armorModifierInput = modalDiv.elt.querySelector('#equipment-armor-modifier-input');
  let weaponCategorySelect = modalDiv.elt.querySelector('#weapon-category-select');

  // Add null checks to prevent TypeError
  if (!nameInput || !qualitySelect || !descriptionInput || !penaltySelect || !slotsSelect ||
      !linkedStatSelect || !statbonusStatSelect || !statbonusAmountInput ||
      !statReq1Select || !statReq1Input || !statReq2Select || !statReq2Input ||
      !numDiceInput || !diceSidesInput || !weaponModifierInput || !defenseInput || !armorModifierInput ||
      !weaponCategorySelect) {
    console.error("One or more elements not found in loadEquipmentData:", {
      nameInput, qualitySelect, descriptionInput, penaltySelect, slotsSelect,
      linkedStatSelect, statbonusStatSelect, statbonusAmountInput,
      statReq1Select, statReq1Input, statReq2Select, statReq2Input,
      numDiceInput, diceSidesInput, weaponModifierInput, defenseInput, armorModifierInput,
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
    statbonusStatSelect.value = "None";
    statbonusAmountInput.value = "0";
    statReq1Select.value = "None";
    statReq1Input.value = "";
    statReq2Select.value = "None";
    statReq2Input.value = "";
    numDiceInput.value = "1";
    diceSidesInput.value = "6";
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
    statbonusStatSelect.value = item.statbonuses ? Object.keys(item.statbonuses)[0] : "None";
    statbonusAmountInput.value = item.statbonuses && Object.keys(item.statbonuses).length > 0 ? item.statbonuses[Object.keys(item.statbonuses)[0]] : 0;
    let statReqs = item.statRequirements || {};
    let stats = Object.keys(statReqs);
    statReq1Select.value = stats[0] || "None";
    statReq1Input.value = stats[0] ? statReqs[stats[0]] : "";
    statReq2Select.value = stats[1] || "None";
    statReq2Input.value = stats[1] ? statReqs[stats[1]] : "";
    // Parse damageDice (e.g., "2d6") into numDice and diceSides
    let numDice = 1;
    let diceSides = 6;
    if (item.damageDice) {
      let parts = item.damageDice.split("d");
      if (parts.length === 2) {
        numDice = parseInt(parts[0]) || 1;
        diceSides = parseInt(parts[1]) || 6;
      }
    }
    numDiceInput.value = numDice;
    diceSidesInput.value = diceSides;
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
    statbonusStatSelect.value = item.statbonuses ? Object.keys(item.statbonuses)[0] : "None";
    statbonusAmountInput.value = item.statbonuses && Object.keys(item.statbonuses).length > 0 ? item.statbonuses[Object.keys(item.statbonuses)[0]] : 0;
    let statReqs = item.statRequirements || {};
    let stats = Object.keys(statReqs);
    statReq1Select.value = stats[0] || "None";
    statReq1Input.value = stats[0] ? statReqs[stats[0]] : "";
    statReq2Select.value = stats[1] || "None";
    statReq2Input.value = stats[1] ? statReqs[stats[1]] : "";
    // Parse damageDice (e.g., "2d6") into numDice and diceSides
    let numDice = 1;
    let diceSides = 6;
    if (item.damageDice) {
      let parts = item.damageDice.split("d");
      if (parts.length === 2) {
        numDice = parseInt(parts[0]) || 1;
        diceSides = parseInt(parts[1]) || 6;
      }
    }
    numDiceInput.value = numDice;
    diceSidesInput.value = diceSides;
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

  let statbonusDiv = createDiv().parent(contentWrapper);
  createSpan("Stat Bonus:").parent(statbonusDiv).style("display", "block");
  let statbonusAmountInput = createInput("0", "number")
    .parent(statbonusDiv)
    .style("width", "50px")
    .style("margin-right", "5px")
    .id("equipment-statbonus-amount-input");
  let statbonusStatSelect = createSelect()
    .parent(statbonusDiv)
    .style("width", "100px")
    .style("margin-bottom", "10px")
    .id("equipment-statbonus-stat-select");
  ["None", "STR", "DEX", "VIT", "MAG", "WIL", "SPR", "LCK"].forEach(stat => statbonusStatSelect.option(stat));
  createSpan("Stat to boost and amount.")
    .parent(statbonusDiv)
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
  let numDiceInput = createInput("1", "number")
    .parent(damageDiceDiv)
    .style("width", "40px")
    .style("margin-right", "5px")
    .attribute("min", "1")
    .attribute("placeholder", "Num")
    .id("equipment-num-dice-input");
  createSpan("d").parent(damageDiceDiv).style("display", "inline-block").style("margin-right", "5px");
  let diceSidesInput = createInput("6", "number")
    .parent(damageDiceDiv)
    .style("width", "40px")
    .style("margin-right", "5px")
    .attribute("min", "1")
    .attribute("placeholder", "Sides")
    .id("equipment-dice-sides-input");
  let weaponModifierInput = createInput("0", "number")
    .parent(damageDiceDiv)
    .style("width", "50px")
    .style("margin-bottom", "10px")
    .attribute("placeholder", "Mod")
    .id("equipment-weapon-modifier-input");
  createSpan("e.g., 2d6 + 0").parent(damageDiceDiv).style("font-size", "12px").style("color", "#666").style("display", "block");

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
      // Parse damageDice (e.g., "2d6") into numDice and diceSides
      let numDice = 1;
      let diceSides = 6;
      if (item.damageDice) {
        let parts = item.damageDice.split("d");
        if (parts.length === 2) {
          numDice = parseInt(parts[0]) || 1;
          diceSides = parseInt(parts[1]) || 6;
        }
      }
      numDiceInput.value(numDice);
      diceSidesInput.value(diceSides);
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

    if (item.statbonuses) {
      statbonusStatSelect.value(item.statbonuses.stat || "None");
      statbonusAmountInput.value(item.statbonuses.amount || "0");
    } else {
      statbonusStatSelect.value("None");
      statbonusAmountInput.value("0");
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

    let statbonusStat = statbonusStatSelect.value();
    let statbonusAmount = parseInt(statbonusAmountInput.value()) || 0;
    let statbonuses = statbonusStat !== "None" ? { stat: statbonusStat, amount: statbonusAmount } : null;

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
      let numDice = parseInt(numDiceInput.value()) || 1;
      let diceSides = parseInt(diceSidesInput.value()) || 6;
      eq.damageDice = `${numDice}d${diceSides}`; // Construct XdX format
      eq.modifier = parseInt(weaponModifierInput.value()) || 0;
      eq.weaponCategory = weaponCategorySelect.value();
    }
    if (statbonuses) eq.statbonuses = statbonuses;

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
            inventory[invIdx] = { ...eqObj, quantity: invItem.quantity, equippedCrystals };
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
      updatestatbonusesDisplay();
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
      let filteredAvailable = (availableItems["Equipment"] || []).filter(item =>
        item.type === selectedType &&
        (!isWeapon || (item.weaponCategory === weaponCategorySelect.value())) &&
        !inventory.some(i => i.name === item.name && i.category === "Equipment")
      );

      let item;
      let isInInventory = idx < filteredInventory.length;
      if (isInInventory) {
        // Item is in inventory
        item = filteredInventory[idx];
      } else {
        // Item is in availableItems["Equipment"]
        let availableIdx = idx - filteredInventory.length;
        if (availableIdx >= 0 && availableIdx < filteredAvailable.length) {
          item = filteredAvailable[availableIdx];
        } else {
          errorMessage.html("Invalid item selected for removal.");
          errorMessage.style("display", "block");
          contentWrapper.elt.scrollTop = 0;
          return;
        }
      }

      showConfirmationModal(
        `Remove the item from the master list? "${item.name}"`,
        () => {
          // Unequip from all slots in equippedItems
          for (let slot in equippedItems) {
            if (equippedItems[slot] && equippedItems[slot].name === item.name) {
              equippedItems[slot] = null;
            }
          }

          // Remove from inventory if it exists there
          if (isInInventory) {
            inventory.splice(inventory.indexOf(item), 1);
          }

          // Remove from availableItems["Equipment"]
          if (availableItems["Equipment"]) {
            availableItems["Equipment"] = availableItems["Equipment"].filter(
              i => i.name !== item.name
            );
            console.log(`After removal, availableItems["Equipment"]:`, availableItems["Equipment"]);
          }

          localStorage.setItem('inventory', JSON.stringify(inventory));
          updatestatbonusesDisplay();
          updateResourcesBasedOnStats();
          updateAvailableEquipment();
          console.log(`After updateAvailableEquipment, availableItems["Equipment"]:`, availableItems["Equipment"]);
          updateAbilities();
          createInventoryUI();
          createEquipmentUI();
          modalDiv.remove();
        }
      );
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
//Defense total
function calculateTotalDefense() {
  let totalDefense = 0;
  const armorSlots = ["Chest", "Helm", "Gloves", "Greaves"];
  
  armorSlots.forEach(slot => {
    if (equippedItems[slot]) {
      const item = equippedItems[slot];
      const defense = parseInt(item.defense) || 0;
      const modifier = parseInt(item.modifier) || 0;
      totalDefense += defense + modifier;
    }
  });

  return totalDefense;
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
      // Check stat points
      let distributablePoints = 14 + (level - 1);
      let startingPoints = 7;
      let pointsSpent = stat_str + stat_vit + stat_dex + stat_mag + stat_wil + stat_spr + stat_lck;
      let distributablePointsSpent = pointsSpent - startingPoints;
      if (distributablePointsSpent > distributablePoints) {
        showConfirmationModal(
          `Your current stats exceed the available points for your level (${distributablePoints} points). Please adjust your stats to within the limit before enabling Lock to Level.`,
          () => {},
          true
        );
        lockCheckbox.checked(false);
        return;
      }
      // Revert totalTalentPoints to calculated value when locking
      totalTalentPoints = 1 + Math.floor(level / 5);
    }
    lockToLevel = lockCheckbox.checked();
    createStatsUI(); // Refresh UI to update input states
  });

  // Display available points based on level
  let distributablePoints = 14 + (level - 1);
  let startingPoints = 7;
  let pointsSpent = stat_str + stat_vit + stat_dex + stat_mag + stat_wil + stat_spr + stat_lck;
  let distributablePointsSpent = pointsSpent - startingPoints;
  let pointsDiv = createDiv().parent(statsContainer).style("margin", "5px");
  createSpan(`Points Available: ${distributablePoints - distributablePointsSpent}/${distributablePoints}`).parent(pointsDiv);

  // Calculate and display Ability Points and Total Talent Points
  let abilityPoints = Math.floor((level - 1) / 2); // 1 point every 2 levels starting at level 3
  let calculatedTalentPoints = 1 + Math.floor(level / 5); // 1 point at level 1, plus 1 every 5 levels
  if (lockToLevel) {
    totalTalentPoints = calculatedTalentPoints; // Enforce calculated value when locked
  }
  let pointsInfoDiv = createDiv().parent(statsContainer).style("margin", "5px");
  createSpan(`Ability Points: ${abilityPoints} (future use)`).parent(pointsInfoDiv).style("margin-right", "10px");

  // Display Total Talent Points with editable input
  let talentPointsDiv = createDiv().parent(statsContainer).style("margin", "5px");
  let talentPointsLabel = createSpan("Total Talent Points: ").parent(talentPointsDiv);
  let talentPointsInput = createInput(totalTalentPoints.toString(), "number")
    .parent(talentPointsDiv)
    .style("width", "50px");
  if (lockToLevel) {
    talentPointsInput.attribute("readonly", "true").style("background-color", "#e0e0e0");
  } else {
    talentPointsInput.removeAttribute("readonly").style("background-color", "white");
  }
  talentPointsInput.changed(() => {
    let newValue = int(talentPointsInput.value());
    newValue = constrain(newValue, 1, 99); // Minimum 1, maximum 99
    totalTalentPoints = newValue;
    createStatsUI(); // Refresh UI to update displays
  });

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

  // Add Total Defense row
  let defenseDiv = createDiv().parent(statsContainer).style("margin", "5px");
  let defenseLabel = createSpan("Defense: ").parent(defenseDiv).style("cursor", "pointer");
  defenseLabel.mouseClicked(() => showStatDescription("Defense", "Defense: Total defense from equipped armor."));
  statLabelElements["Defense"] = defenseLabel;
  let totalDefense = calculateTotalDefense();
  let defenseInput = createInput(totalDefense.toString(), "text")
    .parent(defenseDiv)
    .style("width", "50px")
    .attribute("readonly", "true")
    .style("background-color", "#e0e0e0")
    .id("defenseInput");

  // Stats with total or bonus display
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

  updatestatbonusesDisplay();
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
    statbonusElements[abbrev] = bonusSpan;
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
  let bonuses = getstatbonuses();
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
  updatestatbonusesDisplay();
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

  let tableWrapper = createDiv().parent(equipmentContainerDiv).class("table-wrapper");
  let equipmentTable = createElement("table")
    .parent(tableWrapper)
    .id("equipmentTable")
    .class("rules-table");
  let headerRow = createElement("tr").parent(equipmentTable);
  ["Slot", "Name", "Requirements", "Damage/Defense", "Mov. Penalty", "Crystal Slots", "Stat Bonus", "Linked Stat", "Weapon Category"].forEach((header) => {
    createElement("th", header)
      .parent(headerRow)
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("background", "#f2f2f2");
  });

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

    let availableItems = availableEquipment[slot] || [];
    let equippedItemsList = Object.values(equippedItems).filter(eq => eq && eq.category === "Equipment");
    let uniqueEquippedItems = equippedItemsList.filter(eq => !availableItems.some(item => item.name === eq.name));
    let dropdownItems = [...availableItems, ...uniqueEquippedItems];

    let filteredDropdownItems = dropdownItems.filter(item => {
      if (slot === "On-Hand" || slot === "Off-Hand") {
        return item.weaponCategory;
      } else if (slot === "Accessory 1" || slot === "Accessory 2") {
        return item.type === "Accessory";
      } else {
        // Allow armor items with defense (including 0) and no weaponCategory
        return typeof item.defense !== "undefined" && !item.weaponCategory;
      }
    });

    filteredDropdownItems = filteredDropdownItems.filter(item => {
      let inventoryItem = inventory.find(i => i.name === item.name && i.category === item.category);
      let inventoryQty = inventoryItem ? (inventoryItem.quantity || 1) : 0;
      let equippedCountExcludingCurrent = Object.values(equippedItems)
        .filter(eq => eq && eq.name === item.name && eq.category === item.category && eq !== equippedItems[slot])
        .length;

      // Check dualWield for On-Hand and Off-Hand slots
      if (slot === "On-Hand" || slot === "Off-Hand") {
        if (!item.dualWield) {
          let otherSlot = slot === "On-Hand" ? "Off-Hand" : "On-Hand";
          if (equippedItems[otherSlot] && equippedItems[otherSlot].name === item.name) {
            return false; // Item is already equipped in the other slot and not dual-wieldable
          }
        }
      }

      // Ensure inventory quantity supports another instance
      return inventoryQty > equippedCountExcludingCurrent;
    });

    filteredDropdownItems.forEach(item => {
      let isAlreadyEquipped = false;
      if (slot === "Accessory 1" && equippedItems["Accessory 2"] && equippedItems["Accessory 2"].name === item.name) {
        isAlreadyEquipped = true;
      } else if (slot === "Accessory 2" && equippedItems["Accessory 1"] && equippedItems["Accessory 1"].name === item.name) {
        isAlreadyEquipped = true;
      }
      if (!isAlreadyEquipped) {
        itemSelect.option(item.name, item.name);
      }
    });

    itemSelect.value(itemName);

    if ((slot === "On-Hand" && disableOnHand) || (slot === "Off-Hand" && disableOffHand)) {
      itemSelect.elt.disabled = true;
      itemSelect.style("background", "#e0e0e0");
    } else {
      itemSelect.elt.disabled = false;
      itemSelect.style("background", "white");
    }

    itemSelect.changed(() => {
      let selectedName = itemSelect.value();
      console.log(`Selected item in ${slot}: ${selectedName}`);
      if (selectedName === "None") {
        if (equippedItems[slot]) {
          let unequippedItem = equippedItems[slot];
          let inventoryItem = inventory.find(i => i.name === unequippedItem.name && i.category === unequippedItem.category);
          if (inventoryItem) {
            inventoryItem.quantity = (inventoryItem.quantity || 1) + 1;
          } else {
            inventory.push({ ...unequippedItem, quantity: 1 });
          }
          equippedItems[slot] = null;
        }
      } else {
        let selectedItem = filteredDropdownItems.find(item => item.name === selectedName);
        console.log(`Found selectedItem:`, selectedItem);
        if (selectedItem && canWieldItem(selectedItem)) {
          equippedItems[slot] = {
            ...selectedItem,
            equippedCrystals: equippedItems[slot]?.equippedCrystals || Array(selectedItem.crystalSlots || 0).fill(null)
          };
          if (selectedItem.twoHanded) {
            let otherSlot = slot === "On-Hand" ? "Off-Hand" : slot === "Off-Hand" ? "On-Hand" : null;
            if (otherSlot && equippedItems[otherSlot]) {
              let unequippedItem = equippedItems[otherSlot];
              let otherInventoryItem = inventory.find(i => i.name === unequippedItem.name && i.category === "Equipment");
              if (otherInventoryItem) {
                otherInventoryItem.quantity = (otherInventoryItem.quantity || 1) + 1;
              } else {
                inventory.push({ ...unequippedItem, quantity: 1 });
              }
              equippedItems[otherSlot] = null;
              showConfirmationModal(
                `Equipped ${selectedItem.name} in ${slot}, unequipped ${unequippedItem.name} from ${otherSlot} as ${selectedItem.name} is two-handed.`,
                () => {},
                true
              );
            }
          }
        } else {
          let errorMessage = selectedItem ? `Cannot equip ${selectedName}: stat requirements not met.` : `Cannot equip ${selectedName}: item not found or insufficient quantity.`;
          showConfirmationModal(errorMessage, () => {}, true);
          itemSelect.value(equippedItems[slot] ? equippedItems[slot].name : "None");
          return;
        }
      }
      calculateMovement();
      updatestatbonusesDisplay();
      updateResourcesBasedOnStats();
      updateAbilities();
      createInventoryUI();
      createEquipmentUI();
      createStatsUI();
    });

    let itemData = equippedItems[slot];
    let reqText = itemData && itemData.statRequirements ? Object.entries(itemData.statRequirements).map(([stat, val]) => `${val} ${stat}`).join(", ") : "-";
    createElement("td", reqText)
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");

    let dmgDefText = "-";
    if (itemData) {
      if (itemData.damageDice) {
        dmgDefText = `${itemData.damageDice}${itemData.modifier ? (itemData.modifier > 0 ? `+${itemData.modifier}` : itemData.modifier) : ""}`;
      } else if (typeof itemData.defense !== "undefined") {
        dmgDefText = `${itemData.defense}${itemData.modifier ? (itemData.modifier > 0 ? `+${itemData.modifier}` : itemData.modifier) : ""}`;
      }
    }
    let dmgDefCell = createElement("td")
      .parent(row)
      .style("border", "1px solid #ccc")
      .style("padding", "5px");
    if (itemData && itemData.damageDice) {
      createSpan(dmgDefText)
        .parent(dmgDefCell)
        .style("cursor", "pointer")
        .style("color", "blue")
        .style("text-decoration", "underline")
        .mousePressed(() => {
          if (current_stamina < 25) {
            showConfirmationModal(
              "Not enough stamina to attack! You need at least 25 stamina.",
              () => {},
              true
            );
            return;
          }
          let previousATG = current_ATG;
          current_stamina -= 25;
          if (staminaATGLink) {
            current_ATG += 25;
            if (typeof max_ATG !== "undefined" && current_ATG > max_ATG) {
              current_ATG = max_ATG;
            }
          }
          let rollResult = rollDice(itemData.damageDice, itemData.modifier || 0);
          let atgMessage = staminaATGLink ? `ATG: ${previousATG} → ${current_ATG}` : `ATG: ${current_ATG}`;
          showConfirmationModal(
            `${rollResult.display}\nWeapon: ${itemData.name}\nStamina: ${current_stamina}\n${atgMessage}`,
            () => {},
            true
          );
          redraw();
        });
    } else {
      dmgDefCell.html(dmgDefText);
    }

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

    let bonusText = itemData && itemData.statbonuses ? `${itemData.statbonuses.stat} ${itemData.statbonuses.amount > 0 ? "+" : ""}${itemData.statbonuses.amount}` : "-";
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

  createElement("h3", "Modify Crystals").parent(contentWrapper);

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

  // Fields
  let crystalSelectDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Crystal:").parent(crystalSelectDiv).style("display", "block");
  let crystalSelect = createSelect()
    .parent(crystalSelectDiv)
    .style("width", "100%")
    .style("border", "1px solid #ccc")
    .style("box-sizing", "border-box")
    .id("crystal-select");
  createSpan("Select a crystal to edit or choose 'Add New' to create one.")
    .parent(crystalSelectDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let nameDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Name:").parent(nameDiv).style("display", "block");
  let nameInput = createInput("")
    .parent(nameDiv)
    .style("width", "100%")
    .style("border", "1px solid #ccc")
    .style("box-sizing", "border-box")
    .attribute("placeholder", "e.g., Fire Crystal")
    .id("crystal-name-input");
  createSpan("The crystal’s unique identifier.")
    .parent(nameDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let qualityDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Quality:").parent(qualityDiv).style("display", "block");
  let qualitySelect = createSelect()
    .parent(qualityDiv)
    .style("width", "100%")
    .style("border", "1px solid #ccc")
    .style("box-sizing", "border-box")
    .id("crystal-quality-select");
  ["Common", "Uncommon", "Rare", "Epic", "Legendary"].forEach(q => qualitySelect.option(q));
  qualitySelect.value("Common");
  createSpan("The rarity or quality of the crystal.")
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
    .style("border", "1px solid #ccc")
    .style("box-sizing", "border-box")
    .attribute("placeholder", "Describe the crystal...")
    .id("crystal-description-input");
  createSpan("What the crystal does or its lore.")
    .parent(descDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let statbonusDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Stat Bonus:").parent(statbonusDiv).style("display", "inline-block").style("width", "100px");
  let statSelect = createSelect()
    .parent(statbonusDiv)
    .style("width", "80px")
    .style("margin-right", "5px")
    .style("border", "1px solid #ccc")
    .style("box-sizing", "border-box")
    .id("stat-bonus-select");
  ["None", "STR", "VIT", "DEX", "MAG", "WIL", "SPR", "LCK"].forEach(stat => statSelect.option(stat));
  let amountInput = createInput("0", "number")
    .parent(statbonusDiv)
    .style("width", "50px")
    .style("border", "1px solid #ccc")
    .style("box-sizing", "border-box")
    .id("stat-bonus-amount");
  createSpan("Stat to boost (e.g., MAG) and amount.")
    .parent(statbonusDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let statReqDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Stat Requirement:").parent(statReqDiv).style("display", "inline-block").style("width", "100px");
  let statReqSelect = createSelect()
    .parent(statReqDiv)
    .style("width", "80px")
    .style("margin-right", "5px")
    .style("border", "1px solid #ccc")
    .style("box-sizing", "border-box")
    .id("stat-req-select");
  ["None", "STR", "VIT", "DEX", "MAG", "WIL", "SPR", "LCK"].forEach(stat => statReqSelect.option(stat));
  let statReqInput = createInput("0", "number")
    .parent(statReqDiv)
    .style("width", "50px")
    .style("border", "1px solid #ccc")
    .style("box-sizing", "border-box")
    .id("stat-req-amount");
  createSpan("Minimum stat needed to equip (e.g., 5 MAG).")
    .parent(statReqDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let abilityDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Ability:").parent(abilityDiv).style("display", "block");
  let abilitySelect = createSelect()
    .parent(abilityDiv)
    .style("width", "100%")
    .style("border", "1px solid #ccc")
    .style("box-sizing", "border-box")
    .id("crystal-ability-select");
  createSpan("The ability granted by this crystal.")
    .parent(abilityDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  // Populate the crystal dropdown
  function updateCrystalOptions() {
    let prevValue = crystalSelect.value();
    let filteredInventory = inventory.filter(item => item.category === "Crystals");
    let filteredAvailable = (availableItems["Crystals"] || []).filter(item =>
      !filteredInventory.some(i => i.name === item.name)
    );

    crystalSelect.html("");
    crystalSelect.option("Add New", -1);

    filteredInventory.forEach((item, idx) => {
      crystalSelect.option(`[Inventory] ${item.name}`, idx);
    });
    filteredAvailable.forEach((item, idx) => {
      crystalSelect.option(`[Available] ${item.name}`, filteredInventory.length + idx);
    });

    if (prevValue !== null && crystalSelect.elt.querySelector(`option[value="${prevValue}"]`)) {
      crystalSelect.value(prevValue);
    } else {
      crystalSelect.value(-1);
    }
  }

  // Populate the ability dropdown
  function updateAbilityOptions() {
    abilitySelect.html("");
    abilitySelect.option("None", "");
    const crystalAbilities = existingAbilities["Crystals"] || [];
    crystalAbilities.forEach(ability => {
      abilitySelect.option(ability.name, ability.name);
    });
  }

  // Load from selected crystal
  function loadCrystalData() {
    let idx = parseInt(crystalSelect.value());
    if (idx === -1) {
      nameInput.value("");
      descriptionInput.value("");
      qualitySelect.value("Common");
      statSelect.value("None");
      amountInput.value("0");
      statReqSelect.value("None");
      statReqInput.value("0");
      abilitySelect.value("");
      return;
    }

    let filteredInventory = inventory.filter(item => item.category === "Crystals");
    let filteredAvailable = (availableItems["Crystals"] || []).filter(item =>
      !filteredInventory.some(i => i.name === item.name)
    );

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

    nameInput.value(item.name || "");
    descriptionInput.value(item.description || "");
    qualitySelect.value(item.quality || "Common");
    let statbonuses = item.statbonuses || {};
    let stat = Object.keys(statbonuses).length > 0 ? Object.keys(statbonuses)[0] : "None";
    statSelect.value(stat);
    amountInput.value(stat !== "None" && statbonuses[stat] ? statbonuses[stat] : "0");
    let statReqs = item.statReq || {};
    let reqStat = Object.keys(statReqs).length > 0 ? Object.keys(statReqs)[0] : "None";
    statReqSelect.value(reqStat);
    statReqInput.value(reqStat !== "None" && statReqs[reqStat] ? statReqs[reqStat] : "0");
    abilitySelect.value(item.abilities && item.abilities.length > 0 ? item.abilities[0] : "");
  }

  // Event Listeners
  crystalSelect.changed(() => {
    updateCrystalOptions();
    loadCrystalData();
  });
  updateCrystalOptions();
  updateAbilityOptions();

  // Helper: Build crystal object from form
  function buildCrystalObject() {
    let newName = nameInput.value().trim();
    let existingItem = inventory.find(i => i.name === newName && i.category === "Crystals");
    let preservedQuantity = existingItem ? (existingItem.quantity || 1) : 1;

    let stat = statSelect.value();
    let amount = parseInt(amountInput.value()) || 0;
    let reqStat = statReqSelect.value();
    let reqAmount = parseInt(statReqInput.value()) || 0;

    return {
      name: newName,
      description: descriptionInput.value(),
      category: "Crystals",
      quality: qualitySelect.value(),
      statbonuses: stat !== "None" ? { [stat]: amount } : {},
      statReq: reqStat !== "None" ? { [reqStat]: reqAmount } : {},
      abilities: abilitySelect.value() ? [abilitySelect.value()] : [],
      quantity: preservedQuantity
    };
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

      let crystalObj = buildCrystalObject();
      if (!crystalObj.name) {
        errorMessage.html("Please provide a name for the crystal.");
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        return;
      }

      let idx = parseInt(crystalSelect.value());
      let filteredInventory = inventory.filter(item => item.category === "Crystals");
      let filteredAvailable = (availableItems["Crystals"] || []).filter(item =>
        !filteredInventory.some(i => i.name === item.name)
      );

      if (idx >= filteredInventory.length && idx < filteredInventory.length + filteredAvailable.length) {
        let availIdx = idx - filteredInventory.length;
        if (availIdx >= 0 && availIdx < filteredAvailable.length) {
          let selectedItem = filteredAvailable[availIdx];
          if (inventory.some(i => i.name === crystalObj.name && i.category === "Crystals")) {
            errorMessage.html(`This crystal is already in your inventory. Use 'Save' to update it.`);
            errorMessage.style("display", "block");
            contentWrapper.elt.scrollTop = 0;
            return;
          }
          let masterIdx = availableItems["Crystals"].findIndex(e => e.name === selectedItem.name);
          if (masterIdx !== -1) {
            availableItems["Crystals"][masterIdx] = crystalObj;
          } else {
            availableItems["Crystals"].push(crystalObj);
          }
          inventory.push(crystalObj);
          localStorage.setItem('inventory', JSON.stringify(inventory));
          updateAvailableEquipment();
          updateAbilities();
          createInventoryUI();
          createEquipmentUI();
          createStatsUI();
          createAbilitiesUI();
          successMessage.html("Crystal Added to Inventory");
          successMessage.style("display", "block");
          contentWrapper.elt.scrollTop = 0;
          // Refresh the dropdown and select the new crystal
          updateCrystalOptions();
          let newFilteredInventory = inventory.filter(item => item.category === "Crystals");
          let newFilteredIdx = newFilteredInventory.findIndex(i => i.name === crystalObj.name);
          if (newFilteredIdx !== -1) {
            setTimeout(() => {
              crystalSelect.value(newFilteredIdx.toString());
            }, 0);
          }
        } else {
          errorMessage.html("Invalid crystal selection.");
          errorMessage.style("display", "block");
          contentWrapper.elt.scrollTop = 0;
        }
      } else if (idx === -1) {
        if (inventory.some(i => i.name === crystalObj.name && i.category === "Crystals")) {
          errorMessage.html(`A crystal with the name "${crystalObj.name}" already exists in your inventory.`);
          errorMessage.style("display", "block");
          contentWrapper.elt.scrollTop = 0;
          return;
        }
        let duplicateInMaster = availableItems["Crystals"]?.findIndex(e => e.name === crystalObj.name);
        if (duplicateInMaster !== undefined && duplicateInMaster !== -1) {
          errorMessage.html(`A crystal with the name "${crystalObj.name}" already exists in the master list.`);
          errorMessage.style("display", "block");
          contentWrapper.elt.scrollTop = 0;
          return;
        }
        inventory.push(crystalObj);
        if (!availableItems["Crystals"]) availableItems["Crystals"] = [];
        availableItems["Crystals"].push({ ...crystalObj });
        localStorage.setItem('inventory', JSON.stringify(inventory));
        updateAvailableEquipment();
        updateAbilities();
        createInventoryUI();
        createEquipmentUI();
        createStatsUI();
        createAbilitiesUI();
        successMessage.html("Crystal Added to Inventory");
        successMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        // Refresh the dropdown and select the new crystal
        updateCrystalOptions();
        let newFilteredInventory = inventory.filter(item => item.category === "Crystals");
        let newFilteredIdx = newFilteredInventory.findIndex(i => i.name === crystalObj.name);
        if (newFilteredIdx !== -1) {
          setTimeout(() => {
            crystalSelect.value(newFilteredIdx.toString());
          }, 0);
        }
      } else {
        errorMessage.html("Please select an available crystal or 'Add New' to add.");
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
      }
    });

  // SAVE => Update master list and inventory
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

      let crystalObj = buildCrystalObject();
      if (!crystalObj.name) {
        errorMessage.html("Please provide a name for the crystal.");
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        return;
      }

      let idx = parseInt(crystalSelect.value());
      let filteredInventory = inventory.filter(item => item.category === "Crystals");
      let filteredAvailable = (availableItems["Crystals"] || []).filter(item =>
        !filteredInventory.some(i => i.name === item.name)
      );

      let originalName = idx === -1 ? null : (idx < filteredInventory.length ? filteredInventory[idx].name : filteredAvailable[idx - filteredInventory.length].name);

      let duplicateIdx = (availableItems["Crystals"] || []).findIndex(e => e.name === crystalObj.name);
      if (duplicateIdx !== -1 && (originalName === null || originalName !== crystalObj.name)) {
        errorMessage.html(`A crystal with the name "${crystalObj.name}" already exists in the master list.`);
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        return;
      }

      // Update the master list
      if (idx === -1) {
        if (!availableItems["Crystals"]) availableItems["Crystals"] = [];
        availableItems["Crystals"].push(crystalObj);
      } else {
        let item;
        if (idx < filteredInventory.length) {
          item = filteredInventory[idx];
        } else {
          let availIdx = idx - filteredInventory.length;
          if (availIdx >= 0 && availIdx < filteredAvailable.length) {
            item = filteredAvailable[availIdx];
          } else {
            errorMessage.html("Invalid crystal selection.");
            errorMessage.style("display", "block");
            contentWrapper.elt.scrollTop = 0;
            return;
          }
        }
        let masterIdx = (availableItems["Crystals"] || []).findIndex(e => e.name === item.name);
        if (masterIdx !== -1) {
          availableItems["Crystals"][masterIdx] = crystalObj;
        } else {
          if (!availableItems["Crystals"]) availableItems["Crystals"] = [];
          availableItems["Crystals"].push(crystalObj);
        }

        // Update existing crystals in inventory with the same name
        inventory.forEach((invItem, invIdx) => {
          if (invItem.name === originalName && invItem.category === "Crystals") {
            inventory[invIdx] = { ...crystalObj, quantity: invItem.quantity || 1 };
          }
        });

        // Update equipped crystals with the same name
        for (let slot in equippedItems) {
          let equipped = equippedItems[slot];
          if (equipped && equipped.equippedCrystals) {
            equipped.equippedCrystals = equipped.equippedCrystals.map(crystal => {
              if (crystal && crystal.name === originalName) {
                return { ...crystalObj, quantity: crystal.quantity };
              }
              return crystal;
            });
          }
        }
      }

      localStorage.setItem('inventory', JSON.stringify(inventory));
      updateAvailableEquipment();
      updateAbilities();
      createInventoryUI();
      createEquipmentUI();
      createStatsUI();
      createAbilitiesUI();
      successMessage.html("Crystal Updated in Master List and Inventory");
      successMessage.style("display", "block");
      contentWrapper.elt.scrollTop = 0;
      // Refresh the dropdown after saving
      updateCrystalOptions();
    });

  // REMOVE => Remove crystal from master list and inventory
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

      let idx = parseInt(crystalSelect.value());
      if (idx === -1) {
        errorMessage.html("Please select a crystal to remove.");
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        return;
      }

      let filteredInventory = inventory.filter(item => item.category === "Crystals");
      let filteredAvailable = (availableItems["Crystals"] || []).filter(item =>
        !filteredInventory.some(i => i.name === item.name)
      );

      let item;
      let isInInventory = idx < filteredInventory.length;
      if (isInInventory) {
        item = filteredInventory[idx];
      } else {
        let availableIdx = idx - filteredInventory.length;
        if (availableIdx >= 0 && availableIdx < filteredAvailable.length) {
          item = filteredAvailable[availableIdx];
        } else {
          errorMessage.html("Invalid crystal selected for removal.");
          errorMessage.style("display", "block");
          contentWrapper.elt.scrollTop = 0;
          return;
        }
      }

      showConfirmationModal(
        `Remove the crystal from the master list? "${item.name}"`,
        () => {
          // Unequip from all slots in equippedItems
          for (let slot in equippedItems) {
            let equipped = equippedItems[slot];
            if (equipped && equipped.equippedCrystals) {
              equipped.equippedCrystals = equipped.equippedCrystals.map(crystal => {
                if (crystal && crystal.name === item.name) {
                  return null;
                }
                return crystal;
              });
            }
          }

          // Remove from inventory if it exists there
          if (isInInventory) {
            inventory.splice(inventory.indexOf(item), 1);
          }

          // Remove from availableItems["Crystals"]
          if (availableItems["Crystals"]) {
            availableItems["Crystals"] = availableItems["Crystals"].filter(
              i => i.name !== item.name
            );
          }

          localStorage.setItem('inventory', JSON.stringify(inventory));
          updateAvailableEquipment();
          updateAbilities();
          createInventoryUI();
          createEquipmentUI();
          createStatsUI();
          createAbilitiesUI();
          updateCrystalOptions(); // Refresh the dropdown after removal
          modalDiv.remove();
        }
      );
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
function createEquipmentFromModal(
  typeSelect,
  nameInput,
  penaltySelect,
  slotsSelect,
  linkedStatSelect,
  statbonusAmountInput,
  statbonusStatSelect,
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
  let statbonusAmount = parseInt(statbonusAmountInput.value()) || 0;
  let statbonusStat =
    statbonusStatSelect.value() === "None" ? null : statbonusStatSelect.value();
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
    statbonus:
      statbonusAmount !== 0 && statbonusStat
        ? { amount: statbonusAmount, stat: statbonusStat }
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
  updatestatbonusesDisplay();
}

// ### Talents UI ###
function getTalentPointCost(level) {
  switch (level) {
    case "I": return 1;
    case "II": return 3;
    case "III": return 5;
    default: return 0;
  }
}
function createTalentsUI() {
  let talentsContainerDiv = select("#talents");
  if (!talentsContainerDiv) {
    console.error("No #talents div found in HTML!");
    return;
  }
  talentsContainerDiv.html("");

  createElement("h2", "Talents").parent(talentsContainerDiv);
  let talentsDesc = createP(
    "Use buttons to create, modify, or reset talents. Click a talent's name for details, use arrows to reorder, change levels (adjusts Talent Points), or remove to unequip and refund points."
  ).parent(talentsContainerDiv);
  talentsDesc
    .style("font-size", "12px")
    .style("color", "#666")
    .style("margin-top", "5px")
    .style("margin-bottom", "10px");

  // Display available Talent Points
  let availableTalentPoints = totalTalentPoints - spentTalentPoints;
  let talentPointsDiv = createDiv().parent(talentsContainerDiv).style("margin", "5px");
  createSpan(`Available Talent Points: ${availableTalentPoints}/${totalTalentPoints}`).parent(talentPointsDiv);

  // Buttons
  let buttonRow = createDiv().parent(talentsContainerDiv).class("resource-row");
  createButton("Create Custom Talent")
    .parent(buttonRow)
    .class("resource-button")
    .mousePressed(showAddCustomTalentModal);
  createButton("Modify Talents")
    .parent(buttonRow)
    .class("resource-button")
    .mousePressed(showAddEditTalentsModal);
  createButton("Default Talent List")
    .parent(buttonRow)
    .class("resource-button")
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
  const appWrapper = select("#app-wrapper");
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv().parent(appWrapper);
  modalDiv.class("modal")
    .style("position", "fixed")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)")
    .style("background", "#fff")
    .style("padding", "20px")
    .style("border", "2px solid #000")
    .style("z-index", "1000")
    .style("width", "300px")
    .style("font-size", "14px");

  createElement("h3", "Create Custom Talent").parent(modalDiv);

  let errorMessage = createP("")
    .parent(modalDiv)
    .style("color", "red")
    .style("display", "none")
    .style("margin-bottom", "10px");

  let successMessage = createP("")
    .parent(modalDiv)
    .style("color", "green")
    .style("display", "none")
    .style("margin-bottom", "10px");

  let nameDiv = createDiv().parent(modalDiv).style("margin-bottom", "10px");
  createSpan("Talent Name:").parent(nameDiv).style("display", "block");
  let nameInput = createInput("")
    .parent(nameDiv)
    .style("width", "100%")
    .attribute("placeholder", "e.g., Fire Mastery");
  createSpan("The talent’s unique identifier.")
    .parent(nameDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let levelDiv = createDiv().parent(modalDiv).style("margin-bottom", "10px");
  createSpan("Levels (select highest desired):").parent(levelDiv).style("display", "block");
  let levelsDiv = createDiv().parent(levelDiv).style("margin-bottom", "10px");

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
      .style("margin-bottom", "5px")
      .attribute("placeholder", `e.g., Add ${lvl === "I" ? "1d6" : lvl === "II" ? "2d6" : "3d6"} fire damage to all fire spells.`);
    levelDescriptions[lvl] = { div: descDiv, input: descInput };
    chk.changed(() =>
      manageLevelDependencies(levelCheckboxes, levelDescriptions, lvl)
    );
  });

  let categoryDiv = createDiv().parent(modalDiv).style("margin-bottom", "10px");
  createSpan("Category:").parent(categoryDiv).style("display", "block");
  let categorySelect = createSelect()
    .parent(categoryDiv)
    .style("width", "100%");
  [
    "Physical Combat",
    "Magical",
    "Ranged Combat",
    "Defensive",
    "Utility & Tactical",
  ].forEach((cat) => categorySelect.option(cat));
  createSpan("The talent’s category.")
    .parent(categoryDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  // Button container for consistent button styling
  let buttonContainer = createDiv()
    .parent(modalDiv)
    .style("display", "flex")
    .style("justify-content", "space-between")
    .style("gap", "5px")
    .style("margin-top", "10px");

  // SAVE => Add talent to existingTalents
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
      let name = nameInput.value();
      let category = categorySelect.value();
      if (!name || !category) {
        errorMessage.html("Please provide a talent name and category.");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        modalDiv.elt.scrollTop = 0;
        return;
      }

      let checkedLevels = Object.keys(levelCheckboxes).filter((lvl) =>
        levelCheckboxes[lvl].checked()
      );
      if (checkedLevels.length === 0) {
        errorMessage.html("Please select at least one level.");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        modalDiv.elt.scrollTop = 0;
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
          errorMessage.html(
            `Please ensure Level ${
              ["I", "II", "III"].indexOf(lvl) + 1
            } is selected and described.`
          );
          errorMessage.style("display", "block");
          successMessage.style("display", "none");
          modalDiv.elt.scrollTop = 0;
          return;
        }
        let desc = levelDescriptions[lvl].input.value();
        if (!desc) {
          errorMessage.html(`Please provide a description for Level ${lvl}.`);
          errorMessage.style("display", "block");
          successMessage.style("display", "none");
          modalDiv.elt.scrollTop = 0;
          return;
        }
      }

      // Add the talents to existingTalents only
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

      createTalentsUI(); // Refresh the Talents tab UI

      // Show success message and keep modal open
      successMessage.html("Talent Added to Master List");
      successMessage.style("display", "block");
      errorMessage.style("display", "none");
      modalDiv.elt.scrollTop = 0;
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
    .mousePressed(() => modalDiv.remove());
}
function showAddEditTalentsModal() {
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

  createElement("h3", "Modify Existing Talents").parent(contentWrapper);

  let errorMessage = createP("")
    .parent(contentWrapper)
    .style("color", "red")
    .style("display", "none")
    .style("margin-bottom", "10px");

  let successMessage = createP("")
    .parent(contentWrapper)
    .style("color", "green")
    .style("display", "none")
    .style("margin-bottom", "10px");

  let talentNames = [
    ...new Set(existingTalents.map((t) => t.name.split(" - Level")[0])),
  ];
  let talentSelect = createSelect()
    .parent(contentWrapper)
    .style("width", "100%")
    .style("margin-bottom", "10px");

  // Function to update the talent selection dropdown
  function updateTalentOptions() {
    let prevValue = talentSelect.value();
    talentSelect.html(""); // Clear existing options
    talentNames.forEach((name) => {
      let isEquipped = talents.some(t => t.name.startsWith(name));
      let displayName = isEquipped ? `[Equipped] ${name}` : `[Available] ${name}`;
      talentSelect.option(displayName, name);
    });
    // Restore previous selection if it still exists
    if (prevValue && talentNames.includes(prevValue)) {
      talentSelect.value(prevValue);
    }
  }

  let categoryLabel = createSpan("Category:").parent(contentWrapper);
  let categorySelect = createSelect()
    .parent(contentWrapper)
    .style("width", "100%")
    .style("margin-bottom", "10px");
  [
    "Physical Combat",
    "Magical",
    "Ranged Combat",
    "Defensive",
    "Utility & Tactical",
  ].forEach((cat) => categorySelect.option(cat));

  let levelsDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
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
  updateTalentOptions(); // Initial population of the dropdown
  if (talentNames.length > 0) updateModal();

  // ADD => Add to player's talents list
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
      let selectedName = talentSelect.value();
      if (!selectedName) {
        errorMessage.html("Please select a talent name.");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        return;
      }
      let checkedLevels = Object.keys(levelCheckboxes).filter((lvl) =>
        levelCheckboxes[lvl].checked()
      );
      if (checkedLevels.length === 0) {
        errorMessage.html("Please select at least one level.");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        return;
      }
      let initialLevel = "I";
      let desc = levelDescriptions[initialLevel].input.value();
      if (!desc) {
        errorMessage.html(`Please provide a description for Level ${initialLevel}.`);
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        return;
      }

      // Check for duplicates in player's talents list
      if (talents.some(t => t.name.startsWith(selectedName))) {
        errorMessage.html(`Talent "${selectedName}" is already in your talents list.`);
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        return;
      }

      // Check Talent Points
      let talentCost = getTalentPointCost(initialLevel);
      let availableTalentPoints = totalTalentPoints - spentTalentPoints;
      if (talentCost > availableTalentPoints) {
        errorMessage.html(`Not enough Talent Points! Need ${talentCost}, have ${availableTalentPoints}.`);
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        return;
      }

      talents = talents.filter((t) => !t.name.startsWith(selectedName));
      let fullName = `${selectedName} - Level ${initialLevel}`;
      talents.push({
        name: fullName,
        level: initialLevel,
        category: categorySelect.value(),
        description: desc,
      });

      // Deduct Talent Points
      spentTalentPoints += talentCost;
      createStatsUI(); // Update Talent Points display on Stats tab
      createTalentsUI(); // Refresh the entire Talents tab UI
      updateTalentOptions(); // Refresh the dropdown to update [Available]/[Equipped] labels

      // Show success message and keep modal open
      successMessage.html("Talent Added to Character");
      successMessage.style("display", "block");
      errorMessage.style("display", "none");
      contentWrapper.elt.scrollTop = 0;
    });

  // SAVE => Update talent in existingTalents
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
      let selectedName = talentSelect.value();
      let category = categorySelect.value();
      if (!selectedName) {
        errorMessage.html("Please select a talent name.");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        return;
      }
      let checkedLevels = Object.keys(levelCheckboxes).filter((lvl) =>
        levelCheckboxes[lvl].checked()
      );
      if (checkedLevels.length === 0 || !checkedLevels.includes("I")) {
        errorMessage.html("Please select at least Level I.");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        contentWrapper.elt.scrollTop = 0;
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
          errorMessage.html(
            `Please ensure Level ${
              ["I", "II", "III"].indexOf(lvl) + 1
            } is selected and described.`
          );
          errorMessage.style("display", "block");
          successMessage.style("display", "none");
          contentWrapper.elt.scrollTop = 0;
          return;
        }
        let desc = levelDescriptions[lvl].input.value();
        if (!desc) {
          errorMessage.html(`Please provide a description for Level ${lvl}.`);
          errorMessage.style("display", "block");
          successMessage.style("display", "none");
          contentWrapper.elt.scrollTop = 0;
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
      createTalentsUI(); // Refresh the entire Talents tab UI
      successMessage.html("Talent Updated");
      successMessage.style("display", "block");
      errorMessage.style("display", "none");
      contentWrapper.elt.scrollTop = 0;
    });

  // REMOVE => Remove talent from existingTalents
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
      let selectedName = talentSelect.value();
      if (!selectedName) {
        showConfirmationModal(
          "Please select a talent to remove.",
          () => {},
          true
        );
        return;
      }
      showConfirmationModal(
        `Are you sure you want to remove "${selectedName}" from the master list? This action cannot be undone.`,
        () => {
          // Refund Talent Points for talents in the player's list
          talents.forEach((talent) => {
            if (talent.name.startsWith(selectedName + " - Level")) {
              let cost = getTalentPointCost(talent.level);
              spentTalentPoints -= cost;
            }
          });
          // Remove from existingTalents and talents
          existingTalents = existingTalents.filter(
            (t) => !t.name.startsWith(selectedName + " - Level")
          );
          talents = talents.filter(
            (t) => !t.name.startsWith(selectedName + " - Level")
          );
          createStatsUI(); // Update Talent Points display on Stats tab
          createTalentsUI(); // Refresh the entire Talents tab UI
          modalDiv.remove();
        }
      );
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
function resetToDefaultTalents() {
  // Refund Talent Points for all talents in the player's list
  talents.forEach((talent) => {
    let cost = getTalentPointCost(talent.level);
    spentTalentPoints -= cost;
  });

  // Clear the player's talents list
  talents = [];

  // Reset existingTalents to the default list
  existingTalents = [...defaultTalents];
  
  createStatsUI(); // Update Talent Points display on Stats tab
  createTalentsUI(); // Refresh the Talents tab UI
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
        let oldCost = getTalentPointCost(talent.level);
        let newCost = getTalentPointCost(newLevel);
        let costDifference = newCost - oldCost;
        let availableTalentPoints = totalTalentPoints - spentTalentPoints;
        if (costDifference > 0 && costDifference > availableTalentPoints) {
          showConfirmationModal(
            `Not enough Talent Points to upgrade! Need ${costDifference}, have ${availableTalentPoints}.`,
            () => {},
            true
          );
          levelSelect.value(talent.level); // Revert the selection
          return;
        }
        spentTalentPoints += costDifference;
        talents[index] = { ...newTalentData };
        createStatsUI(); // Update Talent Points display on Stats tab
        createTalentsUI(); // Refresh the entire Talents tab UI
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
          let cost = getTalentPointCost(talent.level);
          spentTalentPoints -= cost; // Refund Talent Points
          talents.splice(index, 1);
          createStatsUI(); // Update Talent Points display on Stats tab
          createTalentsUI(); // Refresh the entire Talents tab UI
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
    "Use buttons to create, modify, or reset traits. A player can have a maximum of 3 traits by default. Adjust the max traits below if needed."
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

  let buttonRow = createDiv().parent(traitsContainerDiv).class("resource-row");
  createButton("Create Custom Trait")
    .parent(buttonRow)
    .class("resource-button")
    .mousePressed(showAddCustomTraitModal);
  createButton("Modify Traits")
    .parent(buttonRow)
    .class("resource-button")
    .mousePressed(showAddEditTraitsModal);
  createButton("Default Trait List")
    .parent(buttonRow)
    .class("resource-button")
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
}
// Custom Trait Modal
function showAddCustomTraitModal() {
  if (traits.length >= maxTraits) {
    showConfirmationModal(
      `You have reached the maximum number of traits (${maxTraits}). Remove a trait to add a new one.`,
      () => {},
      true
    );
    return;
  }
  const appWrapper = select("#app-wrapper");
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv().parent(appWrapper);
  modalDiv.class("modal")
    .style("position", "fixed")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)")
    .style("background", "#fff")
    .style("padding", "20px")
    .style("border", "2px solid #000")
    .style("z-index", "1000")
    .style("width", "300px")
    .style("font-size", "14px");

  createElement("h3", "Create Custom Trait").parent(modalDiv);

  let errorMessage = createP("")
    .parent(modalDiv)
    .style("color", "red")
    .style("display", "none")
    .style("margin-bottom", "10px");

  let successMessage = createP("")
    .parent(modalDiv)
    .style("color", "green")
    .style("display", "none")
    .style("margin-bottom", "10px");

  let nameDiv = createDiv().parent(modalDiv).style("margin-bottom", "10px");
  createSpan("Trait Name:").parent(nameDiv).style("display", "block");
  let nameInput = createInput("")
    .parent(nameDiv)
    .style("width", "100%")
    .attribute("placeholder", "e.g., Keen Senses");
  createSpan("The trait’s unique identifier.")
    .parent(nameDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let categoryDiv = createDiv().parent(modalDiv).style("margin-bottom", "10px");
  createSpan("Category:").parent(categoryDiv).style("display", "block");
  let categorySelect = createSelect()
    .parent(categoryDiv)
    .style("width", "100%");
  ["Physical", "Combat", "Magical", "Utility"].forEach((cat) =>
    categorySelect.option(cat)
  );
  createSpan("The trait’s category.")
    .parent(categoryDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let positiveDiv = createDiv().parent(modalDiv).style("margin-bottom", "10px");
  createSpan("Positive Effect:").parent(positiveDiv).style("display", "block");
  let positiveInput = createElement("textarea")
    .parent(positiveDiv)
    .style("width", "100%")
    .style("height", "60px")
    .attribute("placeholder", "e.g., +2 to Perception checks");
  createSpan("The trait’s positive effect.")
    .parent(positiveDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let negativeDiv = createDiv().parent(modalDiv).style("margin-bottom", "10px");
  createSpan("Negative Effect:").parent(negativeDiv).style("display", "block");
  let negativeInput = createElement("textarea")
    .parent(negativeDiv)
    .style("width", "100%")
    .style("height", "60px")
    .attribute("placeholder", "e.g., -1 to Stealth checks");
  createSpan("The trait’s negative effect.")
    .parent(negativeDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  // Button container for consistent button styling
  let buttonContainer = createDiv()
    .parent(modalDiv)
    .style("display", "flex")
    .style("justify-content", "space-between")
    .style("gap", "5px")
    .style("margin-top", "10px");

  // SAVE => Add trait to existingTraits only
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
      let name = nameInput.value();
      let category = categorySelect.value();
      let positive = positiveInput.value();
      let negative = negativeInput.value();
      if (!name || !category || !positive || !negative) {
        errorMessage.html("Please fill in all fields.");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        modalDiv.elt.scrollTop = 0;
        return;
      }

      if (traits.some((t) => t.name === name)) {
        errorMessage.html("This trait is already added!");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        modalDiv.elt.scrollTop = 0;
        return;
      }

      let newTrait = { name, category, positive, negative };
      existingTraits.push(newTrait);
      // Do not add to traits (player's list)
      updateTraitsTable();

      // Show success message and keep modal open
      successMessage.html("Trait Added to Master List");
      successMessage.style("display", "block");
      errorMessage.style("display", "none");
      modalDiv.elt.scrollTop = 0;
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
    .mousePressed(() => modalDiv.remove());
}
function showAddEditTraitsModal() {
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

  createElement("h3", "Modify Existing Traits").parent(contentWrapper);

  let errorMessage = createP("")
    .parent(contentWrapper)
    .style("color", "red")
    .style("display", "none")
    .style("margin-bottom", "10px");

  let successMessage = createP("")
    .parent(contentWrapper)
    .style("color", "green")
    .style("display", "none")
    .style("margin-bottom", "10px");

  let traitNames = [...new Set(existingTraits.map((t) => t.name))];
  let traitSelect = createSelect()
    .parent(contentWrapper)
    .style("width", "100%")
    .style("margin-bottom", "10px");

  // Function to update the trait selection dropdown
  function updateTraitOptions() {
    let prevValue = traitSelect.value();
    traitSelect.html(""); // Clear existing options
    traitNames.forEach((name) => {
      let isEquipped = traits.some(t => t.name === name);
      let displayName = isEquipped ? `[Equipped] ${name}` : `[Available] ${name}`;
      traitSelect.option(displayName, name);
    });
    // Restore previous selection if it still exists
    if (prevValue && traitNames.includes(prevValue)) {
      traitSelect.value(prevValue);
    }
  }

  let nameDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Trait Name:").parent(nameDiv).style("display", "block");
  let nameInput = createInput("")
    .parent(nameDiv)
    .style("width", "100%")
    .attribute("placeholder", "e.g., Keen Senses");
  createSpan("The trait’s unique identifier.")
    .parent(nameDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let categoryDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Category:").parent(categoryDiv).style("display", "block");
  let categorySelect = createSelect()
    .parent(categoryDiv)
    .style("width", "100%");
  ["Physical", "Combat", "Magical", "Utility"].forEach((cat) =>
    categorySelect.option(cat)
  );
  createSpan("The trait’s category.")
    .parent(categoryDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let positiveDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Positive Effect:").parent(positiveDiv).style("display", "block");
  let positiveInput = createElement("textarea")
    .parent(positiveDiv)
    .style("width", "100%")
    .style("height", "60px")
    .attribute("placeholder", "e.g., +2 to Perception checks");
  createSpan("The trait’s positive effect.")
    .parent(positiveDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let negativeDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Negative Effect:").parent(negativeDiv).style("display", "block");
  let negativeInput = createElement("textarea")
    .parent(negativeDiv)
    .style("width", "100%")
    .style("height", "60px")
    .attribute("placeholder", "e.g., -1 to Stealth checks");
  createSpan("The trait’s negative effect.")
    .parent(negativeDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  function loadTraitData() {
    let selectedName = traitSelect.value();
    let trait = existingTraits.find(t => t.name === selectedName);
    if (trait) {
      nameInput.value(trait.name);
      categorySelect.value(trait.category);
      positiveInput.value(trait.positive);
      negativeInput.value(trait.negative);
    }
  }

  traitSelect.changed(loadTraitData);
  updateTraitOptions(); // Initial population of the dropdown
  if (traitNames.length > 0) loadTraitData();

  // ADD => Add to player's traits list
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
      if (traits.length >= maxTraits) {
        errorMessage.html(
          `You have reached the maximum number of traits (${maxTraits}). Remove a trait to add a new one.`
        );
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        contentWrapper.elt.scrollTop = 0;
        return;
      }
      let selectedName = traitSelect.value();
      if (!selectedName) {
        errorMessage.html("Please select a trait.");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        contentWrapper.elt.scrollTop = 0;
        return;
      }
      let traitToAdd = existingTraits.find(t => t.name === selectedName);
      if (traitToAdd) {
        if (traits.some((t) => t.name === traitToAdd.name)) {
          errorMessage.html("This trait is already added!");
          errorMessage.style("display", "block");
          successMessage.style("display", "none");
          contentWrapper.elt.scrollTop = 0;
          return;
        }
        traits.push({ ...traitToAdd });
        updateTraitsTable();
        updateTraitOptions(); // Refresh the dropdown to update [Available]/[Equipped] labels
        successMessage.html("Trait Added to Character");
        successMessage.style("display", "block");
        errorMessage.style("display", "none");
        contentWrapper.elt.scrollTop = 0;
      }
    });

  // SAVE => Update trait in existingTraits
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
      let selectedName = traitSelect.value();
      if (!selectedName) {
        errorMessage.html("Please select a trait.");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        contentWrapper.elt.scrollTop = 0;
        return;
      }
      let newName = nameInput.value();
      let newCategory = categorySelect.value();
      let newPositive = positiveInput.value();
      let newNegative = negativeInput.value();
      if (!newName || !newPositive || !newNegative) {
        errorMessage.html("Please provide a name, positive effect, and negative effect.");
        errorMessage.style("display", "block");
        successMessage.style("display", "none");
        contentWrapper.elt.scrollTop = 0;
        return;
      }

      let index = existingTraits.findIndex(t => t.name === selectedName);
      if (index >= 0) {
        let oldName = existingTraits[index].name;
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
        traitNames = [...new Set(existingTraits.map((t) => t.name))];
        updateTraitOptions();
        traitSelect.value(newName);
        successMessage.html("Trait Updated");
        successMessage.style("display", "block");
        errorMessage.style("display", "none");
        contentWrapper.elt.scrollTop = 0;
      }
    });

  // REMOVE => Remove trait from existingTraits
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
      let selectedName = traitSelect.value();
      if (!selectedName) {
        showConfirmationModal(
          "Please select a trait to remove.",
          () => {},
          true
        );
        return;
      }
      showConfirmationModal(
        `Are you sure you want to remove "${selectedName}" from the master list? This action cannot be undone.`,
        () => {
          existingTraits = existingTraits.filter(t => t.name !== selectedName);
          traits = traits.filter(t => t.name !== selectedName);
          updateTraitsTable();
          traitNames = [...new Set(existingTraits.map((t) => t.name))];
          updateTraitOptions();
          modalDiv.remove();
        }
      );
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

function getstatbonuses() {
  let bonuses = {};
  for (let slot in equippedItems) {
    let item = equippedItems[slot];
    if (item) {
      // Equipment bonuses with stat bonuses
      if (item.statbonuses) {
        let stat = item.statbonuses.stat;
        let amount = item.statbonuses.amount || 0;
        bonuses[stat] = (bonuses[stat] || 0) + amount;
      }
      // Crystal bonuses (already using statbonuses)
      if (item.equippedCrystals) {
        item.equippedCrystals.forEach(crystal => {
          if (crystal && crystal.statbonuses) {
            for (let stat in crystal.statbonuses) {
              bonuses[stat] = (bonuses[stat] || 0) + crystal.statbonuses[stat];
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
  let bonuses = getstatbonuses();
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

function updatestatbonusesDisplay() {
  let bonuses = getstatbonuses();
  for (let stat in statbonusElements) {
    // Skip Level, EXP, and Movement
    if (stat === "Level" || stat === "EXP" || stat === "Movement") {
      continue;
    }
    let bonus = bonuses[stat] || 0;
    if (bonus !== 0) {
      statbonusElements[stat].html(`${bonus > 0 ? '+' : ''}${bonus}`);
      statbonusElements[stat].style("color", bonus > 0 ? "green" : "red");
    } else {
      statbonusElements[stat].html("");
    }
  }
}
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
      showConfirmationModal("Are you sure you want to restore the default equipment list? This will reset the master list and unequip all items.", () => {
        console.log("Restoring default equipment list");
        for (let slot in equippedItems) {
          equippedItems[slot] = null;
        }
        availableItems["Equipment"] = JSON.parse(JSON.stringify(pristineAvailableItems["Equipment"]));
        availableItems["Equipment"].forEach(item => {
          if (!inventory.some(i => i.name === item.name && i.category === "Equipment")) {
            inventory.push({ ...item, quantity: 1 });
          }
        });
        console.log("Restored default equipment list:", availableItems["Equipment"]);
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
      showConfirmationModal("Are you sure you want to restore the default items list? This will reset the master list.", () => {
        console.log("Restoring default items list");
        ["Consumables", "Materials", "Crystals", "Quest Items", "Miscellaneous"].forEach(cat => {
          availableItems[cat] = JSON.parse(JSON.stringify(pristineAvailableItems[cat] || []));
          availableItems[cat].forEach(item => {
            if (!inventory.some(i => i.name === item.name && i.category === cat)) {
              inventory.push({ ...item, quantity: 1 });
            }
          });
        });
        console.log("Restored default items list:", {
          Consumables: availableItems["Consumables"],
          Materials: availableItems["Materials"],
          Crystals: availableItems["Crystals"],
          QuestItems: availableItems["Quest Items"],
          Miscellaneous: availableItems["Miscellaneous"]
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
    let equippedItemsInCategory = Object.values(equippedItems).filter(item => item && item.category === category);

    let allItemsMap = new Map();
    items.forEach(item => {
      allItemsMap.set(item.name, item);
    });
    equippedItemsInCategory.forEach(item => {
      if (!allItemsMap.has(item.name)) {
        allItemsMap.set(item.name, item);
      }
    });
    let uniqueItems = Array.from(allItemsMap.values());
    let totalItemsCount = uniqueItems.length;

    let categoryDiv = createDiv().parent(categoryContainer).class("expandable-section").style("margin-bottom", "10px");
    let categoryHeader = createElement("h3", `${category} (${totalItemsCount})`)
      .parent(categoryDiv);

    let contentDiv = createDiv().parent(categoryDiv).class("content");
    if (categoryStates[category]) {
      categoryHeader.addClass("expanded");
      contentDiv.addClass("expanded");
    }

    categoryHeader.mousePressed(() => {
      let isExpanded = categoryHeader.hasClass("expanded");
      if (isExpanded) {
        categoryHeader.removeClass("expanded");
        contentDiv.removeClass("expanded");
        categoryStates[category] = false;
      } else {
        categoryHeader.addClass("expanded");
        contentDiv.addClass("expanded");
        categoryStates[category] = true;
      }
    });

    if (category === "Equipment") {
      let equipmentByType = {};
      let typeItemsMap = new Map();

      items.forEach(item => {
        const type = item.type || "Miscellaneous";
        if (!equipmentByType[type]) equipmentByType[type] = [];
        if (!typeItemsMap.has(type)) typeItemsMap.set(type, new Map());
        typeItemsMap.get(type).set(item.name, item);
      });

      equippedItemsInCategory.forEach(item => {
        const type = item.type || "Miscellaneous";
        if (!equipmentByType[type]) equipmentByType[type] = [];
        if (!typeItemsMap.has(type)) typeItemsMap.set(type, new Map());
        if (!typeItemsMap.get(type).has(item.name)) {
          typeItemsMap.get(type).set(item.name, item);
        }
      });

      if (Object.keys(equipmentByType).length === 0) {
        createP("No equipment items in this category.")
          .parent(contentDiv)
          .style("color", "#666")
          .style("padding", "5px");
      } else {
        Object.keys(equipmentByType).sort().forEach(type => {
          let typeItems = Array.from(typeItemsMap.get(type).values());
          let typeDiv = createDiv().parent(contentDiv).class("expandable-section").style("margin-left", "10px").style("margin-bottom", "5px");
          let typeHeader = createElement("h4", `${type} (${typeItems.length})`)
            .parent(typeDiv);

          let typeContentDiv = createDiv().parent(typeDiv).class("content");

          let typeStateKey = `${category}-${type}`;
          if (categoryStates[typeStateKey]) {
            typeHeader.addClass("expanded");
            typeContentDiv.addClass("expanded");
          }

          typeHeader.mousePressed(() => {
            let isExpanded = typeHeader.hasClass("expanded");
            if (isExpanded) {
              typeHeader.removeClass("expanded");
              typeContentDiv.removeClass("expanded");
              categoryStates[typeStateKey] = false;
            } else {
              typeHeader.addClass("expanded");
              typeContentDiv.addClass("expanded");
              categoryStates[typeStateKey] = true;
            }
          });

          let tableWrapper = createDiv().parent(typeContentDiv).class("table-wrapper").style("overflow-x", "auto");
let table = createElement("table").parent(tableWrapper).class("rules-table");
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
            let inventoryItem = inventory.find(i => i.name === item.name && i.category === item.category);
            let inventoryQty = inventoryItem ? (inventoryItem.quantity || 1) : 0;
            let qtyInput = createInput(inventoryQty.toString(), "number")
              .parent(quantityCell)
              .attribute("min", "1")
              .style("width", "50px")
              .value(inventoryQty.toString());
            qtyInput.changed(function() {
              let newQuantity = parseInt(this.value()) || 1;
              console.log(`Attempting to update ${item.name} quantity to ${newQuantity}`);

              // Calculate the number of equipped instances
              let equippedQty = Object.values(equippedItems).filter(eq => eq && eq.name === item.name && eq.category === item.category).length;
              let equippedSlots = Object.keys(equippedItems)
                .filter(slot => equippedItems[slot] && equippedItems[slot].name === item.name && equippedItems[slot].category === item.category);

              // Prevent lowering quantity below the number of equipped instances
              if (newQuantity < equippedQty) {
                showConfirmationModal(
                  `Cannot reduce quantity below ${equippedQty} because ${equippedQty} instance(s) are currently equipped in ${equippedSlots.join(", ")}.`,
                  () => {},
                  true
                );
                this.value(inventoryQty.toString()); // Revert to the original quantity
                return;
              }

              let inventoryIdx = inventory.findIndex(i => i.name === item.name && i.category === item.category);
              if (inventoryIdx !== -1) {
                inventory[inventoryIdx].quantity = newQuantity;
              } else {
                inventory.push({ ...item, quantity: newQuantity });
              }
              console.log("Updated inventory:", JSON.stringify(inventory, null, 2));
              localStorage.setItem('inventory', JSON.stringify(inventory));
              nameSpan.html(`${item.name}`);
              this.value(newQuantity.toString());
              createInventoryUI();
              createEquipmentUI();
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
                    Object.keys(equippedItems).forEach(slot => {
                      if (equippedItems[slot] && equippedItems[slot].name === item.name) {
                        equippedItems[slot] = null;
                      }
                    });
                    inventory.splice(inventoryIdx, 1);
                    localStorage.setItem('inventory', JSON.stringify(inventory));
                    updateAvailableEquipment();
                    createInventoryUI();
                    createEquipmentUI();
                    if (modalDiv && modalDiv.elt && document.body.contains(modalDiv.elt)) {
                      updateEquipmentOptions();
                    }
                  });
                } else {
                  console.error(`Item ${item.name} not found in inventory for deletion!`);
                }
              });
          });
        });
      }
    } else {
      let tableWrapper = createDiv().parent(contentDiv).class("table-wrapper");
      let table = createElement("table").parent(tableWrapper).class("rules-table");
      let header = createElement("tr").parent(table);
      createElement("th", "Item Name").parent(header).style("width", "20%");
      createElement("th", "Description").parent(header).style("width", "30%");
      createElement("th", "Quantity").parent(header).style("width", "15%");
      createElement("th", "Quality").parent(header).style("width", "15%");
      createElement("th", "Actions").parent(header).style("width", "20%");

      if (items.length === 0 && equippedItemsInCategory.length === 0) {
        let row = createElement("tr").parent(table);
        createElement("td", "No items in this category.")
          .parent(row)
          .attribute("colspan", "5")
          .style("color", "#666")
          .style("padding", "5px");
      } else {
        let allItemsMap = new Map();
        items.forEach(item => {
          allItemsMap.set(item.name, item);
        });
        equippedItemsInCategory.forEach(item => {
          if (!allItemsMap.has(item.name)) {
            allItemsMap.set(item.name, item);
          }
        });
        let allItems = Array.from(allItemsMap.values());

        allItems.forEach((item, idx) => {
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
          let inventoryItem = inventory.find(i => i.name === item.name && i.category === item.category);
          let inventoryQty = inventoryItem ? (inventoryItem.quantity || 1) : 0;
          let qtyInput = createInput(inventoryQty.toString(), "number")
            .parent(quantityCell)
            .attribute("min", "1")
            .style("width", "50px")
            .value(inventoryQty.toString());
          qtyInput.changed(function() {
            let newQuantity = parseInt(this.value()) || 1;
            console.log(`Attempting to update ${item.name} quantity to ${newQuantity}`);

            // Calculate the number of equipped instances
            let equippedQty = Object.values(equippedItems).filter(eq => eq && eq.name === item.name && eq.category === item.category).length;
            let equippedSlots = Object.keys(equippedItems)
              .filter(slot => equippedItems[slot] && equippedItems[slot].name === item.name && equippedItems[slot].category === item.category);

            // Prevent lowering quantity below the number of equipped instances
            if (newQuantity < equippedQty) {
              showConfirmationModal(
                `Cannot reduce quantity below ${equippedQty} because ${equippedQty} instance(s) are currently equipped in ${equippedSlots.join(", ")}.`,
                () => {},
                true
              );
              this.value(inventoryQty.toString()); // Revert to the original quantity
              return;
            }

            let inventoryIdx = inventory.findIndex(i => i.name === item.name && i.category === item.category);
            if (inventoryIdx !== -1) {
              inventory[inventoryIdx].quantity = newQuantity;
            } else {
              inventory.push({ ...item, quantity: newQuantity });
            }
            console.log("Updated inventory:", JSON.stringify(inventory, null, 2));
            localStorage.setItem('inventory', JSON.stringify(inventory));
            nameSpan.html(`${item.name}`);
            this.value(newQuantity.toString());
            createInventoryUI();
            createEquipmentUI();
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
                  Object.keys(equippedItems).forEach(slot => {
                    if (equippedItems[slot] && equippedItems[slot].name === item.name) {
                      equippedItems[slot] = null;
                    }
                  });
                  inventory.splice(inventoryIdx, 1);
                  localStorage.setItem('inventory', JSON.stringify(inventory));
                  updateAvailableEquipment();
                  createInventoryUI();
                  createEquipmentUI();
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

  createElement("h3", "Modify Items").parent(contentWrapper);

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
  createSpan("Item Type:").parent(typeDiv).style("display", "block");
  let typeSelect = createSelect()
    .parent(typeDiv)
    .style("width", "100%")
    .id("item-type-select");
  ["Consumables", "Materials", "Quest Items", "Miscellaneous"].forEach(type => typeSelect.option(type));
  createSpan("The category of the item.")
    .parent(typeDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let itemSelectDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Item:").parent(itemSelectDiv).style("display", "block");
  let itemSelect = createSelect()
    .parent(itemSelectDiv)
    .style("width", "100%")
    .id("item-select");
  createSpan("Select an item to edit or choose 'Add New' to create one.")
    .parent(itemSelectDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let nameDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Name:").parent(nameDiv).style("display", "block");
  let nameInput = createInput("")
    .parent(nameDiv)
    .style("width", "100%")
    .attribute("placeholder", "e.g., Healing Potion")
    .id("item-name-input");
  createSpan("The item’s unique identifier.")
    .parent(nameDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  let descDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Description:").parent(descDiv).style("display", "block");
  let descriptionInput = createElement("textarea")
    .parent(descDiv)
    .style("width", "100%")
    .style("height", "60px")
    .attribute("placeholder", "Describe the item...")
    .id("item-description-input");
  createSpan("What the item does or its lore.")
    .parent(descDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  // Populate the dropdown – preserve the previous selection value
  function updateItemOptions() {
    let selectedType = typeSelect.value();
    let prevValue = itemSelect.value();

    let filteredInventory = inventory.filter(item => item.category === selectedType);
    let filteredAvailable = (availableItems[selectedType] || []).filter(item =>
      !filteredInventory.some(i => i.name === item.name)
    );

    itemSelect.html("");
    itemSelect.option("Add New", -1);

    filteredInventory.forEach((item, idx) => {
      itemSelect.option(`[Inventory] ${item.name}`, idx);
    });
    filteredAvailable.forEach((item, idx) => {
      itemSelect.option(`[Available] ${item.name}`, filteredInventory.length + idx);
    });

    if (prevValue !== null && itemSelect.elt.querySelector(`option[value="${prevValue}"]`)) {
      itemSelect.value(prevValue);
    } else {
      itemSelect.value(-1);
    }
  }

  // Load from selected – if "Add New" is selected, keep current field values
  function loadItemData() {
    let idx = parseInt(itemSelect.value());
    let selectedType = typeSelect.value();

    let filteredInventory = inventory.filter(item => item.category === selectedType);
    let filteredAvailable = (availableItems[selectedType] || []).filter(item =>
      !filteredInventory.some(i => i.name === item.name)
    );

    if (idx === -1) {
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

    nameInput.value(item.name || "");
    descriptionInput.value(item.description || "");
  }

  // --- Event Listeners ---
  typeSelect.changed(() => {
    updateItemOptions();
    loop();
    redraw();
    noLoop();
    setTimeout(loadItemData, 0);
  });
  itemSelect.changed(loadItemData);

  // Initial values
  typeSelect.value("Consumables");
  updateItemOptions();

  // --- Button logic ---

  // Helper: Build item object from form
  function buildItemObject() {
    let selectedType = typeSelect.value();
    let newName = nameInput.value().trim();

    let existingItem = inventory.find(i => i.name === newName && i.category === selectedType);
    let preservedQuantity = existingItem ? (existingItem.quantity || 1) : 1;

    return {
      name: newName,
      description: descriptionInput.value(),
      category: selectedType,
      quantity: preservedQuantity,
    };
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

      let itemObj = buildItemObject();
      if (!itemObj.name) {
        errorMessage.html("Please provide a name for the item.");
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        return;
      }

      let idx = parseInt(itemSelect.value());
      let selectedType = typeSelect.value();

      let filteredInventory = inventory.filter(item => item.category === selectedType);
      let filteredAvailable = (availableItems[selectedType] || []).filter(item =>
        !filteredInventory.some(i => i.name === item.name)
      );

      if (idx >= filteredInventory.length && idx < filteredInventory.length + filteredAvailable.length) {
        let availIdx = idx - filteredInventory.length;
        if (availIdx >= 0 && availIdx < filteredAvailable.length) {
          let selectedItem = filteredAvailable[availIdx];
          if (inventory.some(i => i.name === itemObj.name && i.category === selectedType)) {
            errorMessage.html(`This item is already in your inventory. Use 'Save' to update it.`);
            errorMessage.style("display", "block");
            contentWrapper.elt.scrollTop = 0;
            return;
          }
          let masterIdx = availableItems[selectedType].findIndex(e => e.name === selectedItem.name);
          if (masterIdx !== -1) {
            availableItems[selectedType][masterIdx] = itemObj;
          } else {
            availableItems[selectedType].push(itemObj);
          }
          inventory.push(itemObj);
          console.log("Added to inventory and updated master list:", itemObj);
          localStorage.setItem('inventory', JSON.stringify(inventory));
          updateAvailableEquipment();
          updateEquipmentOptions();
          createInventoryUI();
          createEquipmentUI();
          successMessage.html("Item Added to Inventory");
          successMessage.style("display", "block");
          contentWrapper.elt.scrollTop = 0;
          // Try to select newly added item
          let newFilteredInventory = inventory.filter(item => item.category === selectedType);
          let newFilteredIdx = newFilteredInventory.findIndex(i => i.name === itemObj.name);
          if (newFilteredIdx !== -1) {
            itemSelect.value(newFilteredIdx.toString());
          }
        } else {
          errorMessage.html("Invalid item selection.");
          errorMessage.style("display", "block");
          contentWrapper.elt.scrollTop = 0;
        }
      } else if (idx === -1) {
        // Check for duplicates in both inventory and master list
        if (inventory.some(i => i.name === itemObj.name && i.category === selectedType)) {
          errorMessage.html(`An item with the name "${itemObj.name}" already exists in your inventory.`);
          errorMessage.style("display", "block");
          contentWrapper.elt.scrollTop = 0;
          return;
        }
        let duplicateInMaster = availableItems[selectedType]?.findIndex(e => e.name === itemObj.name);
        if (duplicateInMaster !== undefined && duplicateInMaster !== -1) {
          errorMessage.html(`An item with the name "${itemObj.name}" already exists in the master list.`);
          errorMessage.style("display", "block");
          contentWrapper.elt.scrollTop = 0;
          return;
        }
        inventory.push(itemObj);
        if (!availableItems[selectedType]) availableItems[selectedType] = [];
        availableItems[selectedType].push({ ...itemObj });
        console.log("Added new item to inventory and master list:", itemObj);
        localStorage.setItem('inventory', JSON.stringify(inventory));
        updateAvailableEquipment();
        updateEquipmentOptions();
        createInventoryUI();
        createEquipmentUI();
        successMessage.html("Item Added to Inventory");
        successMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        // Try to select newly added item
        let newFilteredInventory = inventory.filter(item => item.category === selectedType);
        let newFilteredIdx = newFilteredInventory.findIndex(i => i.name === itemObj.name);
        if (newFilteredIdx !== -1) {
          itemSelect.value(newFilteredIdx.toString());
        }
      } else {
        errorMessage.html("Please select an available item or 'Add New' to add.");
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
      }
    });

  // SAVE => Update master list and inventory
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

      let itemObj = buildItemObject();
      if (!itemObj.name) {
        errorMessage.html("Please provide a name for the item.");
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        return;
      }

      let idx = parseInt(itemSelect.value());
      let selectedType = typeSelect.value();

      let filteredInventory = inventory.filter(item => item.category === selectedType);
      let filteredAvailable = (availableItems[selectedType] || []).filter(item =>
        !filteredInventory.some(i => i.name === item.name)
      );

      let originalName = idx === -1 ? null : (idx < filteredInventory.length ? filteredInventory[idx].name : filteredAvailable[idx - filteredInventory.length].name);

      let duplicateIdx = (availableItems[selectedType] || []).findIndex(e => e.name === itemObj.name);
      if (duplicateIdx !== -1 && (originalName === null || originalName !== itemObj.name)) {
        errorMessage.html(`An item with the name "${itemObj.name}" already exists in the master list.`);
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        return;
      }

      // Update the master list
      if (idx === -1) {
        // "Add New" - Add to master list only
        if (!availableItems[selectedType]) availableItems[selectedType] = [];
        availableItems[selectedType].push(itemObj);
        console.log("Added new item to master list:", itemObj);
      } else {
        // Update existing item in master list
        let item;
        if (idx < filteredInventory.length) {
          item = filteredInventory[idx];
        } else {
          let availIdx = idx - filteredInventory.length;
          if (availIdx >= 0 && availIdx < filteredAvailable.length) {
            item = filteredAvailable[availIdx];
          } else {
            errorMessage.html("Invalid item selection.");
            errorMessage.style("display", "block");
            contentWrapper.elt.scrollTop = 0;
            return;
          }
        }
        let masterIdx = (availableItems[selectedType] || []).findIndex(e => e.name === item.name);
        if (masterIdx !== -1) {
          availableItems[selectedType][masterIdx] = itemObj;
        } else {
          if (!availableItems[selectedType]) availableItems[selectedType] = [];
          availableItems[selectedType].push(itemObj);
        }
        console.log("Updated item in master list:", itemObj);

        // Update existing items in inventory with the same name
        inventory.forEach((invItem, invIdx) => {
          if (invItem.name === originalName && invItem.category === selectedType) {
            inventory[invIdx] = { ...itemObj, quantity: invItem.quantity || 1 };
          }
        });
      }

      localStorage.setItem('inventory', JSON.stringify(inventory));
      updateAvailableEquipment();
      updateEquipmentOptions();
      createInventoryUI();
      createEquipmentUI();
      successMessage.html("Item Updated in Master List and Inventory");
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

      let idx = parseInt(itemSelect.value());
      if (idx === -1) {
        errorMessage.html("Please select an item to remove.");
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        return;
      }

      let selectedType = typeSelect.value();
      let filteredInventory = inventory.filter(item => item.category === selectedType);
      let filteredAvailable = (availableItems[selectedType] || []).filter(item =>
        !filteredInventory.some(i => i.name === item.name)
      );

      let item;
      let isInInventory = idx < filteredInventory.length;
      if (isInInventory) {
        // Item is in inventory
        item = filteredInventory[idx];
      } else {
        // Item is in availableItems[selectedType]
        let availableIdx = idx - filteredInventory.length;
        if (availableIdx >= 0 && availableIdx < filteredAvailable.length) {
          item = filteredAvailable[availableIdx];
        } else {
          errorMessage.html("Invalid item selected for removal.");
          errorMessage.style("display", "block");
          contentWrapper.elt.scrollTop = 0;
          return;
        }
      }

      showConfirmationModal(
        `Remove the item from the master list? "${item.name}"`,
        () => {
          // Remove from inventory if it exists there
          if (isInInventory) {
            inventory.splice(inventory.indexOf(item), 1);
          }

          // Remove from availableItems[selectedType]
          if (availableItems[selectedType]) {
            availableItems[selectedType] = availableItems[selectedType].filter(
              i => i.name !== item.name
            );
            console.log(`After removal, availableItems["${selectedType}"]:`, availableItems[selectedType]);
          }

          localStorage.setItem('inventory', JSON.stringify(inventory));
          updateAvailableEquipment();
          updateEquipmentOptions();
          createInventoryUI();
          createEquipmentUI();
          modalDiv.remove();
        }
      );
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
    if (getTotalStat(stat) < required) return false;
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
//Unlearn a weapon-specific ability
function unlearnAbility(category, ability) {
  if (learnedAbilities[category] && learnedAbilities[category].includes(ability.name)) {
    // Remove the ability from learnedAbilities
    learnedAbilities[category] = learnedAbilities[category].filter(name => name !== ability.name);
    // Refund the ability points
    abilityPoints += ability.pointCost;
    // Refresh the UI
    createAbilitiesUI();
  }
}
//Use Crystal Ability
function useCrystalAbility(abilityName) {
  const ability = existingAbilities["Crystals"].find(a => a.name === abilityName);
  if (!ability) {
    showConfirmationModal("Crystal ability not found.", () => {}, true);
    return;
  }

  if (!characterAbilities.includes(abilityName)) {
    showConfirmationModal("Cannot use this ability: Crystal not equipped.", () => {}, true);
    return;
  }

  let equippedCrystal = null;
  for (let slot in equippedItems) {
    let item = equippedItems[slot];
    if (item && item.equippedCrystals) {
      equippedCrystal = item.equippedCrystals.find(crystal =>
        crystal && crystal.abilities && crystal.abilities.includes(abilityName)
      );
      if (equippedCrystal) break;
    }
  }

  if (!equippedCrystal) {
    showConfirmationModal("Cannot use this ability: Crystal not equipped.", () => {}, true);
    return;
  }

  if (!meetsStatRequirements(equippedCrystal.statRequirements)) {
    showConfirmationModal("Cannot use this ability: Crystal stat requirements not met.", () => {}, true);
    return;
  }

  if (!meetsStatRequirements(ability.statReq)) {
    showConfirmationModal("Cannot use this ability: Ability stat requirements not met.", () => {}, true);
    return;
  }

  // Check ATG cost
  let atgCost = ability.ATGCost || 0;
  if (current_ATG < atgCost) {
    showConfirmationModal("Not enough ATG to use this ability.", () => {}, true);
    return;
  }

  // Check MP cost
  let mpCost = ability.effect.mpCost || 0;
  if (current_mp < mpCost) {
    showConfirmationModal("Not enough MP to use this ability.", () => {}, true);
    return;
  }

  // Deduct resources if applicable
  if (atgCost > 0) {
    current_ATG -= atgCost;
  }
  if (mpCost > 0) {
    current_mp -= mpCost;
  }

  const rollResult = rollDice(ability.effect.dice);
  showConfirmationModal(
    `${rollResult.display}\nEffect: ${ability.effect.description}\nATG Cost: ${atgCost}\nMP Cost: ${mpCost}`,
    () => {},
    true
  );
  redraw();
}

// Use a weapon-specific ability
function useAbility(ability, category) {
  let equippedCategory = getEquippedWeaponCategory();
  if (equippedCategory !== category) {
    showConfirmationModal("Cannot use this ability: Wrong weapon equipped.", () => {}, true);
    return;
  }
  if (current_ATG < ability.ATGCost) {
    showConfirmationModal("Not enough ATG to use this ability.", () => {}, true);
    return;
  }
  if (ability.ATGCost > 0) {
    current_ATG -= ability.ATGCost;
  }
  const rollResult = rollDice(ability.effect.dice);
  showConfirmationModal(
    `${rollResult.display}\nEffect: ${ability.effect.description}\nATG Cost: ${ability.ATGCost}`,
    () => {},
    true
  );
  redraw();
}
function createAbilitiesUI() {
  let abilitiesContainer = select("#abilities");
  if (!abilitiesContainer) {
    console.error("No #abilities div found in HTML!");
    return;
  }
  abilitiesContainer.html("");

  createElement("h2", "Abilities").parent(abilitiesContainer);
  createSpan("View and manage your abilities from Crystal and equipped weapons.")
    .parent(abilitiesContainer)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block")
    .style("margin-bottom", "10px");

  let buttonRow = createDiv().parent(abilitiesContainer).class("resource-row");
  createButton("Create Custom Ability")
    .parent(buttonRow)
    .class("resource-button")
    .mousePressed(showCreateCustomAbilityModal);
  createButton("Modify Abilities")
    .parent(buttonRow)
    .class("resource-button")
    .mousePressed(showModifyAbilitiesModal);
  createButton("Default Ability List")
    .parent(buttonRow)
    .class("resource-button")
    .mousePressed(() => {
      showConfirmationModal(
        "Are you sure you want to restore the default ability list? This will reset the master list and unlearn all abilities.",
        () => {
          console.log("Restoring default ability list");
          existingAbilities = JSON.parse(JSON.stringify(pristineAvailableAbilities));
          learnedAbilities = {};
          abilityPoints = 1;
          createAbilitiesUI();
        }
      );
    });

  weaponCategories.forEach(category => {
    let categoryDiv = createDiv().parent(abilitiesContainer).class("expandable-section").style("margin-bottom", "20px");
    let categoryHeader = createElement("h4", `${category}`)
      .parent(categoryDiv);

    let contentDiv = createDiv().parent(categoryDiv).class("content");

    categoryHeader.mousePressed(() => {
      let isExpanded = categoryHeader.hasClass("expanded");
      if (isExpanded) {
        categoryHeader.removeClass("expanded");
        contentDiv.removeClass("expanded");
      } else {
        categoryHeader.addClass("expanded");
        contentDiv.addClass("expanded");
      }
    });

    let abilities = existingAbilities[category] || [];
    if (abilities.length === 0) {
      createP(`No abilities defined for ${category}.`)
        .parent(contentDiv)
        .style("color", "#666");
    } else {
      let tableWrapper = createDiv().parent(contentDiv).class("table-wrapper");
      let table = createElement("table").parent(tableWrapper).class("rules-table");
      let header = createElement("tr").parent(table);
      createElement("th", "Name").parent(header).style("width", "15%");
      createElement("th", "ATG Cost").parent(header).style("width", "10%");
      createElement("th", "Stat Req").parent(header).style("width", "15%");
      createElement("th", "Point Cost").parent(header).style("width", "10%");
      createElement("th", "Effect").parent(header).style("width", "20%");
      createElement("th", "MP Cost").parent(header).style("width", "10%"); // New column
      createElement("th", "Status").parent(header).style("width", "10%");
      createElement("th", "Actions").parent(header).style("width", "10%");

      abilities.forEach(ability => {
        let row = createElement("tr").parent(table);
        let nameCell = createElement("td").parent(row);
        createSpan(ability.name)
          .parent(nameCell)
          .style("cursor", "pointer")
          .style("color", "#0000EE")
          .style("text-decoration", "underline")
          .mousePressed(() => showAbilityDescription(ability));
        createElement("td", String(ability.ATGCost)).parent(row);
        let statReqText = ability.statReq ? Object.entries(ability.statReq).map(([stat, val]) => `${val} ${stat}`).join(", ") : "-";
        createElement("td", statReqText).parent(row);
        createElement("td", category === "Crystals" ? "-" : String(ability.pointCost)).parent(row);
        let effectText = ability.effect.dice ? `${ability.effect.dice} - ${ability.effect.description}` : ability.effect.description;
        createElement("td", effectText).parent(row);
        // Add MP Cost column
        createElement("td", category === "Crystals" ? String(ability.effect.mpCost || 0) : "-").parent(row);
        let statusCell = createElement("td").parent(row);
        let actionCell = createElement("td").parent(row);

        if (category === "Crystals") {
          let isEquipped = characterAbilities.includes(ability.name);
          let meetsStats = true;
          let canUse = isEquipped && meetsStats;

          if (isEquipped) {
            statusCell.html("Equipped");
          } else {
            statusCell.html("Not Equipped");
          }

          let useButton = createButton("Use")
            .parent(actionCell)
            .class("resource-button small-button");
          setButtonDisabled(useButton, !canUse);
          useButton.mousePressed(() => {
            if (canUse) {
              useCrystalAbility(ability.name);
            } else {
              showConfirmationModal(
                "Cannot use this ability: Crystal not equipped or stat requirements not met.",
                () => {},
                true
              );
            }
          });
        } else {
          let isLearned = isAbilityLearned(category, ability.name);
          let reasons = [];
          let meetsStats = meetsStatRequirements(ability.statReq);
          let hasEnoughPoints = abilityPoints >= ability.pointCost;

          if (!meetsStats) reasons.push("Stats too low");
          if (!hasEnoughPoints) reasons.push("Not enough points");

          if (isLearned) {
            createSpan("Learned")
              .parent(statusCell)
              .style("cursor", "pointer")
              .style("color", "#0000EE")
              .style("text-decoration", "underline")
              .attribute("title", "Click to unlearn this ability")
              .mousePressed(() => {
                showConfirmationModal(
                  `Are you sure you want to unlearn "${ability.name}"?`,
                  () => {
                    unlearnAbility(category, ability);
                  }
                );
              });
          } else {
            statusCell.html(reasons.length > 0 ? reasons.join(", ") : "Not Learned");
          }

          if (isLearned) {
            let equippedCategory = getEquippedWeaponCategory();
            let canUse = equippedCategory === category;
            let useButton = createButton("Use")
              .parent(actionCell)
              .class("resource-button small-button");
            setButtonDisabled(useButton, !canUse);
            useButton.mousePressed(() => {
              if (canUse) {
                useAbility(ability, category);
              } else {
                showConfirmationModal("Cannot use this ability: Wrong weapon equipped.", () => {}, true);
              }
            });
          } else {
            let canLearn = meetsStats && hasEnoughPoints;
            let learnButton = createButton("Learn")
              .parent(actionCell)
              .class("resource-button small-button");
            setButtonDisabled(learnButton, !canLearn);
            learnButton.mousePressed(() => {
              learnAbility(category, ability);
            });
          }
        }
      });
    }
  });

  createP(`Available Ability Points: ${abilityPoints}`)
    .parent(abilitiesContainer)
    .style("margin-top", "10px");
}
function showAbilityDescription(ability) {
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
    .style("max-width", "400px")
    .style("word-wrap", "break-word");

  createElement("h3", ability.name).parent(modalDiv);

  // Description
  createP(`Description: ${ability.description || "No description provided."}`).parent(modalDiv);

  // ATG Cost
  createP(`ATG Cost: ${ability.ATGCost || 0}`).parent(modalDiv);

  // Stat Requirements
  let statReqText = ability.statReq ? Object.entries(ability.statReq).map(([stat, val]) => `${val} ${stat}`).join(", ") : "None";
  createP(`Stat Requirements: ${statReqText}`).parent(modalDiv);

  // Point Cost (for non-crystal abilities)
  let pointCostText = ability.pointCost ? ability.pointCost : "-";
  createP(`Point Cost: ${pointCostText}`).parent(modalDiv);

  // Effect Dice
  createP(`Effect Dice: ${ability.effect.dice || "-"}`).parent(modalDiv);

  // Effect Description
  createP(`Effect Description: ${ability.effect.description || "-"}`).parent(modalDiv);

  // MP Cost (for crystal abilities)
  let mpCostText = ability.effect.mpCost !== undefined ? ability.effect.mpCost : "-";
  createP(`MP Cost: ${mpCostText}`).parent(modalDiv);

  createButton("Close")
    .parent(modalDiv)
    .style("margin-top", "10px")
    .mousePressed(() => modalDiv.remove());
}

//Create Custom Ability
function showCreateCustomAbilityModal() {
  const appWrapper = select("#app-wrapper");
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv().parent(appWrapper);
  modalDiv.class("modal");

  const viewportHeight = window.innerHeight;
  const minTopOffset = 20;
  const maxHeightPercentage = 0.9;

  // Modal positioning
  modalDiv
    .style("top", `${minTopOffset}px`)
    .style("left", "50%")
    .style("transform", "translateX(-50%)")
    .style("background", "#fff")
    .style("padding", "20px")
    .style("border", "2px solid #000")
    .style("z-index", "1000")
    .style("width", "300px")  // match trait modal width
    .style("box-sizing", "border-box")
    .style("font-size", "14px");

  let contentWrapper = createDiv()
    .parent(modalDiv)
    .class("modal-content")
    .style("flex", "1 1 auto")
    .style("overflow-y", "auto")  // revert to auto to match trait modal
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

  createElement("h3", "Create Custom Ability").parent(contentWrapper);

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

  // Fields
  let nameDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Name:").parent(nameDiv).style("display", "block");
  let nameInput = createInput("")
    .parent(nameDiv)
    .style("width", "100%")
    .style("border", "1px solid #ccc")
    .style("box-sizing", "border-box")
    .attribute("placeholder", "e.g., Cleave")
    .id("ability-name-input");

  let descDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Description:").parent(descDiv).style("display", "block");
  let descriptionInput = createElement("textarea")
    .parent(descDiv)
    .style("width", "100%")
    .style("height", "60px")
    .style("border", "1px solid #ccc")
    .style("box-sizing", "border-box")
    .attribute("placeholder", "Describe the ability...")
    .id("ability-description-input");

  let categoryDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Weapon Category:").parent(categoryDiv).style("display", "block");
  let categorySelect = createSelect()
    .parent(categoryDiv)
    .style("width", "100%")
    .style("border", "1px solid #ccc")
    .style("box-sizing", "border-box")
    .id("ability-category-select");
  weaponCategories.forEach(category => categorySelect.option(category));

  let statReqDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Stat Requirements (e.g., STR 10):").parent(statReqDiv).style("display", "block");
  let statReqInputs = {};
  ["STR", "VIT", "DEX", "MAG", "WIL", "SPR", "LCK"].forEach(stat => {
    let statRow = createDiv().parent(statReqDiv).style("display", "flex").style("align-items", "center");
    createSpan(`${stat}:`).parent(statRow).style("width", "50px");
    statReqInputs[stat] = createInput("0", "number")
      .parent(statRow)
      .style("width", "50px")
      .style("border", "1px solid #ccc")
      .style("box-sizing", "border-box")
      .attribute("min", "0")
      .id(`stat-req-${stat}`);
  });

  let atgDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("ATG Cost:").parent(atgDiv).style("display", "block");
  let atgInput = createInput("0", "number")
    .parent(atgDiv)
    .style("width", "100%")
    .style("border", "1px solid #ccc")
    .style("box-sizing", "border-box")
    .attribute("min", "0")
    .id("ability-atg-input");

  let pointDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Ability Point Cost:").parent(pointDiv).style("display", "block");
  let pointInput = createInput("1", "number")
    .parent(pointDiv)
    .style("width", "100%")
    .style("border", "1px solid #ccc")
    .style("box-sizing", "border-box")
    .attribute("min", "1")
    .id("ability-point-input");

  let effectDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Effect Dice (e.g., 1d8):").parent(effectDiv).style("display", "block");
  let effectDiceInput = createInput("")
    .parent(effectDiv)
    .style("width", "100%")
    .style("border", "1px solid #ccc")
    .style("box-sizing", "border-box")
    .attribute("placeholder", "e.g., 1d8")
    .id("ability-effect-dice-input");

  let effectDescDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Effect Description:").parent(effectDescDiv).style("display", "block");
  let effectDescInput = createElement("textarea")
    .parent(effectDescDiv)
    .style("width", "100%")
    .style("height", "60px")
    .style("border", "1px solid #ccc")
    .style("box-sizing", "border-box")
    .attribute("placeholder", "e.g., Hits all enemies")
    .id("ability-effect-desc-input");

  // Add MP Cost Field
  let mpCostDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("MP Cost:").parent(mpCostDiv).style("display", "block");
  let mpCostInput = createInput("0", "number")
    .parent(mpCostDiv)
    .style("width", "100%")
    .style("border", "1px solid #ccc")
    .style("box-sizing", "border-box")
    .attribute("min", "0")
    .id("ability-mp-cost-input");
  createSpan("Mana Points required to use this ability.")
    .parent(mpCostDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

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

      let newAbility = {
        name: nameInput.value().trim(),
        description: descriptionInput.value().trim(),
        ATGCost: parseInt(atgInput.value()) || 0,
        statReq: {},
        pointCost: parseInt(pointInput.value()) || 1,
        effect: {
          dice: effectDiceInput.value().trim(),
          description: effectDescInput.value().trim(),
          mpCost: parseInt(mpCostInput.value()) || 0 // Include MP cost
        }
      };

      for (let stat in statReqInputs) {
        let value = parseInt(statReqInputs[stat].value()) || 0;
        if (value > 0) newAbility.statReq[stat] = value;
      }

      if (!newAbility.name) {
        errorMessage.html("Please provide a name for the ability.");
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        return;
      }

      let selectedCategory = categorySelect.value();
      if (!existingAbilities[selectedCategory]) existingAbilities[selectedCategory] = [];
      if (existingAbilities[selectedCategory].some(a => a.name === newAbility.name)) {
        errorMessage.html(`An ability with the name "${newAbility.name}" already exists in ${selectedCategory}.`);
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        return;
      }

      existingAbilities[selectedCategory].push(newAbility);
      createAbilitiesUI();
      successMessage.html("Ability Added");
      successMessage.style("display", "block");
      contentWrapper.elt.scrollTop = 0;
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
    .mousePressed(() => modalDiv.remove());
}
//Modify Abilities
function showModifyAbilitiesModal() {
  const appWrapper = select("#app-wrapper");
  if (modalDiv) modalDiv.remove();
  modalDiv = createDiv().parent(appWrapper);
  modalDiv.class("modal");

  const viewportHeight = window.innerHeight;
  const minTopOffset = 20;
  const maxHeightPercentage = 0.9;

  // Modal position
  modalDiv
    .style("top", `${minTopOffset}px`)
    .style("left", "50%")
    .style("transform", "translateX(-50%)")
    .style("background", "#fff")
    .style("padding", "20px")
    .style("border", "2px solid #000")
    .style("z-index", "1000")
    .style("width", "300px") // match Trait modal width
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

  createElement("h3", "Modify Abilities").parent(contentWrapper);

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

  // Fields
  let categoryDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Weapon Category:").parent(categoryDiv).style("display", "block");
  let categorySelect = createSelect()
    .parent(categoryDiv)
    .style("width", "100%")
    .id("ability-category-select");
  weaponCategories.forEach(category => categorySelect.option(category));

  let abilitySelectDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Ability:").parent(abilitySelectDiv).style("display", "block");
  let abilitySelect = createSelect()
    .parent(abilitySelectDiv)
    .style("width", "100%")
    .id("ability-select");

  let nameDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Name:").parent(nameDiv).style("display", "block");
  let nameInput = createInput("")
    .parent(nameDiv)
    .style("width", "100%")
    .attribute("placeholder", "e.g., Cleave")
    .id("ability-name-input");

  let descDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Description:").parent(descDiv).style("display", "block");
  let descriptionInput = createElement("textarea")
    .parent(descDiv)
    .style("width", "100%")
    .style("height", "60px")
    .attribute("placeholder", "Describe the ability...")
    .id("ability-description-input");

  let statReqDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Stat Requirements (e.g., STR 10):").parent(statReqDiv).style("display", "block");
  let statReqInputs = {};
  ["STR", "VIT", "DEX", "MAG", "WIL", "SPR", "LCK"].forEach(stat => {
    let statRow = createDiv().parent(statReqDiv).style("display", "flex").style("align-items", "center");
    createSpan(`${stat}:`).parent(statRow).style("width", "50px");
    statReqInputs[stat] = createInput("0", "number")
      .parent(statRow)
      .style("width", "50px")
      .attribute("min", "0")
      .id(`stat-req-${stat}`);
  });

  let atgDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("ATG Cost:").parent(atgDiv).style("display", "block");
  let atgInput = createInput("0", "number")
    .parent(atgDiv)
    .style("width", "100%")
    .attribute("min", "0")
    .id("ability-atg-input");

  let pointDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Ability Point Cost:").parent(pointDiv).style("display", "block");
  let pointInput = createInput("1", "number")
    .parent(pointDiv)
    .style("width", "100%")
    .attribute("min", "1")
    .id("ability-point-input");

  let effectDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Effect Dice (e.g., 1d8):").parent(effectDiv).style("display", "block");
  let effectDiceInput = createInput("")
    .parent(effectDiv)
    .style("width", "100%")
    .attribute("placeholder", "e.g., 1d8")
    .id("ability-effect-dice-input");

  let effectDescDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("Effect Description:").parent(effectDescDiv).style("display", "block");
  let effectDescInput = createElement("textarea")
    .parent(effectDescDiv)
    .style("width", "100%")
    .style("height", "60px")
    .attribute("placeholder", "e.g., Hits all enemies")
    .id("ability-effect-desc-input");

  // Add MP Cost Field
  let mpCostDiv = createDiv().parent(contentWrapper).style("margin-bottom", "10px");
  createSpan("MP Cost:").parent(mpCostDiv).style("display", "block");
  let mpCostInput = createInput("0", "number")
    .parent(mpCostDiv)
    .style("width", "100%")
    .attribute("min", "0")
    .id("ability-mp-cost-input");
  createSpan("Mana Points required to use this ability.")
    .parent(mpCostDiv)
    .style("font-size", "12px")
    .style("color", "#666")
    .style("display", "block");

  // Populate Ability Dropdown
  function updateAbilityOptions() {
    let selectedCategory = categorySelect.value();
    let prevValue = abilitySelect.value();

    abilitySelect.html("");
    abilitySelect.option("Select Ability", -1);

    let abilities = existingAbilities[selectedCategory] || [];
    abilities.forEach((ability, idx) => {
      abilitySelect.option(ability.name, idx);
    });

    if (prevValue !== null && abilitySelect.elt.querySelector(`option[value="${prevValue}"]`)) {
      abilitySelect.value(prevValue);
    } else {
      abilitySelect.value(-1);
    }
  }

  // Load Selected Ability Data
  function loadAbilityData() {
    let idx = parseInt(abilitySelect.value());
    if (idx === -1) {
      nameInput.value("");
      descriptionInput.value("");
      for (let stat in statReqInputs) statReqInputs[stat].value("0");
      atgInput.value("0");
      pointInput.value("1");
      effectDiceInput.value("");
      effectDescInput.value("");
      mpCostInput.value("0"); // Default MP cost
      return;
    }

    let selectedCategory = categorySelect.value();
    let ability = existingAbilities[selectedCategory][idx];
    nameInput.value(ability.name || "");
    descriptionInput.value(ability.description || "");
    for (let stat in statReqInputs) {
      statReqInputs[stat].value(ability.statReq && ability.statReq[stat] ? ability.statReq[stat] : "0");
    }
    atgInput.value(ability.ATGCost || 0);
    pointInput.value(ability.pointCost || 1);
    effectDiceInput.value(ability.effect.dice || "");
    effectDescInput.value(ability.effect.description || "");
    mpCostInput.value(ability.effect.mpCost || "0"); // Load MP cost
  }

  categorySelect.changed(() => {
    updateAbilityOptions();
    loadAbilityData();
  });
  abilitySelect.changed(loadAbilityData);

  // Initial values
  categorySelect.value("Melee - Heavy");
  updateAbilityOptions();

  // Save Button
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

      let idx = parseInt(abilitySelect.value());
      if (idx === -1) {
        errorMessage.html("Please select an ability to modify.");
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        return;
      }

      let selectedCategory = categorySelect.value();
      let originalName = existingAbilities[selectedCategory][idx].name;

      let updatedAbility = {
        name: nameInput.value().trim(),
        description: descriptionInput.value().trim(),
        ATGCost: parseInt(atgInput.value()) || 0,
        statReq: {},
        pointCost: parseInt(pointInput.value()) || 1,
        effect: {
          dice: effectDiceInput.value().trim(),
          description: effectDescInput.value().trim(),
          mpCost: parseInt(mpCostInput.value()) || 0 // Include MP cost
        }
      };

      for (let stat in statReqInputs) {
        let value = parseInt(statReqInputs[stat].value()) || 0;
        if (value > 0) updatedAbility.statReq[stat] = value;
      }

      if (!updatedAbility.name) {
        errorMessage.html("Please provide a name for the ability.");
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        return;
      }

      let duplicate = existingAbilities[selectedCategory].find(a => a.name === updatedAbility.name && a.name !== originalName);
      if (duplicate) {
        errorMessage.html(`An ability with the name "${updatedAbility.name}" already exists in ${selectedCategory}.`);
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        return;
      }

      // Update the ability
      existingAbilities[selectedCategory][idx] = updatedAbility;

      // Update learned abilities if the name changed
      if (learnedAbilities[selectedCategory] && learnedAbilities[selectedCategory].includes(originalName)) {
        let learnedIdx = learnedAbilities[selectedCategory].indexOf(originalName);
        learnedAbilities[selectedCategory][learnedIdx] = updatedAbility.name;
      }

      createAbilitiesUI();
      successMessage.html("Ability Updated");
      successMessage.style("display", "block");
      contentWrapper.elt.scrollTop = 0;
    });

  // Remove Button
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
      let idx = parseInt(abilitySelect.value());
      if (idx === -1) {
        errorMessage.html("Please select an ability to remove.");
        errorMessage.style("display", "block");
        contentWrapper.elt.scrollTop = 0;
        return;
      }

      let selectedCategory = categorySelect.value();
      let abilityName = existingAbilities[selectedCategory][idx].name;

      showConfirmationModal(
        `Are you sure you want to remove "${abilityName}" from the master list?`,
        () => {
          // Remove from learned abilities
          if (learnedAbilities[selectedCategory]) {
            learnedAbilities[selectedCategory] = learnedAbilities[selectedCategory].filter(name => name !== abilityName);
          }
          // Remove from existing abilities
          existingAbilities[selectedCategory].splice(idx, 1);
          createAbilitiesUI();
          modalDiv.remove();
        }
      );
    });

  // Close Button
  createButton("Close")
    .parent(buttonContainer)
    .style("margin", "5px")
    .style("padding", "5px 10px")
    .style("background-color", "#ccc")
    .style("color", "black")
    .style("border", "none")
    .style("border-radius", "3px")
    .style("cursor", "pointer")
    .mousePressed(() => modalDiv.remove());
}
//Dice Roller
function rollDice(diceStr, modifier = 0) {
  if (!diceStr || typeof diceStr !== "string") {
    return { total: 0, rolls: [], display: "No dice specified" };
  }

  const [numDice, sides] = diceStr.split("d").map(Number);
  if (isNaN(numDice) || isNaN(sides) || numDice <= 0 || sides <= 0) {
    return { total: 0, rolls: [], display: "Invalid dice format" };
  }

  const rolls = [];
  let total = 0;
  for (let i = 0; i < numDice; i++) {
    const roll = Math.floor(Math.random() * sides) + 1;
    rolls.push(roll);
    total += roll;
  }

  // Add the modifier to the total
  total += modifier;

  // Format the display string, including the modifier if it exists
  const modifierText = modifier !== 0 ? ` ${modifier > 0 ? "+" : ""}${modifier}` : "";
  const display = `Rolled ${diceStr}${modifierText}: [${rolls.join(", ")}]${modifierText} = ${total}`;
  return { total, rolls, display };
}
