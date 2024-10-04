const weights: number[] = [2, 7, 6, 5, 4, 3, 2]; // d1 - d7
const nricCheckChars: string[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "Z", "J"]; // 1 - 11
const finCheckChars: string[] = ["K", "L", "M", "N", "P", "Q", "R", "T", "U", "W", "X"]; // 1 - 11
const mfinCheckChars: string[] = ["K", "L", "J", "N", "P", "Q", "R", "T", "U", "W", "X"]; // 1 - 11
const prefix: Set<string> = new Set<string>(["S", "T", "F", "G", "M"]);

const getCheckCharacter = (id: string): string => {
  if (!isWellFormedId(id)) {
    throw new Error("Id " + id + " is of incorrect format");
  }

  const p = id.charAt(0).toUpperCase();
  let d = 0;
  for (let i = 1; i < id.length - 1; ++i) d += parseInt(id.charAt(i)) * weights[i - 1];

  if (p === "T" || p === "G") {
    d += 4;
  } else if (p === "M") {
    d += 3;
  }

  const r = d % 11;
  const index = 11 - r - 1;

  if (p === "S" || p === "T") {
    return nricCheckChars[index];
  } else if (p === "M") {
    return mfinCheckChars[index];
  } else {
    return finCheckChars[index];
  }
};

const isWellFormedId = (id: string): boolean => {
  if (id == null || id.length !== 9) return false;
  for (let i = 0; i < id.length; ++i) {
    if (i === 0) {
      if (!prefix.has(id.charAt(i))) return false;
      continue;
    }

    if (i === id.length - 1) {
      if (!isNaN(Number(id.charAt(i)))) return false;
      continue;
    }

    if (isNaN(Number(id.charAt(i)))) return false;
  }

  return true;
};

export const isValidFin = (id: string): boolean => {
  const first = id.charAt(0).toUpperCase();

  const _id = id.toUpperCase();
  const checker = getCheckCharacter(_id);
  const last = _id.charAt(_id.length - 1);

  return (
    (first === "F" || first === "G" || first === "M") && // is Fin
    checker === last // is valid check character
  );
};
