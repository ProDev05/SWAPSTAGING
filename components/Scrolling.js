import Marquee from "react-fast-marquee";

export const Scrolling = () => {
  return (
    <Marquee
      direction="right"
      speed={5}
      gradient={false}
      style={{
        position: "absolute",
        opacity: 0.7,
        overflow: "hidden",
        width: "100%",
        height: "100%",
        backgroundColor: '#f6f6f7'
      }}
      className="marquee-wrapper"
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={`container-${index}`} className="flex items-center justify-between w-full h-full -rotate-12">
          {Array.from({ length: 4 }).map((_, index) => (
            <p key={`text-${index}`} className="marquee-text">
              swap
            </p>
          ))}
        </div>
      ))}
    </Marquee>
  );
};
