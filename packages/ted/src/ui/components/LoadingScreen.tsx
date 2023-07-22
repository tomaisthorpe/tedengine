import styled from 'styled-components';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(51, 51, 102, 1);
  width: 1024px;
  height: 768px;
  font-family: sans-serif;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;
`;

export default function LoadingScreen() {
  return <Container>Loading...</Container>;
}
