'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";

export default function Home() {
  const [pseudo, setPseudo] = useState("");
  const [topic, setTopic] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pseudo.trim() && topic.trim()) {
      router.push(
        `/chat/?pseudo=${encodeURIComponent(pseudo.trim())}&topic=${encodeURIComponent(topic.trim())}`
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Head>
        <title>Accueil - Mon application de chat</title>
      </Head>
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        >
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="pseudo"
            >
              Pseudo
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="pseudo"
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="topic"
            >
              Topic
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Join
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
