const KEY_LAST_FILENAME = "last_filename_export";


function exportData(e) {
    let filename = prompt("Filename", loadFromStorage(KEY_LAST_FILENAME, "sitzplan.splan"));
    if (!filename) {
        console.debug("Canceled by user");
        return;
    }
    const content = JSON.stringify({
        "students": globalStudents,
        "room": roomStudents
    });
    saveToStorage(KEY_LAST_FILENAME, filename)
    let f = new File([content], filename, {type: "text/json"});
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(f);

    link.href = url;
    link.download = f.name;

    link.click();

    window.URL.revokeObjectURL(url);
}


function importData(data) {
    while (studentListNode.firstElementChild !== studentListNode.lastElementChild) {
        studentListNode.removeChild(studentListNode.firstChild);
    }
    
    if (typeof data === "object") {
        globalStudents = data.students ?? [];
        roomStudents = data.room ?? {};

        globalStudents.forEach(addStudentHTML);  // make room removes again
        saveToStorage(KEY_STUDENT, globalStudents);

        roomTables.innerHTML = "";
        makeRoom();  // stores
        saveToStorage(KEY_ROOM, roomStudents);
    }
    else if (typeof data === "string") {
        let lines = data.split("\n").map(value => value.trimEnd("\r"));
        let answer = confirm("Import following students (and so on):" + lines.slice(0, 5).join("\n") + "\n...");
        if (!answer) {
            alert("Canceled");
            return;
        }

        globalStudents = lines;
        globalStudents.forEach(addStudentHTML);
        saveToStorage(KEY_STUDENT, globalStudents);

        roomStudents = {};
        roomTables.innerHTML = "";
        makeRoom();  // stores
        saveToStorage(KEY_ROOM, roomStudents);
    }
}

function importDataHandler(e) {
    let input = document.createElement('input');
    input.type = 'file';
    input.multiple = false;
    input.onchange = e => { 
        let files = e.target.files; 
        for (var i = 0; i < files.length; i++){
            let read = new FileReader();
            read.readAsBinaryString(files[i]);
            read.onloadend = (e) => { readFileImport(read); };
            break;
        }
    }
    input.click();
}

function readFileImport(reader) {
    let jsonData = undefined;
    try {
        jsonData = JSON.parse(reader.result);
    } catch (e) {
        console.debug("Invalid json found");
        // console.log(e);
    }
    if (jsonData) {
        importData(JSON.parse(reader.result));
    } else {
        importData(reader.result);
    }
}

function preventDefaults(e) {
    if (draggingFile(e.dataTransfer)) {
        e.preventDefault()
        e.stopPropagation()
    }
}

function draggingFile(dt) {
    for (let i = 0; i < dt.items.length; i++) {
        if (dt.items[i].kind === "file") {
            return true;
        }
    }
    return false;
}

function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;
    if (!files) {
        e.preventDefault();
        return;
    }

    let file = files[0];
    let fileReader = new FileReader();
    fileReader.readAsBinaryString(file);
    fileReader.onloadend = (e) => { readFileImport(fileReader); };
}

window.addEventListener("DOMContentLoaded", (e) => {
    let importButton = document.getElementById("student-list-import");
    importButton.addEventListener("click", importDataHandler);

    let exportButton = document.getElementById("student-list-export");
    exportButton.addEventListener("click", exportData);


    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, preventDefaults, false)
    });

    document.body.addEventListener('drop', handleDrop, false)
});

window.addEventListener("keydown", (e) => {
    console.log(e);
    if (e.ctrlKey && e.key === "s") {
        exportData();
    }
    else if (e.ctrlKey && e.key === "o") {
        importDataHandler();
    }
    else {
        return;  // important lol
    }
    e.preventDefault();
})