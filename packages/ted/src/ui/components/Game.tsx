import React from 'react';
import { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import type { TFredConfig } from '../../fred/fred';
import TFred from '../../fred/fred';
import { TGameContext, TEngineContext, TEventQueueContext } from '../context';
import type { TGameContextData, TEngineContextData } from '../context';
import DebugPanel from './DebugPanel';
import LoadingScreen from './LoadingScreen';
import ErrorScreen from './ErrorScreen';
import FullscreenToggle from './FullscreenToggle';

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
  const container = useRef(null);
  const fullscreenContainer = useRef(null);
  const [fred, setFred] = useState<TFred | null>(null);
  const [engineData, setEngineData] = useState<TEngineContextData>({
    loading: false,
  });
  const [gameData, setGameData] = useState<TGameContextData>({});
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const fred = new TFred(
      game,
      container.current!,
      fullscreenContainer.current!,
      setEngineData,
      setGameData,
      setErrorMessage,
      config,
    );
    setFred(fred);

    return function cleanup() {
      fred.destroy();
    };
  }, []);

  const events = fred && fred.events ? fred.events : undefined;

  const containerWidth =
    aspectRatio === 'auto' ? '100%' : `min(100%, 100vh * ${aspectRatio})`;
  const containerHeight = aspectRatio === 'auto' ? '100%' : 'auto';

  return (
    <TEventQueueContext.Provider value={{ events }}>
      <TEngineContext.Provider value={engineData}>
        <TGameContext.Provider value={gameData}>
          <OuterContainer style={{ width, height }} ref={fullscreenContainer}>
            <Container
              style={{
                width: containerWidth,
                height: containerHeight,
                aspectRatio,
              }}
              ref={container}
            >
              {fred !== null && fred.events && (
                <>
                  <DebugPanel events={fred.events} stats={fred.stats} />
                  {children}
                </>
              )}
              {fred && (
                <FullscreenToggle
                  toggleFullscreen={() => fred.toggleFullscreen()}
                />
              )}
              {engineData.loading && <LoadingScreen />}
              {errorMessage && <ErrorScreen error={errorMessage} />}
            </Container>
          </OuterContainer>
        </TGameContext.Provider>
      </TEngineContext.Provider>
    </TEventQueueContext.Provider>
  );
};

export default TGame;
