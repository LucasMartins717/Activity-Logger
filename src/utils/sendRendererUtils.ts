export const sendRenderer = {
    "minimize-window": () => window.ipcRenderer.send("minimize-window"),
    "maximize-window": () => window.ipcRenderer.send("maximize-window"),
    "close-window": () => window.ipcRenderer.send("close-window"),
    "login-success": (uid: string) => window.ipcRenderer.send("login-success", uid),
    "logout": () => window.ipcRenderer.send("logout"),
    "change-settings-layout": (mode: "horizontal" | "vertical") => window.ipcRenderer.send("change-settings-layout", mode),
    "open-settings": () => window.ipcRenderer.send("open-settings"),
}