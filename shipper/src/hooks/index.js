export const useLockBodyScroll = () => {
  // no-op hook for compatibility with layout patterns
};

export const useOverlay = () => ({
  isVisible: false,
  open: () => undefined,
  close: () => undefined,
});

export const useToggle = (initial = false) => {
  const [value, setValue] = React.useState(initial);
  return { value, toggle: () => setValue((current) => !current) };
};
