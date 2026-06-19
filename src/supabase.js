import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jrklwbcvstcryzrpgyfn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_UtHioR14L9Q3DxaJkOmwxQ_6Rj7u0Fb";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);