import { database } from "@/firebase";
import { get, ref } from "firebase/database";

export async function GET() {
    const refCelulas = ref(database, "celulas")
    const snapshotCelulas = await get(refCelulas)

    const celulas = snapshotCelulas.val()

    return Response.json({ celulas })
}
