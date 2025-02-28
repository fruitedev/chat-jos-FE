import React, { useState, useEffect } from "react";
import styled from "styled-components";

// Define components
const AppWrapper = styled.div`
  display: flex;
  height: 100vh;
`;

const SideNav = styled.div`
  width: 250px;
  background-color: #111828;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const ChatArea = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #030815;
  padding: 20px;
`;

const Thread = styled.div`
  margin: 10px 0;
  padding: 10px;
  //background-color: #444;
  cursor: pointer;
`;

const NewChatButton = styled.button`
  background-color: #030815;
  border: none;
  padding: 13px;
  color: #f4f4f4;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-weight: bold;
  border: 3px solid #1b2334;
`;


const InputPromptWrapper = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const InputPrompt = styled.textarea`
  width: 100%;
  padding: 10px;
  border-radius: 15px;
  border: 1px solid #888;
  font-size: 16px;
  resize: none;
  min-height: 40px;
  max-height: 200px;
  overflow-y: auto;
  background-color: transparent;
  color: white;
  margin-right: 10px;
`;

const SendButton = styled.button`
  background-color: #61dafb;
  border: none;
  padding: 10px;
  color: white;
  font-size: 14px;
  cursor: pointer;
`;

const ModelCardWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ModelCard = styled.div`
  width: 22%;
  background-color: transparent;
  border: 1px solid #5447ba;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;


  border: ${(props) => (props.selected ? "2px solid #5447ba" : "2px solid #1b2334")};
`;

const ModelTitle = styled.h4`
  margin: 10px 0;
  color: #fff;
`;

const ModelDescription = styled.p`
  font-size: 12px;
  color: #666;
`;

