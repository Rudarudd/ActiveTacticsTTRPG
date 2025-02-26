// Global resource variables

let max_hp = 100,
  current_hp = 100;

let max_mp = 50,
  current_mp = 50;

let max_stamina = 100,
  current_stamina = 100;

let max_atb = 100,
  current_atb = 0;

// UI elements for max value editing (lined up with stat bars)

let maxHpInput, setMaxHpButton, maxMpInput, setMaxMpButton;

let maxStaminaInput, setMaxStaminaButton, maxAtbInput, setMaxAtbButton;

// UI elements for actions

let amountInput, positiveButton, negativeButton;

let stmnPlus25Button, stmnMinus25Button, atbMinus50Button, resetButton;

// Global variable for modal pop-up

let modalDiv;

// Global variables for the Stamina X ATB link toggle

let staminaAtbLink = false;

let staminaAtbLinkButton;

function setup() {
  // Increase canvas width to accommodate max controls on right (but bars remain at original x)


  createCanvas(600, 200);
  textSize(16);
  textAlign(LEFT, TOP);

 

 

  // --- Max Value Editing UI (aligned with stat bars) ---

  // Single label for all max controls:

  createP("Max:").position(368, -10);

  // HP control (aligned with HP bar ~y=40)

  maxHpInput = createInput("100", "number").position(360, 30).size(50, 20);

  setMaxHpButton = createButton("Set")
    .position(420, 30)

    .size(50, 20)

    .mousePressed(setMaxHp);

  // MP control (aligned with MP bar ~y=70)

  maxMpInput = createInput("50", "number").position(360, 70).size(50, 20);

  setMaxMpButton = createButton("Set")
    .position(420, 70)

    .size(50, 20)

    .mousePressed(setMaxMp);

  // Stamina control (aligned with Stamina bar ~y=100)

  maxStaminaInput = createInput("100", "number")
    .position(360, 110)
    .size(50, 20);

  setMaxStaminaButton = createButton("Set")
    .position(420, 110)

    .size(50, 20)

    .mousePressed(setMaxStamina);

  // ATB control (aligned with ATB bar ~y=130)

  maxAtbInput = createInput("100", "number").position(360, 150).size(50, 20);

  setMaxAtbButton = createButton("Set")
    .position(420, 150)

    .size(50, 20)

    .mousePressed(setMaxAtb);

  // --- Action UI (positioned below the canvas) ---

  // Arrange: Negative button, then Amount input, then Positive button.

  negativeButton = createButton("–")
    .position(50, 220)

    .size(50, 20)

    .mousePressed(() => showModal("negative"));

  // Shift Amount input slightly left to be centered between the buttons

  amountInput = createInput().position(106, 220).size(50, 20);

  positiveButton = createButton("+")
    .position(170, 220)

    .size(50, 20)

    .mousePressed(() => showModal("positive"));

  // Quick Adjustments Label

  createP("Quick Adjustments:").position(50, 260);

  // Quick Adjust Buttons moved lower and enlarged for clarity.

  stmnPlus25Button = createButton("STMN +25")
    .position(50, 320)

    .size(90, 30)

    .mousePressed(() => {
      current_stamina = Math.min(current_stamina + 25, max_stamina);
    });

  stmnMinus25Button = createButton("STMN -25")
    .position(150, 320)

    .size(90, 30)

    .mousePressed(() => {
      current_stamina = Math.max(current_stamina - 25, 0);

      if (staminaAtbLink) {
        current_atb = Math.min(current_atb + 25, max_atb);
      }
    });

  atbMinus50Button = createButton("ATB -50")
    .position(250, 320)

    .size(90, 30)

    .mousePressed(() => {
      current_atb = Math.max(current_atb - 50, 0);
    });

  resetButton = createButton("Reset")
    .position(350, 320)

    .size(90, 30)

    .mousePressed(reset);

  // Stamina X ATB Link toggle button with description.

  staminaAtbLinkButton = createButton("Link: OFF")
    .position(450, 320)

    .size(90, 30)

    .mousePressed(toggleStaminaAtbLink);

  staminaAtbLinkButton.style("background-color", "red");

  createP("When ON, negative STMN adjustments add to ATB.")
    .position(450, 350)

    .style("font-size", "12px");




} 
function draw() {
  background(255);

  displayBars();
}

