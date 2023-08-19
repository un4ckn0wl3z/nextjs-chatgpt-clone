import { ChatSidebar } from "components/ChatSidebar";
import { Message } from "components/Message";
import Head from "next/head";
import { useEffect, useState } from "react";
import { streamReader } from 'openai-edge-stream'
import {v4 as uuid} from 'uuid'
import { useRouter } from "next/router";


export default function ChatPage({chatId}) {

  const [newChatId, setNewChatId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [incomingMessage, setIncomingMessage] = useState("");
  const [newChatMessages, setNewChatMessages] = useState([]);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if(!generatingResponse && newChatId){
      setNewChatId(null)
      router.push(`/chat/${newChatId}`)
    }
  }, [newChatId, generatingResponse, router])

  const handleSubmit = async (e) =>{
    e.preventDefault();
    setGeneratingResponse(true)
    setNewChatMessages((prev) => {
      const newChatMessages = [...prev, {
        _id: uuid(),
        role: 'user',
        content: messageText
      }]
      return newChatMessages;
    })

    setMessageText("")
    const response = await fetch(`/api/chat/sendMessage`,{
      method: "POST",
      headers:{
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        message: messageText
      })
    })
    const data = response.body;
    if(!data) return;

    const reader = data.getReader();
    await streamReader(reader, (message) => {
      if(message.event === 'newChatId'){
        setNewChatId(message.content)
      }else{
        setIncomingMessage(s => `${s}${message.content}`)
      }
      
    })

    setGeneratingResponse(false)

  }

  return (
    <>
      <Head>
        <title>New Chat</title>
      </Head>

      <div className="grid h-screen grid-cols-[260px_1fr]">
        <ChatSidebar chatId={chatId}/>
        <div className="bg-gray-700 flex flex-col overflow-hidden">
          <div className="flex-1 text-white overflow-scroll no-scrollbar">
            {newChatMessages.map((message) =>  (
              <Message key={message._id} role={message.role} content={message.content} />
            ))}
            {
              !!incomingMessage && (
                <Message role="assistant" content={incomingMessage} />
              )
            }

            </div>
          <footer className="bg-gray-800 p-10">
            <form onSubmit={handleSubmit}>
              <fieldset className="flex gap-2" disabled={generatingResponse}>
                <textarea onChange={e=> setMessageText(e.target.value)} value={messageText} placeholder={generatingResponse ? "" : "Send a message..."} className="w-full resize-none rounded-md bg-gray-700 p-2 text-white focus:border-emerald-500 focus:bg-gray-500 focus:outline focus:outline-emerald-500"/>
                <button type="submit" className="btn">Send</button>
              </fieldset>
            </form>
          </footer>
        </div>
      </div>
      
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const chatId = ctx.params?.chatId?.[0] || null;
  return {
    props: {
      chatId
    }
  }
}