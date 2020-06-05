// On page load, initialize button functionality
document.addEventListener("DOMContentLoaded", initializePage);

// Page Initialization
function initializePage() {
    bindAddButton();
    bindTableButtons();
}

// editor mode
let editorMode = false;

// Add Form Button Functionality
function bindAddButton() {
    /*
    Add Record button is bound separately from the table records,
    because otherwise every time the table is refreshed, the add record
    function would be added to the add record click event, which could
    cause it to fire an unintended amount of times and bombard the server with post requests.
    */
    let addRecordButton = document.getElementById("addRecordButton");
    addRecordButton.addEventListener("click", function(event){
        addButton();
    });
}

// Table Records Button Functionality
function bindTableButtons() {
    document.getElementById("workoutsTable").addEventListener("click", function(event){
        // Get the target of the click event
        var target = event.target;

        // If a button wasn't clicked, do nothing
        if (target.tagName != "BUTTON") return;

        // Perform functionality based on type of button
        if (target.classList.contains("edit")){
            editButton(target);
            return;
        };
        if (target.classList.contains("delete")){
            deleteButton(target);
            return;
        };
        if (target.classList.contains("submit")){
            submitButton(target);
            return;
        };
        if (target.classList.contains("cancel")){
            cancelButton(target);
            return;
        };
    });
};

// Create Table
function createTable(data) {
    /*
    Queries the database for all entries and creates an html table to display the data
    */
    // Delete the table if it already exists
    let table = document.getElementById("workoutsTable");
    if (table) table.remove();

    // Create the table
    table = document.createElement("TABLE");
    tableContainer = document.getElementById("tableContainer")
    tableContainer.appendChild(table);
    table.setAttribute("id", "workoutsTable");

    // Create Headers
    let headerRow = document.createElement("TR");
    table.appendChild(headerRow);
    if (data.length > 0) {
        let headers = ["id", "name", "reps", "weight", "date", "units"];
        for (i=0; i<6; i++) {
            let newCell = document.createElement("TH");
            headerRow.appendChild(newCell);
            newCell.innerText = headers[i];
        }
    } else {
        let newCell = document.createElement("TH");
        headerRow.appendChild(newCell);
        newCell.innerText = "Add a record to get started!";
    }


    // Add data to table
    for (entryIndex in data) {
        // Designate object at current index as current entry
        currentEntry = data[entryIndex];

        // Create Row for New Data
        let newRow = document.createElement("TR");
        table.appendChild(newRow);

        // Create Cells for Each Field in Entry
        for (fieldIndex in currentEntry){
            // Designate object at current index as current field
            currentField = currentEntry[fieldIndex];

            // Create Cell for New Data
            let newCell = document.createElement("TD");

            // Assign Cell Value
            if (fieldIndex == "lbs"){
                if (currentField == 1) {
                    newCell.innerText = "lbs.";
                } else {
                    newCell.innerText = "kgs.";
                }
            } else {
                newCell.innerText = currentField;
            }
            
            // Give the first cell the class of ID
            if (fieldIndex == "id") {
                newCell.classList.add("id")
            }

            // Assign Field Class and Append to New Table Row
            newCell.classList.add("field")
            newRow.appendChild(newCell);
        }

        // Add Edit/Delete Buttons
        let buttonNames = ["edit", "delete"]

        for (nameIndex in buttonNames) {
            // Create Cell for Button
            let btnCell = document.createElement("TD");
            btnCell.classList.add("btn");
            newRow.appendChild(btnCell);

            // Create Button in Cell
            let btn = document.createElement("BUTTON");
            let currentName = buttonNames[nameIndex];
            btn.innerText = currentName;
            btn.classList.add(currentName);
            btnCell.appendChild(btn);
        }
    }
    // Bind the new buttons
    bindTableButtons();
}

// Fetch Row Helper Function
function fetchRow(element) {
    return element.parentNode.parentNode;
}

