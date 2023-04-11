// Chat.js
import React, { useState, useEffect, useRef } from "react";
import { Orbitron } from "next/font/google";
import { isMobile } from "react-device-detect";
import { Analytics } from "@vercel/analytics/react";

const orbitron = Orbitron({ subsets: ["latin"] });

const STORAGE_KEY = "samantha_agi";

const appendToRecords = (role, message, record) => {
  const hasRecord = record !== undefined;
  let storage = getRecords();
  let records = storage.records || [];
  records = records.concat({ role, content: hasRecord ? record : message });
  let messages = storage.messages || [];
  messages = messages.concat({
    sender: role === "user" ? "user" : "ai",
    text: message,
  });
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ records, messages })
  );
};

const overwriteLastRecord = (role, message, record) => {
  const hasRecord = record !== undefined;
  let storage = getRecords();
  let records = storage.records || [];
  records = records
    .slice(0, -1)
    .concat({ role, content: hasRecord ? record : message });
  let messages = storage.messages || [];
  messages = messages
    .slice(0, -1)
    .concat({ sender: role === "user" ? "user" : "ai", text: message });
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ records, messages })
  );
};

const getRecords = () => {
  return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
};

const getMessages = () => {
  return getRecords().messages || [];
};

/*
Samantha's thoughts are read as a ReadableStream from the OAI endpoint. The stream is then parsed as the thoughts
come in to remove latency.
 */
