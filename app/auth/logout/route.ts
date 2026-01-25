import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  // Clear the admin session cookie
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")

  revalidatePath("/", "layout")
  return NextResponse.redirect(new URL("/", req.url), {
    status: 302,
  })
}
