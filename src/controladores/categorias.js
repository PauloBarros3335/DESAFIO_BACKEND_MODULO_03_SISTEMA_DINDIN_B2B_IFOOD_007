const conexao = require("../bancodedados/conexao");

const listarCategorias = async (req, res) => {
  try {
    const array = await conexao.query("select * from categorias");
    return res.status(200).json(array.rows);
  } catch (erro) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = {
  listarCategorias,
};
