import { Button } from "react-bootstrap";
import { StatusMail } from "@/modules/equipment/interfaces/statusMail";
import axios from "axios";
import { useState } from "react";

export default function SendStatusMailButton({ statusMail }: { statusMail: StatusMail }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleButtonClick = async () => {
    try {
      setIsLoading(true);
      if (!statusMail.id || statusMail.id <= 0) {
        throw new Error("Status Mail ID is not correctly set");
      }

      const sendStatusMailData = {
        status_mail: statusMail.id,
      };

      await axios.post(`/send/status-mail`, sendStatusMailData);
      setIsSuccess(true);
    } catch (error) {
      console.error("Error sending status mail:", error);
      alert("Error sending status mail. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="primary" size="sm" onClick={handleButtonClick} disabled={isLoading} aria-label="Toggle Details">
      {isLoading ? "Sending..." : isSuccess ? "Sending successful" : "Send Status Mail"}
    </Button>
  );
}
