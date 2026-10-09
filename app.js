




import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc
} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js';
import { auth, db } from './firebase.js?v=2';

const app = document.querySelector('#app');
const themeKey = 'mathplay-theme';
const accessibilityKey = 'mathplay-accessibility';
const QUESTIONS_PER_ROUND = 10;
const BOSS_DAMAGE_PER_CORRECT = 100;
const PLAYER_DAMAGE_PER_WRONG = 20;
const accessibilityDefaults = {
  largeText: false,
  highContrast: false,
  readableFont: false,
  reducedMotion: false
};
let accessibilitySettings = loadAccessibilitySettings();
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

games.filter(game => extraQuestions[game.id]).forEach(game => {
  game.questions = {
    Facil: [...game.questions, ...extraQuestions[game.id].Facil],
    Medio: extraQuestions[game.id].Medio,
    Dificil: extraQuestions[game.id].Dificil
  };
});

const bonusGames = [
  {
    id: 'codigo-secreto',
    icon: '⌘',
    title: 'Código Secreto',
    description: 'Descubra padrões numéricos e decifre combinações como um detetive.',
    color: 'coral',
    questions: {
      Facil: [
        { q: 'Qual número completa a sequência: 2, 4, 6, 8, ...?', options: ['9', '10', '12', '14'], answer: '10', hint: 'A sequência aumenta de 2 em 2.' },
        { q: 'Uma senha usa o dobro de 7. Qual é o número?', options: ['12', '14', '16', '21'], answer: '14', hint: 'Multiplique 7 por 2.' },
        { q: 'Qual número está faltando: 5, 10, __, 20?', options: ['12', '14', '15', '16'], answer: '15', hint: 'Conte de 5 em 5.' },
        { q: 'Tenho 3 dezenas e 2 unidades. Que número sou?', options: ['23', '30', '32', '35'], answer: '32', hint: 'Três dezenas valem 30.' }
      ],
      Medio: [
        { q: 'Qual número completa: 3, 6, 12, 24, ...?', options: ['30', '36', '42', '48'], answer: '48', hint: 'Cada termo é o dobro do anterior.' },
        { q: 'Uma senha tem três algarismos consecutivos começando em 4. Qual é a soma deles?', options: ['12', '15', '18', '21'], answer: '15', hint: 'Some 4 + 5 + 6.' },
        { q: 'Qual número completa: 1, 4, 9, 16, ...?', options: ['20', '25', '30', '36'], answer: '25', hint: 'São quadrados: 1², 2², 3², 4²...' },
        { q: 'Se A=1, B=2 e C=3, quanto vale CAB?', options: ['312', '321', '123', '213'], answer: '312', hint: 'Troque cada letra pelo número correspondente, na mesma ordem.' }
      ],
      Dificil: [
        { q: 'Qual número completa: 2, 5, 11, 23, ...?', options: ['35', '46', '47', '48'], answer: '47', hint: 'Multiplique por 2 e some 1 a cada passo.' },
        { q: 'Uma senha é 3 vezes um número mais 4. Se a senha vale 31, qual é o número?', options: ['7', '8', '9', '10'], answer: '9', hint: 'Desfaça primeiro o +4 e depois divida por 3.' },
        { q: 'Qual número completa: 1, 2, 6, 24, ...?', options: ['48', '96', '120', '144'], answer: '120', hint: 'Multiplique sucessivamente por 2, 3, 4 e depois 5.' },
        { q: 'A soma de dois números consecutivos é 41. Qual é o maior?', options: ['19', '20', '21', '22'], answer: '21', hint: 'Os números são 20 e 21.' }
      ]
    }
  },
  {
    id: 'corrida-numerica',
    icon: '➤',
    title: 'Corrida Numérica',
    description: 'Calcule distâncias, voltas e posições para cruzar a linha de chegada.',
    color: 'blue',
    questions: {
      Facil: [
        { q: 'Uma volta tem 400 m. Quantos metros há em 2 voltas?', options: ['600 m', '800 m', '1.000 m', '1.200 m'], answer: '800 m', hint: 'Multiplique 400 por 2.' },
        { q: 'Você está na posição 8 e avança 3 lugares. Em que posição chega?', options: ['5ª', '10ª', '11ª', '12ª'], answer: '11ª', hint: 'Some 8 + 3.' },
        { q: 'Um corredor percorre 5 km por dia durante 3 dias. Quantos km percorre?', options: ['8 km', '12 km', '15 km', '20 km'], answer: '15 km', hint: 'Multiplique 5 por 3.' },
        { q: 'Faltam 100 m para a chegada. Você corre 40 m. Quantos metros faltam?', options: ['40 m', '50 m', '60 m', '70 m'], answer: '60 m', hint: 'Subtraia 40 de 100.' }
      ],
      Medio: [
        { q: 'Uma pista tem 600 m. Quantos quilômetros são 5 voltas?', options: ['2 km', '2,5 km', '3 km', '3,5 km'], answer: '3 km', hint: '600 × 5 = 3.000 metros, ou 3 km.' },
        { q: 'Um atleta corre 12 km em 3 horas. Qual é sua média por hora?', options: ['3 km/h', '4 km/h', '6 km/h', '9 km/h'], answer: '4 km/h', hint: 'Divida 12 por 3.' },
        { q: 'Você tinha 250 pontos, ganhou 3 bônus de 40 e perdeu 20. Quantos tem?', options: ['330', '340', '350', '370'], answer: '350', hint: 'Calcule 250 + 3 × 40 - 20.' },
        { q: 'Uma corrida tem 8 voltas de 750 m. Qual é a distância total?', options: ['5 km', '6 km', '7 km', '8 km'], answer: '6 km', hint: '750 × 8 = 6.000 metros.' }
      ],
      Dificil: [
        { q: 'Você percorre 2,4 km em 12 minutos. Mantendo o ritmo, quanto leva para 6 km?', options: ['24 min', '30 min', '36 min', '42 min'], answer: '30 min', hint: '6 km é 2,5 vezes 2,4 km.' },
        { q: 'Um corredor está em 4º lugar. Ultrapassa duas pessoas e depois é ultrapassado por uma. Qual posição ocupa?', options: ['2º', '3º', '4º', '5º'], answer: '3º', hint: 'Depois de ultrapassar, fica em 2º; ao ser ultrapassado, volta para 3º.' },
        { q: 'Uma equipe percorre 3/4 de uma pista de 2 km. Quantos metros percorre?', options: ['750 m', '1.000 m', '1.500 m', '1.750 m'], answer: '1.500 m', hint: 'Calcule 2.000 ÷ 4 × 3.' },
        { q: 'Uma corredora está em 6º lugar, ultrapassa três atletas e depois perde uma posição. Em que lugar termina?', options: ['2º', '3º', '4º', '5º'], answer: '4º', hint: 'Ao ultrapassar, o número da posição diminui; ao ser ultrapassada, aumenta.' }
      ]
    }
  },
  {
    id: 'missao-espacial',
    icon: '✦',
    title: 'Missão Espacial',
    description: 'Enfrente o Guardião Cósmico: acerte para atacar e desvie dos golpes errados.',
    color: 'mint',
    boss: { name: 'Guardião Cósmico', health: QUESTIONS_PER_ROUND * BOSS_DAMAGE_PER_CORRECT },
    questions: {
      Facil: [
        { q: 'A nave tem 30 unidades de combustível e usa 12. Quanto resta?', options: ['12', '16', '18', '22'], answer: '18', hint: 'Subtraia 12 de 30.' },
        { q: 'Um planeta está na coordenada 4 e outro na 9. Qual é a distância entre eles?', options: ['3', '4', '5', '13'], answer: '5', hint: 'Calcule 9 - 4.' },
        { q: 'Há 4 caixas com 5 alimentos em cada. Quantos alimentos há?', options: ['9', '15', '20', '25'], answer: '20', hint: 'Multiplique 4 por 5.' },
        { q: 'A temperatura é -2°C e sobe 7°C. Qual é a nova temperatura?', options: ['-9°C', '-5°C', '5°C', '9°C'], answer: '5°C', hint: 'Calcule -2 + 7.' }
      ],
      Medio: [
        { q: 'A nave viaja 240.000 km em 4 horas. Quantos km percorre por hora?', options: ['40.000', '50.000', '60.000', '80.000'], answer: '60.000', hint: 'Divida 240.000 por 4.' },
        { q: 'Um tanque está com 3/5 de 100 litros. Quantos litros contém?', options: ['30', '40', '50', '60'], answer: '60', hint: 'Cada quinto vale 20 litros.' },
        { q: 'A equipe coleta 18 pedras por hora durante 6 horas e divide igualmente entre 3 módulos. Quantas por módulo?', options: ['24', '30', '36', '48'], answer: '36', hint: 'Calcule 18 × 6 e divida por 3.' },
        { q: 'A nave está no nível -15 e sobe 8, depois desce 4. Onde termina?', options: ['-11', '-7', '7', '11'], answer: '-11', hint: 'Calcule -15 + 8 - 4.' }
      ],
      Dificil: [
        { q: 'Uma nave percorre 2/3 de 900.000 km e depois mais 150.000 km. Quanto percorreu?', options: ['600.000', '700.000', '750.000', '800.000'], answer: '750.000', hint: 'Dois terços de 900.000 são 600.000.' },
        { q: 'O radar registra 2, 6, 12, 20, ... Qual é a próxima coordenada?', options: ['28', '30', '32', '36'], answer: '30', hint: 'As diferenças são +4, +6 e +8; a próxima diferença é +10.' },
        { q: 'Três módulos geram 24, 36 e 48 unidades. Qual é a média por módulo?', options: ['32', '34', '36', '38'], answer: '36', hint: 'Some as quantidades e divida por 3.' },
        { q: 'Uma sequência de coordenadas é 3, 8, 15, 24, ... Qual é o próximo número?', options: ['32', '33', '35', '36'], answer: '35', hint: 'As diferenças são +5, +7, +9; a próxima é +11.' }
      ]
    }
  },
  {
    id: 'torre-logica',
    icon: '▥',
    title: 'Torre da Lógica',
    description: 'Resolva enigmas de estratégia, equilíbrio e dedução para subir de nível.',
    color: 'yellow',
    questions: {
      Facil: [
        { q: 'Qual número é maior: 3 × 4 ou 20 - 5?', options: ['3 × 4', '20 - 5', 'São iguais', 'Não dá para saber'], answer: '20 - 5', hint: 'Compare 12 com 15.' },
        { q: 'Uma torre tem 4 andares com 3 blocos em cada. Quantos blocos?', options: ['7', '10', '12', '14'], answer: '12', hint: 'Multiplique 4 por 3.' },
        { q: 'Se hoje é o dia 10, que dia será daqui a 5 dias?', options: ['14', '15', '16', '20'], answer: '15', hint: 'Some 10 + 5.' },
        { q: 'Qual peça completa: 1, 3, 5, 7, ...?', options: ['8', '9', '10', '11'], answer: '9', hint: 'A sequência aumenta de 2 em 2.' }
      ],
      Medio: [
        { q: 'Uma balança equilibra 2 caixas iguais e 6 kg com 20 kg. Quanto pesa cada caixa?', options: ['5 kg', '6 kg', '7 kg', '8 kg'], answer: '7 kg', hint: 'Retire 6 kg e divida o restante por 2.' },
        { q: 'Em um torneio com 6 jogadores, todos se enfrentam uma vez. Quantas partidas?', options: ['12', '15', '18', '30'], answer: '15', hint: 'Conte pares de jogadores: 6 × 5 ÷ 2.' },
        { q: 'Qual número falta: 2, 6, 12, 20, ...?', options: ['26', '28', '30', '32'], answer: '30', hint: 'As diferenças são +4, +6, +8; depois +10.' },
        { q: 'Tenho o triplo de 8 menos 5. Qual é meu valor?', options: ['19', '21', '24', '29'], answer: '19', hint: 'Primeiro multiplique 3 × 8, depois subtraia 5.' }
      ],
      Dificil: [
        { q: 'Três interruptores controlam três lâmpadas. Quantas combinações diferentes existem, ligadas ou desligadas?', options: ['6', '8', '9', '12'], answer: '8', hint: 'Cada interruptor tem 2 opções: 2 × 2 × 2.' },
        { q: 'A soma de três números consecutivos é 72. Qual é o maior?', options: ['23', '24', '25', '26'], answer: '25', hint: 'O número do meio é 24.' },
        { q: 'Um código de 2 algarismos usa 1, 2 ou 3, sem repetir. Quantos códigos existem?', options: ['3', '6', '8', '9'], answer: '6', hint: 'Há 3 opções para o primeiro lugar e 2 para o segundo.' },
        { q: 'Um prêmio de 96 pontos é dividido na razão 1:2:3. Quantos pontos recebe a maior parte?', options: ['16', '32', '48', '64'], answer: '48', hint: 'A razão tem 6 partes; cada uma vale 16 pontos.' }
      ]
    }
  }
];

