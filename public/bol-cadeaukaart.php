<?php
// Standaardwaarden (fallback)
$price    = $_GET['price']    ?? '50';
$article  = $_GET['article']  ?? 'Bol.com cadeaukaart';
$via      = $_GET['via']      ?? 'Opwaarderen.nl';
$receiver = $_GET['receiver'] ?? 'Fleur Jongkamp';
$phone    = $_GET['phone']    ?? '0612345678';
$checkout = $_GET['checkout'] ?? 'https://checkout.buckaroo.nl/html/redirect.ashx?r=FC1C0F88DAC24D9FBBE1DE96414DB6BB';

// Veilig maken voor weergave
$price    = number_format((float)$price, 2, ',', '');
$article  = htmlspecialchars($article);
$via      = htmlspecialchars($via);
$receiver = htmlspecialchars($receiver);
$phone    = htmlspecialchars($phone);
$checkout = htmlspecialchars($checkout);
?>

<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Betaalverzoek</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap" rel="stylesheet">
    <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{
            font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
            background:linear-gradient(135deg,#f5f9ff 0%,#e8fff8 100%);
            display:flex;justify-content:center;align-items:center;min-height:100vh;color:#2d1b4e;
        }
        .card{
            max-width:380px;width:100%;background:white;border-radius:24px;
            box-shadow:0 20px 40px rgba(0,0,0,0.08);overflow:hidden;margin:20px 16px;
        }
        .header{
            background:linear-gradient(120deg,#a8e6cf,#d4a5ff);
            padding:40px 24px 45px;text-align:center;color:#2d1b4e;
        }
        .header h1{
            font-family:'Poppins',sans-serif;font-weight:700;font-size:34px;margin:0 0 8px;
        }
        .header p{font-size:17px;font-weight:500;
