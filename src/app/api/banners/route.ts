import { database } from "@/configs/firebase";
import { BannerType, CelulaType } from "@/types";
import { get, ref } from "firebase/database";

export async function GET() {
    const refbanners = ref(database, "banners")
    const snapshotbanners = await get(refbanners)

    const banners = snapshotbanners.val() as BannerType[]

    return Response.json({ banners })
}
