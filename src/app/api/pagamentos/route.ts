import { database } from "@/firebase";
import { ref, push } from "firebase/database";

export async function POST(request: Request) {
    const payload = await request.json();

    return Response.json({ message: "Recebido", ...payload })
}