games.push(...bonusGames);

function createBonusQuestionVariants(gameId, level) {
  const variantCount = QUESTIONS_PER_ROUND - bonusGames.find(game => game.id === gameId).questions[level].length;
  return Array.from({ length: variantCount }, (_, index) => {
    const value = index + 2;
    let prompt;
    let answer;
    let hint;
    let alternatives;

    if (gameId === 'codigo-secreto') {
      const clueStart = value * 2;
      if (index === 0) {
        const step = level === 'Facil' ? 2 : level === 'Medio' ? 3 : 4;
        answer = value + step * 4;
        prompt = `Complete o código: ${value}, ${value + step}, ${value + step * 2}, ${value + step * 3}, ...`;
        hint = `A sequência avança de ${step} em ${step}.`;
        alternatives = [answer + step, answer - step, answer + step * 2];
      } else if (index === 1) {
        const distance = level === 'Facil' ? 4 : level === 'Medio' ? 6 : 8;
        answer = clueStart + distance;
        prompt = `Descubra o número: é par, maior que ${clueStart + distance - 2} e menor que ${clueStart + distance + 2}.`;
        hint = 'Procure o único número par entre os dois limites.';
        alternatives = [answer - 2, answer + 2, answer + 4];
      } else if (index === 2) {
        answer = (value + 3) ** 2;
        prompt = `Qual número completa a sequência de quadrados: ${value ** 2}, ${(value + 1) ** 2}, ${(value + 2) ** 2}, ...?`;
        hint = 'Observe os quadrados consecutivos e confira a diferença entre eles.';
        alternatives = [answer - 1, answer + 1, answer + 2];
      } else if (index === 3) {
        answer = value * 10 + value + 1;
        prompt = `Tenho ${value} dezenas. Meu algarismo das unidades é um a mais que o das dezenas. Que número sou?`;
        hint = 'Junte o algarismo das dezenas com o das unidades.';
        alternatives = [answer - 1, answer + 1, answer + 10];
      } else if (index === 4) {
        answer = value * 5 + 20;
        prompt = `Complete a sequência: ${value * 5}, ${value * 5 + 5}, ${value * 5 + 10}, ${value * 5 + 15}, ...`;
        hint = 'Cada termo aumenta cinco unidades.';
        alternatives = [answer - 5, answer + 5, answer + 10];
      } else {
        answer = value * 8;
        prompt = `Um número é dobrado três vezes, começando em ${value}. Qual é o resultado final?`;
        hint = 'Dobre o número, depois dobre o resultado mais duas vezes.';
        alternatives = [answer / 2, answer + value, answer * 2];
      }
    } else if (gameId === 'corrida-numerica') {
      if (level === 'Facil') {
        if (index === 0) {
          answer = value * 400;
          prompt = `Uma volta tem 400 m. Quantos metros são ${value} voltas?`;
          hint = `Multiplique 400 pela quantidade de voltas: ${value}.`;
          alternatives = [answer - 400, answer + 400, answer + 800];
        } else if (index === 1) {
          answer = value;
          prompt = `Você está em ${value + 4}º lugar e ultrapassa quatro corredores. Em que lugar fica?`;
          hint = 'Ao ultrapassar alguém, você avança uma posição.';
          alternatives = [answer - 1, answer + 1, answer + 2];
        } else if (index === 2) {
          answer = value + 6;
          prompt = `Complete o marcador de voltas: ${value}, ${value + 2}, ${value + 4}, ...`;
          hint = 'O marcador aumenta sempre pela mesma quantidade.';
          alternatives = [answer - 1, answer + 1, answer + 2];
        } else if (index === 3) {
          answer = value * 100;
          prompt = `Faltam ${value * 100 + 300} m para a chegada. Você correu 300 m. Quantos metros faltam?`;
          hint = 'Retire do total a distância já percorrida.';
          alternatives = [answer - 100, answer + 100, answer + 200];
        } else if (index === 4) {
          answer = value * 3;
          prompt = `A equipe tem ${value} corredores. Cada um completa 3 voltas. Quantas voltas no total?`;
          hint = 'Multiplique os corredores pelas voltas de cada um.';
          alternatives = [answer - 3, answer + 3, answer + 6];
        } else {
          answer = value + 10;
          prompt = `O cronômetro marca ${value} segundos. A próxima volta leva 10 segundos a mais. Qual é o tempo?`;
          hint = 'Some os 10 segundos ao tempo atual.';
          alternatives = [answer - 5, answer + 5, answer + 10];
        }
      } else if (level === 'Medio') {
        if (index === 0) {
          answer = value * 4;
          prompt = `Uma atleta percorre ${value * 12} km em 3 horas. Qual é a média em km/h?`;
          hint = 'Divida a distância total pelo número de horas.';
          alternatives = [answer - 2, answer + 2, answer + 4];
        } else if (index === 1) {
          answer = value * 5;
          prompt = `Complete a sequência dos tempos (em segundos): ${value}, ${value + 5}, ${value + 10}, ...`;
          hint = 'A diferença entre cada tempo é constante.';
          alternatives = [answer - 2, answer + 2, answer + 5];
        } else if (index === 2) {
          prompt = `Uma corredora está na posição ${value + 4}. Ela avança 3 lugares e depois perde 1. Qual posição ocupa?`;
          hint = 'Avançar diminui o número da posição; perder lugar aumenta.';
          answer = value + 2;
          alternatives = [answer - 1, answer + 1, answer + 2];
        } else if (index === 3) {
          answer = value * 750;
          prompt = `Uma volta tem 750 m. Qual é a distância de ${value} voltas?`;
          hint = `Multiplique 750 m por ${value}.`;
          alternatives = [answer - 750, answer + 750, answer + 1500];
        } else if (index === 4) {
          answer = value;
          prompt = `Um atleta corre ${value} km em 60 minutos. Qual é a distância média por hora?`;
          hint = 'Sessenta minutos correspondem a uma hora.';
          alternatives = [answer - 1, answer + 1, answer + 2];
        } else {
          answer = value * 2 + 1;
          prompt = `Complete a sequência de posições: 1, 3, 5, 7, ... Qual é o ${value + 1}º termo?`;
          answer = (value + 1) * 2 - 1;
          alternatives = [answer - 2, answer + 2, answer + 4];
          hint = 'A sequência contém os números ímpares em ordem.';
        }
      } else {
        if (index === 0) {
          answer = value * 600;
          prompt = `Uma pista tem ${value * 100} m. Qual é a distância de 6 voltas?`;
          hint = 'Multiplique a distância de uma volta por 6.';
          alternatives = [answer - 600, answer + 300, answer + 600];
        } else if (index === 1) {
          answer = value * 2 + 3;
          prompt = `Em uma corrida, você está em ${value * 2 + 1}º. Ultrapassa dois atletas e é ultrapassado por um. Qual posição ocupa?`;
          answer = value * 2;
          alternatives = [answer - 1, answer + 1, answer + 2];
          hint = 'Ultrapassar faz avançar; ser ultrapassado faz recuar uma posição.';
        } else if (index === 2) {
          answer = value * 12;
          prompt = `Um atleta percorre ${value * 3} km em 15 minutos. Mantendo o ritmo, quantos km percorre em uma hora?`;
          hint = 'Uma hora tem quatro períodos de 15 minutos.';
          alternatives = [answer - 3, answer + 3, answer + 6];
        } else if (index === 3) {
          answer = value + 24;
          prompt = `Complete a sequência de distâncias: ${value}, ${value + 3}, ${value + 8}, ${value + 15}, ...`;
          hint = 'As diferenças entre os termos aumentam de dois em dois.';
          alternatives = [answer - 2, answer + 2, answer + 4];
        } else if (index === 4) {
          answer = value * 1250;
          prompt = `Uma equipe corre ${value} voltas de 1 km e mais ${value * 250} m. Quantos metros percorre?`;
          hint = 'Converta os quilômetros para metros e some a distância extra.';
          alternatives = [answer - 250, answer + 250, answer + 500];
        } else {
          answer = value * 4;
          prompt = `Quatro corredores percorrem juntos ${value * 16} km, divididos igualmente. Quantos km percorre cada um?`;
          hint = 'Divida a distância total igualmente entre os quatro corredores.';
          alternatives = [answer - 2, answer + 2, answer + 4];
        }
      }
      answer = String(answer);
      alternatives = alternatives.map(String);
    } else if (gameId === 'missao-espacial') {
      if (index === 0) {
        const start = level === 'Facil' ? value * 5 : value * 8;
        const step = level === 'Facil' ? 3 : level === 'Medio' ? 5 : 7;
        answer = start + step * 4;
        prompt = `As coordenadas do radar são ${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, ... Qual é a próxima?`;
        hint = `A coordenada aumenta ${step} unidades a cada leitura.`;
        alternatives = [answer - step, answer + step, answer + step * 2];
      } else if (index === 1) {
        const lowerBound = value * 10;
        answer = lowerBound + (level === 'Dificil' ? 7 : 5);
        prompt = `O código de acesso é maior que ${lowerBound + 2} e menor que ${lowerBound + 8}. É ímpar e termina em 5. Qual é?`;
        hint = 'Use as pistas de intervalo e algarismo final.';
        alternatives = [answer - 2, answer + 2, answer + 4];
      } else if (index === 2) {
        const start = value * 4;
        const change = level === 'Facil' ? 6 : level === 'Medio' ? 9 : 12;
        answer = start + change;
        prompt = `A nave está na coordenada ${start}. Ela avança ${change} unidades e depois recua ${value}. Em que coordenada fica?`;
        answer = start + change - value;
        hint = `Some o avanço e subtraia o recuo: ${start} + ${change} - ${value}.`;
        alternatives = [answer - 2, answer + 2, answer + 4];
      } else if (index === 3) {
        answer = value * 4;
        prompt = `Quatro módulos têm ${value} painéis solares cada. Quantos painéis há ao todo?`;
        hint = `Some ${value} quatro vezes ou multiplique por 4.`;
        alternatives = [answer - 2, answer + 2, answer + 4];
      } else if (index === 4) {
        const start = value * 3;
        answer = start * 2 + 1;
        prompt = `Complete o padrão de sinais captados: ${start}, ${start * 2}, ${start * 2 + 1}, ${start * 4 + 1}, ...`;
        answer = start * 4 + 2;
        hint = 'O padrão alterna dobrar o número e somar uma unidade.';
        alternatives = [answer - 1, answer + 1, answer + 2];
      } else {
        const divisor = level === 'Dificil' ? 3 : 2;
        answer = value * divisor;
        prompt = `A reserva de oxigênio foi dividida igualmente entre ${divisor} astronautas. Cada um recebeu ${value} unidades. Quantas havia?`;
        answer = value * divisor;
        hint = `Multiplique a parte de cada astronauta por ${divisor}.`;
        alternatives = [answer - divisor, answer + divisor, answer + divisor * 2];
      }
    } else {
      if (index === 0) {
        const step = level === 'Facil' ? 2 : level === 'Medio' ? 3 : 4;
        answer = value + step * 4;
        prompt = `Qual peça completa a sequência da torre: ${value}, ${value + step}, ${value + step * 2}, ${value + step * 3}, ...?`;
        hint = `Observe que cada andar acrescenta ${step}.`;
        alternatives = [answer - step, answer + step, answer + step * 2];
      } else if (index === 1) {
        answer = value * 3;
        prompt = `Uma balança fica equilibrada com 3 caixas iguais e 6 kg. Se o outro prato tem ${answer + 6} kg, quanto pesa cada caixa?`;
        hint = 'Retire os 6 kg e divida o restante igualmente entre as caixas.';
        answer = value;
        alternatives = [answer - 2, answer + 2, answer + 4];
      } else if (index === 2) {
        const first = value;
        answer = first * first;
        prompt = `Complete o padrão: ${first}, ${first * 2}, ${first * 3}, ... Qual é o próximo múltiplo de ${first}?`;
        answer = first * 4;
        hint = 'A sequência avança de ${first} em ${first}.'.replace('${first}', String(first));
        alternatives = [answer - first, answer + first, answer + first * 2];
      } else if (index === 3) {
        const middle = value + 4;
        answer = middle;
        prompt = `A soma de três números consecutivos é ${middle * 3}. Qual é o número do meio?`;
        hint = 'O número do meio é a média dos três números consecutivos.';
        alternatives = [answer - 1, answer + 1, answer + 2];
      } else if (index === 4) {
        const players = value + 2;
        answer = players * (players - 1) / 2;
        prompt = `Em um torneio com ${players} jogadores, cada dupla se enfrenta uma vez. Quantas partidas acontecem?`;
        hint = 'Conte todos os pares diferentes de jogadores.';
        alternatives = [answer - 1, answer + players, answer + players * 2];
      } else {
        const base = value + 2;
        answer = base * (base - 1) * (base - 2);
        prompt = `Quantos códigos de 3 algarismos diferentes podem ser feitos com os dígitos de 1 a ${base}?`;
        hint = `Há ${base} opções para o primeiro algarismo; para cada posição seguinte, uma opção a menos.`;
        alternatives = [answer / 2, answer + base * 2, answer + base * 3];
      }
    }

    return {
      q: prompt,
      answer: String(answer),
      options: shuffle([String(answer), ...alternatives.map(String)]),
      hint
    };
  });
}

