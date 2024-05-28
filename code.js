/////////////////////
//  CLASS PTERM    //
/////////////////////
class pterm {

    //  This constructor creates a new pterm with term vars
    constructor(vars) {
        this.term = vars;
        this.length = vars.length
    }

    //  This method sets var i to ni
    setVar(i, ni) {
        this.term[i] = ni;
    }

    //  This method returns the amount of variables with value n
    countVal(n) {
        var res = 0;
        for (var i = 0; i < this.length; i++)
        {
            if (this.term[i] == n)
            {
                res += 1;
            }
        }
        return res;
    }

    //  This method returns a list with two new pterms if this pterm contains at least one -1 value.
    //  One of them is this pterm with a -1 value set to 0 and the other pterm is this pterm with the same -1 set to 1
    expand() {
        var found = false;
        for (var i = 0; i < this.length && !found; i++)
        {
            if (this.term[i] == -1)
            {
                var r1 = this.copy();
                r1.setVar(i, 0);
                var r2 = this.copy();
                r2.setVar(i, 1);
                found = true;
            }
        }
        if (! found)
        {
            return [];
        }
        return [r1, r2];
    }

    //  This method returns a list of all indices where this term differs from term pother
    differAt(pother) {
        var res = [];
        for (var i = 0; i < this.length; i++) {
            if (this.term[i] != pother.term[i] && (this.term[i] != -1 || pother.term[i]  != -1)) {
                res.push(i);
            }
        }
        return res;
    }

    //  This method returns all indices of variables that are either true (= 1) or false (= 0)
    getVarIndex() {
        var res = [];
        for (var i = 0; i < this.length; i++) {
            if (this.term[i] == 0 || this.term[i] == 1) {
                res[res.length] = i;
            }
        }
        return res;
    }

    //  This method flips the variable at index i. If variable i = true -> variable i becomes false and otherwise
    //  If variable i doesn't matter (= -1) this method does nothing
    flip(i) {
        if (this.term[i] == 0) {
            this.setVar(i, 1);
        }
        else if (this.term[i] == 1) {
            this.setVar(i, 0);
        }
    }

    //  This method returns a string to show this pterm inn HTML
    toHTML() {
        var  res = "";
        for (var i = 0; i < this.length; i++) {
            if (this.term[i] == 1) {
                res += `x<sub>${i + 1}</sub>`;
            }
            else if (this.term[i] == 0) {
                res += `x'<sub>${i + 1}</sub>`;
            }
        }
        return res;
    }

    //  This method returns a copy of this pterm
    copy() {
        return new pterm(copyList(this.term));
    }

    //  This method returns true if this pterms equals pother
    equal(pother) {
        return equalArr(this.term, pother.term);
    }
}

//////////////////////
//   CLASS LEXP     //
//////////////////////
class lexp {

    //  This constructor creates a new logic expression with the given pterms
    //  pterms should be a list op pterms
    constructor(pterms) {
        this.terms = pterms;
    }

    //  This method removes the given term from this expression
    removeTerm(term) {
        for (var i = 0; i < this.terms.length; i++) {
            if (this.terms[i].equal(term)) {
                var newTerms = [];
                for (var j = 0; j < this.terms.length; j++) {
                    if (j != i) {
                        newTerms.push(this.terms[j]);
                    }
                }
                this.terms = newTerms;
                break;
            }
        }
    }

    //  This method adds a new term to the expression. If the expression already contains this term,
    //  this method does nothing
    addTerm(term) {
        if (! this.containsTerm(term)) {
            this.terms.push(term);
        }
    }

    //  This method changes the given term in the expression by changes variable i to ni
    changeTerm(term, i, ni) {
        if (this.containsTerm(term)) {
            this.removeTerm(term);
            term.setVar(i, ni);
            this.addTerm(term);
        }
    }

    //  This method returns true if this expression already contains a pterm equal to the given term
    containsTerm(term) {
        for (var i = 0; i < this.terms.length; i++) {
            if (this.terms[i].equal(term)) {
                return true;
            }
        }
        return false;
    }

