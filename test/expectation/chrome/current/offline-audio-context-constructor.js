import 'core-js/es7/reflect';
import { UNPATCHED_OFFLINE_AUDIO_CONTEXT_CONSTRUCTOR_PROVIDER, unpatchedOfflineAudioContextConstructor } from '../../../../src/providers/unpatched-offline-audio-context-constructor';
import { ReflectiveInjector } from '@angular/core';
import { WINDOW_PROVIDER } from '../../../../src/providers/window';
import { spy } from 'sinon';

describe('offlineAudioContextConstructor', () => {

    let offlineAudioContext;
    let OfflineAudioContext;

    beforeEach(() => {
        const injector = ReflectiveInjector.resolveAndCreate([
            UNPATCHED_OFFLINE_AUDIO_CONTEXT_CONSTRUCTOR_PROVIDER,
            WINDOW_PROVIDER
        ]);

        OfflineAudioContext = injector.get(unpatchedOfflineAudioContextConstructor);

        offlineAudioContext = new OfflineAudioContext(1, 256000, 44100);
    });

    describe('createBufferSource()', () => {

        // bug #14

        it('should not resample an oversampled AudioBuffer', (done) => {
            const audioBuffer = offlineAudioContext.createBuffer(1, 8, 88200);
            const audioBufferSourceNode = offlineAudioContext.createBufferSource();
            const eightRandomValues = [];

            for (let i = 0; i < 8; i += 1) {
                eightRandomValues[i] = (Math.random() * 2) - 1;
            }

            audioBuffer.copyToChannel(new Float32Array(eightRandomValues), 0);

            audioBufferSourceNode.buffer = audioBuffer;
            audioBufferSourceNode.start(0);
            audioBufferSourceNode.connect(offlineAudioContext.destination);

            offlineAudioContext
                .startRendering()
                .then((buffer) => {
                    const channelData = new Float32Array(4);

                    buffer.copyFromChannel(channelData, 0);

                    expect(channelData[0]).to.closeTo(eightRandomValues[0], 0.0000001);
                    expect(channelData[1]).to.closeTo(eightRandomValues[2], 0.0000001);
                    expect(channelData[2]).to.closeTo(eightRandomValues[4], 0.0000001);
                    expect(channelData[3]).to.closeTo(eightRandomValues[6], 0.0000001);

                    done();
                });
        });

    });

    describe('createChannelSplitter()', () => {

        // bug #30

        it('should allow to set the channelCountMode', () => {
            const channelSplitterNode = offlineAudioContext.createChannelSplitter();

            channelSplitterNode.channelCountMode = 'explicit';
        });

        // bug #31

        it('should have a channelInterpretation of max', () => {
            const channelSplitterNode = offlineAudioContext.createChannelSplitter();

            expect(channelSplitterNode.channelInterpretation).to.equal('speakers');
        });

        // bug #32

        it('should allow to set the channelInterpretation', () => {
            const channelSplitterNode = offlineAudioContext.createChannelSplitter();

            channelSplitterNode.channelInterpretation = 'discrete';
        });

    });

    describe('createGain()', () => {

        let gainNode;

        beforeEach(() => {
            gainNode = offlineAudioContext.createGain();
        });

        describe('cancelAndHoldAtTime()', () => {

            // bug #28

            it('should not be implemented', () => {
                expect(gainNode.cancelAndHoldAtTime).to.be.undefined;
            });

        });

    });

    describe('decodeAudioData()', () => {

        // bug #6

        it('should not call the errorCallback at all', (done) => {
            const errorCallback = spy();

            offlineAudioContext.decodeAudioData(null, () => {}, errorCallback);

            setTimeout(() => {
                expect(errorCallback).to.have.not.been.called;

                done();
            }, 1000);
        });

    });

});