const getSamanthaResponse = async ({
  newUserMessage,
  setMessages,
  setAiThoughts,
}) => {
  if (newUserMessage) {
    appendToRecords("user", newUserMessage);
  }
  const response = await fetch(`/api/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: getRecords().records || [],
    }),
  });

  const data = response.body;
  if (!data) {
    return;
  }
  const reader = data.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let parsedChunk = "";
  let wholeChunk = "";
  const hasMessage = newUserMessage !== undefined;
  if (hasMessage) {
    setAiThoughts((prevThoughts) => [
      ...prevThoughts,
      `I received a message: "${newUserMessage}"`,
    ]);
  } else {
    setAiThoughts((prevThoughts) => [
      ...prevThoughts,
      getMessages().length === 0
        ? `Someone new is visiting!`
        : `I have company again!`,
    ]);
    if (!isMobile) {
      // wait for first few thoughts to pop up on first load
      await new Promise((resolve) => setTimeout(resolve, 1300));
    }
  }
  let foundMsg = false;

  let message = "";
  let lastThought = "";
  let stopTalking = false;
  while (!done) {
    // read stream
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value);
    parsedChunk += chunkValue;
    wholeChunk += chunkValue;
    const thoughtREGEX = /^((.||\n)*<\/[^<>/]+>)((.||\n)*)$/;
    const match = thoughtREGEX.exec(parsedChunk);
    if (match) {
      const thought = match[1];
      parsedChunk = match[2] || "";
      // cleanup
      const stripper = /^(.||\n)*>((.||\n)*)<\/(.||\n)*$/;
      let strippedThought = stripper.exec(thought)[2];
      strippedThought = strippedThought.replace(/<[^<>]+>/g, "");
      if (
        thought.includes("stop talk") ||
        thought.includes("end the conversation")
      ) {
        stopTalking = true;
      }
      if (!stopTalking) {
        if (thought.trim().startsWith("<ME")) {
          message = strippedThought;
          foundMsg = true;
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: message, sender: "ai" },
          ]);
          setAiThoughts((prevThoughts) => [
            ...prevThoughts,
            `I sent the message: ${strippedThought}`,
          ]);
          appendToRecords("assistant", message, wholeChunk);
        } else {
          setAiThoughts((prevThoughts) => [...prevThoughts, strippedThought]);
        }
        lastThought = strippedThought;
        if (getRecords()?.records === undefined && !isMobile) {
          // wait for first few thoughts to pop up on first load
          await new Promise((resolve) => setTimeout(resolve, 1300));
        }
      }
    }
    // sometimes the last thought doesn't come with a completed html block. handle that edge case
    if (parsedChunk.trim().startsWith("<SELF") && done) {
      lastThought = parsedChunk;
      lastThought = lastThought.replace(/<[^<>]+>/g, "");
      setAiThoughts((prevThoughts) => [...prevThoughts, lastThought]);
    }
  }
  // add in the record information after its completely entered
  if (!stopTalking) {
    overwriteLastRecord("assistant", message, wholeChunk);
  }
};

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const aiMessagesEndRef = useRef(null);
  const [aiThoughts, setAiThoughts] = useState([]);

  React.useEffect(() => {
    // remove to keep store to keep conversation stored in browser
    window.localStorage.removeItem(STORAGE_KEY);
    setMessages(getMessages());
  }, []);

  const scrollToBottomThoughts = () => {
    aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottomThoughts();
  }, [aiThoughts]);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = (event) => {
    getSamanthaResponse({
      newUserMessage: message,
      setMessages,
      setAiThoughts,
    });
    event.preventDefault();

    // clear message on send
    if (message.trim() !== "") {
      setMessages([...messages, { text: message, sender: "user" }]);
      setMessage("");
    }
  };

  const convoStarted = useRef(false);
  useEffect(() => {
    if (!convoStarted.current) {
      // get first reply from samantha
      convoStarted.current = true;
      getSamanthaResponse({ setMessages, setAiThoughts });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 relative flex justify-center">
      <div className="flex container px-4 py-12 justify-center">
        <div>
          <h1
            className={`text-4xl text-white font-semibold mb-4 text-center pb-7 ${orbitron.className}`}
          >
            SAMANTHA AGI
          </h1>
          <Messages
            handleMessageChange={handleMessageChange}
            message={message}
            messages={messages}
            handleSendMessage={handleSendMessage}
          />
        </div>
        {!isMobile && (
          <AIThoughts
            aiThoughts={aiThoughts}
            aiMessagesEndRef={aiMessagesEndRef}
          />
        )}
      </div>
    </div>
  );
};

function Messages({
  handleMessageChange,
  message,
  messages,
  handleSendMessage,
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setTimeout(() => scrollToBottom(), 100);
  }, [messages]);
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-96">
      <h1 className="text-xl font-semibold mb-4 text-center">Share</h1>
      <div className="flex flex-col space-y-4 h-96 overflow-y-auto mb-4 min-h-40 hide-scrollbar">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === "ai" ? "" : "justify-end"}`}
          >
            <div
              className={`${
                message.sender === "ai"
                  ? "bg-purple-200 text-black"
                  : "bg-purple-600 text-white"
              } px-4 py-2 rounded-lg shadow-md`}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSendMessage}
        className="flex items-center space-x-4"
      >
        <input
          type="text"
          className="text-black w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
          placeholder="Type your message here..."
          value={message}
          onChange={handleMessageChange}
        />
        <button
          type="submit"
          className="rounded-lg bg-purple-600 text-white px-4 py-2 font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
        >
          Send
        </button>
      </form>
      <Analytics />
    </div>
  );
}

function AIThoughts({ aiThoughts, aiMessagesEndRef }) {
  return (
    <div className="bg-white bg-opacity-0 rounded-lg w-96">
      <div className="h-full overflow-y-auto fixed ml-10 w-96 mx-auto hide-scrollbar">
        <div className="flex-col space-y-4 overflow-y-auto mb-4 hide-scrollbar pb-60 mr-4">
          {aiThoughts.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === "ai" ? "" : "justify-end"}`}
            >
              <div
                className={`text-white bg-purple-100 bg-opacity-30 px-4 py-2 rounded-[35px] shadow-sm opacity-0 transition-all duration-500 ease-in-out animate-fade-in`}
              >
                {message}
              </div>
            </div>
          ))}
          <div ref={aiMessagesEndRef} />
        </div>
      </div>
    </div>
  );
}

export default function ChatApp() {
  return <Chat />;
}
