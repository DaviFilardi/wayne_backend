const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 SEMPRE use __dirname
const db = new sqlite3.Database(__dirname + '/database.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Banco SQLite conectado');
  }
});

// 🔹 CRIAR TABELAS (ANTES DAS ROTAS)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT,
      senha TEXT,
      tipo TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS recursos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      descricao TEXT
    )
  `);

  db.run(`
    INSERT INTO usuarios (email, senha, tipo)
    VALUES ('admin@wayne.com', '123', 'admin');
    )
  `);
});
db.run(`
  INSERT OR IGNORE INTO usuarios (email, senha, tipo)
  VALUES ('operador@wayne.com', '123', 'operador')
`);

// 🔐 LOGIN
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  db.get(
    'SELECT id, email, tipo FROM usuarios WHERE email=? AND senha=?',
    [email, senha],
    (err, user) => {
      if (err) return res.status(500).json(err);
      if (!user) return res.json({ sucesso: false });

      res.json({
        sucesso: true,
        tipo: user.tipo
      });
    }
  );
});

// 📊 DASHBOARD
app.get('/dashboard', (req, res) => {
  db.get(
    'SELECT COUNT(*) AS total FROM recursos',
    (err, row) => {
      res.json({ totalRecursos: row.total });
    }
  );
});

// 📦 CRUD RECURSOS
app.get('/recursos', (req, res) => {
  db.all('SELECT * FROM recursos', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: 'Erro ao buscar recursos' });
    }
    res.json(rows);
  });
});


app.post('/recursos', (req, res) => {
  const { nome, descricao } = req.body;
  db.run(
    'INSERT INTO recursos (nome, descricao) VALUES (?, ?)',
    [nome, descricao],
    () => res.json({ msg: 'Recurso criado' })
  );
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});



