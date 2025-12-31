// ================== DOM ==================
// Обкладинка
const isObkladinka = $('#obkladinkavibor');
const obkladinkaMaterial = $('#obklmat');
const obkladinkaPokr = $('#obklpokr');
const obkladinkaDruk = $('#obkldruk');

// Підкладка
const isPidkladka = $('#pidklvibor');
const pidkladkaMaterial = $('#pidklmat');
const pidkladkaPokr = $('#pidklpokr');
const pidkladkaDruk = $('#pidkldruk');

// Внутрішній блок
const vnutrVibor = $('#vnutrarkush');
const vnutrMat = $('#vnutrmat');
const vnutrDruk = $('#vnutrDruk');

// Розмір / кількість
const resolChoose = $('#resolChoose');
const complects = $('#complects');

// Пластикова обкладинка/підкладка (впливає на палітурку)
const plastikChoose = $('#plastikchoose');

// Кнопка + результат
const calculateButton = $('#calculateButton');
const $resultBox = $('#resultBox');
const $resultError = $('#resultError');
const $resultPerItem = $('#resultPerItem');
const $resultTotal = $('#resultTotal');
const $resultBreakdown = $('#resultBreakdown');
const $resultSummary = $('#resultSummary');
const $resultTotalRow = $('#resultTotalRow');

// Preview ("Вид готового виробу")
const $previewImg = $('#previewImg');
const $dimX = $('#dimX');
const $dimY = $('#dimY');
const $plasticBadge = $('#plasticBadge');
const $orientVert = $('#orient-vert');
const $orientHor = $('#orient-hor');
const $springSide = $('#springSide');


// ================== DATA ==================
let PRICES = {};
let PRICES_READY = false;

// ================== PREVIEW HELPERS ==================
function getSelectedResolutionMeta() {
  const $opt = $('#resolChoose option:selected');
  const w = Number($opt.data('w')) || 0;
  const h = Number($opt.data('h')) || 0;
  return { value: resolChoose.val(), w, h };
}

function getOrientation() {
  return $orientVert.is(':checked') ? 'vertical' : 'horizontal';
}

function getDisplayDims(meta) {
  // If horizontal – rotate: width<->height
  const orientation = getOrientation();
  if (orientation === 'horizontal') {
    return { w: meta.h, h: meta.w };
  }
  return { w: meta.w, h: meta.h };
}

function isSquare(meta) {
  return meta.w > 0 && meta.w === meta.h;
}

function resolvePreviewImage() {
  const meta = getSelectedResolutionMeta();
  const square = isSquare(meta);
  const side = $springSide.val(); // longside | shortside
  const orientation = getOrientation();

  // Squares: only "side" visually matters
  if (square) {
    return (side === 'shortside')
      ? 'img/preview_square_top.png'
      : 'img/preview_square_left.png';
  }

  // A6–A3 rectangles
  if (orientation === 'horizontal') {
    // In landscape the long side is top/bottom.
    return (side === 'longside')
      ? 'img/preview_rect_h_long.png'
      : 'img/preview_rect_h_short.png';
  }
  // vertical
  return (side === 'longside')
    ? 'img/preview_rect_v_long.png'
    : 'img/preview_rect_v_short.png';
}

function updatePreview() {
  // If preview block is missing (older HTML), don't crash
  if (!$previewImg.length) return;

  const meta = getSelectedResolutionMeta();
  const dims = getDisplayDims(meta);

  if ($dimY.length) $dimY.text(`${dims.h} мм`);
  if ($dimX.length) $dimX.text(`${dims.w} мм`);

  $previewImg.attr('src', resolvePreviewImage());

  // Plastic – simple visual badge (no price influence here)
  if ($plasticBadge.length) {
    const hasPlastic = (plastikChoose.val() !== 'no');
    if (hasPlastic) {
      $plasticBadge.text(selectedText(plastikChoose) || 'Пластик');
      $plasticBadge.show();
    } else {
      $plasticBadge.hide();
    }
  }
}

