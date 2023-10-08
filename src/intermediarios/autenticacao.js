const jwt = require("jsonwebtoken");
const chaveSecreta = require("../chaveSecreta/chave_Secreta");

const validarAutenticacao = (req, res, next) => {
  try {
    let { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({
        mensagem: "Token ausente no cabeçalho da requisição ",
      });
    }
    const token = authorization.split(" ")[1];
    const assinatura = jwt.verify(token, chaveSecreta);
    let { iat, exp, ...usuario } = assinatura;
    req.usuario = usuario;

    next();
  } catch (erro) {
    return res.status(500).json({
      mensagem: erro.message,
    });
  }
};

module.exports = {
  validarAutenticacao,
};
