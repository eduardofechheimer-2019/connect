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

- Notificações push com o app fechado (Cloud Functions + Firebase Cloud Messaging)
- Indicador de "digitando…" e confirmação de leitura
- Sair de grupo e remover membros
