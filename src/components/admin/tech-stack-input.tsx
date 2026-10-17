"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TECH_STACK_SUGGESTIONS } from "@/lib/constants";

interface TechStackInputProps {
  value: string[];
  onChange: (next: string[]) => void;
}

/** Multi-tag input for the `tech_stack` text[] column. */
export function TechStackInput({ value, onChange }: TechStackInputProps) {
  const [draft, setDraft] = useState("");

  function add(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    if (value.some((item) => item.toLowerCase() === tag.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  }

  const remaining = TECH_STACK_SUGGESTIONS.filter(
    (suggestion) => !value.some((item) => item.toLowerCase() === suggestion.toLowerCase()),
  ).slice(0, 6);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              add(draft);
            }
            if (event.key === "Backspace" && !draft && value.length > 0) {
              onChange(value.slice(0, -1));
            }
          }}
          placeholder="Type a technology and press Enter"
          aria-label="Add technology"
        />
        <Button type="button" variant="outline" onClick={() => add(draft)}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-md border border-blue-800/50 bg-blue-950/50 px-2 py-1 text-[0.7rem] text-blue-400"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((item) => item !== tag))}
                aria-label={`Remove ${tag}`}
                className="text-blue-400/70 transition-colors hover:text-blue-200"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {remaining.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[0.65rem] text-fg-subtle">suggestions:</span>
          {remaining.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => add(suggestion)}>
              <Badge variant="outline" className="cursor-pointer hover:border-accent/60 hover:text-accent-soft">
                + {suggestion}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
