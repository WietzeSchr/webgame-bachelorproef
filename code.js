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
        var res = [this];
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
                res += i;
            }
        }
        return res;
    }

    toHTML()
    {
        var  res = ""
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
        this.length = pterms.length;
    }

    removeTerm(term)
    {
        for (var i = 0; i < this.length; i++)
        {
            if (this.terms[i].equal(term))
            {
                this.terms.splice(i,i);
                this.length -= 1;
            }
        }
    }

    addTerm(term)
    {
        if (! this.containsTerm(term))
        {
            this.terms.push(term);
            this.length += 1;
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
        for (var i = 0; i < this.length; i++)
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
        for (var i = 0; i < this.length; i++)
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
        for (var i = 0; i < this.length; i++)
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
        for (var i = 0; i < this.length; i ++)
        {
            if (this.terms[i].equal(term))
            {
                return true;
            }
        }
        return false;
    }

    notExpanded()
    {
        for (var i = 0; i < this.length; i++)
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
        for (var i = 0; i < this.length; i++)
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
        for (var i = 0; i < this.length; i++)
        {
            if (i % 2 == 1)
            {
                res += `<tr class="alternativeRow">`;
            }
            else
            {
                res += `<tr>`;
            }
            for (var j = 0; j < varCount; j++)
            {
                res += `<td>${this.terms[i].term[j]}</td>`
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
            for (var i = 0; i < this.length; i++)
            {
                var term = this.terms[i];
                res += term.toHTML();
                if (i != this.length - 1 || activeTerm.countVal(-1) != activeTerm.length)
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
        if (lother.length != this.length)
        {
            return false;
        }
        for (var i = 0; i < this.length; i ++)
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
        for (var i = 0; i < this.length; i++)
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
    document.getElementById("win").innerHTML = `<thead><th>You win !<th></thead>`;
    document.getElementById("win").innerHTML += `<tbody><tr><td class ="wonButton"><button onclick="emptyAnswer()">Restart</button></td></tr></tbody>`;
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
//  GENERATOR   //      Genereren van een oplossing die dan wordt ge-expand naar het volledig probleem
//////////////////

function generateBeginner()
{
    varCount = 3;
    var termCount = randomInt(2,3);
    sol = generateRandom(termCount, 1.35, 1.75);
    problem = sol.deepcopy();
    problem = problem.genExpanded();
    emptyAnswer();
    main();
}

function generateEasy()
{
    varCount = 4;
    var termCount = randomInt(3,6);
    sol = generateRandom(termCount, 1.25, 2.70);
    problem = sol.deepcopy();
    problem = problem.genExpanded();
    emptyAnswer();
    main();
}

function generateMedium()
{
    varCount = 5;
    var termCount = randomInt(6,13);
    sol = generateRandom(termCount, 1, 3.5);
    problem = sol.deepcopy();
    problem = problem.genExpanded();
    emptyAnswer();
    main();
}

function generateHard()
{
    varCount = 6;
    var termCount = randomInt(11, 22);
    sol = generateRandom(termCount, 1.25, 4);
    problem = sol.deepcopy();
    problem = problem.genExpanded();
    emptyAnswer();
    main()
}

function generateExpert()
{
    varCount = 7;
    var termCount = randomInt(15, 32);
    var res = generateRandom(termCount, 1.35, 3.5);
    sol = res;
    problem = sol.deepcopy();
    problem = problem.genExpanded();
    emptyAnswer();
    main();
}

function generateTerm(exp, avgVarStart, avgVarEnd)
{
    var term = new pterm(Array(varCount).fill(-1))
    for (var i = 0; i < varCount; i++)
    {
        term.setVar(i, randomInt(-1,1));
    }
    if (! between(exp.avgVar(), avgVarStart, avgVarEnd))
    {
        while (between(term.countVal(-1), varCount - avgVarEnd, varCount - avgVarStart))
        {
            term.setVar(randomInt(0,varCount - 1), -1);
        }
    }
    return term;
}

function generateRandom(terms, avgVarStart, avgVarEnd)
{
    res = new lexp([]);
    for (var i = 0; i < terms;)
    {
        var term = generateTerm(res, avgVarStart, avgVarEnd);
        if (! res.includesTerm(term) && res.findIncludedTerm(term) == undefined)
        {
            var minimalize = false;
            for (var j = 0; j < res.length; j++)
            {
                if (res.terms[j].differAt(term).length == 1)
                {
                    minimalize = true;
                }
            }
            if (! minimalize)
            {
                res.addTerm(term);
                i++;
            }
        }
    }
    return res
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