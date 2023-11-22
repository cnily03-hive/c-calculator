const math = require('mathjs')

const rad2deg = (rad, pi) => rad / pi * 180

const scope_rad = {
    lg: math.log10,
    ln: math.log,
    sin: (x) => math.sin(math.unit(x, 'rad')),
    cos: (x) => math.cos(math.unit(x, 'rad')),
    tan: (x) => math.tan(math.unit(x, 'rad')),
    arcsin: (x) => math.asin(x),
    arccos: (x) => math.acos(x),
    arctan: (x) => math.atan(x),
    sqrt: math.sqrt,
    'π': math.pi,
}

const scope_deg = {
    lg: math.log10,
    ln: math.log,
    sin: (x) => math.sin(math.unit(x, 'deg')),
    cos: (x) => math.cos(math.unit(x, 'deg')),
    tan: (x) => math.tan(math.unit(x, 'deg')),
    arcsin: (x) => rad2deg(math.asin(x), math.pi),
    arccos: (x) => rad2deg(math.acos(x), math.pi),
    arctan: (x) => rad2deg(math.atan(x), math.pi),
    sqrt: math.sqrt,
    'π': math.pi,
}

function formatExpr(expression, seeEPlusNumAsTenPower = false) {
    let expr = ''
    let i = 0;
    while (i < expression.length) {
        if (expression[i] === '√') {
            if (i + 1 < expression.length && expression[i + 1] === '(') {
                expr += 'sqrt'
                ++i
            } else {
                expr += 'sqrt('
                ++i
                while (i < expression.length && /[\d.]/.test(expression[i])) {
                    expr += expression[i]
                    ++i
                }
                expr += ')'
            }
        } else if (expression[i] === '×') {
            expr += '*'
            ++i
        } else if (expression[i] === '÷') {
            expr += '/'
            ++i
        } else if (expression[i] === 'π') {
            expr += '(π)'
            ++i;
        } else if (expression[i] === 'e') {
            if (i + 1 < expression.length && /[\d]/.test(expression[i + 1])) expr += 'e'
            else if (i - 1 >= 0 && i + 2 < expression.length && /[\d]/.test(expression[i - 1]) && (seeEPlusNumAsTenPower ? /[-+]/ : /[-]/).test(expression[i + 1]) && /[\d]/.test(expression[i + 2])) expr += 'e'
            else expr += '(e)'
            ++i;
        } else {
            expr += expression[i]
            ++i;
        }
    }
    // add quote
    let unclosing = 0, append_start = "", append_end = "";
    for (let i = 0; i < expr.length; ++i) {
        let c = expr[i]

        if (c === '(') {
            ++unclosing
        } else if (c === ')') {
            if (unclosing > 0) --unclosing
            else {
                append_start += '('
            }
        }
    }
    append_end = ')'.repeat(unclosing)
    expr = append_start + expr + append_end

    if (expr === '') expr = '0'
    return expr
}

/**
 * @param {string} expression
 * @param {"deg" | "rad"} degreeMode
 * @returns
 */
export function evaluate(expression, degreeMode, seeEPlusNumAsTenPower = false) {
    let expr = formatExpr(expression, seeEPlusNumAsTenPower)
    let scope = degreeMode === 'deg' ? scope_deg : scope_rad
    try {
        let result = math.evaluate(expr, scope)
        let resultStr = math.format(result, { precision: 14 })
        if (resultStr === 'Infinity' || resultStr === '-Infinity') resultStr = resultStr[0].replace(/Infinity/, '∞')
        resultStr = resultStr.replace(/(\d)e\+(\d)/, '$1e$2')
        return resultStr
    } catch (e) {
        return '![Error]'
    }
}