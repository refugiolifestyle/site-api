import { database } from "@/configs/firebase";
import { CelulaType } from "@/types";
import { get, ref } from "firebase/database";

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
    const refCelulas = ref(database, "celulas")
    const snapshotCelulas = await get(refCelulas)

    const celulas = snapshotCelulas.val() as CelulaType[]

    return Response.json({ celulas })
}
