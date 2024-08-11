// -------------------GLOBAL VARIABLES-----------------------------

let level = 4; // 4x4 table is a good start for year 7
let oldRow = { h: [], v: [], crossover: "" };
let pressedButton = { v: "", h: "" }; // to hold table buttons that are pressed
let products = []; // list of strings in form of "a * b"
let productValues = []; // list of strings with product "a*b"
let currentProduct = "";
let expression = "";
let timerHeight = 1; // starting timer height
let answerFlag = true;
let startFlag = true; // flag to show if game is running
let n = -9;
let timerLength = 4000; // timer length 4000 = 10 min
let originalTimer = 4000;
let popup = false


// initial state object for saving and loading game state
let state = {
  level: 4,
  timerHeight: 1,
  timerLength: 4000,
  products: []
};

// Define buttons with their corresponding input values
const buttons = {
  b7: "7",
  b8: "8",
  b9: "9",
  b4: "4",
  b5: "5",
  b6: "6",
  b3: "3",
  b2: "2",
  b1: "1",
  bdel: "del",
  b0: "0"
};

//-----------------GAME SETUP----------------------------------------

// Load state from local storage
loadState();

// Create keyboard buttons and draw them dynamically
for (const [_id, input] of Object.entries(buttons)) {
  drawButton(_id, input);
}

// Create the multiplication table dynamically
growTable();

// Create a mask to obscure all of the table elements text
changeTable(10);

// Add event listener on keydown and keyup
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);



//---------------HELPER FUNCTIONS-----------------------------


function element(id) {
  return document.getElementById(id)
}


// Recolor the table element
function _recolor(event, fill, color) {
  let x = element(event);
  if (!x) {
    return;
  }
  x = x.children[0];
  if (x && x.children[1] && x.children[3]) {
    x.children[1].setAttribute("fill", fill);
    x.children[3].setAttribute("fill", color);
    x.children[3].setAttribute("stroke", "black");
  } else {
    console.error(`Invalid element structure: ${event}`); // Debug statement
  }
}


