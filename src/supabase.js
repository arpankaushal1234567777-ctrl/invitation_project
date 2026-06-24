import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const SUPABASE_MUSIC_BUCKET =
  import.meta.env.VITE_SUPABASE_MUSIC_BUCKET || "wedding-media";
export const SUPABASE_MUSIC_PATH = "music/current.mp3";
export const SUPABASE_MUSIC_ROW_ID = "global";

export const SUPABASE_GALLERY_BUCKET = "wedding-gallery";
export const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const VALID_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
export const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
export const MAX_IMAGES_PER_GALLERY = 20;
