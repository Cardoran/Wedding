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
    
    const pathname = new URL(request.url).pathname;
  
    // öffentlich zugängliche Seiten
    if (
      pathname === "/" ||
      pathname === "/index.html" ||
      pathname.startsWith("/.netlify/functions/check-auth")
    ) {
      return context.next();
    }

    const auth = getCookie(request, "auth");
  
    if (auth !== "true") {
      return Response.redirect(
        new URL("/index.html", request.url),
        302
      );
    }
  
    return context.next();
  };

//   export default async (request, context) => {
//     const pathname = new URL(request.url).pathname;
  
//     // öffentlich zugängliche Seiten
//     if (
//       pathname === "/" ||
//       pathname === "/index.html" ||
//       pathname.startsWith("/.netlify/functions/login")
//     ) {
//       return context.next();
//     }
  
//     const cookie = request.headers.get("cookie") || "";
  
//     const auth = cookie
//       .split(";")
//       .map(x => x.trim())
//       .find(x => x.startsWith("auth="))
//       ?.split("=")[1];
  
//     if (auth !== "true") {
//       return Response.redirect(
//         new URL("/index.html", request.url),
//         302
//       );
//     }
  
//     return context.next();
//   };