    //  This method adds symetry to the problem, resulting in less terms after minimization
    addSymmetrie(solution) {
        //  vindt kandidaten
        var termsCopy = this.deepcopy();
        var max = [new pterm(new Array(varCount).fill(-1))];
        for (var i = 0; i < solution.terms.length; i++) {
            if (solution.terms[i].countVal(-1) < max[0].countVal(-1)) {
                max = [solution.terms[i]];
            }
            else if (solution.terms[i].countVal(-1) == max[0].countVal(-1)) {
                max.push(solution.terms[i]);
            }
        }
        var solCopy = solution.deepcopy();
        for (var i = 0; i < max.length; i++) {
            solCopy.removeTerm(max[i]);
        }
        var le = solCopy.genExpanded();
        var possibleTerms = problem.deepcopy();
        for (var i = 0; i < le.terms.length; i++) {
            possibleTerms.removeTerm(le.terms[i]);
        }

        //  Zoek mogelijke flip
        for (var i = 0; i < possibleTerms.terms.length; i++) {
            var kandidaat = possibleTerms.terms[i];
            for (var j = 0; j < problem.terms.length; j++) {
                var differ = kandidaat.differAt(problem.terms[j]);
                if (differ.length == 2) {
                    var kandidaatCopy = kandidaat.copy();
                    i = randomInt(0, 1);
                    if (i == 1) {
                        kandidaatCopy.flip(differ[1]);
                        if (! problem.containsTerm(kandidaatCopy)) {
                            problem.removeTerm(kandidaat);
                            problem.addTerm(kandidaatCopy);
                            return;
                        }
                        kandidaatCopy = kandidaat.copy();
                        kandidaatCopy.flip(differ[0]);
                        if (! problem.containsTerm(kandidaatCopy)) {
                            problem.removeTerm(kandidaat);
                            problem.addTerm(kandidaatCopy);
                            return;
                        }
                    }
                    else {
                        kandidaatCopy.flip(differ[0]);
                        if (! problem.containsTerm(kandidaatCopy)) {
                            problem.removeTerm(kandidaat);
                            problem.addTerm(kandidaatCopy);
                            return;
                        }
                        kandidaatCopy = kandidaat.copy();
                        kandidaatCopy.flip(differ[1]);
                        if (! problem.containsTerm(kandidaatCopy)) {
                            problem.removeTerm(kandidaat);
                            problem.addTerm(kandidaatCopy);
                            return;
                        }
                    }
                }
            }
        }

        var possibleRemoveTerms = problem.deepcopy();
        for (var i = 0; i < le.terms.length; i++) {
            possibleRemoveTerms.removeTerm(le.terms[i]);
        }
        var possibleAddTerms = generateAllTerms();
        for (var i = 0; i < this.terms.length; i++) {
            possibleAddTerms.removeTerm(problem.terms[i]);
        }
        this.removeAndAddRandom(possibleRemoveTerms, possibleAddTerms);
    }

    //  This method removes symetry from the expression resulting in more terms after minimization
    removeSymmetrie(solution) {
        var min = [new pterm(new Array(varCount).fill(1))];
        for (var i = 0; i < solution.terms.length; i++) {
            if (solution.terms[i].countVal(-1) > min[0].countVal(-1)) {
                min = [solution.terms[i]];
            }
            else if (solution.terms[i].countVal(-1) == min[0].countVal(-1)) {
                min.push(solution.terms[i]);
            }
        }
        var j = randomInt(0, min.length - 1);
        this.breakTerm(min[j]);
    }

    //  This method flips a random variable in a random term included by the given minTerm.
    //  This makes sure that minTerm can't be part of the expression after minimization
    breakTerm(minTerm) {
        var v = minTerm.getVarIndex();
        var e = new lexp([minTerm]);
        var le = e.genExpanded();
        var i = randomInt(0, le.terms.length - 1);
        while (v.length > 0) {
            var j = randomInt(0, v.length - 1);
            while (le.length > 1) {
                var oldTerm = le.terms[i].copy();
                var newTerm = le.terms[i].flip(v[j]);
                if (! this.containsTerm(newTerm)) {
                    this.removeTerm(oldTerm);
                    this.addTerm(newTerm);
                    return;
                }
            }
            le = e.genExpanded();
            v.splice(j, 1);
        }
        var possibleRemoveTerms = e.genExpanded();
        var possibleAddTerms = generateAllTerms;
        for (var i = 0; i < this.terms.length; i++) {
            possibleAddTerms.removeTerm(this.terms[i]);
        }
        this.removeAndAddRandom(possibleRemoveTerms, possibleAddTerms);
    }

