const bcrypt = require("bcrypt");
const conexao = require("../bancodedados/conexao");
const jwt = require("jsonwebtoken");
const chaveSecreta = require("../chaveSecreta/chave_Secreta");

const cadastrarUsuario = async (req, res) => {
  try {
    let { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        mensagem: "Preencha os campos obrigatórios: nome, email e senha",
      });
    }

    const usuarioEncontrado = await conexao.query(
      "select * from usuarios where email = $1",
      [email]
    );

    if (usuarioEncontrado.rowCount > 0) {
      return res.status(400).json({
        mensagem: "E-mail informado está vinculado a outro usuário.",
      });
    }

    let senhaCriptografada = await bcrypt.hash(senha, 10);

    const usuarioCriado = await conexao.query(
      "insert into usuarios (nome, email, senha) values ($1, $2, $3) returning id, nome, email",
      [nome, email, senhaCriptografada]
    );

    return res.status(201).json(usuarioCriado.rows[0]);
  } catch (erro) {
    return res.status(400).json({ mensagem: erro.message });
  }
};

const fazerLogin = async (req, res) => {
  try {
    let { email, senha } = req.body;
    if (!email || !senha) {
      return res
        .status(400)
        .json({ mensagem: "Preecha os campos obrigatório: email e senha" });
    }

    const usuarioEncontrado = await conexao.query(
      "select * from usuarios  where email = $1 ",
      [email]
    );

    if (usuarioEncontrado.rowCount === 0) {
      return res.status(400).json({ mensagem: "Email  ou senha invalidos" });
    }

    if (!(await bcrypt.compare(senha, usuarioEncontrado.rows[0].senha))) {
      return res.status(400).json({ mensagem: "Email  ou senha invalidos" });
    }

    let { senha: senhaCriptografada, ...usuario } = usuarioEncontrado.rows[0];

    const token = jwt.sign(usuario, chaveSecreta, {
      expiresIn: "2h",
    });

    return res.status(200).json({ usuario, token });
  } catch (erro) {
    return res.status(400).json({
      mensagem: erro.message,
    });
  }
};

const perfilUsuarioLogado = async (req, res, next) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({ mensagem: "Usuário não autenticado" });
    }
    return res.json({
      id: req.usuario.id,
      nome: req.usuario.nome,
      email: req.usuario.email,
    });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const editarUsuarioLogado = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ mensagem: "Campos obrigatórios não preenchidos." });
    }

    const usuario = await emailUsuario(email);

    if (!usuario) {
      return res.status(400).json({ mensagem: "E-mail ou senha inválidos" });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(400).json({ mensagem: "E-mail ou senha inválidos" });
    }

    const query = `
      UPDATE usuarios
      SET nome = $1
      WHERE email = $2
      RETURNING *;
    `;

    const updatedUsuario = await conexao.query(query, [nome, email]);

    const { senha: senhaCriptografada, ...usuarioSemSenha } =
      updatedUsuario.rows[0];

    return res.status(200).json({ usuario: usuarioSemSenha });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro ao editar usuário." });
  }
};

const emailUsuario = async (email) => {
  const usuario = await conexao.query(
    "SELECT * FROM usuarios WHERE email = $1",
    [email]
  );
  return usuario.rows[0];
};

module.exports = {
  cadastrarUsuario,
  fazerLogin,
  perfilUsuarioLogado,
  editarUsuarioLogado,
};