for (const game of bonusGames) {
  for (const level of ['Facil', 'Medio', 'Dificil']) {
    game.questions[level].push(...createBonusQuestionVariants(game.id, level));
  }
}

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

games.filter(game => extraQuestions[game.id]).forEach(game => {
  for (const level of ['Facil', 'Medio', 'Dificil']) {
    game.questions[level] = [...game.questions[level], ...createQuestionVariants(game.id, level)];
  }
});

let user = null;
let authMode = 'firebase';
let loginMode = 'student';
let loginIntentPending = false;
let authNotice = '';
let teacherStudents = [];
let teacherSourceErrors = [];
let teacherSourceSummary = '';
let selectedStudentId = '';
let activeGameCatalog = 'main';
let authStateInitialized = false;
let authStateGeneration = 0;
let forceLegacyAuth = false;
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
    if (game.questions[level].length < QUESTIONS_PER_ROUND) {
      throw new Error(`${game.title} precisa ter pelo menos ${QUESTIONS_PER_ROUND} questões no nível ${level}.`);
    }
    const selection = shuffle(available.length >= QUESTIONS_PER_ROUND ? available : game.questions[level])
      .slice(0, QUESTIONS_PER_ROUND);
    questionSets[level] = selection;
    nextUsed.push(...selection.map(question => question.q));
  }
  history[game.id] = [...used, ...nextUsed].slice(-80);
  localStorage.setItem(historyKey, JSON.stringify(history));
  return questionSets;
}

function authErrorMessage(error) {
  const messages = {
    'auth/configuration-not-found': 'O Firebase Authentication não está configurado para este projeto. No Console do Firebase, abra mathplay-cf79f > Authentication e clique em Começar. Confira também se a API key em firebase.js pertence a esse projeto e não está bloqueada para a Identity Toolkit API.',
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/invalid-credential': 'E-mail ou senha não conferem.',
    'auth/invalid-email': 'Informe um endereço de e-mail válido.',
    'auth/operation-not-allowed': 'Ative este método de login no console do Firebase.',
    'auth/popup-blocked': 'O navegador bloqueou a janela de login do Google.',
    'auth/popup-closed-by-user': 'A janela de login do Google foi fechada.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/network-request-failed': 'Não foi possível acessar o Firebase. Verifique sua conexão.',
    'permission-denied': 'O Firestore recusou o acesso. Publique no projeto mathplay-cf79f as regras de firestore.rules e tente novamente.',
    unavailable: 'O Firestore está indisponível. Verifique sua conexão e a disponibilidade do serviço.'
  };
  if (error.message?.includes('client is offline')) {
    return 'Não foi possível acessar o Firestore. Verifique se o banco foi criado e se as regras permitem acesso ao usuário.';
  }
  return messages[error.code] || error.message || 'Não foi possível concluir a operação.';
}

