async function generatePlan() {
    let dummySeats = [];
    Object.keys(roomStudents).forEach(s => {
        if (roomStudents[s]) {
            removeStudentFromRoom(roomStudents[s]);
        }
        dummySeats.push(new DummySeat(...s.split(",").map(v => parseInt(v))));
    })

    // sort by y desc then x desc
    dummySeats.sort((a, b) => {
        if (a.y === b.y) {
            return b.x - a.x;
        }
        return b.y - a.y;
    });

    let dummyStudents = []
    globalStudents.forEach(name => {
        dummyStudents.push(new DummyStudent(name, firstRowRule.includes(name), notLastRowRule.includes(name)));
    })

    dummyStudents.forEach(dummy => {
        dummy.avoid = dummy.avoid.concat((forbiddenNeighboursRule[dummy.student] ?? []).map(name => getDummyStudentByName(dummyStudents, name)));
        dummy.neighbour = dummy.neighbour.concat((sitWithRule[dummy.student] ?? []).map(name => getDummyStudentByName(dummyStudents, name)));
    });

    let algo = new SeatingAlgorithm(dummySeats, dummyStudents, setting_algo_randomness);
    let res = algo.compute();

    if (res.error) {
        alert(res.message);
        return;
    }

    for (const seat of res.seats) {
        roomStudents[[seat.x, seat.y]] = seat.dummyStudent ? seat.dummyStudent.student : "";
    }
    loadRoom(roomStudents, roomWidth, roomHeight, true);
} 

function getDummyStudentByName(dummies, name) {
    for (const dummy of dummies) {
        if (dummy.student === name) {
            return dummy;
        }
    }
    return null;
}

window.addEventListener("DOMContentLoaded", (e) => {
    console.log("Hello");
    document.getElementById("btn-generate-plan").addEventListener("click", async function (e) {
        generatePlan();
    });
})

// code below developed by https://github.com/Florik3ks and https://github.com/1td with small changes
class DummySeat {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dummyStudent = null;
    }


}

class DummyStudent {
    constructor(name, frontRow, noBackRow) {
        this.student = name;
        this.seated = false;
        this.seat = null;

        this.frontRow = frontRow;
        this.noBackRow = noBackRow;
        this.avoid = [];
        this.neighbour = [];
    }

    setSeat(seat) {
        if (this.seated && seat.dummyStudent != this) {
            console.log(this.student.name + " hat versucht, sich auf einen Stuhl zu setzen (" + seat.x + "|" + seat.y + "), ohne vorher von seinem ursprünglichen (" + this.seat.x + "|" + this.seat.y + ") aufzustehen. Er wird zum Aufstehen gebracht.")
        }
        if (this.seat != null) {
            this.unSeat();
        }
        if (seat.dummyStudent != null && seat.dummyStudent != this) {
            console.log(this.name + " hat versucht sich auf einen bereits von " + seat.dummyStudent.student.name + " belegten Stuhl an der Position (" + seat.x + "|" + seat.y + ") zu setzen. Er wurde davon abgehalten, und bleibt ohne Sitzplatz.");
            return;
        }
        this.seat = seat;
        seat.dummyStudent = this;
        this.seated = true;
    }

    unSeat() {
        this.seat.dummyStudent = null;
        this.seat = null;
        this.seated = false;
    }

    getSeat() {
        return this.seat;
    }

}


class SeatingAlgorithm {
    // TODO: numberOfFrontSeatsNeeded nutzen
    firstRow;
    lastRow;
    seats;
    seatsDict = {};
    students = [];
    numberOfFrontSeatsNeeded = 0;
    randomness;

    constructor(seats, students, randomness) {
        this.firstRow = this.getFirstRow(seats);
        this.lastRow = this.getLastRow(seats);
        this.students = students;
        this.seats = seats;
        this.randomness = randomness;
        // create seats dictionary
        seats.forEach((student) => {
            this.seatsDict[student.x.toString() + "," + student.y.toString()] = student;
        });

        // number of front seats needed
        students.forEach((s) => {
            if (s.frontRow) this.numberOfFrontSeatsNeeded++;
        });


    }

    //#region helper functions

    findSeatByCoordinates(x, y) {
        return this.seatsDict[x.toString() + "," + y.toString()];
    }
    getLastRow(seats) {
        let minRow = Number.MAX_VALUE;
        for (const s of seats) {
            minRow = Math.min(minRow, s.y);
        }
        return minRow;
    }

