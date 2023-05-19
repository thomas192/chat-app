'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Head from "next/head";
import io from "socket.io-client";

export default function Chat() {
  const router = useRouter();
  const searchParams  = useSearchParams();

  const pseudo = searchParams.get("pseudo");
  const topic = searchParams.get("topic");

  const [message, setMessage] = useState("");
  
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  const [editMode, setEditMode] = useState(false);
  const [editMessageId, setEditMessageId] = useState(null);
  
  useEffect(() => {
    const newSocket = io(`http://localhost:3001`);
    setSocket(newSocket);

    newSocket.emit('join', { topic, pseudo });

    newSocket.on('message', (message) => {
      setMessages((messages) => [...messages, message]);
    });

    newSocket.on('previousMessages', (previousMessages) => {
      setMessages((messages) => [...previousMessages, ...messages]);
    });

    newSocket.on('messageEdited', ({ id, newContent }) => {
      setMessages((messages) => messages.map((message) => 
        message._id === id ? { ...message, message: newContent } : message
      ));
    });

    newSocket.on('messageDeleted', (id) => {
      setMessages((messages) => messages.filter(message => message._id !== id));
    });    

    return () => newSocket.close();
  }, [setSocket]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message !== '') {
      socket.emit('message', { topic, message, pseudo });
      setMessage('');
    }
  };

  const handleEditClick = (id) => {
    setEditMode(true);
    setEditMessageId(id);
  };

  useEffect(() => {
    if (editMode && editMessageId) {
      const messageToEdit = messages.find(message => message._id === editMessageId);
      if (messageToEdit) {
        setMessage(messageToEdit.message);
      }
    }
  }, [editMode, editMessageId]);

  const editSubmit = (e) => {
    e.preventDefault();
    if (message !== '') {
      socket.emit('editMessage', { id: editMessageId, newContent: message, pseudo: pseudo });
      setMessage('');
      setEditMode(false);
      setEditMessageId(null);
    }
  };

  const deleteMessage = (id) => {
    socket.emit('deleteMessage', { id, pseudo });
  };

  const leaveChat = () => {
    socket.emit('leave', { topic, pseudo });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Chat - {topic}</title>
      </Head>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl text-gray-700 font-bold mb-4">
          Topic : {topic}
        </h1>
        <div className="bg-white text-gray-500 shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <ul id="messages" className="overflow-auto h-96 mb-4">
            {messages.map((message, index) => (
              <li key={index} className="relative">
                <strong>{message.pseudo}</strong>: {message.message}
                {message.pseudo === pseudo && (
                  <div>
                    <button
                      className="text-xs absolute right-5 top-0"
                      onClick={() => handleEditClick(message._id)}
                    >
                      ✏️
                    </button>
                    <button
                      className="text-xs absolute right-0 top-0"
                      onClick={() => deleteMessage(message._id)}
                    >
                      ❌
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <form onSubmit={editMode ? editSubmit : sendMessage}>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="focus:outline-none focus:ring-0"
          />
          </form>
        </div>
        <button
          onClick={leaveChat}
          className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
          Leave
        </button>
      </div>
    </div>
  );
}
