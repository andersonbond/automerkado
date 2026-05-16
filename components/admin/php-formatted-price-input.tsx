"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Formats price as user types: thousands commas; optional decimals (max 2).
 * `normalized` is digits with optional "." — safe for server / Zod.
 */
export function formatPhpPriceInput(rawInput: string): {
  display: string;
  normalized: string;
} {
  const cleaned = rawInput.replace(/,/g, "").replace(/\s/g, "");
  if (!cleaned) return { display: "", normalized: "" };

  const dotIdx = cleaned.indexOf(".");
  const intDigits =
    dotIdx === -1
      ? cleaned.replace(/\D/g, "")
      : cleaned.slice(0, dotIdx).replace(/\D/g, "");

  const decDigits =
    dotIdx === -1 ? "" : cleaned.slice(dotIdx + 1).replace(/\D/g, "").slice(0, 2);

  const intGrouped = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  let display = intGrouped;
  if (dotIdx !== -1) {
    if (decDigits.length > 0) {
      display = (intDigits ? intGrouped : "0") + "." + decDigits;
    } else if (cleaned.endsWith(".")) {
      display = intDigits ? `${intGrouped}.` : ".";
    } else {
      display = `${intGrouped}.${decDigits}`;
    }
  }

  let normalized = "";
  if (dotIdx === -1) {
    normalized = intDigits;
  } else if (decDigits.length === 0) {
    normalized = intDigits;
  } else {
    normalized = `${intDigits || "0"}.${decDigits}`;
  }

  return { display, normalized };
}

type Props = {
  name: string;
  id?: string;
  required?: boolean;
  /** Raw numeric string without commas, e.g. from DB */
  defaultValue?: string;
  className?: string;
  placeholder?: string;
};

export function PhpFormattedPriceInput({
  name,
  id,
  required,
  defaultValue = "",
  className,
  placeholder,
}: Props) {
  const initial = useMemo(() => {
    const raw = defaultValue.replace(/,/g, "").trim();
    if (!raw) return { display: "", normalized: "" };
    return formatPhpPriceInput(raw);
  }, [defaultValue]);

  const [display, setDisplay] = useState(initial.display);

  const visibleRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);

  /** Keep hidden `price` in sync with the visible field at submit (autofill/DOM-only changes bypass React state). */
  useEffect(() => {
    const visible = visibleRef.current;
    const hidden = hiddenRef.current;
    if (!visible || !hidden) return;
    const form = visible.closest("form");
    if (!form) return;

    const syncHiddenFromVisible = () => {
      const { normalized: n } = formatPhpPriceInput(visible.value ?? "");
      hidden.value = n;
    };

    form.addEventListener("submit", syncHiddenFromVisible, true);
    return () => form.removeEventListener("submit", syncHiddenFromVisible, true);
  }, []);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { display: d, normalized: n } = formatPhpPriceInput(e.target.value);
    setDisplay(d);
    if (hiddenRef.current) hiddenRef.current.value = n;
  }, []);

  return (
    <>
      {/* Uncontrolled hidden field: React `value={normalized}` would overwrite DOM
          updates from submit-time sync before FormData is built, yielding empty price + failed saves. */}
      <input type="hidden" name={name} ref={hiddenRef} defaultValue={initial.normalized} />
      <input
        id={id}
        ref={visibleRef}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={display}
        onChange={onChange}
        required={required}
        className={className}
        placeholder={placeholder}
      />
    </>
  );
}
