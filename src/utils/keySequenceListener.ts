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
 * key sequence suports := ([a-zA-Z0-9-], * , /)
 */
export function makeKeySequenceListener(
  keySequence: string,
  callback: (readedKeys: string) => void,
  currentReadedKeys?: (keys: string) => void
) {
  let i = 0;
  let keys = "";

  const restart = () => {
    i = 0;
    keys = "";
    if (currentReadedKeys) currentReadedKeys(keys);
  };

  return (e: KeyboardEvent) => {
    const key = e.key;

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
        if (key == keySequence[i + 1]) {
          i += 2;
          break;
        }

        if (!isValidCharacter(key)) {
          restart();
          return;
        }

        break;
      default:
        if (!isValidCharacter(keySequence[i])) {
          throw new Error("Invalid character expresion in makeKeySequenceListener call");
        }
        if (key != keySequence[i]) {
          restart();
          return;
        } else {
          i = (i + 1) % keySequence.length;
        }
        break;
    }

    if (i === keySequence.length) {
      callback(keys);
      restart();
      return;
    }

    if (currentReadedKeys) currentReadedKeys(keys);
  };
}
