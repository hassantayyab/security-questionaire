'use client'

import { useState } from 'react'
import { Upload, FileSpreadsheet, Check, X, Edit3, Save, Download } from 'lucide-react'

interface Question {
  id: string
  questionText: string
  answer: string
  status: 'unapproved' | 'approved'
}

export function QuestionsAnswers() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingAnswer, setEditingAnswer] = useState('')

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only Excel files (.xlsx or .xls)')
      return
    }

    setIsUploading(true)
    
    // TODO: Implement actual Excel parsing and AI answer generation
    // For now, just simulate upload with dummy data
    setTimeout(() => {
      const dummyQuestions: Question[] = [
        {
          id: '1',
          questionText: 'Do you have a formal information security policy?',
          answer: 'Yes, we maintain a comprehensive information security policy that is reviewed annually and approved by senior management.',
          status: 'unapproved'
        },
        {
          id: '2',
          questionText: 'Is your data encrypted in transit and at rest?',
          answer: 'Yes, all data is encrypted using AES-256 encryption at rest and TLS 1.3 for data in transit.',
          status: 'unapproved'
        },
        {
          id: '3',
          questionText: 'Do you conduct regular security awareness training?',
          answer: 'Yes, we conduct mandatory security awareness training for all employees quarterly.',
          status: 'unapproved'
        }
      ]
      
      setQuestions(dummyQuestions)
      setIsUploading(false)
    }, 3000)
  }

  const startEditing = (question: Question) => {
    setEditingId(question.id)
    setEditingAnswer(question.answer)
  }

  const saveEdit = (id: string) => {
    setQuestions(prev => 
      prev.map(q => 
        q.id === id 
          ? { ...q, answer: editingAnswer }
          : q
      )
    )
    setEditingId(null)
    setEditingAnswer('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingAnswer('')
  }

  const approveAnswer = (id: string) => {
    setQuestions(prev => 
      prev.map(q => 
        q.id === id 
          ? { ...q, status: 'approved' as const }
          : q
      )
    )
  }

  const unapproveAnswer = (id: string) => {
    setQuestions(prev => 
      prev.map(q => 
        q.id === id 
          ? { ...q, status: 'unapproved' as const }
          : q
      )
    )
  }

  const exportApprovedAnswers = () => {
    const approvedQuestions = questions.filter(q => q.status === 'approved')
    if (approvedQuestions.length === 0) {
      alert('No approved answers to export')
      return
    }
    
    // TODO: Implement actual export functionality
    alert(`Exporting ${approvedQuestions.length} approved answers...`)
  }

  const approvedCount = questions.filter(q => q.status === 'approved').length

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upload Questionnaire</h2>
          {questions.length > 0 && (
            <button
              onClick={exportApprovedAnswers}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export ({approvedCount} approved)
            </button>
          )}
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="excel-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Drop Excel files here, or{' '}
                  <span className="text-blue-600 hover:text-blue-500">browse</span>
                </span>
                <input
                  id="excel-upload"
                  name="excel-upload"
                  type="file"
                  className="sr-only"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  disabled={isUploading}
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">Excel files only (.xlsx, .xls)</p>
            </div>
          </div>
        </div>

        {isUploading && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Processing questionnaire and generating AI answers...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Questions & Answers Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Questions & Answers</h3>
        </div>
        
        {questions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No questionnaire uploaded</h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload an Excel file with questions to generate AI-powered answers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
                    Answer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 break-words">
                        {question.questionText}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === question.id ? (
                        <textarea
                          value={editingAnswer}
                          onChange={(e) => setEditingAnswer(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                        />
                      ) : (
                        <div className="text-sm text-gray-900 break-words">
                          {question.answer}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        question.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {question.status === 'approved' ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Approved
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Unapproved
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {editingId === question.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(question.id)}
                              className="text-green-600 hover:text-green-900 flex items-center"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(question)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <Edit3 className="h-4 w-4 mr-1" />
                              Edit
                            </button>
                            {question.status === 'approved' ? (
                              <button
                                onClick={() => unapproveAnswer(question.id)}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                Unapprove
                              </button>
                            ) : (
                              <button
                                onClick={() => approveAnswer(question.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
