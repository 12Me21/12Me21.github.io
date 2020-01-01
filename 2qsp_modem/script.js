var SAMPLE_RATE = 32728;
var SYMBOL_SIZE = 8;
var FULL_WAVE = new Uint8Array([10, 79,176,245,245,176, 79, 10, 10, 79,176,245,245,176, 79, 10]);
var SYMBOLS = [];
for(var i=0;i<4;i++){
	SYMBOLS[i] = FULL_WAVE.subarray(i*(SYMBOL_SIZE/4), i*(SYMBOL_SIZE/4)+SYMBOL_SIZE);
}
var SYNC = create_sync(3);

function make_audio(data) {
	var samples = new Uint8Array(SYNC.length + data.length*4*SYMBOL_SIZE);
	samples.set(SYNC, 0);
	modulate(samples.subarray(SYNC.length), data);
	return make_wav_url(SAMPLE_RATE, 1, 1, samples);
}

function file_upload(event) {
	display(null);
	var files = event.target.files;
	if (!files[0])
		return;
	var reader = new FileReader();
	reader.onload = function(event) {
		var data = new Uint8Array(reader.result);
		display(data);
	}
	reader.readAsArrayBuffer(files[0]);
}

function display(data) {
	if (data) {
		$size.textContent = data.length + " bytes";
		$checksum.textContent = checksum(data);
		$audio.src = make_audio(data);
	} else {
		$size.textContent = "";
		$checksum.textContent = "";
		$audio.src = null;
	}
}

// (this is a very bad checksum, but I needed to save space in the receiver)
function checksum(data) {
	var sum = 0;
	for (var i=0; i<data.length; i++)
		sum += data[i];
	return (sum|0).toString(16).toUpperCase(); // HEX$
}

function create_sync(seconds) {
	var cycles = Math.ceil(seconds * SAMPLE_RATE / SYMBOL_SIZE);
	var samples = new Uint8Array(100+SYMBOL_SIZE*cycles+SYMBOL_SIZE);
	for (var i=0; i<100; i++) {
		samples[i] = 0x80;
	}
	for (i=0; i<cycles; i++)
		samples.set(SYMBOLS[0], 100+i*SYMBOL_SIZE);
	samples.set(SYMBOLS[1], 100+i*SYMBOL_SIZE);
	return samples;
}

function modulate(samples, data) {
	var pos = 0;
	for (var i=0; i<data.length; i++) {
		var val = data[i];
		for (var j=0; j<8; j+=2) {
			samples.set(SYMBOLS[val>>j & 3], pos);
			pos += SYMBOL_SIZE;
		}
	}
}

function put_str(a, o, s){
	for(var i=0;i<s.length;i++)
		a[o+i]=s.charCodeAt(i);
}

function put_i32(a, o, i){
	a[o  ] = i    &0xFF;
	a[o+1] = i>> 8&0xFF;
	a[o+2] = i>>16&0xFF;
	a[o+3] = i>>24&0xFF;
}

function put_i16(a, o, i){
	a[o  ] = i    &0xFF;
	a[o+1] = i>> 8&0xFF;
}

function make_wav_url(samplerate, channels, samplesize, data) {
	var wav = new Uint8Array(4+4+4 + 4+4+16 + 4+4+data.byteLength);
	// RIFF chunk
	put_str(wav,0,"RIFF"); // RIFF label
	put_i32(wav,4, 4 + 4+4+16 + 4+4+data.byteLength); // size (including subchunks)
	put_str(wav,8,"WAVE"); // type or whatever
	// fmt subchunk
	put_str(wav,12,"fmt "); //subchunk label
	put_i32(wav,16,16); //subchunk size
	put_i16(wav,20,1); //audio format
	put_i16(wav,22,channels); // number of channels
	put_i32(wav,24,samplerate); //samples per second
	put_i32(wav,28,samplerate * channels * samplesize); //bytes per second (all channels)
	put_i16(wav,32,channels * samplesize); //bytes per sample (all channels)
	put_i16(wav,34,8 * samplesize); //bits per sample
	// data subchunk
	put_str(wav,36,"data");
	put_i32(wav,40,data.byteLength);
	wav.set(data,44);
	var x = URL.createObjectURL(new Blob([wav.buffer],{type:"audio/wav"}));
	console.log("ok?", x);
	return x
}