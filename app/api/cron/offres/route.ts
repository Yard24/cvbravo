import { NextResponse, type NextRequest } from "next/server";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { XMLParser } from "fast-xml-parser";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

type OffreBrute = { title: string; url: string; description: string; published_at: string; company: string; location: string };

function texte(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return texte(o["#text"] ?? o["__cdata"] ?? "");
  }
  return "";
}

function sansHtml(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dateIso(v: string): string {
  const d = new Date(v);
  return isNaN(d.getTime()) ? "" : d.toISOString();
}

/** Standardise un flux RSS 2.0 ou Atom vers le format commun de la table bd_job_offers. */
function standardiser(xml: string): OffreBrute[] {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", cdataPropName: "__cdata" });
  const doc = parser.parse(xml);
  const brut = doc?.rss?.channel?.item ?? doc?.feed?.entry ?? doc?.["rdf:RDF"]?.item ?? [];
  const items: any[] = Array.isArray(brut) ? brut : [brut];
  return items
    .slice(0, 60)
    .map((it) => {
      const lien =
        typeof it.link === "string"
          ? it.link
          : Array.isArray(it.link)
            ? it.link.find((l: any) => l?.["@_rel"] !== "self")?.["@_href"] ?? ""
            : it.link?.["@_href"] || texte(it.link) || texte(it.guid);
      return {
        title: sansHtml(texte(it.title)),
        url: String(lien || "").trim(),
        description: sansHtml(texte(it["content:encoded"]) || texte(it.description) || texte(it.summary) || texte(it.content)).slice(0, 6000),
        published_at: dateIso(texte(it.pubDate) || texte(it.published) || texte(it.updated) || texte(it["dc:date"])),
        company: sansHtml(texte(it["dc:creator"]) || texte(it.author?.name)).slice(0, 200),
        location: "",
      };
    })
    .filter((o) => o.title && /^https?:\/\//.test(o.url));
}

async function autorise(request: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") === `Bearer ${secret}`) return true;
  const supabase = await createClient();
  const { data } = await supabase.rpc("bd_is_admin");
  return data === true;
}

async function collecter() {
  const secret = process.env.BD_SERVER_SECRET;
  const supabase = createPlainClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const { data: sources, error } = await supabase.rpc("bd_list_sources", { p_secret: secret });
  if (error) return NextResponse.json({ erreur: "Lecture des sources impossible." }, { status: 500 });

  const bilan: { source: string; statut: string; nouvelles: number }[] = [];
  for (const s of sources ?? []) {
    let statut = "ok";
    let offres: OffreBrute[] = [];
    try {
      const res = await fetch(s.url, {
        headers: { "user-agent": "BravodocsBot/1.0 (lecture de flux RSS)", accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" },
        signal: AbortSignal.timeout(15000),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      offres = standardiser(await res.text());
      if (offres.length === 0) statut = "ok (flux vide)";
    } catch (e) {
      statut = `erreur : ${e instanceof Error ? e.message.slice(0, 120) : "inconnue"}`;
    }
    const { data: n } = await supabase.rpc("bd_ingest_offers", { p_secret: secret, p_source: s.id, p_offers: offres, p_status: statut });
    bilan.push({ source: s.name, statut, nouvelles: n ?? 0 });
  }
  const { data: correspondances } = await supabase.rpc("bd_run_matching", { p_secret: secret });
  return NextResponse.json({ sources: bilan, correspondances: correspondances ?? 0 });
}

export async function GET(request: NextRequest) {
  if (!(await autorise(request))) return NextResponse.json({ erreur: "Accès refusé." }, { status: 401 });
  return collecter();
}

export async function POST(request: NextRequest) {
  if (!(await autorise(request))) return NextResponse.json({ erreur: "Accès refusé." }, { status: 401 });
  return collecter();
}
