/* ==========================================================================
   Kerupuk Abatasa - Supabase Configuration
   ========================================================================== */


// The jsDelivr CDN exposes the Supabase library as 'window.supabase'.
// We create the client instance and name it 'supabaseClient' 
// to avoid overwriting the library's global 'supabase' namespace.
const supabaseUrl = 'https://gppcsimmimcdthiayqfs.supabase.co';
const supabaseAnonKey = 'sb_publishable_1Wc4_LFle2TIlIwUcq_9Yw_3b0vNFbL';

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
