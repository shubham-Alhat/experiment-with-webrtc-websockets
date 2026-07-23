"use client";
import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [name, setName] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
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

  const startAudioStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      console.log(stream);
      if (audioRef.current) {
        audioRef.current.srcObject = stream;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeFilter = (e: ChangeEvent<HTMLSelectElement>) => {
    if (!videoRef.current) {
      console.log("video ref not found..");
      return;
    }

    console.log(e.target.value);
    videoRef.current.classList.remove("invert", "grayscale", "blur-md");
    if (e.target.value === "INVERT") videoRef.current.classList.add("invert");
    if (e.target.value === "GREY") videoRef.current.classList.add("grayscale");
    if (e.target.value === "BLUR") videoRef.current.classList.add("blur-md");
  };

  return (
    <>
      <div className="text-amber-50 font-bold">Omegle clone</div>

      <div>
        <video
          ref={videoRef}
          className="h-[500px] w-[500px] rounded-lg"
          autoPlay
          playsInline
          muted
        ></video>
      </div>
      <div>
        <button onClick={init} className="bg-blue-800 w-[50px] cursor-pointer">
          join
        </button>
      </div>
    </>
  );
}