function firebaseAuthUnavailable(error) {
  return ['auth/configuration-not-found', 'auth/operation-not-allowed', 'auth/invalid-api-key'].includes(error.code);
}

async function api(action, payload = {}, idToken = '') {
  const headers = { 'Content-Type': 'application/json' };
  if (idToken) headers['X-Firebase-ID-Token'] = idToken;
  const response = await fetch(`api.php?action=${encodeURIComponent(action)}`, {
    method: action === 'me' ? 'GET' : 'POST',
    headers,
    body: action === 'me' ? undefined : JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a operação.');
  return data;
}

function userProfile(firebaseUser) {
  if (!firebaseUser.email) {
    throw new Error('Esta conta Firebase não tem um endereço de e-mail associado.');
  }
  return {
    name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
    email: firebaseUser.email,
    provider: firebaseUser.providerData.some(provider => provider.providerId === 'google.com') ? 'google' : 'password',
    totalScore: 0,
    played: [],
    badges: []
  };
}

async function getOrCreateUserProfile(firebaseUser, nameOverride = '', roleOverride) {
  const profileRef = doc(db, 'users', firebaseUser.uid);
  const profileSnapshot = await getDoc(profileRef);
  if (profileSnapshot.exists()) {
    const profile = profileSnapshot.data();
    if (
      typeof profile.name !== 'string'
      || typeof profile.email !== 'string'
      || !['google', 'password'].includes(profile.provider)
      || !Number.isSafeInteger(profile.totalScore)
      || profile.totalScore < 0
      || !Array.isArray(profile.played)
      || !Array.isArray(profile.badges)
      || (profile.role !== undefined && !['student', 'teacher'].includes(profile.role))
    ) {
      throw new Error('O perfil salvo no Firestore está inválido. Verifique os dados deste usuário.');
    }
    const role = roleOverride || profile.role || 'student';
    const updates = {};
    if (nameOverride && profile.name !== nameOverride) {
      updates.name = nameOverride;
      profile.name = nameOverride;
    }
    if (profile.role !== role) {
      updates.role = role;
      profile.role = role;
    }
    if (Object.keys(updates).length) {
      await setDoc(profileRef, updates, { merge: true });
    }
    return { uid: firebaseUser.uid, ...profile };
  }

  const profile = userProfile(firebaseUser);
  if (nameOverride) profile.name = nameOverride;
  profile.role = roleOverride || 'student';
  await setDoc(profileRef, profile);
  return { uid: firebaseUser.uid, ...profile };
}

async function saveUser() {
  if (authMode === 'legacy') {
    const data = await api('save', user);
    user = data.user;
    return;
  }
  const firebaseUser = auth.currentUser;
  if (!firebaseUser || !user) {
    throw new Error('Sua sessão expirou. Entre novamente para salvar seu progresso.');
  }
  if (!firebaseUser.email) {
    throw new Error('Sua conta Firebase não tem um endereço de e-mail associado.');
  }
  const profile = {
    name: user.name,
    email: firebaseUser.email,
    provider: user.provider,
    role: user.role || 'student',
    totalScore: user.totalScore,
    played: user.played,
    badges: user.badges
  };
  await setDoc(doc(db, 'users', firebaseUser.uid), profile, { merge: true });
  user = { uid: firebaseUser.uid, ...profile };
}
function initials(name) { return name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase(); }
function render() {
  if (!user) {
    renderAuth(false, loginMode, authNotice);
  } else if (user.role === 'teacher') {
    void renderTeacherDashboard();
  } else {
    renderDashboard();
  }
}
function renderLoading(message) {
  app.innerHTML = `<div class="auth-view"><section class="auth-art">${accessibilityTools()}</section><section class="auth-panel"><div class="auth-card" role="status"><h2>Carregando MathPlay</h2><p>${escapeHtml(message)}</p></div></section></div>`;
  bindAccessibilityControls();
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}
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
    const button = document.querySelector('#theme-toggle');
    const dark = currentTheme() === 'dark';
    button.textContent = dark ? '☀ Modo claro' : '☾ Modo escuro';
    button.setAttribute('aria-label', `Ativar modo ${dark ? 'claro' : 'escuro'}`);
    button.title = `Modo ${dark ? 'claro' : 'escuro'}`;
  });
}

function loadAccessibilitySettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(accessibilityKey) || '{}');
    return Object.fromEntries(
      Object.keys(accessibilityDefaults).map(key => [key, saved[key] === true])
    );
  } catch (error) {
    console.warn('Não foi possível carregar as preferências de acessibilidade.', error);
    return { ...accessibilityDefaults };
  }
}

function applyAccessibilitySettings() {
  const root = document.documentElement;
  root.dataset.textSize = accessibilitySettings.largeText ? 'large' : 'normal';
  root.dataset.contrast = accessibilitySettings.highContrast ? 'high' : 'normal';
  root.dataset.readableFont = accessibilitySettings.readableFont ? 'true' : 'false';
  root.dataset.reducedMotion = accessibilitySettings.reducedMotion ? 'true' : 'false';
}

function accessibilityTools() {
  const settings = [
    ['largeText', 'Texto maior'],
    ['highContrast', 'Alto contraste'],
    ['readableFont', 'Fonte de leitura'],
    ['reducedMotion', 'Reduzir animações']
  ];
  return `<div class="accessibility-toolbar" aria-label="Preferências de acessibilidade">
    ${themeToggle()}
    <button class="accessibility-toggle" id="accessibility-toggle" type="button" aria-expanded="false" aria-controls="accessibility-panel">Acessibilidade</button>
    <section class="accessibility-panel" id="accessibility-panel" aria-label="Preferências de acessibilidade" hidden>
      <h2>Preferências de acessibilidade</h2>
      ${settings.map(([key, label]) => `<button type="button" class="accessibility-option" data-a11y-setting="${key}" aria-pressed="${accessibilitySettings[key]}">${label}<span aria-hidden="true">${accessibilitySettings[key] ? 'Ativado' : 'Desativado'}</span></button>`).join('')}
    </section>
  </div>`;
}

function bindAccessibilityControls() {
  bindThemeToggle();
  const toggle = document.querySelector('#accessibility-toggle');
  const panel = document.querySelector('#accessibility-panel');
  toggle?.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    panel.hidden = expanded;
    if (!expanded) panel.querySelector('button')?.focus();
  });
  panel?.querySelectorAll('[data-a11y-setting]').forEach(button => {
    button.addEventListener('click', () => {
      const setting = button.dataset.a11ySetting;
      accessibilitySettings[setting] = !accessibilitySettings[setting];
      try {
        localStorage.setItem(accessibilityKey, JSON.stringify(accessibilitySettings));
      } catch (error) {
        console.warn('Não foi possível salvar as preferências de acessibilidade.', error);
      }
      applyAccessibilitySettings();
      button.setAttribute('aria-pressed', String(accessibilitySettings[setting]));
      button.querySelector('span').textContent = accessibilitySettings[setting] ? 'Ativado' : 'Desativado';
    });
  });
}

function renderAuth(register = false, mode = 'student', notice = '') {
  loginMode = mode;
  authNotice = notice;
  const isTeacher = mode === 'teacher';
  app.innerHTML = `<div class="auth-view">
    <section class="auth-art"><div class="brand"><span class="brand-mark">+</span> mathplay</div>${accessibilityTools()}<div class="art-copy"><div class="eyebrow">Missão: aprender brincando</div><h1>Matemática que ganha vida.</h1><p>Uma trilha de desafios para transformar cada acerto em uma nova descoberta.</p></div></section>
    <section class="auth-panel"><form class="auth-card" id="auth-form" aria-label="${register ? 'Criar conta' : isTeacher ? 'Entrar como professor' : 'Entrar'}"><div class="eyebrow">${isTeacher ? 'Portal do professor' : 'Portal do aluno'}</div><h2>${register ? 'Crie seu perfil' : isTeacher ? 'Relatórios dos alunos' : 'Boas-vindas de volta'}</h2><p>${register ? 'Monte sua jornada e comece a jogar.' : isTeacher ? 'Entre para consultar o progresso e os relatórios dos alunos.' : 'Entre para continuar sua trilha de aprendizagem.'}</p>
      ${register ? '<div class="field"><label for="name">Como podemos te chamar?</label><input id="name" required placeholder="Seu nome"></div>' : ''}
      <div class="field"><label for="email">E-mail</label><input id="email" type="email" required placeholder="você@email.com"></div>
      <div class="field"><label for="password">Senha</label><input id="password" type="password" minlength="4" required placeholder="Mínimo de 4 caracteres"></div>
      <div class="error" id="auth-error" role="alert" aria-live="assertive">${escapeHtml(notice)}</div><button class="primary-btn auth-submit">${register ? 'Criar minha conta' : isTeacher ? 'Entrar como professor' : 'Entrar na MathPlay'} <span aria-hidden="true">→</span></button>
      <div class="auth-divider"><span>ou</span></div><button class="google-btn" type="button" id="google-login"><span class="google-mark">G</span> Continuar com o Google</button><p class="google-note">Entre usando sua conta Gmail.</p>
      ${register ? `<p class="auth-switch">Já tem uma conta? <button class="text-btn" type="button" id="toggle-auth">Fazer login</button></p>` : `<p class="auth-switch">${isTeacher ? 'É aluno?' : 'É professor?'} <button class="text-btn" type="button" id="toggle-login-mode">${isTeacher ? 'Entrar como aluno' : 'Acesso do professor'}</button></p>${!isTeacher ? '<p class="auth-switch">Ainda não tem uma conta? <button class="text-btn" type="button" id="toggle-auth">Criar agora</button></p>' : ''}`}
    </form></section></div>`;
  document.querySelector('#auth-form').addEventListener('submit', handleAuth);
  document.querySelector('#google-login').addEventListener('click', () => startGoogleLogin(mode));
  document.querySelector('#toggle-auth')?.addEventListener('click', () => renderAuth(!register, 'student'));
  document.querySelector('#toggle-login-mode')?.addEventListener('click', () => renderAuth(false, isTeacher ? 'student' : 'teacher'));
  bindAccessibilityControls();
}