    removeAndAddRandom(possibleRemoveTerms, possibleAddTerms) {
        var removeIndex = randomInt(0, possibleRemoveTerms.length - 1);
        var addIndex = randomInt(0, possibleAddTerms.length - 1);
        this.removeTerm(this.terms[removeIndex]);
        this.addTerm(this.terms[addIndex]);
    }

    //  This method counts the total of AND and OR ports needed, to make this expression as an electrical circuit
    countPorts() {
        var orPorts = this.terms.length - 1;
        var andPorts = 0;
        for (var i = 0; i < this.terms.length; i++) {
            andPorts += varCount - this.terms[i].countVal(-1) + 1;
        }
        return orPorts + andPorts;
    }

    //  This method returns true if this expression contains no terms that have a don't matter variable
    notExpanded() {
        for (var i = 0; i < this.terms.length; i++) {
            if (this.terms[i].countVal(-1) > 0) {
                return true;
            }
        }
        return false;
    }

    //  This method returns a new LExp that represents the same circuit, but with all terms having all variables
    //  either true (= 1) or false (= 0)    -> (no -1 variables)
    genExpanded() {
        var res = new lexp([]);
        for (var i = 0; i < this.terms.length; i++) {
            if (this.terms[i].countVal(-1) > 0) {
                var expTerms = this.terms[i].expand();
                res.addTerm(expTerms[0]);
                res.addTerm(expTerms[1]);
            }
            else {
                res.addTerm(this.terms[i].copy());    
            }
        }
        if (res.notExpanded()) {
            return res.genExpanded();
        }
        return res;
    }

    //  This method returns a string in HTML format to show this expression in a table
    toTableHTML() {
        var res = "";
        var fullAnswer = answer.genExpanded();
        for (var i = 0; i < this.terms.length; i++) {
            if (fullAnswer.containsTerm(this.terms[i])) {
                fullAnswer.removeTerm(this.terms[i]);
                if (i % 2 == 1) {
                    res += `<tr class="found">`;
                }
                else {
                    res += `<tr class="alternativeRowFound">`;
                }
            }
            else {
                if (i % 2 == 1) {
                    res += `<tr class="alternativeRow">`;
                }
                else {
                    res += `<tr>`;
                }
            }
            for (var j = 0; j < varCount; j++) {
                res += `<td>${this.terms[i].term[j]}</td>`
            }
            res += `</tr>`;
        }
        for (var i = 0; i < fullAnswer.terms.length; i++) {
            if (i % 2 == 1) {
                res += `<tr class="wrong">`;
            }
            else {
                res += `<tr class="alternativeRowWrong">`;
            }
            for (var j = 0; j < varCount; j++) {
                res += `<td>${fullAnswer.terms[i].term[j]}</td>`
            }
            res += `</tr>`;
        }      
        return res;
    }

    //  This method returns a string in HTML format to show this expression as formula
    toHTML() {
        var res = "";
        res += "Answer    : "
        if (this.length == 0) {
            res += "...";
            res += "<br>Active term: "
            res += activeTerm.toHTML();
        }
        else {
            for (var i = 0; i < this.terms.length; i++) {
                var term = this.terms[i];
                res += term.toHTML();
                if (i != this.terms.length - 1 || activeTerm.countVal(-1) != activeTerm.length) {
                    res += " + ";
                }
            }
            res += "<br>Active term:"
            res += activeTerm.toHTML();
        }
        return res;
    }

    //  This method returns true if this expression has the same terms as lother
    //  lother should be a logic expression
    equal(lother) {
        if (lother.terms.length != this.terms.length) {
            return false;
        }
        for (var i = 0; i < this.terms.length; i ++) {
            if (! this.containsTerm(lother.terms[i])) {
                return false;
            }
        }
        return true;
    }

