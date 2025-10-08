import styled from 'styled-components';

interface LoadingScreenProps {
  backgroundColor?: string;
  textColor?: string;
}

const Container = styled.div<LoadingScreenProps>`
  position: absolute;
  top: 0;
  left: 0;
  background: ${(props) => props.backgroundColor || 'rgba(51, 51, 102, 1)'};
  width: 100%;
  height: 100%;
  font-family: sans-serif;
  color: ${(props) => props.textColor || 'white'};
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;
`;

export default function LoadingScreen({
  backgroundColor,
  textColor,
}: LoadingScreenProps) {
  return (
    <Container backgroundColor={backgroundColor} textColor={textColor}>
      Loading...
    </Container>
  );
}
