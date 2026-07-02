"use client";

/**
 * Canonical reference data sourced from the backend (never hardcoded):
 *   GET /states        -> [{ code, name }]      (display name, store 2-letter code)
 *   GET /degree-levels -> ["Associate Degree", "Bachelor's Degree", ...]  (ordered)
 *
 * Both go through the authed-fetch wrapper so the app JWT is attached when the
 * endpoints are auth-protected. Results are cached per session and shared via
 * simple hooks.
 */

import { useEffect, useState } from "react";
import { authedFetch } from "./auth/api";

export interface StateOption {
  code: string;
  name: string;
}

/** Normalize a /states row to { code, name }, tolerating a few key spellings. */
function normalizeState(raw: unknown): StateOption | null {
  if (typeof raw === "string") return { code: raw, name: raw };
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const code = (o.code ?? o.state_code ?? o.abbreviation ?? o.value) as
      string | undefined;
    // Backend uses `state_title` for the display name (see GET /states).
    const name = (o.name ??
      o.state_title ??
      o.state_name ??
      o.label ??
      code) as string | undefined;
    if (code) return { code: String(code), name: String(name ?? code) };
  }
  return null;
}

/** Normalize a /degree-levels entry to its canonical string (submit value). */
function normalizeDegreeLevel(raw: unknown): string | null {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const v = o.value ?? o.name ?? o.label;
    return v != null ? String(v) : null;
  }
  return null;
}

let statesCache: StateOption[] | null = null;
let statesInflight: Promise<StateOption[]> | null = null;

export async function fetchStates(): Promise<StateOption[]> {
  if (statesCache) return statesCache;
  if (statesInflight) return statesInflight;
  statesInflight = (async () => {
    try {
      const res = await authedFetch("/states");
      if (!res.ok) throw new Error(`Load states failed (${res.status})`);
      const data = await res.json();
      const list = Array.isArray(data)
        ? data.map(normalizeState).filter((s): s is StateOption => s !== null)
        : [];
      statesCache = list;
      return list;
    } finally {
      statesInflight = null;
    }
  })();
  return statesInflight;
}

let degreeLevelsCache: string[] | null = null;
let degreeLevelsInflight: Promise<string[]> | null = null;

export async function fetchDegreeLevels(): Promise<string[]> {
  if (degreeLevelsCache) return degreeLevelsCache;
  if (degreeLevelsInflight) return degreeLevelsInflight;
  degreeLevelsInflight = (async () => {
    try {
      const res = await authedFetch("/degree-levels");
      if (!res.ok) throw new Error(`Load degree levels failed (${res.status})`);
      const data = await res.json();
      // Preserve the backend's order.
      const list = Array.isArray(data)
        ? data.map(normalizeDegreeLevel).filter((d): d is string => d !== null)
        : [];
      degreeLevelsCache = list;
      return list;
    } finally {
      degreeLevelsInflight = null;
    }
  })();
  return degreeLevelsInflight;
}

/** Hook: the canonical states list ([] until loaded). */
export function useStates(): { states: StateOption[]; loading: boolean } {
  const [states, setStates] = useState<StateOption[]>(statesCache ?? []);
  const [loading, setLoading] = useState(statesCache === null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await fetchStates();
        if (active) setStates(list);
      } catch (err) {
        console.error("Failed to load states:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { states, loading };
}

/** Hook: the canonical, ordered degree-level strings ([] until loaded). */
export function useDegreeLevels(): {
  degreeLevels: string[];
  loading: boolean;
} {
  const [degreeLevels, setDegreeLevels] = useState<string[]>(
    degreeLevelsCache ?? [],
  );
  const [loading, setLoading] = useState(degreeLevelsCache === null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await fetchDegreeLevels();
        if (active) setDegreeLevels(list);
      } catch (err) {
        console.error("Failed to load degree levels:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { degreeLevels, loading };
}
