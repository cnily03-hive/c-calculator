<template>
    <div class="screen-area">
        <div class="history-screen">
            <span v-for="(val, index) of historyList" :key="index">{{ val }}</span>
        </div>
        <div :class="{
            'current-screen': true,
            activate: activate.currentScreen,
            'smooth-transition': smoothTransition
        }">{{ display_current_val }}</div>
        <div :class="{
            'result-screen': true,
            activate: activate.resultScreen,
            'smooth-transition': smoothTransition
        }">{{ display_result_val }}</div>
        <div hidden data-selector="font-size-small" style="font-size: var(--font-size-small);"></div>
        <div hidden data-selector="font-size-medium" style="font-size: var(--font-size-medium);"></div>
        <div hidden data-selector="font-size-large" style="font-size: var(--font-size-large);"></div>
    </div>
</template>

<script>
import { evaluate } from '@/assets/evaluate';

/**
 * @type {{historyScreen: HTMLElement, currentScreen: HTMLElement, resultScreen: HTMLElement}}
 */
const DOM = {
    get historyScreen() {
        let t = document.querySelector(".screen-area .history-screen");
        if (t) Object.defineProperty(DOM, "historyScreen", { value: t });
        return t;
    },
    get currentScreen() {
        let t = document.querySelector(".screen-area .current-screen");
        if (t) Object.defineProperty(DOM, "currentScreen", { value: t });
        return t;
    },
    get resultScreen() {
        let t = document.querySelector(".screen-area .result-screen");
        if (t) Object.defineProperty(DOM, "resultScreen", { value: t });
        return t;
    }
};

const FONT_WIDTH_MAP = {}

const CSS_PROP_MAP = {
    '--font-size-small': '',
    '--font-size-medium': '',
    '--font-size-large': '',
}

const CSS_REAL_NUMBER = {
    'font-size-small': 0,
    'font-size-medium': 0,
    'font-size-large': 0,
    "screen-inside-width": 0
}

let lastCalcCache = new Array("0", "")

export const FontSizeCtl = {
    currentScreen: 0,
    resultScreen: 0,
    /**
     * Step to decrease font size
     */
    STEP: 1,
    /**
     * Max decrease value
     */
    MAX_VALUE: 25,
    /**
     * Max number length
     */
    MAX_NUMBER_LENGTH: 20,
    MAX_FLOAT_PART_LENGTH: 10,
    isValidInput(val) {
        let arr = val.match(/\d+(\.\d+)?/g) || []
        for (let v of arr) {
            if (/\./.test(v)) {
                let t = v.split('.')
                if (t[0].length > FontSizeCtl.MAX_NUMBER_LENGTH || t[1].length > FontSizeCtl.MAX_FLOAT_PART_LENGTH) return false
            } else {
                if (v.length > FontSizeCtl.MAX_NUMBER_LENGTH) return false
            }
        }
        return true
    },
    /**
     * Update font size value
     * @param {Object} that
     * @param {keyof typeof DOM} domName
     */
    updateSize(that, domName, changeDOM = true) {
        const domEl = DOM[domName];
        let basicFontSizeProp = that.activate[domName] ? "--font-size-large" : "--font-size-medium"
        let basicFontSizeCssVal = CSS_PROP_MAP[basicFontSizeProp];
        let basicFontSize = CSS_REAL_NUMBER[basicFontSizeProp.slice(2)];
        let basicTextWidthValue = ((text) => {
            let arr = text.split(/\r?\n/).map(v => {
                let len = 0;
                for (let i = 0; i < v.length; i++) {
                    len += (FONT_WIDTH_MAP[v[i]] || FONT_WIDTH_MAP["中"]) * basicFontSize / 100;
                }
                return len
            })
            return Math.max(0, ...arr)
        })(domName === "currentScreen" ? that.display_current_val : that.display_result_val)
        let textWidth = () => basicTextWidthValue * (basicFontSize - FontSizeCtl[domName]) / basicFontSize
        let clientWidth = CSS_REAL_NUMBER["screen-inside-width"]

        FontSizeCtl[domName] = 0;
        while (textWidth() > clientWidth && FontSizeCtl[domName] <= FontSizeCtl.MAX_VALUE - FontSizeCtl.STEP) {
            FontSizeCtl[domName] += FontSizeCtl.STEP;
        }
        // while (textWidth() < domEl.scrollWidth) {
        //     FontSizeCtl[domName] += FontSizeCtl.STEP;
        //     if (FontSizeCtl[domName] >= FontSizeCtl.MAX_VALUE) {
        //         FontSizeCtl[domName] = FontSizeCtl.MAX_VALUE;
        //         break
        //     }
        // }
        if (changeDOM) domEl.style.fontSize = `calc(${basicFontSizeCssVal} - ${FontSizeCtl[domName]}px)`;
        return textWidth();
    },
    /**
     * Reset font size sub value
     * @param {keyof typeof DOM | "all"} domName
     */
    resetSize(domName) {
        let domlist = domName === "all" ? ["currentScreen", "resultScreen"] : [domName];
        domlist.forEach(domName => {
            FontSizeCtl[domName] = 0;
            DOM[domName].style.removeProperty("font-size");
        });
    },
    /**
     * @param {string} str
     * @param {"currentScreen" | "resultScreen"} domName
     */
    formatString(list, domName) {
        list = Array.from(list);
        // format comma
        let reversedCommaList = []
        let i = list.length - 1, meetCnt = 0;
        while (i >= 0) {
            if (/^\d+$/.test(list[i])) {
                // 向前查找，查找第一个不是数字的字符
                let j = i - 1, tmp = [];
                tmp.push(list[i]);
                while (j >= 0 && /^\d+$/.test(list[j])) {
                    tmp.push(list[j]);
                    --j;
                }
                if (j >= 0 && list[j] === '.') {
                    tmp.push('.');
                    while (tmp.length > 0) reversedCommaList.push(tmp.shift());
                    meetCnt = 0;
                    i = --j;
                    continue;
                }
                if (meetCnt > 0 && meetCnt % 3 === 0) reversedCommaList.push(',');
                meetCnt += list[i].length;
            } else meetCnt = 0;
            reversedCommaList.push(list[i]);
            --i;
        }
        list = reversedCommaList.reverse();
        let output = [];

        // calculate font size
        let fontSize = parseFloat(getComputedStyle(DOM[domName]).getPropertyValue("font-size"));
        fontSize = fontSize - (FontSizeCtl.MAX_VALUE - FontSizeCtl[domName]);
        let width = 0;
        for (i = 0; i < list.length; ++i) {
            for (let c of list[i]) width += (FONT_WIDTH_MAP[c] || FONT_WIDTH_MAP["中"]) * fontSize / 100;
            if (width > DOM[domName].clientWidth) {
                let j = i;
                // find the last nun-number char
                while (j >= 0 && /^[\d,eπ]+$/.test(list[j])) --j;
                // find number
                while (j >= 0 && !/^[\d,eπ]+$/.test(list[j])) --j;
                ++j;
                if (j <= 0) j = i;
                output.push(list.slice(0, j).join(""));
                list = list.slice(j);
                i = -1;
                width = 0;
            }
        }
        if (list.length > 0) output.push(list.join(""));
        return output.join("\n");
    }
};