async function renderTeacherDashboard() {
  const signedInUser = user;
  app.innerHTML = `<div class="dashboard"><header class="topbar"><div class="brand"><span class="brand-mark">+</span> mathplay</div><div class="topbar-actions"><span class="user-name">${escapeHtml(signedInUser.name)}</span><button class="ghost-btn" id="logout">Sair</button></div>${accessibilityTools()}</header><main><section class="teacher-loading" role="status">Carregando relatórios dos alunos...</section></main></div>`;
  bindAccessibilityControls();
  bindLogout();
  try {
    if (authMode === 'legacy') {
      const response = await api('teacher-reports');
      teacherStudents = response.students;
      teacherSourceErrors = [];
      const accountLabel = teacherStudents.length === 1 ? 'conta' : 'contas';
      teacherSourceSummary = `Fonte MySQL: ${teacherStudents.length} ${accountLabel}. ${teacherStudents.length ? 'Alunos cadastrados somente no Firestore não aparecem neste acesso.' : 'Nenhuma outra conta foi encontrada no MySQL.'} Entre com Firebase para reunir as duas fontes.`;
    } else {
      const [firebaseResult, mysqlResult] = await Promise.allSettled([
        getDocs(collection(db, 'users')),
        auth.currentUser.getIdToken().then(idToken => api('teacher-reports', {}, idToken))
      ]);
      const sourceErrors = [];
      let firebaseStudents = [];
      let mysqlStudents = [];
      if (firebaseResult.status === 'fulfilled') {
        firebaseStudents = firebaseResult.value.docs
          .filter(student => student.id !== auth.currentUser.uid)
          .map(student => ({ ...student.data(), uid: student.id }));
      } else {
        sourceErrors.push(`Firebase: ${authErrorMessage(firebaseResult.reason)}`);
      }
      if (mysqlResult.status === 'fulfilled') {
        mysqlStudents = mysqlResult.value.students;
      } else {
        sourceErrors.push(`MySQL: ${authErrorMessage(mysqlResult.reason)}`);
      }
      if (firebaseResult.status === 'rejected' && mysqlResult.status === 'rejected') {
        throw new Error(sourceErrors.join(' '));
      }
      teacherStudents = mergeTeacherStudents(firebaseStudents, mysqlStudents);
      teacherSourceErrors = sourceErrors;
      teacherSourceSummary = `Perfis encontrados — Firestore: ${firebaseStudents.length}; MySQL: ${mysqlStudents.length}.`;
    }
    if (user !== signedInUser) return;
    if (authMode === 'legacy') {
      teacherStudents = teacherStudents.filter(student => student.email.toLocaleLowerCase('pt-BR') !== signedInUser.email.toLocaleLowerCase('pt-BR'));
    }
    teacherStudents = teacherStudents.map(validateStudentReport);
    teacherStudents.sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
    if (!teacherStudents.some(student => student.uid === selectedStudentId)) {
      selectedStudentId = teacherStudents[0]?.uid || '';
    }
    renderTeacherReports();
  } catch (error) {
    if (user !== signedInUser) return;
    app.querySelector('main').innerHTML = `<section class="teacher-error" role="alert"><h1>Não foi possível carregar os relatórios</h1><p>${escapeHtml(authErrorMessage(error))}</p><button class="primary-btn" id="retry-reports">Tentar novamente</button></section>`;
    document.querySelector('#retry-reports').addEventListener('click', () => renderTeacherDashboard());
  }
}

function mergeTeacherStudents(firebaseStudents, mysqlStudents) {
  const studentsByEmail = new Map();
  for (const student of [...firebaseStudents, ...mysqlStudents]) {
    const emailKey = student.email.trim().toLocaleLowerCase('pt-BR');
    const existing = studentsByEmail.get(emailKey);
    if (!existing) {
      studentsByEmail.set(emailKey, {
        ...student,
        played: [...student.played],
      });
      continue;
    }
    existing.played.push(...student.played);
    existing.totalScore += student.totalScore;
  }
  return [...studentsByEmail.values()];
}

function validateStudentReport(student) {
  if (
    typeof student.uid !== 'string'
    || typeof student.name !== 'string'
    || typeof student.email !== 'string'
    || !Number.isSafeInteger(student.totalScore)
    || student.totalScore < 0
    || !Array.isArray(student.played)
    || student.played.some(match => (
      !match
      || typeof match.id !== 'string'
      || typeof match.title !== 'string'
      || !Number.isSafeInteger(match.score)
      || match.score < 0
      || !Number.isSafeInteger(match.accuracy)
      || match.accuracy < 0
      || match.accuracy > 100
      || typeof match.date !== 'string'
    ))
  ) {
    throw new Error('Os dados do relatório de um aluno estão inválidos. Corrija o perfil e tente novamente.');
  }
  return student;
}

function averageAccuracy(matches) {
  if (!matches.length) return 0;
  return Math.round(matches.reduce((sum, match) => sum + match.accuracy, 0) / matches.length);
}

function teacherReportRows(students) {
  if (!students.length) {
    return '<tr><td colspan="5" class="teacher-empty">Nenhum aluno encontrado.</td></tr>';
  }
  return students.map(student => {
    const played = Array.isArray(student.played) ? student.played : [];
    const average = averageAccuracy(played);
    return `<tr><th scope="row">${escapeHtml(student.name)}</th><td>${escapeHtml(student.email)}</td><td>${played.length}</td><td>${average}%</td><td><button type="button" class="text-btn" data-student-report="${escapeHtml(student.uid)}">Ver relatório</button></td></tr>`;
  }).join('');
}

function selectedStudentReport(student) {
  if (!student) {
    return '<p class="teacher-empty">Selecione um aluno para ver o relatório detalhado.</p>';
  }
  const played = Array.isArray(student.played) ? [...student.played].reverse() : [];
  const groups = new Map();
  for (const match of student.played || []) {
    const game = groups.get(match.id) || { title: match.title, attempts: 0, accuracy: 0, score: 0 };
    game.attempts++;
    game.accuracy += Number(match.accuracy || 0);
    game.score += Number(match.score || 0);
    groups.set(match.id, game);
  }
  const gameRows = [...groups.values()].map(game => `<tr><th scope="row">${escapeHtml(game.title)}</th><td>${game.attempts}</td><td>${Math.round(game.accuracy / game.attempts)}%</td><td>${game.score}</td></tr>`).join('');
  const historyRows = played.map(match => `<tr><td>${escapeHtml(match.title)}</td><td>${escapeHtml(match.date)}</td><td>${match.accuracy}%</td><td>${match.score}</td></tr>`).join('');
  return `<section class="student-report"><div class="student-report-heading"><div><div class="eyebrow">Relatório individual</div><h2 tabindex="-1">${escapeHtml(student.name)}</h2><p>${escapeHtml(student.email)}</p></div><button type="button" class="ghost-btn" id="print-student-report">Imprimir relatório</button></div><div class="teacher-stats student-stats"><article><strong>${Number(student.totalScore || 0)}</strong><span>Pontos acumulados</span></article><article><strong>${played.length}</strong><span>Partidas concluídas</span></article><article><strong>${averageAccuracy(played)}%</strong><span>Média de acertos</span></article></div><h3>Desempenho por jogo</h3><div class="table-scroll"><table class="teacher-table"><thead><tr><th>Jogo</th><th>Partidas</th><th>Média de acertos</th><th>Pontos</th></tr></thead><tbody>${gameRows || '<tr><td colspan="4" class="teacher-empty">Este aluno ainda não concluiu partidas.</td></tr>'}</tbody></table></div><h3>Histórico de partidas</h3><div class="table-scroll"><table class="teacher-table"><thead><tr><th>Jogo</th><th>Data</th><th>Acertos</th><th>Pontos</th></tr></thead><tbody>${historyRows || '<tr><td colspan="4" class="teacher-empty">Nenhuma atividade registrada.</td></tr>'}</tbody></table></div></section>`;
}

