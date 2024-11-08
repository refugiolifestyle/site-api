import { database } from "@/configs/firebase";
import { BannerType, CelulaType } from "@/types";
import { get, ref } from "firebase/database";

export async function GET() {
    const refbanners = ref(database, "banner")
    const snapshotbanners = await get(refbanners)

    let banner = snapshotbanners.val()

    if (!banner.ativo) {
        banner = null
    }

    return Response.json({ banner })
}
