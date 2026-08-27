import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)'],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';
  const currentHost = hostname.replace(/:[0-9]+$/, '');
  const rootDomain = 'worldwidewebwork.com';

  const isSubdomain = currentHost.endsWith(`.${rootDomain}`);
  const subdomain = isSubdomain
    ? currentHost.replace(`.${rootDomain}`, '')
    : null;

  // 1. Fresh Mints Dashboard (freshmints.worldwidewebwork.com or localhost dev)
  if (subdomain === 'freshmints' || (!subdomain && currentHost.includes('localhost'))) {
    return NextResponse.next();
  }

  // 2. Preview Hub (preview.worldwidewebwork.com)
  if (subdomain === 'preview') {
    return NextResponse.rewrite(new URL(`/preview${url.pathname}`, req.url));
  }

  // 3. Dynamic Practitioner & Tenant Subdomains (*.worldwidewebwork.com)
  if (subdomain && subdomain !== 'www') {
    return NextResponse.rewrite(new URL(`/preview/${subdomain}${url.pathname}`, req.url));
  }

  // 4. Redirect unhandled apex or www requests to the primary website
  return NextResponse.redirect('https://www.worldwidewebwork.com');
}
