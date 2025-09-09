import { supabase, type Policy } from '@/lib/supabase'

export class PolicyService {
  /**
   * Get all policies from the database
   */
  static async getAllPolicies(): Promise<Policy[]> {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .order('upload_date', { ascending: false })

    if (error) {
      console.error('Error fetching policies:', error)
      throw new Error('Failed to fetch policies')
    }

    return data || []
  }

  /**
   * Get a single policy by ID
   */
  static async getPolicyById(id: string): Promise<Policy | null> {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching policy:', error)
      return null
    }

    return data
  }

  /**
   * Delete a policy from database and storage
   */
  static async deletePolicy(id: string): Promise<boolean> {
    try {
      // First get the policy to find the file path
      const policy = await this.getPolicyById(id)
      if (!policy) {
        throw new Error('Policy not found')
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
        throw new Error('Failed to delete policy from database')
      }

      return true
    } catch (error) {
      console.error('Error in deletePolicy:', error)
      return false
    }
  }

  /**
   * Upload a PDF file and extract text
   */
  static async uploadPDF(file: File): Promise<Policy> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload/pdf', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to upload PDF')
    }

    return result.policy
  }

  /**
   * Search policies by text content
   */
  static async searchPolicies(searchTerm: string): Promise<Policy[]> {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,extracted_text.ilike.%${searchTerm}%`)
      .order('upload_date', { ascending: false })

    if (error) {
      console.error('Error searching policies:', error)
      throw new Error('Failed to search policies')
    }

    return data || []
  }
}
