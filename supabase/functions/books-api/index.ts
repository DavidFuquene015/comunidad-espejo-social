import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

interface Book {
  id?: string;
  title: string;
  author: string;
  isbn?: string;
  publication_year?: number;
  genre?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

serve(async (req) => {
  console.log(`${req.method} ${req.url}`)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    // Parse path to get book ID if present
    const pathParts = path.split('/').filter(part => part !== '')
    const bookId = pathParts.length > 1 ? pathParts[1] : null

    switch (method) {
      case 'GET':
        if (bookId) {
          // GET /books/:id - Get specific book
          console.log(`Getting book with ID: ${bookId}`)
          const { data: book, error } = await supabaseClient
            .from('books')
            .select('*')
            .eq('id', bookId)
            .single()

          if (error) {
            console.error('Error fetching book:', error)
            return new Response(
              JSON.stringify({ error: 'Book not found' }),
              { 
                status: 404, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          return new Response(
            JSON.stringify({ success: true, data: book }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          // GET /books - Get all books
          console.log('Getting all books')
          const { data: books, error } = await supabaseClient
            .from('books')
            .select('*')
            .order('created_at', { ascending: false })

          if (error) {
            console.error('Error fetching books:', error)
            return new Response(
              JSON.stringify({ error: 'Failed to fetch books' }),
              { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          return new Response(
            JSON.stringify({ success: true, data: books, count: books?.length || 0 }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

      case 'POST':
        // POST /books - Create new book
        console.log('Creating new book')
        const bookData: Book = await req.json()
        
        // Validate required fields
        if (!bookData.title || !bookData.author) {
          return new Response(
            JSON.stringify({ error: 'Title and author are required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const { data: newBook, error: insertError } = await supabaseClient
          .from('books')
          .insert([bookData])
          .select()
          .single()

        if (insertError) {
          console.error('Error creating book:', insertError)
          return new Response(
            JSON.stringify({ error: 'Failed to create book' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data: newBook, message: 'Book created successfully' }),
          { 
            status: 201, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'PUT':
        if (!bookId) {
          return new Response(
            JSON.stringify({ error: 'Book ID is required for update' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // PUT /books/:id - Update existing book
        console.log(`Updating book with ID: ${bookId}`)
        const updateData: Book = await req.json()

        const { data: updatedBook, error: updateError } = await supabaseClient
          .from('books')
          .update(updateData)
          .eq('id', bookId)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating book:', updateError)
          return new Response(
            JSON.stringify({ error: 'Failed to update book or book not found' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data: updatedBook, message: 'Book updated successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'DELETE':
        if (!bookId) {
          return new Response(
            JSON.stringify({ error: 'Book ID is required for deletion' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // DELETE /books/:id - Delete book
        console.log(`Deleting book with ID: ${bookId}`)
        const { error: deleteError } = await supabaseClient
          .from('books')
          .delete()
          .eq('id', bookId)

        if (deleteError) {
          console.error('Error deleting book:', deleteError)
          return new Response(
            JSON.stringify({ error: 'Failed to delete book or book not found' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Book deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            status: 405, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})