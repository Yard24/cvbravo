import { SUPABASE_KEY, SUPABASE_URL } from "./config";
import { createClient } from "@supabase/supabase-js";
import { RELECTURE_DEFAUT, type RelectureSettings } from "./pricing";

export type Reglages = {
  relecture: RelectureSettings;
  redaction: Record<string, number>;
};

const DEFAUT: Reglages = {
  relecture: RELECTURE_DEFAUT,
  redaction: { licence: 100000, master_pro: 180000, master_recherche: 250000 },
};

/** Lecture publique des tarifs (pages vitrines). Retombe sur les valeurs par défaut si la base est injoignable. */
export async function lireReglages(): Promise<Reglages> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabase.from("bd_settings").select("key,value").in("key", ["relecture", "redaction"]);
    if (error || !data) return DEFAUT;
    const m = Object.fromEntries(data.map((r) => [r.key, r.value]));
    return { relecture: m.relecture ?? DEFAUT.relecture, redaction: m.redaction ?? DEFAUT.redaction };
  } catch {
    return DEFAUT;
  }
}
