"use strict";
const display = document.querySelector('#display-screen-text');
const buttons = document.querySelector("#calculator-body");
const flipBtns = document.querySelectorAll(".flip-btn");
const alertBar = document.getElementById("alert-bar");
let alertBarInput = document.querySelector("#alert-bar-input");
const degButtons = document.querySelectorAll(".deg-btn");
let check = 0;
let degMode = true;
let memory = 0;
const memoryRecallButton = document.getElementById("memoryRecall");
buttons.addEventListener("click", (e) => {
    let element = e.target;
    let data = element.dataset;
    if (data['flip']) {
        flipBtns.forEach((btn) => {
            btn.classList.toggle("hide-btn");
        });
    }
    else if (data['operator']) {
        if (checkPreviousElement(display.value)) {
            display.value += data['operator'];
        }
    }
    else if (data['result']) {
        let result = "";
        check = 0;
        if (display.value == "") {
            showAlert("Give Input");
        }
        else if (!checkParenthesis(display.value)) {
            showAlert("invalid input, check for parenthesis");
        }
        else {
            if (checkForScientificNotation(display.value)) {
                showAlert("It doesn't accept scientific notation");
            }
            else {
                result = evaluateExpression(display.value);
                if (isNaN(Number(result))) {
                    showAlert("invalid Input");
                }
                else {
                    display.value = result;
                }
            }
        }
    }
    else if (data['clear']) {
        display.value = "";
    }
    else if (data['backspace']) {
        display.value = removeLastElement(display.value);
    }
    else if (data['deg']) {
        degButtons.forEach((btn) => {
            btn.classList.toggle("hide-btn");
        });
        degMode = !degMode;
    }
    else if (data['memory']) {
        memorySetUp(data['memory']);
    }
    else if (data['fe']) {
        if (checkForNumber(display.value) && display.value != "") {
            display.value = Number(display.value).toExponential(5);
        }
        else {
            showAlert("invalid number");
        }
    }
    else if (data['minus']) {
        if (display.value.charAt(0) == "(" || !isNaN(Number(display.value.charAt(0)))) {
            display.value = "-" + display.value;
        }
        else if (display.value.charAt(0) == "-") {
            display.value = display.value.slice(1);
        }
    }
    else if (data['pi']) {
        console.log("pi");
        addMultiplication(display.value);
        appendInput(Math.PI.toString());
    }
    else if (data['e']) {
        addMultiplication(display.value);
        appendInput(Math.E.toString());
    }
    else if (data['unary']) {
        addMultiplication(display.value);
        appendInput(data['unary']);
    }
    else if (data['value']) {
        if (checkPreviousElement(display.value)) {
            appendInput(data['value']);
        }
    }
});
function appendInput(element) {
    display.value += element;
}
function checkPreviousElement(inputString) {
    let displayLength = inputString.length;
    let previousElement = inputString.charAt(displayLength - 1);
    if (previousElement.match(/[+|/|*|%|^]/) || previousElement == "") {
        showAlert("Not Valid");
        return false;
    }
    else {
        return true;
    }
}
function addMultiplication(inputString) {
    if ((!isNaN(Number(inputString.slice(-1))) || inputString.slice(-1) == ")") && inputString.slice(-1) != "") {
        display.value += "*";
    }
}
function checkForNumber(expression) {
    if (expression.match(/[a-z]/gi)) {
        return false;
    }
    return true;
}
function checkForScientificNotation(inputString) {
    if (inputString.includes("e+")) {
        return true;
    }
    else {
        return false;
    }
}
function checkParenthesis(expression) {
    const openParenthesis = expression.match(/\(/g);
    const closeParenthesis = expression.match(/\)/g);
    if (openParenthesis == null && closeParenthesis == null) {
        return true;
    }
    if (openParenthesis != null && closeParenthesis != null && openParenthesis.length === closeParenthesis.length) {
        return true;
    }
    else {
        return false;
    }
}
function removeLastElement(value) {
    return value.slice(0, value.length - 1);
}
function showAlert(text) {
    if (alertBarInput) {
        alertBarInput.value = text;
    }
    alertBar.style.display = "flex";
    setTimeout(() => {
        alertBar.style.display = "none";
    }, 3000);
}
function evaluateExpression(expression) {
    check++;
    if (check > 50) {
        showAlert("Something Wrong !");
        return "0";
    }
    if (checkForNumber(expression)) {
        return postfixEvaluation(expression);
    }
    else {
        return evaluateAdvanceFunction(expression);
    }
}
function postfixEvaluation(expression) {
    let arr = infixToPostFix(expression);
    let stack = [];
    let i = 0;
    let x, y;
    let temp = 0;
    for (i = 0; i < arr.length; i++) {
        if (arr[i] !== undefined) {
            if (!isNaN(Number(arr[i]))) {
                stack.push(arr[i]);
            }
            else {
                y = Number(stack.pop());
                x = Number(stack.pop());
                switch (arr[i]) {
                    case "+":
                        temp = x + y;
                        break;
                    case "-":
                        temp = x - y;
                        break;
                    case "*":
                        temp = x * y;
                        break;
                    case "/":
                        temp = x / y;
                        break;
                    case "^":
                        temp = x ** y;
                        break;
                    case "%":
                        temp = x % y;
                        break;
                    default:
                        showAlert("invalid operator");
                }
                stack.push(temp.toString());
            }
        }
    }
    let result = stack.pop();
    if (stack.pop()) {
        return "invalid input";
    }
    if (Math.trunc(Number(result)).toString().length >= 15) {
        return "Out Of Range";
    }
    return Number.isInteger(Number(result)) ? result : Number(result).toFixed(2);
}
function convertToArr(expression) {
    let output = [];
    let temp = "";
    let i = 0;
    while (i < expression.length) {
        if (expression[i] == "-") {
            if (expression[i + 1] == "-") {
                expression = expression.slice(0, i) + expression.slice(i + 2, expression.length);
            }
            else if (expression[i + 1] == "(") {
                let j = i + 1;
                let extractString = "(";
                const tempStack = [];
                tempStack.push("(");
                if (checkParenthesis(expression)) {
                    while (tempStack.includes("(")) {
                        if (expression[j + 1] == "(") {
                            tempStack.push("(");
                        }
                        else if (expression[j + 1] == ")") {
                            tempStack.pop();
                        }
                        extractString += expression[j + 1];
                        j++;
                    }
                }
                let solvedExtractString = evaluateExpression(extractString);
                expression = expression.substring(0, i + 1) + solvedExtractString + expression.substring(j + 1, expression.length);
                i = 0;
                output = [];
                temp = "";
            }
            else if ((i == 0 && expression[0] == "-") || (expression[i - 1] != ")" && isNaN(Number(expression[i - 1])))) {
                temp += expression[i];
                i++;
                while (!isNaN(Number(expression[i])) || expression[i] == ".") {
                    temp += expression[i];
                    i++;
                }
                output.push(temp);
                temp = "";
            }
            else {
                output.push(expression[i]);
                i++;
            }
        }
        else if (!isNaN(Number(expression[i])) || expression[i] == ".") {
            temp += expression[i];
            i++;
            while (!isNaN(Number(expression[i])) || expression[i] == ".") {
                temp += expression[i];
                i++;
            }
            output.push(temp);
            temp = "";
        }
        else {
            output.push(expression[i]);
            i++;
        }
    }
    return output;
}
function infixToPostFix(inputString) {
    inputString = "(" + inputString + ")";
    let expression = convertToArr(inputString);
    const stack = [];
    let output = [];
    for (let i in expression) {
        if (typeof expression[i] === "string") {
            if (!isNaN(Number(expression[i]))) {
                output.push(expression[i]);
            }
            else if (expression[i] == "(") {
                stack.push(expression[i]);
            }
            else if (expression[i] == ")") {
                while (stack.slice(-1)[0] != "(" && stack.length != 0 && stack.includes("(")) {
                    let lastElement = stack.pop();
                    if (typeof lastElement === "string") {
                        output.push(lastElement);
                    }
                }
                stack.pop();
            }
            else {
                while (getPrecedence(stack.slice(-1)[0]) >= getPrecedence(expression[i]) && stack.length != 0) {
                    let lastElement = stack.pop();
                    if (typeof lastElement === "string") {
                        output.push(lastElement);
                    }
                }
                stack.push(expression[i]);
            }
        }
    }
    return output;
}
function getPrecedence(char) {
    if (char == "*" || char == "/" || char == "%") {
        return 2;
    }
    else if (char == "+" || char == "-") {
        return 1;
    }
    else if (char == "^") {
        return 3;
    }
    else if (char == "(") {
        return 0;
    }
    else {
        return -1;
    }
}
function evaluateAdvanceFunction(expression) {
    const arrObject = {
        sqrt: function (num) {
            return Math.sqrt(num).toString();
        },
        mod: function (num) {
            return Math.abs(num).toString();
        },
        floor: function (num) {
            return Math.floor(num).toString();
        },
        ceil: function (num) {
            return Math.ceil(num).toString();
        },
        fact: function (num) {
            return factorial(num).toString();
        },
        log2: function (num) {
            return Math.log2(num).toFixed(2);
        },
        log: function (num) {
            return Math.log10(num).toFixed(2);
        },
        ln: function (num) {
            return Math.log(num).toFixed(2);
        },
        exp: function (num) {
            return Math.exp(num).toFixed(2);
        },
        sinInv: function (num) {
            return degMode ? Math.asin(num * Math.PI / 180).toFixed(2) : Math.asin(num).toFixed(2);
        },
        cosInv: function (num) {
            return degMode ? Math.acos(num * Math.PI / 180).toFixed(2) : Math.acos(num).toFixed(2);
        },
        tanInv: function (num) {
            return degMode ? Math.atan(num * Math.PI / 180).toFixed(2) : Math.atan(num).toFixed(2);
        },
        sin: function (num) {
            return degMode ? Math.sin(num * Math.PI / 180).toFixed(2) : Math.sin(num).toFixed(2);
        },
        cos: function (num) {
            return degMode ? Math.cos(num * Math.PI / 180).toFixed(2) : Math.cos(num).toFixed(2);
        },
        tan: function (num) {
            return degMode ? Math.tan(num * Math.PI / 180).toFixed(2) : Math.tan(num).toFixed(2);
        },
        cbrt: function (num) {
            return Math.cbrt(num).toString();
        }
    };
    for (let i in arrObject) {
        if (expression.includes(i)) {
            let regExp = new RegExp(`${i}\\(([\\d+*^%/\\-.\\s]+)\\)(?!\\))`, "gi");
            let functionArr = expression.match(regExp);
            try {
                if (functionArr !== null) {
                    let valueArr = getValues(functionArr);
                    for (let j in valueArr) {
                        if (!isNaN(Number(valueArr[j]))) {
                            expression = expression.replace(functionArr[j], arrObject[i](valueArr[j]));
                        }
                        else {
                            expression = expression.replace(functionArr[j], arrObject[i](Number(evaluateExpression(valueArr[j].toString()))));
                        }
                    }
                }
            }
            catch (error) {
                if (typeof error === "string") {
                    showAlert(error);
                }
            }
        }
    }
    if (expression.includes("NaN")) {
        showAlert("Invalid Input");
        return "Invalid Input";
    }
    else {
        return evaluateExpression(expression);
    }
}
function getValues(arr) {
    let startIndex = arr[0].indexOf("(");
    let endIndex;
    let NewArr = arr.map((element) => {
        endIndex = element.indexOf(")");
        return Number(element.slice(startIndex + 1, endIndex));
    });
    return NewArr;
}
function factorial(n) {
    if (n == 0 || n == 1) {
        return 1;
    }
    else {
        return n * factorial(n - 1);
    }
}
function memorySetUp(operation) {
    if (operation != "MR" && operation != "MC" && display.value == "") {
        showAlert("Give Input");
    }
    else {
        switch (operation) {
            case "M+":
                memory += Number(evaluateExpression(display.value));
                break;
            case "M-":
                memory -= Number(evaluateExpression(display.value));
                break;
            case "MR":
                display.value = memory.toString();
                break;
            case "MC":
                memory = 0;
                break;
            case "MS":
                memory = Number(evaluateExpression(display.value));
                break;
            default:
                showAlert("Invalid input at memory section");
                break;
        }
    }
    checkForMemory();
}
checkForMemory();
function checkForMemory() {
    if (memory === 0) {
        memoryRecallButton.setAttribute("disabled", "");
    }
    else {
        memoryRecallButton.removeAttribute("disabled");
    }
}