function renderTeacherReports() {
  const studentCount = teacherStudents.length;
  const totalAttempts = teacherStudents.reduce((sum, student) => sum + (student.played || []).length, 0);
  const matches = teacherStudents.flatMap(student => student.played || []);
  const average = averageAccuracy(matches);
  const selected = teacherStudents.find(student => student.uid === selectedStudentId);
  const sourceNotice = teacherSourceErrors.length
    ? `<p class="teacher-source-warning" role="status">Alguns dados não puderam ser carregados: ${escapeHtml(teacherSourceErrors.join(' '))}</p>`
    : '';
  const sourceSummary = teacherSourceSummary
    ? `<p class="teacher-source-summary" role="status">${escapeHtml(teacherSourceSummary)}</p>`
    : '';
  app.querySelector('main').innerHTML = `<section class="teacher-hero"><div><div class="eyebrow">Área do professor</div><h1>Progresso dos alunos</h1><p>Acompanhe resultados e atividade das contas cadastradas como aluno.</p></div><div class="teacher-actions"><button type="button" class="ghost-btn" id="refresh-teacher-report">Atualizar dados</button><button type="button" class="ghost-btn" id="export-teacher-report">Exportar CSV</button></div></section>${sourceSummary}${sourceNotice}<section class="teacher-stats" aria-label="Resumo geral"><article><strong>${studentCount}</strong><span>Alunos</span></article><article><strong>${totalAttempts}</strong><span>Partidas concluídas</span></article><article><strong>${average}%</strong><span>Média geral de acertos</span></article></section><section class="teacher-section"><div class="teacher-section-heading"><div><h2>Alunos cadastrados</h2><p>Dados de progresso atualizados a partir das partidas concluídas.</p></div><label class="teacher-search">Buscar aluno<input id="student-search" type="search" placeholder="Nome ou e-mail" autocomplete="off"></label></div><div class="table-scroll"><table class="teacher-table" aria-label="Progresso dos alunos"><thead><tr><th>Aluno</th><th>E-mail</th><th>Partidas</th><th>Média</th><th>Relatório</th></tr></thead><tbody id="teacher-student-rows" aria-live="polite">${teacherReportRows(teacherStudents)}</tbody></table></div></section><div id="student-report">${selectedStudentReport(selected)}</div>`;
  const search = document.querySelector('#student-search');
  search.addEventListener('input', () => {
    const term = search.value.trim().toLocaleLowerCase('pt-BR');
    const filtered = teacherStudents.filter(student => `${student.name} ${student.email}`.toLocaleLowerCase('pt-BR').includes(term));
    document.querySelector('#teacher-student-rows').innerHTML = teacherReportRows(filtered);
    bindStudentReportButtons();
  });
  bindStudentReportButtons();
  document.querySelector('#refresh-teacher-report').addEventListener('click', () => renderTeacherDashboard());
  document.querySelector('#export-teacher-report').addEventListener('click', exportTeacherReport);
  document.querySelector('#print-student-report')?.addEventListener('click', () => window.print());
}

function bindStudentReportButtons() {
  document.querySelectorAll('[data-student-report]').forEach(button => {
    button.addEventListener('click', () => {
      selectedStudentId = button.dataset.studentReport;
      const student = teacherStudents.find(item => item.uid === selectedStudentId);
      document.querySelector('#student-report').innerHTML = selectedStudentReport(student);
      document.querySelector('#print-student-report')?.addEventListener('click', () => window.print());
      document.querySelector('#student-report h2')?.focus();
    });
  });
}

function exportTeacherReport() {
  const csvCell = value => `"${String(value).replaceAll('"', '""')}"`;
  const rows = [
    ['Aluno', 'E-mail', 'Pontos acumulados', 'Partidas', 'Média de acertos'],
    ...teacherStudents.map(student => {
      const played = student.played || [];
      const average = averageAccuracy(played);
      return [student.name, student.email, student.totalScore || 0, played.length, `${average}%`];
    })
  ];
  const csv = `\uFEFF${rows.map(row => row.map(csvCell).join(';')).join('\r\n')}`;
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'relatorio-mathplay-alunos.csv';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function bindLogout() {
  document.querySelector('#logout')?.addEventListener('click', async () => {
    try {
      if (authMode === 'legacy') {
        await api('logout');
        user = null;
        teacherStudents = [];
        selectedStudentId = '';
        loginMode = 'student';
        render();
      } else {
        await signOut(auth);
      }
      teacherStudents = [];
      teacherSourceErrors = [];
      teacherSourceSummary = '';
      selectedStudentId = '';
    } catch (error) {
      alert(authErrorMessage(error));
    }
  });
}

async function finishLogin(profile, mode) {
  authNotice = '';
  loginIntentPending = false;
  loginMode = mode;
  user = { ...profile, role: mode };
  render();
}

async function startGoogleLogin(mode = loginMode) {
  loginMode = mode;
  loginIntentPending = true;
  const error = document.querySelector('#auth-error');
  error.textContent = '';
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await signInWithPopup(auth, provider);
    authMode = 'firebase';
    const profile = await getOrCreateUserProfile(credential.user, '', mode);
    await finishLogin(profile, mode);
  } catch (requestError) {
    loginIntentPending = false;
    if (firebaseAuthUnavailable(requestError) && window.mathplayGoogleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else if (firebaseAuthUnavailable(requestError)) {
      error.textContent = 'O Firebase Authentication não está configurado. Para usar o acesso alternativo com Google, configure MATHPLAY_GOOGLE_CLIENT_ID no servidor.';
    } else {
      error.textContent = authErrorMessage(requestError);
    }
  }
}

async function handleGoogleCredential(response) {
  const error = document.querySelector('#auth-error');
  error.textContent = '';
  try {
    const data = await api('google-login', { credential: response.credential, mode: loginMode });
    authMode = 'legacy';
    await finishLogin(data.user, loginMode);
  } catch (requestError) {
    loginIntentPending = false;
    error.textContent = requestError.message;
  }
}

window.handleGoogleCredential = handleGoogleCredential;

async function handleAuth(event) {
  event.preventDefault();
  const mode = loginMode;
  loginIntentPending = true;
  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;
  const nameField = document.querySelector('#name');
  let name = '';
  const error = document.querySelector('#auth-error');
  error.textContent = '';
  if (forceLegacyAuth) {
    try {
      const data = await api(nameField ? 'register' : 'login', {
        name: nameField?.value.trim(), email, password, mode
      });
      authMode = 'legacy';
      await finishLogin(data.user, mode);
    } catch (requestError) {
      loginIntentPending = false;
      error.textContent = requestError.message;
    }
    return;
  }
  try {
    if (nameField) {
      name = nameField.value.trim();
      if (!name) {
        loginIntentPending = false;
        error.textContent = 'Informe seu nome.';
        return;
      }
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      authMode = 'firebase';
      const profile = await getOrCreateUserProfile(credential.user, name, mode);
      await finishLogin(profile, mode);
    } else {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      authMode = 'firebase';
      const profile = await getOrCreateUserProfile(credential.user, '', mode);
      await finishLogin(profile, mode);
    }
  } catch (requestError) {
    const canUseLegacyLogin = !nameField
      && ['auth/invalid-credential', 'auth/user-not-found'].includes(requestError.code);
    const canUseLegacyRegistration = nameField && requestError.code === 'auth/weak-password';
    if (!firebaseAuthUnavailable(requestError) && !canUseLegacyLogin && !canUseLegacyRegistration) {
      loginIntentPending = false;
      error.textContent = authErrorMessage(requestError);
      return;
    }
    try {
      const data = await api(nameField ? 'register' : 'login', {
        name: name || undefined, email, password, mode
      });
      authMode = 'legacy';
      await finishLogin(data.user, mode);
    } catch (legacyError) {
      loginIntentPending = false;
      error.textContent = legacyError.message;
    }
  }
}

function renderDashboard() {
  const total = user.totalScore || 0;
  const played = user.played || [];
  const safeName = escapeHtml(user.name);
  const earnedMedals = medals.filter(medal => (user.badges || []).includes(medal.id));
  const journeyDays = activeDays(played);
  const accuracy = played.length ? Math.round(played.reduce((sum, item) => sum + item.accuracy, 0) / played.length) : 0;
  app.innerHTML = `<div class="dashboard"><header class="topbar"><div class="brand"><span class="brand-mark">+</span> mathplay</div><div class="topbar-actions"><span class="user-name">${safeName}</span><span class="avatar" aria-label="Iniciais de ${safeName}">${escapeHtml(initials(user.name))}</span><button class="ghost-btn" id="logout">Sair</button></div>${accessibilityTools()}</header><main>
    <section class="hero"><div><div class="eyebrow">Sua central de descobertas</div><h1>Olá, ${escapeHtml(user.name.split(' ')[0])}.</h1><p>Escolha um desafio e avance um passo na sua trilha.</p></div><div class="streak"><strong>${journeyDays} ${journeyDays === 1 ? 'dia' : 'dias'}</strong><span>de jornada ativa</span></div></section>
    <section class="stats"><div class="stat"><b>${total}</b><small>pontos acumulados</small></div><div class="stat"><b>${played.length}</b><small>desafios concluídos</small></div><div class="stat"><b>${accuracy}%</b><small>taxa de acerto</small></div></section>
    <div class="game-catalog-tabs" role="tablist" aria-label="Categorias de jogos">
      <button type="button" id="main-games-tab" class="game-catalog-tab${activeGameCatalog === 'main' ? ' is-active' : ''}" role="tab" aria-selected="${activeGameCatalog === 'main'}" aria-controls="main-games-panel"${activeGameCatalog === 'main' ? '' : ' tabindex="-1"'}>Trilha principal <span>4 jogos</span></button>
      <button type="button" id="bonus-games-tab" class="game-catalog-tab${activeGameCatalog === 'bonus' ? ' is-active' : ''}" role="tab" aria-selected="${activeGameCatalog === 'bonus'}" aria-controls="bonus-games-panel"${activeGameCatalog === 'bonus' ? '' : ' tabindex="-1"'}>Novos jogos <span>4 jogos</span></button>
    </div>
    <section class="game-catalog-panel" id="main-games-panel" role="tabpanel" aria-labelledby="main-games-tab"${activeGameCatalog === 'main' ? '' : ' hidden'}>
      <div class="section-head"><h2>Trilha de aprendizagem</h2><span>4 mundos para explorar</span></div>
      <section class="games">${games.slice(0, 4).map(game => gameCard(game, played)).join('')}</section>
    </section>
    <section class="game-catalog-panel" id="bonus-games-panel" role="tabpanel" aria-labelledby="bonus-games-tab"${activeGameCatalog === 'bonus' ? '' : ' hidden'}>
      <div class="section-head"><div><h2>Novos jogos e desafios</h2><span>Outras aventuras para treinar números e raciocínio.</span></div><span>4 jogos</span></div>
      <section class="games">${bonusGames.map(game => gameCard(game, played, true)).join('')}</section>
    </section>
    <section class="activity"><div class="panel"><div class="section-head"><h3>Medalhas conquistadas</h3><span>${earnedMedals.length}/${medals.length}</span></div><div class="badges">${earnedMedals.length ? earnedMedals.map(medal => badge(medal.label, medal.symbol, true)).join('') : '<p class="empty-medals">Conclua um desafio para conquistar sua primeira medalha.</p>'}</div></div><div class="panel"><div class="section-head"><h3>Atividade recente</h3><span>${played.length ? 'últimos jogos' : 'ainda vazio'}</span></div>${played.length ? played.slice(-3).reverse().map(item => `<div class="history-row"><span>${escapeHtml(item.title)}<br><small>${escapeHtml(item.date)}</small></span><span class="score">+${escapeHtml(item.score)} pts</span></div>`).join('') : '<p style="color:var(--muted);font-size:13px">Seu histórico aparece aqui depois da primeira partida.</p>'}</div></section>
    <section class="medals-section"><div class="section-head"><div><h2>Todas as medalhas</h2><span>Veja como desbloquear cada conquista.</span></div><span>${earnedMedals.length} conquistadas</span></div><div class="all-medals">${medals.map(medal => medalCard(medal, (user.badges || []).includes(medal.id))).join('')}</div></section>
  </main></div>`;
  bindLogout();
  document.querySelectorAll('[data-game]').forEach(button => button.addEventListener('click', () => openGame(button.dataset.game)));
  bindGameCatalogTabs();
  bindAccessibilityControls();
}

function bindGameCatalogTabs() {
  const tabs = [...document.querySelectorAll('[role="tab"][aria-controls]')];
  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      activeGameCatalog = tab.id === 'bonus-games-tab' ? 'bonus' : 'main';
      for (const currentTab of tabs) {
        const selected = currentTab === tab;
        currentTab.classList.toggle('is-active', selected);
        currentTab.setAttribute('aria-selected', String(selected));
        currentTab.tabIndex = selected ? 0 : -1;
        document.getElementById(currentTab.getAttribute('aria-controls')).hidden = !selected;
      }
    });
  }
  tabs.forEach((tab, index) => tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home' ? 0
      : event.key === 'End' ? tabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  }));
}

