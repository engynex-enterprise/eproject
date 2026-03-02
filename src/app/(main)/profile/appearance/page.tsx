"use client";

import { useState } from "react";
import { Monitor, Moon, Sun, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const accentColors = [
  { name: "Azul",    value: "#2563EB", tw: "bg-blue-600"    },
  { name: "Violeta", value: "#7C3AED", tw: "bg-violet-600"  },
  { name: "Verde",   value: "#059669", tw: "bg-emerald-600" },
  { name: "Naranja", value: "#EA580C", tw: "bg-orange-600"  },
  { name: "Rosa",    value: "#DB2777", tw: "bg-pink-600"    },
  { name: "Rojo",    value: "#DC2626", tw: "bg-red-600"     },
];

export default function ProfileAppearancePage() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [accent, setAccent] = useState("#2563EB");

  const themes = [
    { id: "light"  as const, label: "Claro",   Icon: Sun,     bg: "bg-white border-gray-200" },
    { id: "dark"   as const, label: "Oscuro",  Icon: Moon,    bg: "bg-zinc-900 border-zinc-700" },
    { id: "system" as const, label: "Sistema", Icon: Monitor, bg: "bg-gradient-to-br from-white to-zinc-900 border-gray-300" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Tema */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b">
          <p className="text-sm font-semibold">Tema de la interfaz</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Selecciona el modo de apariencia que prefieres.
          </p>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-3 gap-4">
            {themes.map(({ id, label, Icon, bg }) => {
              const isActive = theme === id;
              return (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  className={cn(
                    "relative flex flex-col gap-3 rounded-xl border-2 p-4 text-left transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-muted-foreground/40 hover:bg-muted/30",
                  )}
                >
                  {isActive && (
                    <CheckCircle2 className="absolute right-2.5 top-2.5 size-4 text-primary" />
                  )}
                  <div className={cn("h-16 rounded-lg border-2", bg)} />
                  <div className="flex items-center gap-1.5">
                    <Icon
                      className={cn(
                        "size-3.5",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isActive ? "text-primary" : "text-foreground",
                      )}
                    >
                      {label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Color de acento */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b">
          <p className="text-sm font-semibold">Color de acento</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Define el color principal de botones y elementos interactivos.
          </p>
        </div>
        <div className="px-6 py-6">
          <div className="flex flex-wrap gap-3">
            {accentColors.map((color) => {
              const isActive = accent === color.value;
              return (
                <button
                  key={color.value}
                  onClick={() => setAccent(color.value)}
                  title={color.name}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-3 transition-all",
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:border-muted-foreground/30 hover:bg-muted/30",
                  )}
                >
                  <div className={cn("size-8 rounded-full shadow-sm", color.tw)} />
                  <span className="text-xs font-medium text-muted-foreground">
                    {color.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
