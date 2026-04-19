"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createItem, type ItemFormState } from "@/app/actions/items";
import { CAMPUS_LOCATIONS, ITEM_CATEGORIES } from "@/lib/constants";
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [filesCount, setFilesCount] = useState(0);

  const progress =
    (title.trim() ? 20 : 0) +
    (description.trim().length >= 20 ? 20 : 0) +
    (category ? 15 : 0) +
    (location.trim() ? 15 : 0) +
    (date ? 10 : 0) +
    (filesCount > 0 ? 20 : 0);
  const message =
    progress <= 40
      ? "Just getting started..."
      : progress <= 60
        ? "Good start! Add more details."
        : progress <= 80
          ? "Looking great! A photo would help a lot."
          : "Excellent! This post has the best chance of a match.";
  const progressColor =
    progress <= 40
      ? "bg-red-500"
      : progress <= 60
        ? "bg-orange-500"
        : progress <= 80
          ? "bg-yellow-500"
          : "bg-green-500";

  return (
    <form action={formAction} className="mx-auto max-w-xl space-y-4">
      <div className="space-y-1">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all duration-300 ${progressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {progress}% complete — {message}
        </p>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="Short title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          placeholder="Details that help others recognize the item"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
        <Input
          id="location"
          name="location"
          required
          placeholder="Campus / area"
          list="campus-location-list"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <datalist id="campus-location-list">
          {CAMPUS_LOCATIONS.map((place) => (
            <option key={place} value={place} />
          ))}
        </datalist>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
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
        <Label htmlFor="images">Photos (optional, up to 3)</Label>
        <Input
          id="images"
          name="images"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFilesCount(e.currentTarget.files?.length || 0)}
        />
      </div>

      <div className="space-y-2 rounded-lg border p-3">
        <Label htmlFor="verificationQuestion">Security question (optional)</Label>
        <p className="text-xs text-muted-foreground">
          Set a question only the true owner would know.
        </p>
        <Input
          id="verificationQuestion"
          name="verificationQuestion"
          placeholder="Example: What sticker is on the back of the laptop?"
        />
        <Input id="verificationAnswer" name="verificationAnswer" placeholder="Expected answer" />
      </div>

      <SubmitButton />
    </form>
  );
}
