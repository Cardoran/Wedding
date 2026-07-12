export default async (request, context) => {
    const authCookie = request.cookies.get("auth");
  
    if (authCookie !== "true") {
      return Response.redirect(
        new URL("/index.html", request.url),
        302
      );
    }
  
    return context.next();
  };