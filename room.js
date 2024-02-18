const KEY_ROOM_WIDTH = "room_width";
const KEY_ROOM_HEIGHT = "room_height";
const KEY_ROOM = "room";

let sliderHorizontal;
let sliderVertical;
let roomTables;
let template_table;

let rommStudents;

let width;
let height;

function getArrayIndex(x, y) {
    return roomStudents[[x, y]];
}

function makeRoom() {
    width = sliderHorizontal.value;
    height = sliderVertical.value;

    for (let h = 0; h < height; h++) {
        roomAddRow();
    }
}

function dimensionUpdate(visualisation, storageKey) {
    return (e) => {
        updateRoom();
        saveToStorage(storageKey, e.target.value);
        visualisation.innerText = e.target.value;
    }
}

function removeStudentFromRoom(name) {
    addStudentHTML(name);
    for (const key in Object.keys(roomStudents)) {
        if (roomStudents[key] === name) {
            roomStudents[key] = "";
        }
    }
}

function removeTable(td) {
    if (td.classList.contains("has-student")) {
        let span = td.querySelector(".student-name");
        k = removeStudentFromRoom(span.innerText);
    }
    delete roomStudents[[td.dataset.x, td.dataset.y]];
    td.parentNode.removeChild(td);
}

function getStudentHTML(x, y) {
    let studentTable = template_table.content.cloneNode(true);

    let td = studentTable.querySelector("td.table");
    td.dataset.x = x;
    td.dataset.y = y;
    td.addEventListener("click", (e) => {
        let span = td.querySelector("span.student-name");
        if (span.classList.contains("has-student")) {
            let name = span.innerText;
            span.innerText = "";
            removeStudentFromRoom(name);
            span.classList.remove("has-student");
        }
        if (td.classList.contains("is-table")) {
            td.classList.remove("is-table");
            delete roomStudents[[x, y]];
        }
        else {
            td.classList.add("is-table");
            roomStudents[[x, y]] = "";
        }
        saveToStorage(KEY_ROOM, roomStudents);

    });

    let student = getArrayIndex(x, y);
    if (student !== undefined) {
        let studentNode = studentTable.querySelector(".student-name");
        if (student) {
            studentNode.innerText = student
            studentNode.classList.add("has-student");
            removeStudentHTML(student);
        }
        td.classList.add("is-table");
    }
    return studentTable;
}

function roomDeleteColumn() {
    let lastTds = roomTables.querySelectorAll("tr td.table:last-child");
    lastTds.forEach(removeTable);
}

function roomAddColumn() {
    for (let i = 0; i < height; i++) {
        roomTables.rows[i].appendChild(getStudentHTML(roomTables.firstChild.children.length, i));
    }
}

function roomDeleteRow() {
    let row = roomTables.querySelector("tr:last-child"); 
    row.querySelectorAll("td").forEach(removeTable);
    roomTables.removeChild(row);
}

function roomAddRow() {
    let tr = document.createElement("tr");
    for (let w = 0; w < width; w++) {
        tr.appendChild(getStudentHTML(w, roomTables.children.length));
    }
    roomTables.appendChild(tr);
}

function updateRoom() {
    const nw = sliderHorizontal.value;
    const nh = sliderVertical.value;

    const wd = nw - width;
    const hd = nh - height;

    if (wd < 0) {
        for (let i = 0; i < -wd; i++) {
            roomDeleteColumn();
        }
    }
    else if (wd > 0) {
        for (let i = 0; i < wd; i++) {
            roomAddColumn();
        }
    }

    if (hd < 0) {
        for (let i = 0; i < -hd; i++) {
            roomDeleteRow();
        }
    }
    else if (hd > 0) {
        for (let i = 0; i < hd; i++) {
            roomAddRow();
        }
    }

    width = nw;
    height = nh;
}

function loaded(e) {
    sliderHorizontal = document.getElementById("horizontal-slider");
    sliderVertical = document.getElementById("vertical-slider");
    roomTables = document.getElementById("room-table")
    template_table = document.getElementById("templ-room-table");

    sliderHorizontal.value = loadFromStorage(KEY_ROOM_WIDTH, 9);
    sliderVertical.value = loadFromStorage(KEY_ROOM_HEIGHT, 7);

    width = sliderHorizontal.value;
    height = sliderVertical.value;

    let sliderCounterH = document.querySelector("#horizontal-slider-container .slider-counter");
    sliderCounterH.innerText = sliderHorizontal.value;

    let sliderCounterW = document.querySelector("#vertical-slider-container .slider-counter");
    sliderCounterW.innerText = sliderVertical.value;

    sliderHorizontal.addEventListener("change", dimensionUpdate(sliderCounterH, KEY_ROOM_WIDTH));
    sliderVertical.addEventListener("change", dimensionUpdate(sliderCounterW, KEY_ROOM_HEIGHT));

    roomStudents = loadFromStorage(KEY_ROOM, {});

    makeRoom();

}
window.addEventListener("load", loaded)