<template>
    <div class="operate-board">
        <!-- grid -->
        <div class="btn-grid-group">
            <div class="btn-op op-advance font-small" data-identifier="op-2nd">2nd</div>
            <!-- op-degree -->
            <div class="btn-op op-advance font-small" data-identifier="op-deg">deg</div>
            <div class="btn-op op-advance font-small" data-identifier="op-sin">sin</div>
            <div class="btn-op op-advance font-small" data-identifier="op-cos">cos</div>
            <div class="btn-op op-advance font-small" data-identifier="op-tan">tan</div>
            <div class="btn-op op-advance font-medium icon-pow" data-identifier="op-pow"></div>
            <div class="btn-op op-advance font-small" data-identifier="op-lg">lg</div>
            <div class="btn-op op-advance font-small" data-identifier="op-ln">ln</div>
            <div class="btn-op op-advance font-small" data-identifier="op-leftquote">(</div>
            <div class="btn-op op-advance font-small" data-identifier="op-rightquote">)</div>
            <div class="btn-op op-advance font-medium icon-sqrt" data-identifier="op-sqrt"></div>
            <!-- op-clean -->
            <div class="btn-op op-func icon-ac" data-identifier="op-ac"></div>
            <div class="btn-op op-func icon-backspace" data-identifier="op-backspace"></div>
            <div class="btn-op op-func icon-percent" data-identifier="op-percent"></div>
            <div class="btn-op op-func icon-divide" data-identifier="op-div"></div>
            <div class="btn-op op-advance font-medium icon-factorial" data-identifier="op-factorial"></div>
            <div class="btn-op op-basic" data-identifier="val-7">7</div>
            <div class="btn-op op-basic" data-identifier="val-8">8</div>
            <div class="btn-op op-basic" data-identifier="val-9">9</div>
            <div class="btn-op op-func icon-plus" data-identifier="op-add"></div>
            <div class="btn-op op-advance font-medium icon-inverse" data-identifier="op-inverse"></div>
            <div class="btn-op op-basic" data-identifier="val-4">4</div>
            <div class="btn-op op-basic" data-identifier="val-5">5</div>
            <div class="btn-op op-basic" data-identifier="val-6">6</div>
            <div class="btn-op op-func icon-minus" data-identifier="op-sub"></div>
            <div class="btn-op op-advance font-small" data-identifier="val-pi">π</div>
            <div class="btn-op op-basic" data-identifier="val-1">1</div>
            <div class="btn-op op-basic" data-identifier="val-2">2</div>
            <div class="btn-op op-basic" data-identifier="val-3">3</div>
            <div class="btn-op op-func icon-multiply" data-identifier="op-mul"></div>
            <div class="btn-op op-advance" data-identifier="op-switch"></div>
            <div class="btn-op op-basic" data-identifier="val-e">e</div>
            <div class="btn-op op-basic" data-identifier="val-0">0</div>
            <div class="btn-op op-basic" data-identifier="val-dot">.</div>
            <div class="btn-op op-equal icon-equal" data-identifier="op-equal"></div>
        </div>
    </div>
</template>

<script>
import { copyJSON } from "@/assets/utils";
import { FontSizeCtl } from "./ScreenArea.vue";
import { evaluate } from "@/assets/evaluate"

/**
 * @param {string} identifier
 * @param {{currentList: string[], resultVal: string, isResultInvalid: boolean}} in_values
 * @param {"current" | "result"} activated
 * @returns {undefined | {type: string, content?: any}}
 */
