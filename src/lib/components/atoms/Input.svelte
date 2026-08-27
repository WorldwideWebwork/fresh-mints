<script lang="ts">
  import { clsx } from 'clsx';
  import { twMerge } from 'tailwind-merge';

  interface Props {
    value?: string | number;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
    class?: string;
    oninput?: (e: Event & { currentTarget: HTMLInputElement }) => void;
    onchange?: (e: Event & { currentTarget: HTMLInputElement }) => void;
    [key: string]: any;
  }

  let {
    value = $bindable(''),
    placeholder = '',
    type = 'text',
    disabled = false,
    class: className = '',
    oninput,
    onchange,
    ...rest
  }: Props = $props();

  const classes = $derived(
    twMerge(
      clsx(
        'w-full bg-[var(--fm-surface)] text-[var(--fm-text)] border border-[var(--fm-border)] rounded-xl px-3.5 py-2 text-sm placeholder-[var(--fm-text-muted)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )
    )
  );
</script>

<input
  {type}
  bind:value={value}
  {placeholder}
  {disabled}
  class={classes}
  {oninput}
  {onchange}
  {...rest}
/>
