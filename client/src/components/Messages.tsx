import React from 'react';
import { MessagesProps } from '../../../shared/messages';
import { Loader2, Paperclip } from 'lucide-react';
// import Image from 'next/image';

const Messages: React.FC<MessagesProps> = ({
  selectedChat,
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  handleFileChange,
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
      {
        selectedChat ? (
          <>
            {/* Header - Responsive */}
            <div className="border-b border-gray-800 p-3 sm:p-4 flex items-center bg-gray-850">
              {selectedChat.user.profilePic ? (
                <img
                  src={selectedChat.user.profilePic}
                  alt={selectedChat.user.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover mr-2 sm:mr-3 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium mr-2 sm:mr-3 flex-shrink-0 text-sm sm:text-base">
                  {selectedChat.user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-sm sm:text-base truncate">
                  {selectedChat.user.name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400">
                  {selectedChat.user.isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            {/* Messages Area with Custom Scrollbar - Responsive */}
            <div
              className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4 bg-gray-950 custom-scrollbar"
              onScroll={handleScroll}
            >
              {isLoadingMore && (
                <Loader2 />
              )}

              {/* Show Load More Prompt */}
              {hasMore && !isLoadingMore && messages.length > 0 && (
                <div className="flex justify-center py-2">
                  <button
                    onClick={onLoadMore}
                    className="text-blue-400 text-xs sm:text-sm hover:text-blue-300 transition-colors px-4 py-2 rounded-full hover:bg-gray-800"
                  >
                    ⬆️ Load older messages
                  </button>
                </div>
              )}

              {/* Messages - Responsive */}
              {messages.length === 0 && !isLoadingMore ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400 px-4">
                    <div className="text-3xl sm:text-4xl mb-2">💭</div>
                    <p className="text-sm sm:text-base">No messages yet</p>
                    <p className="text-xs sm:text-sm">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={`${message.id}-${message.timestamp}`}
                    className={`flex ${message.senderId === currentUserId ? "justify-end" : "justify-start"
                      } animate-fadeIn`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 py-2 sm:px-4 sm:py-2 rounded-2xl shadow-lg ${message.senderId === currentUserId
                        ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none"
                        : "bg-gradient-to-br from-gray-800 to-gray-850 text-gray-100 rounded-bl-none"
                        }`}
                    >
                      {message.messageType === "image" ? (
                        <img

                          src={message.fileUrl || ''}
                          alt="Shared image"
                          className="max-w-full rounded-lg mt-1 cursor-pointer hover:opacity-90 transition"
                        />
                      ) : message.messageType === "video" ? (
                        <video
                          src={message.fileUrl}
                          controls
                          className="max-w-full rounded-lg mt-1"
                        />
                      ) : message.messageType === "file" ? (
                        <a
                          href={message.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline break-all block mt-1 hover:text-blue-300"
                        >
                          📎 {message.fileName || "Download File"}
                        </a>
                      ) : (
                        <p className="whitespace-pre-wrap break-words text-sm sm:text-base">
                          {message.content}
                        </p>
                      )}
                      <p className={`text-[10px] sm:text-xs mt-1 ${message.senderId === currentUserId ? 'text-blue-200' : 'text-gray-400'
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

            {/* Input - Responsive */}
            <div className="p-2 sm:p-4 border-t border-gray-800 bg-gray-850 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={onKeyPress}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <Paperclip />
              </label>
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={onSendMessage}
                disabled={!newMessage.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-2 rounded-full hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all text-sm sm:text-base font-medium shadow-lg hover:shadow-blue-500/50 active:scale-95"
              >
                <span className="hidden sm:inline">Send</span>
                <span className="sm:hidden">📤</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 px-4">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl mb-2 sm:mb-4 animate-bounce">💬</div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Your Messages</h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Select a chat or search for users to start messaging
              </p>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Messages;