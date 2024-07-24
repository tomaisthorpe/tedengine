import React from 'react';
import styled from 'styled-components';
import { TGame, useGameContext, useEventQueue } from '@tedengine/ted';

const DemoUI = styled.div`
  position: absolute;
  bottom: 10px;
  text-align: center;
  color: white;
  width: 100%;
  font-size: 1.25rem;
`;

export interface SampleEvent {
  type: 'SAMPLE_EVENT';
}

const GameContextUI = () => {
  const gameContext = useGameContext();
  const events = useEventQueue();

  const onClick = () => {
    events?.broadcast({
      type: 'SAMPLE_EVENT',
    } as SampleEvent);
  };
  return (
    <DemoUI>
      <p>
        You{"'"}ve pressed space {gameContext.spaceCount} times.
      </p>
      <button onClick={onClick}>Press this</button>
    </DemoUI>
  );
};

const Game = ({ worker }: { worker: Worker }) => {
  return (
    <TGame game={worker}>
      <GameContextUI />
    </TGame>
  );
};

export default Game;
