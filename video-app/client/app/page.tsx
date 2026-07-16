"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Home() {
  const [name, setName] = useState("");
  const router = useRouter();
  return (
    <>
      <div className="text-amber-50 font-bold">Omegle clone</div>
      <input type="text" onChange={(e) => setName(e.target.value)} />
      <button onClick={() => router.push(`/room?name=${name}`)}>
        Join Room
      </button>
    </>
  );
}
