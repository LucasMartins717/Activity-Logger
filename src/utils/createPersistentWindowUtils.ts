import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import Store from "electron-store"

type Bounds = Electron.Rectangle;

export function CreatePersistentWindow(key: string, options: BrowserWindowConstructorOptions, routeLoader: (win: BrowserWindow) => void): BrowserWindow {

    const store = new Store<{ bounds?: Bounds; maximized?: boolean }>({ name: key });
    const saved = store.get('bounds');

    const windowOptions: BrowserWindowConstructorOptions = {
        ...options,
        width: saved?.width || options.width,
        height: saved?.height || options.height,
        x: saved?.x,
        y: saved?.y,
    };
    const win = new BrowserWindow(windowOptions);

    if (store.get("maximized")) win.maximize();

    routeLoader(win);

    const saveWindowProperties = () => {
        store.set('maximized', win.isMaximized());
        const bounds = win.isMaximized() ? win.getNormalBounds() : win.getBounds();
        store.set('bounds', bounds);
    }

    win.on('resize', saveWindowProperties);
    win.on('move', saveWindowProperties);
    win.on('close', saveWindowProperties);

    return win;
}