"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
export default function Home() {
  const [name, setName] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  const init = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      console.log("stream obj :", stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      } else {
        console.log("video ref not available");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="text-amber-50 font-bold">Omegle clone</div>
      <input type="text" onChange={(e) => setName(e.target.value)} />
      <div className="w-full">
        <video
          ref={videoRef}
          className="h-[500px] w-[500px] rounded-lg"
          autoPlay
          playsInline
          muted
        ></video>
      </div>
      <button onClick={init} className="bg-blue-600 text-center">
        Join Room
      </button>
    </>
  );
}
