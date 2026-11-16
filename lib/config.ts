// Adresse et clé *publiable* du projet Supabase : ce sont des valeurs publiques par conception
// (elles sont envoyées au navigateur). Les variables d'environnement, si elles existent, priment.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gdgliuzelpfhfuqrhank.supabase.co";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_LgiCWGLOdhms9KmeBJGbkg_FTvBACnv";
