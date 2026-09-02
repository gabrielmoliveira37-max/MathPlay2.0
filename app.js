const app = document.querySelector('#app');
const storageKey = 'mathplay-user';
const games = [
  {
    id: 'inteiros', icon: '±', title: 'Expedição dos Inteiros', description: 'Some e subtraia números positivos e negativos.', color: 'mint', questions: [
      { q: 'Qual é o resultado de -8 + 13?', options: ['-21', '5', '21', '-5'], answer: '5', hint: 'Comece no -8 e avance 13 casas para a direita.' },
      { q: 'Uma nave está a -4 km. Ela sobe 9 km. Onde chega?', options: ['-13 km', '13 km', '5 km', '-5 km'], answer: '5 km', hint: 'Subir significa somar: -4 + 9.' },
      { q: 'Quanto é 7 - (-6)?', options: ['1', '-13', '13', '-1'], answer: '13', hint: 'Subtrair um número negativo equivale a somar seu oposto.' }
    ]
  },
  {
    id: 'fracoes', icon: '⅔', title: 'Cozinha das Frações', description: 'Combine ingredientes e descubra equivalências.', color: 'coral', questions: [
      { q: 'Qual fração é equivalente a 1/2?', options: ['2/4', '1/3', '3/5', '4/6'], answer: '2/4', hint: 'Multiplique numerador e denominador pelo mesmo número.' },
      { q: 'Quanto é 1/4 + 2/4?', options: ['3/8', '2/4', '3/4', '1/2'], answer: '3/4', hint: 'Com denominadores iguais, some apenas os numeradores.' },
      { q: 'Qual é maior?', options: ['2/5', '3/5', 'São iguais', 'Não é possível'], answer: '3/5', hint: 'Compare os numeradores quando o denominador é igual.' }
    ]
  },
  {
    id: 'equacoes', icon: 'x', title: 'Cofre do Equilíbrio', description: 'Destrave cada cofre encontrando o valor de x.', color: 'yellow', questions: [
      { q: 'x + 7 = 15. Qual é o valor de x?', options: ['7', '8', '9', '22'], answer: '8', hint: 'Faça a operação inversa: 15 - 7.' },
      { q: '3x = 21. Qual e o valor de x?', options: ['6', '7', '18', '24'], answer: '7', hint: 'Divida os dois lados da igualdade por 3.' },
      { q: '2x + 4 = 14. Quanto vale x?', options: ['4', '5', '6', '9'], answer: '5', hint: 'Primeiro retire 4. Depois divida o resultado por 2.' }
    ]
  },
  {
    id: 'porcentagem', icon: '%', title: 'Mercado em Ação', description: 'Calcule descontos, trocos e lucros na loja.', color: 'blue', questions: [
      { q: 'Quanto é 10% de 80?', options: ['0,8', '8', '10', '18'], answer: '8', hint: '10% é a mesma coisa que dividir por 10.' },
      { q: 'Uma mochila custa R$ 100 e tem 20% de desconto. Preço final?', options: ['R$ 20', 'R$ 80', 'R$ -20', 'R$ 120'], answer: 'R$ 80', hint: 'Desconto de 20% significa pagar os 80% restantes.' },
      { q: 'Você compra por R$ 30 e vende por R$ 45. Qual foi o lucro?', options: ['R$ 10', 'R$ 15', 'R$ 75', 'R$ 5'], answer: 'R$ 15', hint: 'Lucro = preço de venda menos preço de custo.' }
    ]
  }
];

