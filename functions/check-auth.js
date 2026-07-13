exports.handler = async (event) => {
    const authCookie = event.headers.cookie?.split('; ')
      .find(c => c.startsWith('auth='))?.split('=')[1];
  
    if (authCookie === 'true') {
      return { statusCode: 200, body: JSON.stringify({ authenticated: true }) };
    } else {
      return { statusCode: 401, body: JSON.stringify({ authenticated: false }) };
    }
  };