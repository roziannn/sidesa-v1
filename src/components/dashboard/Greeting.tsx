"use client";

import React, {
  useEffect,
  useState,
} from "react";

interface GreetingProps {
  namaManager: string;
}

export default function Greeting({
  namaManager,
}: GreetingProps) {
  const [greeting, setGreeting] =
    useState("Selamat Datang");

  useEffect(() => {
    const dapatkanGreeting = () => {
      const jam =
        new Date().getHours();

      if (
        jam >= 5 &&
        jam < 12
      ) {
        return "Selamat Pagi";
      }

      if (
        jam >= 12 &&
        jam < 15
      ) {
        return "Selamat Siang";
      }

      if (
        jam >= 15 &&
        jam < 18
      ) {
        return "Selamat Sore";
      }

      return "Selamat Malam";
    };

    setGreeting(
      dapatkanGreeting()
    );
  }, []);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {greeting}, {namaManager}! 👋
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Berikut ringkasan data desa hari ini.
        </p>
      </div>
    </div>
  );
}