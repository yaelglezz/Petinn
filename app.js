const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

const scriptURL = "https://script.google.com/macros/s/AKfycby_ZHcAVqxSReeGSLPGZLUrWr85HlurKRU670Sl0VW-wE55zKW7qmd2J73cmuN8kFzfSA/exec";

const regexFormato = /^(\d+)\s?(dia|dias|mes|meses|año|años|d|m|a)$/i;

function normalizarUnidad(texto) {

  texto = texto.toLowerCase();

  if (["dia","dias","d"].includes(texto)) return "Dia";
  if (["mes","meses","m"].includes(texto)) return "Mes";
  if (["año","años","a"].includes(texto)) return "Año";

  return null;
}

console.log("TOKEN:", process.env.WHATSAPP_TOKEN ? "OK" : "NO");
console.log("PHONE ID:", process.env.PHONE_NUMBER_ID);

async function responderError(numero) {

if (numero.startsWith("521")) {
  numero = "52" + numero.slice(3);
}

  console.log("Entró a responderError");
  console.log("Numero destino:", numero);

  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.PHONE_NUMBER_ID;

  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: numero,
    type: "text",
    text: {
      body:
`Formato incorrecto ❌

Responde así:
3 dias
2 meses
1 año

Solo número + unidad.`
    }
  };

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

}

async function responderCorrecto(numero) {

  if (numero.startsWith("521")) {
  numero = "52" + numero.slice(3);
}
  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: numero,
    type: "text",
    text: {
      body:
`Revisión asignada para dentro de ${mensaje}`
    }
  };

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

}


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


    const match = mensaje.match(regexFormato);

    if (!match) {

      console.log("Formato invalido");

      await responderError(numero);

      return res.sendStatus(200);
    }


    const cantidad = match[1];
    const unidadRaw = match[2];

    const unidad = normalizarUnidad(unidadRaw);

    if (!unidad) {

      console.log("Unidad invalida");

      await responderError(numero);

      return res.sendStatus(200);
    }

    console.log("Cantidad:", cantidad);
    console.log("Unidad:", unidad);
    

    await fetch(scriptURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        numero,
        mensaje,
        cantidad,
        unidad
      }),
    });

    console.log("Enviado a Google Script");
    await responderCorrecto(numero);

  } catch (error) {

    console.error("Error:", error);

  }

  res.sendStatus(200);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
