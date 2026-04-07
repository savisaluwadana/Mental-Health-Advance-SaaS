# 5. Prescription Module

MindBridge SL includes a fully compliant digital prescription generation system, securely locked exclusively to the `psychiatrist` role. Psychologists are programmatically barred from accessing this route.

## Zero-Persistence Architecture
The system is designed to generate medical documents on the fly without ever saving a `.pdf` file to the server's disk or to cloud object storage like AWS S3. This significantly reduces the HIPAA/data-compliance burden and decreases server costs.

## How It Works
1. **Creation:** The psychiatrist fills out medication details (drug name, dosage, frequency).
2. **Signature & Seal:** The psychiatrist signs the document using an HTML Canvas component and uploads their official SLMC rubber seal.
3. **Base64 Storage:** The signature and seal are converted to lightweight Base64 strings and stored directly inside the `Prescription` MongoDB document alongside the text data.
4. **On-Demand Generation:** When the client (or the practitioner) clicks "Download Prescription", it hits the `GET /api/prescriptions/[id]/pdf` route.
5. **Streaming:** The route uses `@react-pdf/renderer` to build a PDF buffer in active server RAM. It injects the Base64 images directly into the PDF layout.
6. **Delivery:** The server streams the buffer to the browser as `application/pdf` with `Cache-Control: no-store`. Once the download completes, the RAM is cleared. The PDF literally ceases to exist on the server.
