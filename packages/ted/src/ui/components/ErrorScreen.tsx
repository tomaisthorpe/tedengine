import styled from 'styled-components';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(150, 51, 51, 1);
  width: 1024px;
  height: 768px;
  font-family: sans-serif;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  font-size: 14px;
  font-weight: bold;
`;

const Muted = styled.div`
  color: rgba(50, 10, 10, 1);
  font-size: 12px;
  margin-top: 4px;
`;

export default function ErrorScreen({ error }: { error: string }) {
  return (
    <Container>
      <div>It's all gone wrong...try refresh.</div>
      <Muted>{error}</Muted>
    </Container>
  );
}
