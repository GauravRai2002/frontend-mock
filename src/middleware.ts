import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/auth/login(.*)', '/auth/signup(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const newUrl = new URL('auth/login', req.url).toString()
  if (!isPublicRoute(req)) {
     await auth.protect({
      unauthenticatedUrl:newUrl
     })
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}