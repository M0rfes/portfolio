"use client";

import { useMemo, useState } from "react";
import { Check, Search, Tags, X } from "lucide-react";

type TagPickerProps = {
  tags: string[];
  selected: string[];
  counts: Record<string, number>;
  onChange: (tags: string[]) => void;
};

export function TagPicker({
  tags,
  selected,
  counts,
  onChange,
}: TagPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = term
      ? tags.filter((tag) => tag.toLowerCase().includes(term))
      : tags;
    return [...filtered].sort((a, b) => {
      const selectedDelta =
        Number(selected.includes(b)) - Number(selected.includes(a));
      if (selectedDelta) return selectedDelta;
      return a.localeCompare(b);
    });
  }, [query, selected, tags]);

  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((item) => item !== tag));
      return;
    }
    onChange([...selected, tag]);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full min-h-12 px-4 rounded-xl border border-border bg-card text-foreground flex items-center justify-between gap-3"
      >
        <span className="inline-flex items-center gap-2">
          <Tags className="w-4 h-4 text-primary" />
          {selected.length === 0
            ? "Filter tags"
            : `${selected.length} tag${selected.length === 1 ? "" : "s"}`}
        </span>
        <span className="text-sm text-muted-foreground">
          {tags.length} total
        </span>
      </button>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selected.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className="min-h-10 px-3 rounded-full bg-secondary text-secondary-foreground text-sm inline-flex items-center gap-1"
            >
              {tag}
              <X className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label="Close tag picker"
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl bg-card border-t border-border flex flex-col">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <p className="font-medium text-foreground">Tags</p>
              <div className="flex items-center gap-2">
                {selected.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange([])}
                    className="min-h-11 px-3 text-sm text-muted-foreground"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="min-h-11 px-3 rounded-lg text-primary"
                >
                  Done
                </button>
              </div>
            </div>
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search tags"
                  className="w-full min-h-12 pl-10 pr-3 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground"
                />
              </div>
            </div>
            <div className="overflow-y-auto px-2 pb-6">
              {visible.length === 0 ? (
                <p className="px-3 py-6 text-sm text-muted-foreground text-center">
                  No tags match
                </p>
              ) : (
                visible.map((tag) => {
                  const isOn = selected.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggle(tag)}
                      className={`w-full min-h-12 px-3 rounded-xl flex items-center justify-between gap-3 text-left ${
                        isOn ? "bg-muted text-foreground" : "text-foreground"
                      }`}
                    >
                      <span className="inline-flex items-center gap-3">
                        <span
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            isOn
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-border"
                          }`}
                        >
                          {isOn && <Check className="w-3.5 h-3.5" />}
                        </span>
                        {tag}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {counts[tag] ?? 0}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
