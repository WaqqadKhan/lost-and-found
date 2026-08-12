"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function SelectRoot(props: SelectPrimitive.Root.Props<string, false>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "group/select flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border/80 bg-card px-3 text-sm shadow-card outline-none transition-all",
        "hover:border-primary/40 hover:shadow-card-hover",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40",
        "data-[popup-open]:border-primary data-[popup-open]:ring-3 data-[popup-open]:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="text-muted-foreground transition-transform duration-200 group-data-[popup-open]/select:rotate-180">
        <ChevronDownIcon className="size-4 shrink-0" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("line-clamp-1 flex-1 text-left data-[placeholder]:text-muted-foreground", className)}
      {...props}
    />
  );
}

function SelectPopup({ className, children, ...props }: SelectPrimitive.Popup.Props) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner className="z-50 outline-none" sideOffset={6} alignItemWithTrigger={false}>
        <SelectPrimitive.Popup
          data-slot="select-popup"
          className={cn(
            "z-50 max-h-[min(20rem,var(--available-height))] w-[var(--anchor-width)] min-w-[12rem] origin-[var(--transform-origin)] overflow-hidden rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg ring-1 ring-foreground/5",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        >
          <SelectPrimitive.List className="max-h-[18rem] overflow-y-auto outline-none">
            {children}
          </SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-lg py-2 pl-3 pr-8 text-sm outline-none transition-colors",
        "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        "data-[selected]:bg-primary/10 data-[selected]:font-medium data-[selected]:text-primary",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex-1">{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2 flex size-4 items-center justify-center text-primary">
        <CheckIcon className="size-3.5" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export type FancySelectOption = { value: string; label: string };

const EMPTY = "__all__";

export function FancySelect({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  name,
  required,
  disabled,
  className,
  id,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: FancySelectOption[];
  placeholder?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}) {
  const mappedValue = value === "" ? EMPTY : value;
  const mappedOptions = options.map((opt) => ({
    label: opt.label,
    value: opt.value === "" ? EMPTY : opt.value,
  }));
  const labelByValue = Object.fromEntries(mappedOptions.map((o) => [o.value, o.label]));

  return (
    <SelectRoot
      value={mappedValue}
      onValueChange={(v) => {
        const raw = v == null ? "" : String(v);
        onValueChange(raw === EMPTY ? "" : raw);
      }}
      name={name}
      required={required}
      disabled={disabled}
      id={id}
      items={labelByValue}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {(selected) => {
            if (selected == null) return placeholder;
            const key = String(selected);
            return labelByValue[key] ?? (key === EMPTY ? placeholder : key);
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectPopup>
        {mappedOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectPopup>
    </SelectRoot>
  );
}

export { SelectRoot, SelectTrigger, SelectValue, SelectPopup, SelectItem };