function badge(label, symbol, unlocked) { return `<div class="badge ${unlocked ? '' : 'locked'}"><span>${symbol}</span>${label}</div>`; }
function medalCard(medal, unlocked) { return `<article class="medal-card ${unlocked ? 'is-earned' : 'is-locked'}"><div class="medal-card-icon">${medal.symbol}</div><div><h3>${medal.label}</h3><p>${medal.requirement}</p><strong>${unlocked ? 'Conquistada' : 'Ainda não desbloqueada'}</strong></div></article>`; }
function gameCard(game, played, isBonus = false) {
  const result = played.filter(item => item.id === game.id).at(-1);
  const progress = result ? Math.min(100, result.accuracy + 20) : 0;
  const action = game.boss ? 'Enfrentar chefão' : 'Jogar agora';
  const ariaLabel = game.boss ? `${action}: ${game.boss.name}` : `Jogar ${game.title}`;
  return `<article class="game-card${isBonus ? ` game-card-bonus game-card-${game.color}` : ''}"><div><div class="game-icon" aria-hidden="true">${game.icon}</div><h3>${game.title}</h3><p>${game.description}</p></div><div><div class="progress-wrap" role="img" aria-label="Progresso: ${progress}%"><div class="progress-line"><i style="width:${progress}%"></i></div></div><button class="game-link" data-game="${game.id}" aria-label="${escapeHtml(ariaLabel)}">${action} <span aria-hidden="true">↗</span></button></div></article>`;
}

let gameTrigger = null;
function openGame(id) {
  currentGame = games.find(game => game.id === id);
  gameTrigger = document.activeElement;
  gameState = {
    index: 0,
    score: 0,
    hintsUsed: 0,
    answered: false,
    hint: false,
    level: 'Facil',
    results: [],
    questionSets: prepareQuestionSets(currentGame),
    bossHealth: currentGame.boss?.health || 0,
    playerHealth: 100
  };
  renderGameModal();
}

function bossArena() {
  if (!currentGame.boss) return '';
  const bossPercent = Math.round((gameState.bossHealth / currentGame.boss.health) * 100);
  const playerPercent = gameState.playerHealth;
  return `<section class="boss-arena" id="boss-arena" aria-label="Batalha contra ${escapeHtml(currentGame.boss.name)}">
    <div class="boss-health">
      <div class="boss-health-label"><strong>Chefão: ${escapeHtml(currentGame.boss.name)}</strong><span id="boss-health-value">${gameState.bossHealth} / ${currentGame.boss.health} HP</span></div>
      <div class="boss-health-track" role="progressbar" aria-label="Vida do chefão" aria-valuemin="0" aria-valuemax="${currentGame.boss.health}" aria-valuenow="${gameState.bossHealth}"><span id="boss-health-fill" style="width:${bossPercent}%"></span></div>
    </div>
    <div class="boss-health">
      <div class="boss-health-label"><strong>Sua nave</strong><span id="player-health-value">${gameState.playerHealth} / 100 HP</span></div>
      <div class="boss-health-track player-health-track" role="progressbar" aria-label="Vida da sua nave" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${gameState.playerHealth}"><span id="player-health-fill" style="width:${playerPercent}%"></span></div>
    </div>
    <p class="boss-instructions">Acerte para causar ${BOSS_DAMAGE_PER_CORRECT} de dano. Se errar, o chefão causa ${PLAYER_DAMAGE_PER_WRONG} de dano à sua nave.</p>
  </section>`;
}

function updateBossArena() {
  if (!currentGame.boss) return;
  const bossFill = document.querySelector('#boss-health-fill');
  const bossBar = bossFill?.parentElement;
  const playerFill = document.querySelector('#player-health-fill');
  const playerBar = playerFill?.parentElement;
  const bossValue = document.querySelector('#boss-health-value');
  const playerValue = document.querySelector('#player-health-value');
  if (!bossFill || !bossBar || !playerFill || !playerBar || !bossValue || !playerValue) return;
  bossFill.style.width = `${Math.round((gameState.bossHealth / currentGame.boss.health) * 100)}%`;
  bossBar.setAttribute('aria-valuenow', String(gameState.bossHealth));
  bossValue.textContent = `${gameState.bossHealth} / ${currentGame.boss.health} HP`;
  playerFill.style.width = `${gameState.playerHealth}%`;
  playerBar.setAttribute('aria-valuenow', String(gameState.playerHealth));
  playerValue.textContent = `${gameState.playerHealth} / 100 HP`;
}

