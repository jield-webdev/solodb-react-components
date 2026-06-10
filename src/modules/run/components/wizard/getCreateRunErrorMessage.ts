export const getCreateRunErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message !== "") {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    (error as { response?: unknown }).response !== null
  ) {
    const response = (error as { response: { data?: { message?: unknown; detail?: unknown } } }).response;

    if (typeof response.data?.message === "string") {
      return response.data.message;
    }

    if (typeof response.data?.detail === "string") {
      return response.data.detail;
    }
  }

  return "Could not create the run.";
};
