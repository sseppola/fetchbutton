import React from "react";
import styled from "styled-components";
import { FetchButton } from "./FetchButton";

const Container = styled.div`
  text-align: center;
`;

function App() {
  return (
    <Container>
      <p>Disabled</p>
      <FetchButton url={"https://httpbin.org/delay/3"} disabled={true} />

      <p>Timeout</p>
      <FetchButton url={"https://httpbin.org/delay/3"} timeout={2000} />

      <p>Normal</p>
      <FetchButton url={"https://httpbin.org/delay/3"} />
    </Container>
  );
}

export default App;