const extraQuestions = {
  inteiros: {
    Facil: [
      { q: 'Qual e o resultado de -3 + 7?', options: ['-10', '4', '10', '-4'], answer: '4', hint: 'Avance 7 casas a partir do -3.' },
      { q: 'Quanto e 12 - 18?', options: ['6', '-6', '30', '-30'], answer: '-6', hint: 'Voce retirou mais do que tinha, entao terminou no negativo.' }
    ],
    Medio: [
      { q: 'Uma temperatura de -6 graus sobe 14 graus e depois cai 5. Qual e a temperatura final?', options: ['3 graus', '13 graus', '-3 graus', '-25 graus'], answer: '3 graus', hint: 'Calcule em duas etapas: -6 + 14 e depois subtraia 5.' },
      { q: 'Qual e o resultado de -4 - (-9) + 2?', options: ['-11', '3', '7', '15'], answer: '7', hint: 'Troque a subtracao de negativo por uma soma: -4 + 9 + 2.' },
      { q: 'Um mergulhador esta a -18 m, sobe 7 m e desce 4 m. Em que altitude fica?', options: ['-15 m', '-29 m', '15 m', '-7 m'], answer: '-15 m', hint: 'Represente subir como +7 e descer como -4.' },
      { q: 'Qual expressao tem o maior resultado?', options: ['-2 + 8', '-10 + 3', '4 - 9', '-1 - 6'], answer: '-2 + 8', hint: 'Calcule as quatro expressoes antes de comparar.' }
    ],
    Dificil: [
      { q: 'Qual e o resultado de -3 x (4 - 9) - 6?', options: ['-21', '9', '21', '-9'], answer: '9', hint: 'Resolva primeiro o parenteses: 4 - 9 = -5.' },
      { q: 'Um saldo de R$ 35 recebe uma divida de R$ 48 e depois um deposito de R$ 27. Qual e o saldo?', options: ['R$ 14', 'R$ -40', 'R$ 62', 'R$ 110'], answer: 'R$ 14', hint: 'Use 35 - 48 + 27.' },
      { q: 'Qual e o resultado de (-24) / 6 + (-3) x (-2)?', options: ['-10', '-2', '2', '10'], answer: '2', hint: 'Resolva divisao e multiplicacao antes da soma.' },
      { q: 'A diferenca entre dois numeros inteiros e -17. Se o maior e 5, qual e o menor?', options: ['-12', '12', '-22', '22'], answer: '22', hint: 'Considere a ordem: menor - maior = -17.' }
    ]
  },
  fracoes: {
    Facil: [
      { q: 'Quanto e 2/7 + 3/7?', options: ['5/7', '5/14', '6/7', '1/7'], answer: '5/7', hint: 'Os denominadores ja sao iguais.' },
      { q: 'Qual fracao representa 3 partes de um total de 8?', options: ['8/3', '3/8', '3/5', '5/8'], answer: '3/8', hint: 'O numero de partes escolhidas fica no numerador.' }
    ],
    Medio: [
      { q: 'Quanto e 1/3 + 1/6?', options: ['2/9', '1/2', '2/6', '1/9'], answer: '1/2', hint: 'Transforme 1/3 em 2/6 antes de somar.' },
      { q: 'Quanto e 5/6 - 1/4?', options: ['4/2', '7/12', '1/2', '4/12'], answer: '7/12', hint: 'Use 12 como denominador comum.' },
      { q: 'Uma receita usa 3/4 de xicara. Para fazer meia receita, quanto sera usado?', options: ['3/8 de xicara', '1/2 de xicara', '3/2 de xicara', '1/4 de xicara'], answer: '3/8 de xicara', hint: 'Calcule a metade de 3/4.' },
      { q: 'Qual e a forma simplificada de 18/24?', options: ['9/12', '3/4', '6/8', '2/3'], answer: '3/4', hint: 'Divida numerador e denominador pelo maior divisor comum.' }
    ],
    Dificil: [
      { q: 'Quanto e 2/3 x 9/10?', options: ['3/5', '4/5', '11/13', '2/5'], answer: '3/5', hint: 'Multiplique e simplifique o resultado.' },
      { q: 'Uma barra de 3/4 m foi dividida em pedacos de 1/8 m. Quantos pedacos foram formados?', options: ['3', '6', '8', '12'], answer: '6', hint: 'Dividir por 1/8 e perguntar quantos oitavos cabem em 3/4.' },
      { q: 'Joao gastou 2/5 do dinheiro e guardou R$ 36, que correspondem ao restante. Quanto tinha?', options: ['R$ 54', 'R$ 60', 'R$ 90', 'R$ 18'], answer: 'R$ 60', hint: 'R$ 36 representam 3/5 do total.' },
      { q: 'Qual e o resultado de 1 1/2 + 2 3/4?', options: ['3 1/4', '4 1/4', '4 3/4', '3 3/4'], answer: '4 1/4', hint: 'Some as partes inteiras e depois as fracoes.' }
    ]
  },
  equacoes: {
    Facil: [
      { q: 'x - 5 = 12. Qual e o valor de x?', options: ['7', '17', '-17', '60'], answer: '17', hint: 'Some 5 aos dois lados.' },
      { q: 'x / 4 = 6. Quanto vale x?', options: ['1,5', '10', '24', '2'], answer: '24', hint: 'Multiplique os dois lados por 4.' }
    ],
    Medio: [
      { q: '4x - 6 = 18. Qual e o valor de x?', options: ['3', '6', '12', '24'], answer: '6', hint: 'Some 6 e depois divida por 4.' },
      { q: '5x + 3 = 2x + 18. Quanto vale x?', options: ['3', '5', '7', '15'], answer: '5', hint: 'Junte os termos com x de um lado e os numeros do outro.' },
      { q: 'A metade de x mais 4 e igual a 10. Qual e x?', options: ['7', '12', '14', '28'], answer: '12', hint: 'Escreva x/2 + 4 = 10.' },
      { q: '2(x + 3) = 20. Qual e o valor de x?', options: ['7', '10', '13', '17'], answer: '7', hint: 'Divida por 2 antes de retirar 3.' }
    ],
    Dificil: [
      { q: '3(x - 4) + 2 = 20. Quanto vale x?', options: ['6', '8', '10', '14'], answer: '10', hint: 'Isole o parenteses: 3(x - 4) = 18.' },
      { q: '7x - 4 = 3x + 20. Qual e o valor de x?', options: ['4', '6', '8', '12'], answer: '6', hint: 'Subtraia 3x e some 4 aos dois lados.' },
      { q: 'A soma de um numero com seu dobro e 36. Qual e esse numero?', options: ['9', '12', '18', '24'], answer: '12', hint: 'Monte x + 2x = 36.' },
      { q: '(x + 5) / 3 = 7. Qual e o valor de x?', options: ['16', '21', '26', '31'], answer: '16', hint: 'Multiplique por 3 e depois subtraia 5.' }
    ]
  },
  porcentagem: {
    Facil: [
      { q: 'Quanto e 25% de 40?', options: ['5', '10', '15', '20'], answer: '10', hint: '25% e a quarta parte.' },
      { q: 'Um produto de R$ 50 aumentou R$ 5. Qual foi o novo preco?', options: ['R$ 45', 'R$ 50', 'R$ 55', 'R$ 60'], answer: 'R$ 55', hint: 'Some o aumento ao preco original.' }
    ],
    Medio: [
      { q: 'Uma camiseta de R$ 80 tem 15% de desconto. Qual e o desconto?', options: ['R$ 8', 'R$ 12', 'R$ 15', 'R$ 68'], answer: 'R$ 12', hint: 'Calcule 10% e 5% de R$ 80 e some.' },
      { q: 'Depois de um desconto de 25%, um jogo custa R$ 60. Qual era o preco original?', options: ['R$ 75', 'R$ 80', 'R$ 85', 'R$ 90'], answer: 'R$ 80', hint: 'R$ 60 correspondem a 75% do preco.' },
      { q: 'Uma loja comprou um produto por R$ 120 e quer 25% de lucro. Por quanto deve vender?', options: ['R$ 135', 'R$ 145', 'R$ 150', 'R$ 160'], answer: 'R$ 150', hint: 'Some 25% de R$ 120 ao custo.' },
      { q: 'Em uma turma de 32 alunos, 75% fizeram a tarefa. Quantos alunos fizeram?', options: ['8', '16', '24', '28'], answer: '24', hint: '75% e igual a tres quartos.' }
    ],
    Dificil: [
      { q: 'Um preco de R$ 200 sobe 20% e depois recebe desconto de 20%. Qual e o preco final?', options: ['R$ 200', 'R$ 192', 'R$ 204', 'R$ 240'], answer: 'R$ 192', hint: 'Os percentuais incidem sobre valores diferentes.' },
      { q: 'Um produto custa R$ 150. Com imposto de 12%, qual sera o valor total?', options: ['R$ 162', 'R$ 168', 'R$ 180', 'R$ 138'], answer: 'R$ 168', hint: 'Calcule 12% de 150 e some ao custo.' },
      { q: 'Uma loja vendeu por R$ 360 com lucro de 20% sobre o custo. Qual era o custo?', options: ['R$ 288', 'R$ 300', 'R$ 320', 'R$ 340'], answer: 'R$ 300', hint: 'R$ 360 representam 120% do custo.' },
      { q: 'Uma conta de R$ 240 teve multa de 5% e depois foi paga com R$ 20 de desconto. Quanto foi pago?', options: ['R$ 220', 'R$ 232', 'R$ 252', 'R$ 260'], answer: 'R$ 232', hint: 'Primeiro aplique a multa, depois retire o desconto.' }
    ]
  }
};

