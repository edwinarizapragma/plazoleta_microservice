export const axiosErrorHandler = (error: any) => {
  let err;
  if (error.response) {
    err = error.response.data;
  } else if (error.request) {
    err = error.request;
  } else {
    err = error;
  }
  return err;
};
