const isDev = process.env.NODE_ENV?.trim() === "development"

const APP_NAME = "Calculator"
const icon_path = "electron/assets/icon.ico"

module.exports = {
    productName: APP_NAME,
    appId: "wang.jevon.course.calculator",
    directories: {
        output: "electron-build"
    },
    asar: true,
    npmRebuild: isDev ? false : true,
    files: [
        'web/**/*',
        "index.js",
        "!**/node_modules/**/*"
    ],
    extraResources: [{
        from: icon_path,
        to: `../${APP_NAME}.ico`
    }],
    win: {
        icon: icon_path,
        target: {
            target: "nsis",
            arch: [
                "x64",
                "ia32"
            ]
        }
    }
}