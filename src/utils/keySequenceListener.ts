function isIgnorableKey(key: string): boolean {
  switch (key) {
    case "Shift":
      return true;
  }

  return false;
}

function isValidCharacter(char: string): boolean {
  return /^[a-zA-Z0-9-]$/.test(char);
}

function isPrintableCharacter(char: string): boolean {
  return char.length === 1;
}

function isEndCharacter(char: string): boolean {
  switch (char) {
    case "Enter":
      return true;

    default:
      return false;
  }
}

/**
 * Represents a book.
 * key sequence supports := ([a-zA-Z0-9-], * , /)
 */
export function makeKeySequenceListener(
  keySequence: string,
  callback: (readKeys: string) => void,
  currentReadKeys?: (keys: string) => void,
  options?: {
    requireEndCharacter?: boolean;
  }
) {
  const requireEndCharacter = options?.requireEndCharacter ?? false;
  let i = 0;
  let keys = "";

  const restart = () => {
    i = 0;
    keys = "";
    if (currentReadKeys) currentReadKeys(keys);
  };

  return (e: KeyboardEvent) => {
    const key = e.key;

    if (key === "Escape") {
      restart();
      return;
    }
    if (isIgnorableKey(key)) return;
    if (isEndCharacter(key)) {
      callback(keys);
      restart();
      return;
    }

    keys += key;

    switch (keySequence[i]) {
      case "/":
        if (key != "/") {
          restart();
          return;
        } else {
          i = (i + 1) % keySequence.length;
        }
        break;
      case "*":
        // if (key == keySequence[i + 1]) {
        //   i += 2;
        //   break;
        // }

        if (!isPrintableCharacter(key)) {
          return;
        }

        break;
      default:
        if (!isValidCharacter(keySequence[i])) {
          throw new Error("Invalid character expression in makeKeySequenceListener call");
        }
        if (key != keySequence[i]) {
          restart();
          return;
        } else {
          i = (i + 1) % keySequence.length;
        }
        break;
    }

    if (!requireEndCharacter && i === keySequence.length) {
      callback(keys);
      restart();
      return;
    }

    if (currentReadKeys) currentReadKeys(keys);
  };
}
