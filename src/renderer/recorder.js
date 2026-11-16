// AudioWorklet: captura la salida en PCM de 16 bits estéreo para «Grabar a WAV».
class Rec extends AudioWorkletProcessor {
  process(inputs) {
    const inp = inputs[0];
    if (!inp || !inp.length) return true;
    const L = inp[0], R = inp[1] || inp[0], n = L.length;
    const o = new Int16Array(n * 2);
    for (let k = 0; k < n; k++) {
      o[2 * k] = Math.max(-1, Math.min(1, L[k])) * 32767;
      o[2 * k + 1] = Math.max(-1, Math.min(1, R[k])) * 32767;
    }
    this.port.postMessage(o.buffer, [o.buffer]);
    return true;
  }
}
registerProcessor('rec', Rec);
