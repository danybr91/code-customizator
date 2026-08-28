import * as vscode from "vscode";
import { titleBarColors, TitleBarColor } from "./colors";

export function activate(context: vscode.ExtensionContext) {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = "codeCustomizator.changeTitleBarColor";
    statusBarItem.text = "$(paintcan)";
    statusBarItem.tooltip = "Cambiar color de la barra de titulo";
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    const disposable = vscode.commands.registerCommand("codeCustomizator.changeTitleBarColor", () => {
        const customColors = getWorkspaceColors();
        const allColors = [...titleBarColors, ...customColors];
        const quickPick = vscode.window.createQuickPick();
        quickPick.title = "Selector de color - Barra de título";
        quickPick.placeholder = "Selecciona un color";
        quickPick.items = [
            ...allColors.map(color => ({ label: color.name })),
            { label: "", kind: vscode.QuickPickItemKind.Separator },
            { label: "Resetear" },
            { label: "Personalizar..." }
        ];

        quickPick.onDidAccept(async () => {
            const selected = quickPick.selectedItems[0];

            if (selected.label === "Resetear") {
                await applyTitleBarColor(null);
                vscode.window.showInformationMessage("Color restablecido.");
                quickPick.hide();
                return;
            }

            if (selected.label === "Personalizar...") {
                await editCustomColors();
                return;
            }

            const color = allColors.find(item => item.name === selected.label);

            if (!color) return;

            await applyTitleBarColor(color);
            vscode.window.showInformationMessage(`Color aplicado: ${color.name}`);
            quickPick.hide();
        });

        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.show();
    });



    const tabCommand = vscode.commands.registerCommand(
        "codeCustomizator.changeTabTitle",
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage("No hay un editor activo. Abre el fichero al que quieres asignar un título.");
                return;
            }

            const current = getTabTitle(editor.document.uri);

            const title = await vscode.window.showInputBox({
                title: "Asignar título personalizado",
                prompt: "Escribe el título de la pestaña. Usa ${filename} para incluir el nombre del archivo.",
                placeHolder: "${filename}",
                value: current ?? "${filename}"
            });

            if (title === undefined) return;

            if (title.trim().length === 0) {
                await applyTabTitle(editor.document.uri, null);
                vscode.window.showInformationMessage("Título de la pestaña restablecido.");
                return;
            }

            await applyTabTitle(editor.document.uri, title.trim());
            vscode.window.showInformationMessage(`Título aplicado a la pestaña: ${title.trim()}`);
        }
    );
    const editCommand = vscode.commands.registerCommand(
        "codeCustomizator.editCustomColors",
        () => editCustomColors()
    );

    context.subscriptions.push(disposable, tabCommand, editCommand);
}

function getWorkspaceColors(): TitleBarColor[] {
    return vscode.workspace.getConfiguration("codeCustomizator").get<TitleBarColor[]>("colors", []);
}

async function editCustomColors() {
    const currentColors = getWorkspaceColors();
    const items = [
        { label: "$(add) Añadir color" },
        ...currentColors.map(color => ({
            label: `$(edit) ${color.name}`
        })),
        { label: "", kind: vscode.QuickPickItemKind.Separator },
        { label: "$(json) Abrir ajustes" }
    ];

    const selected = await vscode.window.showQuickPick(items, {
        title: "Personalizar colores",
        placeHolder: "Añade o edita colores personalizados"
    });

    if (!selected) return;

    if (selected.label.includes("Añadir color")) {
        const color = await askTitleBarColor();
        if (!color) return;

        await saveCustomColors([...currentColors, color]);
        vscode.window.showInformationMessage(`Color añadido: ${color.name}`);
        return;
    }

    if (selected.label.includes("Abrir ajustes")) {
        await vscode.commands.executeCommand("workbench.action.openSettings", "codeCustomizator.colors");
        return;
    }

    const name = selected.label.replace("$(edit) ", "");
    const oldColor = currentColors.find(color => color.name === name);
    const color = await askTitleBarColor(oldColor);
    if (!color) return;

    await saveCustomColors(currentColors.map(item => item.name === name ? color : item));
    vscode.window.showInformationMessage(`Color actualizado: ${color.name}`);
}

async function askTitleBarColor(current?: TitleBarColor): Promise<TitleBarColor | undefined> {
    const activeBackground = await askColor(
        "Nombre",
        current?.name || "Mi color",
        value => value.trim().length > 0 ? undefined : "Introduce un nombre."
    );

    if (!activeBackground) return;

    const color = await askHexColor("Fondo activo", current?.color || "#00A651");
    if (!color) return;

    const inactive = await askHexColor("Fondo inactivo", current?.inactive || shadeHexColor(color, -0.25));
    if (!inactive) return;

    const foreground = await askHexColor("Texto activo", current?.foreground || getContrastForeground(color));
    if (!foreground) return;

    const inactiveForeground = await askHexColor("Texto inactivo", current?.inactiveForeground || getContrastForeground(inactive));
    if (!inactiveForeground) return;

    return {
        name: activeBackground.trim(),
        color,
        inactive,
        foreground,
        inactiveForeground
    };
}

