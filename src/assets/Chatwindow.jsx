import React, { useState, useEffect, useRef } from 'react';
import Message from './Message';
import ChatboxInput from './Chatinput';
import { handleCrawlerCommand } from "./api";

const Chatwindow = () => {
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const [editedMessageIndex, setEditedMessageIndex] = useState(-1);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if(messages.length === 0){
            setMessages([{sender: 'System', text: "Welcome to the LLM Browser! Type in your request prefixed by '!objective' to get started!", isIncoming: true, timestamp: Date.now()}]);
        }
    }, []);

    const handleUserSend = async (text) => {
        let newCommand;
        if(text.length === 0){
            setMessages([...messages, {sender: 'System', text: "is typing", isIncoming: true, timestamp: Date.now()}]);
            newCommand = await handleCrawlerCommand('confirm');
            if(newCommand){
                setMessages([...messages, {sender: 'System', text: "**Recommend Command:** " + newCommand.text, image: newCommand.image, url: newCommand.url, isIncoming: true, timestamp: Date.now()}]);
            }
            return;
        }
        const newMessage = {
            sender: 'User',
            text: text,
            isIncoming: false,
            timestamp: Date.now(),
        };
        let updatedMessages = [...messages, newMessage];
        if(text.startsWith('!')){
            const command = text.split(' ')[0].substring(1);
            const objective = text.split(' ').slice(1).join(' ');
            switch (command.toLowerCase()) {
                case 'restart':
                    setMessages([{sender: 'System', text: "Welcome to the LLM Browser! Type in your request prefixed by '!objective' to get started!", isIncoming: true, timestamp: Date.now()}]);
                    localStorage.removeItem('conversation');
                    localStorage.removeItem('objective');
                    localStorage.removeItem('previousCommand');
                    break;
                case 'confirm':
                    setMessages([...updatedMessages, {sender: 'System', text: "is typing", isIncoming: true, timestamp: Date.now()}]);
                    newCommand = await handleCrawlerCommand('confirm');
                    if(newCommand){
                        setMessages([...updatedMessages, {sender: 'System', text: "**Recommend Command:** " + newCommand.text, image: newCommand.image, url: newCommand.url, isIncoming: true, timestamp: Date.now()}]);
                    }
                    break;
                case 'objective':
                    setMessages([...updatedMessages, {sender: 'System', text: "is typing", isIncoming: true, timestamp: Date.now()}]);
                    localStorage.removeItem('previousCommand');
                    newCommand = await handleCrawlerCommand('objective', objective);
                    if(newCommand){
                        setMessages([...updatedMessages, {sender: 'System', text: "**Recommend Command:** " + newCommand.text, image: newCommand.image, url: newCommand.url, isIncoming: true, timestamp: Date.now()}]);
                    }
                    break;
                case 'suggest':
                    setMessages([...updatedMessages, {sender: 'System', text: "is typing", isIncoming: true, timestamp: Date.now()}]);
                    newCommand = await handleCrawlerCommand('suggest', objective);
                    if(newCommand){
                        setMessages([...updatedMessages, {sender: 'System', text: "**Recommend Command:** " + newCommand.text, image: newCommand.image, url: newCommand.url, isIncoming: true, timestamp: Date.now()}]);
                    }
                    break;
                case 'help':
                    setMessages([...updatedMessages, {sender: 'System', text: "**Available commands:** !confirm, !help, !restart, !objective, !suggest.", isIncoming: true, timestamp: Date.now()}]);
                    break;
                default:
                    setMessages([...updatedMessages, {sender: 'System', text: "**Command not recognized!**", isIncoming: true, timestamp: Date.now()}]);
                    break;
            }
        }
    };
      
    const handleMessageKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.target.blur();
        }
    };

    return (
        <>
        <div className="flex flex-col">
            <div className="mx-auto w-1/2">
                <div className="h-[calc(75vh-7rem)] overflow-x-hidden relative flex flex-col justify-start bg-green-800 mt-4 rounded-t-lg p-2 shadow-sm backdrop-blur-md md:h-[75vh] border-2 border-solid border-emerald-500">
                    {messages.map((message, index) => (
                        <Message
                        key={index}
                        message={message}
                        index={index}
                        editedMessageIndex={editedMessageIndex}
                        handleMessageKeyDown={handleMessageKeyDown}
                        messages={messages}
                        />
                    ))}
                    <div ref={messagesEndRef}></div>
                </div>
                <ChatboxInput onSend={handleUserSend}/>
            </div>
        </div>
      </>
    );
}
export default Chatwindow;