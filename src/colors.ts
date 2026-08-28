export interface TitleBarColor {
    name: string;
    color: string | null;
    inactive: string | null;
    foreground: string | null;
    inactiveForeground: string | null;
}

export const titleBarColors: TitleBarColor[] = [
    { name: "Rojo", color: "#CC0000", inactive: "#990000", foreground: "#FFFFFF", inactiveForeground: "#D8D8D8" },
    { name: "Naranja", color: "#E67E22", inactive: "#D35400", foreground: "#FFFFFF", inactiveForeground: "#D8D8D8" },
    { name: "Amarillo", color: "#ffef0c", inactive: "#ffdb4d", foreground: "#000000", inactiveForeground: "#000000" },
    { name: "Verde", color: "#00A651", inactive: "#007A3D", foreground: "#FFFFFF", inactiveForeground: "#D8D8D8" },
    { name: "Azul", color: "#2980B9", inactive: "#1A5276", foreground: "#FFFFFF", inactiveForeground: "#D8D8D8" },
    { name: "Violeta", color: "#8E44AD", inactive: "#6C3483", foreground: "#FFFFFF", inactiveForeground: "#D8D8D8" },
    { name: "Rosa", color: "#e73cae", inactive: "#c02ba0", foreground: "#FFFFFF", inactiveForeground: "#D8D8D8" },
    { name: "Cian", color: "#61d3bc", inactive: "#55bea9", foreground: "#000000", inactiveForeground: "#000000"}
];
