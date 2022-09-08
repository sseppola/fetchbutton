import React, { ComponentPropsWithoutRef, useId, useRef } from "react";
import styled from "styled-components";
import { LoadingSpinner } from "./LoadingSpinner";
import { Tooltip } from "./Tooltip";

// I am confused by "it should be possible to put the button into each state via props"
// because I'd want to separate a button that only accepts props, and another that
// manages the fetching/state, but it's phrased like it should be the same thing.

export type ButtonStatesT = "error" | "fetching" | "inactive";
type TooltipT = { [key in ButtonStatesT]: string };

const ButtonContainer = styled.div`
  display: inline-block;
  position: relative;
  .button:hover + .tooltip {
    display: block;
  }
  .tooltip {
    display: none;
  }
`;

const StyledButton = styled.button<
  { state: ButtonStatesT } & ComponentPropsWithoutRef<"button">
>`
  padding: 10px 20px;
  background-color: white;
  text-transform: capitalize;
  border-width: 2px;
  cursor: pointer;
  border-color: ${(props) => {
    if (props.state === "error") return "red";
    if (props.state === "fetching") return "orange";
    return "black";
  }};
  color: ${(props) => {
    if (props.disabled) return "gainsboro";
    if (props.state === "error") return "red";
    if (props.state === "fetching") return "orange";
    return "black";
  }};
`;

// TODO (if time):
// - [ ] Proper loading spinner
// - [ ] Darker bg when working
// - [ ] Normalize border styling due to inherited browser styles
// - [ ] Button appears fixed-width in design

interface FetchButtonPropsT {
  url: string; // Assumes GET
  id?: string;
  timeout?: number;
  disabled?: boolean;
}

export function FetchButton(props: FetchButtonPropsT) {
  const [buttonState, set_buttonState] =
    React.useState<ButtonStatesT>("inactive");

  const abortRef = useRef<AbortController>();
  const onPress: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault(); // prevent bubblign and scroll jump on spacebar "click"

    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = undefined;
      return;
    }

    const fetchAbortCtrl = new AbortController();
    abortRef.current = fetchAbortCtrl;
    set_buttonState("fetching");

    if (props.timeout) {
      // Ensure we're using the function scoped controller, not the shared ref.
      // fetch ignores aborts after completion, it will just be ignored.
      setTimeout(() => {
        fetchAbortCtrl.abort();
      }, props.timeout);
    }

    fetch(props.url, { signal: fetchAbortCtrl.signal })
      .then(() => {
        set_buttonState("inactive");
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Fetch aborted");
        }
        set_buttonState("error");
      })
      .finally(() => {
        abortRef.current = undefined;
      });
  };

  const tooltipText: TooltipT = {
    error: "Ignition error",
    fetching: "Cancel launch",
    inactive: "Ignites the fuel",
  };

  return (
    <Button
      name="Launch button"
      type="button"
      disabled={props.disabled}
      state={buttonState}
      tooltipText={tooltipText[buttonState]}
      onClick={onPress}
    >
      {buttonState === "fetching" ? "Launching" : "Launch Rocket"}
    </Button>
  );
}

// Ref disabled because it's not used here, and TS is making a fuss
// In a component lib this would be supported properly in case needed by someone
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  tooltipText: string;
  state: ButtonStatesT;
  children: React.ReactNode;
}

export const Button = ({
  tooltipText,
  state,
  children,
  ...buttonProps
}: ButtonProps) => {
  const showTooltip = !buttonProps.disabled;
  const buttonId = useId();

  return (
    <ButtonContainer>
      <StyledButton
        id={buttonId}
        className="button"
        data-testid={`button-${state}`}
        state={state}
        aria-pressed={state === "fetching"}
        aria-invalid={state === "error"}
        aria-errormessage={`${buttonId}-tooltip`}
        {...buttonProps}
      >
        {children}
        {state === "fetching" && <LoadingSpinner />}
      </StyledButton>

      {showTooltip && (
        <Tooltip id={`${buttonId}-tooltip`} state={state} text={tooltipText} />
      )}
    </ButtonContainer>
  );
};
