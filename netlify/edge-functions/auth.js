function getCookie(request, name) {
    const cookieHeader = request.headers.get("cookie");
  
    if (!cookieHeader) return null;
  
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map(cookie => {
        const [key, ...rest] = cookie.trim().split("=");
        return [key, rest.join("=")];
      })
    );
  
    return cookies[name];
  }
  
  export default async (request, context) => {
    const auth = getCookie(request, "auth");
  
    if (auth !== "true") {
      return Response.redirect(
        new URL("/index.html", request.url),
        302
      );
    }
  
    return context.next();
  };