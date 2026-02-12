const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

const scriptURL = "https://script.google.com/macros/s/AKfycby_ZHcAVqxSReeGSLPGZLUrWr85HlurKRU670Sl0VW-wE55zKW7qmd2J73cmuN8kFzfSA/exec";

app.post('/', async (req, res) => {

  console.log("Webhook recibido:");
  console.log(JSON.stringify(req.body, null, 2));

  try {

    const mensaje =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || "";

    const numero =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || "";

    console.log("Numero:", numero);
    console.log("Mensaje:", mensaje);

    await fetch(scriptURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        numero: numero,
        mensaje: mensaje
      }),
    });

    console.log("Enviado a Google Script");

  } catch (error) {
    console.error("Error enviando a Script:", error);
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
