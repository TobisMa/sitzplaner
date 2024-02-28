const KEY_ROOM_WIDTH = "room_width";
const KEY_ROOM_HEIGHT = "room_height";
const KEY_ROOM = "room";

const MAX_ROOMWIDTH = 15;
const MAX_ROOMHEIGHT = 15;

let sliderHorizontal;
let sliderVertical;
let roomTables;
let template_table;

let rommStudents;

let roomWidth;
let roomHeight;

function getArrayIndex(x, y) {
    return roomStudents[[x, y]];
}

function loadRoom(room, width, height, reset) {
    console.debug("Loading new room");
    width = width || 11;
    height = height || 11;
    reset = reset || false;

    updateSliders(width, height);

    if (!reset) {
        Object.keys(roomStudents).forEach(key => {
            if (roomStudents[key] !== "") {
                console.debug("remove student from room", roomStudents[key]);
                removeStudentFromRoom(roomStudents[key])
            }
        });
    }

    roomStudents = room;
    roomTables.innerHTML = "";
    makeRoom();
    saveToStorage(KEY_ROOM, roomStudents);

}

function updateSliders(width, height) {
        let w = width ?? MAX_ROOMWIDTH;
        let num = parseInt(w);
        if (num === NaN) {
            w = MAX_ROOMWIDTH;
        }
        sliderHorizontal.value = w;
        sliderHorizontal.dispatchEvent(new Event("change"));
        
        let h = height ?? MAX_ROOMHEIGHT;
        num = parseInt(h);
        if (num === NaN) {
            h = MAX_ROOMHEIGHT;
        }
        sliderVertical.value = h;
        sliderVertical.dispatchEvent(new Event("change"));
}

function makeRoom() {
    roomWidth = sliderHorizontal.value;
    roomHeight = sliderVertical.value;

    for (let h = 0; h < roomHeight; h++) {
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
    saveToStorage(KEY_ROOM, roomStudents);
}

function removeTable(td) {
    if (td.querySelector(".student-name").classList.contains("has-student")) {
        let span = td.querySelector(".student-name");
        removeStudentFromRoom(span.innerText);
    }
    delete roomStudents[[td.dataset.x, td.dataset.y]];
    td.parentNode.removeChild(td);
    saveToStorage(KEY_ROOM, roomStudents);
}

function getStudentHTML(x, y) {
    let studentTable = template_table.content.cloneNode(true);

    let td = studentTable.querySelector("td.table");
    td.dataset.x = x;
    td.dataset.y = y;

    td.addEventListener("click", (e) => {
        let span = td.querySelector("span.student-name");
        let hadStudent = false;
        if (span.classList.contains("has-student")) {
            let name = span.innerText;
            span.innerText = "";
            removeStudentFromRoom(name);
            span.classList.remove("has-student");
            hadStudent = true;
        }
        console.log(hadStudent, setting_delete_table_on_click, DELETE_TABLE_ON_CLICK)
        if (td.classList.contains("is-table") && (setting_delete_table_on_click === DELETE_TABLE_ON_CLICK || !hadStudent)) {
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
    for (let i = 0; i < roomHeight; i++) {
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
    for (let w = 0; w < roomWidth; w++) {
        tr.appendChild(getStudentHTML(w, roomTables.children.length));
    }
    roomTables.appendChild(tr);
}

function updateRoom() {
    const nw = sliderHorizontal.value;
    const nh = sliderVertical.value;

    const wd = nw - roomWidth;
    const hd = nh - roomHeight;

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

    roomWidth = nw;
    roomHeight = nh;
}

function loaded(e) {
    sliderHorizontal = document.getElementById("horizontal-slider");
    sliderVertical = document.getElementById("vertical-slider");
    roomTables = document.getElementById("room-table")
    template_table = document.getElementById("templ-room-table");

    sliderHorizontal.value = loadFromStorage(KEY_ROOM_WIDTH, 9);
    sliderVertical.value = loadFromStorage(KEY_ROOM_HEIGHT, 7);

    roomWidth = sliderHorizontal.value;
    roomHeight = sliderVertical.value;

    let sliderCounterH = document.querySelector("#horizontal-slider-container .slider-counter");
    sliderCounterH.innerText = sliderHorizontal.value;

    let sliderCounterW = document.querySelector("#vertical-slider-container .slider-counter");
    sliderCounterW.innerText = sliderVertical.value;

    sliderHorizontal.addEventListener("change", dimensionUpdate(sliderCounterH, KEY_ROOM_WIDTH));
    sliderVertical.addEventListener("change", dimensionUpdate(sliderCounterW, KEY_ROOM_HEIGHT));

    roomStudents = loadFromStorage(KEY_ROOM, {});

    makeRoom();

};


window.addEventListener("DOMContentLoaded", loaded);