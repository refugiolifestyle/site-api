import { database } from "@/firebase";
import { ref, push } from "firebase/database";

export async function POST(request: Request) {
    console.log(request)

    const payload = request.body;

    const refSnapshot = ref(database, 'pagamentos')
    await push(refSnapshot, payload)

    return Response.json({ message: "Recebido" })
}