function handlePressBtnMsg(identifier, in_values, activated) {
    const update_out_values = {
        addHistory: [],
        addCurrent: undefined,
        setCurrent: undefined,
        activate: activated
    };

    const only = (c) => in_values.currentList.length === 1 && in_values.currentList[0] === c
    const empty = () => in_values.currentList.length === 0
    const lastInput = () => in_values.currentList.length ? in_values.currentList[in_values.currentList.length - 1] : undefined
    const getCurrentRawVal = () => in_values.currentList.join("")
    const getStoreValue = () => FontSizeCtl.formatString(in_values.currentList.join(""), "currentScreen") + "=" + in_values.resultVal
    const getCurDegreeMode = () => document.querySelector(".btn-grid-group .btn-op[data-identifier='op-deg']") ? "deg" : "rad"

    function checkDotCanAppend(curlist) {
        if (curlist.length === 0) return true
        if (curlist[curlist.length - 1] === '.') return false
        let i = curlist.length - 1
        while (i >= 0 && /^[\d]+$/.test(curlist[i])) --i
        if (i < 0) return true
        if (curlist[i] === '.') return false
        return true
    }

    const getResultValList = (res) => (res || in_values.resultVal).split('')

    if (identifier.startsWith("val-")) {
        let val = identifier.replace(/^val-/, "");
        if (val === "dot") val = ".";
        else if (val === "pi") val = "π";
        else if (val === "e") val = "e";
        if (activated === "current") {
            if (val === '.' && !checkDotCanAppend(in_values.currentList)) return
            if (val !== '.' && only("0")) {
                update_out_values.setCurrent = [val];
            } else update_out_values.addCurrent = [val];
        }
        else if (activated === "result") {
            update_out_values.addHistory.push(getStoreValue());
            if (val === '.') update_out_values.setCurrent = ["0", val];
            else update_out_values.setCurrent = [val];
            update_out_values.activate = "current";
        }
        return { type: "update", content: update_out_values };
    }

    else if (identifier.startsWith("op")) {
        let op = identifier.replace(/^op-/, "");

        // 2nd
        if (op === "2nd") {
            return { type: "switch-arc" }
        }

        // deg, rad
        else if (op === "deg") {
            return { type: "switch-degree", content: "rad" }
        }
        else if (op === "rad") {
            return { type: "switch-degree", content: "deg" }
        }

        // sin, cos, tan, arcsin, arccos, arctan lg, ln
        else if (["sin", "cos", "tan", "arcsin", "arccos", "arctan", "lg", "ln"].includes(op)) {
            if (activated === "current") {
                if (only("0")) {
                    update_out_values.setCurrent = [op + "("];
                } else update_out_values.addCurrent = [op + "("];
            }
            else if (activated === "result") {
                update_out_values.addHistory.push(getStoreValue());
                update_out_values.setCurrent = [op + "("];
                update_out_values.activate = "result";
            }
            return { type: "update", content: update_out_values };
        }

        // +, -, ×, ÷, ^, !
        else if (["add", "sub", "mul", "div", "pow", "factorial"].includes(op)) {
            op = {
                "add": "+",
                "sub": "-",
                "mul": "×",
                "div": "÷",
                "pow": "^",
                "factorial": "!"
            }[op]
            if (activated === "current") {
                if (only("0") && op === "-") update_out_values.setCurrent = [op]
                else if (op === "-" && ["+", "-", "×", "÷", "^", "√"].includes(lastInput())) {
                    update_out_values.addCurrent = ["(", op]
                }
                else if (op !== "-" && ["+", "-", "×", "÷", "^", "√"].includes(lastInput())) {
                    while (lastInput() === "√") in_values.currentList.pop()
                    if (["+", "-", "×", "÷", "^"].includes(lastInput())) in_values.currentList.pop()
                    if (empty()) in_values.currentList.push("0")
                    in_values.currentList.push(op)
                    update_out_values.setCurrent = in_values.currentList
                }
                else update_out_values.addCurrent = [op];
            }
            else if (activated === "result") {
                update_out_values.addHistory.push(getStoreValue());
                if (in_values.isResultInvalid || in_values.resultVal === "0") update_out_values.setCurrent = [op === "-" ? op : ("0" + op)];
                else update_out_values.setCurrent = [...getResultValList(), op]
                update_out_values.activate = "current";
            }
            return { type: "update", content: update_out_values };
        }

        // % (percent)
        else if (op === "percent") {
            if (activated === "current") {
                let curlist = Array.from(in_values.currentList)
                let i = curlist.length - 1, dotpos = -1
                while (i >= 0 && /^([\d]+|[.])$/.test(curlist[i])) {
                    // record the first dot position (actually only one dot, first dot is exception)
                    if (dotpos == -1 && curlist[i] === '.') dotpos = i
                    --i
                }
                ++i;
                if (i >= curlist.length) {
                    if (['(', "×", "÷", "+", "-", "√"].includes(curlist[curlist.length - 1].slice(-1))) update_out_values.addCurrent = ["0", ".", "0", "1"]
                    else update_out_values.addCurrent = ["×", "0", ".", "0", "1"]
                }
                else {
                    // now, i is the start of a number
                    if (i === curlist.length - 1 && curlist[i] === "0") return // zero

                    // evaluate value
                    let calc_expr = curlist.slice(i).join(''), j = 0;
                    const regExpr = /([\d.]+e-?)$/
                    const regResp = regExpr.exec(curlist.slice(0, i).join(''))
                    if (regResp !== null) { calc_expr = regResp[1] + calc_expr; j = regResp[1].length }
                    let later = evaluate(`(${calc_expr}) / 100`, getCurDegreeMode(), true)
                    if (!later.startsWith("!")) {
                        later = later.replace(/(\d)e\+([\d]+)/g, '$1e$2')
                        update_out_values.setCurrent = [curlist.slice(0, i - j), getResultValList(later)].flat()

                    } else {
                        // fallback: manually move dot
                        if (dotpos === -1) dotpos = curlist.length
                        let extraApeend = []
                        if (3 - (dotpos - i) > 0) {
                            extraApeend = Array.from({ length: 3 - (dotpos - i) }, () => "0")
                        }

                        let newer = [curlist.slice(0, i), extraApeend, curlist.slice(i, dotpos), curlist.slice(dotpos + 1)].flat()
                        newer.splice(dotpos + extraApeend.length - 2, 0, '.') // insert dot
                        update_out_values.setCurrent = newer
                    }
                }
                return { type: "update", content: update_out_values };
            }
            else if (activated === "result") {
                update_out_values.addHistory.push(getStoreValue());
                let res = evaluate(`(${in_values.resultVal}) / 100`, getCurDegreeMode(), true)
                if (res.startsWith("!")) update_out_values.setCurrent = ["0"]
                else update_out_values.setCurrent = getResultValList(res)
                update_out_values.activate = "current";
                return { type: "update", content: update_out_values };
            }
        }

        // sqrt
        else if (op === "sqrt") {
            if (activated === "current") {
                if (only("0")) {
                    update_out_values.setCurrent = ["√"];
                } else update_out_values.addCurrent = ["√"];
            }
            else if (activated === "result") {
                update_out_values.addHistory.push(getStoreValue());
                if (in_values.resultVal === "0") update_out_values.setCurrent = ["√"];
                else update_out_values.setCurrent = [...getResultValList(), "√"];
                update_out_values.activate = "current";
            }
            return { type: "update", content: update_out_values };
        }

        // 1/x
        else if (op === "inverse") {
            update_out_values.addCurrent = ["^", "(", "-", "1", ")"];
            return { type: "update", content: update_out_values };
        }

        // (, )
        else if (["leftquote", "rightquote"].includes(op)) {
            if (activated === "current") {
                if (only("0")) {
                    update_out_values.setCurrent = [op === "leftquote" ? "(" : ")"];
                } else update_out_values.addCurrent = [op === "leftquote" ? "(" : ")"];
            }
            else if (activated === "result") {
                update_out_values.addHistory.push(getStoreValue());
                update_out_values.setCurrent = [op === "leftquote" ? "(" : ")"];
                update_out_values.activate = "current";
            }
            return { type: "update", content: update_out_values };
        }

        // backspace
        else if (op === "backspace") {
            if (activated === "current") {
                if (in_values.currentList.length === 1) update_out_values.setCurrent = ["0"]
                else update_out_values.setCurrent = in_values.currentList.slice(0, -1);
                return { type: "update", content: update_out_values };
            }
            return
        }

        // =
        else if (op === "equal") {
            if (only("0")) return
            return { type: "update", content: { activate: "result" } }
        }

        // AC
        else if (op === "ac") {
            return { type: "all-clean" }
        }

        // C
        else if (op === "c") {
            return { type: "clean" }
        }
    }

    return
}


