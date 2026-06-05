function isIgnorableKey(key: string): boolean {
  switch (key) {
    case "Shift":
      return true;
    case "Alt":
      return true;
    case "Control":
      return true;
    case "Meta":
      return true;
  }

  return false;
}

function isEndCharacter(char: string): boolean {
  switch (char) {
    case "Enter":
      return true;

    default:
      return false;
  }
}

export function makeKeyListener(callback: (readKeys: string) => void, currentReadKeys?: (keys: string) => void) {
  let i = 0;
  let keys = "";

  const restart = () => {
    i = 0;
    keys = "";
    if (currentReadKeys) currentReadKeys(keys);
  };

  return (e: KeyboardEvent) => {
    // Ignore inputs coming from physical keyboard if barcode scanner is exclusively expected
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return; // Don't process if the user is typing into a text field or textarea
    }

    const key = e.key;

    if (isIgnorableKey(key)) return;

    if (key === "Escape") {
      restart();
      return;
    }

    if (isEndCharacter(key)) {
      callback(keys);
      restart();
      return;
    }

    keys += key;

    if (currentReadKeys) currentReadKeys(keys);
  };
}
