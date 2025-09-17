import { Rectangle, screen } from "electron";

export const centerWindow = (width: number, height: number): Rectangle => {
    const primaryMonitor = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryMonitor.workAreaSize;

    const x = Math.floor((screenWidth - width) / 2);
    const y = Math.floor((screenHeight - height) / 2);

    return { width, height, x, y };
}