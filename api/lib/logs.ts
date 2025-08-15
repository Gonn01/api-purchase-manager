import os from "os";

const isLocal: boolean = true;
// Podés alternar con el hostname si querés
// const isLocal = os.hostname() !== "asignaciones";

function logWithColor(colorCode: string, icon: string, message: string): void {
    if (isLocal) {
        console.log(
            `${colorCode}%s\x1b[0m`,
            `${icon} ${message}\n--------------------------------------------------`
        );
    }
}

export function logGreen(message: string): void {
    logWithColor("\x1b[32m", "✅", message);
}

export function logRed(message: string): void {
    logWithColor("\x1b[31m", "❌", message);
}

export function logBlue(message: string): void {
    logWithColor("\x1b[34m", "🔵", message);
}

export function logYellow(message: string): void {
    logWithColor("\x1b[33m", "⚠️ ", message);
}

export function logPurple(message: string): void {
    logWithColor("\x1b[35m", "💜", message);
}

export function logCyan(message: string): void {
    logWithColor("\x1b[36m", "💎", message);
}
