import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Book, 
  FileText, 
  BookOpen, 
  GraduationCap, 
  ExternalLink,
  Filter,
  Globe,
  Users,
  University
} from 'lucide-react';
import MainNavigation from '@/components/navigation/MainNavigation';

type ResourceCategory = 'all' | 'books' | 'articles' | 'encyclopedias' | 'thesis';

interface LibraryResource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: ResourceCategory;
  tags: string[];
  language: string;
  isFree: boolean;
  isColombianFocus?: boolean;
  isSenaResource?: boolean;
}

const AcademicLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>('all');

  const libraryResources: LibraryResource[] = [
    {
      id: '1',
      title: 'Biblioteca Digital SENA',
      description: 'Repositorio institucional del SENA con más de 50,000 recursos académicos, incluidos libros técnicos, manuales de formación y documentos especializados en tecnología, administración y ciencias aplicadas.',
      url: 'https://repositorio.sena.edu.co/',
      category: 'books',
      tags: ['SENA', 'Técnico', 'Formación', 'Colombia'],
      language: 'Español',
      isFree: true,
      isColombianFocus: true,
      isSenaResource: true
    },
    {
      id: '2',
      title: 'Biblioteca Digital Colombiana',
      description: 'Portal de acceso a la producción intelectual colombiana con más de 200,000 documentos digitales de universidades e instituciones colombianas.',
      url: 'https://www.bdcol.gov.co/',
      category: 'articles',
      tags: ['Colombia', 'Investigación', 'Universidades'],
      language: 'Español',
      isFree: true,
      isColombianFocus: true
    },
    {
      id: '3',
      title: 'Repository SENA Sofia Plus',
      description: 'Plataforma educativa del SENA con cursos virtuales gratuitos, objetos de aprendizaje y recursos pedagógicos para formación técnica y tecnológica.',
      url: 'https://senasofiaplus.edu.co/sofia-oferta/',
      category: 'books',
      tags: ['SENA', 'Cursos', 'Virtual', 'Técnico'],
      language: 'Español',
      isFree: true,
      isColombianFocus: true,
      isSenaResource: true
    },
    {
      id: '4',
      title: 'Scielo Colombia',
      description: 'Biblioteca científica electrónica que incluye una colección seleccionada de revistas científicas colombianas de acceso abierto.',
      url: 'https://scielo.org.co/',
      category: 'articles',
      tags: ['Científico', 'Revistas', 'Investigación', 'Colombia'],
      language: 'Español/Inglés',
      isFree: true,
      isColombianFocus: true
    },
    {
      id: '5',
      title: 'Biblioteca Nacional de Colombia',
      description: 'Colección digital de la Biblioteca Nacional con patrimonio bibliográfico colombiano, incluye libros raros, manuscritos y publicaciones históricas.',
      url: 'https://bibliotecanacional.gov.co/es-co/colecciones/biblioteca-digital',
      category: 'books',
      tags: ['Patrimonio', 'Historia', 'Literatura', 'Colombia'],
      language: 'Español',
      isFree: true,
      isColombianFocus: true
    },
    {
      id: '6',
      title: 'Redalyc - Red de Revistas Científicas',
      description: 'Sistema de información científica con más de 1,300 revistas de Iberoamérica, incluye amplio contenido de universidades colombianas.',
      url: 'https://www.redalyc.org/',
      category: 'articles',
      tags: ['Revistas', 'Científico', 'Iberoamérica', 'Universidad'],
      language: 'Español/Inglés',
      isFree: true,
      isColombianFocus: true
    },
    {
      id: '7',
      title: 'DOAJ - Directory of Open Access Journals',
      description: 'Directorio de más de 17,000 revistas de acceso abierto de alta calidad, incluye publicaciones de universidades colombianas.',
      url: 'https://doaj.org/',
      category: 'articles',
      tags: ['Acceso Abierto', 'Revistas', 'Internacional'],
      language: 'Múltiples idiomas',
      isFree: true
    },
    {
      id: '8',
      title: 'Project Gutenberg',
      description: 'Biblioteca digital con más de 70,000 libros electrónicos gratuitos, incluye literatura clásica y textos académicos de dominio público.',
      url: 'https://www.gutenberg.org/',
      category: 'books',
      tags: ['Clásicos', 'Dominio Público', 'Literatura'],
      language: 'Múltiples idiomas',
      isFree: true
    },
    {
      id: '9',
      title: 'Repositorio Universidad Nacional de Colombia',
      description: 'Repositorio institucional de la UN con tesis de grado, trabajos de investigación y producción académica de la principal universidad pública de Colombia.',
      url: 'https://repositorio.unal.edu.co/',
      category: 'thesis',
      tags: ['Universidad Nacional', 'Tesis', 'Investigación', 'Colombia'],
      language: 'Español',
      isFree: true,
      isColombianFocus: true
    },
    {
      id: '10',
      title: 'World Digital Library - UNESCO',
      description: 'Biblioteca digital mundial con recursos multimedia de bibliotecas de todo el mundo, incluye contenido de Colombia.',
      url: 'https://www.wdl.org/',
      category: 'encyclopedias',
      tags: ['UNESCO', 'Multimedia', 'Mundial', 'Cultura'],
      language: 'Múltiples idiomas',
      isFree: true
    },
    {
      id: '11',
      title: 'Colciencias - Portal de Revistas Científicas',
      description: 'Portal de acceso a revistas científicas colombianas indexadas por Minciencias (antes Colciencias).',
      url: 'https://scienti.minciencias.gov.co/publindex/',
      category: 'articles',
      tags: ['Colciencias', 'Indexadas', 'Investigación', 'Colombia'],
      language: 'Español',
      isFree: true,
      isColombianFocus: true
    },
    {
      id: '12',
      title: 'Enciclopedia Británica Escolar',
      description: 'Versión educativa gratuita de la Enciclopedia Británica con contenido académico verificado y recursos multimedia.',
      url: 'https://escola.britannica.com.br/',
      category: 'encyclopedias',
      tags: ['Enciclopedia', 'Educación', 'Multimedia'],
      language: 'Múltiples idiomas',
      isFree: true
    }
  ];

  const categories = [
    { id: 'all', label: 'Todos los Recursos', icon: Globe },
    { id: 'books', label: 'Libros', icon: Book },
    { id: 'articles', label: 'Artículos Científicos', icon: FileText },
    { id: 'encyclopedias', label: 'Enciclopedias', icon: BookOpen },
    { id: 'thesis', label: 'Tesis y Disertaciones', icon: GraduationCap }
  ];

  const filteredResources = useMemo(() => {
    return libraryResources.filter(resource => {
      const matchesSearch = searchTerm === '' || 
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const getCategoryIcon = (category: ResourceCategory) => {
    switch (category) {
      case 'books': return <Book className="w-5 h-5" />;
      case 'articles': return <FileText className="w-5 h-5" />;
      case 'encyclopedias': return <BookOpen className="w-5 h-5" />;
      case 'thesis': return <GraduationCap className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-social-gradient">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Biblioteca Académica Central
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Tu puerta de acceso al conocimiento universitario gratuito - Recursos académicos de alta calidad con enfoque en Colombia y SENA
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar en todas las bibliotecas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/90 backdrop-blur-sm border-white/30"
              />
            </div>
            <Button 
              variant="secondary" 
              onClick={() => setSearchTerm('')}
              className="bg-white/90 hover:bg-white text-primary"
            >
              <Filter className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id as ResourceCategory)}
                  className={`${
                    selectedCategory === category.id 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-white/80 text-primary hover:bg-white border-white/50"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{filteredResources.length}</div>
              <div className="text-white/80">Recursos Disponibles</div>
            </CardContent>
          </Card>
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {filteredResources.filter(r => r.isColombianFocus).length}
              </div>
              <div className="text-white/80">Recursos Colombianos</div>
            </CardContent>
          </Card>
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {filteredResources.filter(r => r.isSenaResource).length}
              </div>
              <div className="text-white/80">Recursos SENA</div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="bg-white/95 backdrop-blur-sm border-white/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(resource.category)}
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {categories.find(c => c.id === resource.category)?.label}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    {resource.isColombianFocus && (
                      <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                        🇨🇴 Colombia
                      </Badge>
                    )}
                    {resource.isSenaResource && (
                      <Badge variant="outline" className="text-xs border-blue-500 text-blue-700">
                        <University className="w-3 h-3 mr-1" />
                        SENA
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2 text-foreground">{resource.title}</CardTitle>
                <CardDescription className="line-clamp-3 text-muted-foreground">
                  {resource.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {resource.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {resource.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{resource.tags.length - 3} más
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    📚 {resource.language}
                  </span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ✓ Gratuito
                  </Badge>
                </div>
                <Button 
                  asChild 
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center"
                  >
                    Acceder al Recurso
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-8 max-w-md mx-auto">
              <Search className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No se encontraron recursos
              </h3>
              <p className="text-white/80">
                Intenta con otros términos de búsqueda o cambia el filtro de categoría.
              </p>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <Card className="bg-white/10 backdrop-blur-sm border-white/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                ¿Por qué usar nuestra Biblioteca Académica?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white/90">
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium mb-1">Recursos Verificados</h4>
                  <p className="text-sm">Todos los recursos son gratuitos y de alta calidad académica</p>
                </div>
                <div className="text-center">
                  <Globe className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium mb-1">Enfoque Local</h4>
                  <p className="text-sm">Priorizamos contenido colombiano y recursos del SENA</p>
                </div>
                <div className="text-center">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium mb-1">Fácil Acceso</h4>
                  <p className="text-sm">Interfaz intuitiva con búsqueda y filtros avanzados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AcademicLibrary;