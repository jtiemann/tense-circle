/**
 * Das Verb-Kreisspiel - Application Logic
 * Supports any German verb including separable (trennbare) verbs.
 */

// --- German Verb Conjugation Engine ---

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
        hilfsverb: baseConj.hilfsverb,
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

// --- Dynamic Step Generation ---

function generateSteps(_verb, conjugation) {
    const inf = conjugation.infinitive;
    const hilfs = conjugation.hilfsverb;
    const pp = conjugation.partizipII;
    const prat3 = conjugation.praeteritum.er;
    const kII3 = conjugation.konjunktivII.er;
    const kI3 = conjugation.konjunktivI.er;
    const praes3 = conjugation.praesens.er;

    const hilfsConj = getConjugation(hilfs);
    const hilfsKII3 = hilfsConj.konjunktivII.er;

    const sep = conjugation.isSeparable ? conjugation.prefix : null;

    // Hint helpers: show correct word order for separable vs non-separable
    // mainPraesHint used in subPraesHint/subWeilHint via sep+praes3 below
    const mainPratHint = sep
        ? `Er <strong>${prat3}</strong> ... <strong>${sep}</strong>.`
        : `Er <strong>${prat3}</strong> ...`;
    const mainKIIHint = sep
        ? `Er <strong>würde</strong> ... <strong>${inf}</strong>.`
        : `Er <strong>würde</strong> ... <strong>${inf}</strong>, or: Er <strong>${kII3}</strong> ...`;
    const mainKI_indirectHint = sep
        ? `Er sagt, er <strong>${kI3}</strong> ... <strong>${sep}</strong>.`
        : `Er sagt, er <strong>${kI3}</strong> ...`;
    const mainKII_wennHint = sep
        ? `Wenn er nur ... <strong>${sep}${kII3}</strong>!`
        : `Wenn er nur ... <strong>${kII3}</strong>!`;
    const subPraesHint = sep
        ? `...dass er ... <strong>${sep}${praes3}</strong>.`
        : `...dass er ... <strong>${praes3}</strong>.`;
    const subWeilHint = sep
        ? `...weil er ... <strong>${sep}${praes3}</strong>.`
        : `...weil er ... <strong>${praes3}</strong>.`;
    const separableNote = sep
        ? ` <span class="text-xs text-indigo-500 font-normal">(separable: prefix <em>${sep}-</em> goes to end in main clauses, rejoins in subclauses)</span>`
        : '';

    return [
        {
            name: "Futur I",
            prompt: `Use <strong>Futur I</strong> (werden + ${inf}) to make a prediction or future intention.${separableNote}<br><em>Hint: e.g., Er <strong>wird</strong> ... <strong>${inf}</strong>.</em>`,
            theme: "step-theme-blue", color: "#0ea5e9"
        },
        {
            name: "Modal (present)",
            prompt: `Use a <strong>present modal verb</strong> (e.g., <em>müssen, können, wollen, sollen, dürfen</em>) with <strong>'${inf}'</strong>.${separableNote}<br><em>Hint: e.g., Er <strong>muss</strong> ... <strong>${inf}</strong>.</em>`,
            theme: "step-theme-purple", color: "#9333ea"
        },
        {
            name: "Modal Past",
            prompt: `Use a <strong>modal verb in the Perfect</strong> tense with <strong>'${inf}'</strong> as infinitive.${separableNote}<br><em>Hint: e.g., Er <strong>hat</strong> ... <strong>${inf}</strong> <strong>müssen</strong>.</em>`,
            theme: "step-theme-purple", color: "#a855f7"
        },
        {
            name: "Simple Past",
            prompt: `Use the <strong>Simple Past (Präteritum)</strong> of '${inf}'.${separableNote}<br><em>Hint: e.g., ${mainPratHint}</em>`,
            theme: "step-theme-purple", color: "#c084fc"
        },
        {
            name: "Conditional",
            prompt: `Use <strong>Konjunktiv II</strong> to express a hypothetical situation.${separableNote}<br><em>Hint: e.g., ${mainKIIHint}</em>`,
            theme: "step-theme-pink", color: "#ec4899"
        },
        {
            name: "Perfect",
            prompt: `Use the <strong>Perfect (Perfekt)</strong> tense (${hilfs} + ${pp}).${separableNote}<br><em>Hint: e.g., Er <strong>${hilfsConj.praesens.er}</strong> ... <strong>${pp}</strong>.</em>`,
            theme: "step-theme-pink", color: "#f43f5e"
        },
        {
            name: "Conditional (past)",
            prompt: `Use <strong>Konjunktiv II Perfekt</strong> (${hilfsKII3} + ${pp}) — a past condition that didn't happen.${separableNote}<br><em>Hint: e.g., Er <strong>${hilfsKII3}</strong> ... <strong>${pp}</strong>.</em>`,
            theme: "step-theme-yellow", color: "#eab308"
        },
        {
            name: "Subordinate Cl. 1",
            prompt: `Create a <strong>subordinate clause</strong> (Nebensatz) with <strong>'dass'</strong>. The verb goes to the end${sep ? ' (prefix rejoins the verb)' : ''}.${separableNote}<br><em>Hint: e.g., Ich weiß, <strong>dass</strong> er ... ${subPraesHint.replace('...dass er', '')}</em>`,
            theme: "step-theme-yellow", color: "#ca8a04"
        },
        {
            name: "Subordinate Cl. 2",
            prompt: `Create a <strong>subordinate clause</strong> (Nebensatz) with <strong>'weil'</strong>. The verb goes to the end${sep ? ' (prefix rejoins the verb)' : ''}.${separableNote}<br><em>Hint: e.g., Er fragt, <strong>weil</strong> sie ... ${subWeilHint.replace('...weil er', '')}</em>`,
            theme: "step-theme-red", color: "#ef4444"
        },
        {
            name: "Konjunktiv II",
            prompt: `Use <strong>Konjunktiv II</strong> to express an unreal wish or hypothetical.${separableNote}<br><em>Hint: e.g., ${mainKII_wennHint}</em>`,
            theme: "step-theme-red", color: "#dc2626"
        },
        {
            name: "Konjunktiv I",
            prompt: `Use <strong>Konjunktiv I</strong> (indirect speech) to report what someone said.${separableNote}<br><em>Hint: e.g., ${mainKI_indirectHint}</em>`,
            theme: "step-theme-red", color: "#b91c1c"
        },
    ];
}

