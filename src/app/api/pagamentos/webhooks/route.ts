import { database } from "@/firebase";
import { ref, push } from "firebase/database";

export async function POST(request: Request) {
    const webhookResponse = new Response(request.body);
    const payload = await webhookResponse.text()

    console.log(payload)

    const refSnapshot = ref(database, 'pagamentos')
    await push(refSnapshot, payload)

    return Response.json({ message: "Recebido" })
}
