# Mingo - Web II

## Descrição
**Mingo** é uma aplicação de chat em tempo real que permite usuários se conectarem, criar salas de conversa e trocar mensagens com persistência em banco de dados NoSQL. O sistema oferece uma experiência moderna e responsiva para comunicação síncrona entre múltiplos usuários.

## Tecnologias
- **Next.js 16.0.7** (App Router + Turbopack)
- **React 19.2.0** com TypeScript 5.x
- **MongoDB Atlas & Mongoose 9.0.1**
- **Radix UI + Tailwind CSS 4.1.9**
- **NextAuth.js v4.24.13** (Credenciais, Google OAuth, GitHub OAuth)
- **Pusher** (Real-time - Plano Gratuito)
- **date-fns** (Localização em Português BR)

## Funcionalidades Implementadas

### Autenticação
- [x] Cadastro de usuários (Email e senha)
- [x] Login com Email/Senha
- [x] Login com Google OAuth
- [x] Login com GitHub OAuth
- [x] Proteção de rotas autenticadas

### Gestão de Salas
- [x] Criar salas de chat
- [x] Listar salas do usuário
- [x] Deletar sala
- [x] Adicionar membros à sala

### Sistema de Mensagens
- [x] Enviar mensagens em tempo real
- [x] Listar mensagens com paginação
- [x] Editar mensagem (com indicador "Editado")
- [x] Deletar mensagem
- [x] Responder a mensagens específicas (Reply)

### Perfil do Usuário
- [x] Editar nome do usuário
- [x] Upload de avatar
- [x] Buscar usuários por nome ou email

## Configuração

### Pré-requisitos
- Node.js 18+
- Conta no MongoDB Atlas
- Conta no Google Cloud (para OAuth)
- Conta no GitHub (para OAuth)
- Conta na Pusher
- Conta na Vercel (para deploy)

### Instalação Local

1. **Clone o repositório**
   ```bash
   git clone https://github.com/samuelvbernardo/mingo.git
   cd mingo
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o arquivo `.env.local`**
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=seu_nextauth_secret_aqui
   MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/mingo
   GOOGLE_CLIENT_ID=seu_google_client_id
   GOOGLE_CLIENT_SECRET=seu_google_client_secret
   GITHUB_ID=seu_github_id
   GITHUB_SECRET=seu_github_secret
   NEXT_PUBLIC_PUSHER_APP_KEY=sua_pusher_app_key
   PUSHER_APP_ID=sua_pusher_app_id
   PUSHER_SECRET=sua_pusher_secret
   ```

4. **Execute o servidor**
   ```bash
   npm run dev
   ```
   Acesse em `http://localhost:3000`

5. **Build para produção**
   ```bash
   npm run build
   npm run start
   ```
## Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/          # Páginas de autenticação
│   ├── api/             # API Routes
│   ├── chat/            # Página principal
│   └── layout.tsx
├── components/chat/     # Componentes específicos
├── lib/                 # Utilitários
├── models/              # Mongoose schemas
└── types/               # TypeScript types
```

## Fluxo de Uso

1. **Autenticação** - Cadastro ou login via Email/Google/GitHub
2. **Criar Sala** - Nomear e descrever a sala
3. **Enviar Mensagens** - Em tempo real com Pusher
4. **Editar/Deletar** - Gerenciar próprias mensagens
5. **Responder** - Citar mensagens específicas
6. **Perfil** - Atualizar avatar e informações

## Deploy

🚀 [https://mingo-chat.vercel.app](https://mingo-chat.vercel.app)
