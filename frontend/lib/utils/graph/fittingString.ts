import G6 from '@antv/g6';

const fittingString = (str: any, maxWidth: any, fontSize: any) => {
  let currentWidth = 0;
  let res = str.toString();
  const pattern = new RegExp('[\u4E00-\u9FA5]+'); // distinguish the Chinese charactors and letters
  str
    .toString()
    .split('')
    .forEach((letter: string, i: number) => {
      if (currentWidth > maxWidth) return;
      if (pattern.test(letter)) {
        // Chinese charactors
        currentWidth += fontSize;
      } else {
        // get the width of single letter according to the fontSize
        currentWidth += G6.Util.getLetterWidth(letter, fontSize);
      }
      if (currentWidth > maxWidth) {
        const nextLineStr = fittingString(str.substr(i), maxWidth, fontSize);
        res = `${str.substr(0, i)}\n${nextLineStr}`;
      }
    });
  return res;
};

export default fittingString;
