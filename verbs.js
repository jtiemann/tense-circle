(function attachVerbs(root, factory) {
    const verbs = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = verbs;
    }

    root.Verbs = verbs;
}(typeof globalThis !== 'undefined' ? globalThis : this, function createVerbs() {
    'use strict';

    const IRREGULAR_VERBS = {
        haben: {
            praesens: { ich: 'habe', du: 'hast', er: 'hat', wir: 'haben', ihr: 'habt', sie: 'haben' },
            praeteritum: { ich: 'hatte', du: 'hattest', er: 'hatte', wir: 'hatten', ihr: 'hattet', sie: 'hatten' },
            konjunktivII: { ich: 'hätte', du: 'hättest', er: 'hätte', wir: 'hätten', ihr: 'hättet', sie: 'hätten' },
            konjunktivI: { ich: 'habe', du: 'habest', er: 'habe', wir: 'haben', ihr: 'habet', sie: 'haben' },
            partizipII: 'gehabt', hilfsverb: 'haben'
        },
        sein: {
            praesens: { ich: 'bin', du: 'bist', er: 'ist', wir: 'sind', ihr: 'seid', sie: 'sind' },
            praeteritum: { ich: 'war', du: 'warst', er: 'war', wir: 'waren', ihr: 'wart', sie: 'waren' },
            konjunktivII: { ich: 'wäre', du: 'wärest', er: 'wäre', wir: 'wären', ihr: 'wäret', sie: 'wären' },
            konjunktivI: { ich: 'sei', du: 'seiest', er: 'sei', wir: 'seien', ihr: 'seiet', sie: 'seien' },
            partizipII: 'gewesen', hilfsverb: 'sein'
        },
        werden: {
            praesens: { ich: 'werde', du: 'wirst', er: 'wird', wir: 'werden', ihr: 'werdet', sie: 'werden' },
            praeteritum: { ich: 'wurde', du: 'wurdest', er: 'wurde', wir: 'wurden', ihr: 'wurdet', sie: 'wurden' },
            konjunktivII: { ich: 'würde', du: 'würdest', er: 'würde', wir: 'würden', ihr: 'würdet', sie: 'würden' },
            konjunktivI: { ich: 'werde', du: 'werdest', er: 'werde', wir: 'werden', ihr: 'werdet', sie: 'werden' },
            partizipII: 'geworden', hilfsverb: 'sein'
        },
        machen: {
            praesens: { ich: 'mache', du: 'machst', er: 'macht', wir: 'machen', ihr: 'macht', sie: 'machen' },
            praeteritum: { ich: 'machte', du: 'machtest', er: 'machte', wir: 'machten', ihr: 'machtet', sie: 'machten' },
            konjunktivII: { ich: 'machte', du: 'machtest', er: 'machte', wir: 'machten', ihr: 'machtet', sie: 'machten' },
            konjunktivI: { ich: 'mache', du: 'machest', er: 'mache', wir: 'machen', ihr: 'machet', sie: 'machen' },
            partizipII: 'gemacht', hilfsverb: 'haben'
        },
        gehen: {
            praesens: { ich: 'gehe', du: 'gehst', er: 'geht', wir: 'gehen', ihr: 'geht', sie: 'gehen' },
            praeteritum: { ich: 'ging', du: 'gingst', er: 'ging', wir: 'gingen', ihr: 'gingt', sie: 'gingen' },
            konjunktivII: { ich: 'ginge', du: 'gingest', er: 'ginge', wir: 'gingen', ihr: 'ginget', sie: 'gingen' },
            konjunktivI: { ich: 'gehe', du: 'gehest', er: 'gehe', wir: 'gehen', ihr: 'gehet', sie: 'gehen' },
            partizipII: 'gegangen', hilfsverb: 'sein'
        },
        kommen: {
            praesens: { ich: 'komme', du: 'kommst', er: 'kommt', wir: 'kommen', ihr: 'kommt', sie: 'kommen' },
            praeteritum: { ich: 'kam', du: 'kamst', er: 'kam', wir: 'kamen', ihr: 'kamt', sie: 'kamen' },
            konjunktivII: { ich: 'käme', du: 'kämest', er: 'käme', wir: 'kämen', ihr: 'kämet', sie: 'kämen' },
            konjunktivI: { ich: 'komme', du: 'kommest', er: 'komme', wir: 'kommen', ihr: 'kommet', sie: 'kommen' },
            partizipII: 'gekommen', hilfsverb: 'sein'
        },
        spielen: {
            praesens: { ich: 'spiele', du: 'spielst', er: 'spielt', wir: 'spielen', ihr: 'spielt', sie: 'spielen' },
            praeteritum: { ich: 'spielte', du: 'spieltest', er: 'spielte', wir: 'spielten', ihr: 'spieltet', sie: 'spielten' },
            konjunktivII: { ich: 'spielte', du: 'spieltest', er: 'spielte', wir: 'spielten', ihr: 'spieltet', sie: 'spielten' },
            konjunktivI: { ich: 'spiele', du: 'spielest', er: 'spiele', wir: 'spielen', ihr: 'spielet', sie: 'spielen' },
            partizipII: 'gespielt', hilfsverb: 'haben'
        },
        arbeiten: {
            praesens: { ich: 'arbeite', du: 'arbeitest', er: 'arbeitet', wir: 'arbeiten', ihr: 'arbeitet', sie: 'arbeiten' },
            praeteritum: { ich: 'arbeitete', du: 'arbeitetest', er: 'arbeitete', wir: 'arbeiteten', ihr: 'arbeitetet', sie: 'arbeiteten' },
            konjunktivII: { ich: 'arbeitete', du: 'arbeitetest', er: 'arbeitete', wir: 'arbeiteten', ihr: 'arbeitetet', sie: 'arbeiteten' },
            konjunktivI: { ich: 'arbeite', du: 'arbeitest', er: 'arbeite', wir: 'arbeiten', ihr: 'arbeitet', sie: 'arbeiten' },
            partizipII: 'gearbeitet', hilfsverb: 'haben'
        },
        lernen: {
            praesens: { ich: 'lerne', du: 'lernst', er: 'lernt', wir: 'lernen', ihr: 'lernt', sie: 'lernen' },
            praeteritum: { ich: 'lernte', du: 'lerntest', er: 'lernte', wir: 'lernten', ihr: 'lerntet', sie: 'lernten' },
            konjunktivII: { ich: 'lernte', du: 'lerntest', er: 'lernte', wir: 'lernten', ihr: 'lerntet', sie: 'lernten' },
            konjunktivI: { ich: 'lerne', du: 'lernest', er: 'lerne', wir: 'lernen', ihr: 'lernet', sie: 'lernen' },
            partizipII: 'gelernt', hilfsverb: 'haben'
        },
        schreiben: {
            praesens: { ich: 'schreibe', du: 'schreibst', er: 'schreibt', wir: 'schreiben', ihr: 'schreibt', sie: 'schreiben' },
            praeteritum: { ich: 'schrieb', du: 'schriebst', er: 'schrieb', wir: 'schrieben', ihr: 'schriebt', sie: 'schrieben' },
            konjunktivII: { ich: 'schriebe', du: 'schriebest', er: 'schriebe', wir: 'schrieben', ihr: 'schriebet', sie: 'schrieben' },
            konjunktivI: { ich: 'schreibe', du: 'schreibest', er: 'schreibe', wir: 'schreiben', ihr: 'schreibet', sie: 'schreiben' },
            partizipII: 'geschrieben', hilfsverb: 'haben'
        },
        lesen: {
            praesens: { ich: 'lese', du: 'liest', er: 'liest', wir: 'lesen', ihr: 'lest', sie: 'lesen' },
            praeteritum: { ich: 'las', du: 'last', er: 'las', wir: 'lasen', ihr: 'last', sie: 'lasen' },
            konjunktivII: { ich: 'läse', du: 'läsest', er: 'läse', wir: 'läsen', ihr: 'läset', sie: 'läsen' },
            konjunktivI: { ich: 'lese', du: 'lesest', er: 'lese', wir: 'lesen', ihr: 'leset', sie: 'lesen' },
            partizipII: 'gelesen', hilfsverb: 'haben'
        },
        essen: {
            praesens: { ich: 'esse', du: 'isst', er: 'isst', wir: 'essen', ihr: 'esst', sie: 'essen' },
            praeteritum: { ich: 'aß', du: 'aßt', er: 'aß', wir: 'aßen', ihr: 'aßt', sie: 'aßen' },
            konjunktivII: { ich: 'äße', du: 'äßest', er: 'äße', wir: 'äßen', ihr: 'äßet', sie: 'äßen' },
            konjunktivI: { ich: 'esse', du: 'essest', er: 'esse', wir: 'essen', ihr: 'esset', sie: 'essen' },
            partizipII: 'gegessen', hilfsverb: 'haben'
        },
        trinken: {
            praesens: { ich: 'trinke', du: 'trinkst', er: 'trinkt', wir: 'trinken', ihr: 'trinkt', sie: 'trinken' },
            praeteritum: { ich: 'trank', du: 'trankst', er: 'trank', wir: 'tranken', ihr: 'trankt', sie: 'tranken' },
            konjunktivII: { ich: 'tränke', du: 'tränkest', er: 'tränke', wir: 'tränken', ihr: 'tränket', sie: 'tränken' },
            konjunktivI: { ich: 'trinke', du: 'trinkest', er: 'trinke', wir: 'trinken', ihr: 'trinket', sie: 'trinken' },
            partizipII: 'getrunken', hilfsverb: 'haben'
        },
        fahren: {
            praesens: { ich: 'fahre', du: 'fährst', er: 'fährt', wir: 'fahren', ihr: 'fahrt', sie: 'fahren' },
            praeteritum: { ich: 'fuhr', du: 'fuhrst', er: 'fuhr', wir: 'fuhren', ihr: 'fuhrt', sie: 'fuhren' },
            konjunktivII: { ich: 'führe', du: 'führest', er: 'führe', wir: 'führen', ihr: 'führet', sie: 'führen' },
            konjunktivI: { ich: 'fahre', du: 'fahrest', er: 'fahre', wir: 'fahren', ihr: 'fahret', sie: 'fahren' },
            partizipII: 'gefahren', hilfsverb: 'sein'
        },
        sehen: {
            praesens: { ich: 'sehe', du: 'siehst', er: 'sieht', wir: 'sehen', ihr: 'seht', sie: 'sehen' },
            praeteritum: { ich: 'sah', du: 'sahst', er: 'sah', wir: 'sahen', ihr: 'saht', sie: 'sahen' },
            konjunktivII: { ich: 'sähe', du: 'sähest', er: 'sähe', wir: 'sähen', ihr: 'sähet', sie: 'sähen' },
            konjunktivI: { ich: 'sehe', du: 'sehest', er: 'sehe', wir: 'sehen', ihr: 'sehet', sie: 'sehen' },
            partizipII: 'gesehen', hilfsverb: 'haben'
        },
        geben: {
            praesens: { ich: 'gebe', du: 'gibst', er: 'gibt', wir: 'geben', ihr: 'gebt', sie: 'geben' },
            praeteritum: { ich: 'gab', du: 'gabst', er: 'gab', wir: 'gaben', ihr: 'gabt', sie: 'gaben' },
            konjunktivII: { ich: 'gäbe', du: 'gäbest', er: 'gäbe', wir: 'gäben', ihr: 'gäbet', sie: 'gäben' },
            konjunktivI: { ich: 'gebe', du: 'gebest', er: 'gebe', wir: 'geben', ihr: 'gebet', sie: 'geben' },
            partizipII: 'gegeben', hilfsverb: 'haben'
        },
        nehmen: {
            praesens: { ich: 'nehme', du: 'nimmst', er: 'nimmt', wir: 'nehmen', ihr: 'nehmt', sie: 'nehmen' },
            praeteritum: { ich: 'nahm', du: 'nahmst', er: 'nahm', wir: 'nahmen', ihr: 'nahmt', sie: 'nahmen' },
            konjunktivII: { ich: 'nähme', du: 'nähmest', er: 'nähme', wir: 'nähmen', ihr: 'nähmet', sie: 'nähmen' },
            konjunktivI: { ich: 'nehme', du: 'nehmest', er: 'nehme', wir: 'nehmen', ihr: 'nehmet', sie: 'nehmen' },
            partizipII: 'genommen', hilfsverb: 'haben'
        },
        wissen: {
            praesens: { ich: 'weiß', du: 'weißt', er: 'weiß', wir: 'wissen', ihr: 'wisst', sie: 'wissen' },
            praeteritum: { ich: 'wusste', du: 'wusstest', er: 'wusste', wir: 'wussten', ihr: 'wusstet', sie: 'wussten' },
            konjunktivII: { ich: 'wüsste', du: 'wüsstest', er: 'wüsste', wir: 'wüssten', ihr: 'wüsstet', sie: 'wüssten' },
            konjunktivI: { ich: 'wisse', du: 'wissest', er: 'wisse', wir: 'wissen', ihr: 'wisset', sie: 'wissen' },
            partizipII: 'gewusst', hilfsverb: 'haben'
        },
        sprechen: {
            praesens: { ich: 'spreche', du: 'sprichst', er: 'spricht', wir: 'sprechen', ihr: 'sprecht', sie: 'sprechen' },
            praeteritum: { ich: 'sprach', du: 'sprachst', er: 'sprach', wir: 'sprachen', ihr: 'spracht', sie: 'sprachen' },
            konjunktivII: { ich: 'spräche', du: 'sprächest', er: 'spräche', wir: 'sprächen', ihr: 'sprächet', sie: 'sprächen' },
            konjunktivI: { ich: 'spreche', du: 'sprechest', er: 'spreche', wir: 'sprechen', ihr: 'sprechet', sie: 'sprechen' },
            partizipII: 'gesprochen', hilfsverb: 'haben'
        },
        finden: {
            praesens: { ich: 'finde', du: 'findest', er: 'findet', wir: 'finden', ihr: 'findet', sie: 'finden' },
            praeteritum: { ich: 'fand', du: 'fandest', er: 'fand', wir: 'fanden', ihr: 'fandet', sie: 'fanden' },
            konjunktivII: { ich: 'fände', du: 'fändest', er: 'fände', wir: 'fänden', ihr: 'fändet', sie: 'fänden' },
            konjunktivI: { ich: 'finde', du: 'findest', er: 'finde', wir: 'finden', ihr: 'findet', sie: 'finden' },
            partizipII: 'gefunden', hilfsverb: 'haben'
        },
        können: {
            praesens: { ich: 'kann', du: 'kannst', er: 'kann', wir: 'können', ihr: 'könnt', sie: 'können' },
            praeteritum: { ich: 'konnte', du: 'konntest', er: 'konnte', wir: 'konnten', ihr: 'konntet', sie: 'konnten' },
            konjunktivII: { ich: 'könnte', du: 'könntest', er: 'könnte', wir: 'könnten', ihr: 'könntet', sie: 'könnten' },
            konjunktivI: { ich: 'könne', du: 'könnest', er: 'könne', wir: 'können', ihr: 'könnet', sie: 'können' },
            partizipII: 'gekonnt', hilfsverb: 'haben'
        },
        legen: {
            praesens: { ich: 'lege', du: 'legst', er: 'legt', wir: 'legen', ihr: 'legt', sie: 'legen' },
            praeteritum: { ich: 'legte', du: 'legtest', er: 'legte', wir: 'legten', ihr: 'legtet', sie: 'legten' },
            konjunktivII: { ich: 'legte', du: 'legtest', er: 'legte', wir: 'legten', ihr: 'legtet', sie: 'legten' },
            konjunktivI: { ich: 'lege', du: 'legest', er: 'lege', wir: 'legen', ihr: 'leget', sie: 'legen' },
            partizipII: 'gelegt', hilfsverb: 'haben'
        },
        laufen: {
            praesens: { ich: 'laufe', du: 'läufst', er: 'läuft', wir: 'laufen', ihr: 'lauft', sie: 'laufen' },
            praeteritum: { ich: 'lief', du: 'liefst', er: 'lief', wir: 'liefen', ihr: 'lieft', sie: 'liefen' },
            konjunktivII: { ich: 'liefe', du: 'liefest', er: 'liefe', wir: 'liefen', ihr: 'liefet', sie: 'liefen' },
            konjunktivI: { ich: 'laufe', du: 'laufest', er: 'laufe', wir: 'laufen', ihr: 'laufet', sie: 'laufen' },
            partizipII: 'gelaufen', hilfsverb: 'sein'
        },
        schlafen: {
            praesens: { ich: 'schlafe', du: 'schläfst', er: 'schläft', wir: 'schlafen', ihr: 'schlaft', sie: 'schlafen' },
            praeteritum: { ich: 'schlief', du: 'schliefst', er: 'schlief', wir: 'schliefen', ihr: 'schlieft', sie: 'schliefen' },
            konjunktivII: { ich: 'schliefe', du: 'schliefest', er: 'schliefe', wir: 'schliefen', ihr: 'schliefet', sie: 'schliefen' },
            konjunktivI: { ich: 'schlafe', du: 'schlafest', er: 'schlafe', wir: 'schlafen', ihr: 'schlafet', sie: 'schlafen' },
            partizipII: 'geschlafen', hilfsverb: 'haben'
        },
        denken: {
            praesens: { ich: 'denke', du: 'denkst', er: 'denkt', wir: 'denken', ihr: 'denkt', sie: 'denken' },
            praeteritum: { ich: 'dachte', du: 'dachtest', er: 'dachte', wir: 'dachten', ihr: 'dachtet', sie: 'dachten' },
            konjunktivII: { ich: 'dächte', du: 'dächtest', er: 'dächte', wir: 'dächten', ihr: 'dächtet', sie: 'dächten' },
            konjunktivI: { ich: 'denke', du: 'denkest', er: 'denke', wir: 'denken', ihr: 'denket', sie: 'denken' },
            partizipII: 'gedacht', hilfsverb: 'haben'
        },
        bringen: {
            praesens: { ich: 'bringe', du: 'bringst', er: 'bringt', wir: 'bringen', ihr: 'bringt', sie: 'bringen' },
            praeteritum: { ich: 'brachte', du: 'brachtest', er: 'brachte', wir: 'brachten', ihr: 'brachtet', sie: 'brachten' },
            konjunktivII: { ich: 'brächte', du: 'brächtest', er: 'brächte', wir: 'brächten', ihr: 'brächtet', sie: 'brächten' },
            konjunktivI: { ich: 'bringe', du: 'bringest', er: 'bringe', wir: 'bringen', ihr: 'bringet', sie: 'bringen' },
            partizipII: 'gebracht', hilfsverb: 'haben'
        },
        stehen: {
            praesens: { ich: 'stehe', du: 'stehst', er: 'steht', wir: 'stehen', ihr: 'steht', sie: 'stehen' },
            praeteritum: { ich: 'stand', du: 'standst', er: 'stand', wir: 'standen', ihr: 'standet', sie: 'standen' },
            konjunktivII: { ich: 'stände', du: 'ständest', er: 'stände', wir: 'ständen', ihr: 'ständet', sie: 'ständen' },
            konjunktivI: { ich: 'stehe', du: 'stehest', er: 'stehe', wir: 'stehen', ihr: 'stehet', sie: 'stehen' },
            partizipII: 'gestanden', hilfsverb: 'haben'
        },
        sitzen: {
            praesens: { ich: 'sitze', du: 'sitzt', er: 'sitzt', wir: 'sitzen', ihr: 'sitzt', sie: 'sitzen' },
            praeteritum: { ich: 'saß', du: 'saßt', er: 'saß', wir: 'saßen', ihr: 'saßt', sie: 'saßen' },
            konjunktivII: { ich: 'säße', du: 'säßest', er: 'säße', wir: 'säßen', ihr: 'säßet', sie: 'säßen' },
            konjunktivI: { ich: 'sitze', du: 'sitzest', er: 'sitze', wir: 'sitzen', ihr: 'sitzet', sie: 'sitzen' },
            partizipII: 'gesessen', hilfsverb: 'haben'
        },
        helfen: {
            praesens: { ich: 'helfe', du: 'hilfst', er: 'hilft', wir: 'helfen', ihr: 'helft', sie: 'helfen' },
            praeteritum: { ich: 'half', du: 'halfst', er: 'half', wir: 'halfen', ihr: 'halft', sie: 'halfen' },
            konjunktivII: { ich: 'hülfe', du: 'hülfest', er: 'hülfe', wir: 'hülfen', ihr: 'hülfet', sie: 'hülfen' },
            konjunktivI: { ich: 'helfe', du: 'helfest', er: 'helfe', wir: 'helfen', ihr: 'helfet', sie: 'helfen' },
            partizipII: 'geholfen', hilfsverb: 'haben'
        },
        tragen: {
            praesens: { ich: 'trage', du: 'trägst', er: 'trägt', wir: 'tragen', ihr: 'tragt', sie: 'tragen' },
            praeteritum: { ich: 'trug', du: 'trugst', er: 'trug', wir: 'trugen', ihr: 'trugt', sie: 'trugen' },
            konjunktivII: { ich: 'trüge', du: 'trügest', er: 'trüge', wir: 'trügen', ihr: 'trüget', sie: 'trügen' },
            konjunktivI: { ich: 'trage', du: 'tragest', er: 'trage', wir: 'tragen', ihr: 'traget', sie: 'tragen' },
            partizipII: 'getragen', hilfsverb: 'haben'
        },
        fallen: {
            praesens: { ich: 'falle', du: 'fällst', er: 'fällt', wir: 'fallen', ihr: 'fallt', sie: 'fallen' },
            praeteritum: { ich: 'fiel', du: 'fielst', er: 'fiel', wir: 'fielen', ihr: 'fielt', sie: 'fielen' },
            konjunktivII: { ich: 'fiele', du: 'fielest', er: 'fiele', wir: 'fielen', ihr: 'fielet', sie: 'fielen' },
            konjunktivI: { ich: 'falle', du: 'fallest', er: 'falle', wir: 'fallen', ihr: 'fallet', sie: 'fallen' },
            partizipII: 'gefallen', hilfsverb: 'sein'
        },
        bleiben: {
            praesens: { ich: 'bleibe', du: 'bleibst', er: 'bleibt', wir: 'bleiben', ihr: 'bleibt', sie: 'bleiben' },
            praeteritum: { ich: 'blieb', du: 'bliebst', er: 'blieb', wir: 'blieben', ihr: 'bliebt', sie: 'blieben' },
            konjunktivII: { ich: 'bliebe', du: 'bliebest', er: 'bliebe', wir: 'blieben', ihr: 'bliebet', sie: 'blieben' },
            konjunktivI: { ich: 'bleibe', du: 'bleibest', er: 'bleibe', wir: 'bleiben', ihr: 'bleibet', sie: 'bleiben' },
            partizipII: 'geblieben', hilfsverb: 'sein'
        },
        // Base verbs for separable compounds
        fangen: {
            praesens: { ich: 'fange', du: 'fängst', er: 'fängt', wir: 'fangen', ihr: 'fangt', sie: 'fangen' },
            praeteritum: { ich: 'fing', du: 'fingst', er: 'fing', wir: 'fingen', ihr: 'fingt', sie: 'fingen' },
            konjunktivII: { ich: 'finge', du: 'fingest', er: 'finge', wir: 'fingen', ihr: 'finget', sie: 'fingen' },
            konjunktivI: { ich: 'fange', du: 'fangest', er: 'fange', wir: 'fangen', ihr: 'fanget', sie: 'fangen' },
            partizipII: 'gefangen', hilfsverb: 'haben'
        },
        laden: {
            praesens: { ich: 'lade', du: 'lädst', er: 'lädt', wir: 'laden', ihr: 'ladet', sie: 'laden' },
            praeteritum: { ich: 'lud', du: 'ludst', er: 'lud', wir: 'luden', ihr: 'ludt', sie: 'luden' },
            konjunktivII: { ich: 'lüde', du: 'lüdest', er: 'lüde', wir: 'lüden', ihr: 'lüdet', sie: 'lüden' },
            konjunktivI: { ich: 'lade', du: 'ladest', er: 'lade', wir: 'laden', ihr: 'ladet', sie: 'laden' },
            partizipII: 'geladen', hilfsverb: 'haben'
        },
        rufen: {
            praesens: { ich: 'rufe', du: 'rufst', er: 'ruft', wir: 'rufen', ihr: 'ruft', sie: 'rufen' },
            praeteritum: { ich: 'rief', du: 'riefst', er: 'rief', wir: 'riefen', ihr: 'rieft', sie: 'riefen' },
            konjunktivII: { ich: 'riefe', du: 'riefest', er: 'riefe', wir: 'riefen', ihr: 'riefet', sie: 'riefen' },
            konjunktivI: { ich: 'rufe', du: 'rufest', er: 'rufe', wir: 'rufen', ihr: 'rufet', sie: 'rufen' },
            partizipII: 'gerufen', hilfsverb: 'haben'
        },
        steigen: {
            praesens: { ich: 'steige', du: 'steigst', er: 'steigt', wir: 'steigen', ihr: 'steigt', sie: 'steigen' },
            praeteritum: { ich: 'stieg', du: 'stiegst', er: 'stieg', wir: 'stiegen', ihr: 'stiegt', sie: 'stiegen' },
            konjunktivII: { ich: 'stiege', du: 'stiegest', er: 'stiege', wir: 'stiegen', ihr: 'stieget', sie: 'stiegen' },
            konjunktivI: { ich: 'steige', du: 'steigest', er: 'steige', wir: 'steigen', ihr: 'steiget', sie: 'steigen' },
            partizipII: 'gestiegen', hilfsverb: 'sein'
        },
        lassen: {
            praesens: { ich: 'lasse', du: 'lässt', er: 'lässt', wir: 'lassen', ihr: 'lasst', sie: 'lassen' },
            praeteritum: { ich: 'ließ', du: 'ließt', er: 'ließ', wir: 'ließen', ihr: 'ließt', sie: 'ließen' },
            konjunktivII: { ich: 'ließe', du: 'ließest', er: 'ließe', wir: 'ließen', ihr: 'ließet', sie: 'ließen' },
            konjunktivI: { ich: 'lasse', du: 'lassest', er: 'lasse', wir: 'lassen', ihr: 'lasset', sie: 'lassen' },
            partizipII: 'gelassen', hilfsverb: 'haben'
        },
        halten: {
            praesens: { ich: 'halte', du: 'hältst', er: 'hält', wir: 'halten', ihr: 'haltet', sie: 'halten' },
            praeteritum: { ich: 'hielt', du: 'hielst', er: 'hielt', wir: 'hielten', ihr: 'hieltet', sie: 'hielten' },
            konjunktivII: { ich: 'hielte', du: 'hieltest', er: 'hielte', wir: 'hielten', ihr: 'hieltet', sie: 'hielten' },
            konjunktivI: { ich: 'halte', du: 'haltest', er: 'halte', wir: 'halten', ihr: 'haltet', sie: 'halten' },
            partizipII: 'gehalten', hilfsverb: 'haben'
        },
        schlagen: {
            praesens: { ich: 'schlage', du: 'schlägst', er: 'schlägt', wir: 'schlagen', ihr: 'schlagt', sie: 'schlagen' },
            praeteritum: { ich: 'schlug', du: 'schlugst', er: 'schlug', wir: 'schlugen', ihr: 'schlugt', sie: 'schlugen' },
            konjunktivII: { ich: 'schlüge', du: 'schlügest', er: 'schlüge', wir: 'schlügen', ihr: 'schlüget', sie: 'schlügen' },
            konjunktivI: { ich: 'schlage', du: 'schlagest', er: 'schlage', wir: 'schlagen', ihr: 'schlaget', sie: 'schlagen' },
            partizipII: 'geschlagen', hilfsverb: 'haben'
        },
        ziehen: {
            praesens: { ich: 'ziehe', du: 'ziehst', er: 'zieht', wir: 'ziehen', ihr: 'zieht', sie: 'ziehen' },
            praeteritum: { ich: 'zog', du: 'zogst', er: 'zog', wir: 'zogen', ihr: 'zogt', sie: 'zogen' },
            konjunktivII: { ich: 'zöge', du: 'zögest', er: 'zöge', wir: 'zögen', ihr: 'zöget', sie: 'zögen' },
            konjunktivI: { ich: 'ziehe', du: 'ziehest', er: 'ziehe', wir: 'ziehen', ihr: 'ziehet', sie: 'ziehen' },
            partizipII: 'gezogen', hilfsverb: 'haben'
        },
        wollen: {
            praesens: { ich: 'will', du: 'willst', er: 'will', wir: 'wollen', ihr: 'wollt', sie: 'wollen' },
            praeteritum: { ich: 'wollte', du: 'wolltest', er: 'wollte', wir: 'wollten', ihr: 'wolltet', sie: 'wollten' },
            konjunktivII: { ich: 'wollte', du: 'wolltest', er: 'wollte', wir: 'wollten', ihr: 'wolltet', sie: 'wollten' },
            konjunktivI: { ich: 'wolle', du: 'wollest', er: 'wolle', wir: 'wollen', ihr: 'wollet', sie: 'wollen' },
            partizipII: 'gewollt', hilfsverb: 'haben'
        },
        müssen: {
            praesens: { ich: 'muss', du: 'musst', er: 'muss', wir: 'müssen', ihr: 'müsst', sie: 'müssen' },
            praeteritum: { ich: 'musste', du: 'musstest', er: 'musste', wir: 'mussten', ihr: 'musstet', sie: 'mussten' },
            konjunktivII: { ich: 'müsste', du: 'müsstest', er: 'müsste', wir: 'müssten', ihr: 'müsstet', sie: 'müssten' },
            konjunktivI: { ich: 'müsse', du: 'müssest', er: 'müsse', wir: 'müssen', ihr: 'müsset', sie: 'müssen' },
            partizipII: 'gemusst', hilfsverb: 'haben'
        },
        dürfen: {
            praesens: { ich: 'darf', du: 'darfst', er: 'darf', wir: 'dürfen', ihr: 'dürft', sie: 'dürfen' },
            praeteritum: { ich: 'durfte', du: 'durftest', er: 'durfte', wir: 'durften', ihr: 'durftet', sie: 'durften' },
            konjunktivII: { ich: 'dürfte', du: 'dürftest', er: 'dürfte', wir: 'dürften', ihr: 'dürftet', sie: 'dürften' },
            konjunktivI: { ich: 'dürfe', du: 'dürfest', er: 'dürfe', wir: 'dürfen', ihr: 'dürfet', sie: 'dürfen' },
            partizipII: 'gedurft', hilfsverb: 'haben'
        },
        sollen: {
            praesens: { ich: 'soll', du: 'sollst', er: 'soll', wir: 'sollen', ihr: 'sollt', sie: 'sollen' },
            praeteritum: { ich: 'sollte', du: 'solltest', er: 'sollte', wir: 'sollten', ihr: 'solltet', sie: 'sollten' },
            konjunktivII: { ich: 'sollte', du: 'solltest', er: 'sollte', wir: 'sollten', ihr: 'solltet', sie: 'sollten' },
            konjunktivI: { ich: 'solle', du: 'sollest', er: 'solle', wir: 'sollen', ihr: 'sollet', sie: 'sollen' },
            partizipII: 'gesollt', hilfsverb: 'haben'
        },
        mögen: {
            praesens: { ich: 'mag', du: 'magst', er: 'mag', wir: 'mögen', ihr: 'mögt', sie: 'mögen' },
            praeteritum: { ich: 'mochte', du: 'mochtest', er: 'mochte', wir: 'mochten', ihr: 'mochtet', sie: 'mochten' },
            konjunktivII: { ich: 'möchte', du: 'möchtest', er: 'möchte', wir: 'möchten', ihr: 'möchtet', sie: 'möchten' },
            konjunktivI: { ich: 'möge', du: 'mögest', er: 'möge', wir: 'mögen', ihr: 'möget', sie: 'mögen' },
            partizipII: 'gemocht', hilfsverb: 'haben'
        },
        treten: {
            praesens: { ich: 'trete', du: 'trittst', er: 'tritt', wir: 'treten', ihr: 'tretet', sie: 'treten' },
            praeteritum: { ich: 'trat', du: 'tratst', er: 'trat', wir: 'traten', ihr: 'tratet', sie: 'traten' },
            konjunktivII: { ich: 'träte', du: 'trätest', er: 'träte', wir: 'träten', ihr: 'trätet', sie: 'träten' },
            konjunktivI: { ich: 'trete', du: 'tretest', er: 'trete', wir: 'treten', ihr: 'tretet', sie: 'treten' },
            partizipII: 'getreten', hilfsverb: 'sein'
        },
        werfen: {
            praesens: { ich: 'werfe', du: 'wirfst', er: 'wirft', wir: 'werfen', ihr: 'werft', sie: 'werfen' },
            praeteritum: { ich: 'warf', du: 'warfst', er: 'warf', wir: 'warfen', ihr: 'warft', sie: 'warfen' },
            konjunktivII: { ich: 'würfe', du: 'würfest', er: 'würfe', wir: 'würfen', ihr: 'würfet', sie: 'würfen' },
            konjunktivI: { ich: 'werfe', du: 'werfest', er: 'werfe', wir: 'werfen', ihr: 'werfet', sie: 'werfen' },
            partizipII: 'geworfen', hilfsverb: 'haben'
        }
    };

    // --- Regular Verb Conjugation Fallback ---

    function conjugateRegular(infinitive) {
        let stem;
        if (infinitive.endsWith('ern') || infinitive.endsWith('eln')) {
            stem = infinitive.slice(0, -3);
        } else if (infinitive.endsWith('en')) {
            stem = infinitive.slice(0, -2);
        } else if (infinitive.endsWith('n')) {
            stem = infinitive.slice(0, -1);
        } else {
            stem = infinitive;
        }

        const needsE = /[td]$/.test(stem) || /[cgf]n$/.test(stem);
        const e = needsE ? 'e' : '';

        const inseparable = ['be', 'er', 'ver', 'zer', 'ent', 'emp', 'ge', 'miss'];
        const hasInsep = inseparable.some(p => infinitive.startsWith(p) && infinitive.length > p.length + 2);
        const gePrefix = hasInsep ? '' : 'ge';

        return {
            praesens: { ich: `${stem}e`, du: `${stem}${e}st`, er: `${stem}${e}t`, wir: infinitive, ihr: `${stem}${e}t`, sie: infinitive },
            praeteritum: { ich: `${stem}${e}te`, du: `${stem}${e}test`, er: `${stem}${e}te`, wir: `${stem}${e}ten`, ihr: `${stem}${e}tet`, sie: `${stem}${e}ten` },
            konjunktivII: { ich: `${stem}${e}te`, du: `${stem}${e}test`, er: `${stem}${e}te`, wir: `${stem}${e}ten`, ihr: `${stem}${e}tet`, sie: `${stem}${e}ten` },
            konjunktivI: { ich: `${stem}e`, du: `${stem}est`, er: `${stem}e`, wir: infinitive, ihr: `${stem}et`, sie: infinitive },
            partizipII: `${gePrefix}${stem}${e}t`,
            hilfsverb: 'haben'
        };
    }

    // --- Separable Verb Support ---

    // Ordered longest-first so 'zurück' matches before 'zu', etc.
    const SEPARABLE_PREFIXES = [
        'zurück', 'zusammen', 'weiter', 'wieder', 'entgegen', 'empor',
        'nieder', 'hinaus', 'heraus', 'hinein', 'herein', 'hinauf', 'herab',
        'rein', 'hoch', 'fort', 'los', 'mit', 'aus', 'auf', 'ein',
        'nach', 'vor', 'weg', 'her', 'hin', 'bei', 'um', 'zu', 'ab', 'an'
    ];

    // Compounds whose auxiliary differs from their base verb's (stehen takes haben).
    const SEPARABLE_SEIN_VERBS = new Set(['aufstehen', 'einschlafen', 'umziehen']);

    function getSeparableInfo(infinitive) {
        const lower = infinitive.toLowerCase();
        for (const prefix of SEPARABLE_PREFIXES) {
            if (lower.startsWith(prefix) && lower.length > prefix.length + 2) {
                const baseVerb = lower.slice(prefix.length);
                // Confirm base looks like a verb
                if (baseVerb.endsWith('en') || baseVerb.endsWith('n') || IRREGULAR_VERBS[baseVerb]) {
                    return { prefix, baseVerb };
                }
            }
        }
        return null;
    }

    function buildSeparableConjugation(infinitive, prefix, baseConj) {
        return {
            infinitive,
            prefix,
            baseVerb: baseConj.infinitive,
            praesens: { ...baseConj.praesens },
            praeteritum: { ...baseConj.praeteritum },
            konjunktivII: { ...baseConj.konjunktivII },
            konjunktivI: { ...baseConj.konjunktivI },
            partizipII: prefix + baseConj.partizipII,
            hilfsverb: SEPARABLE_SEIN_VERBS.has(infinitive) ? 'sein' : baseConj.hilfsverb,
            isSeparable: true
        };
    }

    function getConjugation(infinitive) {
        const lower = infinitive.toLowerCase().trim();
        if (IRREGULAR_VERBS[lower]) return { ...IRREGULAR_VERBS[lower], infinitive: lower };
        const sepInfo = getSeparableInfo(lower);
        if (sepInfo) {
            const baseConj = getConjugation(sepInfo.baseVerb);
            return buildSeparableConjugation(lower, sepInfo.prefix, baseConj);
        }
        return { ...conjugateRegular(lower), infinitive: lower };
    }

    function getAllVerbForms(conjugation) {
        const forms = new Set();
        forms.add(conjugation.infinitive);
        forms.add(conjugation.partizipII);
        for (const tense of ['praesens', 'praeteritum', 'konjunktivII', 'konjunktivI']) {
            for (const form of Object.values(conjugation[tense])) {
                forms.add(form);
                // For separable verbs: also add prefix+form (the subordinate clause joined form)
                if (conjugation.isSeparable) {
                    forms.add(conjugation.prefix + form);
                }
            }
        }
        // werden/würde forms for Futur I and Konjunktiv II periphrastic
        ['werde', 'wirst', 'wird', 'werden', 'werdet'].forEach(f => forms.add(f));
        ['würde', 'würdest', 'würden', 'würdet'].forEach(f => forms.add(f));
        // Include auxiliary verb forms (haben/sein) so Perfekt & Conditional-past sentences pass the hasVerb check
        if (conjugation.hilfsverb) {
            const hilfsConj = getConjugation(conjugation.hilfsverb);
            for (const tense of ['praesens', 'konjunktivII']) {
                for (const form of Object.values(hilfsConj[tense])) {
                    forms.add(form);
                }
            }
        }
        return [...forms];
    }

    // --- Verb Presets (multiple starting sentences per verb) ---

    const VERB_PRESETS = [
        // Regular & Irregular Verbs
        { verb: 'haben', sentences: ['Ich habe einen großen Hund.', 'Er hat eine neue Wohnung in der Stadt.', 'Wir haben heute viel Arbeit.'], label: 'haben (to have)' },
        { verb: 'sein', sentences: ['Ich bin müde nach der Arbeit.', 'Er ist sehr nett und hilfsbereit.', 'Das Wetter ist heute wunderbar.'], label: 'sein (to be)' },
        { verb: 'machen', sentences: ['Ich mache meine Hausaufgaben.', 'Er macht jeden Tag Sport.', 'Wir machen einen Ausflug am Wochenende.'], label: 'machen (to make/do)' },
        { verb: 'gehen', sentences: ['Ich gehe in den Park.', 'Er geht jeden Morgen spazieren.', 'Wir gehen am Abend ins Kino.'], label: 'gehen (to go)' },
        { verb: 'kommen', sentences: ['Ich komme aus Deutschland.', 'Er kommt morgen zu uns.', 'Sie kommen pünktlich zur Besprechung.'], label: 'kommen (to come)' },
        { verb: 'spielen', sentences: ['Ich spiele Gitarre im Garten.', 'Das Kind spielt gerne mit dem Hund.', 'Sie spielen jeden Samstag Fußball.'], label: 'spielen (to play)' },
        { verb: 'arbeiten', sentences: ['Ich arbeite in einem großen Büro.', 'Er arbeitet als Arzt in der Klinik.', 'Sie arbeitet sehr hart für die Prüfung.'], label: 'arbeiten (to work)' },
        { verb: 'lernen', sentences: ['Ich lerne Deutsch jeden Tag.', 'Er lernt für die wichtige Prüfung.', 'Die Kinder lernen schnell neue Sprachen.'], label: 'lernen (to learn)' },
        { verb: 'schreiben', sentences: ['Ich schreibe einen langen Brief.', 'Er schreibt einen Roman über seine Reisen.', 'Sie schreibt täglich in ihr Tagebuch.'], label: 'schreiben (to write)' },
        { verb: 'lesen', sentences: ['Ich lese ein interessantes Buch.', 'Er liest jeden Abend vor dem Schlafen.', 'Das Kind liest gerne Märchen.'], label: 'lesen (to read)' },
        { verb: 'essen', sentences: ['Ich esse einen Apfel zum Frühstück.', 'Er isst gerne Spaghetti mit Tomatensauce.', 'Wir essen zusammen in einem Restaurant.'], label: 'essen (to eat)' },
        { verb: 'trinken', sentences: ['Ich trinke Kaffee am Morgen.', 'Er trinkt jeden Tag viel Wasser.', 'Sie trinken Tee und lesen die Zeitung.'], label: 'trinken (to drink)' },
        { verb: 'fahren', sentences: ['Ich fahre mit dem Zug nach Berlin.', 'Er fährt jeden Tag mit dem Fahrrad zur Arbeit.', 'Sie fahren im Sommer ans Meer.'], label: 'fahren (to drive/travel)' },
        { verb: 'sehen', sentences: ['Ich sehe den schönen Sonnenuntergang.', 'Er sieht einen alten Film im Fernsehen.', 'Wir sehen uns jeden Freitag.'], label: 'sehen (to see)' },
        { verb: 'geben', sentences: ['Ich gebe meinem Freund ein Geschenk.', 'Er gibt der Kellnerin ein Trinkgeld.', 'Sie gibt immer gute Ratschläge.'], label: 'geben (to give)' },
        { verb: 'nehmen', sentences: ['Ich nehme den Bus zur Schule.', 'Er nimmt die Treppe statt des Aufzugs.', 'Sie nehmen ein Taxi zum Flughafen.'], label: 'nehmen (to take)' },
        { verb: 'sprechen', sentences: ['Ich spreche mit meiner Lehrerin.', 'Er spricht fließend Englisch und Spanisch.', 'Wir sprechen über das neue Projekt.'], label: 'sprechen (to speak)' },
        { verb: 'finden', sentences: ['Ich finde den Schlüssel auf dem Tisch.', 'Er findet die Arbeit sehr interessant.', 'Sie finden die Stadt wunderschön.'], label: 'finden (to find)' },
        { verb: 'schlafen', sentences: ['Ich schlafe acht Stunden pro Nacht.', 'Das Baby schläft tief und fest.', 'Er schläft nach dem Mittagessen kurz.'], label: 'schlafen (to sleep)' },
        { verb: 'denken', sentences: ['Ich denke oft an meine Familie.', 'Er denkt gründlich nach, bevor er antwortet.', 'Sie denken schon an die Zukunft.'], label: 'denken (to think)' },
        { verb: 'helfen', sentences: ['Ich helfe meiner Mutter in der Küche.', 'Er hilft dem alten Herrn über die Straße.', 'Wir helfen einander gerne.'], label: 'helfen (to help)' },
        { verb: 'laufen', sentences: ['Ich laufe jeden Morgen im Park.', 'Er läuft täglich fünf Kilometer.', 'Die Kinder laufen auf dem Spielplatz.'], label: 'laufen (to run)' },
        { verb: 'bringen', sentences: ['Ich bringe die Kinder zur Schule.', 'Er bringt Blumen für seine Mutter mit.', 'Sie bringen das Gepäck ins Hotel.'], label: 'bringen (to bring)' },
        { verb: 'stehen', sentences: ['Ich stehe an der Bushaltestelle.', 'Er steht vor dem Spiegel und kämmt sich.', 'Das Buch steht im Regal.'], label: 'stehen (to stand)' },
        { verb: 'sitzen', sentences: ['Ich sitze auf dem bequemen Sofa.', 'Er sitzt stundenlang am Computer.', 'Wir sitzen im Garten und genießen die Sonne.'], label: 'sitzen (to sit)' },
        { verb: 'tragen', sentences: ['Ich trage einen warmen Mantel.', 'Er trägt eine schwere Tasche nach Hause.', 'Sie trägt ein elegantes Kleid zur Party.'], label: 'tragen (to carry/wear)' },
        { verb: 'fallen', sentences: ['Der Apfel fällt vom Baum.', 'Das Blatt fällt langsam zu Boden.', 'Es fällt mir schwer, früh aufzustehen.'], label: 'fallen (to fall)' },
        { verb: 'bleiben', sentences: ['Ich bleibe heute zu Hause.', 'Er bleibt bis Mitternacht im Büro.', 'Sie bleiben das ganze Wochenende bei uns.'], label: 'bleiben (to stay)' },
        { verb: 'wissen', sentences: ['Ich weiß die Antwort auf die Frage.', 'Er weiß, wie man das Problem löst.', 'Wir wissen noch nicht, wann er kommt.'], label: 'wissen (to know)' },
        { verb: 'lassen', sentences: ['Ich lasse die Kinder draußen spielen.', 'Er lässt das Auto in der Garage.', 'Sie lässt sich die Haare schneiden.'], label: 'lassen (to let/leave)' },
        { verb: 'halten', sentences: ['Ich halte die Tür für den alten Mann auf.', 'Der Bus hält an der nächsten Station.', 'Er hält eine Rede vor vielen Menschen.'], label: 'halten (to hold/stop)' },
        // Separable Verbs (Trennbare Verben)
        { verb: 'aufmachen', sentences: ['Ich mache die Tür auf.', 'Er macht das Fenster auf, weil es heiß ist.', 'Sie macht jeden Morgen das Geschäft auf.'], label: 'aufmachen (to open)' },
        { verb: 'aufstehen', sentences: ['Ich stehe früh auf.', 'Er steht jeden Tag um sechs Uhr auf.', 'Sie steht schwer vom Sessel auf.'], label: 'aufstehen (to get up)' },
        { verb: 'ankommen', sentences: ['Ich komme um drei Uhr an.', 'Der Zug kommt pünktlich auf Gleis drei an.', 'Sie kommen morgen aus dem Urlaub an.'], label: 'ankommen (to arrive)' },
        { verb: 'ausgehen', sentences: ['Ich gehe heute Abend aus.', 'Er geht am Wochenende gerne aus.', 'Wir gehen ins Theater aus.'], label: 'ausgehen (to go out)' },
        { verb: 'anfangen', sentences: ['Ich fange jetzt mit der Arbeit an.', 'Der Film fängt um acht Uhr an.', 'Wir fangen bald mit dem Unterricht an.'], label: 'anfangen (to begin)' },
        { verb: 'anrufen', sentences: ['Ich rufe meine Mutter an.', 'Er ruft seinen Freund jeden Tag an.', 'Sie ruft beim Arzt an, um einen Termin zu machen.'], label: 'anrufen (to call)' },
        { verb: 'einladen', sentences: ['Ich lade meine Freunde ein.', 'Er lädt uns zum Geburtstag ein.', 'Sie laden alle Nachbarn zur Party ein.'], label: 'einladen (to invite)' },
        { verb: 'vorstellen', sentences: ['Ich stelle mich dem neuen Kollegen vor.', 'Er stellt uns seiner Familie vor.', 'Sie stellt sich als neue Lehrerin vor.'], label: 'vorstellen (to introduce)' },
        { verb: 'mitnehmen', sentences: ['Ich nehme den Regenschirm mit.', 'Er nimmt sein Kind zur Arbeit mit.', 'Sie nimmt immer etwas zu essen mit.'], label: 'mitnehmen (to take along)' },
        { verb: 'zurückkommen', sentences: ['Ich komme morgen zurück.', 'Er kommt spät aus dem Urlaub zurück.', 'Sie kommen bald aus London zurück.'], label: 'zurückkommen (to come back)' },
        { verb: 'aufräumen', sentences: ['Ich räume mein Zimmer auf.', 'Er räumt die ganze Wohnung auf.', 'Wir räumen nach der Party auf.'], label: 'aufräumen (to tidy up)' },
        { verb: 'zuhören', sentences: ['Ich höre dem Lehrer aufmerksam zu.', 'Er hört der Musik entspannt zu.', 'Die Kinder hören dem Märchen zu.'], label: 'zuhören (to listen to)' },
        { verb: 'aufhören', sentences: ['Ich höre mit dem Rauchen auf.', 'Er hört endlich mit der Arbeit auf.', 'Sie hören mit dem Lärm auf.'], label: 'aufhören (to stop/quit)' },
        { verb: 'abfahren', sentences: ['Der Zug fährt um neun Uhr ab.', 'Ich fahre morgen früh ab.', 'Das Schiff fährt um Mitternacht ab.'], label: 'abfahren (to depart)' },
        { verb: 'einschlafen', sentences: ['Ich schlafe schnell ein.', 'Das Baby schläft im Auto ein.', 'Er schläft vor dem Fernseher ein.'], label: 'einschlafen (to fall asleep)' },
        { verb: 'aufnehmen', sentences: ['Ich nehme das Gespräch auf.', 'Er nimmt das Konzert mit dem Handy auf.', 'Sie nehmen einen neuen Mitarbeiter auf.'], label: 'aufnehmen (to record/admit)' },
        { verb: 'umziehen', sentences: ['Ich ziehe in eine neue Stadt um.', 'Er zieht nächsten Monat in eine größere Wohnung um.', 'Wir ziehen nach München um.'], label: 'umziehen (to move/relocate)' },
        { verb: 'einsteigen', sentences: ['Ich steige in den Bus ein.', 'Er steigt am Hauptbahnhof ein.', 'Wir steigen in die U-Bahn ein.'], label: 'einsteigen (to get on/board)' },
        { verb: 'aussteigen', sentences: ['Ich steige an der nächsten Haltestelle aus.', 'Er steigt am Marktplatz aus.', 'Sie steigen am Bahnhof aus.'], label: 'aussteigen (to get off)' },
        { verb: 'abgeben', sentences: ['Ich gebe die Hausaufgaben ab.', 'Er gibt das Paket am Schalter ab.', 'Sie geben ihre Mäntel an der Garderobe ab.'], label: 'abgeben (to hand in/drop off)' },
    ];

    const STEP_THEMES = [
        ['step-theme-blue', '#0ea5e9'],
        ['step-theme-purple', '#9333ea'],
        ['step-theme-purple', '#a855f7'],
        ['step-theme-purple', '#c084fc'],
        ['step-theme-pink', '#ec4899'],
        ['step-theme-pink', '#f43f5e'],
        ['step-theme-yellow', '#eab308'],
        ['step-theme-yellow', '#ca8a04'],
        ['step-theme-red', '#ef4444'],
        ['step-theme-red', '#dc2626'],
        ['step-theme-red', '#b91c1c']
    ];

    // Builds the 11 exercise steps for any verb from its conjugation.
    // Separable verbs split the prefix to the clause end in main clauses and
    // rejoin it in subordinate clauses; examples follow that word order.
    function buildSteps(conj) {
        const inf = conj.infinitive;
        const pp = conj.partizipII;
        const sep = conj.isSeparable ? conj.prefix : '';
        const aux = getConjugation(conj.hilfsverb);
        const auxPraes3 = aux.praesens.er;
        const auxKII3 = aux.konjunktivII.er;
        const praes3 = conj.praesens.er;
        const prat3 = conj.praeteritum.er;
        const kII3 = conj.konjunktivII.er;
        const kI3 = conj.konjunktivI.er;
        const tail = sep ? ` ${sep}` : '';
        const sepNote = sep
            ? ` The prefix "${sep}" separates to the end of a main clause and rejoins the verb in a subordinate clause.`
            : '';

        const defs = [
            {
                name: 'Prediction',
                prompt: `Use Futur I (werden + ${inf}) to make a prediction.${sepNote}`,
                voicePrompt: `Imagine tomorrow. Make a prediction with ${inf}, using the future tense.`,
                acceptanceCriteria: `A finite form of werden is used with the infinitive ${inf} to express the future.`,
                hint: `Use a form such as: er wird ... ${inf}.`,
                example: `Er wird morgen ${inf}.`
            },
            {
                name: 'Modal (present)',
                prompt: `Use a present-tense modal verb with ${inf} to express necessity or possibility.${sepNote}`,
                voicePrompt: `Express necessity or possibility with a present-tense modal verb and ${inf}.`,
                acceptanceCriteria: `A finite present modal verb is paired with the infinitive ${inf}.`,
                hint: `Use a form such as: er muss ... ${inf} or er kann ... ${inf}.`,
                example: `Er muss heute ${inf}.`
            },
            {
                name: 'Modal Perfect',
                prompt: `Use Perfekt with a modal verb and the double infinitive construction.${sepNote}`,
                voicePrompt: `Describe a completed situation using a modal verb and ${inf} in the double-infinitive construction.`,
                acceptanceCriteria: `A finite auxiliary form of haben is followed by ${inf} and a modal infinitive, using the Ersatzinfinitiv pattern.`,
                hint: `Use the pattern: er hat ... ${inf} müssen/können/dürfen.`,
                example: `Er hat gestern ${inf} müssen.`
            },
            {
                name: 'Simple Past',
                prompt: `Use the Präteritum form of ${inf}.${sepNote}`,
                voicePrompt: `Move into the simple past using ${inf}.`,
                acceptanceCriteria: `A simple-past form of ${inf}, such as ${prat3}, is the finite verb${sep ? ` with "${sep}" at the end of the clause` : ''}.`,
                hint: `Use a form such as: er ${prat3} ...${tail}.`,
                example: `Er ${prat3} gestern${tail}.`
            },
            {
                name: 'Conditional',
                prompt: `Use Konjunktiv II Präsens with ${kII3} or würde ... ${inf}.${sepNote}`,
                voicePrompt: `Express a present hypothetical situation with ${inf} using the conditional mood.`,
                acceptanceCriteria: `The sentence expresses a present hypothetical using ${kII3} or würde with ${inf}.`,
                hint: `Use würde + ${inf}, or: er ${kII3} ...${tail}.`,
                example: `Er würde gern ${inf}.`
            },
            {
                name: 'Perfect',
                prompt: `Use Perfekt with ${conj.hilfsverb} + ${pp}.${sepNote}`,
                voicePrompt: `Create a present-perfect sentence with ${inf}.`,
                acceptanceCriteria: `A finite form of ${conj.hilfsverb} is used as the auxiliary with the participle ${pp}.`,
                hint: `Use a form such as: er ${auxPraes3} ... ${pp}.`,
                example: `Er ${auxPraes3} gestern ${pp}.`
            },
            {
                name: 'Conditional (past)',
                prompt: `Use Konjunktiv II Perfekt with ${auxKII3} + ${pp}.${sepNote}`,
                voicePrompt: `Express an unreal past situation with ${inf} using the past conditional.`,
                acceptanceCriteria: `The sentence expresses an unreal past situation with ${auxKII3} and ${pp}.`,
                hint: `Use a form such as: er ${auxKII3} ... ${pp}.`,
                example: `Er ${auxKII3} gestern ${pp}.`
            },
            {
                name: 'Subordinate Clause: dass',
                prompt: `Create a subordinate clause with dass and place the finite form of ${inf} at the end.${sepNote}`,
                voicePrompt: `Create a subordinate clause beginning with dass, and put the finite form of ${inf} at the end.`,
                acceptanceCriteria: `A dass subordinate clause is present and its finite form of ${inf} appears in clause-final position${sep ? `, with the prefix "${sep}" rejoined to the verb` : ''}.`,
                hint: `Use a form such as: Ich weiß, dass er ... ${sep}${praes3}.`,
                example: `Ich weiß, dass er morgen ${sep}${praes3}.`
            },
            {
                name: 'Subordinate Clause: weil',
                prompt: `Create a subordinate clause with weil and place the finite form of ${inf} at the end.${sepNote}`,
                voicePrompt: `Give a reason in a clause beginning with weil, and put the finite form of ${inf} at the end.`,
                acceptanceCriteria: `A weil subordinate clause is present and its finite form of ${inf} appears in clause-final position${sep ? `, with the prefix "${sep}" rejoined to the verb` : ''}.`,
                hint: `Use a form such as: ..., weil er ... ${sep}${praes3}.`,
                example: `Er ist müde, weil er heute ${sep}${praes3}.`
            },
            {
                name: 'Konjunktiv II',
                prompt: `Use ${kII3} in a present hypothetical sentence.${sepNote}`,
                voicePrompt: `Create a present hypothetical sentence using the second subjunctive of ${inf}.`,
                acceptanceCriteria: `The Konjunktiv II form ${sep}${kII3} or ${kII3} expresses a present unreal or hypothetical situation.`,
                hint: `Use a form such as: Wenn er ... ${sep}${kII3}, ...`,
                example: `Wenn er ${sep}${kII3}, wäre ich zufrieden.`
            },
            {
                name: 'Konjunktiv I',
                prompt: `Use Konjunktiv I ${kI3} in indirect speech.${sepNote}`,
                voicePrompt: `Report what another person says using the first subjunctive of ${inf} and indirect speech.`,
                acceptanceCriteria: `The form ${kI3} reports another person's statement in indirect speech.`,
                hint: `Use a form such as: Er sagt, er ${kI3} ...${tail}.`,
                example: `Er sagt, er ${kI3} morgen${tail}.`
            }
        ];

        return defs.map((def, index) => ({
            ...def,
            theme: STEP_THEMES[index][0],
            color: STEP_THEMES[index][1]
        }));
    }

    function findPreset(verb) {
        return VERB_PRESETS.find(preset => preset.verb === verb) || null;
    }

    return Object.freeze({
        SEPARABLE_PREFIXES,
        VERB_PRESETS,
        buildSteps,
        findPreset,
        getAllVerbForms,
        getConjugation
    });
}));