export default {
    name: "ScreenArea",
    data() {
        return {
            activate: {
                currentScreen: true,
                resultScreen: false
            },
            get activated() {
                if (this.activate.currentScreen) return "current";
                else return "result";
            },
            historyList: [],
            currentList: ["0"],
            get currentVal() {
                return this.currentList.join("");
            },
            get resultVal() {
                const expr = this.currentVal;
                if (lastCalcCache[0] === expr) return lastCalcCache[1]; // cache
                const degreeMode = document.querySelector(".btn-grid-group .btn-op[data-identifier='op-deg']") ? "deg" : "rad"
                this.is_result_invalid = true;
                if (expr === "0") return '';
                let res = evaluate(expr, degreeMode);
                if (res.startsWith("!")) res = "出错";
                else this.is_result_invalid = false;
                lastCalcCache[0] = expr, lastCalcCache[1] = res; // refresh cache
                return res;
            },
            display_current_val: "0",
            get display_result_val() {
                let res = this.resultVal;
                if (res === "") return "";
                return `=${res}`;
            },
            is_result_invalid: false,
            smoothTransition: false
        };
    },
    methods: {
        setHistoryList(list) {
            this.historyList = list;
        },
        addHistoryVal(val) {
            this.historyList.push(val);
        },
        setCurrentList(list, updateSize = true) {
            this.currentList = list;

            this.display_current_val = FontSizeCtl.formatString(this.currentList, "currentScreen");

            this.scrollToBottom();
            if (updateSize) FontSizeCtl.updateSize(this, "currentScreen");

            this.$emit("update-board", { type: this.display_result_val ? "switch-c" : "switch-ac" });
        },
        addCurrentVal(val, updateSize = true) {
            this.currentList.push(val);

            this.display_current_val = FontSizeCtl.formatString(this.currentList, "currentScreen");

            this.scrollToBottom();
            if (updateSize) FontSizeCtl.updateSize(this, "currentScreen");

            this.$emit("update-board", { type: this.display_result_val ? "switch-c" : "switch-ac" });
        },
        /**
         * @param {"current" | "result"} target
         */
        changeActivate(target) {
            if (target === this.activated) { this.scrollToBottom(); this.updateSize(); return }


            if (target === "current") {
                this.activate.currentScreen = true;
                this.activate.resultScreen = false;
            } else if (target === "result") {
                this.smoothTransition = true;
                setTimeout(() => {
                    this.smoothTransition = false;
                }, 200);

                this.activate.currentScreen = false;
                this.activate.resultScreen = true;
            }

            this.scrollToBottom(); this.updateSize();
        },
        updateSize() {
            FontSizeCtl.updateSize(this, "currentScreen");
            FontSizeCtl.updateSize(this, "resultScreen");
        },
        resetSize() {
            FontSizeCtl.resetSize("all");
        },
        allCleanScreen() {
            this.historyList = [];
            this.setCurrentList(["0"]);
            this.resetSize();
        },
        cleanScreen() {
            this.setCurrentList(["0"]);
            this.resetSize();
        },
        scrollToBottom() {
            const domEl = document.querySelector(".screen-area");
            this.$nextTick(() => {
                domEl.scrollTo({
                    top: domEl.scrollHeight,
                    behavior: "smooth"
                })
            })
        }
    },
    mounted() {
        // 计算 FONT_WIDTH_MAP
        let tmp = document.createElement("span");
        tmp.style.fontSize = "100px";
        tmp.style.visibility = "hidden";
        tmp.style.position = "absolute";
        tmp.style.top = "-1000px";
        tmp.style.left = "-1000px";
        tmp.style.fontFamily = `"MiSans-cover", "MiSans", sans-serif`;
        document.body.appendChild(tmp);
        let text = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ()/*-+%=πe÷×.^!√, []中";
        for (let i = 0; i < text.length; ++i) {
            tmp.innerText = text[i];
            FONT_WIDTH_MAP[text[i]] = tmp.clientWidth;
        }
        FONT_WIDTH_MAP["="] = FONT_WIDTH_MAP["="] * 2;
        window.FONT_WIDTH_MAP = FONT_WIDTH_MAP;
        document.body.removeChild(tmp);

        // 计算 CSS_PROP_MAP
        ["--font-size-small", "--font-size-medium", "--font-size-large"].forEach(key => {
            CSS_PROP_MAP[key] = getComputedStyle(document.querySelector(".screen-area")).getPropertyValue(key)
        })

        // 绑定计算 CSS_REAL_NUMBER
        let _calcCssRealNumber = () => {
            ["font-size-small", "font-size-medium", "font-size-large"].forEach(key => {
                CSS_REAL_NUMBER[key] = parseFloat(getComputedStyle(document.querySelector(`[data-selector=${key}]`)).getPropertyValue("font-size"))
            })
            CSS_REAL_NUMBER["screen-inside-width"] = document.querySelector(".screen-area .current-screen").clientWidth
        }
        _calcCssRealNumber(), window.addEventListener("resize", _calcCssRealNumber);

        // update size
        this.updateSize();
        // function itvUpdateSize() {
        //     return setInterval(() => {
        //         this.updateSize();
        //     }, 1);
        // }
        // let itvid = itvUpdateSize.call(this);
        // window.addEventListener("blur", () => {
        //     clearInterval(itvid);
        // });
        // window.addEventListener("focus", () => {
        //     itvid = itvUpdateSize.call(this)
        // });
    }
};

</script>

<style lang="scss">
.screen-area {
    $padding-width: calc(var(--calc-width) * 0.02);
    $padding-height: calc(var(--calc-height) * 0.015);
    width: calc(100% - $padding-width * 2);
    height: calc(var(--calc-height) * 0.45 - $padding-height * 2);
    background-color: #ffffff;
    text-align: end;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    // justify-content: flex-end;
    padding: $padding-height $padding-width;

    overflow: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
        display: none;
    }

    $font-color-small: #cdcdcd;
    $font-color-medium: #4d4d4d;
    $font-color-large: #000000;
    $font-size-small: calc(var(--calc-width) * 0.05);
    $font-size-medium: calc(var(--calc-width) * 0.085);
    $font-size-large: calc(var(--calc-width) * 0.12);
    --font-size-small: #{$font-size-small};
    --font-size-medium: #{$font-size-medium};
    --font-size-large: #{$font-size-large};

    .history-screen,
    .current-screen,
    .result-screen {
        width: 100%;

        &.smooth-transition {
            transition: font-size 0.2s ease-in-out;
        }
    }

    .history-screen {
        font-size: $font-size-small;
        color: $font-color-small;
        overflow-wrap: break-word;
        margin-bottom: 2em;
        margin-top: auto;

        &>span {
            display: block;
            text-align: end;
            margin-bottom: .75em;
        }
    }

    .current-screen,
    .result-screen {
        &:not(.activate) {
            font-size: $font-size-medium;
            color: $font-color-medium;
        }

        &.activate {
            font-size: $font-size-large;
            color: $font-color-large;
        }
    }

    .result-screen::first-letter {
        padding-right: .2em;
    }
}
</style>