// Create an SVG element
function createSVGElement(tag) {
  return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

// Set several attributes for an svg-element
// from an object containing attribute name and value
function setAttributes(element, attributes) {
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
}

//TODO
function chooseProduct() {
  currentProduct = [];
  let productText;
  let product;
  if (products.length > 2) {
    let index = Math.round(Math.random() * products.length);
    if (index % 2 > 0) index -= 1;
    productText = products[index];
    product = products[index + 1];
    products.splice(index, 2);
  } else {
    productText = products[0];
    product = products[1];
    products = [];
  }
  currentProduct = [productText, product];
}

function closePopup() {
  element("info-popup").style.display = "none"
}

// Button down animation
function buttonDown(id) {
  let color = "black";
  if (id === "bdel" || id.includes('h') || id.includes('v')) {
    color = "#621a10";
  }

  let svg = element(id).children[0];
  let shadow = svg.children[0];
  let base = svg.children[1];
  let front = svg.children[2];
  let text = svg.children[3];
  if (id === "benter") {
    setAttributes(shadow, {
      fill: "transparent"
    });
    setAttributes(base, {
      transform: "translate(-2 , 2)"
    });
    setAttributes(front, {
      transform: "translate(-3 , 2) scale(1.01, 1.02)"
    });
    setAttributes(text, {
      transform: "translate(-2 , 2)"
    });
    return 0;
  }
  if (id === "bstart") {
    setAttributes(shadow, {
      fill: "transparent"
    });
    setAttributes(base, {
      transform: "translate(-2 , 2)"
    });
    setAttributes(front, {
      transform: "translate(-3 , 2) scale(1.01, 1.02)"
    });
    setAttributes(text, {
      transform: "translate(-2 , 2) rotate(90) scale(1, 2)"
    });
    return 0;
  }
  setAttributes(base, {
    x: "0%",
    y: "7%",
    width: "93%",
    height: "90%",
    fill: color
  });
  setAttributes(shadow, {
    fill: "transparent"
  });
  setAttributes(front, {
    x: "1%",
    y: "7%",
    width: "90%",
    height: "88%"
  });
  setAttributes(text, {
    x: "48%",
    y: "65%"
  });
}

// Button up animation
function buttonUp(id) {
  let color = "black";
  if (id === "bdel") {
    color = "#621a10";
  }
  let svg = element(id).children[0];
  let shadow = svg.children[0];
  let base = svg.children[1];
  let front = svg.children[2];
  let text = svg.children[3];
  if (id === "benter") {
    setAttributes(shadow, {
      fill: "#00000037"
    });
    setAttributes(base, {
      transform: ""
    });
    setAttributes(front, {
      transform: ""
    });
    setAttributes(text, {
      transform: ""
    });
    return 0;
  }
  if (id === "bstart") {
    setAttributes(shadow, {
      fill: "#00000037"
    });

    setAttributes(front, {
      transform: ""
    });
    setAttributes(text, {
      transform: "rotate(90) scale(1, 2)"
    });
    if (!startFlag) {
      text.innerHTML = "Stop";
      setAttributes(base, {
        transform: "",
        fill: "#621a10"
      });
    } else {
      text.innerHTML = "Start";
      setAttributes(base, {
        transform: "",
        fill: "darkgreen"
      });
    }
    return 0;
  }
  setAttributes(base, {
    x: "4%",
    y: "4%",
    width: "92%",
    height: "92%",
    fill: color
  });
  setAttributes(shadow, {
    fill: "#00000037"
  });
  setAttributes(front, {
    x: "8%",
    y: "4%",
    width: "86%",
    height: "86%"
  });
  setAttributes(text, {
    x: "50%",
    y: "62%"
  });
}

// Draw buttons with SVG
function drawButton(id, input) {
  //Base values
  let label = input;
  let size = "9vh";
  let fontSize = "2em";
  let color = "silver";
  let fill = "url(#TableNormal)";
  if (id[0] === "b") {
    // modifications for keyboard buttons
    size = "19vh";
    fontSize = "3em";
    color = "black";
    fill = "url(#Bob)";
  }
  if (id[0] === "h" || id[0] === "v") {
    // modifications for table buttons
    color = "black";
    fill = "url(#Bob)";
  }
  let svg = createSVGElement("svg");
  let shadow = createSVGElement("rect");
  let base = createSVGElement("rect");
  let front = createSVGElement("rect");
  let text = createSVGElement("text");
  let mask = createSVGElement("rect");
  let node = document.createTextNode(label);
  text.appendChild(node);
  setAttributes(svg, {
    width: "100%",
    height: size
  });
  setAttributes(shadow, {
    rx: "5%",
    ry: "5%",
    x: "0%",
    y: "6%",
    width: "94%",
    height: "94%",
    fill: "#00000037"
  });
  setAttributes(base, {
    rx: "5%",
    ry: "5%",
    x: "4%",
    y: "4%",
    width: "92%",
    height: "92%",
    fill: color
  });
  setAttributes(front, {
    rx: "5%",
    ry: "5%",
    x: "8%",
    y: "4%",
    width: "86%",
    height: "86%",
    fill: fill
  });
  setAttributes(text, {
    x: "50%",
    y: "62%",
    fill: "white",
    stroke: "black",
    "text-anchor": "middle",
    "font-size": fontSize
  });
  setAttributes(mask, {
    rx: "5%",
    ry: "5%",
    x: "8%",
    y: "4%",
    width: "86%",
    height: "86%",
    fill: "transparent"
  });
  if (id == "bdel") base.setAttribute("fill", "#621a10");
  svg.appendChild(shadow);
  svg.appendChild(base);
  svg.appendChild(front);
  svg.appendChild(text);
  svg.appendChild(mask);
  element(id).appendChild(svg);
}


// -----------------MAIN FUNCTIONS-------------------------------



// Save the game state to local storage 
function saveState() {
  state.level = level;
  state.timerHeight = timerHeight;
  state.timerLength = timerLength;
  state.products = products;
  localStorage.setItem('klingberg', JSON.stringify(state));
}

// Remove the game state from local storage
function clearMemory() {
  localStorage.removeItem('klingberg');
  state = {
    level: 4,
    timerHeight: 1,
    timerLength: 4000,
    products: []
  };
  loadState();
}

// Load the saved game state or initialize a default state
function readState() {
  const state = JSON.parse(localStorage.getItem('klingberg')) || {};
  return {
    level: state.level || 4,
    timerHeight: state.timerHeight || 1,
    timerLength: state.timerLength || 4000,
    products: state.products || []
  };
}

// Assign state values to global variables
function loadState() {
  state = readState();
  level = state.level;
  timerHeight = state.timerHeight;
  timerLength = state.timerLength;
  products = state.products;
}

function handleKeyDown(event) {
  const keyMapping = {
    48: "b0",
    49: "b1",
    50: "b2",
    51: "b3",
    52: "b4",
    53: "b5",
    54: "b6",
    55: "b7",
    56: "b8",
    57: "b9",
    8: "bdel",
    13: "benter",
    32: "bstart",
    67: "c",
    76: "l",
    84: "t",
    73: "i",
  };
  const id = keyMapping[event.keyCode];
  if (id) {
    if (!"clti".includes(id)) buttonDown(id);
    if (id === "benter") check(true, id);
    if (id === "bdel") del(true, id);
    if (id === "bstart") start(true, id);
    if ((id === "c" || id === "l" || id === "t" || id === "i") && startFlag) enter(false, id);
    else if (id !== "benter" && id !== "bdel") enter(true, event.key);
  }
}

function handleKeyUp(event) {
  const keyMapping = {
    48: "b0",
    49: "b1",
    50: "b2",
    51: "b3",
    52: "b4",
    53: "b5",
    54: "b6",
    55: "b7",
    56: "b8",
    57: "b9",
    8: "bdel",
    13: "benter",
  };

  const id = keyMapping[event.keyCode];
  if (id) {
    buttonUp(id);
  }
}


// Generate an array of alternating "a * b", a*b
function generateProducts() {
  let a = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  let b = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  for (let x of a) {
    for (let y of b) {
      let text = x + " • " + y;
      let alt = y + " • " + x;
      let product = x * y;
      if (!products.includes(text) && !products.includes(alt)) {
        products.push(text);
        products.push(product);
      }
    }
  }
}


// Function to create the multiplication table dynamically

function growTable() {
  n = -9
  let rows = [
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten"
  ];

  for (let row of rows) {
    element(row).innerHTML = "";
  }
  oldRow = { h: [], v: [], crossover: "" }

  for (let i = 0; i < 10; i++) {
    let row = element(rows[i]);
    n = n + 10;
    let x = 0;
    for (let e = 0; e < 10; e++) {
      if (e == 0 || i == 0) {
        // Create table buttons with ids v## for column buttons
        // and ids h## for row buttons
        let input = (e + 1) * (i + 1);
        let div = document.createElement("div");
        let y = n + x;
        let _id = "h" + y;
        if (i == 0) _id = "v" + (y - 1);
        div.setAttribute("id", _id);
        div.setAttribute("class", "table-button");
        if (input != 1)
          div.onclick = () => {
            tableRow(_id);
          };
        row.appendChild(div);
        drawButton(_id, input);
      } else {
        // Create tha table body
        let input = (e + 1) * (i + 1);
        let div = document.createElement("div");
        let y = n + x;
        let _id = `${e}${i}`;
        div.setAttribute("id", _id);
        row.appendChild(div);
        drawButton(_id, input);
      }
      x += 1;
    }
  }
}

function tableRow(id) {
  if (startFlag) return 0;
  let i = id[1];
  let c = id[0];
  if (pressedButton[c]) buttonUp(pressedButton[c]);
  buttonDown(id);
  oldRow[c].forEach((e) => {
    _recolor(e, "silver", "white");
  });
  if (oldRow["crossover"]) _recolor(oldRow["crossover"], "goldenrod", "darkred");
  oldRow[c] = [];
  oldRow["crossover"] = ""
  if (pressedButton[c] === id) {
    buttonUp(id);
    return 0;
  }
  pressedButton[c] = id;
  modifier = id.includes("h")
    ? `[id$='${i}']:not([id^='v']):not([id^='h']):not([id^='b'])`
    : `[id^='${i}']`;
  const x = document.querySelectorAll(modifier);
  x.forEach((e) => {
    _recolor(e.id, "goldenrod", "darkred");
    oldRow[c].push(e.id);
  });
  const intersection = oldRow["v"].filter((element) =>
    oldRow["h"].includes(element)
  );
  oldRow["crossover"] = intersection[0];
  if (oldRow["crossover"]) _recolor(oldRow["crossover"], "gold", "red");
}

// Handle number input
function enter(flag, event) {
  if (flag) {
    buttonDown("b" + event);
    setTimeout(() => {
      buttonUp("b" + event);
    }, 250);
  }
  if (expression.length > 2) {
    return 0;
  }
  let digit = event;
  expression += digit;
  element("result").innerHTML += digit;
}

// Handle delete input
function del(flag, event) {
  if (flag) {
    buttonDown(event);
    setTimeout(() => {
      buttonUp(event);
    }, 250);
  }
  let oldString = element("result").innerHTML;
  let newString = oldString.slice(0, -1);
  element("result").innerHTML = newString;
  expression = newString;
}

// Handle check input
function check(flag, event) {
  console.log(expression)
  if (flag) {
    buttonDown(event);
    setTimeout(() => {
      buttonUp(event);
    }, 500);
  }
  if (popup) {
    element("info-popup").style.display = "none"
    popup = false
    return
  }
  let answerField = element("answer-field");
  let questionField = element("question-field");
  if (startFlag && !(element("result").innerHTML.includes("c") || element("result").innerHTML.includes("l") || element("result").innerHTML.includes("t") || element("result").innerHTML.includes("i"))) {
    element("result").innerHTML = ""
    expression = ""
    return
  };
  if (element("result").innerHTML === "") return
  if (expression.includes("c")) {
    // clear local storage and initiate new state
    clearMemory();
    level = 4;
    timerHeight = 1;
    timerLength = 4050;
    products = [];
    generateProducts();
    currentProduct = [];
    saveState();
    expression = "";
    element("result").innerHTML = "";
    return 0;
  }
  if (expression.includes("t")) {
    // change the length of timer 5, 10, 15 or 20 min
    if (expression == "t5") {
      timerLength = 2000;
    } else if (expression == "t10") {
      timerLength = 4000;
    } else if (expression == "t15") {
      timerLength = 6000;
    } else if (expression == "t20") {
      timerLength = 8000;
    } else {
      expression = "";
      element("result").innerHTML = "";
      return 0;
    }
    originalTimer = timerLength;
    expression = "";
    element("result").innerHTML = "";
    timerHeight = 1;
    products = [];
    generateProducts();
    return 0;
  }
  if (expression.includes("l")) {
    // change the game level
    //COME BACK TO
    let newLevel = expression.substring(1, expression.length);
    if (newLevel.includes("l") || newLevel.includes("t") || newLevel.includes("c")) {
      expression = "";
      element("result").innerHTML = "";
      return 0;
    }
    if (newLevel != 0) {
      if (newLevel < 11) timerLength = originalTimer
      level = newLevel;
    } else {
      level = 1;
    }
    expression = "";
    element("result").innerHTML = "";
    timerHeight = 1;
    products = [];
    generateProducts();
    return 0;
  }
  if (expression.includes("i")) {
    startFlag = false
    start(startFlag, "bstart");
    element("info-popup").style.display = "flex"
    popup = true
    expression = "";
    element("result").innerHTML = "";
    return
  }


  // Show if answer is correct or not
  if (expression == currentProduct[1]) {
    setAttributes(answerField, {
      fill: "green"
    });
    setAttributes(questionField, {
      fill: "green"
    });
    setTimeout(() => {
      setAttributes(answerField, {
        fill: "cyan"
      });
      setAttributes(questionField, {
        fill: "cyan"
      });
    }, 150);
    if (products.length < 3) {
      level++;
      generateProducts();
      element("level").innerHTML = level;
      start(true, "bstart");
    }
    chooseProduct();
    if (level > 10) {
      if (timerHeight > 10) {
        timerHeight -= 10;
      } else {
        timerHeight = 0;
      }
    }
    moveProductBar();
    expression = "";
    element("result").innerHTML = expression;
    element("expression").innerHTML = currentProduct[0];
  } else {
    setAttributes(answerField, {
      fill: "red"
    });
    setAttributes(questionField, {
      fill: "red"
    });
    setTimeout(() => {
      setAttributes(answerField, {
        fill: "cyan"
      });
      setAttributes(questionField, {
        fill: "cyan"
      });
    }, 150);
    element("result").innerHTML = "";
    if (answerFlag) {
      answerFlag = !answerFlag;
      return 0;
    } else {
      // If answer is incorrect add an extra question
      products.push(currentProduct[0]);
      products.push(currentProduct[1]);
      products.push(currentProduct[0]);
      products.push(currentProduct[1]);
      if (products.length > 100) {
        if (level > 1) {
          level -= 1;
        } else {
          level = 1;
        }
        products = [];
        generateProducts();
        start(true, "bstart");
        return 0;
      }
      chooseProduct();
      moveProductBar();
      expression = "";
      element("result").innerHTML = expression;
      element("expression").innerHTML = currentProduct[0];
    }
  }
}

// Handle start button click
function start(flag, event) {
  if (flag) {
    buttonDown(event);
    setTimeout(() => {
      buttonUp(event);
    }, 250);
  }
  if (startFlag) {
    element("result").innerHTML = ""
    expression = ""
    readState()
    growTable()
    if (level <= 10) {
      changeTable(level)
    } else {
      changeTable(10);
      timerLength = 800/(level-10)
      console.log("2", timerLength)
    }
    if (products.length == 0) generateProducts();
    chooseProduct();
    answerFlag = true;
    moveProductBar();
    element("expression").innerHTML = currentProduct[0];
    element("level").innerHTML = level;
    timerMove();
  } else {
    try {
      clearInterval(newTimer);
    } catch (e) { console.log(e) }
    n = -9;
    growTable();
    changeTable(10)
    element("expression").innerHTML = "";
    if (currentProduct[0]) products.push(currentProduct[0]);
    if (currentProduct[1]) products.push(currentProduct[1]);
    currentProduct = [];
    state.products = products;
    state.level = level;
    state.timerHeight = timerHeight;
    state.timerLength = timerLength;
    saveState();
  }
  startFlag = !startFlag;
}

// Function to partially obscure table
function changeTable(max) {
  for (let i = 1; i < max; i++) {
    for (let e = 1; e < max; e++) {
      let _id = `${i}${e}`
      let svg = element(_id).children[0];
      let mask = svg.children[4];
      setAttributes(mask, {
        fill: "url(#Mask)"
      });
    }
  }
}

function moveProductBar() {
  let base = element("productsBarFill");
  let shadow = element("productsBarShadow");
  setAttributes(base, {
    X: "58%",
    y: "4%",
    width: "30%",
    height: String(75 - (75 * products.length) / 100) + "%"
  });
  setAttributes(shadow, {
    X: "58%",
    y: "4%",
    width: "30%",
    height: String(75 - (75 * products.length) / 100) + "%"
  });
}

function timerMove() {
  let base = element("timerBarFill");
  let shadow = element("timerBarShadow");
  newTimer = setInterval(() => {
    setAttributes(base, {
      X: "58%",
      y: "4%",
      width: "30%",
      height: String(75 - timerHeight) + "%"
    });
    setAttributes(shadow, {
      X: "58%",
      y: "4%",
      width: "30%",
      height: String(75 - timerHeight) + "%"
    });
    timerHeight += 0.5;
    if (level < 11) {
      if (timerHeight > 75) {
        timerHeight = 1;
        start(true, "bstart");
      }
    } else {
      if (timerHeight > 75) {
        level = level === 11 ? 11 : level -= 1;
        timerHeight = 1;
        start(true, "bstart");
      }
    }
  }, timerLength);
}


var tooltip = document.querySelectorAll('.tooltip');

document.addEventListener('mousemove', fn, false);

function fn(e) {
  for (var i = tooltip.length; i--;) {
    tooltip[i].style.left = e.pageX + 20 + 'px';
    tooltip[i].style.top = e.pageY + 'px';
  }
}

function readTimer() {
  let timeRemaining = (150 - timerHeight) * timerLength / 60000
  let minRemaining = Math.floor(timeRemaining)
  let secRemaining = Math.round((timeRemaining - minRemaining) * 60)
  element("timertip").innerHTML = `${minRemaining}min och ${secRemaining}sec kvar!`
}

function readProducts() {
  element("producttip").innerHTML = `${products.length / 2} multiplikationer<br> kvar till nästa nivå!`
}