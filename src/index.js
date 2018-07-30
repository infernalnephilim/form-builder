/******************************************************************************************************************
 * Form builder v1.0
 * Author: Aleksandra Półtorak
 ******************************************************************************************************************/
var db;
const DB_NAME = 'questionList-indexeddb';
const DB_VERSION = 1;
const DB_STORE_NAME = 'questions';

var questionList = [];

var questionID = 1;

var form = document.getElementById("form-builder");
var addInputButton = document.getElementById("add-input");
//const dataContainer = document.getElementsByClassName('result')[0];

function idbOK() {
  return "indexedDB" in window &&
    !/iPad|iPhone|iPod/.test(navigator.platform);
}

if (!idbOK) {
  window.alert("Your browser doesn't support a stable version of IndexedDB.");
} else {
  openDb();
}

// A function which opens indexedDB database and creating table
function openDb() {
  var req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onsuccess = function (evt) {
    db = this.result;
    getResult(db.store);

    // Save button click event
    document.getElementById("save-data").addEventListener("click", (event) => {
      event.preventDefault();
      saveAllChanges(db.store);
    });
    // clearObjectStore(db.store);
  };
  req.onerror = function (evt) {
    console.error("openDb:", evt.target.errorCode);
  };

  req.onupgradeneeded = function (evt) {
    console.log("openDb.onupgradeneeded");
    var store = evt.currentTarget.result.createObjectStore(
      DB_STORE_NAME, {keyPath: 'id', autoIncrement: true});

    store.createIndex("id", "id", {unique: true});
    store.createIndex("conditionAnswer", "conditionAnswer", {unique: false});
    store.createIndex("condition", "condition", {unique: false});
    store.createIndex("question", "question", {unique: false});
    store.createIndex("type", "type", {unique: false});
    store.createIndex("subquestions", "subquestions", {unique: false});
  };
}

// A function which removes all data from store
function clearObjectStore(store_name) {
  var store = getObjectStore(DB_STORE_NAME, 'readwrite');
  var req = store.clear();
  req.onsuccess = function (evt) {
    console.log("Store cleared");
    getResult(store);
  };
  req.onerror = function (evt) {
    console.error("clearObjectStore:", evt.target.errorCode);
    console.log(this.error);
  };
}

// A function which saves main level questions
function saveData(store, question) {
  if (typeof store == 'undefined')
    store = getObjectStore(DB_STORE_NAME, 'readwrite');
  store.put(question);
}

// A function which saves all data from thee form
function saveAllChanges(store) {
  console.log("saveAllChanges");
  if (typeof store == 'undefined')
    store = getObjectStore(DB_STORE_NAME, 'readwrite');
  store.clear();
  if (questionList.length > 0) {
    for (let i = 0; i < questionList.length; i++) {
      store.put(questionList[i]);
    }
  }
  let date = new Date();
  setMessage("Last saved: " + date.getDate() + "." + date.getMonth() + "." + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes(), "saved");
}

// A function which deletes choosen main level question
function deleteData(store, question) {
  if (typeof store == 'undefined')
    store = getObjectStore(DB_STORE_NAME, 'readwrite');
  var objectStoreRequest = store.delete(question);

  objectStoreRequest.onsuccess = function (event) {
    console.log(question + " removed");
  };
}


function getObjectStore(store_name, mode) {
  var tx = db.transaction(store_name, mode);
  return tx.objectStore(store_name);
}

// A function which gets data from database and adds it to an array
function getResult(store) {
  if (typeof store == 'undefined')
    store = getObjectStore(DB_STORE_NAME, 'readwrite');
  var req;
  req = store.getAll();
  req.onsuccess = function (evt) {
    questionList = req.result;
    //console.log(questionList);

    parseTree(questionList, 0);
  };
  req.onerror = function (evt) {
    console.error("add error", this.error);
    console.log(this.error);
  };
}

// A function which creates new question object
function newQuestion(id, condition, conditionAnswer, questionText, type) {
  var question = {
    "id": id,
    "condition": condition,
    "conditionAnswer": conditionAnswer,
    "question": questionText,
    "type": type,
    "subquestions": []
  };
  questionID++;
  return question;
}

