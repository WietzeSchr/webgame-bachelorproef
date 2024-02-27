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
        return new pterm(this.term.copy);
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
        var newTerms = []
        for (i = 0; i < this.length; i++)
        {
            newTerms.push(this.terms[i].copy());
        }
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

function main()
{
    document.getElementById("answer").innerHTML = answer.toHTML();
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