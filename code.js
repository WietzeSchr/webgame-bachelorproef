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

    addSymmetrie() {
        var term = this.terms[randomInt(0, this.terms.length - 1)];
        for (var j = 0; j < this.terms.length; j++) {
            var differ = term.differAt(this.terms[j]);
            if (differ.length == 2) {
                var i = randomInt(0,1);
                this.removeTerm(term);
                term.flip(differ[i]);
                this.addTerm(term);
                return;
            }
        }
        for (var j = 0; j < this.terms.length; j++) {
            var differ = term.differAt(this.terms[j]);
            if (differ.length == 3) {
                var i = randomInt(0,2);
                this.removeTerm(term);
                term.flip(differ[i]);
                this.addTerm(term);
                return;
            }
        }
        
    }

    removeSymmetrie(solution) {
        var min = [new pterm([1,1,1])]
        for (var i = 0; i < solution.terms.length; i++) {
            if (solution.terms[i].countVal(-1) > min[0].countVal(-1)) {
                min = [solution.terms[i]];
            }
            else if (solution.terms[i].countVal(-1) == min[0].countVal(-1)) {
                min = min + [solution.terms[i]];
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
        var j = randomInt(0, v.length - 1);
        if (le.terms[i].term[j] == 0) {
            this.changeTerm(le.terms[i], j, 1);
        }
        else {
            this.changeTerm(le.terms[i], j, 0);
        }
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
    answer.removeTerm(activeTerm);
    activeTerm = new pterm(Array(varCount).fill(-1));
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
        var pstart = problem.terms.length;
        var poptimal = sol.terms.length;
        var panswer = answer.terms.length;
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
    while (newIter) {
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
//  GENERATOR   //      Genereren van een oplossing die dan wordt ge-expand naar het volledig probleem
//////////////////

function generateBeginner()
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
            problem.addSymmetrie();
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length > 3) {
            problem.addSymmetrie();
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

function generateEasy()
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
            problem.addSymmetrie();
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length > 6) {
            problem.addSymmetrie();
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

function generateMedium()
{
    varCount = 5;
    var termCount = randomInt(14,23);
    var possibleTerms = generateAllTerms();
    problem = generateRandom(termCount, possibleTerms);
    sol = solve(problem);
    var valid = false;
    while (! valid) {
        valid = true;
        if (sol.terms.length >= problem.terms.length - 3) {
            problem.addSymmetrie();
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length > 8) {
            problem.addSymmetrie();
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length > problem.terms.length * 3 / 5) {
            problem.addSymmetrie();
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length < 5) {
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
    varCount = 6;
    var termCount = randomInt(24,38);
    var possibleTerms = generateAllTerms();
    problem = generateRandom(termCount, possibleTerms);
    sol = solve(problem);
    var valid = false;
    while (! valid) {
        valid = true;
        if (sol.terms.length >= problem.terms.length - 5) {
            problem.addSymmetrie();
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length > 13) {
            problem.addSymmetrie();
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length > problem.terms.length / 2) {
            problem.addSymmetrie();
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length < 7) {
            problem.removeSymmetrie(sol);
            sol = solve(problem);
            valid = false;
        }
    }
    emptyAnswer();
    main()
}

function generateExpert()
{
    varCount = 7;
    var termCount = randomInt(44,80);
    var possibleTerms = generateAllTerms();
    problem = generateRandom(termCount, possibleTerms);
    sol = solve(problem);
    var valid = false;
    while (! valid) {
        valid = true;
        if (sol.terms.length >= problem.terms.length - 8) {
            problem.addSymmetrie();
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length > 32) {
            problem.addSymmetrie();
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length > problem.terms.length * 3 / 5) {
            problem.addSymmetrie();
            sol = solve(problem);
            valid = false;
        }
        else if (sol.terms.length < 15) {
            problem.removeSymmetrie(sol);
            sol = solve(problem);
            valid = false;
        }
    }
    emptyAnswer();
    main();
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