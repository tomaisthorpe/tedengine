import styled from 'styled-components';
import { useFred } from '../hooks';
import { useEffect, useState } from 'react';

const Button = styled.div`
  width: 28px;
  height: 26px;
  //   border: 4px solid rgba(0, 0, 0, 0.2);
  //   border-radius: 3px;
  //   transition-property: border-color;
  //   transition-duration: 0.2s;
  padding-left: 3px;
  position: relative;

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:hover:after {
    content: 'Toggle Audio';
    position: absolute;
    top: 26px;
    right: -4px;
    background: rgba(0, 0, 0, 0.5);
    padding: 3px 6px;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    font-size: 12px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    cursor: pointer;
  }
`;

export default function MuteToggle() {
  const fred = useFred();
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (fred) {
      setMuted(fred.audio.muted);
    }
  }, [fred]);

  const toggleMute = () => {
    if (fred) {
      fred.audio.muted = !muted;
      setMuted(!muted);
    }
  };

  return (
    <Button onClick={toggleMute}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.0"
        width="22"
        height="22"
        viewBox="0 0 75 75"
      >
        <path
          d="M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z"
          style={{
            stroke: 'rgba(0, 0, 0, 0.2)',
            strokeWidth: 8,
            strokeLinejoin: 'round',
            fill: 'none',
          }}
        />
        {!muted && (
          <path
            d="M48,27.6a19.5,19.5 0 0 1 0,21.4M55.1,20.5a30,30 0 0 1 0,35.6M61.6,14a38.8,38.8 0 0 1 0,48.6"
            style={{
              fill: 'none',
              stroke: 'rgba(0, 0, 0, 0.2)',
              strokeWidth: 5,
              strokeLinecap: 'round',
            }}
          />
        )}
      </svg>
    </Button>
  );
}
