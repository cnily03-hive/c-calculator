<template>
    <div class="app-calculator">
        <ScreenArea ref="screenArea" @update-board="handleUpdateBoardEmit"></ScreenArea>
        <OperateBoard ref="operateBoard" @update-screen="handleUpdateScreenEmit"></OperateBoard>
        <!-- <li><router-link to="/about">About</router-link></li> -->
    </div>
</template>

<script>
import ScreenArea from "@/components/ScreenArea.vue";
import OperateBoard from "./components/OperateBoard.vue";

export default {
    name: "App",
    components: {
        ScreenArea,
        OperateBoard
    },
    methods: {
        handleUpdateBoardEmit(data) {
            const TYPE = data["type"];
            const BoardAreaApp = this.$refs.operateBoard
            if (TYPE === "switch-ac") {
                BoardAreaApp.switchClean("AC")
            } else if (TYPE === "switch-c") {
                BoardAreaApp.switchClean("C")
            }
        },
        handleUpdateScreenEmit(data) {
            const TYPE = data["type"];
            const ScreenAreaApp = this.$refs.screenArea
            const BoardAreaApp = this.$refs.operateBoard
            if (TYPE === "update") {
                /**
                 * @type {{addHistory?: string | string[], addCurrent?: string | string[], setCurrent?: string[], activate?: "current" | "result"}} contentData
                 */
                let contentData = data["content"];
                if (typeof contentData["addHistory"] !== "undefined") {
                    if (!Array.isArray(contentData["addHistory"])) contentData["addHistory"] = [contentData["addHistory"]];
                    contentData["addHistory"].forEach((val) => {
                        if (typeof val === "string" && val !== "")
                            ScreenAreaApp.addHistoryVal(val);
                    });
                }

                if (typeof contentData["setCurrent"] !== "undefined") {
                    if (!Array.isArray(contentData["setCurrent"])) contentData["setCurrent"] = [contentData["setCurrent"]];
                    ScreenAreaApp.setCurrentList(contentData["setCurrent"], false);
                } else if (typeof contentData["addCurrent"] !== "undefined") {
                    if (!Array.isArray(contentData["addCurrent"])) contentData["addCurrent"] = [contentData["addCurrent"]];
                    contentData["addCurrent"].forEach((val) => {
                        if (typeof val === "string" && val !== "")
                            ScreenAreaApp.addCurrentVal(val, false);
                    });
                }

                ScreenAreaApp.changeActivate(contentData["activate"]);
                // ScreenAreaApp.updateSize();
            } else if (TYPE === "all-clean") {
                ScreenAreaApp.allCleanScreen();
            } else if (TYPE === "clean") {
                ScreenAreaApp.cleanScreen();
            } else if (TYPE === "switch-degree") {
                BoardAreaApp.switchDegree(data["content"]);
                ScreenAreaApp.$forceUpdate();
                ScreenAreaApp.updateSize();
            } else if (TYPE === "switch-arc") {
                BoardAreaApp.switchArc();
            } else if (TYPE === "scroll-to-bottom") {
                ScreenAreaApp.scrollToBottom();
            }
        }
    }
};
</script>

<style lang="scss">
body {
    margin: 0;
    padding: 0;
    background-color: #fff;
    overflow-x: hidden;
}

* {
    $aspect-ratio: 2400 / 1080;
    --calc-height: calc(min(#{100 / $aspect-ratio}vh, 100vw) * #{$aspect-ratio});
    --calc-width: min(#{100 / $aspect-ratio}vh, 100vw);
}

@import "@/assets/fonts/misans/style.css";
@import "@/assets/fonts/misans-cover/style.css";

#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    height: 100vh;
    width: var(--calc-width);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-family:
        /* "MiSans-cover", */
        "MiSans", sans-serif;

    background: #ffffff;

    .app-calculator {
        width: 100%;
    }
}

::selection {
    background-color: rgba(61, 170, 194, .25);
}
</style>