function renderGameModal(focusSelector = '[data-answer]') {
  const questions = currentQuestions();
  const question = questions[gameState.index];
  const levelLabels = { Facil: 'Fácil', Medio: 'Médio', Dificil: 'Difícil' };
  document.querySelector('#game-modal')?.remove();
  app.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" id="game-modal"><section class="game-modal" role="dialog" aria-modal="true" aria-labelledby="game-modal-title" tabindex="-1">
    <div class="modal-top"><div><div class="eyebrow">Questão ${gameState.index + 1} de ${questions.length}</div><h2 id="game-modal-title" tabindex="-1">${escapeHtml(currentGame.title)}</h2></div><button class="close-btn" id="close-game" aria-label="Fechar desafio">×</button></div>
    <p class="intro">${currentGame.boss ? 'Derrote o chefão respondendo aos desafios.' : 'Resolva as questões para concluir o desafio.'}</p>
    ${bossArena()}
    <div class="level-tabs" aria-label="Nível de dificuldade">${['Facil', 'Medio', 'Dificil'].map(level => `<button type="button" class="${gameState.level === level ? 'active' : ''}" aria-pressed="${gameState.level === level}" data-level="${level}">${levelLabels[level]}</button>`).join('')}</div>
    <div class="question-box"><p class="question" id="current-question">${escapeHtml(question.q)}</p><p class="question-motivation" role="status" aria-live="polite">Escolha uma resposta para conferir seu raciocínio.</p><div class="answer-grid">${question.options.map(option => `<button type="button" class="answer-btn" data-answer="${escapeHtml(option)}" aria-describedby="current-question">${escapeHtml(option)}</button>`).join('')}</div></div>
    <div class="hint" id="hint" role="note">${gameState.hint ? `Dica: ${escapeHtml(question.hint)} Desconto aplicado: ${HINT_COST} pontos.` : `<strong>Atenção: cada dica desconta ${HINT_COST} pontos da partida.</strong> O desconto vale mesmo se errar a resposta.`}</div>
    <div class="modal-footer"><span class="game-meta" aria-live="polite">${pointsAfterHints()} pontos nesta partida</span><button type="button" class="ghost-btn" id="hint-btn" aria-describedby="hint" ${gameState.hint ? 'disabled' : ''}>${gameState.hint ? `Dica usada (-${HINT_COST} pts)` : `Pedir dica (-${HINT_COST} pts)`}</button></div>
  </section></div>`);
  document.querySelector('#close-game').addEventListener('click', () => closeGame(true));
  document.querySelector('#hint-btn').addEventListener('click', () => {
    if (gameState.hint) return;
    gameState.hint = true;
    gameState.hintsUsed++;
    renderGameModal('#hint-btn');
  });
  document.querySelectorAll('[data-level]').forEach(button => button.addEventListener('click', () => {
    gameState.level = button.dataset.level;
    gameState.index = 0;
    gameState.score = 0;
    gameState.hintsUsed = 0;
    gameState.answered = false;
    gameState.hint = false;
    gameState.results = [];
    gameState.bossHealth = currentGame.boss?.health || 0;
    gameState.playerHealth = 100;
    renderGameModal();
  }));
  document.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => answer(button, question)));
  document.querySelector(focusSelector)?.focus();
}

function answer(button, question) {
  if (gameState.answered) return;
  gameState.answered = true;
  const questions = currentQuestions();
  const correct = button.dataset.answer === question.answer;
  const basePoints = gameState.level === 'Dificil' ? 150 : gameState.level === 'Medio' ? 125 : 100;
  const previousScore = pointsAfterHints();
  gameState.results.push({ question: question.q, answer: button.dataset.answer, correctAnswer: question.answer, correct });
  button.classList.add(correct ? 'correct' : 'wrong');
  document.querySelectorAll('[data-answer]').forEach(option => {
    option.disabled = true;
    if (option.dataset.answer === question.answer) option.classList.add('correct');
  });
  if (correct) {
    gameState.score += basePoints;
    if (currentGame.boss) gameState.bossHealth = Math.max(0, gameState.bossHealth - BOSS_DAMAGE_PER_CORRECT);
  } else if (currentGame.boss) {
    gameState.playerHealth = Math.max(0, gameState.playerHealth - PLAYER_DAMAGE_PER_WRONG);
  }
  updateBossArena();
  const pointsEarned = pointsAfterHints() - previousScore;
  const motivationElement = document.querySelector('.question-motivation');
  motivationElement.textContent = motivation(correct);
  motivationElement.classList.add(correct ? 'is-correct' : 'is-wrong');
  let feedback = correct
    ? `Muito bem! +${pointsEarned} pontos líquidos.`
    : 'Quase! A resposta correta está destacada.';
  if (currentGame.boss) {
    feedback = correct
      ? `${currentGame.boss.name} recebeu ${BOSS_DAMAGE_PER_CORRECT} de dano! +${pointsEarned} pontos.`
      : `Você errou e recebeu ${PLAYER_DAMAGE_PER_WRONG} de dano. ${gameState.playerHealth} HP restantes.`;
  }
  const footer = document.querySelector('.modal-footer');
  footer.innerHTML = `<span class="game-meta" role="status" aria-live="polite">${feedback}</span><button class="primary-btn" id="next-question">${gameState.index === questions.length - 1 ? 'Ver resultado' : 'Continuar'} →</button>`;
  document.querySelector('#next-question').addEventListener('click', () => {
    if (gameState.index === questions.length - 1) {
      finishGame();
    } else {
      gameState.index++;
      gameState.answered = false;
      gameState.hint = false;
      renderGameModal();
    }
  });
}
async function finishGame() { const correctCount = gameState.results.filter(result => result.correct).length; const accuracy = Math.round((correctCount / gameState.results.length) * 100); const finalScore = pointsAfterHints(); const previousUser = user; user = { ...user, totalScore: (user.totalScore || 0) + finalScore, played: [...(user.played || []), { id: currentGame.id, title: currentGame.title, score: finalScore, accuracy, date: new Date().toLocaleDateString('pt-BR') }] }; user.badges = [...new Set([...user.badges || [], ...unlockedMedals(user)])]; try { await saveUser(); renderResults(correctCount, accuracy, finalScore); } catch (requestError) { user = previousUser; alert(authErrorMessage(requestError)); } }
function renderResults(correctCount, accuracy, finalScore) { const rows = gameState.results.map((result, index) => `<div class="result-row"><span class="result-status ${result.correct ? 'is-correct' : 'is-wrong'}" aria-label="${result.correct ? 'Correta' : 'Incorreta'}">${result.correct ? '✓' : '×'}</span><div><strong>${index + 1}. ${escapeHtml(result.question)}</strong><small>Sua resposta: ${escapeHtml(result.answer)}${result.correct ? '' : ` · Correta: ${escapeHtml(result.correctAnswer)}`}</small></div></div>`).join(''); const resultMessage = accuracy === 100 ? 'Excelente! Você resolveu tudo com muita atenção.' : accuracy >= 60 ? 'Muito bom! Continue praticando para ficar ainda melhor.' : 'Cada tentativa ensina algo novo. Continue praticando e use uma dica quando precisar.'; const bossResult = currentGame.boss ? `<p class="boss-result" role="status">${gameState.bossHealth === 0 ? `Vitória! Você derrotou o ${escapeHtml(currentGame.boss.name)}.` : gameState.playerHealth === 0 ? `Sua nave ficou sem energia. O ${escapeHtml(currentGame.boss.name)} venceu esta rodada.` : `A batalha terminou: ${gameState.bossHealth} HP restantes para o chefão e ${gameState.playerHealth} HP para sua nave.`}</p>` : ''; document.querySelector('#game-modal')?.remove(); app.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" id="game-modal"><section class="game-modal results-modal" role="dialog" aria-modal="true" aria-labelledby="result-title" tabindex="-1"><div class="modal-top"><div><div class="eyebrow">Resultado da partida</div><h2 id="result-title" tabindex="-1">${escapeHtml(currentGame.title)}</h2></div><button class="close-btn" id="close-game" aria-label="Fechar resultado">×</button></div><div class="result-summary" role="status" aria-live="polite"><strong>${correctCount}/${gameState.results.length}</strong><span>${accuracy}% de acerto · ${finalScore} pontos após dicas</span></div>${bossResult}<p class="motivation-message">${resultMessage}</p><div class="results-list" aria-label="Respostas da partida">${rows}</div><button class="primary-btn result-done" id="result-done">Voltar para a trilha</button></section></div>`); document.querySelector('#result-title').focus(); document.querySelector('#close-game').addEventListener('click', () => { closeGame(); renderDashboard(); }); document.querySelector('#result-done').addEventListener('click', () => { closeGame(); renderDashboard(); document.querySelector(`[data-game="${currentGame.id}"]`)?.focus(); }); }
function closeGame(restoreFocus = false) { document.querySelector('#game-modal')?.remove(); if (restoreFocus && gameTrigger?.isConnected) gameTrigger.focus(); }
document.addEventListener('keydown', event => {
  const dialog = document.querySelector('#game-modal [role="dialog"]');
  if (event.key === 'Escape' && dialog) {
    closeGame(true);
    return;
  }
  if (event.key === 'Tab' && dialog) {
    const focusable = [...dialog.querySelectorAll('button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex="-1"])')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!dialog.contains(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
applyTheme(localStorage.getItem(themeKey) || 'light');
applyAccessibilitySettings();
renderLoading('Verificando sua sessão e conectando ao perfil.');
onAuthStateChanged(auth, async firebaseUser => {
  const generation = ++authStateGeneration;
  if (!firebaseUser) {
    if (forceLegacyAuth || (authMode === 'legacy' && user)) {
      render();
      return;
    }
    if (authStateInitialized) {
      user = null;
      render();
      return;
    }
    authStateInitialized = true;
    try {
      const data = await api('me');
      if (generation !== authStateGeneration) return;
      if (data.user) {
        authMode = 'legacy';
        user = data.user;
      }
    } catch (error) {
      if (generation !== authStateGeneration) return;
      console.warn('Sessão alternativa indisponível; o login Firebase continua disponível.', error);
    }
    if (generation !== authStateGeneration) return;
    render();
    return;
  }
  authStateInitialized = true;
  authMode = 'firebase';
  if (!loginIntentPending) renderLoading('Carregando seu perfil do Firebase.');
  let timeoutId;
  try {
    const profile = await Promise.race([
      getOrCreateUserProfile(firebaseUser, '', loginIntentPending ? loginMode : undefined),
      new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => reject(new Error('O Firestore não respondeu. Verifique a conexão, se o banco foi criado e se as regras estão publicadas.')), 8000);
      })
    ]);
    if (generation !== authStateGeneration) return;
    user = profile;
    render();
  } catch (error) {
    if (generation !== authStateGeneration) return;
    console.error('Não foi possível carregar o perfil do Firebase.', error);
    app.innerHTML = `<div class="auth-view firebase-recovery">${accessibilityTools()}<section class="auth-panel"><div class="auth-card"><h2>Não foi possível carregar seu perfil</h2><p id="firebase-error"></p><button class="primary-btn" id="reload-app">Tentar novamente</button><button class="text-btn" id="firebase-logout">Sair</button></div></section></div>`;
    bindAccessibilityControls();
    document.querySelector('#firebase-error').textContent = authErrorMessage(error);
    document.querySelector('#reload-app').addEventListener('click', () => location.reload());
    document.querySelector('#firebase-logout').textContent = 'Sair da conta Firebase';
    app.querySelector('.auth-card').insertAdjacentHTML('beforeend', '<button class="text-btn" id="legacy-login">Tentar acesso pelo banco local</button>');
    document.querySelector('#firebase-logout').addEventListener('click', async () => {
      try {
        await signOut(auth);
      } catch (signOutError) {
        console.error('Não foi possível encerrar a sessão do Firebase.', signOutError);
        document.querySelector('#firebase-error').textContent = authErrorMessage(signOutError);
      }
    });
    document.querySelector('#legacy-login').addEventListener('click', async () => {
      forceLegacyAuth = true;
      authMode = 'legacy';
      user = null;
      try {
        await signOut(auth);
        renderAuth();
      } catch (signOutError) {
        forceLegacyAuth = false;
        authMode = 'firebase';
        document.querySelector('#firebase-error').textContent = authErrorMessage(signOutError);
      }
    });
  } finally {
    clearTimeout(timeoutId);
  }
});
