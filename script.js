// ============ ОБКЛАДИНКА ==============
const isObkladinka = $('#obkladinkavibor');
const obkladinkaMaterial = $('#obklmat');
const obkladinkaPokr = $('#obklpokr');
const obkladinkaDruk = $('#obkldruk');
// ============ ПІДКЛАДКА ==============
const isPidkladka = $('#pidklvibor');
const pidkladkaMaterial = $('#pidklmat');
const pidkladkaPokr = $('#pidklpokr');
const pidkladkaDruk = $('#pidkldruk');
// ============ ВНУТРІШНІЙ БЛОК ==========
const vnutrVibor = $('#vnutrarkush');
const vnutrMat = $('#vnutrmat');
const vnutrDruk = $('#vnutrDruk');
// ============ РОЗМІР ===================
const resolChoose = $('#resolChoose');
const complects = $('#complects');
// ============ ІНШІ ЕЛЕМЕНТИ UI =========
const calculateButton = $('#calculateButton');
// ============ ІНШІ ЗМІННІ ===============
let PRICES = {};

fetch('prices.json')
    .then(res => res.json())
    .then(data => {
        PRICES = data;
    });


automateVnutr();

calculateButton.click(calculate);

isObkladinka.on('change', function () {
    if (isObkladinka.val() === "no") {
        obkladinkaMaterial.attr('disabled', 'disabled');
        obkladinkaPokr.attr('disabled', 'disabled');
        obkladinkaDruk.attr('disabled', 'disabled');
    } else {
        obkladinkaMaterial.removeAttr('disabled');
        obkladinkaPokr.removeAttr('disabled');
        obkladinkaDruk.removeAttr('disabled');
    }
});

isPidkladka.on('change', function () {
    if (isPidkladka.val() === "no") {
        //pidkladkaMaterial.attr('disabled', 'disabled');
        pidkladkaPokr.attr('disabled', 'disabled');
        pidkladkaDruk.attr('disabled', 'disabled');
    } else {
        //obkladinkaMaterial.removeAttr('disabled');
        pidkladkaPokr.removeAttr('disabled');
        pidkladkaDruk.removeAttr('disabled');
    }
});

vnutrMat.on('change', function () {
    if (vnutrMat.val() === "ofset80") {
        automateVnutr();
        vnutrDruk.html('<option value="4+0">4+0 (R9100)</option>' +
            '                    <option value="4+4">4+4 (R9100)</option>' +
            '                    <option value="1+0">1+0</option>' +
            '                    <option value="1+1">1+1</option>' +
            '                    <option value="no" selected>Без друку</option>')
    }
    else if (vnutrMat.val() === "ofset160") {
        automateVnutr(120);
        vnutrDruk.html('<option value="4+0">4+0 (R9100)</option>' +
            '                    <option value="4+4">4+4 (R9100)</option>' +
            '                    <option value="no" selected>Без друку</option>')
    }
    else if (vnutrMat.val() === "kreid130") {
        automateVnutr(180);
        vnutrDruk.html('<option value="4+0">4+0 (R9100)</option>' +
            '                    <option value="4+4">4+4 (R9100)</option>' +
            '                    <option value="no" selected>Без друку</option>')
    }
})

