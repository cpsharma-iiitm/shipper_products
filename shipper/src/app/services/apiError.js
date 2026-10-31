export const apiError = {
  parse(error) {
    return error?.message || 'Something went wrong';
  },
};
