"use client";

import React, { useEffect, useState } from "react";

interface GreetingProps {
  namaManager: string;
}

export default function Greeting({ namaManager }: GreetingProps) {
  const [greeting, setGreeting] = useState("Selamat Datang");

  useEffect(() => {
    const dapatkanGreeting = () => {
      const jam = new Date().getHours();

      if (jam >= 5 && jam < 12) {
        return "Selamat Pagi";
      } else if (jam >= 12 && jam < 15) {
        return "Selamat Siang";
      } else if (jam >= 15 && jam < 18) {
        return "Selamat Sore";
      } else {
        return "Selamat Malam";
      }
    };

    setGreeting(dapatkanGreeting());
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        {greeting}, {namaManager}! 👋
      </h1>
      <p className="text-sm text-slate-500 mt-1">
        Berikut ringkasan data Desa hari ini.
      </p>
    </div>
  );
}