"use client";

import { useCallback, useMemo, useState } from "react";

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
  const [normalized, setNormalized] = useState(initial.normalized);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { display: d, normalized: n } = formatPhpPriceInput(e.target.value);
    setDisplay(d);
    setNormalized(n);
  }, []);

  return (
    <>
      <input type="hidden" name={name} value={normalized} readOnly />
      <input
        id={id}
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
