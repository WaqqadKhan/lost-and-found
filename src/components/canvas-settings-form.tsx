"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { updateCanvasSettings, type CanvasFormState } from "@/app/actions/site-settings";
import type { CanvasSettings } from "@/lib/canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FancySelect } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {pending ? "Saving…" : "Save canvas for all users"}
    </Button>
  );
}

const initial: CanvasFormState = { error: null, success: null };

const PRESETS = [
  { label: "Campus cream", c1: "#F4F1E8", c2: "#E4EDE4", c3: "#E8F0F4", mode: "solid" as const },
  { label: "Forest mist", c1: "#E8F2E8", c2: "#D4E8D8", c3: "#C8DED4", mode: "gradient" as const },
  { label: "Dawn gold", c1: "#F7F0E0", c2: "#E8EDE4", c3: "#DCE8F0", mode: "gradient" as const },
  { label: "Midnight hall", c1: "#1A2E24", c2: "#243D32", c3: "#1E2A3A", mode: "gradient" as const },
  { label: "Deep indigo", c1: "#1B2435", c2: "#243044", c3: "#1E3A3A", mode: "gradient" as const },
];

export function CanvasSettingsForm({ defaults }: { defaults: CanvasSettings }) {
  const [state, action] = useFormState(updateCanvasSettings, initial);
  const [mode, setMode] = useState(defaults.canvasMode);
  const [c1, setC1] = useState(defaults.canvasColor1);
  const [c2, setC2] = useState(defaults.canvasColor2);
  const [c3, setC3] = useState(defaults.canvasColor3 || "#E8F0F4");
  const [useThird, setUseThird] = useState(Boolean(defaults.canvasColor3));
  const [angle, setAngle] = useState(defaults.gradientAngle);

  if (state?.success) {
    toast.success(state.success);
    state.success = null;
  }

  const preview =
    mode === "gradient"
      ? useThird
        ? `linear-gradient(${angle}deg, ${c1}, ${c2}, ${c3})`
        : `linear-gradient(${angle}deg, ${c1}, ${c2})`
      : c1;

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="canvasMode" value={mode} />
      <input type="hidden" name="canvasColor1" value={c1} />
      <input type="hidden" name="canvasColor2" value={c2} />
      <input type="hidden" name="canvasColor3" value={c3} />
      <input type="hidden" name="gradientAngle" value={String(angle)} />
      {useThird ? <input type="hidden" name="useThirdColor" value="on" /> : null}

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div
        className="h-24 rounded-xl border shadow-inner ring-1 ring-foreground/5"
        style={{ background: preview }}
        aria-hidden
      />

      <div className="space-y-2">
        <Label>Mode</Label>
        <FancySelect
          value={mode}
          onValueChange={(v) => setMode(v === "gradient" ? "gradient" : "solid")}
          options={[
            { value: "solid", label: "Solid color" },
            { value: "gradient", label: "Multi-color gradient" },
          ]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="c1">{mode === "gradient" ? "Color 1" : "Canvas color"}</Label>
          <div className="flex items-center gap-2">
            <input
              id="c1"
              type="color"
              value={c1}
              onChange={(e) => setC1(e.target.value.toUpperCase())}
              className="h-10 w-14 cursor-pointer rounded-lg border bg-card p-1"
            />
            <Input value={c1} onChange={(e) => setC1(e.target.value)} className="font-mono text-xs" />
          </div>
        </div>
        {mode === "gradient" ? (
          <div className="space-y-2">
            <Label htmlFor="c2">Color 2</Label>
            <div className="flex items-center gap-2">
              <input
                id="c2"
                type="color"
                value={c2}
                onChange={(e) => setC2(e.target.value.toUpperCase())}
                className="h-10 w-14 cursor-pointer rounded-lg border bg-card p-1"
              />
              <Input value={c2} onChange={(e) => setC2(e.target.value)} className="font-mono text-xs" />
            </div>
          </div>
        ) : null}
      </div>

      {mode === "gradient" ? (
        <>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={useThird} onChange={(e) => setUseThird(e.target.checked)} />
            Use a third color stop
          </label>
          {useThird ? (
            <div className="space-y-2">
              <Label htmlFor="c3">Color 3</Label>
              <div className="flex items-center gap-2">
                <input
                  id="c3"
                  type="color"
                  value={c3}
                  onChange={(e) => setC3(e.target.value.toUpperCase())}
                  className="h-10 w-14 cursor-pointer rounded-lg border bg-card p-1"
                />
                <Input value={c3} onChange={(e) => setC3(e.target.value)} className="font-mono text-xs" />
              </div>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="angle">Gradient angle ({angle}°)</Label>
            <input
              id="angle"
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Quick presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className="rounded-full border bg-card px-3 py-1 text-xs hover:border-primary"
              onClick={() => {
                setMode(p.mode);
                setC1(p.c1);
                setC2(p.c2);
                setC3(p.c3);
                setUseThird(p.mode === "gradient");
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Cards and navigation stay high-contrast on top of any canvas so text remains readable for everyone.
      </p>

      <SubmitButton />
    </form>
  );
}
