import { ChatMessage } from "../interfaces/primilla";
import { PrimillaError } from "./primillaApi";

export function getMessageFailure(error: unknown): Pick<ChatMessage, "error" | "retryAction"> {
  const status = error instanceof PrimillaError ? error.status : undefined;
  const message = error instanceof Error ? error.message : "Primilla could not answer. Please retry your message.";

  switch (status) {
    case 400:
      return { error: `Primilla rejected the client request. Please report this error: ${message}` };
    case 401:
      return {
        error: "Your SoloDB session could not be authenticated. Sign in to SoloDB again, then retry this message.",
        retryAction: "retry",
      };
    case 404:
    case 422:
      return {
        error: `${status === 404 ? "This conversation is no longer available." : "This conversation is too long."} Start fresh to retry. Earlier messages will stay visible, but Primilla will not remember them.`,
        retryAction: "start-fresh",
      };
    case 409:
      return {
        error: "This conversation changed again while Primilla was answering. Please retry.",
        retryAction: "retry",
      };
    case 500:
      return { error: "Primilla could not answer. Please retry your message.", retryAction: "retry" };
    case 502:
      return { error: "Primilla could not finish its answer. Retry or rephrase your message.", retryAction: "retry" };
    case 504:
      return { error: "Primilla took too long to answer. Please retry your message.", retryAction: "retry" };
    default:
      return {
        error: message,
        retryAction: "retry",
      };
  }
}
