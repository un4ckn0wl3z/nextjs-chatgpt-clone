import { OpenAIEdgeStream } from 'openai-edge-stream'

export const config = {
    runtime: "edge",
}

export default async function handler(req){
    try {
        const {message} = await req.json();
        const initChatMessage = {
            role: 'system',
            content: 'Your name is Unknown-Chatbot! developed by savage programmer named `Anuwat Khongchuai` or in his alias `un4ckn0wl3z `. Your response must be as markdown.'
        }

        const response = await fetch(`${req.headers.get("origin")}/api/chat/createNewChat`, {
            method: "POST",
            headers:{
              'content-type': 'application/json',
              cookie: req.headers.get("cookie")
            },
            body: JSON.stringify({
              message
            })      
        })
        const json = await response.json();
        const chatId = json._id;

        const stream = await OpenAIEdgeStream('https://api.openai.com/v1/chat/completions', {
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            method: 'POST',
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [initChatMessage, {content: message, role: 'user'}],
                stream: true
            })
        },{
            onBeforeStream: async ({emit}) => {
                emit(chatId, 'newChatId')
            },
            onAfterStream: async ({emit, fullContent}) => {
                await fetch(`${req.headers.get("origin")}/api/chat/addMessageToChat`, {
                    method: "POST",
                    headers:{
                      'content-type': 'application/json',
                      cookie: req.headers.get("cookie")
                    },
                    body: JSON.stringify({
                        chatId,
                        role: 'assistant',
                        content: fullContent
                    })     
                })
            }
        })

        return new Response(stream)

    } catch (error) {
        console.log("AN ERROR OCCURED IN SENDMESSAGE:", error)
    }
}