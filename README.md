# IZ CODE — Engenharia de Segurança Contra Incêndio

Site profissional para engenharia de segurança contra incêndio.

## Como abrir o site

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

Defina `ADMIN_PASSWORD` no arquivo `.env` antes de acessar a área administrativa.

Acesse `http://localhost:5173`

---

## Uploads e dados

O painel administrativo envia os arquivos pelo navegador. Imagens, planta 2D e modelo 3D opcional ficam gravados na pasta `uploads/`.

Os dados dos projetos e do engenheiro ficam em `data/site-content.json`. O frontend mantém apenas um cache local de metadados, sem salvar arquivos grandes no `localStorage`.

---

## Área do Engenheiro

### Como acessar
1. Acesse diretamente `http://localhost:5173/admin`
2. Digite a senha configurada em `ADMIN_PASSWORD`
3. Clique em **Entrar**

### O que pode ser editado
- **Aba "Engenheiro"**: nome, foto, CREA, bio, redes sociais, estatísticas
- **Aba "Projetos"**: adicionar, remover, editar dados, enviar imagem principal, imagem antes, planta 2D obrigatória e modelo 3D opcional

### Botões disponíveis
| Botão | Função |
|-------|--------|
| Salvar Alterações | Salva no servidor local |
| Restaurar Padrão | Remove todas as edições e volta ao padrão |
| Adicionar Novo Projeto | Cria projeto em branco para editar |
| Remover Projeto (🗑️) | Remove o projeto selecionado |

---

## ⚠️ Segurança

O botão público de acesso foi removido. A área administrativa fica em `/admin` e a senha é validada pela API local usando `ADMIN_PASSWORD`, sem senha fixa no frontend.

---

## Build para produção

```bash
npm run build
npm run preview
```

Os arquivos gerados ficam na pasta `dist/`.
