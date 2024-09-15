export default {
    sandbox: false,
    client_id: process.env.EFI_ID,
    client_secret: process.env.EFI_SECRET,
    certificate: btoa(process.env.EFI_CERT || ""),
    pemKey: btoa(process.env.EFI_KEY || ""),
    cert_base64: true
}
