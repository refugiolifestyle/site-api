export async function POST(request: Request) {
    const response = new Response(request.body)
    const webhook = await response.json();

    console.log("pagamentos", webhook)

    return Response.json({}, { status: 200 })
}