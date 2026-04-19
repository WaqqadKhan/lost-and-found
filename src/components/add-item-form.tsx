"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createItem, type ItemFormState } from "@/app/actions/items";
import { ITEM_CATEGORIES } from "@/lib/constants";
import { nativeSelectClassName } from "@/lib/select-styles";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? "Saving…" : "Submit report"}
    </Button>
  );
}

const initialState: ItemFormState = { error: "" };

export function AddItemForm({ defaultType = "lost" }: { defaultType?: string }) {
  const [state, formAction] = useFormState(createItem, initialState);
  const [category, setCategory] = useState("Other");

  return (
    <form action={formAction} className="mx-auto max-w-xl space-y-4">
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required placeholder="Short title" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          placeholder="Details that help others recognize the item"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={nativeSelectClassName}
        >
          {ITEM_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" required placeholder="Campus / area" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" required />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Type</legend>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="lost"
              required
              defaultChecked={defaultType !== "found"}
            />
            Lost
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="found"
              defaultChecked={defaultType === "found"}
            />
            Found
          </label>
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="image">Photo (optional)</Label>
        <Input id="image" name="image" type="file" accept="image/*" />
      </div>

      <SubmitButton />
    </form>
  );
}
