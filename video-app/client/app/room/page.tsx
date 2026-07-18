"use client";
import { useSearchParams } from "next/navigation";
export default function Room() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  return (
    <>
      <div className="w-full min-h-screen bg-black">
        <div className="w-full">
          <h1 className="m-3 text-xl">Recording stream</h1>
        </div>
      </div>
    </>
  );
}
