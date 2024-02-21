const KEY_LAST_FILENAME = "last_filename_export";
const CSV_DELIMITER = ";";


function exportData(e) {
    let filename = prompt("Filename", loadFromStorage(KEY_LAST_FILENAME, "sitzplan.splan"));
    if (!filename) {
        console.debug("Canceled by user");
        return;
    }
    const content = JSON.stringify({
        students: globalStudents,
        room: roomStudents,
        width: width,
        height: height,
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


function importData(data, filetyp) {
    while (studentListNode.firstElementChild !== studentListNode.lastElementChild) {
        studentListNode.removeChild(studentListNode.firstChild);
    }
    
    if (typeof data === "object") {
        globalStudents = data.students ?? [];
        roomStudents = data.room ?? {};
        let w = data.width ?? 12;
        let num = parseInt(w);
        if (num === NaN) {
            w = 12;
        }
        sliderHorizontal.value = w;
        sliderHorizontal.dispatchEvent(new Event("change"));
        
        let h = data.width ?? 12;
        num = parseInt(h);
        if (num === NaN) {
            h = 12;
        }
        sliderVertical.value = h;
        sliderVertical.dispatchEvent(new Event("change"));

        globalStudents.forEach(addStudentHTML);  // make room removes again
        saveToStorage(KEY_STUDENT, globalStudents);

        roomTables.innerHTML = "";
        makeRoom();  // stores
        saveToStorage(KEY_ROOM, roomStudents);
    }
    else if (typeof data === "string" && filetyp === "csv") {
        let lines = data.split("\n").slice(1);
        console.log(lines);
        console.log("Found csv");
        let students = lines
            .filter(line => line)
            .map(line => line.split(CSV_DELIMITER))  // convert lines to values
            .map(values => [values[1], values[2]])       // convert values to names
            .map(names => names.map(name => name.trim("\"")))  // remove possible "
            .map(names => names.join(", "));        // make it to one string
        
        console.log(students);
        
        let answer = confirm("Import following students (and so on if there are more)?:\n" + students.slice(0, 5).join("\n") + "\n...");
        if (!answer) {
            alert("Canceled");
            return;
        }

        globalStudents = students;
        globalStudents.forEach(addStudentHTML);
        saveToStorage(KEY_STUDENT, globalStudents);

        roomStudents = {};
        roomTables.innerHTML = "";
        makeRoom();  // stores
        saveToStorage(KEY_ROOM, roomStudents);
    }
    else if (typeof data === "string") {
        let lines = data.split("\n").map(value => value.trimEnd("\r"));
        let answer = confirm("Import following students (and so on if there are more)?:\n" + lines.slice(0, 5).join("\n") + "\n...");
        if (!answer) {
            alert("Canceled");
            return;
        }

        globalStudents = lines.filter(line => line);
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
            read.onloadend = (e) => { readFileImport(read, getFileExtension(files[i].name));};
            break;
        }
    }
    input.click();
}

function getFileExtension(filename) {
    if (filename.includes(".")) {
        let splitted = filename.split(".");
        ext = splitted[splitted.length - 1].toLowerCase();
        return ext;
    }
    return undefined;
}

function readFileImport(reader, ext) {
    if (reader.result === null) {
        console.log("Probably folder dropped");
        return;
    }
    console.log(reader);
    let jsonData = undefined;
    try {
        jsonData = JSON.parse(reader.result);
    } catch (e) {
        console.debug("Invalid json found");
        // console.log(e);
    }
    if (jsonData) {
        importData(JSON.parse(reader.result), ext);
    } else {
        importData(reader.result, ext);
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
    if (!draggingFile(e.dataTransfer)) {
        e.preventDefault();
        return;
    }
    console.log(e);
    let dt = e.dataTransfer;
    let file = dt.files[0];
    let fileReader = new FileReader();
    fileReader.readAsBinaryString(file);
    fileReader.onloadend = (e) => { readFileImport(fileReader, getFileExtension(file.name)); };
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