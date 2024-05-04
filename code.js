/////////////////////
//  CLASS PTERM    //
/////////////////////

class pterm
{
    constructor(vars)
    {
        this.term = vars;
        this.length = vars.length
    }

    setVar(i, ni)
    {
        this.term[i] = ni;
    }

    countVal(n)
    {
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

    expand()
    {
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

    includes(pother)
    {
        for (var i = 0; i < this.length; i++)
        {
            if (this.term[i] != pother.term[i] && this.term[i] != -1)
            {
                return false;
            }
        }
        return false;
    }

    differAt(pother)
    {
        var res = [];
        for (var i = 0; i < this.length; i++)
        {
            if (this.term[i] != pother.term[i] && (this.term[i] != -1 || pother.term[i]  != -1))
            {
                res.push(i);
            }
        }
        return res;
    }

    getVarIndex() {
        var res = [];
        for (var i = 0; i < this.length; i++) {
            if (this.term[i] == 0 || this.term[i] == 1) {
                res[res.length] = i;
            }
        }
        return res;
    }

    flip(i)
    {
        if (this.term[i] == 0) {
            this.setVar(i, 1);
        }
        else if (this.term[i] == 1) {
            this.setVar(i, 0);
        }
    }

    toHTML()
    {
        var  res = "";
        for (var i = 0; i < this.length; i++)
        {
            if (this.term[i] == 1)
            {
                res += `x<sub>${i + 1}</sub>`;
            }
            else if (this.term[i] == 0)
            {
                res += `x'<sub>${i + 1}</sub>`;
            }
        }
        return res;
    }

    copy()
    {
        return new pterm(copyList(this.term));
    }

    equal(pother)
    {
        return equalArr(this.term, pother.term);
    }
}

//////////////////////
//   CLASS LEXP     //
//////////////////////

class lexp
{
    constructor(pterms)
    {
        this.terms = pterms;
    }

    removeTerm(term)
    {
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

    addTerm(term)
    {
        if (! this.containsTerm(term))
        {
            this.terms.push(term);
        }
    }

    changeTerm(term, i, ni)
    {
        this.removeTerm(term);
        term.setVar(i, ni);
        this.addTerm(term);
    }

    avgVar()
    {
        var varCounter = 0;
        for (var i = 0; i < this.terms.length; i++)
        {
            varCounter += varCount - this.terms[i].countVal(-1);
        }
        if (this.length != 0)
        {
            return varCounter / this.length;
        }
        return 0;
    }

    includesTerm(term)
    {
        for (var i = 0; i < this.terms.length; i++)
        {
            if (this.terms[i].includes(term))
            {
                return true;
            }
        }
        return false;
    }

    findIncludedTerm(term)
    {
        for (var i = 0; i < this.terms.length; i++)
        {
            if (term.includes(this.terms[i]))
            {
                return this.terms[i];
            }
        }
        return undefined;
    }

    containsTerm(term)
    {
        for (var i = 0; i < this.terms.length; i++)
        {
            if (this.terms[i].equal(term))
            {
                return true;
            }
        }
        return false;
    }

    addSymmetrie(solution) {
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
        var found = false;
        while (! found && possibleTerms.terms.length > 0) {
            var j = randomInt(0, possibleTerms.terms.length - 1);
            var term = possibleTerms.terms[j].copy();
            for (var i = 0; i < termsCopy.terms.length; i++) {
                var differ = term.differAt(termsCopy.terms[i]);
                if (differ.length == 2) {
                    var k = randomInt(0, 1);
                    term.flip(differ[k]);
                    if (! this.containsTerm(term)) {
                        this.removeTerm(possibleTerms.terms[j]);
                        this.addTerm(term);
                        found = true;
                        break;
                    }
                    else {
                        term.flip(differ[k]);
                        if (k == 1) {
                            term.flip(differ[0]);
                            if (! this.containsTerm(term)) {
                                this.removeTerm(possibleTerms.terms[j]);
                                this.addTerm(term);
                                found = true;
                                break;
                            }
                            term.flip(differ[0]);
                        }
                        else {
                            term.flip(differ[1]);
                            if (! this.containsTerm(term)) {
                                this.removeTerm(possibleTerms.terms[j]);
                                this.addTerm(term);
                                found = true;
                                break;
                            }
                            term.flip(differ[1]);
                        }
                    }
                }
            }
            possibleTerms.removeTerm(possibleTerms.terms[j]);
        }
        le = solCopy.genExpanded();
        possibleTerms = problem.deepcopy();
        for (var i = 0; i < le.terms.length; i++) {
            possibleTerms.removeTerm(le.terms[i]);
        }
        while (! found && possibleTerms.terms.length > 0) {
            var j = randomInt(0, possibleTerms.terms.length - 1)
            var term = possibleTerms.terms[j].copy();
            for (var i = 0; i < termsCopy.terms.length; i++) {
                var differ = term.differAt(termsCopy.terms[i]);
                if (differ.length == 3) {
                    var k = randomInt(1,2);
                    term.flip(0);
                    term.flip(k);
                    if (! this.containsTerm(term)) {
                        this.removeTerm(possibleTerms.terms[j]);
                        this.addTerm(term);
                        found = true;
                        break;
                    }
                }
            }
            possibleTerms.removeTerm(possibleTerms.terms[j]);
        }
        if (! found) {
            this.flipRandom();
        }
    }

    flipRandom() {
        var possibleTerms = generateAllTerms();
        for (var i = 0; i < this.terms.length; i++) {
            possibleTerms.removeTerm(this.terms[i]);
        }
        var randomRemove = randomInt(0, this.terms.length - 1);
        this.removeTerm(this.terms[randomRemove]);
        var randomAdd = randomInt(0, possibleTerms.terms.length - 1);
        this.addTerm(possibleTerms.terms[randomAdd]);
    }

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
        this.break(min[j]);
    }

    break(minTerm) {
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
            v.splice(j, 1);
        }
        this.flipRandom();
    }

    countPorts() {
        var orPorts = this.terms.length - 1;
        var andPorts = 0;
        for (var i = 0; i < this.terms.length; i++) {
            andPorts += varCount - this.terms[i].countVal(-1) + 1;
        }
        return orPorts + andPorts;
    }

    notExpanded()
    {
        for (var i = 0; i < this.terms.length; i++)
        {
            if (this.terms[i].countVal(-1) > 0)
            {
                return true;
            }
        }
        return false;
    }

    genExpanded()
    {
        var res = new lexp([]);
        for (var i = 0; i < this.terms.length; i++)
        {
            if (this.terms[i].countVal(-1) > 0)
            {
                var expTerms = this.terms[i].expand();
                res.addTerm(expTerms[0]);
                res.addTerm(expTerms[1]);
            }
            else
            {
                res.addTerm(this.terms[i].copy());    
            }
        }
        if (res.notExpanded())
        {
            return res.genExpanded();
        }
        return res;
    }

    toTableHTML()
    {
        var res = "";
        var fullAnswer = answer.genExpanded();
        for (var i = 0; i < this.terms.length; i++)
        {
            if (fullAnswer.containsTerm(this.terms[i])) {
                fullAnswer.removeTerm(this.terms[i]);
                if (i % 2 == 1)
                {
                    res += `<tr class="found">`;
                }
                else
                {
                    res += `<tr class="alternativeRowFound">`;
                }
            }
            else {
                if (i % 2 == 1)
                {
                    res += `<tr class="alternativeRow">`;
                }
                else
                {
                    res += `<tr>`;
                }
            }
            for (var j = 0; j < varCount; j++)
            {
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
            for (var j = 0; j < varCount; j++)
            {
                res += `<td>${fullAnswer.terms[i].term[j]}</td>`
            }
            res += `</tr>`;
        }      
        return res;
    }

    toHTML()
    {
        var res = "";
        res += "Answer    : "
        if (this.length == 0)
        {
            res += "...";
            res += "<br>Active term: "
            res += activeTerm.toHTML();
        }
        else
        {
            for (var i = 0; i < this.terms.length; i++)
            {
                var term = this.terms[i];
                res += term.toHTML();
                if (i != this.terms.length - 1 || activeTerm.countVal(-1) != activeTerm.length)
                {
                    res += " + ";
                }
            }
            res += "<br>Active term:"
            res += activeTerm.toHTML();
        }
        return res;
    }

    equal(lother)
    {
        if (lother.terms.length != this.terms.length)
        {
            return false;
        }
        for (var i = 0; i < this.terms.length; i ++)
        {
            if (! this.containsTerm(lother.terms[i]))
            {
                return false;
            }
        }
        return true;
    }

    deepcopy()
    {
        var newExp = new lexp([])
        for (var i = 0; i < this.terms.length; i++)
        {
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


function main()
{
    createHeader();
    document.getElementById("problem").innerHTML = problem.toTableHTML();
    document.getElementById("answer").innerHTML = answer.toHTML();
    if (! checkWin())
    {
        createButtons();
        clearWin();
    }
    else
    {
        clearButtons();
        wonGame();
    }
}

function pushTerm()
{
    answer.addTerm(activeTerm);
    activeTerm = new pterm(Array(varCount).fill(-1));
    main();
}

function delTerm()
{
    answer.removeTerm(answer.terms[answer.terms.length - 1]);
    //activeTerm = new pterm(Array(varCount).fill(-1));
    main();
}

function emptyAnswer()
{
    answer = new lexp([]);
    activeTerm = new pterm(Array(varCount).fill(-1));
    main();
}

function addToTerm(n)
{
    if (n < 0)
    {
        if (activeTerm.term[-(n+1)] != 0)
        {
            activeTerm.setVar(-(n+1), 0);
        }
        else
        {
            activeTerm.setVar(-(n+1), -1);
        }
    }
    else
    {
        if (activeTerm.term[n-1] != 1)
        {
            activeTerm.setVar(n-1, 1);
        }
        else
        {
            activeTerm.setVar(n-1, -1);
        }
    }
    main();
}

function checkWin()
{
    var extendedAnswer = answer.deepcopy();
    extendedAnswer = answer.genExpanded();
    if (extendedAnswer.equal(problem))
    {
        return true;
    }
    return false;
}

function wonGame()
{
    var score = calculateScore();
    document.getElementById("win").innerHTML = `<thead><th>You win - score : ${score}/100<th></thead>`;
    document.getElementById("win").innerHTML += `<tbody><tr><td class ="wonButton"><button onclick="emptyAnswer()">Restart</button></td></tr></tbody>`;
}

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

function clearWin()
{
    document.getElementById("win").innerHTML = "";
}

function clearButtons()
{
    document.getElementById("buttons").innerHTML = ""
}


//////////////////
//  MC CLUSKEY  //
//////////////////

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

function reduce(term, i) {
    var result = term.copy();
    result.term[i] = -1;
    return result;
}

//////////////////
//  GENERATOR   //
//////////////////

function generateEasy()
{
    varCount = 3;
    var termCount = randomInt(3,6);
    var possibleTerms = generateAllTerms();
    problem = generateRandom(termCount, possibleTerms);
    sol = solve(problem);
    var valid = false;
    while (! valid) {
        valid = true;
        if (sol.terms.length == problem.terms.length) {
            problem.addSymmetrie(sol);
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length > 3) {
            problem.addSymmetrie(sol);
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length == 1) {
            problem.removeSymmetrie(sol);
            sol = solve(problem);
            valid = false;
        }
    }
    emptyAnswer();
    main();
}

function generateMedium()
{
    varCount = 4;
    var termCount = randomInt(7,12);
    var possibleTerms = generateAllTerms();
    problem = generateRandom(termCount, possibleTerms);
    sol = solve(problem);
    var valid = false;
    while (! valid) {
        valid = true;
        if (sol.terms.length >= problem.terms.length - 1) {
            problem.addSymmetrie(sol);
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length > 6) {
            problem.addSymmetrie(sol);
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length < 3) {
            problem.removeSymmetrie(sol);
            sol = solve(problem);
            valid = false;
        }
    }
    emptyAnswer();
    main();
}

function generateHard()
{
    varCount = 5;
    var termCount = randomInt(13,22);
    var possibleTerms = generateAllTerms();
    problem = generateRandom(termCount, possibleTerms);
    sol = solve(problem);
    var valid = false;
    while (! valid) {
        valid = true;
        if (sol.terms.length >= problem.terms.length - 5) {
            problem.addSymmetrie(sol);
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length > 11) {
            problem.addSymmetrie(sol);
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length > problem.terms.length * 3 / 5) {
            problem.addSymmetrie(sol)
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length < 6) {
            problem.removeSymmetrie(sol);
            sol = solve(problem);
            valid = false;
        }
    }
    emptyAnswer();
    main();
}

function generateExpert()
{
    varCount = 6;
    var termCount = randomInt(25, 45);
    var possibleTerms = generateAllTerms();
    problem = generateRandom(termCount, possibleTerms);
    sol = solve(problem);
    var valid = false;
    while (! valid) {
        valid = true;
        if (sol.terms.length >= problem.terms.length - 8) {
            problem.addSymmetrie(sol)
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length > 22) {
            problem.addSymmetrie(sol)
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length < 11) {
            problem.removeSymmetrie(sol);
            sol = solve(problem);
            valid = false;
        }
    }
    emptyAnswer();
    main()
}

function generateRandom(termCount, possibleTerms)
{
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

function generateAllTerms() {
    var l = new lexp([new pterm(new Array(varCount).fill(-1))]);
    return l.genExpanded();
}

//////////////////
//    HTML      //
//////////////////

function createHeader()
{
    var res = `<tr>`;
    for (var i = 0; i < varCount; i++)
    {
        res += `<th>x<sub>${i+1}</sub></th>`;
    }
    res += `</tr>`;
    document.getElementById("fixedHeader").innerHTML = res;
}

function createButtons()
{
    var res = "<tr>";
    for (var i = 0; i < varCount; i++)
    {
        res += `<td><button onclick="addToTerm(${i + 1})">x<sub>${i+1}</sub></button></td>`;
    }
    res += `</tr><tr>`;
    for (i = 0; i < varCount; i++)
    {
        res += `<td><button onclick="addToTerm(${-(i + 1)})">x'<sub>${i+1}</sub></button></td>`;
    }
    res += `</tr>`;
    document.getElementById("buttons").innerHTML = res;
}

//////////////////////
//   EXTRA FUNCS    //
//////////////////////

function copyList(list)
{
    var res = Array(list.length)
    for (var i = 0; i < list.length; i++)
    {
        res[i] = list[i];
    }
    return res;
}

function equalArr(arr1, arr2)
{
    if (arr1.length != arr2.length)
    {
        return false;
    }
    for (var i = 0; i < arr1.length; i++)
    {
        if (arr1[i] != arr2[i])
        {
            return false;
        }   
    }
    return true;
}

function randomInt(start, end)
{
    var multiplier = end - start + 1;
    return start + Math.floor(Math.random() * multiplier);
}

function between(i, start, end)
{
    if (i < start || i > end)
    {
        return false;
    }
    return true;
}