async function askHexColor(label: string, defaultValue: string): Promise<string | undefined> {
    const value = await vscode.window.showInputBox({
        title: label,
        prompt: "Introduce el valor en formato hexadecimal",
        placeHolder: "#00A651",
        value: defaultValue,
        validateInput: validateHexColor
    });

    return normalizeHexColor(value || "");
}

async function saveCustomColors(colors: TitleBarColor[]) {
    await vscode.workspace.getConfiguration("codeCustomizator").update(
        "colors",
        colors,
        vscode.ConfigurationTarget.Global
    );
}

function askColor(label: string, defaultValue: string, validate: (value: string) => string | undefined): Thenable<string | undefined> {
    return vscode.window.showInputBox({
        title: label,
        value: defaultValue,
        validateInput: validate
    });
}

function validateHexColor(value: string): string | undefined {
    return /^#([0-9a-f]{6})$/i.test(value.trim())
        ? undefined
        : "Usa el formato #RRGGBB.";
}

function normalizeHexColor(value: string): string {
    return value.trim().toUpperCase();
}

function getContrastForeground(value: string): string {
    const hex = normalizeHexColor(value).slice(1);
    const red = parseInt(hex.slice(0, 2), 16);
    const green = parseInt(hex.slice(2, 4), 16);
    const blue = parseInt(hex.slice(4, 6), 16);
    const luminance = 0.299 * red + 0.587 * green + 0.114 * blue;
    return luminance > 150 ? "#000000" : "#FFFFFF";
}

function shadeHexColor(value: string, percentage: number): string {
    const hex = normalizeHexColor(value).slice(1);
    const channels = [0, 2, 4].map(offset => {
        const channel = parseInt(hex.slice(offset, offset + 2), 16);
        const shaded = Math.round(channel * (1 + percentage));
        return Math.max(0, Math.min(255, shaded)).toString(16).padStart(2, "0");
    });
    return `#${channels.join("")}`.toUpperCase();
}

async function applyTitleBarColor(color: TitleBarColor | null) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage("No hay un workspace abierto. Abre una carpeta de trabajo primero.");
        return;
    }

    const workspaceFolder = workspaceFolders[0];
    const workspaceFolderUri = workspaceFolder.uri;
    const settingsPath = vscode.Uri.joinPath(workspaceFolderUri, ".vscode", "settings.json");

    let settings: any = {};
    try {
        const settingsContent = await vscode.workspace.fs.readFile(settingsPath);
        settings = JSON.parse(settingsContent.toString());
    } catch {
        // settings.json doesn"t exist, create new
    }

    if (!settings["workbench.colorCustomizations"]) {
        settings["workbench.colorCustomizations"] = {};
    }

    if (color && color.color) {
        settings["workbench.colorCustomizations"]["titleBar.activeBackground"] = color.color;
        settings["workbench.colorCustomizations"]["titleBar.activeForeground"] = color.foreground || "#FFFFFF";
        settings["workbench.colorCustomizations"]["titleBar.inactiveBackground"] = color.inactive || color.color;
        settings["workbench.colorCustomizations"]["titleBar.inactiveForeground"] = color.inactiveForeground || "#D8D8D8";
    } else {
        // Reset - remove titleBar colors
        delete settings["workbench.colorCustomizations"]["titleBar.activeBackground"];
        delete settings["workbench.colorCustomizations"]["titleBar.activeForeground"];
        delete settings["workbench.colorCustomizations"]["titleBar.inactiveBackground"];
        delete settings["workbench.colorCustomizations"]["titleBar.inactiveForeground"];

        // Clean up empty object
        if (Object.keys(settings["workbench.colorCustomizations"]).length === 0) {
            delete settings["workbench.colorCustomizations"];
        }
    }

    await vscode.workspace.fs.writeFile(
        settingsPath,
        Buffer.from(JSON.stringify(settings, null, 4), "utf8")
    );
}

function tabPatternKey(uri: vscode.Uri): string {
    const rel = vscode.workspace.asRelativePath(uri, false).replace(/\\/g, "/");
    return `**/${rel}`;
}

function getTabTitle(uri: vscode.Uri): string | undefined {
    const patterns = vscode.workspace.getConfiguration("workbench").get<any>("editor.customLabels.patterns", {});
    const value = patterns[tabPatternKey(uri)];
    return typeof value === "string" ? value : undefined;
}

async function applyTabTitle(uri: vscode.Uri, title: string | null) {
    const wsFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (!wsFolder) {
        vscode.window.showErrorMessage("No hay un workspace abierto. Abre una carpeta de trabajo primero.");
        return;
    }

    const config = vscode.workspace.getConfiguration("workbench", wsFolder);
    const patternsKey = "editor.customLabels.patterns";
    const patterns: any = { ...(config.get<any>(patternsKey) ?? {}) };

    const key = tabPatternKey(uri);

    if (title) {
        patterns[key] = title;
    } else {
        delete patterns[key];
    }

    if (Object.keys(patterns).length > 0) {
        await config.update(patternsKey, patterns, vscode.ConfigurationTarget.Workspace);
        await config.update("editor.customLabels.enabled", true, vscode.ConfigurationTarget.Workspace);
    } else {
        await config.update(patternsKey, undefined, vscode.ConfigurationTarget.Workspace);
        await config.update("editor.customLabels.enabled", undefined, vscode.ConfigurationTarget.Workspace);
    }
}

export function deactivate() {
    
}