// --- Constants ---
const NUM_STEPS = 11;

// --- Persistence ---

const STORAGE_KEY = 'tensecircle_v1';
const PREFS_KEY = 'tensecircle_prefs';

function saveProgress() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            verb: gameState.verb,
            startSentence: gameState.startSentence,
            currentSentence: gameState.currentSentence,
            chainMode: gameState.chainMode,
            currentStepIndex: gameState.currentStepIndex,
            sentenceHistory: gameState.sentenceHistory,
            stats: gameState.stats
        }));
    } catch (e) { /* storage unavailable */ }
}

function loadProgress() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (!data.verb || !data.startSentence) return false;
        gameState.verb = data.verb;
        gameState.startSentence = data.startSentence;
        gameState.currentSentence = data.currentSentence || data.startSentence;
        gameState.chainMode = !!data.chainMode;
        gameState.currentStepIndex = Math.min(data.currentStepIndex || 0, NUM_STEPS - 1);
        gameState.sentenceHistory = data.sentenceHistory || [];
        gameState.stats = Object.assign({ attempts: 0, correct: 0, streak: 0, bestStreak: 0 }, data.stats || {});
        gameState.conjugation = getConjugation(data.verb);
        gameState.steps = generateSteps(data.verb, gameState.conjugation);
        gameState.requiredVerbForms = getAllVerbForms(gameState.conjugation);
        return true;
    } catch (e) {
        return false;
    }
}

function clearProgress() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { }
}

// User preferences (voice on/off, chain mode) — persisted independently of game progress.
function savePrefs() {
    try {
        localStorage.setItem(PREFS_KEY, JSON.stringify({
            voiceEnabled,
            chainMode: gameState.chainMode
        }));
    } catch (e) { /* storage unavailable */ }
}

function loadPrefs() {
    try {
        const raw = localStorage.getItem(PREFS_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (typeof data.voiceEnabled === 'boolean') voiceEnabled = data.voiceEnabled;
        if (typeof data.chainMode === 'boolean') gameState.chainMode = data.chainMode;
    } catch (e) { /* ignore */ }
}

// --- Voice Engine ---

const synth = (typeof window !== 'undefined' && window.speechSynthesis) || null;
const SpeechRec = (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) || null;

let voiceEnabled = true;   // speech synthesis on by default
let micActive = false;
let recognition = null;

// SVG icon strings (heroicons v1 outline, 24px)
const ICON_VOLUME_ON = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M17.95 6.05a9 9 0 010 11.9" />
</svg>`;

const ICON_VOLUME_OFF = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
</svg>`;

function speak(text) {
    if (!voiceEnabled || !synth) return;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'de-DE';
    utt.rate = 0.88;
    utt.pitch = 1;
    synth.speak(utt);
}

function buildRecognition() {
    const rec = new SpeechRec();
    rec.lang = 'de-DE';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => { micActive = true; updateMicUI(true); };

    rec.onresult = (event) => {
        let interim = '', final = '';
        for (let i = 0; i < event.results.length; i++) {
            const t = event.results[i][0].transcript;
            if (event.results[i].isFinal) final += t;
            else interim += t;
        }
        dom.sentenceInput.value = final + interim;
        dom.sentenceInput.dispatchEvent(new Event('input'));
    };

    rec.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        if (e.error === 'aborted') return; // normal during restart, not a real error
        micActive = false;
        updateMicUI(false);
        if (e.error === 'not-allowed') {
            showMessage('Microphone access was denied. Allow microphone permission in your browser, or open the app as a local file (file://) instead of via a server.', 'error');
        }
    };

    // Chrome fires onend after each pause even with continuous:true.
    // Create a fresh instance each time — Chrome won't reliably restart the same object.
    rec.onend = () => {
        if (micActive) {
            recognition = buildRecognition();
            try { recognition.start(); } catch (_) { /* ignore race condition */ }
        } else {
            updateMicUI(false);
            dom.sentenceInput.focus();
        }
    };

    return rec;
}

function startMic() {
    if (!SpeechRec) {
        showMessage('Speech recognition is not supported in this browser. Try Chrome or Edge for voice input.', 'error');
        return;
    }
    if (micActive) {
        micActive = false;
        recognition && recognition.stop();
        return;
    }
    recognition = buildRecognition();
    recognition.start();
}

function updateMicUI(active) {
    if (!dom.micBtn) return;
    dom.micBtn.classList.toggle('text-red-500', active);
    dom.micBtn.classList.toggle('text-slate-500', !active);
    dom.micBtn.classList.toggle('animate-pulse', active);
    if (dom.micLabel) dom.micLabel.textContent = active ? 'Listening…' : 'Speak';
}

function updateVoiceUI() {
    if (!dom.voiceToggleBtn) return;
    dom.voiceToggleBtn.innerHTML = voiceEnabled ? ICON_VOLUME_ON : ICON_VOLUME_OFF;
    dom.voiceToggleBtn.title = voiceEnabled ? 'Mute voice feedback' : 'Enable voice feedback';
    dom.voiceToggleBtn.classList.toggle('text-brand-500', voiceEnabled);
    dom.voiceToggleBtn.classList.toggle('text-slate-400', !voiceEnabled);
}

// --- Application State ---
let gameState = {
    verb: null,
    startSentence: null,
    currentSentence: null,  // changes in chain mode
    chainMode: false,
    conjugation: null,
    steps: [],
    requiredVerbForms: [],
    currentStepIndex: 0,
    sentenceHistory: [],
    isProcessing: false,
    chosenModal: null,
    stats: { attempts: 0, correct: 0, streak: 0, bestStreak: 0 }
};

