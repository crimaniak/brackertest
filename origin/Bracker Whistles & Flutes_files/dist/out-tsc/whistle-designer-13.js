"use strict";
//whistle-designer-13.js
const temperCent = 2 ** (1.0 / 1200); // = 1.00057778950655;
// Global variable definitions for flute calculations
// inputs
let holeCount = 7; // Number of flute finger holes
//var
let Df = new Array(10); // finger hole diameters
let Demb1; // embouchure hole diameter
let Demb2; // embouchure hole diameter
let Bore; //inside diameter of tube
let Wall; // wall thickness of tube
//var OuterDiam;
let Calib; // calibration frequency of middle A (440)
let Intonation = 'just';
let Vsound; // velocity of sound
let Ff = new Array(10); // finger hole note frequencies
let Fend; // all-holes-closed end-of-flute frequency
// raw results (distances from "beginning of air column" which is actually undefined)
let Xend; // effective location of end of flute
let Cend; //end correction
let Cclosed; //closed hole correction
let Xorg; //uncorrected length
let Xf = new Array(10); // location of finger holes
let Xemb; // location of embouchure
let TipLength; // extra length from emb hole to top end, for overall length
let EndEfFactor;
//-----------------------------------------------------------------------------------
// effective wall thickness, i.e. height of air column at open finger holes;
// air column extends out past end of hole 3/4 of the hole diameter
function te(n) {
    return (1.0 * Wall) + (0.75 * Df[n]);
}
//-----------------------------------------------------------------------------------
function holeK(n) {
    return (Df[n] / Bore) ** 2;
}
function round(value, R) {
    return Math.round(R * value) / R;
}
function sqRoot(a, b, c) {
    return (-b - Math.sqrt((b * b) - 4 * a * c)) / (2 * a);
}
// Closed hole for tone hole n.  The length of the vibrating air column is
// effectively increased by each closed tone hole which exists above the
// first open tone hole. Corrections must be added for each such closed tone
// tone hole to C_end, C_s, and C_o.
function C_c(n) {
    return 0.25 * Wall * holeK(n);
}
// Calculates the distance from physical open end of flute to effective end of
// vibrating air column.  The vibrating air column ends beyond the end of the
// flute and C_end is always positive. NOTE: Closed hole corrections must be added to
// this value!
function C_end() {
    return EndEfFactor * Bore;
}
// Calculates the effective distance from the first ("single") tone hole to
// the end of the vibrating air column when only that hole is open.
// NOTE: closed hole corrections must be added to this value!
function C_s() {
    return te(1) / (holeK(1) + te(1) / (Xend - Xf[1]));
}
// Calculates the effective distance from the second and subsequent tone holes
// to the end of the vibrating air column when all holes below are open.
// NOTE: closed hole corrections must be added to this value!
// NOTE: the value of this correction is invalid if the frequency of the note
// played is above the cutoff frequency f_c.
function C_o(n) {
    return ((Xf[n - 1] - Xf[n]) / 2) * (Math.sqrt(1 + 4 * (te(n) / ((Xf[n - 1] - Xf[n])) * holeK(n))) - 1);
}
// end correction for embouchure opening/ whistle window
function C_emb() {
    const Le = document.forms.fluteForm.embWall.value;
    const Bd = (Bore * Bore) / (Demb1 * Demb2);
    const De = Demb1 / 2 + Demb2 / 2;
    if (document.forms.fluteForm.design.selectedIndex == 0) {
        //alert("Whistle");
        return Bd * (1 * Le + 0.3 * De);
    }
    else {
        //alert("Flute");
        return Bd * 11.5 * Le * De / (1 * Bore + 2 * Le);
    }
}
// Calculates the cutoff frequency above which the open hole correction
// is not valid.  Instrument should be designed so that all second register
// notes are well below this frequency.
function f_c(n) {
    let s;
    if (Df[n] == 0)
        return 0;
    if (n == holeCount)
        s = Xend - Xf[holeCount];
    else {
        if (Df[n + 1] > 0)
            s = Xf[n + 1] - Xf[n];
        else
            s = Xf[n + 2] - Xf[n];
    }
    let a = Vsound / 2 / Math.PI * Df[n] / Bore / Math.sqrt(te(n) * s);
    return a / Ff[n];
}
// Calculates hole locations, measured from bottom end, successively
// This is a non-iterative procedure using quadratic solutions of the Benade equations.
function CalculateHoleDistances() {
    let a, b, c, i, L, holeNum, K;
    //Vsound calculated dependent on air temp
    Vsound = 20055 * Math.sqrt(1 * document.forms.fluteForm.tempC.value + 270.15);
    // find end location...
    Xorg = Vsound * 0.5 / Fend; // uncorrected location
    Cend = C_end(); //get end correction
    Xend = Xorg - Cend; // subtract end correction
    Cclosed = 0;
    for (i = 1; i <= holeCount; i++)
        Cclosed = Cclosed + C_c(i);
    for (i = 1; i <= holeCount; i++)
        Xend = Xend - C_c(i); // subtract closed hole corrections
    //alert("Xend="+Xend)
    // find first hole (from end) location
    L = Vsound * 0.5 / Ff[holeCount];
    for (i = 2; i <= holeCount; i++)
        L = L - C_c(i - 1); // subtract closed hole corrections
    a = holeK(holeCount);
    if (Df[holeCount] == 0)
        Xf[holeCount] = Xend;
    else {
        b = -(Xend + L) * holeK(holeCount);
        c = Xend * L * holeK(holeCount) + te(holeCount) * (L - Xend);
        Xf[holeCount] = sqRoot(a, b, c);
    }
    // find subsequent finger hole locations
    if (holeCount >= 2)
        for (holeNum = holeCount - 1; holeNum > 0; holeNum--) {
            if (Df[holeNum] == 0) {
                Xf[holeNum] = Xf[holeNum + 1];
                continue;
            }
            L = Vsound * 0.5 / Ff[holeNum];
            if (holeNum > 1 && holeNum <= holeCount)
                for (i = 1; i < holeNum; i++)
                    L = L - C_c(i);
            a = 2;
            if (holeNum == 1) { // L1 hole calculated with thumb hole closed
                b = -Xf[holeNum + 2] - 3 * L + te(holeNum) / holeK(holeNum);
                c = Xf[holeNum + 2] * (L - te(holeNum) / holeK(holeNum)) + (L * L);
            }
            else {
                b = -Xf[holeNum + 1] - 3 * L + te(holeNum) / holeK(holeNum);
                c = Xf[holeNum + 1] * (L - te(holeNum) / holeK(holeNum)) + (L * L);
            }
            Xf[holeNum] = sqRoot(a, b, c);
        }
    Xemb = C_emb();
}
//setting initial hole diameters relative to bore size
//called by changes in OD and wall
function HoleInit() {
    //imperial conversion factor
    let C = 1;
    let fluteForm = document.forms.fluteForm;
    //if(document.forms.fluteForm.convert.selectedIndex==1)
    //   C = 25.4;
    Wall = C * fluteForm.wall.value;
    Bore = parseFloat(C * fluteForm.OuterDiam.value) - 2 * parseFloat(Wall);
    fluteForm.embWall.value = round(Bore * 0.16, 10) / C;
    fluteForm.diamEmb1.value = round(Bore * 0.31, 10) / C;
    fluteForm.diamEmb2.value = round(Bore * 0.62, 10) / C;
    fluteForm.diam1.value = round(Bore * 0.39, 2) / C;
    fluteForm.diam2.value = round(Bore * 0.36, 2) / C;
    fluteForm.diam3.value = round(Bore * 0.46, 2) / C;
    fluteForm.diam4.value = round(Bore * 0.43, 2) / C;
    fluteForm.diam5.value = round(Bore * 0.36, 2) / C;
    fluteForm.diam6.value = round(Bore * 0.57, 2) / C;
    fluteForm.diam7.value = round(Bore * 0.54, 2) / C;
    Calculate();
}
//-----------------------------------------------------------------------------------
// setting tube diameter and wall thickness according to change in key
function TubeChange(key) {
    let K, R, OD, index;
    let fluteForm = document.forms.fluteForm;
    //K = inches conversion factor, R = rounding factor for output
    if (fluteForm.convert.selectedIndex == 0) {
        K = 1;
        R = 10;
    }
    else {
        K = 25.4;
        R = 1000;
    }
    const indexes = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 6, 6, 8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 12, 12, 12, 12, 13, 13, 13, 14, 14, 14, 14];
    index = indexes[key];
    //index  0   1   2   3   4     5    6	   7    8     9    10    11  12  13  14
    if (K == 1) {
        OD = new Array(12, 13, 14, 15, 16, 16.6, 18, 19, 20, 22.2, 25.4, 28, 30, 32, 35);
    }
    else {
        OD = new Array(15 / 32, 1 / 2, 9 / 16, 19 / 32, 5 / 8, 21 / 32, 11 / 16, 3 / 4, 13 / 16, 7 / 8, 1, 9 / 8, 5 / 4, 11 / 8, 3 / 2);
    }
    const WL = new Array(1, 1, 1, 1, 1, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1, 1, 1.2, 1.2);
    fluteForm.OuterDiam.value = round(OD[index], R);
    fluteForm.wall.value = Wall = (K == 1 ? round(1 / K * WL[index], R) : round(3 / 64, R));
    Bore = parseFloat(K * fluteForm.OuterDiam.value) - 2 * Wall;
    //Bore = Math.round(100*Bore)/100;
    fluteForm.embWall.value = 2 * Wall;
    fluteForm.diamEmb1.value = round(Bore * 0.32 / K, R);
    fluteForm.diamEmb2.value = round(Bore * 0.57 / K, R);
    fluteForm.diam1.value = round(Bore * 0.39 / K, R);
    fluteForm.diam2.value = round(Bore * 0.39 / K, R);
    fluteForm.diam3.value = round(Bore * 0.46 / K, R);
    fluteForm.diam4.value = round(Bore * 0.43 / K, R);
    fluteForm.diam5.value = round(Bore * 0.36 / K, R);
    fluteForm.diam6.value = round(Bore * 0.57 / K, R);
    fluteForm.diam7.value = round(Bore * 0.50 / K, R);
}
//-----------------------------------------------------------------------------------
// sets input frequencies according to key and intonation choosen
// sets tube size
// goes on to Calculate()
function KeyChange(key) {
    let fluteForm = document.forms.fluteForm;
    key = fluteForm.key.selectedIndex;
    Calib = fluteForm.calib.value;
    let keyMidiCode = 68 - key;
    fluteForm.key2.value = fluteForm.key.value;
    let intn = fluteForm.intonation;
    if (intn.selectedIndex == 0)
        Intonation = 'Just';
    if (intn.selectedIndex == 1)
        Intonation = 'HB-trad';
    //if (int.selectedIndex==2) Intonation = 'HB-2';
    if (intn.selectedIndex == 2)
        Intonation = 'ET';
    // intonation arrays
    const ME = new Array(11, 10, 9, 7, 5, 4, 2, 0); //ET
    const MJ = new Array(15 / 8, 16 / 9, 5 / 3, 3 / 2, 4 / 3, 5 / 4, 9 / 8, 1); //just
    const MH1 = new Array(1.866066, 1.777778, 1.679720, 1.498380, 1.333333, 1.254890, 1.123790, 1); //HB-trad
    //MH2 = new Array( 1.876554, 1.781883, 1.686872, 1.500936, 1.332539, 1.254890, 1.126511, 1 ); //HB-2
    let Fi = new Array(8);
    for (let i = 1; i <= holeCount + 1; i++) {
        if (Intonation == "Just")
            Fi[i] = MidiCodeToFreq(keyMidiCode) * MJ[i - 1];
        else if (Intonation == "HB-trad")
            Fi[i] = MidiCodeToFreq(keyMidiCode) * MH1[i - 1];
        //else if(Intonation=="HB-2")
        //	Fi[i] = MidiCodeToFreq(keyMidiCode)*MH2[i-1];
        else if (Intonation == "ET")
            Fi[i] = MidiCodeToFreq(keyMidiCode + ME[i - 1]);
    }
    fluteForm.freq1.value = round(Fi[1], 10);
    fluteForm.freq2.value = round(Fi[2], 10);
    fluteForm.freq3.value = round(Fi[3], 10);
    fluteForm.freq4.value = round(Fi[4], 10);
    fluteForm.freq5.value = round(Fi[5], 10);
    fluteForm.freq6.value = round(Fi[6], 10);
    fluteForm.freq7.value = round(Fi[7], 10);
    fluteForm.freqEnd.value = round(Fi[8], 10);
    // set initial tube and hole sizes 
    TubeChange(key);
    // calculate hole locations, spacings etc
    Calculate();
}
//----------------------------------------------------------------------------------
// converts midicode to equal temperament frequency (midicode for A4=440Hz is 57)
function MidiCodeToFreq(midiCode) {
    return Calib * Math.pow(Math.pow(2.0, 1.0 / 12.0), midiCode - 57);
}
//-----------------------------------------------------------------------------------
// difference of freq in cents to nearest ET note acc. to base calibration
function CentsDiff(f) {
    let cv = 12 * 1.442741049 * Math.log(f / Calib);
    cv = 100 * (cv - Math.round(cv));
    cv = Math.round(cv);
    if (cv < 0) {
        cv = -1 * cv;
        return '-' + cv.toString();
    }
    if (cv > 0)
        return '+' + cv.toString();
    return '0';
}
//----------------------------------------------------------------------------------
// raise frequncy in input by set amounts
function RaiseFreq(f) {
    return round(f * temperCent, 10); //1 cent steps
}
//----------------------------------------------------------------------------------
// lower frequncy in input by set amounts
function LowerFreq(f) {
    return round(f / temperCent, 10); //1 cent steps
}
//----------------------------------------------------------------------------------
// find the note name to a given frequency (based on ET)
function Freq2Note(f) {
    const a = Calib / 1.0293; //50 cents  lower than calibration A (default A=440)
    const b = Calib * 1.0293; //50 cents  higher than calibration A (default A=440)
    const Nn = new Array("A", "Bb", "B", "C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#");
    if (f < a / 4)
        f = f * 8;
    else if (f < a / 2)
        f = f * 4;
    else if (f < a)
        f = f * 2;
    else if (f > 2 * a)
        f = f / 2;
    else if (f > 4 * a)
        f = f / 2;
    for (let c = 0; c < 12; c++) {
        let d = Math.pow(2, c / 12);
        if (f > a * d && f < b * d)
            return Nn[c];
    }
    return '?';
}
//----------------------------------------------------------------------------------
//increase hole diam (+ button)
function IncrDiam(d) {
    //for mm
    let y = 0.1; //increase by 0.1mm
    //for inches
    if (document.forms.fluteForm.convert.selectedIndex == 1)
        y = 0.01; //increase by 0.01"
    return round(1 * d + y, 100);
}
//decrease hole diam (- button)
function DecrDiam(d) {
    //for mm
    let y = 0.25; //decrease by 0.5mm
    //for inches
    if (document.forms.fluteForm.convert.selectedIndex == 1)
        y = 0.01; //decrease by 0.01"
    return round(d - y, 1000);
}
// convert Centigrade to Fahrenheit temperature, and vice versa.
function Temp(t) {
    document.fluteForm.tempC.value = t;
    document.fluteForm.tempF.value = t * 9 / 5 - (-1) * 32;
    Calculate();
}
// calculate slide length for a given variation in cents,
// calculated with the base note frequency.
function Slide() {
    const cents = document.fluteForm.slideCents.value;
    const f = Fend * Math.pow(2, cents / 1200);
    const slide = Vsound * 0.5 / Fend - Vsound * 0.5 / f;
    //K = inches conversion factor, R = rounding factor for output
    let K, R, Unit;
    if (document.forms.fluteForm.convert.selectedIndex == 0) {
        K = 1;
        R = 10;
        Unit = 'mm';
    }
    else {
        K = 25.4;
        R = 1000;
        Unit = '"';
    }
    document.fluteForm.slideLength.value = round(slide / K, R) + Unit;
}
// This function does the gruntwork of getting input, calling the calculation routine,
// and delivering the results
function Calculate() {
    let K, R, U;
    //imperial conversion factor
    //values are shown either metric [mm] or imperial [inches]
    //calculator should handle values internally in mm only, as variables
    //and convert if needed to imperial as output.
    let fluteForm = document.forms.fluteForm;
    //K = inches conversion factor, R = rounding factor for output
    if (document.forms.fluteForm.convert.selectedIndex == 0) {
        K = 1;
        R = 10;
        U = '';
    }
    else {
        K = 25.4;
        R = 1000;
        U = '"';
    }
    // get input data from form fields
    TipLength = K * fluteForm.tipLength.value;
    EndEfFactor = fluteForm.endEfFactor.value;
    Calib = fluteForm.calib.value;
    Wall = K * fluteForm.wall.value;
    Bore = parseFloat(K * fluteForm.OuterDiam.value) - 2 * parseFloat(Wall);
    Demb1 = K * fluteForm.diamEmb1.value;
    Demb2 = K * fluteForm.diamEmb2.value;
    Df[1] = K * fluteForm.diam1.value;
    Df[2] = K * fluteForm.diam2.value;
    Df[3] = K * fluteForm.diam3.value;
    Df[4] = K * fluteForm.diam4.value;
    Df[5] = K * fluteForm.diam5.value;
    Df[6] = K * fluteForm.diam6.value;
    Df[7] = K * fluteForm.diam7.value;
    Ff[1] = fluteForm.freq1.value;
    if (Ff[1] == 0)
        Df[1] = 0;
    Ff[2] = fluteForm.freq2.value;
    if (Ff[2] == 0)
        Df[2] = 0;
    Ff[3] = fluteForm.freq3.value;
    if (Ff[3] == 0)
        Df[3] = 0;
    Ff[4] = fluteForm.freq4.value;
    if (Ff[4] == 0)
        Df[4] = 0;
    Ff[5] = fluteForm.freq5.value;
    if (Ff[5] == 0)
        Df[5] = 0;
    Ff[6] = fluteForm.freq6.value;
    if (Ff[6] == 0)
        Df[6] = 0;
    Ff[7] = fluteForm.freq7.value;
    if (Ff[7] == 0)
        Df[7] = 0;
    Fend = 1 * fluteForm.freqEnd.value;
    // perform calculations, all values need to be in mm
    CalculateHoleDistances();
    //draw graphic
    DrawWhistle();
    // output to form fields
    fluteForm.centsdiff1.value = CentsDiff(Ff[1]);
    fluteForm.centsdiff2.value = CentsDiff(Ff[2]);
    fluteForm.centsdiff3.value = CentsDiff(Ff[3]);
    fluteForm.centsdiff4.value = CentsDiff(Ff[4]);
    fluteForm.centsdiff5.value = CentsDiff(Ff[5]);
    fluteForm.centsdiff6.value = CentsDiff(Ff[6]);
    fluteForm.centsdiff7.value = CentsDiff(Ff[7]);
    fluteForm.centsdiffEnd.value = CentsDiff(Fend);
    fluteForm.diamEmb1.value = round(Demb1 / K, R);
    fluteForm.diamEmb2.value = round(Demb2 / K, R);
    fluteForm.diam1.value = round(Df[1] / K, R);
    fluteForm.diam2.value = round(Df[2] / K, R);
    fluteForm.diam3.value = round(Df[3] / K, R);
    fluteForm.diam4.value = round(Df[4] / K, R);
    fluteForm.diam5.value = round(Df[5] / K, R);
    fluteForm.diam6.value = round(Df[6] / K, R);
    fluteForm.diam7.value = round(Df[7] / K, R);
    fluteForm.tipLength.value = Math.round(R / K * TipLength) / R;
    fluteForm.resultLength.value = (TipLength / K + Math.round(R / K * (Xend - Xemb)) / R) + U;
    fluteForm.resultEmb.value = round((Xend - Xemb) / K, R) + U;
    fluteForm.result1.value = (Df[1] == 0) ? 0 : round((Xend - Xf[1]) / K, R) + U;
    fluteForm.result2.value = (Df[2] == 0) ? 0 : round((Xend - Xf[2]) / K, R) + U;
    fluteForm.result3.value = (Df[3] == 0) ? 0 : round((Xend - Xf[3]) / K, R) + U;
    fluteForm.result4.value = (Df[4] == 0) ? 0 : round((Xend - Xf[4]) / K, R) + U;
    fluteForm.result5.value = (Df[5] == 0) ? 0 : round((Xend - Xf[5]) / K, R) + U;
    fluteForm.result6.value = (Df[6] == 0) ? 0 : round((Xend - Xf[6]) / K, R) + U;
    fluteForm.result7.value = (Df[7] == 0) ? 0 : round((Xend - Xf[7]) / K, R) + U;
    fluteForm.cutoff1.value = (Df[1] == 0) ? 0 : round(f_c(1), 10);
    fluteForm.cutoff2.value = (Df[2] == 0) ? 0 : round(f_c(2), 10);
    fluteForm.cutoff3.value = (Df[3] == 0) ? 0 : round(f_c(3), 10);
    fluteForm.cutoff4.value = (Df[4] == 0) ? 0 : round(f_c(4), 10);
    fluteForm.cutoff5.value = (Df[5] == 0) ? 0 : round(f_c(5), 10);
    fluteForm.cutoff6.value = (Df[6] == 0) ? 0 : round(f_c(6), 10);
    fluteForm.cutoff7.value = (Df[7] == 0) ? 0 : round(f_c(7), 10);
    fluteForm.spacing1.value = round((Xf[3] - Xf[1]) / K, R) + U;
    fluteForm.spacing2.value = (Df[2] == 0) ? 0 : round((Xf[2] - Xf[1]) / K, R) + U;
    fluteForm.spacing3.value = round((Xf[4] - Xf[3]) / K, R) + U;
    fluteForm.spacing4.value = round((Xf[4] - Xf[1]) / K, R) + U;
    fluteForm.spacing5.value = round((Xf[6] - Xf[5]) / K, R) + U;
    fluteForm.spacing6.value = round((Xf[7] - Xf[6]) / K, R) + U;
    fluteForm.spacing7.value = round((Xf[7] - Xf[5]) / K, R) + U;
    fluteForm.note1.value = Freq2Note(fluteForm.freq1.value);
    fluteForm.note2.value = Freq2Note(fluteForm.freq2.value);
    fluteForm.note3.value = Freq2Note(fluteForm.freq3.value);
    fluteForm.note4.value = Freq2Note(fluteForm.freq4.value);
    fluteForm.note5.value = Freq2Note(fluteForm.freq5.value);
    fluteForm.note6.value = Freq2Note(fluteForm.freq6.value);
    fluteForm.note7.value = Freq2Note(fluteForm.freq7.value);
    fluteForm.noteEnd.value = Freq2Note(fluteForm.freqEnd.value);
    Slide();
    fluteForm.bore.value = round(Bore / K, R) + U;
    fluteForm.bore2.value = round(Bore / K, R) + U;
    //calculate optimum standard bore
    fluteForm.optimumBore.value = round(1 / K * 2620 * Math.pow(fluteForm.freqEnd.value, -5 / 6), R) + U;
    let n = fluteForm.freqEnd.value;
    let low = getLowPrefix(n);
    let c = fluteForm.calib.value;
    let cal = (c == 440) ? "" : "<span style='font-size:smaller; padding-left:1em;'><em> A=" + c + "</em></span>";
    document.getElementById('keyheader').innerHTML = low + Freq2Note(fluteForm.freqEnd.value) + cal;
    //document.getElementById('canvasheader').innerHTML = "Diagram: "+ low + Freq2Note(fluteForm.freqEnd.value);
    // add resize handler
    window.addEventListener('resize', DrawWhistle, false);
    //DrawWhistle();
}
function getLowPrefix(n) {
    if (n == 0)
        return "key ";
    else if (n < 240)
        return "Bass ";
    else if (n < 425)
        return "Low ";
    else
        return "";
}
// construct drawing with help of wz_jsgraphics.js
function DrawWhistle() {
    // Use the "canvas" div for drawing
    let jg = new jsGraphics("canvas");
    //init
    let win = window.innerWidth;
    //scale
    let sc = (win >= 1200) ? 1120 / Xend : 0.92 * win / Xend;
    let gx = sc * Xend;
    let gy = sc * Bore;
    let gz = sc * Wall;
    let xf = new Array(10);
    let df = new Array(10);
    for (let i = 1; i <= holeCount + 1; i++)
        xf[i] = sc * Xf[i];
    for (let i = 1; i <= holeCount + 1; i++)
        df[i] = sc * Df[i];
    //overpaint
    jg.setColor("#ffffff");
    jg.fillRect(-1 * (gz + 10), -1 * (gz + 10), gx + gz + 30, gy + gz + 40);
    //body
    jg.setColor("#bdb");
    jg.fillRect(0, 0, gx, gy);
    jg.setColor("green");
    jg.setStroke(gz);
    jg.drawRect(-1 * gz, -1 * gz, gx + gz, gy + gz);
    jg.setStroke(1);
    //metric scale, 10mm steps
    let t = Math.ceil(Xf[1] / 10) + 2;
    jg.setColor("white");
    for (let i = 1; i <= t; i++)
        jg.drawLine(sc * (Xend - 10 * i), gy - 5, sc * (Xend - 10 * i), gy);
    //window
    jg.setColor("maroon");
    jg.fillRect(0, (gy - sc * Demb2) / 2, sc * Demb1, sc * Demb2);
    //all holes
    jg.setColor("#990000");
    for (let i = 1; i <= holeCount + 1; i++)
        jg.fillEllipse(xf[i] - df[i], gy / 2 - df[i] / 2, df[i], df[i]);
    //thumb hole
    jg.setColor("#FF9494");
    jg.fillEllipse(xf[2] - df[2], gy / 2 - df[2] / 2, df[2], df[2]);
    //legend
    jg.setColor("maroon");
    if (Df[1] > 0)
        jg.drawString("T1", xf[1] - df[1] + 2, gy + gz);
    if (Df[2] > 0)
        jg.drawString("Th", xf[2] - df[2] + 2, gy + gz);
    if (Df[3] > 0)
        jg.drawString("T2", xf[3] - df[3] + 2, gy + gz);
    if (Df[4] > 0)
        jg.drawString("T3", xf[4] - df[4] + 2, gy + gz);
    if (Df[5] > 0)
        jg.drawString("B1", xf[5] - df[5] + 2, gy + gz);
    if (Df[6] > 0)
        jg.drawString("B2", xf[6] - df[6] + 2, gy + gz);
    if (Df[7] > 0)
        jg.drawString("B3", xf[7] - df[7] + 2, gy + gz);
    if (Df[8] > 0)
        jg.drawString("B4", xf[8] - df[8] + 2, gy + gz);
    if (Df[9] > 0)
        jg.drawString("X", xf[9] - df[9] + 2, gy + gz);
    if (Df[10] > 0)
        jg.drawString("X", xf[10] - df[10] + 2, gy + gz);
    jg.paint();
}
//# sourceMappingURL=whistle-designer-13.js.map