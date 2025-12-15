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

automateVnutr();

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
    if (vnutrMat.val() === "ofset80") automateVnutr();
    else if (vnutrMat.val() === "ofset160") automateVnutr(120);
    else if (vnutrMat.val() === "kreid130") automateVnutr(180);
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
        vnutrVibor.append(`<option value="sheet${i}">${i} стор (${i/2} ${_str})</option>`);
    }
}