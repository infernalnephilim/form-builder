function idbOK() {
  return "indexedDB" in window &&
    !/iPad|iPhone|iPod/.test(navigator.platform);
}
if (!idbOK) {
  window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}
const dbName = "questionList";

var request = indexedDB.open(dbName, 2);

request.onerror = function (event) {
  console.log("onerror!");
  console.dir(event);
};
request.onupgradeneeded = function (event) {
  var db = event.target.result;

  var objectStore = db.createObjectStore("questions", {keyPath: "ssn"});

  objectStore.createIndex("id", "id", {unique: true});

  objectStore.createIndex("conditionAnswer", "conditionAnswer", {unique: false});
  objectStore.createIndex("condition", "condition", {unique: false});
  objectStore.createIndex("question", "question", {unique: false});
  objectStore.createIndex("type", "type", {unique: false});
  objectStore.createIndex("condition", "condition", {unique: false});
  objectStore.createIndex("subquestions", "subquestions", {unique: false});

  objectStore.transaction.oncomplete = function (event) {
    var customerObjectStore = db.transaction("customers", "readwrite").objectStore("customers");
    customerData.forEach(function (customer) {
      customerObjectStore.add(customer);
    });
  };
};

var questionList = [];

var questionID = 1;

var form = document.getElementById("form-builder");
var addInputButton = document.getElementById("add-input");

const dataContainer = document.getElementsByClassName('result')[0];

function newSubQuestion(id, condition, conditionAnswer, questionText, type) {
  var question = {
    "id": "q" + id,
    "condition": condition,
    "conditionAnswer": conditionAnswer,
    "question": questionText,
    "type": type,
    "subquestions": []
  };
  questionID++;
  return question;
}

function createFormElement(object, level) {
  var defaultQuestion = document.createElement("div");
  defaultQuestion.setAttribute("id", object.id);
  defaultQuestion.classList.add("question-wrapper-div");
  defaultQuestion.style.marginLeft = (level - 1) * 20 + "px";

  var content = "<ul class=\"question-wrapper\">";
  if (object.condition != "") {
    content += "<li class=\"form-row\">\n" +
      "          <label class=\"item\">Condition</label>\n" +
      "          <select class=\"condition-type item flex-1\">\n" +
      "            <option>\n" +
      "              Equals\n" +
      "            </option>\n";
    if (object.type == "Number") {
      content +=
        "            <option>\n" +
        "              Greater than\n" +
        "            </option>\n" +
        "            <option>\n" +
        "              Less Than\n" +
        "            </option>\n";
    }
    content +=
      "          </select>\n";
    if (object.type == "Text" || object.type == "Number") {
      content += "<input class=\"condition-text flex-1\" type=\"text\" value='" + object.conditionAnswer + "'/>\n";
    } else {
      content += "          <select class=\"condition-yesno item flex-1\">\n" +
        "            <option selected>\n" +
        "              Yes\n" +
        "            </option>\n" +
        "            <option>\n" +
        "              No\n" +
        "            </option>\n" +
        "          </select>\n";
    }
    content += "        </li>";
  }
  content += "<li class=\"form-row\">\n" +
    "          <label class=\"item\">Question</label>\n" +
    "          <input class=\"question-input text item\" name=\"question[]\" value='" + object.question + "'/>\n" +
    "        </li>\n" +
    "        <li class=\"form-row\">\n" +
    "          <label class=\"item\">Type</label>\n" +
    "          <select class=\"select-type item\">\n";
  if (object.type == "Yes/No") {
    content += "<option selected>\n" +
      "              Yes/No\n" +
      "            </option>\n" +
      "            <option>\n" +
      "              Text\n" +
      "            </option>\n" +
      "            <option>\n" +
      "              Number\n" +
      "            </option>\n";
  } else if (object.type == "Text") {
    content += "<option>\n" +
      "              Yes/No\n" +
      "            </option>\n" +
      "            <option selected>\n" +
      "              Text\n" +
      "            </option>\n" +
      "            <option>\n" +
      "              Number\n" +
      "            </option>\n";
  } else if (object.type == "Number") {
    content += "<option>\n" +
      "              Yes/No\n" +
      "            </option>\n" +
      "            <option>\n" +
      "              Text\n" +
      "            </option>\n" +
      "            <option selected>\n" +
      "              Number\n" +
      "            </option>\n";
  }
  content += "</select>\n" +
    "        </li>\n" +
    "        <li class=\"form-row\">\n" +
    "          <button class=\"add-sub-input\">Add Sub-Input</button>\n" +
    "          <button class=\"delete-input\">Delete</button>\n" +
    "        </li>" +
    "        </ul>";

  defaultQuestion.innerHTML = content;
  defaultQuestion.getElementsByClassName("add-sub-input")[0].addEventListener("click", (event) => {
    let button = defaultQuestion.getElementsByClassName("add-sub-input")[0].parentNode.parentNode.parentNode;
    event.preventDefault();
    let condition = "Equals";
    let conditionText = "";
    if (object.type == "Yes/No") {
      conditionText = "Yes";
    }

    var newSubQ = newSubQuestion(questionID, condition, conditionText, "", object.type);
    object.subquestions.push(newSubQ);
    form.insertBefore(createFormElement(newSubQ, level + 1), button.nextSibling);

    dataContainer.textContent = JSON.stringify(questionList, null, "  ");

  });
  defaultQuestion.getElementsByClassName("delete-input")[0].addEventListener("click", (event) => {
    event.preventDefault();

    removeFormRows(object);
    questionList = removeNode(questionList, object.id, level);

    dataContainer.textContent = JSON.stringify(questionList, null, "  ");

  });
  var inputs = defaultQuestion.getElementsByTagName("input");
  if (inputs.length > 0) {
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('change', () => {
        let inputParentID = inputs[i].parentNode.parentNode.parentNode.id;
        changeData(questionList, inputs[i], inputParentID);
      }, false);

    }
  }

  var selects = defaultQuestion.getElementsByTagName("select");
  if (selects.length > 0) {
    for (let i = 0; i < selects.length; i++) {
      selects[i].addEventListener('change', () => {
        let inputParentID = selects[i].parentNode.parentNode.parentNode.id;
        changeData(questionList, selects[i], inputParentID);
      });
    }
  }
  return defaultQuestion;
}

