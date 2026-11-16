"use client";

import Link from "next/link";
import BpComposer from "@/components/BpComposer";
import { fcfa } from "@/lib/pricing";

export default function BpPublic() {
  return (
    <BpComposer
      pied={(codes, total) => (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/90 backdrop-blur-xl">
          <div className="wrap flex flex-wrap items-center justify-between gap-3 py-3">
            <div aria-live="polite">
              <p className="text-sm text-muted">{codes.length} élément(s) coché(s)</p>
              <p className="display text-2xl font-semibold tabular-nums">{fcfa(total)}</p>
            </div>
            {codes.length > 0 ? (
              <Link href="/espace/business-plan" className="btn-primary">Continuer avec cette sélection</Link>
            ) : (
              <span className="text-sm text-muted">Cochez au moins un élément</span>
            )}
          </div>
        </div>
      )}
    />
  );
}
