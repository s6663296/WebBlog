"use client";

import { useEffect } from "react";

type AdminPostDraftGuardProps = {
  formId: string;
  storageKey: string;
  fieldNames: string[];
};

type DraftSnapshot = Record<string, string>;

function getField(form: HTMLFormElement, fieldName: string) {
  const field = form.elements.namedItem(fieldName);
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    return field;
  }

  return null;
}

function readSnapshot(form: HTMLFormElement, fieldNames: string[]): DraftSnapshot {
  const next: DraftSnapshot = {};

  for (const fieldName of fieldNames) {
    const field = getField(form, fieldName);
    if (!field) {
      continue;
    }

    next[fieldName] = field.value;
  }

  return next;
}

function applySnapshot(form: HTMLFormElement, snapshot: DraftSnapshot, fieldNames: string[]) {
  for (const fieldName of fieldNames) {
    const value = snapshot[fieldName];
    if (typeof value !== "string") {
      continue;
    }

    const field = getField(form, fieldName);
    if (!field) {
      continue;
    }

    field.value = value;
    field.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

export function AdminPostDraftGuard({ formId, storageKey, fieldNames }: AdminPostDraftGuardProps) {
  useEffect(() => {
    const form = document.getElementById(formId);
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const key = `admin-post-draft:${storageKey}`;
    const params = new URLSearchParams(window.location.search);
    const hasError = params.has("error");
    const hasSuccess = params.has("saved") || params.has("updated") || params.has("deleted");

    if (!hasError && hasSuccess) {
      window.sessionStorage.removeItem(key);
    }

    if (hasError) {
      const stored = window.sessionStorage.getItem(key);
      if (stored) {
        try {
          applySnapshot(form, JSON.parse(stored) as DraftSnapshot, fieldNames);
        } catch {
          window.sessionStorage.removeItem(key);
        }
      }
    }

    const persist = () => {
      const snapshot = readSnapshot(form, fieldNames);
      window.sessionStorage.setItem(key, JSON.stringify(snapshot));
    };

    form.addEventListener("input", persist);
    form.addEventListener("change", persist);
    form.addEventListener("submit", persist);

    return () => {
      form.removeEventListener("input", persist);
      form.removeEventListener("change", persist);
      form.removeEventListener("submit", persist);
    };
  }, [fieldNames, formId, storageKey]);

  return null;
}
