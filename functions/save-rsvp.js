const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY must be set');
}

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const body = JSON.parse(event.body);
    const { name, attendance, allergies } = body;

    // Validierung
    if (!name || !attendance) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Name und Teilnahme-Status sind Pflichtfelder' })
      };
    }

    const sanitizedAllergies =
        typeof allergies === "string" && allergies.trim() !== ""
            ? allergies.trim()
            : null;

    const { error } = await supabase
      .from('rsvps')
      .insert([{
        name: name.trim(),
        attendance: attendance,
        allergies: sanitizedAllergies  // Jetzt immer null oder String
      }]);

    if (error) {
      console.error('Supabase Fehler:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Fehler beim Speichern' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Server-Fehler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Interner Serverfehler' })
    };
  }
};