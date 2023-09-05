import React from 'react';
import { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import TFred from '../../fred/fred';
import { TGameContext, TEngineContext, TEventQueueContext } from '../context';
import type { TGameContextData, TEngineContextData } from '../context';
import DebugPanel from './DebugPanel';
import LoadingScreen from './LoadingScreen';

const Container = styled.div`
  display: block;
  position: relative;
  border: 1px solid #181b1f;
  box-shadow: 0px 1px 2px #161a20;
`;

const TGame = ({
  game,
  children,
  width = '1024px',
  height = '768px',
}: {
  game: Worker;
  children?: React.ReactNode;
  width?: string;
  height?: string;
}) => {
  const container = useRef(null);
  const [fred, setFred] = useState<TFred | null>(null);
  const [engineData, setEngineData] = useState<TEngineContextData>({
    loading: false,
  });
  const [gameData, setGameData] = useState<TGameContextData>({});

  useEffect(() => {
    const fred = new TFred(
      game,
      container.current!,
      setEngineData,
      setGameData
    );
    setFred(fred);

    return function cleanup() {
      // fred.destroy();
    };
  }, []);

  const events = fred && fred.events ? fred.events : undefined;

  return (
    <TEventQueueContext.Provider value={{ events }}>
      <TEngineContext.Provider value={engineData}>
        <TGameContext.Provider value={gameData}>
          <Container
            style={{
              width,
              height,
            }}
            ref={container}
          >
            {fred !== null && fred.events && (
              <>
                <DebugPanel events={fred.events} stats={fred.stats} />
                {children}
              </>
            )}
            {engineData.loading && <LoadingScreen />}
          </Container>
        </TGameContext.Provider>
      </TEngineContext.Provider>
    </TEventQueueContext.Provider>
  );
};

export default TGame;
