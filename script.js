'use strict';

const arrayInput = document.querySelector('#array-input');
const board = document.querySelector('#viz-board');
const description = document.querySelector('#step-description');
const counter = document.querySelector('#step-counter');
const progressBar = document.querySelector('#progress-bar');
const traceList = document.querySelector('#trace-list');
const traceCount = document.querySelector('#trace-count');
const errorMessage = document.querySelector('#input-error');
const playButton = document.querySelector('#play-button');
const previousButton = document.querySelector('#previous-button');
const nextButton = document.querySelector('#next-button');
const resetButton = document.querySelector('#reset-button');
const speedInput = document.querySelector('#speed-input');
const speedLabel = document.querySelector('#speed-label');

const speedNames = ['Bem devagar', 'Devagar', 'Normal', 'Rápido', 'Muito rápido'];
let originalArray = [];
let events = [];
let currentStep = 0;
let timerId = null;

function quickSortWithTrace(values) {
  const array = [...values];
  const trace = [{
    array: [...array],
    type: 'start',
    description: 'Vetor inicial. Vamos particionar usando o último elemento como pivô.',
    active: [],
    pivot: null,
    sorted: [],
  }];
  const settled = new Set();

  function record(type, message, active = [], pivot = null) {
    trace.push({
      array: [...array],
      type,
      description: message,
      active,
      pivot,
      sorted: [...settled],
    });
  }

  function partition(start, end) {
    const pivot = array[end];
    let boundary = start;
    record('pivot', `Trecho [${start}..${end}]: escolhemos ${pivot} como pivô.`, [], end);

    for (let scan = start; scan < end; scan++) {
      record(
        'compare',
        `Comparamos ${array[scan]} com o pivô ${pivot}.`,
        [scan],
        end,
      );
      if (array[scan] <= pivot) {
        [array[boundary], array[scan]] = [array[scan], array[boundary]];
        record(
          'swap',
          `${array[boundary]} ≤ ${pivot}: colocamos esse valor na região da esquerda.`,
          [boundary, scan],
          end,
        );
        boundary++;
      }
    }

    [array[boundary], array[end]] = [array[end], array[boundary]];
    settled.add(boundary);
    record(
      'place',
      `O pivô ${pivot} fica na posição ${boundary}; sua posição está definida.`,
      [boundary],
      boundary,
    );
    return boundary;
  }

  function sort(start, end) {
    if (start >= end) {
      if (start === end) settled.add(start);
      return;
    }
    const pivotPosition = partition(start, end);
    sort(start, pivotPosition - 1);
    sort(pivotPosition + 1, end);
  }

  sort(0, array.length - 1);
  for (let index = 0; index < array.length; index++) settled.add(index);
  trace.push({
    array: [...array],
    type: 'done',
    description: 'Ordenação concluída: todos os elementos estão em ordem.',
    active: [],
    pivot: null,
    sorted: [...settled],
  });
  return trace;
}

function parseInput() {
  const raw = arrayInput.value.trim();
  const parts = raw.split(/[\s,;]+/).filter(Boolean);
  if (parts.length < 2 || parts.length > 20) {
    throw new Error('Informe entre 2 e 20 números inteiros.');
  }

  const values = parts.map((part) => {
    if (!/^-?\d+$/.test(part)) {
      throw new Error(`"${part}" não é um número inteiro válido.`);
    }
    const value = Number(part);
    if (!Number.isSafeInteger(value) || value < -999 || value > 999) {
      throw new Error('Use números inteiros entre −999 e 999.');
    }
    return value;
  });
  return values;
}

function renderStep() {
  const event = events[currentStep];
  if (!event) return;

  board.replaceChildren();
  const min = Math.min(0, ...originalArray);
  const max = Math.max(0, ...originalArray);

  event.array.forEach((value, index) => {
    const item = document.createElement('div');
    item.className = 'bar-item';
    const label = document.createElement('span');
    label.className = 'bar-value';
    label.textContent = String(value);

    const bar = document.createElement('div');
    bar.className = 'bar';
    const height = min < 0
      ? 10 + ((value - min) / Math.max(1, max - min)) * 150
      : 10 + (value / Math.max(1, max)) * 150;
    bar.style.height = `${height}px`;
    if (event.pivot === index) {
      bar.classList.add('pivot');
    } else if (event.sorted.includes(index)) {
      bar.classList.add('sorted');
    } else if (event.active.includes(index)) {
      bar.classList.add('active');
    }

    const position = document.createElement('span');
    position.className = 'bar-index';
    position.textContent = String(index);
    item.append(label, bar, position);
    board.append(item);
  });
  board.style.alignItems = 'end';
  board.style.paddingTop = '24px';

  counter.textContent = `Passo ${currentStep} de ${events.length - 1}`;
  description.textContent = event.description;
  progressBar.style.width = `${events.length > 1 ? (currentStep / (events.length - 1)) * 100 : 0}%`;
  traceList.replaceChildren();
  const firstVisible = Math.max(0, currentStep - 5);
  events.slice(firstVisible, currentStep + 1).forEach((item, index) => {
    const line = document.createElement('li');
    line.textContent = item.description;
    if (firstVisible + index === currentStep) line.classList.add('current');
    traceList.append(line);
  });
  traceCount.textContent = `${events.length - 1} eventos`;
  traceList.scrollTop = traceList.scrollHeight;
  previousButton.disabled = currentStep === 0;
  nextButton.disabled = currentStep === events.length - 1;
  playButton.textContent = currentStep === events.length - 1 ? '✓ Concluído' : '▶ Iniciar';
  playButton.disabled = currentStep === events.length - 1;
}

function stopPlayback() {
  if (timerId !== null) {
    window.clearInterval(timerId);
    timerId = null;
  }
  playButton.textContent = currentStep === events.length - 1 ? '✓ Concluído' : '▶ Iniciar';
}

function moveToStep(step) {
  stopPlayback();
  currentStep = Math.max(0, Math.min(step, events.length - 1));
  renderStep();
}

function loadArray() {
  stopPlayback();
  try {
    originalArray = parseInput();
    events = quickSortWithTrace(originalArray);
    currentStep = 0;
    errorMessage.textContent = '';
    arrayInput.setAttribute('aria-invalid', 'false');
    renderStep();
  } catch (error) {
    errorMessage.textContent = error.message;
    arrayInput.setAttribute('aria-invalid', 'true');
  }
}

function togglePlayback() {
  if (timerId !== null) {
    stopPlayback();
    return;
  }
  if (currentStep >= events.length - 1) return;
  const delays = [1400, 1000, 700, 420, 220];
  playButton.textContent = 'Ⅱ Pausar';
  timerId = window.setInterval(() => {
    if (currentStep >= events.length - 1) {
      stopPlayback();
      renderStep();
      return;
    }
    currentStep++;
    renderStep();
    if (currentStep === events.length - 1) stopPlayback();
  }, delays[Number(speedInput.value) - 1]);
}

playButton.addEventListener('click', () => {
  if (timerId !== null) {
    stopPlayback();
  } else if (currentStep === events.length - 1) {
    moveToStep(0);
    togglePlayback();
  } else {
    togglePlayback();
  }
});
previousButton.addEventListener('click', () => moveToStep(currentStep - 1));
nextButton.addEventListener('click', () => moveToStep(currentStep + 1));
resetButton.addEventListener('click', loadArray);
arrayInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') loadArray();
});
speedInput.addEventListener('input', () => {
  speedLabel.textContent = speedNames[Number(speedInput.value) - 1];
  if (timerId !== null) {
    stopPlayback();
    togglePlayback();
  }
});

loadArray();