function removeFormRows(object) {
  if (object.subquestions.length > 0) {
    for (let i = 0; i < object.subquestions.length; i++) {
      removeFormRows(object.subquestions[i]);
      dataContainer.textContent = JSON.stringify(questionList, null, "  ");
    }
    object.subquestions = [];
  }
  document.getElementById(object.id).remove();
}

function removeNode(array, id, level) {
  return array.filter(function (item) {
    if (item.subquestions.length > 0) item.subquestions = removeNode(item.subquestions, id, level);
    dataContainer.textContent = JSON.stringify(questionList, null, "  ");
    return item.id !== id;
  });
}

function parseTree(array, level) {
  level += 1;
  for (let i = 0, len = array.length; i < len; i++) {
    form.insertBefore(createFormElement(array[i], level), addInputButton);
    if (array[i].subquestions.length > 0) {
      parseTree(array[i].subquestions, level);
    }
  }
}

parseTree(questionList, 0);

addInputButton.addEventListener("click", (event) => {
  event.preventDefault();
  let newQuestion = newSubQuestion(questionID, "", "", "", "Yes/No");
  form.insertBefore(createFormElement(newQuestion, 1), addInputButton);
  questionList.push(newQuestion);
  dataContainer.textContent = JSON.stringify(questionList, null, "  ");

  questionID++;
});


dataContainer.textContent = JSON.stringify(questionList, null, "  ");


function changeData(array, input, id) {
  for (let i = 0, len = array.length; i < len; i++) {
    if (array[i].id == id) {
      if (input.classList.contains("condition-type")) {
        array[i].condition = input.value;
      } else if (input.classList.contains("condition-text")) {
        array[i].conditionAnswer = input.value;
      } else if (input.classList.contains("condition-yesno")) {
        array[i].conditionAnswer = input.value;
      } else if (input.classList.contains("question-input")) {
        array[i].question = input.value;
      } else if (input.classList.contains("select-type")) {
        array[i].type = input.value;
      }

      dataContainer.textContent = JSON.stringify(questionList, null, "  ");

      return;
    }
    if (array[i].subquestions.length > 0) {
      changeData(array[i].subquestions, input, id);
    }
  }
}