// Tracks which sentence index is currently shown for the selected preset
let currentSentenceIndex = 0;

// --- DOM Elements ---
const dom = (typeof document === 'undefined') ? {} : {
    verbModal: document.getElementById('verb-selection-modal'),
    verbSelect: document.getElementById('verb-select'),
    customVerbGroup: document.getElementById('custom-verb-group'),
    customVerbInput: document.getElementById('custom-verb-input'),
    customSentenceInput: document.getElementById('custom-sentence-input'),
    shuffleBtn: document.getElementById('shuffle-sentence-btn'),
    sentenceHintText: document.getElementById('sentence-hint-text'),
    chainModeCheckbox: document.getElementById('chain-mode-checkbox'),
    verbStartBtn: document.getElementById('verb-start-btn'),
    verbError: document.getElementById('verb-error'),

    gameContainer: document.getElementById('game-container'),
    changeVerbBtn: document.getElementById('change-verb-btn'),
    resetBtn: document.getElementById('reset-btn'),
    chainModeBadge: document.getElementById('chain-mode-badge'),

    circleUI: document.getElementById('circle-ui'),
    orbitIndicator: document.getElementById('orbit-indicator'),
    centerVerbLabel: document.getElementById('center-verb-label'),

    progressTracker: document.getElementById('progress-tracker'),
    statScore: document.getElementById('stat-score'),
    statAccuracy: document.getElementById('stat-accuracy'),
    statStreak: document.getElementById('stat-streak'),
    statBest: document.getElementById('stat-best'),
    stepTitle: document.getElementById('current-step-title'),
    instructionText: document.getElementById('instruction-text'),
    sentenceInput: document.getElementById('sentence-input'),
    submitBtn: document.getElementById('check-button'),
    btnText: document.getElementById('button-text'),
    btnLoading: document.getElementById('button-loading'),
    messageBox: document.getElementById('message-box'),
    inputValidIcon: document.getElementById('input-validation-icon'),

    historyList: document.getElementById('history-list'),
    historyCount: document.getElementById('history-count'),
    emptyHistory: document.getElementById('empty-history'),
    historyTemplate: document.getElementById('history-item-template'),

    micBtn: document.getElementById('mic-btn'),
    micLabel: document.getElementById('mic-label'),
    voiceToggleBtn: document.getElementById('voice-toggle-btn'),
    skipStepBtn: document.getElementById('skip-step-btn')
};

// --- Initialization ---

function populateVerbDropdown() {
    const select = dom.verbSelect;
    const placeholder = select.querySelector('option[disabled]');
    const customOption = select.querySelector('option[value="custom"]');
    select.innerHTML = '';
    if (placeholder) select.appendChild(placeholder);

    const regular = VERB_PRESETS.filter(p => !getConjugation(p.verb).isSeparable);
    const separable = VERB_PRESETS.filter(p => getConjugation(p.verb).isSeparable);

    const regGroup = document.createElement('optgroup');
    regGroup.label = 'Regular & Irregular Verbs';
    regular.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.verb;
        opt.textContent = p.label;
        regGroup.appendChild(opt);
    });
    select.appendChild(regGroup);

    const sepGroup = document.createElement('optgroup');
    sepGroup.label = 'Separable Verbs (Trennbare Verben)';
    separable.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.verb;
        opt.textContent = p.label;
        sepGroup.appendChild(opt);
    });
    select.appendChild(sepGroup);

    if (customOption) select.appendChild(customOption);
}

function initApp() {
    populateVerbDropdown();
    loadPrefs();
    setupEventListeners();
    updateVoiceUI();
    // Reflect the saved chain-mode preference in the modal toggle.
    if (dom.chainModeCheckbox) dom.chainModeCheckbox.checked = gameState.chainMode;
    if (loadProgress()) {
        hideVerbModalAndStart();
    } else {
        dom.verbModal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
        dom.verbModal.classList.add('flex');
    }
}

