"use client";
import { useSearchParams } from "next/navigation";
export default function Room() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  return (
    <>
      <div className="bg-black text-3xl text-shadow-amber-100">Room</div>
      <div>hii {name}</div>
    </>
  );
}