    deepcopy() {
        var newExp = new lexp([])
        for (var i = 0; i < this.terms.length; i++) {
            newExp.addTerm(this.terms[i].copy());
        }
        return newExp;
    }
}


//////////////////////
//     THE GAME     //
//////////////////////

varCount = 3;
answer = new lexp([]);
activeTerm = new pterm(Array(varCount).fill(-1));
problem = new lexp([new pterm([-1,1,-1]), new pterm([1,-1,0])]);
sol = problem.deepcopy();
problem = problem.genExpanded();


function main() {
    createHeader();
    document.getElementById("problem").innerHTML = problem.toTableHTML();
    document.getElementById("answer").innerHTML = answer.toHTML();
    if (! checkWin()) {
        createButtons();
        clearWin();
    }
    else {
        clearButtons();
        wonGame();
    }
}

//  This method adds the current active term to the answer
function pushTerm() {
    answer.addTerm(activeTerm);
    activeTerm = new pterm(Array(varCount).fill(-1));
    main();
}

//  This method removes the last added term from the answer
function delTerm() {
    answer.removeTerm(answer.terms[answer.terms.length - 1]);
    main();
}

//  This method completely clears the answer
function emptyAnswer() {
    answer = new lexp([]);
    activeTerm = new pterm(Array(varCount).fill(-1));
    main();
}

//  This method adds a variable to the active term. If n > 0 it sets variable n to true
//  If n < 0 it sets variable -n to false
function addToTerm(n) {
    if (n < 0) {
        if (activeTerm.term[-(n+1)] != 0) {
            activeTerm.setVar(-(n+1), 0);
        }
        else {
            activeTerm.setVar(-(n+1), -1);
        }
    }
    else {
        if (activeTerm.term[n-1] != 1) {
            activeTerm.setVar(n-1, 1);
        }
        else {
            activeTerm.setVar(n-1, -1);
        }
    }
    main();
}

//  This method checks if the given answer is a valid answer for the given problem
function checkWin() {
    var extendedAnswer = answer.deepcopy();
    extendedAnswer = answer.genExpanded();
    if (extendedAnswer.equal(problem)) {
        return true;
    }
    return false;
}

//  This method shows the winning screen
function wonGame() {
    var score = calculateScore();
    document.getElementById("win").innerHTML = `<thead><th>You win - score : ${score}/100<th></thead>`;
    document.getElementById("win").innerHTML += `<tbody><tr><td class ="wonButton"><button onclick="emptyAnswer()">Restart</button></td></tr></tbody>`;
}

//  This method calculates the score
function calculateScore() {
    if (answer.equal(sol)) {
        return 100;
    }
    else {
        var pstart = problem.countPorts();
        var poptimal = sol.countPorts();
        var panswer = answer.countPorts();
        return Math.round((pstart - panswer) / (pstart - poptimal) * 100);
    }
}

//  This method clears the win screen
function clearWin() {
    document.getElementById("win").innerHTML = "";
}

//  This method removes the buttons
function clearButtons() {
    document.getElementById("buttons").innerHTML = ""
}


//////////////////
//  MC CLUSKEY  //
//////////////////

//  This method minimizes the given logic expression canExp using the Quine-McCluskey algorithm
function solve(canExp) {
    var newIter = true;
    while (newIter) {       // Combine all possible terms until no more minimization is possible
        var table = makeTable(canExp);
        var newTerms = canExp.deepcopy();
        for (var i = 0; i < varCount; i++) {
            for (var j = 0; j < table[i].length; j++) {
                for (var k = 0; k < table[i+1].length; k++) {
                    var differ = table[i][j].differAt(table[i+1][k]);
                    if (differ.length == 1) {
                        var term12 = reduce(table[i][j], differ[0]);
                        newTerms.removeTerm(table[i][j]);
                        newTerms.removeTerm(table[i+1][k]);
                        newTerms.addTerm(term12);
                    }
                }
            }
        }
        if (newTerms.equal(canExp)) {
            newIter = false;
        }
        else {
            canExp = newTerms;
        }
    }
    //  Determine essential prime implicants
    var termsCopy = problem.deepcopy();
    for (var i = 0; i < canExp.terms.length; i++) {
        var solCopy = canExp.deepcopy();
        solCopy.removeTerm(canExp.terms[i]);
        if (solCopy.genExpanded().equal(termsCopy)) {
            canExp.removeTerm(canExp.terms[i--]);
        }
    }
    return canExp;
}