function setupEventListeners() {
    dom.verbSelect.addEventListener('change', () => {
        const val = dom.verbSelect.value;
        dom.verbError.classList.add('hidden');
        dom.customVerbGroup.classList.toggle('hidden', val !== 'custom');

        if (val && val !== 'custom') {
            const preset = VERB_PRESETS.find(p => p.verb === val);
            if (preset) {
                currentSentenceIndex = Math.floor(Math.random() * preset.sentences.length);
                dom.customSentenceInput.value = preset.sentences[currentSentenceIndex];
                dom.shuffleBtn.classList.toggle('hidden', preset.sentences.length <= 1);
                dom.sentenceHintText.textContent = `${preset.sentences.length} example sentence${preset.sentences.length > 1 ? 's' : ''} available — edit freely or shuffle.`;
            }
        } else if (val === 'custom') {
            dom.customSentenceInput.value = '';
            dom.shuffleBtn.classList.add('hidden');
            dom.sentenceHintText.textContent = 'Write a sentence using the verb in Präsens (e.g., Ich kaufe ein neues Auto.)';
        } else {
            dom.sentenceHintText.textContent = 'Select a verb above to load example sentences.';
            dom.shuffleBtn.classList.add('hidden');
        }
    });

    dom.shuffleBtn.addEventListener('click', () => {
        const val = dom.verbSelect.value;
        if (!val || val === 'custom') return;
        const preset = VERB_PRESETS.find(p => p.verb === val);
        if (!preset || preset.sentences.length <= 1) return;
        currentSentenceIndex = (currentSentenceIndex + 1) % preset.sentences.length;
        dom.customSentenceInput.value = preset.sentences[currentSentenceIndex];
    });

    dom.verbStartBtn.addEventListener('click', () => {
        let verb, sentence;
        const val = dom.verbSelect.value;

        if (val === 'custom') {
            verb = dom.customVerbInput.value.trim().toLowerCase();
            sentence = dom.customSentenceInput.value.trim();
            if (!verb || verb.length < 2) { showVerbError("Please enter a valid German verb infinitive."); return; }
            if (!verb.endsWith('en') && !verb.endsWith('n')) {
                showVerbError("German verb infinitives end in '-en' or '-n' (e.g., kaufen, lächeln). Please check your spelling.");
                return;
            }
            if (verb.includes(' ')) { showVerbError("Enter a single verb infinitive without spaces."); return; }
        } else if (val === '') {
            showVerbError("Please select a verb.");
            return;
        } else {
            verb = val;
        }

        sentence = dom.customSentenceInput.value.trim();
        if (!sentence || sentence.length < 5) { showVerbError("Please enter a starting sentence."); return; }

        gameState.verb = verb;
        gameState.startSentence = sentence;
        gameState.currentSentence = sentence;
        gameState.chainMode = dom.chainModeCheckbox ? dom.chainModeCheckbox.checked : false;
        gameState.conjugation = getConjugation(verb);
        gameState.steps = generateSteps(verb, gameState.conjugation);
        gameState.requiredVerbForms = getAllVerbForms(gameState.conjugation);
        gameState.currentStepIndex = 0;
        gameState.sentenceHistory = [];
        gameState.chosenModal = null;
        gameState.stats = { attempts: 0, correct: 0, streak: 0, bestStreak: 0 };
        clearProgress();
        savePrefs(); // remember the chosen chain-mode setting
        hideVerbModalAndStart();
    });

    dom.changeVerbBtn.addEventListener('click', () => {
        clearProgress();
        dom.gameContainer.classList.add('hidden', 'opacity-0', 'pointer-events-none');
        dom.verbModal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
        dom.verbModal.classList.add('flex');
    });

    dom.resetBtn.addEventListener('click', () => {
        if (confirm("Reset progress for this verb?")) {
            gameState.currentStepIndex = 0;
            gameState.sentenceHistory = [];
            gameState.currentSentence = gameState.startSentence;
            gameState.chosenModal = null;
            gameState.stats = { attempts: 0, correct: 0, streak: 0, bestStreak: 0 };
            saveProgress();
            updateGameUI();
            renderHistory();
        }
    });

    dom.submitBtn.addEventListener('click', checkAnswer);

    dom.sentenceInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') checkAnswer();
    });

    dom.sentenceInput.addEventListener('input', () => {
        const val = dom.sentenceInput.value.trim();
        const valTokens = tokenize(val);
        const hasVerb = gameState.requiredVerbForms.some(f => valTokens.includes(f.toLowerCase()));
        if (val.length >= 10 && hasVerb) {
            dom.inputValidIcon.classList.remove('opacity-0');
            dom.inputValidIcon.classList.add('opacity-100');
            dom.sentenceInput.classList.remove('border-red-300');
            dom.sentenceInput.classList.add('border-brand-300', 'bg-brand-50/30');
        } else {
            dom.inputValidIcon.classList.remove('opacity-100');
            dom.inputValidIcon.classList.add('opacity-0');
            dom.sentenceInput.classList.remove('border-brand-300', 'bg-brand-50/30');
            if (val.length > 0) dom.sentenceInput.classList.add('border-red-300');
            else dom.sentenceInput.classList.remove('border-red-300');
        }
    });

    // Skip step
    if (dom.skipStepBtn) {
        dom.skipStepBtn.addEventListener('click', skipStep);
    }

    // Voice: mic button
    if (dom.micBtn) {
        dom.micBtn.addEventListener('click', startMic);
    }

    // Voice: toggle synthesis on/off
    if (dom.voiceToggleBtn) {
        dom.voiceToggleBtn.addEventListener('click', () => {
            voiceEnabled = !voiceEnabled;
            if (!voiceEnabled && synth) synth.cancel();
            updateVoiceUI();
            savePrefs();
        });
    }
}

function showVerbError(msg) {
    dom.verbError.textContent = msg;
    dom.verbError.classList.remove('hidden');
}

function hideVerbModalAndStart() {
    dom.verbModal.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        dom.verbModal.classList.add('hidden');
        dom.verbModal.classList.remove('flex');
        dom.gameContainer.classList.remove('hidden');
        setTimeout(() => {
            dom.gameContainer.classList.remove('opacity-0', 'pointer-events-none');
            dom.centerVerbLabel.textContent = gameState.verb;
            // Show chain mode badge if active
            if (dom.chainModeBadge) {
                dom.chainModeBadge.classList.toggle('hidden', !gameState.chainMode);
            }
            renderCircle();
            updateGameUI();
            renderHistory(); // restore history panel for resumed sessions
        }, 50);
    }, 300);
}

// --- UI Rendering ---

function renderCircle() {
    dom.circleUI.querySelectorAll('.step-label').forEach(el => el.remove());
    const angleInc = 360 / NUM_STEPS;
    const radius = 42;

    gameState.steps.forEach((step, i) => {
        const angle = (i * angleInc) - 90;
        const rad = angle * (Math.PI / 180);
        const x = 50 + (radius * Math.cos(rad));
        const y = 50 + (radius * Math.sin(rad));

        const el = document.createElement('div');
        el.className = `step-label ${step.theme}`;
        el.innerHTML = `<span>${i + 1}.</span> ${step.name}`;
        el.style.left = `${x}%`;
        el.style.top = `${y}%`;
        el.style.transform = `translate(-50%, -50%)`;
        el.setAttribute('data-index', i);
        el.setAttribute('data-base-transform', `translate(-50%, -50%)`);

        // Allow jumping to any step (mouse + keyboard).
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-label', `Go to step ${i + 1}: ${step.name}`);
        el.title = `Go to step ${i + 1}: ${step.name}`;
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => navigateToStep(i));
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateToStep(i); }
        });

        dom.circleUI.appendChild(el);
    });
}

// Jump directly to a step without scoring it (review / free navigation).
function navigateToStep(index) {
    if (gameState.isProcessing) return;
    if (index < 0 || index >= NUM_STEPS || index === gameState.currentStepIndex) return;
    gameState.currentStepIndex = index;
    saveProgress();
    updateGameUI();
}

