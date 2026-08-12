"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FancySelect } from "@/components/ui/select";
import { updateItemAdmin, type AdminItemFormState } from "@/app/actions/admin";
import { ITEM_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

const initialState: AdminItemFormState = { error: "" };

export type AdminEditItemInitial = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  type: string;
};

export function AdminEditItemForm({ item }: { item: AdminEditItemInitial }) {
  const [state, formAction] = useFormState(updateItemAdmin, initialState);
  const [category, setCategory] = useState(item.category);

  return (
    <form action={formAction} className="mx-auto max-w-xl space-y-4">
      <input type="hidden" name="id" value={item.id} />
      <input type="hidden" name="category" value={category} />

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={item.title} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={item.description}
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <FancySelect
          id="category"
          value={category}
          onValueChange={setCategory}
          options={ITEM_CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" required defaultValue={item.location} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" required defaultValue={item.date} />
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
              defaultChecked={item.type !== "found"}
            />
            Lost
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="type" value="found" defaultChecked={item.type === "found"} />
            Found
          </label>
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <SubmitButton />
        <Link href="/admin/items" className={cn(buttonVariants({ variant: "outline" }))}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