games.forEach(game => {
  game.questions = {
    Facil: [...game.questions, ...extraQuestions[game.id].Facil],
    Medio: extraQuestions[game.id].Medio,
    Dificil: extraQuestions[game.id].Dificil
  };
});

let user = JSON.parse(localStorage.getItem(storageKey) || 'null');
let currentGame = null;
let gameState = { index: 0, score: 0, answered: false, hint: false, level: 'Facil', results: [] };
function currentQuestions() { return currentGame.questions[gameState.level]; }
function activeDays(played) { return new Set(played.map(item => item.date)).size; }

function saveUser() { localStorage.setItem(storageKey, JSON.stringify(user)); }
function initials(name) { return name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase(); }
function render() { user ? renderDashboard() : renderAuth(); }

function renderAuth(register = false) {
  app.innerHTML = `<div class="auth-view">
    <section class="auth-art"><div class="brand"><span class="brand-mark">+</span> mathplay</div><div class="art-copy"><div class="eyebrow">Missão: aprender brincando</div><h1>Matemática que ganha vida.</h1><p>Uma trilha de desafios para transformar cada acerto em uma nova descoberta.</p></div></section>
    <section class="auth-panel"><form class="auth-card" id="auth-form"><div class="eyebrow">Portal do aluno</div><h2>${register ? 'Crie seu perfil' : 'Boas-vindas de volta'}</h2><p>${register ? 'Monte sua jornada e comece a jogar.' : 'Entre para continuar sua trilha de aprendizagem.'}</p>
      ${register ? '<div class="field"><label for="name">Como podemos te chamar?</label><input id="name" required placeholder="Seu nome"></div>' : ''}
      <div class="field"><label for="email">E-mail</label><input id="email" type="email" required placeholder="você@email.com"></div>
      <div class="field"><label for="password">Senha</label><input id="password" type="password" minlength="4" required placeholder="Mínimo de 4 caracteres"></div>
      <div class="error" id="auth-error"></div><button class="primary-btn auth-submit">${register ? 'Criar minha conta' : 'Entrar na MathPlay'} <span aria-hidden="true">→</span></button>
      <p class="auth-switch">${register ? 'Ja tem uma conta?' : 'Ainda nao tem uma conta?'} <button class="text-btn" type="button" id="toggle-auth">${register ? 'Fazer login' : 'Criar agora'}</button></p>
    </form></section></div>`;
  document.querySelector('#auth-form').addEventListener('submit', handleAuth);
  document.querySelector('#toggle-auth').addEventListener('click', () => renderAuth(!register));
}