if (window.PRICES_DATA) {
  PRICES = window.PRICES_DATA || {};
  PRICES_READY = true;
  calculateButton.prop('disabled', false);
} else {
  calculateButton.prop('disabled', true);
  fetch('prices.json')
    .then(res => res.json())
    .then(data => {
      PRICES = data || {};
      PRICES_READY = true;
      calculateButton.prop('disabled', false);
    })
    .catch(() => {
      PRICES = {};
      PRICES_READY = false;
      showError('Не вдалося завантажити prices.json (запусти через локальний сервер або додай prices.js)');
    });
}

// ================== UI INIT ==================
automateVnutr();
updatePreview();

// ================== EVENTS ==================
calculateButton.on('click', calculate);

// Live preview
$orientVert.on('change', updatePreview);
$orientHor.on('change', updatePreview);
$springSide.on('change', updatePreview);
plastikChoose.on('change', updatePreview);

resolChoose.on('change', function () {
  // Для A3/297x297 софт-лам недоступна (в ТЗ софт только для меньших форматов)
  const isA3 = (resolChoose.val() === 'A3' || resolChoose.val() === '297x297');
  const pokrOptions = isA3
    ? '<option value="no">Без покриття</option>\n<option value="gl">ГЛ 1+1 100 мікрон</option>\n<option value="mat">МАТ 1+1 100 мікрон</option>'
    : '<option value="no">Без покриття</option>\n<option value="gl">ГЛ 1+1 100 мікрон</option>\n<option value="mat">МАТ 1+1 100 мікрон</option>\n<option value="soft">SOFT лам 75 мікрон</option>';

  obkladinkaPokr.html(pokrOptions);
  pidkladkaPokr.html(pokrOptions);

  updatePreview();
});

isObkladinka.on('change', function () {
  const disabled = (isObkladinka.val() === 'no');
  obkladinkaMaterial.prop('disabled', disabled);
  obkladinkaPokr.prop('disabled', disabled);
  obkladinkaDruk.prop('disabled', disabled);
});

isPidkladka.on('change', function () {
  const disabled = (isPidkladka.val() === 'no');
  pidkladkaMaterial.prop('disabled', disabled);
  pidkladkaPokr.prop('disabled', disabled);
  pidkladkaDruk.prop('disabled', disabled);
});

vnutrMat.on('change', function () {
  if (vnutrMat.val() === 'ofset80') {
    automateVnutr(240);
    vnutrDruk.html('<option value="4+0">4+0 (R9100)</option>' +
      '<option value="4+4">4+4 (R9100)</option>' +
      '<option value="1+0">1+0</option>' +
      '<option value="1+1">1+1</option>' +
      '<option value="no" selected>Без друку</option>');
  } else if (vnutrMat.val() === 'ofset160') {
    automateVnutr(120);
    vnutrDruk.html('<option value="4+0">4+0 (R9100)</option>' +
      '<option value="4+4">4+4 (R9100)</option>' +
      '<option value="no" selected>Без друку</option>');
  } else if (vnutrMat.val() === 'kreid130') {
    automateVnutr(180);
    vnutrDruk.html('<option value="4+0">4+0 (R9100)</option>' +
      '<option value="4+4">4+4 (R9100)</option>' +
      '<option value="no" selected>Без друку</option>');
  }
});

$('.tip').hover(function () {
  const text = $(this).data('text');
  const $tooltip = $('<div class="tooltip-js"></div>').text(text).appendTo('#tip1');

  const offset = $(this).offset();
  $tooltip.css({
    top: offset.top + $tooltip.outerHeight() + 8,
    left: offset.left - $(this).outerWidth() / 2 - $tooltip.outerWidth() / 2,
  });
}, function () {
  $('.tooltip-js').remove();
});

// ================== HELPERS ==================

function selectedText($el) {
  try {
    return $el.find('option:selected').text().trim();
  } catch (e) {
    return '';
  }
}

