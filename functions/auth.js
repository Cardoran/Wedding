// Passwort hier eintragen
const CORRECT_PASSWORD = "DEIN_PASSWORT_HIER";

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  const { password } = JSON.parse(event.body);

  if (password === CORRECT_PASSWORD) {
    // Setze Cookie für 30 Tage
    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": `auth=true; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ success: true })
    };
  } else {
    return {
      statusCode: 401,
      body: JSON.stringify({ success: false, error: "Falsches Passwort" })
    };
  }
};