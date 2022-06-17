import styled from "styled-components";
import { ButtonStatesT } from "./FetchButton";

// TODO (if time):
// - [ ] Tooltip arrow on top

interface TooltipPropsT {
  id: string;
  state: ButtonStatesT;
  show: boolean;
  text: string;
}
const TooltipContainer = styled.div<TooltipPropsT>`
  position: absolute;
  top: 110%;
  width: 100%;
  color: white;
  background-color: ${props => {
    if (props.state === 'error') return 'red';
    if (props.state === 'working') return 'orange';
    return 'black';
  }}
`

export const Tooltip = (props: TooltipPropsT) => {
  if (!props.show || !props.text) {
    return null;
  }

  return (
    <TooltipContainer {...props} data-testid={`tooptip-${props.state}`}>
      <p style={{ padding: 5,  margin: 0}}>{props.text}</p>
    </TooltipContainer>
  )

}
