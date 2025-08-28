const express = require("express");
const moment = require("moment");
const cryptoJS = require("crypto-js");

const app = express();
const port = process.env.PORT || 3000;

const authClientId = "20047";
const secretAPIKey = "bAatbkfpL9s2*";

// Rota de ping
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

/**
 * Gera token e URL completa para os endpoints da Palmeiras
 * :numero → CPF ou userId
 * :tipo → "memberships" ou "ex"
 */
app.get("/gerar-token/:numero/:tipo", (req, res) => {
  const numero = req.params.numero.replace(/\D/g, "");
  const tipo = req.params.tipo;

  if (!numero) return res.status(400).json({ error: "Número inválido" });

  // authDateTime em UTC
  let authDateTime = moment.utc().format("YYYY-MM-DD HH:mm:ss");

  let query, url;

  if (tipo === "memberships") {
    // GetUserMemberships
    query = `authClientId=${authClientId}&userId=${numero}&authDateTime=${authDateTime}`;
    url = `https://ingressospalmeiras.com.br/Api/GetUserMemberships?authClientId=${authClientId}&userId=${numero}&authDateTime=${encodeURIComponent(authDateTime)}&authHash=`;
  } else if (tipo === "ex") {
    // GetUserExByIdentifier
    authDateTime += " "; // espaço obrigatório para 'ex'
    query = `authClientID=${authClientId}&identifier=${numero}&authDateTime=${authDateTime}`;
    url = `https://ingressospalmeiras.com.br/Api/GetUserExByIdentifier?authClientID=${authClientId}&identifier=${numero}&authDateTime=${encodeURIComponent(authDateTime)}&authHash=`;
  } else {
    return res.status(400).json({ error: "Tipo inválido. Use 'memberships' ou 'ex'." });
  }

  // Gera hash SHA256 + Base64
  const hash = cryptoJS.SHA256(cryptoJS.enc.Utf8.parse(query + secretAPIKey));
  const authHash = cryptoJS.enc.Base64.stringify(hash);

  // Retorna hash, authDateTime e URL completa
  return res.json({
    authHash,
    authDateTime: authDateTime.trim(),
    urlCompleta: url + encodeURIComponent(authHash)
  });
});

// Inicializa servidor
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
