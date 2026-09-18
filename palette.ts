interface Palette {
  name: string;
  colors: string[];
}

function mix(p: Palette): string {
  return p.colors.join(" → ");
}

function isVivid(p: Palette): boolean {
  return p.colors.length >= 3;
}

const sunset: Palette = {
  name: "sunset",
  colors: ["#ff6b6b", "#f7b267", "#f4845f", "#f27059"],
};

console.log(mix(sunset));
console.log(`Vivid: ${isVivid(sunset)}`);
export { Palette, mix, isVivid };