const App = () => {
  const [threads, setThreads] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);

  const models = [
    { id: "model1", name: "PRD Assistant", description: "Description for Model 1" },
    { id: "model2", name: "Legal Policy GPT", description: "Description for Model 2" },
    { id: "model3", name: "General Chat", description: "Description for Model 3" },
    { id: "model4", name: "Research Assistant", description: "Description for Model 4" },
  ];

  // Fetch conversation history on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch("http://localhost:3000/history");
      const data = await response.json();
      setHistory(data);
      setThreads(data.map((thread) => thread.threadId));
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleNewChat = () => {
    const newThreadId = `chat-${Date.now()}`;

    // Add the new thread to the threads array
    setThreads((prevThreads) => [...prevThreads, newThreadId]);

    // Add the new thread to the history state with an empty conversations array
    const newHistory = {
      threadId: newThreadId,
      conversations: [],
    };

    setHistory((prevHistory) => [...prevHistory, newHistory]);

    // Set the selected thread to the new thread
    setSelectedThreadId(newThreadId);
  };


  const handleThreadSelect = (threadId) => {
    setSelectedThreadId(threadId);
  };



  const handleSendMessage = async () => {
    if (!selectedThreadId || !inputText) {
      alert("Please select a thread and enter a message.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/chat?threadId=${selectedThreadId}&prompt=${encodeURIComponent(inputText)}`
      );

      const data = await response.json();

      console.log('API Response:', data);

      if (response.ok) {
        console.log('Updating history with:', data.thread);

        // Update the history with the new thread data
        const updatedHistory = history.map((thread) => {
          if (thread.threadId === data.thread.threadId) {
            return {
              ...thread,
              conversations: data.thread.conversations,
            };
          }
          return thread;
        });

        // If the thread is new, add it to the history
        if (!history.some(thread => thread.threadId === data.thread.threadId)) {
          updatedHistory.push(data.thread);
        }

        // Update state with the new history
        setHistory(updatedHistory);

        // Ensure the input is cleared and the UI updates
        setInputText("");

        // Keep the selected thread ID to continue the conversation
        setSelectedThreadId(selectedThreadId);

      } else {
        alert(data.error || "Error sending message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };



  return (
    <AppWrapper>
      {/* Left Side Navigation */}
      <SideNav>
        <NewChatButton onClick={handleNewChat}>
          <svg
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
            fill-rule="evenodd"
            clip-rule="evenodd"
            style={{ marginRight: '8px', transform: 'scale(0.8)' }}
          >
            <path fill="white" d="M11.5 0c6.347 0 11.5 5.153 11.5 11.5s-5.153 11.5-11.5 11.5-11.5-5.153-11.5-11.5 5.153-11.5 11.5-11.5zm0 1c5.795 0 10.5 4.705 10.5 10.5s-4.705 10.5-10.5 10.5-10.5-4.705-10.5-10.5 4.705-10.5 10.5-10.5zm.5 10h6v1h-6v6h-1v-6h-6v-1h6v-6h1v6z"/>
          </svg>
          New Chat
        </NewChatButton>

        {threads.map((threadId, index) => (
          <Thread
            key={index}
            onClick={() => handleThreadSelect(threadId)}
            style={{
              backgroundColor: selectedThreadId === threadId ? "#20293a" : "#111828",
              borderRadius: selectedThreadId === threadId ? "10px" : "0",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <div>
              <div style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                overflow: 'hidden',
                WebkitBoxOrient: 'vertical'
              }}>{history.find((thread) => thread.threadId === threadId)?.conversations[0]?.prompt || `How can I help you today?`}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{new Date(history.find((thread) => thread.threadId === threadId)?.conversations[0]?.createdAt || '02/28/2025').toLocaleDateString('en-US')}</div>
            </div>
          </Thread>
        ))}
      </SideNav>


      {/* Chat Area */}
      <ChatArea>
        {/* Model Selection Cards */}
        <ModelCardWrapper>
          {models.map((model) => (
            <ModelCard
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              selected={selectedModel === model.id}
            >
              <ModelTitle>{model.name}</ModelTitle>
              <ModelDescription>{model.description}</ModelDescription>
            </ModelCard>
          ))}
        </ModelCardWrapper>

        <h2>Chat Area - {selectedThreadId || "Select a thread"}</h2>

        {/* Display message if no chats are present */}
        {selectedThreadId && history.find((thread) => thread.threadId === selectedThreadId)?.conversations.length === 0 && (
          <div style={{
            backgroundColor: '#1b2334',
            border: '1px solid #444',
            borderRadius: '10px',
            padding: '50px',
            paddingRight: '250px',
            color: '#888',
            marginTop: '20px',
            textAlign: 'right',
            maxWidth: '60%',
            marginLeft: 'auto',
          }}>
            Hello, how can I help you today?
          </div>
        )}

        {/* Display selected thread's conversation in a conversational style */}
        <div>
          {selectedThreadId &&
            history
              .find((thread) => thread.threadId === selectedThreadId)
              ?.conversations.map((conversation, index) => (
                <React.Fragment key={index}>
                  <div
                    style={{
                      marginBottom: "10px",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#5447ba",
                        color: "#fff",
                        paddingLeft: "20px",
                        paddingRight: "20px",
                        padding: "10px",
                        borderRadius: "7px",
                        maxWidth: "60%",
                        marginRight: "20px",
                        wordWrap: "break-word",
                      }}
                    >
                      <p>{conversation.prompt}</p>
                    </div>
                  </div>
                  {conversation.response && (
                    <div
                      style={{
                        marginBottom: "10px",
                        display: "flex",
                        justifyContent: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "#444",
                          color: "#fff",
                          paddingLeft: "20px",
                          paddingRight: "20px",
                          padding: "10px",
                          borderRadius: "10px",
                          maxWidth: "60%",
                          wordWrap: "break-word",
                          marginLeft: "20px",
                        }}
                      >
                        <p>{conversation.response}</p>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
        </div>

        {/* Text Prompt and Send Button */}
        <InputPromptWrapper>
          <InputPrompt
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button onClick={handleSendMessage} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
            </svg>
          </button>
        </InputPromptWrapper>
      </ChatArea>
    </AppWrapper>
  );
};

export default App;

