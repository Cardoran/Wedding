exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  // 🔑 Passwort aus Environment Variable lesen
  const CORRECT_PASSWORD = process.env.LOGIN_PASSWORD;
  const SECRET_AUTH = process.env.SECRET_AUTH;

  if (!CORRECT_PASSWORD) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server nicht korrekt konfiguriert" })
    };
  }

  const { password } = JSON.parse(event.body);

  if (password === CORRECT_PASSWORD) {
    // Login erfolgreich – setze Cookie
    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": `auth=`+SECRET_AUTH+`; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ success: true })
    };
  } else {
    // Falsches Passwort
    return {
      statusCode: 401,
      body: JSON.stringify({ success: false, error: "Falsches Passwort" })
    };
  }
};