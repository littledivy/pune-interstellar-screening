export default function QRScanner() {
  return (
    <>
      <video id="preview" style={{ width: "100%" }}></video>
      <p id="result" className="p-4"></p>
      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: `
        import QrScanner from "https://cdn.skypack.dev/qr-scanner";
        const video = document.getElementById("preview");
        const scanner = new QrScanner(video, async (scan) => {
          const result = await fetch("/api/scan", {
            method: "POST",
            body: JSON.stringify({
              scan,
            }),
          });
          const { verified, text } = await result.json();
          const status = verified ? "Verified!" : "Not Verified";
          if (verified) {
            document.getElementById("result").innerHTML = \`✅ <div style="color: green;">\${status}</div>\` + text;
          } else {
            document.getElementById("result").innerText = "Not verified! This QR is invalid."
          }
        }, {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        });
        scanner.start().then(() => alert("Camera started"))`,
        }}
      />
    </>
  );
}
