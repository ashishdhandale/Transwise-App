
'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Bot, Loader2, Send, User, X } from 'lucide-react';
import { handleChat, type ChatState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const initialMessages: Message[] = [
    {
        role: 'assistant',
        content: "Hello! I'm the AtlasFlow AI assistant. How can I help you today? You can ask me about the app's features, how to perform certain tasks, or anything else you need help with."
    }
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      <span className="sr-only">Send</span>
    </Button>
  );
}

const initialState: ChatState = {
  success: false,
};

export function Chatbot() {
  const [state, formAction] = useActionState(handleChat, initialState);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.success && state.data) {
      setMessages(prev => [...prev, { role: 'assistant', content: state.data!.response }]);
    }
  }, [state]);

  const handleFormSubmit = (formData: FormData) => {
    const message = formData.get('message') as string;
    if (message) {
      setMessages(prev => [...prev, { role: 'user', content: message }]);
      formAction(formData);
      formRef.current?.reset();
    }
  };
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl h-[80vh] flex flex-col">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
            <Bot /> AtlasFlow AI Helper
        </DialogTitle>
        <DialogDescription>
          Ask me anything about how to use the application.
        </DialogDescription>
      </DialogHeader>
      
      <ScrollArea className="flex-grow border rounded-md p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="AI" />
                  <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-xs md:max-w-md rounded-lg p-3 text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.content}
              </div>
               {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <DialogFooter>
        <form
          ref={formRef}
          action={handleFormSubmit}
          className="flex w-full items-center gap-2"
        >
          <Input name="message" placeholder="Type your message..." autoComplete="off" />
          <SubmitButton />
        </form>
      </DialogFooter>
    </DialogContent>
  );
}
