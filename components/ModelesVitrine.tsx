import CvPreview, { MODELES } from "@/components/CvPreview";
import { CV_EXEMPLE } from "@/lib/exemple";

/** Aperçus réduits des modèles de CV, remplis avec un CV fictif. */
export default function ModelesVitrine() {
  return (
    <div className="-mx-5 flex snap-x gap-5 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
      {MODELES.map((m) => (
        <figure key={m.code} className="w-[300px] shrink-0 snap-center sm:w-auto">
          <div aria-hidden className="h-[340px] overflow-hidden rounded-3xl bg-tile p-4">
            <div className="pointer-events-none w-[794px] origin-top-left scale-[0.34] select-none lg:scale-[0.38]">
              <CvPreview template={m.code} data={CV_EXEMPLE} />
            </div>
          </div>
          <figcaption className="mt-3">
            <span className="block font-semibold">{m.label}</span>
            <span className="block text-sm text-muted">{m.detail}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