function handleAuth(event) {
  event.preventDefault();
  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;
  const nameField = document.querySelector('#name');
  const existing = JSON.parse(localStorage.getItem(storageKey) || 'null');
  if (!nameField && (!existing || existing.email !== email || existing.password !== password)) {
    document.querySelector('#auth-error').textContent = 'E-mail ou senha nao conferem.';
    return;
  }
  user = nameField ? { name: nameField.value.trim(), email, password, totalScore: 0, played: [], badges: [] } : existing;
  saveUser(); render();
}

function renderDashboard() {
  const total = user.totalScore || 0;
  const played = user.played || [];
  const journeyDays = activeDays(played);
  const accuracy = played.length ? Math.round(played.reduce((sum, item) => sum + item.accuracy, 0) / played.length) : 0;
  app.innerHTML = `<div class="dashboard"><header class="topbar"><div class="brand"><span class="brand-mark">+</span> mathplay</div><div class="topbar-actions"><span class="user-name">${user.name}</span><span class="avatar">${initials(user.name)}</span><button class="ghost-btn" id="logout">Sair</button></div></header><main>
    <section class="hero"><div><div class="eyebrow">Sua central de descobertas</div><h1>Olá, ${user.name.split(' ')[0]}.</h1><p>Escolha um desafio e avance um passo na sua trilha.</p></div><div class="streak"><strong>${journeyDays} ${journeyDays === 1 ? 'dia' : 'dias'}</strong><span>de jornada ativa</span></div></section>
    <section class="stats"><div class="stat"><b>${total}</b><small>pontos acumulados</small></div><div class="stat"><b>${played.length}</b><small>desafios concluídos</small></div><div class="stat"><b>${accuracy}%</b><small>taxa de acerto</small></div></section>
    <div class="section-head"><h2>Trilha de aprendizagem</h2><span>4 mundos para explorar</span></div><section class="games">${games.map(game => gameCard(game, played)).join('')}</section>
    <section class="activity"><div class="panel"><div class="section-head"><h3>Medalhas</h3><span>${user.badges?.length || 0}/4</span></div><div class="badges">${badge('Primeiro passo', '★', (user.badges || []).includes('first'))}${badge('Mente afiada', '✦', (user.badges || []).includes('sharp'))}${badge('Explorador', '◆', (user.badges || []).includes('explorer'))}${badge('Mestre MathPlay', '♛', (user.badges || []).includes('master'))}</div></div><div class="panel"><div class="section-head"><h3>Atividade recente</h3><span>${played.length ? 'últimos jogos' : 'ainda vazio'}</span></div>${played.length ? played.slice(-3).reverse().map(item => `<div class="history-row"><span>${item.title}<br><small>${item.date}</small></span><span class="score">+${item.score} pts</span></div>`).join('') : '<p style="color:var(--muted);font-size:13px">Seu histórico aparece aqui depois da primeira partida.</p>'}</div></section>
  </main></div>`;
  document.querySelector('#logout').addEventListener('click', () => { user = null; render(); });
  document.querySelectorAll('[data-game]').forEach(button => button.addEventListener('click', () => openGame(button.dataset.game)));
}
function badge(label, symbol, unlocked) { return `<div class="badge ${unlocked ? '' : 'locked'}"><span>${symbol}</span>${label}</div>`; }
function gameCard(game, played) { const result = played.filter(item => item.id === game.id).at(-1); const progress = result ? Math.min(100, result.accuracy + 20) : 0; return `<article class="game-card"><div><div class="game-icon">${game.icon}</div><h3>${game.title}</h3><p>${game.description}</p></div><div><div class="progress-wrap"><div class="progress-line"><i style="width:${progress}%"></i></div></div><button class="game-link" data-game="${game.id}">Jogar agora <span>↗</span></button></div></article>`; }

