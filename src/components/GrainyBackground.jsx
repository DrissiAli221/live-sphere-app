const GrainyBackground = () => {
  return (
    <svg width="0" height="0">
      <filter id="noise-filter">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="1.34"
          numOctaves="4"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="linear" slope="0.46" />
          <feFuncG type="linear" slope="0.46" />
          <feFuncB type="linear" slope="0.46" />
          <feFuncA type="linear" slope="0.6" />
        </feComponentTransfer>
        <feComponentTransfer>
          <feFuncR type="linear" slope="1.35" intercept="-0.18" />
          <feFuncG type="linear" slope="1.35" intercept="-0.18" />
          <feFuncB type="linear" slope="1.35" intercept="-0.18" />
        </feComponentTransfer>
      </filter>
    </svg>
  );
};

export default GrainyBackground;
