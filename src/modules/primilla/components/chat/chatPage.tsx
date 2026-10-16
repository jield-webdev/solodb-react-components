import { useState } from "react";
import { usePrimilla } from "../../hooks/usePrimilla"

export default function PrimillaChatPage() {
  const { sendMessage } = usePrimilla();

  const [message, setMessage] = useState<string>("");

  const sendMessageHandler = async () => {
        const resp = await sendMessage({message: message});

        console.log(resp);
  }; 

  return (
    <div>
        <input type="text" value={message} onChange={(t) => setMessage(t.target.value)} />
        <button onClick={() => sendMessageHandler()}>SEND</button>
    </div>
  )
}
