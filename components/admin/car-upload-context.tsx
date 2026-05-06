"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Status = {
  /** True while at least one image is still uploading. Submit must wait. */
  hasPending: boolean;
  /** True when at least one image failed and hasn't been replaced. UI hint only. */
  hasError: boolean;
};

type Updater = (next: Status) => void;

const Ctx = createContext<{ status: Status; setStatus: Updater }>({
  status: { hasPending: false, hasError: false },
  setStatus: () => {},
});

/**
 * Wraps the new-car form so the picker can broadcast per-file upload state
 * and the submit button can disable itself while pre-uploads are in flight.
 */
export function CarUploadProvider({ children }: { children: ReactNode }) {
  const [status, setStatusState] = useState<Status>({
    hasPending: false,
    hasError: false,
  });

  const setStatus = useCallback<Updater>((next) => {
    setStatusState((prev) =>
      prev.hasPending === next.hasPending && prev.hasError === next.hasError
        ? prev
        : next,
    );
  }, []);

  const value = useMemo(() => ({ status, setStatus }), [status, setStatus]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCarUploadStatus() {
  return useContext(Ctx);
}
