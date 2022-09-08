import styled from "styled-components";
import type { ButtonStatesT } from "./FetchButton";

// TODO (if time):
// - [ ] Tooltip arrow on top

interface TooltipPropsT {
  id: string;
  state: ButtonStatesT;
  text: string;
}
const TooltipContainer = styled.div<TooltipPropsT>`
  position: absolute;
  top: 110%;
  width: 100%;
  color: white;
  background-color: ${(props) => {
    if (props.state === "error") return "red";
    if (props.state === "fetching") return "orange";
    return "black";
  }};
`;

export const Tooltip = (props: TooltipPropsT) => {
  return (
    <TooltipContainer
      {...props}
      data-testid={`tooptip-${props.state}`}
      className="tooltip"
    >
      <p style={{ padding: 5, margin: 0 }}>{props.text}</p>
    </TooltipContainer>
  );
};
