import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// User IDs from your example
const USER_1_ID = '68f1a2754f22e2cc06ee885c';
const USER_2_ID = '68e69c06e6b6d4f563b772b1';
const ROOM_ID = `room:${USER_2_ID}:${USER_1_ID}`;

// Sample message contents for realistic conversation
const messageTemplates = [
  "Hey, how are you?",
  "I'm doing great, thanks!",
  "What are you up to?",
  "Just working on some projects",
  "That sounds interesting!",
  "Yeah, it's pretty cool",
  "Want to grab coffee later?",
  "Sure, what time works for you?",
  "How about 3pm?",
  "Perfect!",
  "See you then",
  "👍",
  "Did you see the news today?",
  "No, what happened?",
  "Check it out, it's crazy",
  "Wow, that's unbelievable",
  "I know right",
  "Thanks for sharing",
  "No problem",
  "How's your family?",
  "They're doing well, thanks for asking",
  "That's good to hear",
  "How about yours?",
  "Everyone's great",
  "Glad to hear it",
  "What are your plans for the weekend?",
  "Not sure yet, maybe just relax",
  "Sounds nice",
  "You?",
  "Probably going hiking",
  "That sounds fun!",
  "Yeah, weather should be nice",
  "Be safe out there",
  "Will do, thanks",
  "Let me know how it goes",
  "Definitely will",
  "Talk to you later",
  "Bye!",
  "Hey, quick question",
  "Sure, what's up?",
  "Can you help me with something?",
  "Of course, what do you need?",
  "Thanks, really appreciate it",
  "Anytime!",
  "You're the best",
  "😊",
  "So what did you think?",
  "I thought it was great",
  "Me too!",
  "We should do this more often",
  "Absolutely",
  "Let's plan something soon",
  "Sounds good",
  "I'll check my calendar",
  "Cool, let me know",
  "Will do",
  "Have a good day!",
  "You too!",
  "Catch you later",
  "Later!",
  "😀",
  "lol",
  "haha",
  "that's hilarious",
  "I'm dying 😂",
  "Stop it 😅",
  "okay okay",
  "but seriously though",
  "yeah you're right",
  "exactly",
  "couldn't agree more",
  "well said",
  "thanks",
  "appreciate it",
  "no worries",
  "all good",
  "cool cool",
  "alright then",
  "sounds like a plan",
  "let's do it",
  "I'm in",
  "count me in too",
  "awesome",
  "great!",
  "perfect timing",
  "couldn't be better",
  "this is going to be fun",
  "can't wait",
  "me neither",
  "it's going to be epic",
  "for sure",
  "definitely",
  "100%",
  "yep",
  "yup",
  "uh huh",
  "got it",
  "understood",
  "makes sense",
  "I see",
  "oh I get it now",
  "that clears things up",
  "thanks for explaining",
  "adsfafds",
  "asdfaf",
  "dfghdfg",
  "asdfasdf"
];

// Function to get random message
function getRandomMessage(): string {
  return messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
}

// Function to generate messages
function generateMessages(count: number) {
  const messages = [];
  const startDate = new Date('2025-10-17T08:00:00.000Z');
  
  for (let i = 0; i < count; i++) {
    // Alternate between users for realistic conversation flow
    const isUser1Sender = i % 2 === 0;
    const senderId = isUser1Sender ? USER_1_ID : USER_2_ID;
    const receiverId = isUser1Sender ? USER_2_ID : USER_1_ID;
    
    // Increment timestamp by random amount (10 seconds to 5 minutes)
    const timeIncrement = Math.floor(Math.random() * 290000) + 10000; // 10s to 5min in milliseconds
    const timestamp = new Date(startDate.getTime() + (i * timeIncrement));
    
    const message = {
      roomId: ROOM_ID,
      senderId: senderId,
      receiverId: receiverId,
      content: getRandomMessage(),
      messageType: "text",
      timestamp: timestamp,
      status: "sent"
    };
    
    messages.push(message);
  }
  
  return messages;
}

// Main seeding function
async function seedMessages() {
  try {
    console.log('🌱 Starting message seeding...');
    
    // Optional: Clear existing messages for this room
    console.log('🗑️  Clearing existing messages for this room...');
    const deleteResult = await prisma.message.deleteMany({
      where: { roomId: ROOM_ID }
    });
    console.log(`✅ Deleted ${deleteResult.count} existing messages`);
    
    // Generate messages
    console.log('📝 Generating 500 messages...');
    const messages = generateMessages(500);
    
    // Insert messages in batches for better performance
    console.log('💾 Inserting messages into database...');
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      await prisma.message.createMany({
        data: batch
      });
      insertedCount += batch.length;
      console.log(`   Inserted ${insertedCount}/${messages.length} messages...`);
    }
    
    console.log(`✅ Successfully inserted ${insertedCount} messages!`);
    
    // Verify the insertion
    const count = await prisma.message.count({
      where: { roomId: ROOM_ID }
    });
    console.log(`📊 Total messages in room: ${count}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Prisma client disconnected');
  }
}

// Run the seeder
seedMessages()
  .then(() => {
    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });