const app = document.querySelector('#app');
const storageKey = 'mathplay-user';
const themeKey = 'mathplay-theme';
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
      { q: 'Qual fração é maior?', options: ['2/5', '3/5', 'São iguais', 'Não é possível'], answer: '3/5', hint: 'Compare os numeradores quando os denominadores são iguais.' }
    ]
  },
  {
    id: 'equacoes', icon: 'x', title: 'Cofre do Equilíbrio', description: 'Destrave cada cofre encontrando o valor de x.', color: 'yellow', questions: [
      { q: 'x + 7 = 15. Qual é o valor de x?', options: ['7', '8', '9', '22'], answer: '8', hint: 'Faça a operação inversa: 15 - 7.' },
      { q: '3x = 21. Qual é o valor de x?', options: ['6', '7', '18', '24'], answer: '7', hint: 'Divida os dois lados da igualdade por 3.' },
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
      { q: 'Qual é o resultado de -3 + 7?', options: ['-10', '4', '10', '-4'], answer: '4', hint: 'Avance 7 casas a partir de -3.' },
      { q: 'Quanto é 12 - 18?', options: ['6', '-6', '30', '-30'], answer: '-6', hint: 'Você retirou mais do que tinha, então terminou com um valor negativo.' }
    ],
    Medio: [
      { q: 'Uma temperatura de -6 graus sobe 14 graus e depois cai 5 graus. Qual é a temperatura final?', options: ['3 graus', '13 graus', '-3 graus', '-25 graus'], answer: '3 graus', hint: 'Calcule em duas etapas: -6 + 14 e depois subtraia 5.' },
      { q: 'Qual é o resultado de -4 - (-9) + 2?', options: ['-11', '3', '7', '15'], answer: '7', hint: 'Troque a subtração de um número negativo por uma soma: -4 + 9 + 2.' },
      { q: 'Um mergulhador está a -18 m, sobe 7 m e desce 4 m. Em que altitude fica?', options: ['-15 m', '-29 m', '15 m', '-7 m'], answer: '-15 m', hint: 'Represente a subida como +7 e a descida como -4.' },
      { q: 'Qual expressão tem o maior resultado?', options: ['-2 + 8', '-10 + 3', '4 - 9', '-1 - 6'], answer: '-2 + 8', hint: 'Calcule as quatro expressões antes de comparar.' }
    ],
    Dificil: [
      { q: 'Qual é o resultado de -3 × (4 - 9) - 6?', options: ['-21', '9', '21', '-9'], answer: '9', hint: 'Resolva primeiro os parênteses: 4 - 9 = -5.' },
      { q: 'Um saldo de R$ 35 recebe uma cobrança de R$ 48 e, depois, um depósito de R$ 27. Qual é o saldo final?', options: ['R$ 14', 'R$ -40', 'R$ 62', 'R$ 110'], answer: 'R$ 14', hint: 'Calcule 35 - 48 + 27.' },
      { q: 'Qual é o resultado de (-24) ÷ 6 + (-3) × (-2)?', options: ['-10', '-2', '2', '10'], answer: '2', hint: 'Resolva a divisão e a multiplicação antes da soma.' },
      { q: 'A diferença entre um número e 5 é -17. Qual é esse número?', options: ['-12', '12', '-22', '22'], answer: '-12', hint: 'Monte a expressão x - 5 = -17 e isole x.' }
    ]
  },
  fracoes: {
    Facil: [
      { q: 'Quanto é 2/7 + 3/7?', options: ['5/7', '5/14', '6/7', '1/7'], answer: '5/7', hint: 'Os denominadores já são iguais.' },
      { q: 'Qual fração representa 3 partes de um total de 8?', options: ['8/3', '3/8', '3/5', '5/8'], answer: '3/8', hint: 'O número de partes escolhidas fica no numerador.' }
    ],
    Medio: [
      { q: 'Quanto é 1/3 + 1/6?', options: ['2/9', '1/2', '2/6', '1/9'], answer: '1/2', hint: 'Transforme 1/3 em 2/6 antes de somar.' },
      { q: 'Quanto é 5/6 - 1/4?', options: ['4/2', '7/12', '1/2', '4/12'], answer: '7/12', hint: 'Use 12 como denominador comum.' },
      { q: 'Uma receita usa 3/4 de xícara. Para fazer meia receita, quanto será usado?', options: ['3/8 de xícara', '1/2 de xícara', '3/2 de xícara', '1/4 de xícara'], answer: '3/8 de xícara', hint: 'Calcule a metade de 3/4.' },
      { q: 'Qual é a forma simplificada de 18/24?', options: ['9/12', '3/4', '6/8', '2/3'], answer: '3/4', hint: 'Divida o numerador e o denominador pelo maior divisor comum.' }
    ],
    Dificil: [
      { q: 'Quanto é 2/3 × 9/10?', options: ['3/5', '4/5', '11/13', '2/5'], answer: '3/5', hint: 'Multiplique e simplifique o resultado.' },
      { q: 'Uma barra de 3/4 m foi dividida em pedaços de 1/8 m. Quantos pedaços foram formados?', options: ['3', '6', '8', '12'], answer: '6', hint: 'Dividir por 1/8 é descobrir quantos oitavos cabem em 3/4.' },
      { q: 'João gastou 2/5 do dinheiro e guardou R$ 36, que correspondem ao restante. Quanto ele tinha?', options: ['R$ 54', 'R$ 60', 'R$ 90', 'R$ 18'], answer: 'R$ 60', hint: 'R$ 36 representam 3/5 do total.' },
      { q: 'Qual é o resultado de 1 1/2 + 2 3/4?', options: ['3 1/4', '4 1/4', '4 3/4', '3 3/4'], answer: '4 1/4', hint: 'Some as partes inteiras e, depois, as frações.' }
    ]
  },
  equacoes: {
    Facil: [
      { q: 'x - 5 = 12. Qual é o valor de x?', options: ['7', '17', '-17', '60'], answer: '17', hint: 'Some 5 aos dois lados.' },
      { q: 'x / 4 = 6. Quanto vale x?', options: ['1,5', '10', '24', '2'], answer: '24', hint: 'Multiplique os dois lados por 4.' }
    ],
    Medio: [
      { q: '4x - 6 = 18. Qual é o valor de x?', options: ['3', '6', '12', '24'], answer: '6', hint: 'Some 6 e depois divida por 4.' },
      { q: '5x + 3 = 2x + 18. Quanto vale x?', options: ['3', '5', '7', '15'], answer: '5', hint: 'Junte os termos com x de um lado e os números do outro.' },
      { q: 'A metade de x mais 4 é igual a 10. Qual é o valor de x?', options: ['7', '12', '14', '28'], answer: '12', hint: 'Escreva x/2 + 4 = 10.' },
      { q: '2(x + 3) = 20. Qual é o valor de x?', options: ['7', '10', '13', '17'], answer: '7', hint: 'Divida por 2 antes de retirar 3.' }
    ],
    Dificil: [
      { q: '3(x - 4) + 2 = 20. Quanto vale x?', options: ['6', '8', '10', '14'], answer: '10', hint: 'Isole os parênteses: 3(x - 4) = 18.' },
      { q: '7x - 4 = 3x + 20. Qual é o valor de x?', options: ['4', '6', '8', '12'], answer: '6', hint: 'Subtraia 3x e some 4 aos dois lados.' },
      { q: 'A soma de um número com seu dobro é 36. Qual é esse número?', options: ['9', '12', '18', '24'], answer: '12', hint: 'Monte a equação x + 2x = 36.' },
      { q: '(x + 5) / 3 = 7. Qual é o valor de x?', options: ['16', '21', '26', '31'], answer: '16', hint: 'Multiplique por 3 e depois subtraia 5.' }
    ]
  },
  porcentagem: {
    Facil: [
      { q: 'Quanto é 25% de 40?', options: ['5', '10', '15', '20'], answer: '10', hint: '25% é a quarta parte.' },
      { q: 'Um produto de R$ 50 teve um aumento de R$ 5. Qual é o novo preço?', options: ['R$ 45', 'R$ 50', 'R$ 55', 'R$ 60'], answer: 'R$ 55', hint: 'Some o aumento ao preço original.' }
    ],
    Medio: [
      { q: 'Uma camiseta de R$ 80 tem 15% de desconto. Qual é o valor do desconto?', options: ['R$ 8', 'R$ 12', 'R$ 15', 'R$ 68'], answer: 'R$ 12', hint: 'Calcule 10% e 5% de R$ 80 e some os resultados.' },
      { q: 'Depois de um desconto de 25%, um jogo custa R$ 60. Qual era o preço original?', options: ['R$ 75', 'R$ 80', 'R$ 85', 'R$ 90'], answer: 'R$ 80', hint: 'R$ 60 correspondem a 75% do preço original.' },
      { q: 'Uma loja comprou um produto por R$ 120 e quer 25% de lucro. Por quanto deve vender?', options: ['R$ 135', 'R$ 145', 'R$ 150', 'R$ 160'], answer: 'R$ 150', hint: 'Some 25% de R$ 120 ao custo.' },
      { q: 'Em uma turma de 32 alunos, 75% fizeram a tarefa. Quantos alunos fizeram?', options: ['8', '16', '24', '28'], answer: '24', hint: '75% é igual a três quartos.' }
    ],
    Dificil: [
      { q: 'Um preço de R$ 200 sobe 20% e depois recebe um desconto de 20%. Qual é o preço final?', options: ['R$ 200', 'R$ 192', 'R$ 204', 'R$ 240'], answer: 'R$ 192', hint: 'Os percentuais incidem sobre valores diferentes.' },
      { q: 'Um produto custa R$ 150. Com imposto de 12%, qual será o valor total?', options: ['R$ 162', 'R$ 168', 'R$ 180', 'R$ 138'], answer: 'R$ 168', hint: 'Calcule 12% de R$ 150 e some ao custo.' },
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

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeQuestion(prompt, answer, hint, alternatives) {
  const options = [...new Set([String(answer), ...alternatives.map(String)])].slice(0, 4);
  while (options.length < 4) options.push(String(Number(answer) + options.length + 1));
  return { q: prompt, answer: String(answer), hint, options: shuffle(options) };
}

function createQuestionVariants(gameId, level) {
  return Array.from({ length: 12 }, (_, index) => {
    const value = 8 + index * 4 + Math.floor(Math.random() * 4);
    if (gameId === 'inteiros') {
      const answer = level === 'Facil' ? value - 5 : level === 'Medio' ? value - 9 - 4 : -3 * (value - 2) + 6;
      const prompt = level === 'Facil' ? `Quanto é -5 + ${value}?` : level === 'Medio' ? `Uma temperatura de -9°C sobe ${value}°C e depois cai 4°C. Qual é a temperatura final?` : `Quanto é -3 × (${value} - 2) + 6?`;
      return makeQuestion(prompt, answer, 'Resolva as operações na ordem indicada e cuide dos sinais.', [answer + 2, answer - 3, -answer]);
    }
    if (gameId === 'fracoes') {
      const denominator = 8 + index;
      const answer = level === 'Facil' ? `2/${denominator}` : level === 'Medio' ? `3/${denominator * 2}` : `6/${denominator * 5}`;
      const prompt = level === 'Facil' ? `Quanto é 1/${denominator} + 1/${denominator}?` : level === 'Medio' ? `Quanto é 1/${denominator} + 1/${denominator * 2}?` : `Quanto é 2/${denominator} × 3/5?`;
      return makeQuestion(prompt, answer, 'Observe os denominadores e aplique a operação entre as frações.', [`${denominator}/${2 + index}`, `${2 + index}/${denominator * 2}`, `${3 + index}/${denominator}`]);
    }
    if (gameId === 'equacoes') {
      const root = 3 + index;
      const answer = level === 'Facil' ? root : level === 'Medio' ? root : root;
      const prompt = level === 'Facil' ? `x + ${value} = ${value + root}. Qual é o valor de x?` : level === 'Medio' ? `${2 + index % 4}x + 3 = ${(2 + index % 4) * root + 3}. Qual é o valor de x?` : `${5 + index % 3}x + 4 = ${2 + index % 3}x + ${(5 + index % 3) * root + 4 - (2 + index % 3) * root}. Qual é o valor de x?`;
      return makeQuestion(prompt, answer, 'Isole o x usando operações inversas nos dois lados da igualdade.', [root + 2, root - 1, root * 2]);
    }
    const percent = level === 'Facil' ? 25 : 20;
    const amount = level === 'Facil' ? value * 4 : value * 5;
    const answer = level === 'Facil' ? amount / 4 : level === 'Medio' ? amount * (1 - percent / 100) : amount * (1 + percent / 100);
    const prompt = level === 'Facil' ? `Quanto é 25% de R$ ${amount}?` : level === 'Medio' ? `Um produto de R$ ${amount} teve desconto de 20%. Qual é o preço final?` : `Um produto de R$ ${amount} teve aumento de 20%. Qual é o novo preço?`;
    return makeQuestion(prompt, `R$ ${answer}`, 'Transforme a porcentagem em uma fração do valor e calcule.', [`R$ ${amount - answer}`, `R$ ${answer + 5}`, `R$ ${amount}`]);
  });
}

games.forEach(game => {
  for (const level of ['Facil', 'Medio', 'Dificil']) {
    game.questions[level] = [...game.questions[level], ...createQuestionVariants(game.id, level)];
  }
});

let user = null;
let currentGame = null;
const HINT_COST = 10;
const motivationMessages = [
  'Excelente raciocínio! Você encontrou a resposta.',
  'Mandou bem! Cada acerto fortalece seu conhecimento.',
  'Resposta certa! Seu esforço está dando resultado.',
  'Muito bem! Continue nesse ritmo.',
  'Boa! Você está dominando esse desafio.',
  'Acertou em cheio! Vamos para a próxima.'
];
const wrongMotivationMessages = [
  'Não desista! Cada erro ajuda você a entender melhor.',
  'Respire, tente outra vez e confie no seu raciocínio.',
  'Errar faz parte do aprendizado. Você está evoluindo!',
  'Na próxima tentativa você pode chegar lá!',
  'Uma resposta errada não define você. Continue praticando.',
  'Reveja o caminho e siga em frente. Você consegue!',
  'Toda questão ensina algo. A próxima é uma nova chance.'
];
const medals = [
  { id: 'first', label: 'Primeiro passo', symbol: '★', requirement: 'Conclua seu primeiro desafio.', unlocks: profile => profile.played.length >= 1 },
  { id: 'sharp', label: 'Mente afiada', symbol: '✦', requirement: 'Acerte 100% de uma partida.', unlocks: profile => profile.played.some(item => item.accuracy === 100) },
  { id: 'explorer', label: 'Explorador', symbol: '◆', requirement: 'Jogue nos quatro mundos.', unlocks: profile => new Set(profile.played.map(item => item.id)).size >= 4 },
  { id: 'master', label: 'Mestre MathPlay', symbol: '♛', requirement: 'Alcance 1.000 pontos acumulados.', unlocks: profile => profile.totalScore >= 1000 },
  { id: 'dedicado', label: 'Dedicado', symbol: '●', requirement: 'Conclua cinco desafios.', unlocks: profile => profile.played.length >= 5 },
  { id: 'perfectionist', label: 'Perfeccionista', symbol: '✓', requirement: 'Tenha duas partidas com 100% de acerto.', unlocks: profile => profile.played.filter(item => item.accuracy === 100).length >= 2 },
  { id: 'specialist', label: 'Especialista', symbol: '◆', requirement: 'Alcance pelo menos 80% em cada mundo.', unlocks: profile => new Set(profile.played.filter(item => item.accuracy >= 80).map(item => item.id)).size >= 4 },
  { id: 'legend', label: 'Lenda MathPlay', symbol: '♛', requirement: 'Alcance 2.000 pontos acumulados.', unlocks: profile => profile.totalScore >= 2000 },
  { id: 'iniciante-plus', label: 'Aprendiz constante', symbol: '✧', requirement: 'Conclua três desafios.', unlocks: profile => profile.played.length >= 3 },
  { id: 'century', label: 'Primeira centena', symbol: '100', requirement: 'Acumule 100 pontos.', unlocks: profile => profile.totalScore >= 100 },
  { id: 'quinhentos', label: 'Meio caminho', symbol: '500', requirement: 'Acumule 500 pontos.', unlocks: profile => profile.totalScore >= 500 },
  { id: 'veteran', label: 'Veterano', symbol: '★', requirement: 'Conclua dez desafios.', unlocks: profile => profile.played.length >= 10 },
  { id: 'marathon', label: 'Maratonista', symbol: '➤', requirement: 'Conclua vinte desafios.', unlocks: profile => profile.played.length >= 20 },
  { id: 'three-worlds', label: 'Viajante dos mundos', symbol: '◆', requirement: 'Jogue em pelo menos três mundos.', unlocks: profile => new Set(profile.played.map(item => item.id)).size >= 3 },
  { id: 'three-perfect', label: 'Precisão de ouro', symbol: '✦', requirement: 'Tenha três partidas com 100% de acerto.', unlocks: profile => profile.played.filter(item => item.accuracy === 100).length >= 3 },
  { id: 'five-hundred-round', label: 'Pontuação brilhante', symbol: '⬟', requirement: 'Faça 500 pontos em uma partida.', unlocks: profile => profile.played.some(item => item.score >= 500) },
  { id: 'comeback', label: 'Sempre em frente', symbol: '↗', requirement: 'Conclua cinco desafios com pelo menos 60% de acerto.', unlocks: profile => profile.played.filter(item => item.accuracy >= 60).length >= 5 },
  { id: 'first-correct', label: 'Primeiro acerto', symbol: '✓', requirement: 'Acerte pelo menos uma questão em um desafio.', unlocks: profile => profile.played.some(item => item.accuracy > 0) }
];
let gameState = { index: 0, score: 0, answered: false, hint: false, level: 'Facil', results: [] };
function currentQuestions() { return gameState.questionSets[gameState.level]; }
function activeDays(played) { return new Set(played.map(item => item.date)).size; }
function unlockedMedals(profile) { return medals.filter(medal => medal.unlocks(profile)).map(medal => medal.id); }
function motivation(correct) { const messages = correct ? motivationMessages : wrongMotivationMessages; return messages[Math.floor(Math.random() * messages.length)]; }
function pointsAfterHints() { return Math.max(0, gameState.score - gameState.hintsUsed * HINT_COST); }
function prepareQuestionSets(game) {
  const historyKey = 'mathplay-question-history';
  const history = JSON.parse(localStorage.getItem(historyKey) || '{}');
  const used = history[game.id] || [];
  const nextUsed = [];
  const questionSets = {};
  for (const level of ['Facil', 'Medio', 'Dificil']) {
    const available = game.questions[level].filter(question => !used.includes(question.q));
    const selection = shuffle(available.length >= 4 ? available : game.questions[level]).slice(0, 4);
    questionSets[level] = selection;
    nextUsed.push(...selection.map(question => question.q));
  }
  history[game.id] = [...used, ...nextUsed].slice(-80);
  localStorage.setItem(historyKey, JSON.stringify(history));
  return questionSets;
}

async function api(action, payload = {}) {
  const response = await fetch(`api.php?action=${action}`, {
    method: action === 'me' ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: action === 'me' ? undefined : JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a operação.');
  return data;
}

async function saveUser() {
  const data = await api('save', user);
  user = data.user;
}
function initials(name) { return name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase(); }
function render() { user ? renderDashboard() : renderAuth(); }
function currentTheme() { return document.documentElement.dataset.theme || 'light'; }
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(themeKey, theme);
}
function themeToggle() {
  const dark = currentTheme() === 'dark';
  return `<button class="theme-toggle" id="theme-toggle" type="button" aria-label="Ativar modo ${dark ? 'claro' : 'escuro'}" title="Modo ${dark ? 'claro' : 'escuro'}">${dark ? '☀ Modo claro' : '☾ Modo escuro'}</button>`;
}
function bindThemeToggle() {
  document.querySelector('#theme-toggle')?.addEventListener('click', () => {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    render();
  });
}

function renderAuth(register = false) {
  app.innerHTML = `<div class="auth-view">
    <section class="auth-art"><div class="brand"><span class="brand-mark">+</span> mathplay</div>${themeToggle()}<div class="art-copy"><div class="eyebrow">Missão: aprender brincando</div><h1>Matemática que ganha vida.</h1><p>Uma trilha de desafios para transformar cada acerto em uma nova descoberta.</p></div></section>
    <section class="auth-panel"><form class="auth-card" id="auth-form"><div class="eyebrow">Portal do aluno</div><h2>${register ? 'Crie seu perfil' : 'Boas-vindas de volta'}</h2><p>${register ? 'Monte sua jornada e comece a jogar.' : 'Entre para continuar sua trilha de aprendizagem.'}</p>
      ${register ? '<div class="field"><label for="name">Como podemos te chamar?</label><input id="name" required placeholder="Seu nome"></div>' : ''}
      <div class="field"><label for="email">E-mail</label><input id="email" type="email" required placeholder="você@email.com"></div>
      <div class="field"><label for="password">Senha</label><input id="password" type="password" minlength="4" required placeholder="Mínimo de 4 caracteres"></div>
      <div class="error" id="auth-error"></div><button class="primary-btn auth-submit">${register ? 'Criar minha conta' : 'Entrar na MathPlay'} <span aria-hidden="true">→</span></button>
      <div class="auth-divider"><span>ou</span></div><button class="google-btn" type="button" id="google-login"><span class="google-mark">G</span> Continuar com o Google</button><p class="google-note">Entre usando sua conta Gmail.</p>
      <p class="auth-switch">${register ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'} <button class="text-btn" type="button" id="toggle-auth">${register ? 'Fazer login' : 'Criar agora'}</button></p>
    </form></section></div>`;
  document.querySelector('#auth-form').addEventListener('submit', handleAuth);
  document.querySelector('#google-login').addEventListener('click', startGoogleLogin);
  document.querySelector('#toggle-auth').addEventListener('click', () => renderAuth(!register));
  bindThemeToggle();
}

function startGoogleLogin() {
  const error = document.querySelector('#auth-error');
  if (!window.mathplayGoogleClientId) {
    error.textContent = 'Configure o Client ID do Google no servidor para ativar este login.';
    return;
  }
  if (!window.google?.accounts?.id) {
    error.textContent = 'O login Google ainda não foi configurado. Defina o Client ID OAuth no servidor.';
    return;
  }
  window.google.accounts.id.prompt();
}

async function handleGoogleCredential(response) {
  const error = document.querySelector('#auth-error');
  error.textContent = '';
  try {
    const data = await api('google-login', { credential: response.credential });
    user = data.user;
    render();
  } catch (requestError) {
    error.textContent = requestError.message;
  }
}

window.handleGoogleCredential = handleGoogleCredential;

async function handleAuth(event) {
  event.preventDefault();
  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;
  const nameField = document.querySelector('#name');
  const error = document.querySelector('#auth-error');
  error.textContent = '';
  try {
    const data = await api(nameField ? 'register' : 'login', {
      name: nameField?.value.trim(), email, password
    });
    user = data.user;
    render();
  } catch (requestError) {
    error.textContent = requestError.message;
  }
}

function renderDashboard() {
  const total = user.totalScore || 0;
  const played = user.played || [];
  const earnedMedals = medals.filter(medal => (user.badges || []).includes(medal.id));
  const journeyDays = activeDays(played);
  const accuracy = played.length ? Math.round(played.reduce((sum, item) => sum + item.accuracy, 0) / played.length) : 0;
  app.innerHTML = `<div class="dashboard"><header class="topbar"><div class="brand"><span class="brand-mark">+</span> mathplay</div><div class="topbar-actions">${themeToggle()}<span class="user-name">${user.name}</span><span class="avatar">${initials(user.name)}</span><button class="ghost-btn" id="logout">Sair</button></div></header><main>
    <section class="hero"><div><div class="eyebrow">Sua central de descobertas</div><h1>Olá, ${user.name.split(' ')[0]}.</h1><p>Escolha um desafio e avance um passo na sua trilha.</p></div><div class="streak"><strong>${journeyDays} ${journeyDays === 1 ? 'dia' : 'dias'}</strong><span>de jornada ativa</span></div></section>
    <section class="stats"><div class="stat"><b>${total}</b><small>pontos acumulados</small></div><div class="stat"><b>${played.length}</b><small>desafios concluídos</small></div><div class="stat"><b>${accuracy}%</b><small>taxa de acerto</small></div></section>
    <div class="section-head"><h2>Trilha de aprendizagem</h2><span>4 mundos para explorar</span></div><section class="games">${games.map(game => gameCard(game, played)).join('')}</section>
    <section class="activity"><div class="panel"><div class="section-head"><h3>Medalhas conquistadas</h3><span>${earnedMedals.length}/${medals.length}</span></div><div class="badges">${earnedMedals.length ? earnedMedals.map(medal => badge(medal.label, medal.symbol, true)).join('') : '<p class="empty-medals">Conclua um desafio para conquistar sua primeira medalha.</p>'}</div></div><div class="panel"><div class="section-head"><h3>Atividade recente</h3><span>${played.length ? 'últimos jogos' : 'ainda vazio'}</span></div>${played.length ? played.slice(-3).reverse().map(item => `<div class="history-row"><span>${item.title}<br><small>${item.date}</small></span><span class="score">+${item.score} pts</span></div>`).join('') : '<p style="color:var(--muted);font-size:13px">Seu histórico aparece aqui depois da primeira partida.</p>'}</div></section>
    <section class="medals-section"><div class="section-head"><div><h2>Todas as medalhas</h2><span>Veja como desbloquear cada conquista.</span></div><span>${earnedMedals.length} conquistadas</span></div><div class="all-medals">${medals.map(medal => medalCard(medal, (user.badges || []).includes(medal.id))).join('')}</div></section>
  </main></div>`;
  document.querySelector('#logout').addEventListener('click', async () => { await api('logout'); user = null; render(); });
  document.querySelectorAll('[data-game]').forEach(button => button.addEventListener('click', () => openGame(button.dataset.game)));
  bindThemeToggle();
}
function badge(label, symbol, unlocked) { return `<div class="badge ${unlocked ? '' : 'locked'}"><span>${symbol}</span>${label}</div>`; }
function medalCard(medal, unlocked) { return `<article class="medal-card ${unlocked ? 'is-earned' : 'is-locked'}"><div class="medal-card-icon">${medal.symbol}</div><div><h3>${medal.label}</h3><p>${medal.requirement}</p><strong>${unlocked ? 'Conquistada' : 'Ainda não desbloqueada'}</strong></div></article>`; }
function gameCard(game, played) { const result = played.filter(item => item.id === game.id).at(-1); const progress = result ? Math.min(100, result.accuracy + 20) : 0; return `<article class="game-card"><div><div class="game-icon">${game.icon}</div><h3>${game.title}</h3><p>${game.description}</p></div><div><div class="progress-wrap"><div class="progress-line"><i style="width:${progress}%"></i></div></div><button class="game-link" data-game="${game.id}">Jogar agora <span>↗</span></button></div></article>`; }

function openGame(id) { currentGame = games.find(game => game.id === id); gameState = { index: 0, score: 0, hintsUsed: 0, answered: false, hint: false, level: 'Facil', results: [], questionSets: prepareQuestionSets(currentGame) }; renderGameModal(); }
function renderGameModal() { const questions = currentQuestions(); const question = questions[gameState.index]; const levelLabels = { Facil: 'Fácil', Medio: 'Médio', Dificil: 'Difícil' }; document.querySelector('#game-modal')?.remove(); app.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" id="game-modal"><section class="game-modal"><div class="modal-top"><div><div class="eyebrow">Desafio ${gameState.index + 1} de ${questions.length}</div><h2>${currentGame.title}</h2></div><button class="close-btn" id="close-game" aria-label="Fechar">×</button></div><p class="intro">Resolva a questão para liberar a próxima etapa.</p><div class="level-tabs">${['Facil', 'Medio', 'Dificil'].map(level => `<button class="${gameState.level === level ? 'active' : ''}" data-level="${level}">${levelLabels[level]}</button>`).join('')}</div><div class="question-box"><p class="question">${question.q}</p><p class="question-motivation">Escolha uma resposta para conferir seu raciocínio.</p><div class="answer-grid">${question.options.map(option => `<button class="answer-btn" data-answer="${option}">${option}</button>`).join('')}</div></div><div class="hint" id="hint">${gameState.hint ? `Dica: ${question.hint} Desconto aplicado: ${HINT_COST} pontos.` : `<strong>Atenção: cada dica desconta ${HINT_COST} pontos da partida.</strong> O desconto vale mesmo se errar a resposta.`}</div><div class="modal-footer"><span class="game-meta">${pointsAfterHints()} pontos nesta partida</span><button class="ghost-btn" id="hint-btn" ${gameState.hint ? 'disabled' : ''}>${gameState.hint ? `Dica usada (-${HINT_COST} pts)` : `Pedir dica (-${HINT_COST} pts)`}</button></div></section></div>`); document.querySelector('#close-game').addEventListener('click', closeGame); document.querySelector('#hint-btn').addEventListener('click', () => { if (gameState.hint) return; gameState.hint = true; gameState.hintsUsed++; renderGameModal(); }); document.querySelectorAll('[data-level]').forEach(button => button.addEventListener('click', () => { gameState.level = button.dataset.level; gameState.index = 0; gameState.answered = false; gameState.hint = false; renderGameModal(); })); document.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => answer(button, question))); }
function answer(button, question) { if (gameState.answered) return; gameState.answered = true; const questions = currentQuestions(); const correct = button.dataset.answer === question.answer; const basePoints = gameState.level === 'Dificil' ? 150 : gameState.level === 'Medio' ? 125 : 100; const previousScore = pointsAfterHints(); gameState.results.push({ question: question.q, answer: button.dataset.answer, correctAnswer: question.answer, correct }); button.classList.add(correct ? 'correct' : 'wrong'); document.querySelectorAll('[data-answer]').forEach(option => { if (option.dataset.answer === question.answer) option.classList.add('correct'); }); if (correct) gameState.score += basePoints; const pointsEarned = pointsAfterHints() - previousScore; const motivationElement = document.querySelector('.question-motivation'); motivationElement.textContent = motivation(correct); motivationElement.classList.add(correct ? 'is-correct' : 'is-wrong'); const feedback = correct ? `Muito bem! +${pointsEarned} pontos líquidos.` : 'Quase! A resposta correta está destacada.'; const footer = document.querySelector('.modal-footer'); footer.innerHTML = `<span class="game-meta">${feedback}</span><button class="primary-btn" id="next-question">${gameState.index === questions.length - 1 ? 'Ver resultado' : 'Continuar'} →</button>`; document.querySelector('#next-question').addEventListener('click', () => { if (gameState.index === questions.length - 1) finishGame(); else { gameState.index++; gameState.answered = false; gameState.hint = false; renderGameModal(); } }); }
async function finishGame() { const correctCount = gameState.results.filter(result => result.correct).length; const accuracy = Math.round((correctCount / gameState.results.length) * 100); const finalScore = pointsAfterHints(); user.totalScore = (user.totalScore || 0) + finalScore; user.played = [...(user.played || []), { id: currentGame.id, title: currentGame.title, score: finalScore, accuracy, date: new Date().toLocaleDateString('pt-BR') }]; user.badges = [...new Set([...user.badges || [], ...unlockedMedals(user)])]; try { await saveUser(); renderResults(correctCount, accuracy, finalScore); } catch (requestError) { alert(requestError.message); } }
function renderResults(correctCount, accuracy, finalScore) { const rows = gameState.results.map((result, index) => `<div class="result-row"><span class="result-status ${result.correct ? 'is-correct' : 'is-wrong'}">${result.correct ? '✓' : '×'}</span><div><strong>${index + 1}. ${result.question}</strong><small>Sua resposta: ${result.answer}${result.correct ? '' : ` · Correta: ${result.correctAnswer}`}</small></div></div>`).join(''); const resultMessage = accuracy === 100 ? 'Excelente! Você resolveu tudo com muita atenção.' : accuracy >= 60 ? 'Muito bom! Continue praticando para ficar ainda melhor.' : 'Cada tentativa ensina algo novo. Continue praticando e use uma dica quando precisar.'; document.querySelector('#game-modal')?.remove(); app.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" id="game-modal"><section class="game-modal results-modal"><div class="modal-top"><div><div class="eyebrow">Resultado da partida</div><h2>${currentGame.title}</h2></div><button class="close-btn" id="close-game" aria-label="Fechar">×</button></div><div class="result-summary"><strong>${correctCount}/${gameState.results.length}</strong><span>${accuracy}% de acerto · ${finalScore} pontos após dicas</span></div><p class="motivation-message">${resultMessage}</p><div class="results-list">${rows}</div><button class="primary-btn result-done" id="result-done">Voltar para a trilha</button></section></div>`); document.querySelector('#close-game').addEventListener('click', () => { closeGame(); renderDashboard(); }); document.querySelector('#result-done').addEventListener('click', () => { closeGame(); renderDashboard(); }); }
function closeGame() { document.querySelector('#game-modal')?.remove(); }
applyTheme(localStorage.getItem(themeKey) || 'light');
api('me').then(data => { user = data.user; render(); }).catch(() => render());
