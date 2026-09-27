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

## Compilar desde el código

Para compilar y generar el `.vsix` necesitas **Node.js ≥ 22** y npm (Node 22 es el mínimo que exige `@vscode/vsce` 4).

```bash
npm install
```

### Dependencias de desarrollo

Se declaran en `devDependencies` de `package.json` y se instalan con `npm install` (no hay dependencias de runtime, la extensión no empaqueta `node_modules`):

| Paquete | Versión | Para qué sirve |
| --- | --- | --- |
| `typescript` | `^5.3.0` | Compila `src/**/*.ts` a `out/` |
| `@types/vscode` | `^1.88.0` | Tipos de la API de VS Code |
| `@types/node` | `^20.10.0` | Tipos de Node (necesarios por `main: ./out/extension.js`) |
| `@vscode/vsce` | `^4.0.0` | Empaqueta la extensión en un `.vsix` (sustituye al obsoleto `vsce`) |
| `eslint` | `^10.11.0` | Linter |
| `typescript-eslint` | `^8.70.1` | Parser y reglas para ESLint con TypeScript |

### Comandos npm

| Comando | Qué hace |
| --- | --- |
| `npm run build` | Compila `src/` → `out/extension.js` (borra `out/` antes) |
| `npm run build:watch` | Igual, en modo watch (no borra `out/`) |
| `npm run compile` | Alias de `build` |
| `npm run lint` | ESLint sobre `src/` |
| `npm run package` | Genera `code-customizator-<version>.vsix` en la raíz del proyecto |
| `npm run vsix` | Alias de `package` |
| `npm run bump` | Cambia la versión (ver siguiente sección) |

`npm run package` no necesita un script previo: `vsce package` ejecuta por sí mismo el script `vscode:prepublish` de `package.json`, que es `npm run build`. El `.vsix` se llama `code-customizator-<version>.vsix` con la versión leída de `package.json`.

Ejemplo de build completo:

```bash
npm install
npm run build       # -> out/
npm run package     # -> code-customizator-<version>.vsix
```

Desde VS Code puedes lanzar lo mismo con la tarea **Terminal > Ejecutar tarea > Generar VSIX** (`.vscode/tasks.json`).

Notas:

- `out/` y `*.vsix` están en `.gitignore`.
- `.vscodeignore` excluye fuentes, scripts y configuración del `.vsix`; el paquete solo lleva `out/`, `doc/icon.png`, `README.md`, `CHANGELOG.md` y `LICENSE`.

## Cambiar la versión

```bash
npm run bump -- patch        # 1.0.0 -> 1.0.1
npm run bump -- minor        # 1.0.0 -> 1.1.0
npm run bump -- major        # 1.0.0 -> 2.0.0
npm run bump -- 1.2.0        # fija la versión explícita
```

El script actualiza `package.json` y `package-lock.json`. Añade `--changelog` para insertar también la sección `## [x.y.z]` al principio del `CHANGELOG.md`:

```bash
npm run bump -- minor --changelog
```

No hace commit ni crea tags de git; eso es cosa tuya:

```bash
git commit -am "v1.1.0" && git tag v1.1.0
```

## Instalación

Desde el `.vsix` generado:

```bash
code --install-extension code-customizator-<version>.vsix
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