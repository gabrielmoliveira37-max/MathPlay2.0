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

O login Google aceita várias contas. Ao clicar em **Continuar com o Google**,
o aplicativo solicita a escolha de uma conta mesmo quando já há uma conta
Google ativa no navegador; cada pessoa tem um perfil e progresso separados
pelo UID do Firebase. Se uma sessão MathPlay já estiver autenticada ao abrir a
página, ela é restaurada automaticamente. Para escolher outra conta a partir
do painel, clique em **Sair** e depois em **Continuar com o Google**.

## Acesso alternativo pelo backend existente

Se o Firebase Authentication não estiver configurado, o formulário tenta usar
o backend PHP/MySQL existente para login e cadastro por e-mail e senha. O
progresso dessa sessão é salvo no MySQL, não no Firestore. Esse caminho requer
que o banco `mathplay` esteja disponível conforme as variáveis `MATHPLAY_DB_*`
em `api.php`. O botão Google alternativo também requer
`MATHPLAY_GOOGLE_CLIENT_ID`. Cadastros e progresso dos dois backends são
separados; eles não são sincronizados automaticamente.

Se uma conta Firebase autenticar, mas o Firestore estiver indisponível, a tela
de recuperação aparece após a tentativa de conexão e oferece a opção
**Tentar acesso pelo banco local**. Esse modo exige uma conta cadastrada no
MySQL; uma conta criada somente no Firebase não é reconhecida pelo banco local.

## Dados existentes

O login e o progresso do aplicativo passam a usar Firebase Auth e Firestore.
Os dados que já estejam no MySQL ou em `data/users.json` não são apagados,
mas também não são importados automaticamente; faça uma migração separada se
precisar preservá-los. `api.php` continua sendo usado pelo caminho alternativo
de autenticação e salvamento no MySQL.

## Jogos de prática

No perfil de aluno, a aba **Novos jogos** oferece quatro desafios extras:
sequências e códigos, corrida numérica, missão espacial e enigmas de lógica.
Cada jogo, na trilha principal ou na aba extra, tem níveis fácil, médio e
difícil, com 10 questões por nível. Os desafios variam entre sequências,
pistas para descobrir números, operações, posições e lógica. Porcentagens ficam
concentradas no jogo **Mercado em Ação**.
Na **Missão Espacial**, o aluno enfrenta o Guardião Cósmico: cada acerto causa
100 de dano ao chefão e cada erro causa 20 de dano à nave. Pontuação, dicas e
resultados continuam no mesmo histórico usado pelo relatório do professor.
No acesso alternativo PHP/MySQL, a API cadastra no catálogo os jogos MathPlay
conhecidos quando necessário antes de gravar a partida.

## Recursos de acessibilidade

O botão **Acessibilidade**, disponível na entrada e no painel, permite aumentar
o texto, ativar alto contraste, usar uma fonte de leitura e reduzir animações.
As preferências ficam salvas neste navegador e podem ser desligadas pelo mesmo
botão. O MathPlay também oferece navegação por teclado, foco visível, um atalho
para pular ao conteúdo principal e suporte à tecla **Esc** para fechar o
desafio. A preferência de movimento reduzido do sistema operacional também é
respeitada.

## Acesso de professor e relatórios

O portal do professor reúne alunos cadastrados no Firebase/Firestore e no
PHP/MySQL, combinando contas com o mesmo e-mail. Exibe resumo de partidas e
média de acertos, busca por nome/e-mail, histórico individual, desempenho por
jogo e exportação CSV. O portal não mostra os jogos para jogar; use
**Atualizar dados** para consultar o progresso mais recente enquanto o painel
estiver aberto. Basta entrar com uma conta existente e selecionar **Acesso do
professor**; não é necessária uma aprovação administrativa ou uma conta
separada.

### Firebase

No Firebase Console, abra **Firestore Database > Rules**, substitua as regras
pelas do arquivo `firestore.rules` e clique em **Publish**. Salvar este arquivo
no projeto local não publica as regras no Firebase. A permissão `read` permite
que qualquer usuário autenticado consulte todos os perfis para compor o
relatório; somente o próprio perfil do professor é omitido da lista. O campo
`role` controla a tela de entrada, mas não impede que uma conta cadastrada
apareça para os professores. Cada usuário só pode alterar o próprio perfil. O
progresso gravado no Firestore continua no Firebase; ao entrar com Firebase,
ele é reunido no relatório com os dados encontrados no MySQL.

Contas Google do Firebase também são incluídas: o relatório não filtra pelo
provedor nem pelo campo `role`. Cada aluno precisa entrar no MathPlay pelo
menos uma vez para que o perfil `users/{uid}` seja criado no Firestore. Depois
de publicar as regras, peça aos alunos Google que entrem novamente e use
**Atualizar dados** no painel.

### PHP/MySQL alternativo

O backend exibe o portal para qualquer conta autenticada e mantém no servidor a
opção de entrada (aluno ou professor) durante a sessão. Quando a sessão é do
Firebase, o endpoint de relatórios valida o token Firebase antes de consultar
o MySQL. Essa validação requer a extensão OpenSSL do PHP e acesso HTTPS de
saída para buscar os certificados públicos do Firebase. Se o projeto Firebase
mudar, configure `MATHPLAY_FIREBASE_PROJECT_ID` com o mesmo `projectId` usado
em `firebase.js`. Não é necessária uma lista `MATHPLAY_TEACHER_EMAILS`.

**Importante:** ao remover a aprovação, qualquer pessoa com uma conta MathPlay
consegue selecionar o portal do professor e ler os dados de progresso de todos
os alunos nos dois backends. Isso não exige uma conta administrativa, mas também
não restringe os relatórios apenas a professores reais. Os cadastros e o progresso continuam separados nos bancos; somente a
visualização do relatório os reúne. Para incluir ambos, o professor precisa
entrar pelo Firebase, pois a sessão alternativa PHP/MySQL não autentica acesso
ao Firestore.
