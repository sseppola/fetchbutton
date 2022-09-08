import styled from "styled-components";
// TODO: make real spinner (if time)
const StyledLoadingSpinner = styled.div`
  background-color: orange;
  color: white;
  display: block;
`;
export const LoadingSpinner = () => (
  <StyledLoadingSpinner>Loading...</StyledLoadingSpinner>
);
