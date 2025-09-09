"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, HelpCircle, Upload, Zap } from "lucide-react";
import KnowledgeBase from "@/components/KnowledgeBase";
import QuestionsAnswers from "@/components/QuestionsAnswers";

export default function Home() {
  const [activeTab, setActiveTab] = useState("knowledge-base");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Security Questionnaire Automation
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Upload your security policies and questionnaires to automatically generate 
          AI-powered answers using advanced document analysis.
        </p>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <CardHeader className="pb-3">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Upload Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Upload PDF policy documents for automated text extraction and analysis
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-3">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Import Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Upload Excel questionnaires and let AI generate accurate answers based on your policies
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-3">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">AI Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Review, edit, and approve AI-generated answers before exporting your completed questionnaire
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="knowledge-base" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="questions-answers" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Questions & Answers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge-base" className="space-y-6">
          <KnowledgeBase />
        </TabsContent>

        <TabsContent value="questions-answers" className="space-y-6">
          <QuestionsAnswers />
        </TabsContent>
      </Tabs>
    </div>
  );
}