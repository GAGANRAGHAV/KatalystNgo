"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, Send, Trash2, Clock, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Query {
  email: string;
  question: string;
  score?: number;
  timestamp?: string;
  auto_logged?: boolean;
}

export default function AdminPanel() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [sendingEmails, setSendingEmails] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const res = await axios.get("http://localhost:8000/logs");
      setQueries(res.data.logs || []);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (q: Query) => {
    const emailKey = `${q.email}-${q.question}`;
    setSendingEmails((prev) => new Set(prev).add(emailKey));

    const templateParams = {
      to_email: q.email,
      question: q.question,
      message: answers[q.email] || "",
    };

    try {
      await emailjs.send(
        "service_1f29ujr",
        "template_e55apke",
        templateParams,
        "NvGfC1ixca8hIHO_j"
      );

      // Clear answer input
      setAnswers((prev) => ({ ...prev, [q.email]: "" }));

      // Remove from frontend UI
      setQueries((prev) =>
        prev.filter(
          (item) => item.email !== q.email || item.question !== q.question
        )
      );

      // Delete from backend
      await axios.delete("http://localhost:8000/log", {
        params: { email: q.email, question: q.question },
      });
    } catch (error) {
      console.error("EmailJS Error:", error);
      alert("Failed to send email.");
    } finally {
      setSendingEmails((prev) => {
        const newSet = new Set(prev);
        newSet.delete(emailKey);
        return newSet;
      });
    }
  };

  const handleAnswerChange = (email: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [email]: value }));
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getEmailKey = (q: Query) => `${q.email}-${q.question}`;

  return (
    <div className="min-h-screen bg-gray-50">
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
              <span className="ml-4 text-gray-600 font-medium">
                Admin Dashboard
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-700 hover:text-gray-900">
                Back to Home
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900">
                Settings
              </a>
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                {queries.length} Pending
              </Badge>
              <Search className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Query Management Dashboard
            </h1>
            <p className="text-pink-100">
              Review and respond to user queries that couldn't be automatically
              answered
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-pink-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Queries
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {queries.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Pending Responses
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {queries.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Unique Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(queries.map((q) => q.email)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Queries List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
              <span className="ml-3 text-gray-600">Loading queries...</span>
            </div>
          ) : queries.length > 0 ? (
            queries.map((q, index) => {
              const emailKey = getEmailKey(q);
              const isSending = sendingEmails.has(emailKey);

              return (
                <Card key={index} className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 border-b">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="text-lg text-gray-900 flex items-center">
                          <User className="h-5 w-5 text-pink-600 mr-2" />
                          {q.email}
                        </CardTitle>
                        {q.timestamp && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(q.timestamp)}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {q.score && (
                          <Badge variant="outline" className="text-xs">
                            Score: {q.score.toFixed(3)}
                          </Badge>
                        )}
                        {q.auto_logged && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">
                            Auto-logged
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Question */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          User Question:
                        </label>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <p className="text-gray-800">{q.question}</p>
                        </div>
                      </div>

                      {/* Response Textarea */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Your Response:
                        </label>
                        <Textarea
                          placeholder="Type your detailed response here..."
                          value={answers[q.email] || ""}
                          onChange={(e) =>
                            handleAnswerChange(q.email, e.target.value)
                          }
                          className="min-h-[120px] resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={async () => {
                            // Optimistically remove from frontend UI
                            setQueries((prev) =>
                              prev.filter(
                                (item) =>
                                  item.email !== q.email ||
                                  item.question !== q.question
                              )
                            );

                            // Delete from backend
                            try {
                              await axios.delete("http://localhost:8000/log", {
                                params: {
                                  email: q.email,
                                  question: q.question,
                                },
                              });
                            } catch (error) {
                              console.error("Error deleting log:", error);
                              alert("Failed to delete the query from server.");
                              // Optionally, refetch queries or re-add dismissed query in case of failure
                              fetchQueries();
                            }
                          }}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Dismiss
                        </Button>

                        <Button
                          onClick={() => handleSend(q)}
                          disabled={!answers[q.email]?.trim() || isSending}
                          className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                        >
                          {isSending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send Response
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No pending queries
                </h3>
                <p className="text-gray-500">
                  All user queries have been addressed. Great job!
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer Info */}
        {queries.length > 0 && (
          <Alert className="mt-8 border-pink-200 bg-pink-50">
            <Mail className="h-4 w-4 text-pink-600" />
            <AlertDescription className="text-pink-800">
              <strong>Tip:</strong> Make sure to provide detailed and helpful
              responses. Users will receive your reply via email and may follow
              up with additional questions.
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
}