const KEY_BTN_MAP = {
    "1": "val-1",
    "2": "val-2",
    "3": "val-3",
    "4": "val-4",
    "5": "val-5",
    "6": "val-6",
    "7": "val-7",
    "8": "val-8",
    "9": "val-9",
    "0": "val-0",
    ".": "val-dot",
    "Enter": "op-equal",
    "=": "op-equal",
    "Backspace": "op-backspace",
    get "Escape"() {
        const btnEl = document.querySelector(".btn-grid-group .btn-op[data-identifier='op-ac']");
        if (btnEl) return 'op-ac'
        else return 'op-c'
    },
    "+": "op-add",
    "-": "op-sub",
    "*": "op-mul",
    "/": "op-div",
    "^": "op-pow",
    "(": "op-leftquote",
    ")": "op-rightquote",
    "E": "val-e",
    "P": "val-pi",
    "S": "op-sin",
    "C": "op-cos",
    "T": "op-tan",
    "L": "op-ln",
    "G": "op-lg",
    "!": "op-factorial",
    "R": "op-sqrt",
    "I": "op-inverse",
    "%": "op-percent",
    get "D"() {
        const btnEl = document.querySelector(".btn-grid-group .btn-op[data-identifier='op-deg']");
        if (btnEl) return 'op-deg'
        else return 'op-rad'
    },
}

