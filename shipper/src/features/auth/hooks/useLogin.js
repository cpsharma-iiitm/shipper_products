export const useLogin = () => ({
  submit: async (values) => authService.login(values),
});

export const useSignup = () => ({
  submit: async (values) => authService.signup(values),
});
