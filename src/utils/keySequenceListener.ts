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

/**
 * Represents a book.
 * key sequence suports := ([a-zA-Z0-9-], * , /)
 * Never have as last character *
 */
export function makeKeySequenceListener(keySequence: string, callback: (readedKeys: string) => void) {
  if (keySequence[keySequence.length - 1] === "*") {
    throw new Error("Key sequence can not end with a wildcard character");
  }

  let i = 0;
  let keys = "";

  return (e: KeyboardEvent) => {
    const key = e.key;

    if (isIgnorableKey(key)) return;

    keys += key;
    console.log(key);

    switch (keySequence[i]) {
      case "/":
        if (key != "/") {
          i = 0;
          keys = "";
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
          i = 0;
          keys = "";
          return;
        }

        break;
      default:
        if (!isValidCharacter(keySequence[i])) {
          throw new Error("Invalid character expresion in makeKeySequenceListener call");
        }
        if (key != keySequence[i]) {
          i = 0;
          keys = "";
          return;
        } else {
          i = (i + 1) % keySequence.length;
        }
        break;
    }

    if (i === keySequence.length) {
      callback(keys);
      i = 0;
      keys = "";
    }
  };
}