const KEY_BTN_SHIFT_MAP = {
    "S": "op-arcsin",
    "C": "op-arccos",
    "T": "op-arctan"
}

export default {
    name: "OperateBoard",
    data() {
        return {};
    },
    methods: {
        /**
         * @param {"C" | "AC"} CorAC
         */
        switchClean(CorAC) {
            CorAC = CorAC.toUpperCase();
            let identifier = CorAC === "C" ? "op-c" : "op-ac";
            let className = CorAC === "C" ? "icon-c" : "icon-ac";
            let btn = document.querySelector(
                `.btn-grid-group .btn-op[data-identifier="${identifier === "op-c" ? "op-ac" : "op-c"}"]`
            );
            if (!btn) return
            btn.dataset.identifier = identifier;
            btn.classList.remove("icon-c", "icon-ac");
            btn.classList.add(className);
        },
        switchDegree(DegOrRad) {
            DegOrRad = DegOrRad.toUpperCase();
            let text = DegOrRad === "DEG" ? "deg" : "rad";
            let identifier = DegOrRad === "DEG" ? "op-deg" : "op-rad";
            let btn = document.querySelector(
                `.btn-grid-group .btn-op[data-identifier="${identifier === "op-deg" ? "op-rad" : "op-deg"}"]`
            );
            if (!btn) return
            btn.dataset.identifier = identifier;
            btn.textContent = text;
        },
        switchArc() {
            let isCurArc = false

            for (let op of ["sin", "cos", "tan"]) {
                let btn = document.querySelector(
                    `.btn-grid-group .btn-op[data-identifier="op-${op}"]`
                );
                if (!btn) {
                    isCurArc = true
                    break
                }
                btn.dataset.identifier = `op-arc${op}`;
                const span = document.createElement("span");
                span.textContent = "-1";
                btn.appendChild(span);
            }

            if (!isCurArc) return
            for (let op of ["sin", "cos", "tan"]) {
                let btn = document.querySelector(
                    `.btn-grid-group .btn-op[data-identifier="op-arc${op}"]`
                );
                if (!btn) break
                btn.dataset.identifier = `op-${op}`;
                btn.removeChild(btn.querySelector("span"));
            }
        }
    },
    mounted() {
        const that = this
        // bind grid-area
        const btns = document.querySelectorAll(".btn-grid-group .btn-op");
        btns.forEach(btn => {
            if (["op-c", "op-ac"].includes(btn.dataset.identifier)) {
                btn.style.gridArea = "op-clean";
            } else if (["op-deg", "op-rad"].includes(btn.dataset.identifier)) {
                btn.style.gridArea = "op-degree";
            } else {
                btn.style.gridArea = btn.dataset.identifier;
            }
        });
        // handle button press event
        const ScreenAreaApp = this.$parent.$refs.screenArea
        function emitIdentifierFunc(identifier) {
            const in_values = {
                currentList: ScreenAreaApp.currentList,
                resultVal: ScreenAreaApp.resultVal,
                isResultInvalid: ScreenAreaApp.is_result_invalid
            };
            const activated = ScreenAreaApp.activated;
            let out_values = handlePressBtnMsg(identifier, in_values, activated);
            if (out_values) that.$emit("update-screen", copyJSON(out_values));
            else that.$emit("update-screen", { type: "scroll-to-bottom" })
        }
        btns.forEach(btn => {
            btn.addEventListener("click", () => emitIdentifierFunc(btn.dataset.identifier));
        })

        // handle key press event
        let isCtrlPressed = false, isShiftPressed = false
        document.addEventListener("keyup", function (e) {
            if (e.key === "Control") isCtrlPressed = false
            if (e.key === "Shift") isShiftPressed = false
        })
        document.addEventListener("keydown", function (e) {
            if (e.key === "Control") isCtrlPressed = true
            if (e.key === "Shift") isShiftPressed = true
        })
        document.addEventListener("keydown", function (e) {
            if (window.getSelection().toString() !== '') return // prevent key emit when select text
            if (isCtrlPressed) return // prevent key emit when ctrl pressed
            e.preventDefault() // prevent default key event (copy, paste, etc.)

            let keyPressVal = e.key.length === 1 ? e.key.toUpperCase() : e.key;
            let identifier
            if (isShiftPressed) identifier = KEY_BTN_SHIFT_MAP[keyPressVal] // shift
            if (typeof identifier === "undefined") identifier = KEY_BTN_MAP[keyPressVal] // shift fallback to normal
            if (identifier) {
                emitIdentifierFunc(identifier);
            }
        })
    }
};
</script>

