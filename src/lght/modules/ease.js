const {pow,sin,cos} = Math
const ease = {
      inSine:(x)=>1-Math.cos((x*Math.PI)/2),
      outSine:(x)=>Math.sin((x*Math.PI)/2),
      inOutSine:x=>-Math.cos((Math.PI*x)-1)/2,
      inDegree:(x,degree)=>Math.pow(x,degree),
      outDegree:(x,degree)=>1 - Math.pow(1-x,degree),
      outBounce:(x)=>{
            const n1 = 7.5625
            const d1 = 2.75
            if (x < 1 / d1) {
            return n1 * x * x;
            } else if (x < 2 / d1) {
            return n1 * (x -= 1.5 / d1) * x + 0.75;
            } else if (x < 2.5 / d1) {
            return n1 * (x -= 2.25 / d1) * x + 0.9375;
            } else {
            return n1 * (x -= 2.625 / d1) * x + 0.984375;
            }
      },
      inBounce:function(x){return 1 - this.outBounce(1 - x)},
      inOutElastic:x=>{
            const c5 = (2*Math.PI)/4.5
            return x === 0
            ? 0
            : x === 1
            ? 1
            : x < 0.5
            ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
            : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
      },
      outElastic:x=>{
            const c4 = (2 * Math.PI) / 3;

            return x === 0
            ? 0
            : x === 1
            ? 1
            : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
      },
      inElastic:x=>{
            const c4 = (2 * Math.PI) / 3;

            return x === 0
            ? 0
            : x === 1
            ? 1
            : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
      },
      inOutBack:x=>{
            const c1 = 1.70158;
            const c2 = c1 * 1.525;

            return x < 0.5
            ? (pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
            : (pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
      },
      outBack:x=>{
            const c1 = 1.70158;
            const c3 = c1 + 1;

            return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2);
      },
      inBack:x=>{
            const c1 = 1.70158;
            const c3 = c1 + 1;

            return c3 * x * x * x - c1 * x * x;
      },
      inOutCubic:x=>x < 0.5 ? 4 * x * x * x : 1 - pow(-2 * x + 2, 3) / 2,
      inOutBounce:function(x){return (x
            <0.5)?(1-this.outBounce(1-2*x))/2:(1+this.outBounce(2*x-1))/2}
}
export default ease