<?php
declare(strict_types=1);
?><!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#10243e">
  <title>MathPlay | Aprender jogando</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css?v=6">
  <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>

<body>
  <div id="app" class="app-shell"></div>
  <script src="app.js?v=6"></script>
  <script>
    window.mathplayGoogleClientId = <?= json_encode((string) getenv('MATHPLAY_GOOGLE_CLIENT_ID')) ?>;
    window.addEventListener('load', () => {
      if (window.mathplayGoogleClientId && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: window.mathplayGoogleClientId,
          callback: window.handleGoogleCredential
        });
      }
    });
  </script>
</body>

</html>