function updateGameUI() {
    const currentStep = gameState.steps[gameState.currentStepIndex];

    document.querySelectorAll('.step-label').forEach((el, i) => {
        const base = el.getAttribute('data-base-transform');
        if (i === gameState.currentStepIndex) {
            el.classList.add('active');
            el.style.transform = `${base} scale(1.15)`;
            const angle = (i * (360 / NUM_STEPS)) - 90;
            dom.orbitIndicator.style.transform = `translate(-50%, -50%) rotate(${angle + 90}deg)`;
        } else {
            el.classList.remove('active');
            el.style.transform = base;
        }
        if (i < gameState.currentStepIndex && gameState.sentenceHistory.length > 0) el.style.opacity = '0.6';
        else if (i > gameState.currentStepIndex) el.style.opacity = '0.85';
    });

    dom.stepTitle.style.opacity = 0;
    setTimeout(() => {
        dom.stepTitle.textContent = `${gameState.currentStepIndex + 1}. ${currentStep.name}`;
        dom.stepTitle.style.opacity = 1;
    }, 150);

    dom.progressTracker.textContent = `Step ${gameState.currentStepIndex + 1} of ${NUM_STEPS}`;
    renderStats();

    const refSentence = gameState.currentSentence || gameState.startSentence;
    const isChained = gameState.chainMode && gameState.currentStepIndex > 0;
    const sentenceLabel = isChained ? 'Evolved sentence (chain mode):' : 'Starting sentence:';

    dom.instructionText.style.opacity = 0;
    setTimeout(() => {
        dom.instructionText.innerHTML = `
            <p class="mb-2 text-sm text-slate-500">${sentenceLabel}</p>
            <div class="bg-indigo-100/50 p-3 rounded-xl border border-indigo-200/50 mb-3 shadow-inner">
                <span class="font-bold text-slate-800 text-lg">"${refSentence}"</span>
            </div>
            <p class="font-medium text-slate-800">${currentStep.prompt}</p>
        `;
        dom.instructionText.style.opacity = 1;
        // Read the reference sentence then the instruction aloud
        speak(`${refSentence}. ${currentStep.name}.`);
    }, 150);

    dom.sentenceInput.value = '';
    dom.inputValidIcon.classList.remove('opacity-100');
    dom.inputValidIcon.classList.add('opacity-0');
    dom.sentenceInput.classList.remove('border-brand-300', 'bg-brand-50/30', 'border-red-300');
    hideMessage();
    if (window.innerWidth > 768) setTimeout(() => dom.sentenceInput.focus(), 300);
}

function renderStats() {
    const s = gameState.stats || { attempts: 0, correct: 0, streak: 0, bestStreak: 0 };
    if (dom.statScore) dom.statScore.textContent = `${s.correct}/${s.attempts}`;
    if (dom.statAccuracy) dom.statAccuracy.textContent = s.attempts ? `${Math.round((s.correct / s.attempts) * 100)}%` : '—';
    if (dom.statStreak) dom.statStreak.textContent = `${s.streak}`;
    if (dom.statBest) dom.statBest.textContent = `${s.bestStreak}`;
}

