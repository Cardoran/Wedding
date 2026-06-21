const { createClient } = require('@supabase/supabase-js');

// Initialisiere Supabase-Client mit Environment Variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY must be set in Netlify Environment Variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  console.log('📥 Eingehende Anfrage:', event.httpMethod, new Date().toISOString());

  if (event.httpMethod !== 'POST') {
    console.log('❌ Falsche Methode:', event.httpMethod);
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, allergies } = JSON.parse(event.body);
    console.log('📝 Neue Rückmeldung:', { name, allergies: allergies?.substring(0, 20) + '...' });

    // Speichere in Supabase
    const { data, error } = await supabase
      .from('rsvps')
      .insert([{ name, allergies }]);

    if (error) {
      console.error('❌ Supabase Fehler:', error);
      throw error;
    }

    console.log('✅ Erfolgreich gespeichert:', data);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, data })
    };
  } catch (error) {
    console.error('❌ Server-Fehler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};