// A function which creates HTML for new question object
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
  // adding event listeners to buttons
  defaultQuestion.getElementsByClassName("add-sub-input")[0].addEventListener("click", (event) => {
    let button = defaultQuestion.getElementsByClassName("add-sub-input")[0].parentNode.parentNode.parentNode;
    event.preventDefault();
    let condition = "Equals";
    let conditionText = "";
    if (object.type == "Yes/No") {
      conditionText = "Yes";
    }

    var newSubQ = newQuestion(questionID, condition, conditionText, "", object.type);
    object.subquestions.push(newSubQ);
    // saveSubQuestionData(db.store, newSubQ, object.id);
    form.insertBefore(createFormElement(newSubQ, level + 1), button.nextSibling);
    setMessage("Your changes might not be saved", "notsaved");
    //dataContainer.textContent = JSON.stringify(questionList, null, "  ");

  });
  defaultQuestion.getElementsByClassName("delete-input")[0].addEventListener("click", (event) => {
    event.preventDefault();
    removeFormRows(object);
    questionList = removeNode(questionList, object.id, level);
    setMessage("Your changes might not be saved", "notsaved");
    //dataContainer.textContent = JSON.stringify(questionList, null, "  ");

  });
  // adding input change event listeners
  var inputs = defaultQuestion.getElementsByTagName("input");
  if (inputs.length > 0) {
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('change', () => {
        let inputParentID = inputs[i].parentNode.parentNode.parentNode.id;
        changeData(questionList, inputs[i], inputParentID);
        setMessage("Your changes might not be saved", "notsaved");
      }, false);

    }
  }
  var selects = defaultQuestion.getElementsByTagName("select");
  if (selects.length > 0) {
    for (let i = 0; i < selects.length; i++) {
      selects[i].addEventListener('change', () => {
        let inputParentID = selects[i].parentNode.parentNode.parentNode.id;
        changeData(questionList, selects[i], inputParentID);
        setMessage("Your changes might not be saved", "notsaved");
      });
    }
  }
  return defaultQuestion;
}
// A function which sets saving message
function setMessage(message, saved) {
  let messageElement = document.getElementById("save-message");
  messageElement.innerHTML = message;
  if(saved == "saved"){
    messageElement.classList.remove("urgent");
  } else{
    messageElement.classList.add("urgent");
  }
}
// A function which removes HTML code of chosen object
function removeFormRows(object) {
  if (object.subquestions.length > 0) {
    for (let i = 0; i < object.subquestions.length; i++) {
      removeFormRows(object.subquestions[i]);
      //dataContainer.textContent = JSON.stringify(questionList, null, "  ");
    }
    object.subquestions = [];
  }
  document.getElementById(object.id).remove();
}
// A function which removes question from JSON
function removeNode(array, id, level) {
  //deleteData(db.store, id);
  return array.filter(function (item) {
    if (item.subquestions.length > 0) item.subquestions = removeNode(item.subquestions, id, level);
    //dataContainer.textContent = JSON.stringify(questionList, null, "  ");
    return item.id !== id;
  });
}
// A function which 'draws' a form after reload
function parseTree(array, level) {
  level += 1;
  for (let i = 0, len = array.length; i < len; i++) {
    if (array[i].id > questionID) questionID = array[i].id + 1;
    form.insertBefore(createFormElement(array[i], level), addInputButton);
    if (array[i].subquestions.length > 0) {
      parseTree(array[i].subquestions, level);
    }
  }
}
// Adding event listener for "Add Input" button
addInputButton.addEventListener("click", (event) => {
  event.preventDefault();
  let newQuestion = newQuestion(questionID, "", "", "", "Yes/No");
  form.insertBefore(createFormElement(newQuestion, 1), addInputButton);
  questionList.push(newQuestion);
  //dataContainer.textContent = JSON.stringify(questionList, null, "  ");
  // if (idbOK) {
  //   saveData(db.store, newQuestion);
  // }
  setMessage("Your changes might not be saved", "notsaved");
  questionID++;
});
// A function which changes data after input change
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
      //dataContainer.textContent = JSON.stringify(questionList, null, "  ");
      return;
    }
    if (array[i].subquestions.length > 0) {
      changeData(array[i].subquestions, input, id);
    }
  }
}

// var message = "Your changes might not be saved.";
// window.onbeforeunload = function(event) {
//   var e = e || window.event;
//   if (e) {
//     e.returnValue = message;
//   }
//   return message;
// };
