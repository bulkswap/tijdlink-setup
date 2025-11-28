// public/link.js – 100 % modern, geen HTML nodig
(() => {
  // Alleen uitvoeren als de URL begint met /link/
  if (!location.pathname.startsWith('/link/') && location.pathname !== '/link') return;

  const slug = location.pathname.split('/link/')[1] || location.pathname.slice(6);
  if (!slug || slug === '/') {
    document.body.innerHTML = `<h2 style="text-align:center;margin-top:100px;color:#e74c3c">Link niet gevonden</h2>`;
    return;
  }

  // Jouw eigen Vercel backend
  const API = "https://cadeaukaart-setup-5krf68fu8-kays-projects-c29956c3.vercel.app/api/open?id=";

  fetch(API + slug)
    .then(r => r.json())
    .then(data => {
      if (!data || Date.now() > data.expires) {
        document.body.innerHTML = `<div style="text-align:center;margin-top:100px"><h2 style="color:#e74c3c">Deze betaallink is verlopen</h2><p>Werkt slechts 7 minuten vanaf openen.</p></div>`;
        return;
      }

      document.body.innerHTML = `
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:-apple-system,system-ui,sans-serif;background:linear-gradient(135deg,#f5f9ff,#e8fff8);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:10px;}
  .card{max-width:380px;width:100%;background:#fff;border-radius:20px;box-shadow:0 12px 30px rgba(0,0,0,.1);overflow:hidden;}
  .header{background:linear-gradient(120deg,#a8e6cf,#d4a5ff);padding:28px 20px 32px;text-align:center;color:#2d1b4e;}
  .header h1{font:700 30px 'Poppins',sans-serif;margin-bottom:6px;}
  .amount{font:800 48px/1 system-ui;background:linear-gradient(90deg,#55efc4,#a29bfe);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .recipient{background:#f8f5ff;border:2px solid #e0d6ff;border-radius:14px;padding:16px;margin:18px 0;font-size:16.5px;}
  .check{display:inline-block;width:21px;height:21px;background:#00b894;border-radius:50%;color:white;font:bold 14px/21px Arial;text-align:center;margin-left:8px;}
  .pay{background:linear-gradient(90deg,#55efc4,#81ecec);color:#2d1b4e;font:700 18px system-ui;padding:16px;border:none;border-radius:14px;width:100%;text-decoration:none;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(85,239,196,.3);margin-top:8px;}
  .pay img{height:28px;margin-left:12px;}
  .footer{padding:16px;font-size:12px;color:#777;background:#f9f9ff;text-align:center;}
  .footer a{color:#00b894;text-decoration:none;}
</style>

<div class="card">
  <div class="header"><h1>Betaalverzoek</h1><p>Eenvoudig, snel én veilig betalen.</p></div>
  <div style="padding:24px 20px;text-align:center">
    <div class="amount">€${parseFloat(data.price).toFixed(2).replace('.',',')}</div>
    <div style="font-size:17px;color:#555;margin:16px 0">${data.article} via <strong>${data.via}</strong></div>
    <div class="recipient">Ontvanger<br><strong>${data.receiver} <span class="check">✓</span></strong></div>
    <a href="${data.checkout}" class="pay">
      Nu betalen met iDEAL
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/IDEAL_%28Bezahlsystem%29_logo.svg/1200px-IDEAL_%28Bezahlsystem%29_logo.svg.png" alt="iDEAL">
    </a>
  </div>
  <div class="footer">
    Veilig betalen • Geen extra kosten<br>
    <a href="https://betaalverzoek.nu/privacy.html">Privacy</a> • 
    <a href="https://betaalverzoek.nu/terms.html">Voorwaarden</a>
  </div>
</div>`;
    })
    .catch(() => {
      document.body.innerHTML = `<h2
