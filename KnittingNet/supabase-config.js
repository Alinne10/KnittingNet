const SUPABASE_URL = 'https://svudvukwclqgljfmwtrs.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2cukBt_lMBiUJstOVsJfNQ_CtqjUUUb';

window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const supabaseClient = window.sb;