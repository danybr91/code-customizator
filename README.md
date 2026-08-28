# Code Customizator

Extensión para VS Code que permite cambiar el color de la barra de título del workspace desde un selector visual en la barra de ventana superior.

## Características

- **Botón en la barra de título** (window title bar) para acceso rápido
- **Icono en la barra de estado** (status bar), con tooltip y sin texto
- **Comando en la paleta de comandos**: "Cambiar color de la barra de título"
- **Selector visual** con 8 colores predefinidos + opción de resetear
- Guarda la configuración en `.vscode/settings.json` del workspace
- **Título personalizado en la pestaña** del editor activo (con emojis o texto), vía el comando "Asignar título personalizado"

## Uso

1. Abre un workspace (carpeta de proyecto)
2. Haz clic en el icono de la barra de estado para abrir el selector
3. VS Code muestra una lista flotante nativa con los nombres de los colores
4. Selecciona un color para aplicarlo

La configuración se guarda automáticamente en `.vscode/settings.json`:

```json
{
  "workbench.colorCustomizations": {
    "titleBar.activeBackground": "#00A651",
    "titleBar.activeForeground": "#FFFFFF",
    "titleBar.inactiveBackground": "#007A3D",
    "titleBar.inactiveForeground": "#D8D8D8"
  }
}
```

## Cambiar el título de la pestaña

Puedes asignar un título personalizado a la pestaña del editor activo, por ejemplo prefijándolo con un emoji para identificar el fichero visualmente sin colorear la pestaña.

- **Comando en la paleta de comandos**: "Asignar título personalizado"
- También disponible en el **menú contextual del editor** (clic derecho en el editor)
- Escribe el texto que quieras; usa `${filename}` para incluir el nombre del archivo
- Si dejas el campo **vacío**, se elimina el título personalizado de ese fichero

La configuración se guarda en `.vscode/settings.json` mediante `workbench.editor.customLabels`:

```json
{
  "workbench.editor.customLabels.enabled": true,
  "workbench.editor.customLabels.patterns": {
    "**/src/extension.ts": "🟡 ${filename}"
  }
}
```

El título queda asociado a la ruta del fichero y se muestra aunque cambies de pestaña.

## Requisitos

- VS Code ≥ 1.88.0
- Un workspace abierto (carpeta de proyecto)

## Instalación

```bash
code --install-extension code-customizator-1.0.0.vsix
```

## Colores personalizados

La opción `Personalizar...` abre los ajustes del workspace. Añade opciones nuevas en:

```json
{
  "codeCustomizator.colors": [
    {
      "name": "Mi color",
      "color": "#00A651",
      "inactive": "#007A3D",
      "foreground": "#FFFFFF",
      "inactiveForeground": "#D8D8D8"
    }
  ]
}
```

Estas opciones se suman a las integradas.