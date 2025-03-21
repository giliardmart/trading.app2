const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para permitir JSON no corpo das requisições
app.use(express.json());
app.use(express.static('public'));

// Caminho para o arquivo users.txt
const USERS_FILE = path.join(__dirname, 'users.txt');

// Rota para registrar um novo usuário (feito pelo admin)
app.post('/register-user', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "O e-mail é obrigatório." });
    }

    // Lê o conteúdo atual do arquivo
    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).json({ error: "Erro ao ler o arquivo de usuários." });
        }

        // Converte o conteúdo do arquivo para um array de e-mails
        const users = data ? data.split('\n').filter(Boolean) : [];

        // Verifica se o e-mail já está registrado
        if (users.includes(email)) {
            return res.status(400).json({ error: "Este e-mail já está registrado." });
        }

        // Adiciona o novo e-mail ao arquivo
        users.push(email);
        fs.writeFile(USERS_FILE, users.join('\n'), (err) => {
            if (err) {
                return res.status(500).json({ error: "Erro ao salvar o e-mail." });
            }
            res.json({ message: "Usuário registrado com sucesso!" });
        });
    });
});

// Rota para verificar se o e-mail está registrado
app.post('/verify-email', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "O e-mail é obrigatório." });
    }

    // Lê o conteúdo do arquivo
    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).json({ error: "Erro ao ler o arquivo de usuários." });
        }

        // Converte o conteúdo do arquivo para um array de e-mails
        const users = data ? data.split('\n').filter(Boolean) : [];

        // Verifica se o e-mail está registrado
        if (users.includes(email)) {
            return res.json({ exists: true });
        } else {
            return res.json({ exists: false });
        }
    });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});