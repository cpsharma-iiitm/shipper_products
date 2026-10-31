export const useLogout = () => ({
  submit: async () => authService.logout(),
});
