"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, X, Send, Search } from "lucide-react"
import Image from "next/image"
import axios from "axios"

export default function KatalystHomepage() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [messages, setMessages] = useState<Array<{ type: "user" | "bot"; content: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendQuery = async () => {
    if (!query.trim()) return

    const userMessage = { type: "user" as const, content: query }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const res = await axios.post("http://localhost:8000/chat", {
        question: query,
      })

      const botMessage = { type: "bot" as const, content: res.data.answer }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const errorMessage = {
        type: "bot" as const,
        content: "Sorry, I'm having trouble connecting. Please try again later.",
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    setQuery("")
    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendQuery()
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold">
                <span className="text-red-500">K</span>
                <span className="text-orange-500">a</span>
                <span className="text-yellow-500">t</span>
                <span className="text-green-500">a</span>
                <span className="text-blue-500">l</span>
                <span className="text-purple-500">y</span>
                <span className="text-pink-500">s</span>
                <span className="text-red-500">t</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-gray-900">
                Who We Are
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900">
                What We Do
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900">
                Our Impact
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900">
                Our Supporters
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900">
                Get Involved
              </a>
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <Button className="bg-pink-600 hover:bg-pink-700 text-white">Donate</Button>
              <Search className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">We empower women to</h1>
                <div className="text-5xl lg:text-6xl font-bold text-pink-600 mt-2">break barriers</div>
              </div>

              <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                Katalyst India is an award-winning NGO that stands for the economic empowerment of women. Our initiative
                definitively prepares young women for leadership roles, thereby creating a wider talent pool for India
                Inc and helping bridge the gender divide. Beneficiaries of our initiatives—our 'Katalysts'—are capable,
                valuable talent, eager to shape their own future as well as the world's.
              </p>

              <Button className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 text-lg">Our Mission</Button>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="/katalyst-hero.png"
                  alt="Three women in colorful clothing representing empowerment"
                  width={600}
                  height={400}
                  className="rounded-lg"
                />
              </div>
              {/* Decorative brush strokes */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full opacity-20"></div>
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen ? (
          <Button
            onClick={() => setIsChatOpen(true)}
            className="bg-pink-600 hover:bg-pink-700 text-white rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        ) : (
          <Card className="w-90 h-120 shadow-2xl border-0 overflow-hidden ">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-semibold">Katalyst Assistant</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Image src="/mastercard-logo.png" alt="Mastercard" width={32} height={20} className="rounded" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsChatOpen(false)}
                  className="text-white hover:bg-white/20 p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <CardContent className="flex-1 p-0 h-64 overflow-y-auto bg-gray-50">
              <div className="p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">
                      Hi! I'm here to help you learn more about Katalyst's mission and programs.
                    </p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.type === "user" ? "bg-pink-600 text-white" : "bg-pink-50 text-gray-800 border"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 border px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>

            {/* Chat Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about our programs..."
                  className="flex-1 resize-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows={1}
                  disabled={isLoading}
                />
                <Button
                  onClick={sendQuery}
                  disabled={isLoading || !query.trim()}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-2"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-center mt-2">
                <span className="text-xs text-gray-500">Powered by</span>
                <Image src="/mastercard-logo.png" alt="Mastercard" width={40} height={24} className="ml-2" />
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
