class GainProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
    }

    // eslint-disable-next-line class-methods-use-this
    process() {
        return true;
    }
}

registerProcessor('gain-processor', GainProcessor);
