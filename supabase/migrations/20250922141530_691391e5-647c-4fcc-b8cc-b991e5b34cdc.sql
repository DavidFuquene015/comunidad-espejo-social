-- Crear tabla de libros para la API REST académica
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE,
  publication_year INTEGER,
  genre TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para la tabla books
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Política para permitir acceso público a la API (para fines académicos)
CREATE POLICY "Allow public access to books" 
ON public.books 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Trigger para actualizar timestamps
CREATE TRIGGER update_books_updated_at
BEFORE UPDATE ON public.books
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar algunos datos de ejemplo
INSERT INTO public.books (title, author, isbn, publication_year, genre, description) VALUES
('El Quijote', 'Miguel de Cervantes', '978-84-376-0494-7', 1605, 'Novela', 'La obra más famosa de la literatura española'),
('Cien años de soledad', 'Gabriel García Márquez', '978-84-376-0495-4', 1967, 'Realismo mágico', 'Una obra maestra del realismo mágico'),
('1984', 'George Orwell', '978-84-376-0496-1', 1949, 'Distopía', 'Una novela distópica sobre el totalitarismo');