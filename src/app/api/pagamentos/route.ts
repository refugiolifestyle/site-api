import { database } from "@/firebase";
import { ref, push } from "firebase/database";

export async function POST(request: Request) {
    const payload = await request.json();

    const refSnapshot = ref(database, 'pagamentos')
    await push(refSnapshot, payload)

    return Response.json({ message: "Recebido" })
}
