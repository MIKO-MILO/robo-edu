import Image from "next/image";

export default function Awan() {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-2 pointer-events-none leading-none">
      <Image
        src="/images/awn.png"
        alt="Ilustrasi Awan"
        width={1920}
        height={150}
        className="w-full h-auto object-cover object-bottom"
        priority
      />
    </div>
  );
}
