const { createClient } = require('@supabase/supabase-js');

// Initialisiere Supabase-Client mit Environment Variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY must be set in Netlify Environment Variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Empfange alle Felder: name, attendance, allergies
    const { name, attendance, allergies } = JSON.parse(event.body);

    // Validierung
    if (!name || !attendance) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Name und Teilnahme-Status sind Pflichtfelder' })
      };
    }

    // Speichere in Supabase
    const { data, error } = await supabase
      .from('rsvps')
      .insert([{
        name: name.trim(),
        attendance: attendance, // "yes" oder "no"
        allergies: allergies?.trim() || null // Optional: Leere Strings als null speichern
      }]);

    if (error) {
      console.error('Supabase Fehler:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Fehler beim Speichern in der Datenbank' })
      };
    }

    console.log('Erfolgreich gespeichert:', { name, attendance });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, data })
    };
  } catch (error) {
    console.error('Server-Fehler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};