//  This method makes a dictionary, sorting all pterms on the amount of variables that are true
function makeTable(canExp) {
    var res = {};
    for (var i = 0; i <= varCount; i++) {
        res[i] = [];
    }
    for (var i = 0; i < canExp.terms.length; i++) {
        var counti = canExp.terms[i].countVal(1);
        res[counti].push(canExp.terms[i]);
    }
    return res;
}

//  This method returns a new pterm equal to the given term, where variable i is set to don't matter (= -1)
function reduce(term, i) {
    var result = term.copy();
    result.term[i] = -1;
    return result;
}

//////////////////
//  GENERATOR   //
//////////////////

//  This method generates a random problem for the given level
function generateLevel(n) {
    varCount = n + 2;
    var minAmountTerms = Math.floor(Math.pow(2, varCount) * 0.4);
    var maxAmountTerms = Math.round(Math.pow(2, varCount) * 0.7);
    var termCount = randomInt(minAmountTerms, maxAmountTerms);
    problem = generateRandom(termCount);
    sol = solve(problem);
    var valid = false;
    while (! valid) {
        valid = true;
        if (sol.terms.length > problem.terms.length * 2 / 3) {
            problem.addSymmetrie(sol);
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length < problem.terms.length / 4) {
            problem.removeSymmetrie(sol);
            sol = solve(problem);
            valid = false;
        }
    }
    emptyAnswer();
    main();
}

//  This method generates a random expression with the given amount of terms
function generateRandom(termCount) {
    possibleTerms = generateAllTerms();
    var res = new lexp([]);
    for (var i = 0; i < termCount; i++)
    {
        var j = randomInt(0, possibleTerms.terms.length - 1);
        var term = possibleTerms.terms[j];
        res.addTerm(term);
        possibleTerms.removeTerm(term);
    }
    return res
}

//  This method generates all possible terms (variable combinations) for the current varCount
function generateAllTerms() {
    var l = new lexp([new pterm(new Array(varCount).fill(-1))]);
    return l.genExpanded();
}

//////////////////
//    HTML      //
//////////////////

//  This method creates a fixed header for the problem table
function createHeader() {
    var res = `<tr>`;
    for (var i = 0; i < varCount; i++)
    {
        res += `<th>x<sub>${i+1}</sub></th>`;
    }
    res += `</tr>`;
    document.getElementById("fixedHeader").innerHTML = res;
}

//  This method creates the buttons for the current varCount
function createButtons() {
    var res = "<tr>";
    for (var i = 0; i < varCount; i++) {
        res += `<td><button onclick="addToTerm(${i + 1})">x<sub>${i+1}</sub></button></td>`;
    }
    res += `</tr><tr>`;
    for (i = 0; i < varCount; i++) {
        res += `<td><button onclick="addToTerm(${-(i + 1)})">x'<sub>${i+1}</sub></button></td>`;
    }
    res += `</tr>`;
    document.getElementById("buttons").innerHTML = res;
}

//////////////////////
//   EXTRA FUNCS    //
//////////////////////

//  This method returns a copy of a given array list
function copyList(list) {
    var res = Array(list.length)
    for (var i = 0; i < list.length; i++) {
        res[i] = list[i];
    }
    return res;
}

//  This method returns true if the two given arrays arr1 and arr2 are equal
function equalArr(arr1, arr2) {
    if (arr1.length != arr2.length) {
        return false;
    }
    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] != arr2[i]) {
            return false;
        }   
    }
    return true;
}

//  This method returns a random integer between start and end
function randomInt(start, end) {
    var multiplier = end - start + 1;
    return start + Math.floor(Math.random() * multiplier);
}