const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const app = express();

const usersPath = path.join(__dirname, 'users.json');
const institutionsPath = path.join(__dirname, 'institutions.json');
const SECRET_KEY = "Ix9orzquPK5zYI7";

app.use(cors());
app.use(express.json());

const getUsers = () => {
  try {
    const data = fs.readFileSync(usersPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const saveUsers = (users) => {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
};

app.post("/api/register", (req, res) => {
  const { email, password, institutionId } = req.body;

  if (!email || !password || !institutionId) {
    return res.status(400).json({ error: "E-mail, senha e instituição são obrigatórios." });
  }

  const users = getUsers();
  const userExists = users.find((user) => user.email === email);
  if (userExists) {
    return res.status(400).json({ error: "Usuário já existe." });
  }

  const newUser = { id: users.length + 1, email, password, institutionId };
  users.push(newUser);
  saveUsers(users);

  res.status(201).json({ message: "Usuário registrado com sucesso." });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  const users = getUsers();
  const user = users.find((user) => user.email === email && user.password === password);

  if (!user) {
    return res.status(401).json({ error: "Credenciais inválidas." });
  }

  const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });

  res.json({ message: "Login bem-sucedido!", token });
});

app.get("/api/institutions", (req, res) => {
  try {
    const data = fs.readFileSync(institutionsPath, 'utf8');
    const institutions = JSON.parse(data);
    res.json(institutions);
  } catch (error) {
    res.status(500).json({ error: "Erro ao ler instituições." });
  }
});

app.get("/", (req, res) => {
  res.send("Bem-vindo à API de Login e Registro!");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