    getFirstRow(seats) {
        let maxRow = 0;
        for (const s of seats) {
            maxRow = Math.max(maxRow, s.y);
        }
        return maxRow;
    }

    isClose(x1, y1, x2, y2) {
        if (x1 == -1 || x2 == -1) return false;
        return !(Math.abs(x1 - x2) > 1 || Math.abs(y1 - y2) > 1);
    }

    getRoomNeighbours(x, y) {
        const result = [];
        for (let y1 = -1; y1 <= 1; y1++) {
            for (let x1 = -1; x1 <= 1; x1++) {
                if (!(x1 == 0 && y1 == 0)) {
                    const seat = this.findSeatByCoordinates(x1 + x, y1 + y);
                    if (seat) result.push(seat);
                }
            }
        }
        return result;
    }

    getFreeSeatNeighbourCount(x, y) {
        let freeNeighbourSeats = 0;
        this.getRoomNeighbours(x, y).forEach((n) => {
            if (n.student == null) freeNeighbourSeats++;
        });
        return freeNeighbourSeats;
    }

    shuffleArray(array) {
        let currentIndex = array.length,
            randomIndex;

        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    //#endregion helper functions

    compute() {
        if (this.students.length == 0) {
            return { done: true, error: true, message: "Dieser Kurs beinhaltet keine Schüler." };

        }
        if (this.seats.length == 0) {
            return { done: true, error: true, message: "Es sind keine Sitzplätze ausgewählt." };
        }
        if (this.seats.length < this.students.length) {
            return { done: true, error: true, message: "Es gibt weniger Plätze als Schüler." };
        }
        let freeStudents = this.students.slice();
        const frontRowStudents = [];
        const notLastRowStudents = [];
        const hasFixedNeighbours = [];
        // remove manually seated students
        for (let i = freeStudents.length - 1; i >= 0; i--) {
            if (freeStudents[i].seated) {
                freeStudents.splice(i, 1);
            }
        }
        // add front row students to their own list
        for (let i = freeStudents.length - 1; i >= 0; i--) {
            if (freeStudents[i].frontRow) {
                frontRowStudents.push(freeStudents[i]);
                freeStudents.splice(i, 1);
            }
        }
        // add students that should not sit in the back to their own list
        for (let i = freeStudents.length - 1; i >= 0; i--) {
            if (freeStudents[i].noBackRow) {
                notLastRowStudents.push(freeStudents[i]);
                freeStudents.splice(i, 1);
            }
        }
        // this.shuffleArray(firstRow);
        for (let i = freeStudents.length - 1; i >= 0; i--) {
            if (freeStudents[i].neighbour.length > 0) {
                hasFixedNeighbours.push(freeStudents[i]);
                freeStudents.splice(i, 1);
            }
        }
        hasFixedNeighbours.sort((a, b) => b.neighbour.length - a.neighbour.length);
        if (this.randomness > 0) {
            this.shuffleArray(freeStudents);
            this.shuffleArray(notLastRowStudents);
        }
        // put students that must not sit in the last row at the beginning of the freeStudenst array
        freeStudents = notLastRowStudents.concat(freeStudents);

        // merge all arrays
        const studentOrder = frontRowStudents.concat(hasFixedNeighbours.concat(freeStudents));

        // shuffle students sitting in the first row
        if (this.randomness > 0 && frontRowStudents.length > 0) {
            let frontRowCount = 0;
            this.seats.forEach((s) => {
                if (s.y == this.firstRow && s.student == null) {
                    frontRowCount++;
                }
            });
            const frontRow = this.seats.splice(0, frontRowCount);
            this.shuffleArray(frontRow);
            this.seats = frontRow.concat(this.seats);
            // const frontRow = studentOrder.splice(0, frontRowCount);
            // this.shuffleArray(frontRow);
            // studentOrder = frontRow.concat(studentOrder);
        }

        const freeSeats = [];
        this.seats.forEach((seat) => {
            if (seat.dummyStudent == null) freeSeats.push(seat);
        });
        if (this.randomness == 2) {
            this.shuffleArray(freeSeats);
        }
        const result = this.recSolve(studentOrder, freeSeats); //slice to copy
        // if (!result) alert("Dieser Plan ist mit den gegebenen Präferenzen nicht möglich.");
        if (!result)
            return {
                done: true,
                error: true,
                // message: "Ein Plan ist mit den gegebenen Präferenzen nicht möglich.",
                message: "Ein Plan ist mit den angegebenen Regeln in diesem Raum nicht möglich.",
            };

        return { done: true, error: false, seats: this.seats };
    }

    recSolve(students, freeSeats, lastStudent) {
        if (students.length == 0) {
            return this.validateFinal(this.students);
        }

        if (lastStudent) {
            if (!this.validateSingleStudent(lastStudent)) {
                return false;
            }
            // check validation for adjacent seats
            for (const seat of this.getRoomNeighbours(lastStudent.getSeat().x, lastStudent.getSeat().y)) {
                if (seat.dummyStudent != null) {
                    if (!this.validateSingleStudent(seat.dummyStudent)) return false;
                }
            }
        } else {
            if (!this.validateIncomplete(this.students)) return false;
        }

        for (const s of students) {
            if (s.seated) {
                students.splice(students.indexOf(s), 1);
                continue;
            }

            for (let i = 0; i < freeSeats.length; i++) {
                const seat = freeSeats[i];
                if (seat.dummyStudent == null) {
                    freeSeats.splice(i, 1);

                    const index = students.indexOf(s);
                    students.splice(index, 1);

                    s.setSeat(seat);

                    if (this.recSolve(students.slice(), freeSeats.slice(), s)) {
                        return true;
                    }
                    s.unSeat();
                    freeSeats.splice(i, 0, seat);

                    students.splice(index, 0, s);
                }
            }
            return false;
        }
        if (students.length == 0) {
            return this.validateFinal(this.students);
        }
        return false;
    }

    //#region validation functions

    validateSingleStudent(s, final = false) {
        if (s.frontRow) {
            if (s.getSeat().y != this.firstRow) {
                return false;
            }
        }
        if (s.noBackRow) {
            if (s.getSeat().y == this.lastRow) {
                return false;
            }
        }

        let freeNeighbourSeatsNeeded = s.neighbour.length;
        for (const sNearby of s.neighbour) {
            if (sNearby.seated) {
                freeNeighbourSeatsNeeded--;
                if (!this.isClose(sNearby.getSeat().x, sNearby.getSeat().y, s.getSeat().x, s.getSeat().y)) {
                    return false;
                }
            }
        }

        const freeNeighbourSeats = this.getFreeSeatNeighbourCount(s.getSeat().x, s.getSeat().y);

        if (freeNeighbourSeats < freeNeighbourSeatsNeeded) return false;

        for (const sAvoid of s.avoid) {
            if (sAvoid.seated) {
                if (this.isClose(sAvoid.getSeat().x, sAvoid.getSeat().y, s.getSeat().x, s.getSeat().y)) {
                    return false;
                }
            }
        }

        return true;
    }
    validateIncomplete(students) {
        for (const s of students) {
            if (!s.seated) continue;

            if (s.frontRow) {
                if (s.getSeat().y != this.firstRow) {
                    return false;
                }
            }
            if (s.noBackRow) {
                if (s.getSeat().y == this.lastRow) {
                    return false;
                }
            }

            let allneighbourNeedToBeSeated = true;
            for (const n of this.getRoomNeighbours(s.getSeat().x, s.getSeat().y)) {
                if (n.student == null) {
                    allneighbourNeedToBeSeated = false;
                    break;
                }
            }

            for (const sNearby of s.neighbour) {
                if (sNearby.seated || allneighbourNeedToBeSeated) {
                    if (
                        !this.isClose(sNearby.getSeat().x, sNearby.getSeat().y, s.getSeat().x, s.getSeat().y)
                    ) {
                        return false;
                    }
                }
            }

            for (const sAvoid of s.avoid) {
                if (sAvoid.seated) {
                    if (this.isClose(sAvoid.getSeat().x, sAvoid.getSeat().y, s.getSeat().x, s.getSeat().y)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    validateFinal(students) {
        for (const s of students) {
            if (!s.seated) {
                return false;
            }

            for (const sNearby of s.neighbour) {
                if (!this.isClose(sNearby.getSeat().x, sNearby.getSeat().y, s.getSeat().x, s.getSeat().y)) {
                    return false;
                }
            }

            for (const sAvoid of s.avoid) {
                if (this.isClose(sAvoid.getSeat().x, sAvoid.getSeat().y, s.getSeat().x, s.getSeat().y)) {
                    return false;
                }
            }

            if (s.frontRow) {
                if (s.getSeat().y != this.firstRow) {
                    return false;
                }
            }
            if (s.noBackRow) {
                if (s.getSeat().y == this.lastRow) {
                    return false;
                }
            }
        }
        return true;
    }
    //#endregion validation functions
}