import React from 'react';
import { MessagesProps } from '../../../shared/messages';

const Messages: React.FC<MessagesProps> = ({
  selectedChat,
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  onKeyPress,
  messagesEndRef,
  currentUserId,
  onLoadMore,
  isLoadingMore,
  hasMore
}) => {
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    // Load more when scrolled to top and there are more messages to load
    if (element.scrollTop === 0 && hasMore && !isLoadingMore) {
      onLoadMore();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {selectedChat ? (
        <>
          {/* Header */}
          <div className="border-b border-gray-800 p-4 flex items-center bg-gray-850">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
              {selectedChat.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold">{selectedChat.user.name}</h2>
              <p className="text-sm text-gray-400">
                {selectedChat.user.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          {/* Messages Area with Scroll Handler */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950"
            onScroll={handleScroll}
          >
            {/* Load More Indicator */}
            {isLoadingMore && (
              <div className="flex justify-center py-2">
                <div className="text-gray-400 text-sm">Loading older messages...</div>
              </div>
            )}

            {/* Show Load More Prompt */}
            {hasMore && !isLoadingMore && messages.length > 0 && (
              <div className="flex justify-center py-2">
                <button 
                  onClick={onLoadMore}
                  className="text-blue-400 text-sm hover:text-blue-300"
                >
                  Load older messages
                </button>
              </div>
            )}

            {/* Messages */}
            {messages.length === 0 && !isLoadingMore ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <div className="text-2xl mb-2">💭</div>
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                   key={`${message.id}-${message.timestamp}`} 
                  className={`flex ${
                    message.senderId === currentUserId ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.senderId === currentUserId
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-800 text-gray-100 rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === currentUserId ? 'text-blue-200' : 'text-gray-400'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800 bg-gray-850 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={onSendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-2">💬</div>
            <h3 className="text-lg font-semibold">Your Messages</h3>
            <p>Select a chat or search for users to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;