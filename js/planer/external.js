const CSV_DELIMITER = ";";


function createHeaderName(filler = "_") {
    let d = new Date(Date.now());
    base = className ?? "";
    return "Sitzplan" + filler + `${base !== "" ? base + filler : ""}${d.getDay()}` + filler + `${d.toLocaleString("default", {month: "long"})}` + filler + `${d.getFullYear()}`;
}

function exportData(e) {
    let filename = prompt("Filename:", createHeaderName());
    if (!filename) {
        console.debug("Canceled by user");
        return;
    }

    filename = ensureFileEnding(filename, ".splan");
    saveToStorage(KEY_LAST_FILENAME, filename)

    const content = JSON.stringify({
        students: globalStudents,
        room: roomStudents,
        width: roomWidth,
        height: roomHeight,
        title: printTitle
    });
    let f = new File([content], filename, {type: "text/json"});
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(f);

    link.href = url;
    link.download = f.name;

    link.click();

    window.URL.revokeObjectURL(url);
}

function importData(data, filetyp) {
    let title = "";
    if (typeof data === "object") {
        removeStudentsFromList();
        globalStudents = data.students ?? [];

        globalStudents.forEach(addStudentHTML);  // make room removes again
        saveToStorage(KEY_STUDENT, globalStudents);

        loadRoom(data.room ?? {}, data.width, data.height, true);

        loadRules(data.rules ?? {});

        title = data.title ?? "";
    }
    else if (typeof data === "string" && filetyp === "csv") {
        let del = CSV_DELIMITER;
        if ([',', ';', ':'].includes(data.charAt(0))) {
            del = data[0];
        }

        let lines = data.split("\n");
        [title] = lines[0].split(del).filter(line => line.trim().length != 0);
        lines = lines.slice(2)
            .filter(line => line.trim().length >= 1)
            .map(line => line.split(del))  // convert lines to values
            .map(values => [values[2], values[1]])      // convert values to names
            .map(names => names.map(name => name.replace(/\"/g, "")));  // remove possible "
        
        let firstNames = lines.map(names => names[0]);
        let students = [];
        let suffixLength = {};
        let doubleName = {};
        let addLastName = [];
        
        while (firstNames.length) {
            let [name] = firstNames.splice(0, 1);
            let suffix;
            if (firstNames.includes(name) || addLastName.includes(name)) {
                if (!addLastName.includes(name)) {
                    addLastName.push(name);
                    doubleName[name] = 0;
                }
                suffixLength[name] = 0;
                let lastNames = lines.filter(values => values[0] === name).map(values => values[1]);
                let suffixes;
                let longestLastName = Math.max(...lastNames.map(name => name.length));

                do {
                    suffixLength[name]++;
                    suffixes = lastNames.map(n => n.slice(0, suffixLength[name]));
                }
                while (suffixLength[name] < longestLastName && new Set(suffixes).size < suffixes.length);

                let suffixOpts = lines.filter(values => values[0] === name).map(values => values[1].slice(0, suffixLength[name]));
                suffix = suffixOpts[doubleName[name]];
                doubleName[name]++;
            }

            if (suffixLength[name] !== undefined) {
                students.push(name.concat(" ", suffix, "."));
            }
            else {
                students.push(name);
            }
        }
        
        let answer = confirm("Import following students (and so on if there are more)?:\n" + students.slice(0, 5).join("\n") + "\n...");
        if (!answer) {
            alert("Canceled");
            return;
        }
        removeStudentsFromList();

        globalStudents = students;
        globalStudents.forEach(addStudentHTML);
        saveToStorage(KEY_STUDENT, globalStudents);

        let newRoom = {};
        for (const key of Object.keys(roomStudents)) {
          newRoom[key] = "";
        }
        loadRoom(newRoom, roomWidth, roomHeight, true);
    }
    else if (typeof data === "string") {
        let lines = data.split("\n").map(value => value.trimEnd("\r"));
        let names = [];
        for (let name of lines) {
            console.log(name);
            if (!names.includes(name)) {
                console.debug("Filter");
                names.push(name);
            }
        }
        let answer = confirm("Import following students (and so on if there are more)?:\n" + lines.slice(0, 5).join("\n") + "\n...");
        if (!answer) {
            alert("Canceled");
            return;
        }

        removeStudentsFromList();

        globalStudents = names.filter(name => name);
        globalStudents.forEach(addStudentHTML);
        saveToStorage(KEY_STUDENT, globalStudents);
        
        let newRoom = {};
        for (const key of Object.keys(roomStudents)) {
            newRoom[key] = "";
        }
        loadRoom(newRoom, roomWidth, roomHeight, true);
    }  
    setPrintTitle(title);
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

function exportImage(e) {
    let filename = window.prompt("Filename:", createHeaderName());
    filename = ensureFileEnding(filename, "." + setting_imageExportFormat.split("/").slice(1));

    let container = document.querySelector("#room");
    let rw = document.querySelector("#room-table").scrollWidth + 100;
    let rh = document.querySelector("#room").scrollHeight;
    let sidebarW = parseInt(getComputedStyle(container).getPropertyValue('--sidebar-max-width'));
    console.debug(rw, rh)
    console.debug(rw + sidebarW);

    html2canvas(container, {
        width: rw,
        height: rh,
        windowWidth: rw + sidebarW,
        windowHeight: rh,
        onclone: (clonedDoc) => {
            clonedDoc.querySelector("#print-title").classList.add("html2canvas"); 
        },
        x: -20,
        y: -30
    }).then((canvas) => {
        let link = document.createElement('a');
        link.download = filename
        console.debug(link.download);
        console.debug(setting_imageExportFormat);
        link.href = canvas.toDataURL(setting_imageExportFormat);
        link.click();
    })
}

function ensureFileEnding(name, ending) {
    if (!name.endsWith(ending)) {
        return name + ending;
    }
    return name;
}

window.addEventListener("DOMContentLoaded", (e) => {
    let importButton = document.getElementById("student-list-import");
    importButton.addEventListener("click", importDataHandler);

    let exportButton = document.getElementById("student-list-export");
    exportButton.addEventListener("click", exportData);

    let imageExportButton = document.getElementById("image-export");
    imageExportButton.addEventListener("click", exportImage);


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