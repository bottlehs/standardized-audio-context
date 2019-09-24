import { IAudioNode, IAudioParam, IMinimalOfflineAudioContext } from '../interfaces';
import { TNativeAudioParam, TNativeOfflineAudioContext, TRenderInputsOfAudioParamFactory } from '../types';

export const createRenderInputsOfAudioParam: TRenderInputsOfAudioParamFactory = (
    getAudioNodeRenderer,
    getAudioParamConnections,
    isPartOfACycle
) => {
    return async <T extends IMinimalOfflineAudioContext> (
        audioParam: IAudioParam,
        nativeOfflineAudioContext: TNativeOfflineAudioContext,
        nativeAudioParam: TNativeAudioParam,
        trace: readonly IAudioNode<T>[]
    ): Promise<void> => { // tslint:disable-line:invalid-void
        const audioParamConnections = getAudioParamConnections<T>(audioParam);

        await Promise
            .all(Array
                .from(audioParamConnections.activeInputs)
                .map(async ([ source, output ]) => {
                    const audioNodeRenderer = getAudioNodeRenderer(source);
                    const renderedNativeAudioNode = await audioNodeRenderer.render(source, nativeOfflineAudioContext, trace);

                    if (!isPartOfACycle(source)) {
                        renderedNativeAudioNode.connect(nativeAudioParam, output);
                    }
                }));
    };
};