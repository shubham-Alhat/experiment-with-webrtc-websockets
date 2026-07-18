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
      <input type="text" onChange={(e) => setName(e.target.value)} />
      <div className="w-full">
        <video
          ref={videoRef}
          className="h-[500px] w-[500px] rounded-lg"
          autoPlay
          playsInline
          muted
        ></video>

        <form className="max-w-sm mx-auto">
          <label className="block mb-2.5 text-sm font-medium text-heading">
            Select filter
          </label>
          <select
            onChange={handleChangeFilter}
            id="filters"
            className="block w-full px-3 py-2.5 bg-black border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body"
          >
            <option selected value="NONE">
              None
            </option>
            <option value="INVERT">Invert</option>
            <option value="GREY">Grey-scale</option>
            <option value="BLUR">Blur</option>
          </select>
        </form>
      </div>
      <button onClick={init} className="bg-blue-600 text-center">
        Join Room
      </button>
      <br className="bg-red-500 p-2 w-2 " />
      <hr className="bg-red-500 p-2 w-full " />
      <div className="w-full flex justify-center items-center">
        <audio className="m-5" ref={audioRef} controls autoPlay></audio>
      </div>
      <button
        onClick={startAudioStream}
        className="bg-blue-600 text-center cursor-pointer"
      >
        Audio stream
      </button>
    </>
  );
}
