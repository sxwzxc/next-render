// 仿苹果 FaceID 加载动画（纯 CSS + SVG mask 实现）
// 参考实现：https://forum.trae.cn/t/topic/232
// 核心：SVG mask 多边形遮罩 + 多轨异步旋转 + contrast 对焦 + hue-rotate 色相旋转
const FaceID = () => {
  return (
    <div className="w-full h-full min-h-[520px] flex items-center justify-center bg-[#111] relative overflow-hidden">
      <style>{`
        .faceid-stars {
          position: absolute;
          inset: -50%;
          width: 200%;
          height: 200%;
          background-image:
            radial-gradient(1px 1px at 20px 30px, #6fe0ff 50%, transparent 51%),
            radial-gradient(1px 1px at 120px 80px, #ffffff 50%, transparent 51%),
            radial-gradient(1.5px 1.5px at 200px 160px, #4cc8ff 50%, transparent 51%),
            radial-gradient(1px 1px at 300px 60px, #9fe8ff 50%, transparent 51%),
            radial-gradient(1px 1px at 80px 220px, #ffffff 50%, transparent 51%),
            radial-gradient(1.5px 1.5px at 360px 280px, #6fe0ff 50%, transparent 51%),
            radial-gradient(1px 1px at 160px 340px, #4cc8ff 50%, transparent 51%),
            radial-gradient(1px 1px at 260px 400px, #ffffff 50%, transparent 51%),
            radial-gradient(1px 1px at 60px 460px, #9fe8ff 50%, transparent 51%),
            radial-gradient(1.5px 1.5px at 420px 120px, #6fe0ff 50%, transparent 51%);
          background-repeat: repeat;
          background-size: 480px 480px;
          opacity: 0.55;
          animation: faceid-stardrift 60s linear infinite;
          pointer-events: none;
        }
        @keyframes faceid-stardrift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-480px, -480px); }
        }
        .faceid-loader {
          --color-one: #ffbf48;
          --color-two: #be4a1d;
          --color-three: #ffbf4780;
          --color-four: #bf4a1d80;
          --color-five: #ffbf4740;
          --time-animation: 2s;
          --size: 3;
          position: relative;
          border-radius: 50%;
          transform: scale(var(--size));
          box-shadow:
            0 0 25px 0 var(--color-three),
            0 20px 50px 0 var(--color-four);
          animation: faceid-colorize calc(var(--time-animation) * 3) ease-in-out infinite;
        }
        .faceid-loader::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border-top: solid 1px var(--color-one);
          border-bottom: solid 1px var(--color-two);
          background: linear-gradient(180deg, var(--color-five), var(--color-four));
          box-shadow:
            inset 0 10px 10px 0 var(--color-three),
            inset 0 -10px 10px 0 var(--color-four);
        }
        .faceid-loader .faceid-box {
          width: 100px;
          height: 100px;
          background: linear-gradient(180deg, var(--color-one) 30%, var(--color-two) 70%);
          mask: url(#faceid-clipping);
          -webkit-mask: url(#faceid-clipping);
        }
        .faceid-loader svg {
          position: absolute;
        }
        .faceid-loader svg #faceid-clipping {
          filter: contrast(15);
          animation: faceid-roundness calc(var(--time-animation) / 2) linear infinite;
        }
        .faceid-loader svg #faceid-clipping polygon {
          filter: blur(7px);
        }
        .faceid-loader svg #faceid-clipping polygon:nth-child(1) {
          transform-origin: 75% 25%;
          transform: rotate(90deg);
        }
        .faceid-loader svg #faceid-clipping polygon:nth-child(2) {
          transform-origin: 50% 50%;
          animation: faceid-rotation var(--time-animation) linear infinite reverse;
        }
        .faceid-loader svg #faceid-clipping polygon:nth-child(3) {
          transform-origin: 50% 60%;
          animation: faceid-rotation var(--time-animation) linear infinite;
          animation-delay: calc(var(--time-animation) / -3);
        }
        .faceid-loader svg #faceid-clipping polygon:nth-child(4) {
          transform-origin: 40% 40%;
          animation: faceid-rotation var(--time-animation) linear infinite reverse;
        }
        .faceid-loader svg #faceid-clipping polygon:nth-child(5) {
          transform-origin: 40% 40%;
          animation: faceid-rotation var(--time-animation) linear infinite reverse;
          animation-delay: calc(var(--time-animation) / -2);
        }
        .faceid-loader svg #faceid-clipping polygon:nth-child(6) {
          transform-origin: 60% 40%;
          animation: faceid-rotation var(--time-animation) linear infinite;
        }
        .faceid-loader svg #faceid-clipping polygon:nth-child(7) {
          transform-origin: 60% 40%;
          animation: faceid-rotation var(--time-animation) linear infinite;
          animation-delay: calc(var(--time-animation) / -1.5);
        }
        @keyframes faceid-rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes faceid-roundness {
          0% { filter: contrast(15); }
          20% { filter: contrast(3); }
          40% { filter: contrast(3); }
          60% { filter: contrast(15); }
          100% { filter: contrast(15); }
        }
        @keyframes faceid-colorize {
          0% { filter: hue-rotate(0deg); }
          20% { filter: hue-rotate(-30deg); }
          40% { filter: hue-rotate(-60deg); }
          60% { filter: hue-rotate(-90deg); }
          80% { filter: hue-rotate(-45deg); }
          100% { filter: hue-rotate(0deg); }
        }
      `}</style>
      <div className="faceid-stars" />
      <div className="faceid-loader">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <defs>
            <mask id="faceid-clipping">
              <polygon points="0,0 100,0 100,100 0,100" fill="black" />
              <polygon points="25,25 75,25 50,75" fill="white" />
              <polygon points="50,25 75,75 25,75" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
            </mask>
          </defs>
        </svg>
        <div className="faceid-box" />
      </div>
    </div>
  )
}

export default FaceID
