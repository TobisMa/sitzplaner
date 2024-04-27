let studentListNode;
let template_studentListItem;

let globalStudents = getStudents();

function getStudents() {
    return loadFromStorage(KEY_STUDENT, []);
}

function buildList() {
    globalStudents.forEach(addStudentHTML);
}

function removeStudentsFromList() {
    while (studentListNode.firstElementChild !== studentListNode.lastElementChild) {
        studentListNode.removeChild(studentListNode.firstChild);
    }
}

function addStudentHTML(name) {
    if (name) {
        let studentNode = template_studentListItem.content.cloneNode(true);


        let nameNode = studentNode.querySelector(".student-name");
        nameNode.innerText = name;
        studentNode.querySelector(".student-actions.student-delete").onclick = (e) => {
            removeStudent(name);
        }
        studentNode.querySelector(".student-actions.student-edit").onclick = (e) => {
            let newName = prompt("Neuer Name:", name);
            if (!newName) {
                console.debug("Rename canceled by user");
                return;
            }
            if (globalStudents.indexOf(newName) !== -1) {
                alert("Name already present");
                return;
            }
            let index = globalStudents.indexOf(name);
            globalStudents[index] = newName;
            nameNode.innerText = newName;
            saveToStorage(KEY_STUDENT, globalStudents);
        }

        studentListNode.insertBefore(studentNode, studentListNode.lastElementChild);
    }
}

function removeStudentHTML(name) {
    let index = -1;
    for (let i = 0; i < studentListNode.childNodes.length - 1; i++) {
        if (name === studentListNode.children[i].querySelector(".student-name").innerText) {
            index = i;
            break;
        }
    }
    if (index === -1) return;

    studentListNode.removeChild(document.querySelectorAll("#student-list li[draggable]")[index]);
}

function removeStudent(name) {
    let index = globalStudents.indexOf(name);
    if (index === -1) return;
    
    removeStudentHTML(name);
    globalStudents.splice(index, 1);
    saveToStorage(KEY_STUDENT, globalStudents)
}

function singleStudentAddForm(e) {
    e.preventDefault();
    let input = e.target.querySelector("input#student-add-input");
    let name = input?.value;
    if (!name) {
        return;
    }
    else if (globalStudents.includes(name)) {
        return;
    }
    globalStudents.push(name);
    addStudentHTML(name);
    input.value = "";
    saveToStorage(KEY_STUDENT, globalStudents);
}

window.addEventListener("DOMContentLoaded", (e) => {
    studentListNode = document.getElementById("student-list");
    template_studentListItem = document.getElementById("templ-student-list-item");
    // document.getElementById("student-list-clear").addEventListener("click", (e) => {
    //     while(globalStudents.length > 0) {
    //         removeStudent(globalStudents[0]);
    //     }
    // })
    document.getElementById("student-list-add-form").addEventListener("submit", singleStudentAddForm);
    buildList();
});