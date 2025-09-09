import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .order('upload_date', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch policies' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      policies: data
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Policy ID is required' },
        { status: 400 }
      )
    }

    // First get the policy to find the file path
    const { data: policy, error: fetchError } = await supabase
      .from('policies')
      .select('file_path')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching policy:', fetchError)
      return NextResponse.json(
        { error: 'Policy not found' },
        { status: 404 }
      )
    }

    // Delete from storage if file_path exists
    if (policy.file_path) {
      const { error: storageError } = await supabase.storage
        .from('policy-documents')
        .remove([policy.file_path])

      if (storageError) {
        console.error('Error deleting file from storage:', storageError)
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('policies')
      .delete()
      .eq('id', id)

    if (dbError) {
      console.error('Error deleting policy from database:', dbError)
      return NextResponse.json(
        { error: 'Failed to delete policy' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Policy deleted successfully'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
