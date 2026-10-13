import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CodeInput } from './CodeInput';
import { ResendButton } from './ResendButton';

const cell = (i: number, n = 6) => screen.getByLabelText(`Cyfra ${i} z ${n}`);
const values = (n = 6) =>
  Array.from({ length: n }, (_, i) => (cell(i + 1, n) as HTMLInputElement).value).join('');

function setup(length: 6 | 8 = 6) {
  const onChange = vi.fn();
  render(<CodeInput length={length} legend="Kod z SMS" onChange={onChange} autoFocus />);
  return { onChange, user: userEvent.setup() };
}

describe('CodeInput', () => {
  it('has a legend, labelled cells and one-time-code on the first cell', () => {
    setup();
    expect(screen.getByRole('group', { name: 'Kod z SMS' })).toBeInTheDocument();
    expect(cell(1)).toHaveAttribute('autocomplete', 'one-time-code');
    expect(cell(1)).toHaveAttribute('inputmode', 'numeric');
    expect(cell(6)).toHaveAttribute('inputmode', 'numeric');
    expect(cell(1)).toHaveFocus();
  });

  it('moves focus forward while typing and reports the complete code', async () => {
    const { onChange, user } = setup();
    await user.keyboard('48');
    expect(cell(3)).toHaveFocus();
    await user.keyboard('2913');
    expect(values()).toBe('482913');
    expect(onChange).toHaveBeenLastCalledWith('482913', true);
  });

  it('ignores non-digits', async () => {
    const { user } = setup();
    await user.keyboard('a4-b');
    expect(values()).toBe('4');
    expect(cell(2)).toHaveFocus();
  });

  it('Backspace on an empty cell clears the previous one and moves back', async () => {
    const { onChange, user } = setup();
    await user.keyboard('482');
    await user.keyboard('{Backspace}');
    expect(values()).toBe('48');
    expect(cell(3)).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('48', false);
  });

  it('pasting the whole code fills every cell', async () => {
    const { onChange, user } = setup(8);
    await user.click(cell(3, 8));
    await user.paste('Kod: 4829 1375');
    expect(values(8)).toBe('48291375');
    expect(onChange).toHaveBeenLastCalledWith('48291375', true);
  });

  it('autofill of the whole code into the first cell spreads it', async () => {
    const { user } = setup();
    await user.click(cell(1));
    await user.paste('482913');
    expect(values()).toBe('482913');
  });
});

describe('ResendButton', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts down from 1:00 and then enables resending', () => {
    vi.useFakeTimers();
    const onResend = vi.fn();
    render(<ResendButton onResend={onResend} />);
    expect(screen.getByRole('button', { name: 'Wyślij kod ponownie za 1:00' })).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(18_000);
    });
    expect(screen.getByRole('button', { name: 'Wyślij kod ponownie za 0:42' })).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(42_000);
    });
    const button = screen.getByRole('button', { name: 'Wyślij kod ponownie' });
    expect(button).toBeEnabled();
    act(() => {
      button.click();
    });
    expect(onResend).toHaveBeenCalledTimes(1);
  });
});
