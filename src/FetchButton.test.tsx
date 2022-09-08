import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { FetchButton, Button } from "./FetchButton";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test("it should make a network request to a URL passed as props", () => {
  const fetchSpy = jest.spyOn(global, "fetch");
  const url = "https://httpbin.org/delay/3";

  render(<FetchButton url={url} />);
  const launchButton = screen.getByText(/Launch Rocket/i);
  expect(launchButton).toBeInTheDocument();

  fireEvent.click(launchButton);

  expect(fetchSpy).toHaveBeenCalledTimes(1);
  expect(fetchSpy).toHaveBeenCalledWith(url, {
    signal: new AbortController().signal,
  });

  fetchSpy.mockRestore();
});

// NOTE: I had some issues getting the timeouts and waiting for the DOM to change to the expected state
// I belive the intention of the following test is ok.
test('It should show the "Working" state for the duration of the network request', async () => {
  const fetchSpy = jest.spyOn(global, "fetch");

  render(<FetchButton url="https://httpbin.org/delay/1" />);
  let launchButton = screen.getByText(/Launch Rocket/i);
  expect(launchButton).toBeInTheDocument();

  fireEvent.click(launchButton);

  // Check that the working button text is shown
  const workingButtonElement = await screen.findByText(/Launching/i);
  expect(workingButtonElement).toBeInTheDocument();
  expect(screen.queryByText(/Launch Rocket/i)).not.toBeInTheDocument();

  // Trigger timeout and watch the button text change
  jest.advanceTimersByTime(1000);
  launchButton = await screen.findByText(/Launch Rocket/i, undefined, {
    timeout: 3000,
  }); // <- does not act as expected

  fetchSpy.mockRestore();
});

test("It should optionally timeout the network request after a max duration passed as props", async () => {
  let wasAborted = false;
  const fetchSpy = jest.spyOn(global, "fetch").mockImplementation(
    (url, options) =>
      new Promise(() => {
        // Will never respond
        expect(options?.signal).toBeInstanceOf(AbortSignal);
        options!.signal!.addEventListener("abort", () => {
          wasAborted = true;
        });
      })
  );

  render(<FetchButton url="https://httpbin.org/delay/3" timeout={1000} />);
  let launchButton = screen.getByText(/Launch Rocket/i);
  expect(launchButton).toBeInTheDocument();

  fireEvent.click(launchButton);

  jest.advanceTimersByTime(1100);

  // Check the abort signal was sent
  expect(wasAborted).toBe(true);

  fetchSpy.mockRestore();
});

// NOTE: I had some issues getting the timeouts and waiting for the DOM to change to the expected state
// I belive the intention of the following test is ok.
test("It should show the error state after the max duration is exeeded and the network request is cancelled", async () => {
  const fetchSpy = jest.spyOn(global, "fetch").mockImplementation(
    () =>
      new Promise(() => {
        // Will never respond
      })
  );

  render(<FetchButton url="https://httpbin.org/delay/3" timeout={1000} />);
  let launchButton = screen.getByText(/Launch Rocket/i);
  expect(launchButton).toBeInTheDocument();

  fireEvent.click(launchButton);
  jest.advanceTimersByTime(1000);

  // Wait for the error message to be displayed
  await screen.findByText(/Ignition error/i, undefined, { timeout: 3000 }); // <- does not act as expected
  expect(screen.queryByText(/Launching/i)).not.toBeInTheDocument();

  fetchSpy.mockRestore();
});

test("It should return to the default state after the network request completes and there is no timeout provided", async () => {
  let resolvePromise: (() => void) | undefined;
  const fetchSpy = jest.spyOn(global, "fetch").mockImplementation(
    () =>
      new Promise((resolve) => {
        resolvePromise = () => resolve(new Response());
      })
  );

  render(<FetchButton url="https://httpbin.org/delay/3" />);
  let launchButton = screen.getByText(/Launch Rocket/i);
  expect(launchButton).toBeInTheDocument();

  fireEvent.click(launchButton);

  // Check that the working button text is shown
  const workingButtonElement = await screen.findByText(/Launching/i);
  expect(workingButtonElement).toBeInTheDocument();
  expect(screen.queryByText(/Launch Rocket/i)).not.toBeInTheDocument();

  // Resolve promise and ensure the button returns to default state
  resolvePromise?.();
  launchButton = await screen.findByText(/Launch Rocket/i);
  expect(screen.queryByText(/Launching/i)).not.toBeInTheDocument();

  fetchSpy.mockRestore();
});

test("A second click of the button should abort a request that is in-flught and show the error state", async () => {
  let wasAborted = false;
  const fetchSpy = jest.spyOn(global, "fetch").mockImplementation(
    (url, options) =>
      new Promise(() => {
        // Will never respond
        expect(options?.signal).toBeInstanceOf(AbortSignal);
        options!.signal!.addEventListener("abort", () => {
          wasAborted = true;
        });
      })
  );

  render(<FetchButton url="https://httpbin.org/delay/3" timeout={1000} />);
  let launchButton = screen.getByText(/Launch Rocket/i);
  expect(launchButton).toBeInTheDocument();

  fireEvent.click(launchButton);
  const workingButton = await screen.findByText("Launching");
  fireEvent.click(workingButton);

  // Check the abort signal was sent
  expect(wasAborted).toBe(true);

  fetchSpy.mockRestore();
});

test("It should be possible to put the button into each state via props", () => {
  render(
    <Button state="inactive" tooltipText="Hello world" children="Press me" />
  );
  const inactiveButton = screen.getByTestId("button-inactive");
  expect(inactiveButton).toBeInTheDocument();

  render(
    <Button state="error" tooltipText="Error message" children="Press me" />
  );
  const errorButton = screen.getByTestId("button-error");
  expect(errorButton).toBeInTheDocument();

  render(
    <Button state="fetching" tooltipText="Error message" children="Press me" />
  );
  const workingButton = screen.getByTestId("button-working");
  expect(workingButton).toBeInTheDocument();
});

test("The tooltip should not show if the button is disabled", () => {
  const erorrMessage = "Error message";
  render(
    <Button
      state="error"
      tooltipText={erorrMessage}
      disabled={true}
      children="Press me"
    />
  );
  expect(screen.queryByText(erorrMessage)).not.toBeInTheDocument();

  let tooltipMessage = "Busy";
  render(
    <Button
      state="fetching"
      tooltipText={tooltipMessage}
      disabled={true}
      children="Press me"
    />
  );
  expect(screen.queryByText(tooltipMessage)).not.toBeInTheDocument();

  tooltipMessage = "Press me!";
  render(
    <Button
      state="inactive"
      tooltipText={tooltipMessage}
      disabled={true}
      children="Press me"
    />
  );
  expect(screen.queryByText(tooltipMessage)).not.toBeInTheDocument();
});

test("The error state should not show if the button is displayed or working", () => {
  const errorMessage = "Error message";
  render(
    <Button
      state="error"
      tooltipText={errorMessage}
      disabled={true}
      children="Press me"
    />
  );
  expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
});

test("The tooltip should alwasys show when in the error state", () => {
  const errorMessage = "Error message";
  render(
    <Button state="error" tooltipText={errorMessage} children="Press me" />
  );
  const errorButton = screen.getByTestId("button-error");
  expect(errorButton).toBeInTheDocument();
  const tooltip = screen.getByText(errorMessage);
  expect(tooltip).toBeInTheDocument();
});
