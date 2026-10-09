# Configuração do Firebase

O aplicativo usa o projeto `mathplay-cf79f` para autenticação e para salvar o
perfil e o progresso dos alunos no Cloud Firestore. O Firebase Web API key em
`firebase.js` identifica o projeto; a segurança dos dados é aplicada pelas
regras do Firestore, não por manter essa chave em segredo.

## Ativar os serviços

1. No [console do Firebase](https://console.firebase.google.com/), abra o
   projeto `mathplay-cf79f`.
2. Em **Authentication > Sign-in method**, habilite **E-mail/senha** e
   **Google**. Para Google, selecione um e-mail de suporte.
3. Em **Authentication > Settings > Authorized domains**, confirme que o
   domínio usado para abrir o MathPlay está autorizado. Para desenvolvimento
   local, inclua `localhost` e o hostname configurado no Laragon.
4. Em **Firestore Database**, crie o banco de dados e publique as regras do
   arquivo `firestore.rules` na aba **Rules**.
5. Abra o MathPlay pelo servidor PHP/Laragon (não pelo endereço `file://`) e
   teste cadastro, login, Google e salvamento de uma partida.

## Erro `auth/configuration-not-found`

Esse erro significa que o endpoint de autenticação não encontrou uma
configuração válida para o projeto usado pelo aplicativo. Confira:

1. O Console aberto é o projeto `mathplay-cf79f` e
   **Authentication > Get started/Começar** foi concluído.
2. Em **Authentication > Sign-in method**, os provedores usados pelo app estão
   habilitados.
3. Em **Project settings > General > Your apps**, a configuração da aplicação
   Web corresponde aos valores `projectId`, `apiKey` e `appId` de `firebase.js`.
   Se necessário, copie a configuração Web atual do Console e atualize o
   arquivo.
4. No Google Cloud Console do mesmo projeto, confira em
   **APIs & Services > Enabled APIs** se a **Identity Toolkit API** está
   habilitada. Se a chave tiver restrições de API, permita essa API; para
   testes, remova temporariamente as restrições e teste novamente.
5. Recarregue a página sem cache depois de salvar as alterações.

Quando o Firebase Auth estiver configurado, o perfil de cada conta fica em
`users/{uid}` e só pode ser lido ou alterado pela própria conta autenticada.
A senha é gerenciada pelo Firebase Authentication e não é gravada no Firestore.

## Acesso alternativo pelo backend existente

Se o Firebase Authentication não estiver configurado, o formulário tenta usar
o backend PHP/MySQL existente para login e cadastro por e-mail e senha. O
progresso dessa sessão é salvo no MySQL, não no Firestore. Esse caminho requer
que o banco `mathplay` esteja disponível conforme as variáveis `MATHPLAY_DB_*`
em `api.php`. O botão Google alternativo também requer
`MATHPLAY_GOOGLE_CLIENT_ID`. Cadastros e progresso dos dois backends são
separados; eles não são sincronizados automaticamente.

## Dados existentes

O login e o progresso do aplicativo passam a usar Firebase Auth e Firestore.
Os dados que já estejam no MySQL ou em `data/users.json` não são apagados,
mas também não são importados automaticamente; faça uma migração separada se
precisar preservá-los. `api.php` permanece no projeto, porém deixa de ser
usado pelo aplicativo.
