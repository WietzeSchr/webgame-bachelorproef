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

    equal(pother)
    {
        return equalArr(this.term, pother.term);
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
        for (i = 0; i < this.length; i++)
        {
            if (this.term[i] != pother.term[i])
            {
                res += i;
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
}

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
}

function copyList(list)
{
    var res = Array(list.length)
    for (var i = 0; i < list.length; i++)
    {
        res[i] = list[i];
    }
    return res;
}

function addToTerm(n)
{
    if (n < 0)
    {
        activeTerm.setVar(-(n+1), 0);
    }
    else
    {
        activeTerm.setVar(n - 1, 1);
    }
    main();
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

function emptyAnswer()
{
    answer = new lexp([]);
    activeTerm = new pterm(Array(varCount).fill(-1));
    main();
}


varCount = 3;
answer = new lexp([]);
activeTerm = new pterm(Array(varCount).fill(-1));
problem = new lexp([new pterm([-1,1,-1]), new pterm([1,-1,0])]);
sol = problem.deepcopy();
problem = problem.genExpanded();

function main()
{
    document.getElementById("answer").innerHTML = answer.toHTML();
    document.getElementById("problem").innerHTML = problem.toHTML();
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