// Convert Row values to Row Inputs
function enterEditorMode (rowElement) {
    // Set Editor Mode On
    editorMode = true;

    // Allow current row to be edited
    // Get a list of all of the child nodes on the current row
    rowNodes = rowElement.childNodes;

    // Create an array to store the original values of the row, in case the user decides to cancel the edit
    let originalValues = [];

    // Iterate through the nodes and covert the text to inputs the user can edit
    for (elementIndex in rowNodes){
        // Designate the current element
        let currentElement = rowNodes[elementIndex];

        if (currentElement.tagName == "TD"){
            // Convert Fields to Editor Form
            if (currentElement.classList.contains("id")) continue;
            if (currentElement.classList.contains("field")){
                currentValue = currentElement.innerText;
                originalValues.push(currentValue);
                currentElement.innerText = "";
                if (currentElement.classList.contains("lbs")) {
                    let selector = document.createElement("select");
                    let lbsSelect = document.createElement("option");
                    let kgsSelect = document.createElement("option");
                    lbsSelect.setAttribute("value", "1");
                    lbsSelect.innerText = "lbs.";
                    kgsSelect.setAttribute("value", "0");
                    kgsSelect.innerText = "kgs.";
                    if (currentValue == "lbs.") {
                        lbsSelect.setAttribute("selected", true);
                    } else {
                        kgsSelect.setAttribute("selected", true);
                    }
                    currentElement.appendChild(selector);
                    selector.appendChild(lbsSelect);
                    selector.appendChild(kgsSelect);
                    continue;                    
                };
                let currentInput = document.createElement("input");
                currentElement.appendChild(currentInput);
                currentInput.value = currentValue;
                if (currentElement.classList.contains("name")){
                    currentInput.setAttribute("type", "text");
                } else if (currentElement.classList.contains("reps")){
                    currentInput.setAttribute("type", "number");
                } else if (currentElement.classList.contains("weight")){
                    currentInput.setAttribute("type", "number");
                } else if (currentElement.classList.contains("date")){
                    let currentDate = (currentValue.slice(6, 10)) + "-" + (currentValue.slice(0, 2)) + "-" + (currentValue.slice(3,5));
                    currentInput.setAttribute("value", currentDate);
                    currentInput.setAttribute("type", "date");
                    currentInput.value = currentDate;
                }
            }
            // Convert Buttons to Editor Buttons
            if (currentElement.classList.contains("btn")){
                let currentButton = currentElement.childNodes[0];
                if (currentButton.classList.contains("edit")){
                    currentButton.innerText = "submit";
                    currentButton.classList.remove("edit");
                    currentButton.classList.add("submit");
                }
                if (currentButton.classList.contains("delete")){
                    currentButton.innerText = "cancel";
                    currentButton.classList.remove("delete");
                    currentButton.classList.add("cancel");
                }
            }
        }
    }
    // Set cancel function to revert cell values
    cancelButton = function() {
        revertRowValues(rowNodes, originalValues);
        editorMode = false;
    }
}
// Convert Row Inputs back to Row Values
function revertRowValues(listOfNodes, listOfValues) {
    let valueIndex = 0;
    for (nodeIndex in listOfNodes) {
        // Designate the current element
        let currentElement = listOfNodes[nodeIndex];

        if (currentElement.tagName == "TD"){
            if (currentElement.classList.contains("id")) continue;
            // Convert Editor Form to Value Fields
            if (currentElement.classList.contains("field")){
                currentElement.removeChild(currentElement.childNodes[0]);
                currentElement.innerText = listOfValues[valueIndex];
                valueIndex += 1;
            }
            // Convert Buttons to Editor Buttons
            if (currentElement.classList.contains("btn")){
                let currentButton = currentElement.childNodes[0];
                if (currentButton.classList.contains("submit")){
                    currentButton.innerText = "edit";
                    currentButton.classList.remove("submit");
                    currentButton.classList.add("edit");
                }
                if (currentButton.classList.contains("cancel")){
                    currentButton.innerText = "delete";
                    currentButton.classList.remove("cancel");
                    currentButton.classList.add("delete");
                }
            }
        }
    }
}

// Declare Cancel Button Funcionality
let cancelButton = function() {
    // Overwritten by edit mode function
    return;
}

// Edit Button Functionality
function editButton(btn) {
    if (!editorMode) {
        // Fetch Corresponding Row
        currentRow = fetchRow(btn);

        // Entry editor functionality
        enterEditorMode(currentRow);
    } else {
        alert("You cannot edit more than one row at once.");
    }    
}

// Submit Edit Button Functionality
function submitButton(btn) {
    // Fetch Corresponding Row
    currentRow = fetchRow(btn);

    // List to store request parameters
    let inputValues = [];

    // Get children of current row
    rowNodes = currentRow.childNodes
    for (nodeIndex in rowNodes) {
        // Designate current element
        currentElement = rowNodes[nodeIndex];

        // Ignore text nodes
        if (currentElement.tagName != "TD") continue;

        // Add Field Values to inputValues list
        if (currentElement.classList.contains("field")){
            inputValues.push(currentElement.childNodes[0].value);
        }

    }

    // Fetch Field Values
    console.log(inputValues);
}

// Add Button Functionality
function addButton() {
    // Fetch Inputs
    nameInput = document.getElementById("nameInput").value;
    repsInput = document.getElementById("repsInput").value;
    weightInput = document.getElementById("weightInput").value;
    dateInput = document.getElementById("dateInput").value;
    lbsInput = document.getElementById("lbsInput").value;

    // Send Async request to server to add the entry to the database
    databaseAdd(nameInput, repsInput, weightInput, dateInput, lbsInput);

}

function databaseAdd(name, reps, weight, date, lbs) {
    // Create Request and Set Payload (the data to be added to the database)
    let request = new XMLHttpRequest();
    let payload = {name: name, reps: reps, weight: weight, date: date, lbs: lbs}

    // Process Insert request to server
    request.open("POST", "/", true);
    request.setRequestHeader("Content-Type", "application/json");
    request.addEventListener("load", function(){
        if (request.status >= 200 && request.status < 400){
            // Create Table with Updated Database information
            createTable(JSON.parse(request.response));
        } else {
            console.log("Oops! There was an error processing this request: " + request.statusText);
        }
    });
    request.send(JSON.stringify(payload));
    event.preventDefault();
}

// Delete Button Funtionality
function deleteButton(btn) {
    let confirmation = window.confirm("Are you sure you want to delete this record?");
    if (!confirmation) return;

    // Fetch Corresponding Row ID
    currentRow = fetchRow(btn);
    currentRowID = currentRow.getElementsByClassName("id")[0].innerText;

    // Send Async request to server to remove the entry from the database based on the ID
    databaseDelete(currentRowID);
}

function databaseDelete(id) {
    // Create Request and Set Payload (the ID of the row to be deleted from the Database)
    let request = new XMLHttpRequest();
    let payload = {id: id}

    // Process Delete Request to Server
    request.open("DELETE", "/", true);
    request.setRequestHeader("Content-Type", "application/json");
    request.addEventListener("load", function(){
        if (request.status >= 200 && request.status < 400){
            // Create Table with Updated Database information
            createTable(JSON.parse(request.response));
        } else {
            console.log("Oops! There was an error processing this request: " + request.statusText);
        }
    }); 
    request.send(JSON.stringify(payload));
    event.preventDefault();
}