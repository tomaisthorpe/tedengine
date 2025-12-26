import React from 'react';
import { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import type { TFredConfig } from '../../fred/fred';
import { TFred } from '../../fred/fred';
import {
  TGameContext,
  TEngineContext,
  TEventQueueContext,
  TUIContext,
  TFredContext,
} from '../context';
import type { TGameContextData, TEngineContextData } from '../context';
import { DebugPanel } from './DebugPanel';
import { LoadingScreen } from './LoadingScreen';
import { ErrorScreen } from './ErrorScreen';
import { PointerLock } from './PointerLock';
import { GameControls } from './GameControls';

const Container = styled.div`
  display: block;
  position: relative;
  border: 1px solid #181b1f;
  box-shadow: 0px 1px 2px #161a20;
  max-width: 100%;
  max-height: 100%;
  margin: auto;
`;

const OuterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  &:fullscreen {
    width: 100vw;
    height: 100vh;
  }
`;

const TGame = ({
  game,
  children,
  width = '1024px',
  height = '768px',
  aspectRatio = '4 / 3',
  config,
}: {
  game: Worker;
  children?: React.ReactNode;
  width?: string;
  height?: string;
  aspectRatio?: string;
  config?: TFredConfig;
}) => {
  const container = useRef<HTMLDivElement>(null);
  const fullscreenContainer = useRef<HTMLDivElement>(null);
  const [fred, setFred] = useState<TFred | undefined>(undefined);
  const [engineData, setEngineData] = useState<TEngineContextData>({
    loading: false,
  });
  const [gameData, setGameData] = useState<TGameContextData>({});
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [scaling, setScaling] = useState(1);
  const [renderingSize, setRenderingSize] = useState({ width: 1, height: 1 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!container.current || !fullscreenContainer.current) {
      return;
    }

    const fred = new TFred(
      game,
      container.current,
      fullscreenContainer.current,
      setEngineData,
      setGameData,
      setErrorMessage,
      setScaling,
      setRenderingSize,
      config,
    );
    setFred(fred);

    return function cleanup() {
      fred.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally only run on mount - game and config should not change

  useEffect(() => {
    const onFullscreenChange = () => {
      // True when this component's outer container is the fullscreen element
      setIsFullscreen(
        document.fullscreenElement === fullscreenContainer.current,
      );
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    onFullscreenChange();
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const events = fred?.events;

  let containerWidth = '100%';
  let containerHeight = aspectRatio === 'auto' ? '100%' : 'auto';

  if (isFullscreen && aspectRatio && aspectRatio !== 'auto') {
    // Letterbox to preserve aspect ratio within the viewport in fullscreen
    const ratioExpr = aspectRatio; // Expect formats like "4 / 3" or "16 / 9"
    containerWidth = `min(100vw, calc(100vh * (${ratioExpr})))`;
    containerHeight = `min(100vh, calc(100vw / (${ratioExpr})))`;
  }

  return (
    <TFredContext.Provider value={{ fred }}>
      <TUIContext.Provider
        value={{
          scaling,
          renderingSize,
          showFullscreenToggle: config?.showFullscreenToggle ?? true,
          showAudioToggle: config?.showAudioToggle ?? false,
        }}
      >
        <TEventQueueContext.Provider value={{ events }}>
          <TEngineContext.Provider value={engineData}>
            <TGameContext.Provider value={gameData}>
              <OuterContainer
                style={{ width, height }}
                ref={fullscreenContainer}
              >
                <Container
                  style={{
                    width: containerWidth,
                    height: containerHeight,
                    aspectRatio,
                  }}
                  ref={container}
                >
                  {fred && fred.events && (
                    <>
                      <DebugPanel events={fred.events} />
                      {children}
                    </>
                  )}
                  {fred && <GameControls fred={fred} />}
                  {engineData.loading && (
                    <LoadingScreen
                      backgroundColor={config?.loadingScreen?.backgroundColor}
                      textColor={config?.loadingScreen?.textColor}
                    />
                  )}
                  <PointerLock />
                  {errorMessage && <ErrorScreen error={errorMessage} />}
                </Container>
              </OuterContainer>
            </TGameContext.Provider>
          </TEngineContext.Provider>
        </TEventQueueContext.Provider>
      </TUIContext.Provider>
    </TFredContext.Provider>
  );
};

export { TGame };