<style lang="scss">
@import "@/assets/fonts/icomoon/style.css";

.operate-board {
    $padding: calc(var(--calc-width) * 0.015);
    $grid-width: calc(var(--calc-width) * 1 - $padding * 2);
    $grid-height: calc(var(--calc-height) * 0.55 - $padding * 2);

    width: $grid-width;
    height: $grid-height;
    $op-font-size: calc(var(--calc-width) * 0.08);
    font-size: $op-font-size;
    padding: $padding;

    $op-dark-color: #000000;
    $op-dark2-color: #646464;
    $op-func-color: #ff7433;
    $op-func2-color: #ef6d2f;
    $op-white-color: #fafafa;
    $op-white2-color: #ebebeb;

    $grid-height-gap: calc(var(--calc-width) * 0.035);
    $grid-width-gap: calc(var(--calc-width) * 0.035);
    $grid-cols: 5;
    $grid-rows: 7;

    .btn-grid-group {
        display: grid;
        grid-template-columns: repeat($grid-cols, 1fr);
        grid-template-rows: repeat($grid-rows, 1fr);
        grid-row-gap: $grid-height-gap;
        grid-column-gap: $grid-width-gap;
        grid-template-areas:
            "op-2nd op-degree op-sin op-cos op-tan"
            "op-pow op-lg op-ln op-leftquote op-rightquote"
            "op-sqrt op-clean op-backspace op-percent op-div"
            "op-factorial val-7 val-8 val-9 op-add"
            "op-inverse val-4 val-5 val-6 op-sub"
            "val-pi val-1 val-2 val-3 op-mul"
            "op-switch val-e val-0 val-dot op-equal";

        .btn-op {
            display: flex;
            justify-content: center;
            align-items: center;

            width: calc((#{$grid-width} - ($grid-width-gap * ($grid-cols - 1))) / $grid-cols);
            height: calc((#{$grid-height} - ($grid-height-gap * ($grid-rows - 1))) / $grid-rows);
            border-radius: calc(var(--calc-width) * 0.03);
            cursor: pointer;
            user-select: none;

            transition: transform 0.05s ease-in-out;

            &:active {
                transform: scale(0.9);
            }

            &[data-identifier="op-arcsin"],
            &[data-identifier="op-arccos"],
            &[data-identifier="op-arctan"] {
                span {
                    font-size: 55%;
                    font-weight: bold;
                    transform: translateY(-35%);
                }
            }

            &.font-medium {
                font-size: calc($op-font-size * 0.85);
            }

            &.font-small {
                font-size: calc($op-font-size * 0.7);
            }

            &.op-basic {
                color: $op-dark-color;
                background-color: $op-white-color;

                &:hover {
                    background-color: $op-white2-color;
                }
            }

            &.op-func {
                color: $op-func-color;
                background-color: $op-white-color;

                &:hover {
                    background-color: $op-white2-color;
                }
            }

            &.op-advance {
                color: $op-dark2-color;
                background-color: $op-white-color;

                &:hover {
                    background-color: $op-white2-color;
                }
            }

            &.op-equal {
                color: $op-white-color;
                background-color: $op-func-color;

                &:hover {
                    background-color: $op-func2-color;
                }
            }
        }
    }
}
</style>
