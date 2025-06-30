const express = require("express");
const moment = require("moment");
const cryptoJS = require("crypto-js");

const app = express();
const port = process.env.PORT || 3000;

const authClientId = "20047";
const secretAPIKey = "bAatbkfpL9s2*";

app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

app.get("/gerar-token/:cpf", (req, res) => {
  const cpf = req.params.cpf.replace(/\D/g, "");

  if (!cpf || cpf.length !== 11) {
    return res.status(400).json({ error: "CPF inválido" });
  }

  const authDateTime = moment.utc().format("YYYY-MM-DD HH:mm:ss") + " ";
  const query = `authClientID=${authClientId}&identifier=${cpf}&authDateTime=${authDateTime}`;

  const hash = cryptoJS.SHA256(cryptoJS.enc.Utf8.parse(query + secretAPIKey));
  const authHash = cryptoJS.enc.Base64.stringify(hash);

  return res.json({
    authHash,
    authDateTime: authDateTime.trim()
  });
});

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
