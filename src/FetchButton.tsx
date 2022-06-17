import React, { ComponentPropsWithoutRef, useId, useRef } from 'react';
import styled from 'styled-components'
import './App.css';
import { LoadingSpinner } from './LoadingSpinner';
import { Tooltip } from './Tooltip';

// I am confused by "it should be possible to put the button into each state via props"
// because I'd want to separate a button that only accepts props, and another that
// manages the fetching/state, but it's phrased like it should be the same thing.

type FetchButtonStateT = 
  { state: 'error', errorMessage: string} |
  { state: 'working'} |
  { state: 'inactive'};

export type ButtonStatesT = FetchButtonStateT['state'];

const ButtonContainer = styled.div`
  display: inline-block;
  position: relative;
`

const StyledButton = styled.button<{state: ButtonStatesT} & ComponentPropsWithoutRef<'button'>>`
  padding: 10px 20px;
  background-color: white;
  text-transform: capitalize;
  border-width: 2px;
  border-color: ${props => {
    if (props.state === 'error') return 'red';
    if (props.state === 'working') return 'orange';
    return 'black'
  }};
  color: ${props => {
    if (props.disabled) return 'gainsboro'
    if (props.state === 'error') return 'red';
    if (props.state === 'working') return 'orange';
    return 'black'
  }}
`

// TODO (if time):
// - [ ] Proper loading spinner
// - [ ] Darker bg when working
// - [ ] Normalize border styling due to inherited browser styles
// - [ ] Button appears fixed-width in design

interface FetchButtonPropsT {
  id?: string;
  url: string; // Assumes GET
  timeout?: number;
  disabled?: boolean;
}


export function FetchButton(props: FetchButtonPropsT) {
  const [buttonState, set_buttonState] = React.useState<FetchButtonStateT>({ state: 'inactive'});

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
    set_buttonState({ state: 'working'})

    if (props.timeout) {
      // Ensure we're using the function scoped controller, not the shared ref.
      // fetch ignores aborts after completion, it will just be ignored.
      setTimeout(() => {
        fetchAbortCtrl.abort()
      }, props.timeout);
    }

    fetch(props.url, {signal: fetchAbortCtrl.signal})
    .then(response => {
      set_buttonState({ state: 'inactive' })
    })
    .catch(error => {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      }
      set_buttonState({ state: 'error', errorMessage: 'Ignition error' })
    })
    .finally(() => {
      abortRef.current = undefined;
    })
  }

  let tooltipText = 'Ignites the fuel';
  if (buttonState.state === 'error') {
    tooltipText = buttonState.errorMessage;
  } else if (buttonState.state === 'working') {
    tooltipText = 'Cancel launch';
  }


  return (
    <Button name="Launch button" type="button" disabled={props.disabled} state={buttonState.state} tooltipText={tooltipText} onClick={onPress}>
      {buttonState.state === 'working' ? 'Launching' : 'Launch Rocket'}
    </Button>
  )
}


// Ref disabled because it's not used here, and TS is making a fuss
// In a component lib this would be supported properly in case needed by someone
export const Button = (props: {
  disabled?: boolean;
  tooltipText: string;
  state: ButtonStatesT;
  children: React.ReactNode;
} & ComponentPropsWithoutRef<'button'>) => {
  const {tooltipText, state, children, ...buttonProps} = props;
  const [hover, set_hover] = React.useState(false);
  const onMouseEnter = React.useCallback(() => set_hover(true), []);
  const onMouseLeave = React.useCallback(() => set_hover(false), []);

  const showTooltip = state === 'error' || hover;
  const buttonId = useId()

  return (
    <ButtonContainer onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <StyledButton 
        id={buttonId}
        data-testid={`button-${state}`}
        state={state}
        aria-pressed={state === 'working'}
        aria-invalid={state === 'error'}
        aria-errormessage={`${buttonId}-tooltip`}
        {...buttonProps}>
        {children}
        {state === 'working' ? <LoadingSpinner /> : null}
      </StyledButton>

      {buttonProps.disabled ? null : (
        <Tooltip id={`${buttonId}-tooltip`} state={state} text={tooltipText} show={showTooltip} />
      )}
    </ButtonContainer>
  )
}