function openGame(id) { currentGame = games.find(game => game.id === id); gameState = { index: 0, score: 0, answered: false, hint: false, level: 'Facil', results: [] }; renderGameModal(); }
function renderGameModal() { const questions = currentQuestions(); const question = questions[gameState.index]; const levelLabels = { Facil: 'Fácil', Medio: 'Médio', Dificil: 'Difícil' }; document.querySelector('#game-modal')?.remove(); app.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" id="game-modal"><section class="game-modal"><div class="modal-top"><div><div class="eyebrow">Desafio ${gameState.index + 1} de ${questions.length}</div><h2>${currentGame.title}</h2></div><button class="close-btn" id="close-game" aria-label="Fechar">×</button></div><p class="intro">Resolva a questão para liberar a próxima etapa.</p><div class="level-tabs">${['Facil', 'Medio', 'Dificil'].map(level => `<button class="${gameState.level === level ? 'active' : ''}" data-level="${level}">${levelLabels[level]}</button>`).join('')}</div><div class="question-box"><p class="question">${question.q}</p><div class="answer-grid">${question.options.map(option => `<button class="answer-btn" data-answer="${option}">${option}</button>`).join('')}</div></div><div class="hint" id="hint">${gameState.hint ? 'Dica: ' + question.hint : 'A dica progressiva está disponível quando precisar.'}</div><div class="modal-footer"><span class="game-meta">${gameState.score} pontos nesta partida</span><button class="ghost-btn" id="hint-btn">${gameState.hint ? 'Dica exibida' : 'Pedir dica'}</button></div></section></div>`); document.querySelector('#close-game').addEventListener('click', closeGame); document.querySelector('#hint-btn').addEventListener('click', () => { gameState.hint = true; renderGameModal(); }); document.querySelectorAll('[data-level]').forEach(button => button.addEventListener('click', () => { gameState.level = button.dataset.level; gameState.index = 0; gameState.answered = false; gameState.hint = false; renderGameModal(); })); document.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => answer(button, question))); }
function answer(button, question) { if (gameState.answered) return; gameState.answered = true; const questions = currentQuestions(); const correct = button.dataset.answer === question.answer; gameState.results.push({ question: question.q, answer: button.dataset.answer, correctAnswer: question.answer, correct }); button.classList.add(correct ? 'correct' : 'wrong'); document.querySelectorAll('[data-answer]').forEach(option => { if (option.dataset.answer === question.answer) option.classList.add('correct'); }); gameState.score += correct ? (gameState.level === 'Dificil' ? 150 : gameState.level === 'Medio' ? 125 : 100) : 0; const footer = document.querySelector('.modal-footer'); footer.innerHTML = `<span class="game-meta">${correct ? 'Muito bem! + pontos' : 'Quase! A resposta correta está destacada.'}</span><button class="primary-btn" id="next-question">${gameState.index === questions.length - 1 ? 'Ver resultado' : 'Continuar'} →</button>`; document.querySelector('#next-question').addEventListener('click', () => { if (gameState.index === questions.length - 1) finishGame(); else { gameState.index++; gameState.answered = false; gameState.hint = false; renderGameModal(); } }); }
function finishGame() { const questions = currentQuestions(); const correctCount = gameState.results.filter(result => result.correct).length; const accuracy = Math.round((correctCount / questions.length) * 100); user.totalScore = (user.totalScore || 0) + gameState.score; user.played = [...(user.played || []), { id: currentGame.id, title: currentGame.title, score: gameState.score, accuracy, date: new Date().toLocaleDateString('pt-BR') }]; user.badges = [...new Set([...(user.badges || []), ...(user.played.length === 1 ? ['first'] : []), ...(accuracy === 100 ? ['sharp'] : []), ...(new Set(user.played.map(item => item.id)).size === 4 ? ['explorer'] : []), ...(user.totalScore >= 1000 ? ['master'] : [])])]; saveUser(); renderResults(correctCount, accuracy); }
function renderResults(correctCount, accuracy) { const rows = gameState.results.map((result, index) => `<div class="result-row"><span class="result-status ${result.correct ? 'is-correct' : 'is-wrong'}">${result.correct ? '✓' : '×'}</span><div><strong>${index + 1}. ${result.question}</strong><small>Sua resposta: ${result.answer}${result.correct ? '' : ` · Correta: ${result.correctAnswer}`}</small></div></div>`).join(''); document.querySelector('#game-modal')?.remove(); app.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" id="game-modal"><section class="game-modal results-modal"><div class="modal-top"><div><div class="eyebrow">Resultado da partida</div><h2>${currentGame.title}</h2></div><button class="close-btn" id="close-game" aria-label="Fechar">×</button></div><div class="result-summary"><strong>${correctCount}/${gameState.results.length}</strong><span>${accuracy}% de acerto · ${gameState.score} pontos</span></div><div class="results-list">${rows}</div><button class="primary-btn result-done" id="result-done">Voltar para a trilha</button></section></div>`); document.querySelector('#close-game').addEventListener('click', () => { closeGame(); renderDashboard(); }); document.querySelector('#result-done').addEventListener('click', () => { closeGame(); renderDashboard(); }); }
function closeGame() { document.querySelector('#game-modal')?.remove(); }
render();
