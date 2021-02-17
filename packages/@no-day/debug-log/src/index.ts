export const log = (msg?: string) => <T>(x: T): T => {
  if (msg !== undefined) {
    console.log(msg, x);
  } else {
    console.log(x);
  }
  return x;
};

export default log;
