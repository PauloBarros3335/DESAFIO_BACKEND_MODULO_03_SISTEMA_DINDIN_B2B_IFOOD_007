const conexao = require("../bancodedados/conexao");
const {
  buscarCategoriaPorNome,
  buscarCategoriaPorId,
} = require("../funcoes_uteis/buscarCategoria");

const listarTransacoes = async (req, res) => {
  const filtro = req.query.filtro;

  try {
    if (filtro) {
      const filtroMap = filtro.map((element) => {
        return element[0].toUpperCase() + element.substr(1);
      });
      const categoria1 = await buscarCategoriaPorNome(filtroMap[0]);
      const categoria2 = await buscarCategoriaPorNome(filtroMap[1]);

      const buscarCategoria = await conexao.query(
        `select t.*, c.descricao as categoria_nome
                                                        from transacoes as t
                                                        inner join categorias as c on t.categoria_id = c.id
                                                        where c.id = $1 or c.id = $2`,
        [categoria1.id, categoria2.id]
      );
      return res.status(200).json(buscarCategoria.rows);
    }

    const transacoes_usuario = await conexao.query(
      "select * from transacoes where usuario_id = $1",
      [req.usuario.id]
    );
    return res.status(200).json(transacoes_usuario.rows);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const detalharTransacao = async (req, res) => {
  const { id } = req.params;

  try {
    const transacao = await conexao.query(
      `select t.*, c.descricao as categoria_nome
            from transacoes as t
            inner join categorias as c on t.categoria_id = c.id
            where t.id = $1 and t.usuario_id = $2`,
      [id, req.usuario.id]
    );

    if (transacao.rowCount < 1) {
      return res.status(404).json({ mensagem: "Transação não encontrada." });
    }

    return res.status(200).json(transacao.rows[0]);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const cadastrarTransacao = async (req, res) => {
  const { descricao, valor, data, categoria_id, tipo } = req.body;
  try {
    if (!descricao || !valor || !data || !categoria_id || !tipo) {
      return res.status(400).json({
        mensagem: "Todos os campos obrigatórios devem ser informados.",
      });
    }
    if (tipo !== "entrada" && tipo !== "saida") {
      return res.status(400).json({
        mensagem: "O tipo de transacao deve ser 'entrada' ou 'saida'.",
      });
    }

    const categoria = await buscarCategoriaPorId(categoria_id);

    if (categoria.rowCount < 1) {
      return res.status(400).json({ mensagem: "Categoria não encontrada." });
    }

    const novaTransacao = await conexao.query(
      `insert into transacoes (descricao, valor, data, categoria_id, usuario_id, tipo) 
            values ($1,$2,$3,$4,$5,$6) 
            returning id, tipo, descricao, valor, data, usuario_id, categoria_id`,
      [descricao, valor, data, categoria_id, req.usuario.id, tipo]
    );
    const objetoTransacao = {
      ...novaTransacao.rows[0],
      categoria_nome: categoria.rows[0].descricao,
    };
    return res.status(201).json(objetoTransacao);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const editarTransacao = async (req, res) => {
  const { id } = req.params;
  const { descricao, valor, data, categoria_id, tipo } = req.body;

  try {
    if (!descricao || !valor || !data || !categoria_id || !tipo) {
      return res.status(400).json({
        mensagem: "Todos os campos obrigatórios devem ser informados.",
      });
    }
    if (tipo !== "entrada" && tipo !== "saida") {
      return res.status(400).json({
        mensagem: "O tipo de transacao deve ser 'entrada' ou 'saida'.",
      });
    }
    const categoria = await buscarCategoriaPorId(categoria_id);

    if (categoria.rowCount < 1) {
      return res.status(400).json({ mensagem: "Categoria não encontrada." });
    }

    const buscarTransacao = await conexao.query(
      "select * from transacoes where id = $1 and usuario_id = $2",
      [id, req.usuario.id]
    );
    if (buscarTransacao.rowCount < 0) {
      return res.status(400).json({ mensagem: "Transação não encontrada." });
    }

    await conexao.query(
      `update transacoes 
                          set descricao = $1, valor = $2, data = $3, categoria_id = $4, 
                          tipo = $5 where id = $6 and usuario_id = $7`,
      [descricao, valor, data, categoria_id, tipo, id, req.usuario.id]
    );

    return res.status(204).json();
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const excluirTransacao = async (req, res) => {
  const { id } = req.params;

  try {
    const transacaoExistente = await conexao.query(
      "select * from transacoes where id = $1 and usuario_id = $2",
      [id, req.usuario.id]
    );
    if (transacaoExistente.rowCount < 1) {
      return res.status(404).json({ mensagem: "Transação não encontrada." });
    }
    await conexao.query("delete from transacoes where id = $1", [id]);

    return res.status(204).json();
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const obterExtrato = async (req, res) => {
  try {
    const resultadoEntrada = await conexao.query(
      "select sum(valor) as entrada from transacoes where usuario_id = $1 and tipo = $2",
      [req.usuario.id, "entrada"]
    );
    const resultadoSaida = await conexao.query(
      "select sum(valor) as saida from transacoes where usuario_id = $1 and tipo = $2",
      [req.usuario.id, "saida"]
    );
    return res.status(200).json({
      Entradas: resultadoEntrada.rows[0].entrada || 0,
      Saidas: resultadoSaida.rows[0].saida || 0,
    });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = {
  listarTransacoes,
  detalharTransacao,
  cadastrarTransacao,
  editarTransacao,
  excluirTransacao,
  obterExtrato,
};
