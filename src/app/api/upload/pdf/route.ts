import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import pdfParse from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 10MB allowed.' },
        { status: 400 }
      )
    }

    // Convert file to buffer for processing
    const buffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(buffer)

    // Extract text from PDF
    let extractedText = ''
    try {
      const pdfData = await pdfParse(fileBuffer)
      extractedText = pdfData.text
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError)
      return NextResponse.json(
        { error: 'Failed to extract text from PDF. The file might be corrupted or password-protected.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${sanitizedName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('policy-documents')
      .upload(fileName, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      )
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('policy-documents')
      .getPublicUrl(fileName)

    // Save policy metadata to database
    const { data: policyData, error: dbError } = await supabase
      .from('policies')
      .insert({
        name: file.name.replace('.pdf', ''),
        filename: file.name,
        file_path: uploadData.path,
        file_url: urlData.publicUrl,
        extracted_text: extractedText,
        file_size: file.size,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Try to clean up uploaded file if database insert fails
      await supabase.storage
        .from('policy-documents')
        .remove([fileName])
      
      return NextResponse.json(
        { error: 'Failed to save policy to database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      policy: policyData,
      message: 'PDF uploaded and processed successfully'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
