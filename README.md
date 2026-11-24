# Connect

Chat com **círculos de amigos**: cada grupo reúne a turma, e cada conversa junta só quem você escolher dela, rapidinho. As conversas ganham nome automático e ficam no histórico do grupo.

App web instalável (PWA) com Firebase: login com Google, mensagens em tempo real, fotos, vídeos e áudios.

## Como colocar no ar

1. **Firebase:** crie o projeto no plano Blaze e ative *Authentication → Google*, *Firestore* e *Storage*.
2. **Configuração:** cole o bloco `firebaseConfig` do Console em `firebase-config.js`.
3. **Regras de segurança:**
   - Em *Firestore → Regras*, cole o conteúdo de `firestore.rules` e publique.
   - Em *Storage → Regras*, cole o conteúdo de `storage.rules` e publique. Se o Console pedir permissão para o Storage consultar o Firestore, aceite.
4. **Domínio autorizado:** em *Authentication → Configurações → Domínios autorizados*, adicione `SEU-USUARIO.github.io`.
5. **GitHub Pages:** no repositório, vá em *Settings → Pages* e escolha *Deploy from a branch*, depois `main` e `/ (root)`. O app fica em `https://SEU-USUARIO.github.io/connect/`.

## Notificações e número no ícone

1. **Chave de push:** em *Configurações do projeto → Cloud Messaging → Certificados push da Web*, clique em *Gerar par de chaves*. Copie a chave e cole em `vapidKey`, no arquivo `firebase-config.js`.
2. **Região:** confira se a constante `REGION` em `functions/index.js` é a mesma região do seu Firestore.
3. **Publicar a função** (no computador, uma vez só, com o [Node.js](https://nodejs.org) instalado):
   ```
   npm install -g firebase-tools
   firebase login
   git clone https://github.com/eduardofechheimer-2019/connect
   cd connect
   firebase deploy --only functions,firestore:rules
   ```
4. **Ativar no celular:** no iPhone, as notificações e o número no ícone só funcionam com o app instalado na tela inicial. Basta tocar em *Ativar notificações* dentro do app.

## Como usar

- **Entrar:** abra o link no celular e entre com Google. Para instalar, toque em *Adicionar à tela inicial* (no iPhone, pelo botão Compartilhar do Safari).
- **Criar um grupo:** toque no **+** e mande o link de convite para os amigos.
- **Conversar:** toque no grupo, depois em **Nova Sessão**. Escolha quem participa e converse.

## Estrutura

| Arquivo | O que é |
|---|---|
| `index.html`, `styles.css`, `app.js` | O app |
| `firebase-config.js` | Chaves públicas do projeto Firebase |
| `firestore.rules`, `storage.rules` | Quem pode ler e escrever o quê |
| `manifest.webmanifest`, `sw.js`, `icons/` | O que torna o app instalável |

## Privacidade

- **Conversas:** só os participantes de uma conversa veem as mensagens e mídias dela. Os outros membros do grupo não sabem que ela existe.
- **Grupos:** só entra num grupo quem recebeu o link de convite.

## Próximos passos

- Indicador de "digitando…" e confirmação de leitura
- Sair de grupo e remover membros