function displayBars() {
  let bar_width = 300,
    bar_height = 20;

  let x = 50; // Original x position for the stat bars

  let y_hp = 35,
    y_mp = 75,
    y_stamina = 115,
    y_atb = 155;

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

  text(`HP: ${current_hp}/${max_hp}`, x + bar_width / 2, y_hp + bar_height / 2);

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

  text(`MP: ${current_mp}/${max_mp}`, x + bar_width / 2, y_mp + bar_height / 2);

  // Stamina bar with a darker green

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

  text(
    `STMN: ${current_stamina}/${max_stamina}`,
    x + bar_width / 2,
    y_stamina + bar_height / 2
  );

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

  text(
    `ATB: ${current_atb}/${max_atb}`,
    x + bar_width / 2,
    y_atb + bar_height / 2
  );

  // Reset text style

  textAlign(LEFT, TOP);

  textStyle(NORMAL);

  // Title

  fill(0);

  text("FF7 TTRPG Resource Tracker", 50, 10);
}

// --- Functions to update max values ---

function setMaxHp() {
  let value = parseInt(maxHpInput.value());

  if (!isNaN(value) && value > 0) {
    max_hp = value;

    current_hp = value;
  }
}

function setMaxMp() {
  let value = parseInt(maxMpInput.value());

  if (!isNaN(value) && value > 0) {
    max_mp = value;

    current_mp = value;
  }
}

function setMaxStamina() {
  let value = parseInt(maxStaminaInput.value());

  if (!isNaN(value) && value > 0) {
    max_stamina = value;

    current_stamina = value;
  }
}

function setMaxAtb() {
  let value = parseInt(maxAtbInput.value());

  if (!isNaN(value) && value > 0) {
    max_atb = value;

    current_atb = value;
  }
}

// --- Modal Pop-Up for Resource Selection ---

function showModal(action) {
  let amount = parseInt(amountInput.value());

  if (isNaN(amount) || amount <= 0) return;

  // Remove any existing modal

  if (modalDiv) {
    modalDiv.remove();
  }

  // Create modal div (centered pop-up)

  modalDiv = createDiv();

  modalDiv.style("position", "absolute");

  modalDiv.style("top", "50%");

  modalDiv.style("left", "50%");

  modalDiv.style("transform", "translate(-50%, -50%)");

  modalDiv.style("background", "#fff");

  modalDiv.style("padding", "20px");

  modalDiv.style("border", "2px solid #000");

  modalDiv.style("z-index", "1000");

  // Modal title

  let title = createP("Select resource to update:");

  title.parent(modalDiv);

  // Create a button for each resource

  let resources = ["HP", "MP", "Stamina", "ATB"];

  resources.forEach((res) => {
    let btn = createButton(res);

    btn.parent(modalDiv);

    btn.style("margin", "5px");

    btn.mousePressed(() => {
      applyResourceChange(action, res.toLowerCase(), amount);

      modalDiv.remove();

      modalDiv = null;
    });
  });

  // Create Cancel button

  let cancelBtn = createButton("Cancel");

  cancelBtn.parent(modalDiv);

  cancelBtn.style("margin", "5px");

  cancelBtn.mousePressed(() => {
    modalDiv.remove();

    modalDiv = null;
  });
}

// --- Function to Apply the Resource Change ---

function applyResourceChange(action, resource, amount) {
  if (action === "positive") {
    if (resource === "hp") {
      current_hp = Math.min(current_hp + amount, max_hp);
    } else if (resource === "mp") {
      current_mp = Math.min(current_mp + amount, max_mp);
    } else if (resource === "stamina") {
      current_stamina = Math.min(current_stamina + amount, max_stamina);
    } else if (resource === "atb") {
      current_atb = Math.min(current_atb + amount, max_atb);
    }
  } else if (action === "negative") {
    if (resource === "hp") {
      current_hp = Math.max(current_hp - amount, 0);
    } else if (resource === "mp") {
      current_mp = Math.max(current_mp - amount, 0);
    } else if (resource === "stamina") {
      current_stamina = Math.max(current_stamina - amount, 0);

      if (staminaAtbLink) {
        current_atb = Math.min(current_atb + amount, max_atb);
      }
    } else if (resource === "atb") {
      current_atb = Math.max(current_atb - amount, 0);
    }
  }
}

// --- Toggle Button Function for Stamina X ATB Link ---

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
