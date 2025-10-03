import React, { useState, useRef, useEffect } from 'react';
import { AudioButton } from '@/components/common/AudioButton';
import { useCelebration } from '@/hooks/useCelebration';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  Bot, 
  User, 
  Heart,
  Brain,
  Zap,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  hasAudio?: boolean;
  mood?: string;
}

const AICoach: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI wellness coach. I'm here to support your mind and body journey. How are you feeling today? 🌟",
      timestamp: new Date(),
      hasAudio: true
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { celebrations } = useCelebration();

  const suggestedPrompts = [
    "I'm feeling stressed about work",
    "Help me start a meditation practice",
    "I need motivation to workout",
    "How can I sleep better?",
    "I'm feeling anxious today"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response with proper timeout management
    const aiResponseTimeout = setTimeout(() => {
      const aiResponses = [
        "I understand you're going through a challenging time. Let's work together to find some strategies that can help you feel better. Have you tried any breathing exercises recently?",
        "That's a wonderful goal! Starting a meditation practice can be transformative. I recommend beginning with just 5 minutes a day. Would you like me to suggest some beginner-friendly sessions?",
        "I love your enthusiasm for staying active! Regular exercise is amazing for both physical and mental health. What type of workout interests you most?",
        "Sleep is so important for our wellbeing. There are several techniques we can explore - from bedtime routines to relaxation exercises. What's been keeping you awake?",
        "It's completely normal to feel anxious sometimes. You're taking a positive step by reaching out. Let's explore some calming techniques together. Have you tried the 4-7-8 breathing method?"
      ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date(),
        hasAudio: true
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // Trigger celebration for AI interaction with debounced approach
      const celebrationTimeout = setTimeout(() => {
        celebrations.milestoneReached('AI Coach Conversation');
      }, 1000);

      // Store timeout for cleanup if needed
      return celebrationTimeout;
    }, 2000);

    // Store timeout for potential cleanup
    return aiResponseTimeout;
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice input would be implemented here
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        setInputMessage("I've been feeling a bit overwhelmed lately...");
      }, 3000);
    }
  };

  const getMessageIcon = (type: string) => {
    return type === 'ai' ? Bot : User;
  };

  const getWellnessIcon = (index: number) => {
    const icons = [Heart, Brain, Zap, Sparkles, Heart];
    const Icon = icons[index % icons.length];
    return Icon;
  };

  return (
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center animate-pulse-slow">
            <Bot className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-poppins text-gradient-primary mb-4">
            AI Wellness Coach
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your personalized AI companion for mental health support and wellness guidance
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden mb-8">
          {/* Messages */}
          <div className="h-96 md:h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((message) => {
              const MessageIcon = getMessageIcon(message.type);
              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex items-start space-x-3',
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    message.type === 'ai' 
                      ? 'bg-gradient-to-r from-primary to-primary-glow' 
                      : 'bg-gradient-to-r from-secondary to-secondary/80'
                  )}>
                    <MessageIcon className="w-4 h-4 text-white" />
                  </div>
                  
                  <div className={cn(
                    'flex-1 max-w-xs md:max-w-md',
                    message.type === 'user' ? 'text-right' : ''
                  )}>
                    <div className={cn(
                      'rounded-xl p-3 shadow-sm',
                      message.type === 'ai'
                        ? 'bg-muted text-foreground rounded-tl-none'
                        : 'bg-gradient-to-r from-primary to-primary-glow text-primary-foreground rounded-tr-none'
                    )}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    
                    <div className={cn(
                      'flex items-center mt-1 space-x-2 text-xs text-muted-foreground',
                      message.type === 'user' ? 'justify-end' : ''
                    )}>
                      <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {message.hasAudio && (
                        <AudioButton variant="outline" size="sm" className="h-6 w-6 p-0">
                          <Volume2 className="w-3 h-3" />
                        </AudioButton>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted rounded-xl rounded-tl-none p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Share what's on your mind..."
                  className="w-full px-4 py-3 bg-muted rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <AudioButton
                variant={isListening ? 'peach' : 'outline'}
                size="sm"
                onClick={handleVoiceInput}
                className={cn(isListening && 'animate-pulse')}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </AudioButton>
              
              <AudioButton
                variant="primary"
                size="sm"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </AudioButton>
            </div>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gradient-primary">
            Quick Start Conversations
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestedPrompts.map((prompt, index) => {
              const Icon = getWellnessIcon(index);
              return (
                <div
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="bg-card rounded-xl p-4 border border-border card-hover cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary/20 to-primary-glow/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {prompt}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold mb-2">Mood Analysis</h4>
            <p className="text-sm text-muted-foreground">
              AI-powered sentiment analysis to understand your emotional state and provide personalized support.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="w-12 h-12 bg-gradient-to-r from-secondary to-secondary/80 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold mb-2">Smart Recommendations</h4>
            <p className="text-sm text-muted-foreground">
              Get personalized session recommendations based on your mood, progress, and wellness goals.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="w-12 h-12 bg-gradient-to-r from-peach to-accent rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold mb-2">24/7 Support</h4>
            <p className="text-sm text-muted-foreground">
              Always available for emotional support, wellness guidance, and mindfulness coaching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoach;