import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

import { updateSession, validarSesion, razonASlug } from "@/lib/supabaseProxy";


export async function proxy(req: NextRequest) {

  const { pathname } = req.nextUrl

  const { supabase } = updateSession(req)

  const { data: { user } } = await supabase.auth.getUser()

  const idUser = user?.id ?? ""

  const validacion = await validarSesion(idUser, req)

  if (!validacion.ok) {
    if (validacion.razon === "no_user") {
      return NextResponse.redirect(new URL('/authPage/SignInPage', req.url))
    }
    return NextResponse.redirect(
      new URL(`/error/${razonASlug(validacion.razon)}?clear=1`, req.url)
    )
  }

  const { rol } = validacion

  // Cada bloque define qué roles pueden ver la sección. Si el rol no coincide,
  // mandamos al login (no a /error/sin-permisos) porque el rol del usuario sí
  // existe y tiene permisos, simplemente no le toca esta ruta.

  if (pathname.startsWith('/EvaluarPage') && !['jurado'].includes(rol)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/mis-eventos-asignados') && rol !== 'jurado') {
    return NextResponse.redirect(new URL('/', req.url))
  }



  if (pathname.startsWith('/mi-banda-page') && !['director artistico', 'lider de banda', 'directorArtistico', 'liderBanda', 'dirigente'].includes(rol)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/sup') && !['developer'].includes(rol)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/dev') && !['developer'].includes(rol)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/PanelControlPage') && !['admin', 'admin temporal'].includes(rol)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/PanelControlPage/recuperar-contrasena') && rol !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/fiscal') && rol !== 'fiscal') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/responsable-bandas') && rol !== 'responsable de bandas') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/responsable-rubricas') && rol !== 'responsable de rubricas') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/responsable-usuarios') && rol !== 'responsable de usuarios') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/responsable-eventos') && rol !== 'responsable de eventos') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/responsable-mesa') && rol !== 'responsable de mesa') {
    return NextResponse.redirect(new URL('/', req.url))
  }
  if (pathname.startsWith('/secretaria') && rol !== 'secretaria') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/diciplina') && rol !== 'comite de disciplina') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/miPerfilPage') && !rol) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/federacionesHomePage') && !['developer'].includes(rol)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()

}


export const config = {

  matcher: [

    '/EvaluarPage/:path*',

    '/PanelControlPage/:path*',

    '/miPerfilPage/:path*',

    '/ReportesPage/:path*',

    '/resutados-detallados-banda/:path*',

    '/federacionesHomePage/:path*',

    '/mi-banda-page/:path*',

    '/fiscal/:path*',

    '/responsable-bandas/:path*',

    '/responsable-rubricas/:path*',

    '/responsable-usuarios/:path*',

    '/responsable-eventos/:path*',

    '/responsable-mesa/:path*',
    '/secretaria/:path*',
    '/diciplina/:path*',
    '/dev/:path*',

  ]

};