$('.tip').hover(function (e) {
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

// ======================== ФУНКЦІЇ ====================
function automateVnutr(maxCount=240) {
    vnutrVibor.empty();
    for (let i = 2; i < maxCount + 2; i += 2) {
        let _str;
        const arkush = i / 2;
        if (arkush === 1) _str = "аркуш";
        else if (arkush > 1 && arkush < 5) _str = "аркуші";
        else _str = "аркушів";
        vnutrVibor.append(`<option value="${i/2}">${i} стор (${i/2} ${_str})</option>`);
    }
}

function calculate() {
    const pricePunkt8 = punkt82();
    let price = pricePunkt8;
    console.log(price);
}

function punkt82() {
    const selected = $('#resolChoose option:selected');
    const width = Number(selected.data('w'));
    const height = Number(selected.data('h'));
    const a4Arkush = Math.ceil((parseInt(vnutrVibor.val()) * complects.val()) / getPorizka(width, height, 210, 297, 1));
    const a3Arkush = (parseInt(vnutrVibor.val()) * complects.val());
    if ((vnutrDruk.val() === "1+0" || vnutrDruk.val() === "1+1") && vnutrMat.val() === "ofset80") {
        if (resolChoose.val() !== "A3" && resolChoose.val() !== "297x297") return getProportionalPrice(getOffsetPrice("A4", vnutrDruk.val(), a4Arkush), width, height, a4Arkush);
        else if (resolChoose.val() === "A3" || resolChoose.val() === "297x297") return getOffsetPrice("A3", vnutrDruk.val(), parseInt(vnutrVibor.val()) * complects.val()) * parseInt(vnutrVibor.val()) * complects.val();
    }
    else if ((vnutrDruk.val() === "4+0" || vnutrDruk.val() === "4+4") && vnutrMat.val() === "ofset80") {
        if (resolChoose.val() !== "A3" && resolChoose.val() !== "297x297") return getProportionalPrice(getOffsetPrice("A4", vnutrDruk.val(), a4Arkush), width, height, a4Arkush);
        else if (resolChoose.val() === "A3" || resolChoose.val() === "297x297") return getOffsetPrice("A3", vnutrDruk.val(), parseInt(vnutrVibor.val()) * complects.val()) * parseInt(vnutrVibor.val()) * complects.val();
    }
    else if (vnutrDruk.val() === "4+0" || vnutrDruk.val() === "4+4") {
        return getNoProportionalPrice(getAnotherPrice(vnutrMat.val(), vnutrDruk.val(), parseInt(vnutrVibor.val()) * complects.val()), width, height, a3Arkush / getPorizka(width, height, 297, 420, 1));
    }
    else if (vnutrDruk.val() === "no") {
        return getNoProportionalPrice(getNoDrukPrice(vnutrMat.val(), parseInt(vnutrVibor.val()) * complects.val()), width, height, a3Arkush);
    }
}

function getProportionalPrice(price, width, height, a4Arkush) {
    if (width === 100 && height === 100) return (price * a4Arkush) + getPorizka(width, height, 210, 297, 0, a4Arkush);
    else if (width === 105 && height === 148) return (price * a4Arkush) + getPorizka(width, height, 210, 297, 0, a4Arkush);
    else if (width === 148 && height === 148) return (price * a4Arkush) + getPorizka(width, height, 210, 297, 0, a4Arkush);
    else if (width === 148 && height === 210) return (price * a4Arkush) + getPorizka(width, height, 210, 297, 0, a4Arkush);
    else if (width === 200 && height === 200) return (price * a4Arkush) + getPorizka(width, height, 210, 297, 0, a4Arkush);
    else return price * a4Arkush;
}

function getNoProportionalPrice(price, width, height, a3Arkush) {
    if (width === 100 && height === 100) return (price * a3Arkush) + getPorizka(width, height, 297, 420, 2, a3Arkush);
    else if (width === 105 && height === 148) return (price * a3Arkush) + getPorizka(width, height, 297, 420, 2, a3Arkush);
    else if (width === 148 && height === 148) return (price * a3Arkush) + getPorizka(width, height, 297, 420, 2, a3Arkush);
    else if (width === 148 && height === 210) return (price * a3Arkush) + getPorizka(width, height, 297, 420, 2, a3Arkush);
    else if (width === 200 && height === 200) return (price * a3Arkush) + getPorizka(width, height, 297, 420, 2, a3Arkush);
    else if (width === 297 && height === 297) return (price * a3Arkush) + getPorizka(width, height, 297, 420, 2, a3Arkush);
    else if (width === 210 && height === 297) return (price * a3Arkush * 2);
    else return price * a3Arkush;
}

function getPorizka(width, height, widthOriginal=210, heightOriginal=297, returns=0, a4Arkush=0) {
    let perRow1 = Math.floor(widthOriginal / width);
    let perCol1 = Math.floor(heightOriginal / height);
    let perRow2 = Math.floor(heightOriginal / width);
    let perCol2 = Math.floor(widthOriginal / height);

    const perSheet1 = perRow1 * perCol1;
    const perSheet2 = perRow2 * perCol2;

    const q1 = Math.min(perCol1, perRow1);
    const q2 = Math.min(perCol2, perRow2);

    let perSheet;
    if(q2 > q1) {
        perSheet = perSheet2;
    } else if (q1 > q2) {
        perSheet = perSheet1;
    } else {
        perSheet = Math.max(perSheet1, perSheet2);
    }

    if(returns===0) return getPorizkaVnutrPrice(a4Arkush);
    else if(returns===2) return getPorizkaVnutrPrice(a4Arkush * perSheet);
    else return perSheet;
}

function getOffsetPrice(format, printType, qty) {
    const ranges = PRICES["punkt82"][format][printType];

    const range = ranges.find(r =>
        qty >= r.from && (r.to === null || qty <= r.to)
    );

    return range ? range.price : 0;
}

function getAnotherPrice(format, printType, qty) {
    const ranges = PRICES["punkt82"][format];
    const rangesZvorot = PRICES["punkt82"]["drukNaZvoroti"];

    const range = ranges.find(r =>
        qty >= r.from && (r.to === null || qty <= r.to)
    );
    const rangeZvorot = rangesZvorot.find(r =>
        qty >= r.from && (r.to === null || qty <= r.to)
    );

    if (printType !== "4+4") return range ? range.price : 0;
    else return range ? range.price + rangeZvorot.price : 0;
}

function getNoDrukPrice(mat, qty) {
    const ranges = PRICES["punkt82"]["A4"]["no"][mat];

    const range = ranges.find(r =>
        qty >= r.from && (r.to === null || qty <= r.to)
    );

    return range ? range.price : 0;
}

function getPorizkaVnutrPrice(qty) {
    const ranges = PRICES["porizkaVnutr"];

    const range = ranges.find(r =>
        qty >= r.from && (r.to === null || qty <= r.to)
    );

    return range ? range.price * qty : 0;
}
