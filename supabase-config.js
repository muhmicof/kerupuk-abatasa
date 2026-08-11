/* ==========================================================================
   Kerupuk Abatasa - Supabase Configuration
   ========================================================================== */

const SUPABASE_URL = 'https://donsstmllfbusrdsvdnt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_7IDqHj49aMuFWuNowDEP-A_UXxShDCT';

// The jsDelivr CDN exposes the Supabase library as 'window.supabase'.
// We create the client instance and name it 'supabaseClient' 
// to avoid overwriting the library's global 'supabase' namespace.
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
