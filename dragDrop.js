let draggedNode;

function dragOverRoom(e) {
    let td = e.target.offsetParent;
    if (td.classList.contains("is-table")) {
        // e.dataTransfer.effectAllowed = "move";
        e.preventDefault();
    }
    // e.dataTransfer.effectAllowed = "none";
}

function dragOverList(e) {
    if(draggingFile(e.dataTransfer)) {
        return;
    }
    else if (draggedNode.dataset.dragitem === "student-table") {
        let span = draggedNode.querySelector(".student-name");
        if (span.classList.contains("has-student")) {
            e.preventDefault();
        }
    }
}

function dragStartListItem(e) {
    let name = e.target.querySelector(".student-name").innerText;
    e.dataTransfer.setData("text/plain", name);
    draggedNode = e.target;
    draggedNode.classList.add("dragged");
}

function dragStartTable(e) {
    if(draggingFile(e.dataTransfer)) {
        return;
    }
    let td = e.target.offsetParent;
    if (!td.querySelector(".student-name").classList.contains("has-student") || !td.classList.contains("is-table")) {
        e.preventDefault();
        return;
    }
    let name = e.target.querySelector(".student-name").innerText;
    e.dataTransfer.setData("text/plain", name);
    draggedNode = e.target.offsetParent;
    draggedNode.classList.add("dragged");
}

function dropOnTable(e) {
    if (draggingFile(e.dataTransfer)) {
        e.preventDefault();
        return;
    }
    let td = e.target.offsetParent;
    let name = e.dataTransfer.getData("text/plain");
    let span = td.querySelector(".student-name");

    if (draggedNode.dataset.dragitem === "student-li") {
        removeStudentHTML(name);
        if (span.classList.contains("has-student")) {
            addStudentHTML(span.innerText);
        }
    }
    else if (draggedNode.dataset.dragitem === "student-table") {
        console.log("Hello");
        if (span.classList.contains("has-student")) {
            let targetStudent = span.innerText;
            draggedNode.querySelector(".student-name").innerText = targetStudent;
            roomStudents[[draggedNode.dataset.x, draggedNode.dataset.y]] = targetStudent;
        }
        else {
            draggedNode.querySelector(".student-name").classList.remove("has-student");
            draggedNode.querySelector(".student-name").innerText = "";
            roomStudents[[draggedNode.dataset.x, draggedNode.dataset.y]] = "";
        }
    }
    else {
        e.preventDefault();
        return;
    }
    // TODO? check if td is table; currently assumed
    span.innerText = name;
    span.classList.add("has-student");
    roomStudents[[td.dataset.x, td.dataset.y]] = name;
    saveToStorage(KEY_ROOM, roomStudents);
}

function dropOnList(e) {
    e.preventDefault();
    if (draggingFile(e.dataTransfer) || draggedNode === undefined || draggedNode.dataset.dragitem === "student-li") {
        return;
    }

    let name = e.dataTransfer.getData("text/plain");
    removeStudentFromRoom(name);  // adding to HTML list is done as well
    let nameNode = draggedNode.querySelector(".student-name");
    nameNode.innerText = "";
    nameNode.classList.remove("has-student");
    roomStudents[[draggedNode.dataset.x, draggedNode.dataset.y]] = "";
    saveToStorage(KEY_ROOM, roomStudents);
}

window.addEventListener("dragend", e => {
    draggedNode?.classList.remove("dragged");
});