function showMessage(text, type = 'success') {
    dom.messageBox.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            ${type === 'error'
            ? '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />'
            : '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />'}
        </svg>
        <div>${text}</div>
    `;
    dom.messageBox.className = `mt-4 p-4 rounded-xl text-sm font-medium flex items-start gap-3 transition-all duration-300 transform scale-100 opacity-100 ${type === 'error' ? 'msg-error' : 'msg-success'}`;
}

function hideMessage() {
    dom.messageBox.classList.remove('scale-100', 'opacity-100');
    dom.messageBox.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        if (dom.messageBox.classList.contains('opacity-0')) dom.messageBox.className = 'hidden';
    }, 300);
}

// --- Local Validation & Model Answer Engine ---

// Splits a sentence into tokens for whole-word matching (handles umlauts)
function tokenize(str) {
    return str.toLowerCase().replace(/[.,!?;:]/g, ' ').split(/\s+/).filter(Boolean);
}

function hasToken(tokens, word) {
    return tokens.includes(word.toLowerCase());
}

function hasAnyToken(tokens, words) {
    return words.some(w => tokens.includes(w.toLowerCase()));
}

function validateStep(stepIndex, input, conjugation) {
    const tokens = tokenize(input);
    const inf = conjugation.infinitive;
    const pp = conjugation.partizipII;
    const sep = conjugation.isSeparable ? conjugation.prefix : null;

    const praesens  = Object.values(conjugation.praesens);
    const praeteritum = Object.values(conjugation.praeteritum);
    const konjII    = Object.values(conjugation.konjunktivII);
    const konjI     = Object.values(conjugation.konjunktivI);

    // Joined (subclause) forms for separable verbs
    const sepPraes  = sep ? praesens.map(f => sep + f)   : [];
    const sepPraet  = sep ? praeteritum.map(f => sep + f) : [];
    const sepKonjII = sep ? konjII.map(f => sep + f)     : [];
    const sepKonjI  = sep ? konjI.map(f => sep + f)      : [];

    const hasInf   = hasToken(tokens, inf);
    const hasPP    = hasToken(tokens, pp);
    const hasPraet = hasAnyToken(tokens, praeteritum) || hasAnyToken(tokens, sepPraet);
    const hasKII   = hasAnyToken(tokens, konjII)  || hasAnyToken(tokens, sepKonjII);
    const hasKI    = hasAnyToken(tokens, konjI)   || hasAnyToken(tokens, sepKonjI);
    const hasPraes = hasAnyToken(tokens, praesens) || hasAnyToken(tokens, sepPraes);

    const hasFutur  = hasAnyToken(tokens, ['werde','wirst','wird','werden','werdet']);
    const hasModal  = hasAnyToken(tokens, ['kann','kannst','muss','musst','will','willst','soll','sollst','darf','darfst','mag','magst','möchte','möchtest','möchten','möchtet']);
    const hasModalInf = hasAnyToken(tokens, ['können','müssen','wollen','sollen','dürfen','mögen']);
    const hasWuerde = hasAnyToken(tokens, ['würde','würdest','würden','würdet']);

    const hilfsConj   = getConjugation(conjugation.hilfsverb);
    const hPraesForms = Object.values(hilfsConj.praesens);
    const hKIIForms   = Object.values(hilfsConj.konjunktivII);
    const hasHilfs    = hasAnyToken(tokens, hPraesForms);
    const hasHilfsKII = hasAnyToken(tokens, hKIIForms);

    switch (stepIndex) {
        case 0: { // Futur I
            if (!hasFutur)
                return { valid: false, error: `Use a form of 'werden' (werde/wird/werden…) for Futur I.` };
            if (!hasInf)
                return { valid: false, error: `Place the infinitive '${inf}' at the end of the clause.` };
            if (tokens.filter(t => t === inf.toLowerCase()).length > 1)
                return { valid: false, error: `'${inf}' appears more than once. In Futur I it belongs only at the very end — remove the extra copy.` };
            if (!tokens.slice(-2).includes(inf.toLowerCase()))
                return { valid: false, error: `In Futur I, the infinitive '${inf}' must be the last word. Move it to the end.` };
            return { valid: true };
        }

        case 1: { // Modal present
            if (!hasModal)
                return { valid: false, error: `Include a present modal verb (muss/kann/will/soll/darf/mag).` };
            if (!hasInf)
                return { valid: false, error: `Place the infinitive '${inf}' at the end of the clause.` };
            if (tokens.filter(t => t === inf.toLowerCase()).length > 1)
                return { valid: false, error: `'${inf}' appears more than once. With a modal verb it belongs only at the very end — remove the extra copy.` };
            if (!tokens.slice(-2).includes(inf.toLowerCase()))
                return { valid: false, error: `With a modal verb, the infinitive '${inf}' must be the last word. Move it to the end.` };
            return { valid: true };
        }

        case 2: // Modal past (modal perfect)
            if (!hasHilfs)
                return { valid: false, error: `Use '${conjugation.hilfsverb}' as the auxiliary verb.` };
            if (!hasInf)
                return { valid: false, error: `Include the main verb infinitive '${inf}'.` };
            if (!hasModalInf)
                return { valid: false, error: `End the clause with a modal infinitive (können/müssen/wollen/sollen/dürfen).` };
            return { valid: true };

        case 3: // Simple past
            if (!hasPraet)
                return { valid: false, error: `Use the Präteritum form of '${inf}'.${sep ? ` (e.g., "… ${conjugation.praeteritum.er} … ${sep}.")` : ''}` };
            return { valid: true };

        case 4: { // Conditional
            if (!hasWuerde && !hasKII)
                return { valid: false, error: `Use 'würde + ${inf}' or a Konjunktiv II form of '${inf}'.` };
            if (hasWuerde && !hasInf)
                return { valid: false, error: `When using 'würde', place the infinitive '${inf}' at the end.` };
            if (hasWuerde && !tokens.slice(-2).includes(inf.toLowerCase()))
                return { valid: false, error: `With 'würde', the infinitive '${inf}' must be the last word. Move it to the end.` };
            return { valid: true };
        }

        case 5: // Perfect
            if (!hasHilfs)
                return { valid: false, error: `Use '${conjugation.hilfsverb}' as the auxiliary verb for Perfekt.` };
            if (!hasPP)
                return { valid: false, error: `Use the Partizip II '${pp}' at the end of the clause.` };
            return { valid: true };

        case 6: // Conditional past
            if (!hasHilfsKII)
                return { valid: false, error: `Use Konjunktiv II of '${conjugation.hilfsverb}' (${hilfsConj.konjunktivII.er}).` };
            if (!hasPP)
                return { valid: false, error: `Include the Partizip II '${pp}'.` };
            return { valid: true };

        case 7: { // Subordinate dass
            if (!hasToken(tokens, 'dass'))
                return { valid: false, error: `Your sentence must include the conjunction 'dass'.` };
            const dassPos = input.toLowerCase().indexOf('dass');
            const afterDassTokens = tokenize(input.slice(dassPos + 4));
            const verbForms7 = [...praesens, ...sepPraes];
            if (!afterDassTokens.some(t => verbForms7.includes(t)))
                return { valid: false, error: `In the dass-clause the verb goes to the end${sep ? ` (rejoined: ${sep}${conjugation.praesens.er})` : ''}.` };
            const last27 = afterDassTokens.slice(-2);
            if (!last27.some(t => verbForms7.includes(t)))
                return { valid: false, error: `In a dass-clause, the verb must come at the very end. Move '${sep ? sep + conjugation.praesens.er : conjugation.praesens.er}' to the end of the clause.` };
            return { valid: true };
        }

        case 8: { // Subordinate weil
            if (!hasToken(tokens, 'weil'))
                return { valid: false, error: `Your sentence must include the conjunction 'weil'.` };
            const weilPos = input.toLowerCase().indexOf('weil');
            const afterWeilTokens = tokenize(input.slice(weilPos + 4));
            const verbForms8 = [...praesens, ...sepPraes];
            if (!afterWeilTokens.some(t => verbForms8.includes(t)))
                return { valid: false, error: `In the weil-clause the verb goes to the end${sep ? ` (rejoined: ${sep}${conjugation.praesens.er})` : ''}.` };
            const last28 = afterWeilTokens.slice(-2);
            if (!last28.some(t => verbForms8.includes(t)))
                return { valid: false, error: `In a weil-clause, the verb must come at the very end. Move '${sep ? sep + conjugation.praesens.er : conjugation.praesens.er}' to the end of the clause.` };
            return { valid: true };
        }

        case 9: // Konjunktiv II — unreal wish (distinct from the plain Conditional in step 5)
            if (!hasKII && !hasWuerde)
                return { valid: false, error: `Use the Konjunktiv II form of '${inf}' or 'würde + ${inf}'.` };
            if (!hasToken(tokens, 'wenn'))
                return { valid: false, error: `For an unreal wish, frame it with 'wenn' (e.g., "Wenn er nur ... ${conjugation.konjunktivII.er}!"). This is what sets this step apart from the plain Conditional.` };
            return { valid: true };

        case 10: // Konjunktiv I
            if (!hasKI)
                return { valid: false, error: `Use the Konjunktiv I form of '${inf}' (${conjugation.konjunktivI.er}) for indirect speech.` };
            return { valid: true };

        default:
            return { valid: true };
    }
}

// Parse starting sentence into { subject, conKey, payload }.
// Locates the actual finite verb (rather than assuming it is the 2nd word) so that
// multi-word subjects ("Der Apfel", "Die Kinder") and separable verbs are handled
// correctly. e.g.:
//   "Ich lerne Deutsch jeden Tag."  → { subject: 'Ich',       conKey: 'ich', payload: 'Deutsch jeden Tag' }
//   "Der Apfel fällt vom Baum."     → { subject: 'Der Apfel', conKey: 'er',  payload: 'vom Baum' }
//   "Ich mache die Tür auf."        → { subject: 'Ich',       conKey: 'ich', payload: 'die Tür' }  (prefix stripped)
function parseStartingSentence(sentence, conjugation) {
    const norm = w => w.toLowerCase().replace(/[.,!?;:]/g, '');
    const clean = sentence.replace(/[.!?]+$/, '').trim();
    const words = clean.split(/\s+/);

    const praes = (conjugation && conjugation.praesens) || {};
    const praesForms = Object.values(praes).map(f => f.toLowerCase());
    const sep = conjugation && conjugation.isSeparable ? conjugation.prefix : null;

    // Find the finite verb: first token that matches a present-tense form of the verb.
    let verbIdx = words.findIndex(w => praesForms.includes(norm(w)));
    if (verbIdx === -1) verbIdx = Math.min(1, Math.max(0, words.length - 1)); // fallback: assume V2

    const subject = words.slice(0, verbIdx).join(' ') || 'Er';
    let payloadWords = words.slice(verbIdx + 1);

    // Separable verb: the trailing prefix particle rejoins the verb in every transformed
    // form, so remove it from the payload to avoid duplicating/orphaning it.
    if (sep && payloadWords.length && norm(payloadWords[payloadWords.length - 1]) === sep.toLowerCase()) {
        payloadWords = payloadWords.slice(0, -1);
    }
    const payload = payloadWords.join(' ');

    // Determine person/number from the subject; for noun subjects, infer number from the verb form.
    const s = subject.toLowerCase();
    let conKey;
    if (s === 'ich') conKey = 'ich';
    else if (s === 'du') conKey = 'du';
    else if (s === 'wir') conKey = 'wir';
    else if (s === 'ihr') conKey = 'ihr';
    else if (s === 'sie') conKey = 'sie';
    else if (s === 'er' || s === 'es') conKey = 'er';
    else {
        const matched = words[verbIdx] ? norm(words[verbIdx]) : null;
        const erForm = (praes.er || '').toLowerCase();
        const sieForm = (praes.sie || '').toLowerCase();
        // Plural noun (e.g., "Die Kinder lernen") matches the sie/plural form, not the er form.
        conKey = (matched && matched === sieForm && matched !== erForm) ? 'sie' : 'er';
    }
    return { subject, conKey, payload };
}

function buildModelAnswer(stepIndex, startSentence, conjugation, chosenModal) {
    const { subject, conKey, payload } = parseStartingSentence(startSentence, conjugation);
    const inf  = conjugation.infinitive;
    const pp   = conjugation.partizipII;
    const sep  = conjugation.isSeparable ? conjugation.prefix : null;

    const praes = conjugation.praesens[conKey];
    const prat  = conjugation.praeteritum[conKey];
    const kII   = conjugation.konjunktivII[conKey];
    const kI    = conjugation.konjunktivI[conKey];

    const hilfsConj = getConjugation(conjugation.hilfsverb);
    const hPraes    = hilfsConj.praesens[conKey];
    const hKII      = hilfsConj.konjunktivII[conKey];

    const werdenConj = getConjugation('werden');
    const wird  = werdenConj.praesens[conKey];
    const würde = werdenConj.konjunktivII[conKey];

    const p = payload ? ' ' + payload : '';
    const subL = subject.charAt(0).toLowerCase() + subject.slice(1);

    switch (stepIndex) {
        case 0:  return `${subject} ${wird}${p} ${inf}.`;
        case 1:  return `${subject} muss${p} ${inf}.`;
        case 2: { const modalInf = chosenModal || 'müssen'; return `${subject} ${hPraes}${p} ${inf} ${modalInf}.`; }
        case 3:  return sep ? `${subject} ${prat}${p} ${sep}.` : `${subject} ${prat}${p}.`;
        case 4:  return `${subject} ${würde}${p} ${inf}.`;
        case 5:  return `${subject} ${hPraes}${p} ${pp}.`;
        case 6:  return `${subject} ${hKII}${p} ${pp}.`;
        case 7:  return sep
            ? `Ich weiß, dass ${subL}${p} ${sep}${praes}.`
            : `Ich weiß, dass ${subL}${p} ${praes}.`;
        case 8:  return sep
            ? `${subject} fragt, weil ${subL}${p} ${sep}${praes}.`
            : `${subject} fragt, weil ${subL}${p} ${praes}.`;
        case 9:  return sep
            ? `Wenn ${subL} nur${p} ${sep}${kII}!`
            : `Wenn ${subL} nur${p} ${kII}!`;
        case 10: return sep
            ? `${subject} sagt, ${subL} ${kI}${p} ${sep}.`
            : `${subject} sagt, ${subL} ${kI}${p}.`;
        default: return '';
    }
}

// --- Core Logic ---

function skipStep() {
    if (gameState.isProcessing) return;
    const currentStep = gameState.steps[gameState.currentStepIndex];
    const refSentence = gameState.currentSentence || gameState.startSentence;
    const modelAnswer = buildModelAnswer(gameState.currentStepIndex, refSentence, gameState.conjugation, gameState.chosenModal);

    setTimeout(() => speak(modelAnswer), 200);

    gameState.sentenceHistory.unshift({
        stepName: currentStep.name + ' (skipped)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userText: '—',
        idealText: modelAnswer,
        themeColor: currentStep.theme
    });

    if (gameState.chainMode) gameState.currentSentence = modelAnswer;
    if (gameState.currentStepIndex === 1) gameState.chosenModal = null;

    gameState.currentStepIndex++;
    const circleComplete = gameState.currentStepIndex >= NUM_STEPS;
    if (circleComplete) {
        gameState.currentStepIndex = 0;
        gameState.currentSentence = gameState.startSentence;
        gameState.chosenModal = null;
        clearProgress();
    } else {
        saveProgress();
    }

    renderHistory();
    updateGameUI();
    if (circleComplete) {
        showMessage("Herzlichen Glückwunsch! You've completed the full verb circle! Starting again from step 1.");
    }
}

function checkAnswer() {
    if (gameState.isProcessing) return;
    const input = dom.sentenceInput.value.trim();
    const currentStep = gameState.steps[gameState.currentStepIndex];

    if (input.length < 10) {
        showMessage("Sentence is too short. Please write a complete German sentence.", "error");
        dom.sentenceInput.focus(); return;
    }

    const inputTokens = tokenize(input);
    const hasVerb = gameState.requiredVerbForms.some(f => inputTokens.includes(f.toLowerCase()));
    if (!hasVerb) {
        showMessage(`Your sentence must contain a form of '${gameState.verb}'.`, "error");
        dom.sentenceInput.focus(); return;
    }

    hideMessage();
    gameState.isProcessing = true;
    dom.submitBtn.disabled = true;

    try {
        const result = validateStep(gameState.currentStepIndex, input, gameState.conjugation);

        // Record the attempt and update the streak.
        gameState.stats.attempts++;
        if (result.valid) {
            gameState.stats.correct++;
            gameState.stats.streak++;
            gameState.stats.bestStreak = Math.max(gameState.stats.bestStreak, gameState.stats.streak);
        } else {
            gameState.stats.streak = 0;
        }

        if (!result.valid) {
            showMessage(result.error, "error");
            renderStats();
            saveProgress();
            return;
        }

        // Track which modal the learner used in step 1 so step 2 can reflect it
        if (gameState.currentStepIndex === 1) {
            const modalMap = {
                'kann': 'können', 'kannst': 'können',
                'muss': 'müssen', 'musst': 'müssen',
                'will': 'wollen', 'willst': 'wollen',
                'soll': 'sollen', 'sollst': 'sollen',
                'darf': 'dürfen', 'darfst': 'dürfen',
                'mag': 'mögen', 'magst': 'mögen',
                'möchte': 'mögen', 'möchtest': 'mögen', 'möchten': 'mögen', 'möchtet': 'mögen'
            };
            const inputTokens = tokenize(input);
            for (const token of inputTokens) {
                if (modalMap[token]) { gameState.chosenModal = modalMap[token]; break; }
            }
        }

        const refSentence = gameState.currentSentence || gameState.startSentence;
        const modelAnswer = buildModelAnswer(gameState.currentStepIndex, refSentence, gameState.conjugation, gameState.chosenModal);

        // Read the model answer aloud after a short delay
        setTimeout(() => speak(modelAnswer), 400);

        gameState.sentenceHistory.unshift({
            stepName: currentStep.name,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            userText: input,
            idealText: modelAnswer,
            themeColor: currentStep.theme
        });

        // In chain mode, evolve the reference sentence
        if (gameState.chainMode) {
            gameState.currentSentence = modelAnswer;
        }

        showMessage(`Step ${gameState.currentStepIndex + 1} complete! Compare your answer with the model below.`);
        renderHistory();
        gameState.currentStepIndex++;

        const circleComplete = gameState.currentStepIndex >= NUM_STEPS;
        if (circleComplete) {
            gameState.currentStepIndex = 0;
            gameState.currentSentence = gameState.startSentence;
            gameState.chosenModal = null;
            clearProgress();
        } else {
            saveProgress();
        }
        updateGameUI();
        if (circleComplete) {
            showMessage("Herzlichen Glückwunsch! You've completed the full verb circle! Starting again from step 1.");
        }
    } catch (err) {
        console.error('checkAnswer error:', err);
        showMessage("Something went wrong. Please try again.", "error");
    } finally {
        dom.submitBtn.disabled = false;
        gameState.isProcessing = false;
    }
}

// --- History Rendering ---

function renderHistory() {
    if (gameState.sentenceHistory.length === 0) { dom.emptyHistory.classList.remove('hidden'); return; }
    dom.emptyHistory.classList.add('hidden');
    dom.historyCount.textContent = `${gameState.sentenceHistory.length} Sentences`;
    dom.historyList.innerHTML = '';

    gameState.sentenceHistory.forEach(item => {
        const node = dom.historyTemplate.content.cloneNode(true);
        const container = node.querySelector('.history-item');
        container.querySelector('.step-name').textContent = item.stepName;
        container.querySelector('.timestamp').textContent = item.timestamp;
        container.querySelector('.user-text').textContent = item.userText;

        // No AI correction — hide that block
        container.querySelector('.correction-block').classList.add('hidden');

        container.querySelector('.ideal-text').textContent = item.idealText;
        container.querySelector('.translation-text').textContent = `Model answer for step: ${item.stepName}`;
        dom.historyList.appendChild(container);
    });
}

// Boot (browser only)
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initApp);
}

// Export pure logic for Node-based unit tests (no-op in the browser).
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getConjugation,
        conjugateRegular,
        getSeparableInfo,
        getAllVerbForms,
        generateSteps,
        tokenize,
        validateStep,
        parseStartingSentence,
        buildModelAnswer,
        VERB_PRESETS,
        IRREGULAR_VERBS,
        NUM_STEPS,
    };
}
