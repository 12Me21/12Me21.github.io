/*
 * Petitcom 3 QPSK Modulater
 * Copyright (C) 2014 OBN-soft
 * Version: 0.2.1
 * LastModified: Nov 27 2014
 * 
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 * 
 */

var elmDivInfo;
var elmAudioPlay;

var SYMBOL = 8;

var samples = String.fromCharCode(10, 79,176,245,245,176, 79, 10, 10, 79,176,245,245,176, 79, 10);

function setDivElementForInfo(element) {
	elmDivInfo = element;
}

function setAudioElementForData(element) {
	elmAudioPlay = element;
}

/*--------*/

window.sampleRate=32728;
window.syncsize=10000;

function fileOpen(evt) {
	elmAudioPlay.src = null;
	displayInfo(null);
	var files = evt.target.files;
	if (files.length == 0) return;
	var file = files[0];
	var reader = new FileReader();
	reader.onload = function(evt) {
		var data = reader.result;
		displayInfo(data);
		setTimeout(function(){
			var signals = createSyncSignal() + createDataSignal(data);
			signals += String.fromCharCode(0x80).repeat(10000);
			var wavefile = make_wav(window.sampleRate, 1, 1, signals);
			elmAudioPlay.src = "data:audio/wav;base64," + btoa(wavefile);
		},0);
	}
	reader.readAsBinaryString(file);
}

/*--------*/

function displayInfo(data) {
	var i, text;
	for (i = elmDivInfo.childNodes.length - 1; i >= 0; i--) {
		elmDivInfo.removeChild(elmDivInfo.childNodes[i]);
	}

	text = "Data size: ";
	if (data) text += data.length + " bytes";
	appendInfo(text);
	
	text = "Time: ";
	if (data) {
		var sec = data.length*4/(32728/SYMBOL);
		text += Math.floor(sec/60) + ":" + (100+Math.round(sec % 60)).toString().substr(1);
	}
	appendInfo(text);

	text = "Checksum: ";
	if (data) {
		var sum = 0;
		for (i = 0; i < data.length; i++) {
			sum += data.charCodeAt(i)//( ^ i * 23) & 0xFF;
		}
		text += sum.toString(16).toUpperCase();
	}
	appendInfo(text);

}

function appendInfo(text) {
	elmDivInfo.appendChild(document.createTextNode(text));
	elmDivInfo.appendChild(document.createElement("br"));
}

/*--------*/

function createSyncSignal() {
	var i;
	var signals = String.fromCharCode(80).repeat(10);

	for (i = 0; i < syncsize; i++) {
		signals += samples.substr(0, SYMBOL);
	}
	signals += samples.substr(2, SYMBOL);
	return signals;
}

function createDataSignal(data) {
	var i, j, val, rs_val;
	var len = data.length;
	var signals = "";

	for (i = 0; i < len; i++) {
		val = data.charCodeAt(i)
		for(j=0;j<8;j+=2){
			signals += samples.substr((val>>j & 3)*2, SYMBOL);
		}
	}
	return signals;
}

function i32(x) {
	return String.fromCharCode(x&0xFF, x>>8&0xFF, x>>16&0xFF, x>>24&0xFF);
}
function i16(x) {
	return String.fromCharCode(x&0xFF, x>>8&0xFF);
}

function make_wav(samplerate, channels, samplesize, data){
	var numsamples = data.length / samplesize / channels;
	
	var data_chunk = "data";
	data_chunk += i32(numsamples * samplesize * channels);
	data_chunk += data;
	
	var fmt_chunk = "fmt "; //subchunk label
	fmt_chunk += i32(16); //subchunk size
	fmt_chunk += i16(1); //audio format
	fmt_chunk += i16(channels); // number of channels
	fmt_chunk += i32(samplerate); //samples per second
	fmt_chunk += i32(samplerate * channels * samplesize); //bytes per second (all channels)
	fmt_chunk += i16(channels * samplesize); //bytes per sample (all channels)
	fmt_chunk += i16(8 * samplesize); //bits per sample
	
	var riff_chunk = "RIFF";
	riff_chunk += i32(fmt_chunk.length + data_chunk.length + 4);
	riff_chunk += "WAVE";
	
	return riff_chunk + fmt_chunk + data_chunk;
}