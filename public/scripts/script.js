// On page load, initialize button functionality
document.addEventListener("DOMContentLoaded", initializePage);

// Page Initialization
function initializePage() {
    // createTable();
    bindButtons();
}

// Button Functionality
function bindButtons() {
    document.body.addEventListener("click", function(event){
        // Get the target of the click event
        var target = event.target;

        // If a button wasn't clicked, do nothing
        if (target.tagName != "BUTTON") return;

        // Perform functionality based on type of button
        if (target.classList.contains("edit")){
            editButton(target);
        };
        if (target.classList.contains("delete")){
            deleteButton(target);
        };
        if (target.classList.contains("add")){
            addButton();
        }
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
        console.log(currentEntry);

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
    bindButtons();
}

// Fetch Row Helper Function
function fetchRow(element) {
    return element.parentNode.parentNode;
}

// Convert Row values to Row Inputs
function convertValuesToInputs (rowElement) {
    rowNodes = rowElement.childNodes;
    for (elementIndex in rowNodes){
        let currentElement = rowNodes[elementIndex];
        console.log(currentElement)
        if (currentElement.tagName == "TD"){
            // Convert Fields to Editor Form
            if (currentElement.classList.contains("field")){
                currentValue = currentElement.innerText;
                currentElement.innerText = "";
                let currentInput = document.createElement("input");
                currentElement.appendChild(currentInput);
                currentInput.value = currentValue;
                console.log(currentElement);
            }
            // Convert Buttons to Editor Buttons
            if (currentElement.classList.contains("btn")){
                let currentButton = currentElement.childNodes[0];
                if (currentButton.classList.contains("edit")){
                    currentButton.innerText = "Submit";
                    currentButton.classList.remove("edit");
                    currentButton.classList.add("submit");
                }
                if (currentButton.classList.contains("delete")){
                    currentButton.innerText = "Cancel";
                    currentButton.classList.remove("delete");
                    currentButton.classList.add("cancel");
                }
            }
        }
    }
}

// Edit Button Functionality
function editButton(btn) {
    // Fetch Corresponding Row ID
    currentRow = fetchRow(btn);
    currentRowID = currentRow.getElementsByClassName("id")[0].innerText;
    // Debug
    console.log(currentRowID + " edit button clicked.");
    // Entry editor functionality
    convertValuesToInputs(currentRow);
}
// Add Button Functionality
function addButton() {
    // Fetch Inputs
    nameInput = document.getElementById("nameInput").value;
    repsInput = document.getElementById("repsInput").value;
    weightInput = document.getElementById("weightInput").value;
    dateInput = document.getElementById("dateInput").value;
    lbsInput = document.getElementById("lbsInput").value;

    //Debug
    console.log("Add Record Button Clicked");
    console.log("name: " + nameInput.toString());
    console.log("reps: " + repsInput.toString());
    console.log("weight: " + weightInput.toString());
    console.log("date: " + dateInput.toString());
    console.log("lbs: " + lbsInput.toString());

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
            return;
        } else {
            console.log("Oops! There was an error processing this request: " + request.statusText);
        }
    });
    request.send(JSON.stringify(payload));
    event.preventDefault();

}

// Delete Button Funtionality
function deleteButton(btn) {
    // Fetch Corresponding Row ID
    currentRow = fetchRow(btn);
    currentRowID = currentRow.getElementsByClassName("id")[0].innerText;
    // Debug
    console.log(currentRowID + " delete button clicked.");

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