function escapeHtml(str) {
  // Экранит спецсимволы, чтобы выбранные значения безопасно выводились в HTML (и не ломали верстку).
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function toInt(v, def = 0) {
  const n = parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? n : def;
}

function toNum(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function showError(msg) {
  $resultError.text(msg).show();
  $resultBox.hide();
}

function clearError() {
  $resultError.hide().text('');
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function getSelectedSize() {
  const selected = $('#resolChoose option:selected');
  return {
    value: resolChoose.val(),
    width: toNum(selected.data('w')),
    height: toNum(selected.data('h')),
  };
}


function isA4FamilySize(sizeValue) {
  // За ТЗ: до A4 відносяться також 200x200 та 297x297 (для них порізка НЕ застосовується)
  return sizeValue === 'A4' || sizeValue === '200x200' || sizeValue === '297x297';
}

function getPiecesPerA4(sizeValue, width, height) {
  if (sizeValue === 'A6' || sizeValue === '100x100') return 4;
  if (sizeValue === 'A5' || sizeValue === '148x148') return 2;
  if (isA4FamilySize(sizeValue)) return 1;
  return getPorizka(width, height, 210, 297, 1);
}


function normalizeResolution(val) {
  // Приводимо до ключів a6/a5/a4/a3
  switch (val) {
    case '100x100':
    case 'A6':
      return 'a6';
    case '148x148':
    case 'A5':
      return 'a5';
    case '200x200':
    case 'A4':
      return 'a4';
    case '297x297':
    case 'A3':
      return 'a3';
    default:
      return 'a5';
  }
}

function mapCoverMaterialKey(v) {
  // HTML використовує kr130/kr200/kr300, а в prices.json ключі kreid130/kreid200/kreid300
  if (v === 'kr130') return 'kreid130';
  if (v === 'kr200') return 'kreid200';
  if (v === 'kr300') return 'kreid300';
  return v;
}

function pickRangePrice(ranges, qty) {
  if (!Array.isArray(ranges)) return 0;
  const q = toInt(qty, 0);
  const range = ranges.find(r => q >= r.from && (r.to === null || q <= r.to));
  return range ? toNum(range.price, 0) : 0;
}

// ================== UI генерація сторінок/аркушів ==================
function automateVnutr(maxPages = 240) {
  // maxPages — це максимум СТОРІНОК. В селекті value зберігаємо кількість АРКУШІВ.
  vnutrVibor.empty();
  for (let pages = 2; pages <= maxPages; pages += 2) {
    const sheets = pages / 2;
    let _str;
    if (sheets === 1) _str = 'аркуш';
    else if (sheets > 1 && sheets < 5) _str = 'аркуші';
    else _str = 'аркушів';

    vnutrVibor.append(`<option value="${sheets}">${pages} стор (${sheets} ${_str})</option>`);
  }
}

// ================== MAIN CALC ==================
function calculate() {
  clearError();
  if (!PRICES_READY) {
    showError('Ціни ще не завантажились. Спробуй ще раз через секунду.');
    return;
  }

  const qty = Math.max(1, toInt(complects.val(), 1));

  const inner = toNum(punkt82(), 0);
  const coverBacking = toNum(calcCoverAndBacking(qty), 0);
  const binding = toNum(punkt5(qty), 0);

  const total = round2(inner + coverBacking + binding);
  const perItem = round2(total / qty);

  // ===== Параметри замовлення (ТЗ) =====
  $resultSummary.empty();

  const sizeText = selectedText(resolChoose);
  const orientationText = $('#orient-vert').is(':checked') ? 'Вертикально' : 'Горизонтально';
  const springSideText = selectedText($('#springSide'));
  const plastikText = selectedText(plastikChoose);

  const coverModeText = selectedText(isObkladinka);
  const coverHasPrint = isObkladinka.val() && isObkladinka.val() !== 'no';
  const coverText = coverHasPrint
    ? `${coverModeText}; ${selectedText(obkladinkaMaterial)}; ${selectedText(obkladinkaPokr)}; Друк: ${selectedText(obkladinkaDruk)}`
    : coverModeText;

  const backingModeText = selectedText(isPidkladka);
  const backingHasPrint = isPidkladka.val() && isPidkladka.val() !== 'no';
  const backingText = backingHasPrint
    ? `${backingModeText}; ${selectedText(pidkladkaMaterial)}; ${selectedText(pidkladkaPokr)}; Друк: ${selectedText(pidkladkaDruk)}`
    : backingModeText;

  const innerText = `${selectedText(vnutrVibor)}; ${selectedText(vnutrMat)}; Друк: ${selectedText(vnutrDruk)}`;

  $resultSummary.append(`<li><strong>Розмір блокноту:</strong> ${escapeHtml(sizeText)}</li>`);
  $resultSummary.append(`<li><strong>Орієнтація:</strong> ${escapeHtml(orientationText)}</li>`);
  if (springSideText) {
    $resultSummary.append(`<li><strong>Зшивання пружиною:</strong> ${escapeHtml(springSideText)}</li>`);
  }
  $resultSummary.append(`<li><strong>Пластикова обкладинка:</strong> ${escapeHtml(plastikText)}</li>`);
  $resultSummary.append(`<li><strong>Друкована обкладинка:</strong> ${escapeHtml(coverText)}</li>`);
  $resultSummary.append(`<li><strong>Друкована підкладка:</strong> ${escapeHtml(backingText)}</li>`);
  $resultSummary.append(`<li><strong>Внутрішній блок:</strong> ${escapeHtml(innerText)}</li>`);
  $resultSummary.append(`<li><strong>Кількість:</strong> ${qty} шт</li>`);

  // ===== Вартість =====
  $resultPerItem.text(perItem.toFixed(2));
  $resultTotal.text(total.toFixed(2));
  if ($resultTotalRow && $resultTotalRow.length) {
    if (qty > 1) $resultTotalRow.show();
    else $resultTotalRow.hide();
  }

  // ===== Розшифровка =====
  $resultBreakdown.empty();
  $resultBreakdown.append(`<li>Внутрішній блок: <strong>${round2(inner).toFixed(2)}</strong> грн</li>`);
  $resultBreakdown.append(`<li>Обкладинка/Підкладка: <strong>${round2(coverBacking).toFixed(2)}</strong> грн</li>`);
  $resultBreakdown.append(`<li>Палітурка (п.5): <strong>${round2(binding).toFixed(2)}</strong> грн</li>`);

  $resultBox.show();
}

// ================== ВНУТРІШНІЙ БЛОК (п.8) ==================
function punkt82() {
  const { width, height } = getSelectedSize();

  const sheetsPerNotebook = toInt(vnutrVibor.val(), 0); // аркуші
  const qty = Math.max(1, toInt(complects.val(), 1));
  const totalSheets = sheetsPerNotebook * qty;

  const sizeValue = resolChoose.val();
  const piecesPerA4 = getPiecesPerA4(sizeValue, width, height);
  const a4SheetsToPrint = Math.ceil(totalSheets / piecesPerA4);
  const applyCutting = !isA4FamilySize(sizeValue);

  const a3SheetsToPrintAsPieces = totalSheets; // як у твоїй логіці

  // Друк на офсеті 80 (може бути 1+0/1+1)
  if ((vnutrDruk.val() === '1+0' || vnutrDruk.val() === '1+1') && vnutrMat.val() === 'ofset80') {
    if (resolChoose.val() !== 'A3' && resolChoose.val() !== '297x297') {
      return getProportionalPrice(getOffsetPrice('A4', vnutrDruk.val(), a4SheetsToPrint), a4SheetsToPrint, applyCutting);
    }
    return getOffsetPrice('A3', vnutrDruk.val(), totalSheets) * totalSheets;
  }

  // Друк 4+0/4+4 на офсеті 80
  if ((vnutrDruk.val() === '4+0' || vnutrDruk.val() === '4+4') && vnutrMat.val() === 'ofset80') {
    if (resolChoose.val() !== 'A3' && resolChoose.val() !== '297x297') {
      return getProportionalPrice(getOffsetPrice('A4', vnutrDruk.val(), a4SheetsToPrint), a4SheetsToPrint, applyCutting);
    }
    return getOffsetPrice('A3', vnutrDruk.val(), totalSheets) * totalSheets;
  }

  // Інші матеріали з друком
  if (vnutrDruk.val() === '4+0' || vnutrDruk.val() === '4+4') {
    const perA3 = getPorizka(width, height, 297, 420, 1);
    const a3Sheets = a3SheetsToPrintAsPieces / perA3;
    return getNoProportionalPrice(getAnotherPrice(vnutrMat.val(), vnutrDruk.val(), totalSheets), width, height, a3Sheets);
  }

  // Без друку
  if (vnutrDruk.val() === 'no') {
    return getNoProportionalPrice(getNoDrukPrice(vnutrMat.val(), totalSheets), width, height, a3SheetsToPrintAsPieces);
  }

  return 0;
}

// ================== ОБКЛАДИНКА + ПІДКЛАДКА (п.6, п.7) ==================
function calcCoverAndBacking(baseQty) {
  const coverEnabled = (isObkladinka.val() !== 'no');
  const backingEnabled = (isPidkladka.val() !== 'no');

  if (!coverEnabled && !backingEnabled) return 0;

  const coverCfg = {
    enabled: coverEnabled,
    material: mapCoverMaterialKey(obkladinkaMaterial.val()),
    pokr: obkladinkaPokr.val(),
    druk: obkladinkaDruk.val(),
  };

  const backingCfg = {
    enabled: backingEnabled,
    material: mapCoverMaterialKey(pidkladkaMaterial.val()),
    pokr: pidkladkaPokr.val(),
    druk: pidkladkaDruk.val(),
  };

  // Якщо обкладинка і підкладка однакові по матеріалу/ламінації/друку — сумуємо кількість (вимога ТЗ)
  const canMerge = coverCfg.enabled && backingCfg.enabled &&
    coverCfg.material === backingCfg.material &&
    coverCfg.pokr === backingCfg.pokr &&
    coverCfg.druk === backingCfg.druk;

  if (canMerge) {
    return calcOneCoverOrBacking(coverCfg, baseQty * 2);
  }

  let sum = 0;
  if (coverCfg.enabled) sum += calcOneCoverOrBacking(coverCfg, baseQty);
  if (backingCfg.enabled) sum += calcOneCoverOrBacking(backingCfg, baseQty);
  return sum;
}

function calcOneCoverOrBacking(cfg, qtyPieces) {
  const { width, height, value } = getSelectedSize();

  const qty = Math.max(1, toInt(qtyPieces, 1));

  // 1) Друк (прайс на аркуш 297*420, але діапазон обираємо за кількістю виробів)
  let printCost = 0;
  if (cfg.druk === '4+0' || cfg.druk === '4+4') {
    const perSheet = getPorizka(width, height, 297, 420, 1); // скільки виробів вміщається на A3
    const a3Sheets = Math.ceil(qty / perSheet);
    const sheetPrice = getPidklObklPrice(cfg.material, cfg.druk, qty);
    printCost = getNoProportionalVOPrice(sheetPrice, width, height, a3Sheets);
  }

  // 2) Ламінація
  const lamCost = getLaminationPrice(cfg.pokr, qty, normalizeResolution(value));

  return toNum(printCost, 0) + toNum(lamCost, 0);
}

function getLaminationPrice(pokr, qty, resKey) {
  if (!pokr || pokr === 'no') return 0;

  // Софт для A3 не підтримуємо
  if (pokr === 'soft' && resKey === 'a3') return 0;

  let tableKey = null;
  let factor = 1;

  if (pokr === 'gl') {
    if (resKey === 'a6') tableKey = 'a6glian';
    else if (resKey === 'a5') tableKey = 'a5glian';
    else if (resKey === 'a4') tableKey = 'a4glian';
    else if (resKey === 'a3') tableKey = 'a3glian';
  } else if (pokr === 'mat') {
    if (resKey === 'a3') tableKey = 'a3mat';
    else tableKey = 'a4mat';
    if (resKey === 'a5') factor = 0.5;
    if (resKey === 'a6') factor = 0.25;
  } else if (pokr === 'soft') {
    tableKey = 'a4soft';
    if (resKey === 'a5') factor = 0.5;
    if (resKey === 'a6') factor = 0.25;
  }

  if (!tableKey || !PRICES?.lamination?.[tableKey]) return 0;

  const unit = pickRangePrice(PRICES.lamination[tableKey], qty);
  return unit * qty * factor;
}

// ================== ПАЛІТУРКА (п.5) ==================
function punkt5(qty) {
  const resKey = normalizeResolution(resolChoose.val());

  // Межі беремо по КІЛЬКОСТІ СТОРІНОК, а не аркушів
  const pages = toInt(vnutrVibor.val(), 0) * 2;
  let mezhi = 'do150';
  if (pages <= 50) mezhi = 'do50';
  else if (pages <= 100) mezhi = 'do100';

  const format = (plastikChoose.val() === 'no') ? 'no' : 'yes';
  return checkPunkt5(format, resKey, mezhi, qty);
}

function checkPunkt5(format = 'no', resolution, mezhi, qty) {
  const ranges = PRICES?.plastikova?.[format]?.[resolution]?.[mezhi];
  const unit = pickRangePrice(ranges, qty);
  return unit * qty;
}

// ================== НИЖЧЕ — твої базові функції (майже без змін) ==================
function getProportionalPrice(unitPrice, a4Arkush, applyCutting = true) {
  // unitPrice — ціна за 1 аркуш A4 (з таблиці)
  // a4Arkush — скільки аркушів A4 піде на друк
  // applyCutting — чи додаємо порізку (для A4-family та A3-family не додаємо)
  const base = toNum(unitPrice, 0) * toInt(a4Arkush, 0);
  if (!applyCutting) return base;
  return base + getPorizkaVnutrPrice(a4Arkush);
}


function getNoProportionalPrice(price, width, height, a3Arkush) {
  if (width === 210 && height === 297) return (price * a3Arkush * 2);
  return (price * a3Arkush) + getPorizka(width, height, 297, 420, 2, a3Arkush);
}

function getNoProportionalVOPrice(price, width, height, a3Arkush) {
  if (width === 210 && height === 297) return (price * a3Arkush * 2);
  return (price * a3Arkush) + getPorizka(width, height, 297, 420, 3, a3Arkush);
}

function getPorizka(width, height, widthOriginal = 210, heightOriginal = 297, returns = 0, qty = 0) {
  let perRow1 = Math.floor(widthOriginal / width);
  let perCol1 = Math.floor(heightOriginal / height);
  let perRow2 = Math.floor(heightOriginal / width);
  let perCol2 = Math.floor(widthOriginal / height);

  const perSheet1 = perRow1 * perCol1;
  const perSheet2 = perRow2 * perCol2;

  const q1 = Math.min(perCol1, perRow1);
  const q2 = Math.min(perCol2, perRow2);

  let perSheet;
  if (q2 > q1) {
    perSheet = perSheet2;
  } else if (q1 > q2) {
    perSheet = perSheet1;
  } else {
    perSheet = Math.max(perSheet1, perSheet2);
  }

  if (returns === 0) return getPorizkaVnutrPrice(qty);
  if (returns === 2) return getPorizkaVnutrPrice(qty * perSheet);
  if (returns === 3) return getPorizkaObklPidklPrice(qty * perSheet);
  return perSheet;
}

function getOffsetPrice(format, printType, qty) {
  const ranges = PRICES?.punkt82?.[format]?.[printType];
  return pickRangePrice(ranges, qty);
}

function getAnotherPrice(format, printType, qty) {
  const ranges = PRICES?.punkt82?.[format];
  const rangesZvorot = PRICES?.punkt82?.drukNaZvoroti;

  const base = pickRangePrice(ranges, qty);
  const zvorot = pickRangePrice(rangesZvorot, qty);

  if (printType !== '4+4') return base;
  return base + zvorot;
}

function getPidklObklPrice(format, printType, qty) {
  const ranges = PRICES?.pidklobkl?.[format];
  if (!ranges) return 0;

  let rangesZvorot;
  if (format === 'kreid130' || format === 'kreid200' || format === 'kreid300' || format === 'ofset160' || format === 'ofset300') {
    rangesZvorot = PRICES?.pidklobkl?.drukNaZvoroti;
  } else {
    rangesZvorot = PRICES?.pidklobkl?.drukNaZvorotiDesigner;
  }

  const base = pickRangePrice(ranges, qty);
  const zvorot = pickRangePrice(rangesZvorot, qty);

  if (printType !== '4+4') return base;
  return base + zvorot;
}

function getNoDrukPrice(mat, qty) {
  const ranges = PRICES?.punkt82?.A4?.no?.[mat];
  return pickRangePrice(ranges, qty);
}

function getPorizkaVnutrPrice(qty) {
  const ranges = PRICES?.porizkaVnutr;
  const unit = pickRangePrice(ranges, qty);
  return unit * toInt(qty, 0);
}

function getPorizkaObklPidklPrice(qty) {
  const ranges = PRICES?.pidklobkl?.porizka;
  const unit = pickRangePrice(ranges, qty);
  return unit * toInt(qty, 0);
}
